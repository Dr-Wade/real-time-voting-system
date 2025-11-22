import { FastifyInstance } from "fastify";
import { array, object, string } from "zod";
import { prisma } from "../../lib/prisma";
import { admin } from "../../utils/admin-pub-sub";
import { events as eventsPubSub } from "../../utils/events-pub-sub";
import { AuthenticatedRequest, authenticate, requireAdmin } from "../middlewares/auth";

export async function events(app: FastifyInstance) {
  // GET all events (authenticated, filtered by user's allowedEventTypes, or all for admin)
  app.get("/events", { onRequest: [authenticate] }, async (request, reply) => {
    try {
      const user = (request as AuthenticatedRequest).user;
      if (!user) {
        return reply.status(401).send({ message: "Authentication required" });
      }

      const adminPersonID = process.env.ADMIN_PERSON_ID;
      const isAdmin = adminPersonID && user.personID === adminPersonID;

      // If user is admin, show all events
      // Otherwise, filter by user's allowedEventTypes
      let whereClause: any = {};

      if (!isAdmin) {
        // Get user's allowed event types
        const dbUser = await prisma.user.findUnique({
          where: { personID: user.personID },
        });

        if (!dbUser) {
          return reply.status(404).send({ message: "User not found" });
        }

        whereClause = { type: { in: dbUser.allowedEventTypes } };
      }

      const allEvents = await prisma.event.findMany({
        where: whereClause,
        include: {
          activePoll: {
            select: {
              id: true,
              title: true,
            },
          },
          polls: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return reply.send({ events: allEvents });
    } catch (error) {
      console.error("Error fetching events:", error);
      return reply.status(500).send({ message: "Failed to fetch events" });
    }
  });

  // UPSERT event (create or update) - admin only
  app.post("/events", { onRequest: [authenticate, requireAdmin] }, async (request, reply) => {
    const upsertEventBody = object({
      id: string().trim().uuid().optional(),
      name: string().trim(),
      type: string().trim(),
      activePollId: string().trim().uuid().optional().nullable(),
      pollIds: array(string().trim().uuid()).optional(),
    });

    try {
      const { id, name, type, activePollId, pollIds } = upsertEventBody.parse(request.body);

      if (id) {
        // Update existing event
        const existingEvent = await prisma.event.findUnique({
          where: { id },
        });

        if (!existingEvent) {
          return reply.status(404).send({ message: "Event not found!" });
        }

        const updatedEvent = await prisma.event.update({
          where: { id },
          data: {
            name,
            type,
            activePollId: activePollId || null,
            polls: pollIds
              ? {
                  set: pollIds.map((pollId) => ({ id: pollId })),
                }
              : undefined,
          },
          include: {
            activePoll: {
              select: {
                id: true,
                title: true,
              },
            },
            polls: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        });

        return reply.status(200).send({ eventId: updatedEvent.id, event: updatedEvent });
      }

      // Create new event
      const newEvent = await prisma.event.create({
        data: {
          name,
          type,
          activePollId: activePollId || null,
          polls: pollIds
            ? {
                connect: pollIds.map((pollId) => ({ id: pollId })),
              }
            : undefined,
        },
        include: {
          activePoll: {
            select: {
              id: true,
              title: true,
            },
          },
          polls: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      return reply.status(201).send({ eventId: newEvent.id, event: newEvent });
    } catch (error) {
      console.error("Error upserting event:", error);
      return reply.status(400).send({ message: "Failed to upsert event" });
    }
  });

  // GET single event (authenticated, filtered by user's allowedEventTypes)
  app.get("/events/:eventId", { onRequest: [authenticate] }, async (request, reply) => {
    const getEventParams = object({
      eventId: string().trim().uuid(),
    });

    try {
      const user = (request as AuthenticatedRequest).user;
      if (!user) {
        return reply.status(401).send({ message: "Authentication required" });
      }

      const { eventId } = getEventParams.parse(request.params);

      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          activePoll: {
            select: {
              id: true,
              title: true,
              options: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          polls: {
            select: {
              id: true,
              title: true,
              options: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

      if (!event) {
        return reply.status(404).send({ message: "Event not found!" });
      }

      // Check if user has access to this event type
      const dbUser = await prisma.user.findUnique({
        where: { personID: user.personID },
      });

      if (dbUser && dbUser.allowedEventTypes.length > 0 && !dbUser.allowedEventTypes.includes(event.type)) {
        return reply.status(403).send({ message: "You don't have access to this event type" });
      }

      return reply.send({ event });
    } catch (error) {
      console.error("Error fetching event:", error);
      return reply.status(400).send({ message: "Failed to fetch event" });
    }
  });

  // PATCH event (partial update) - admin only
  app.patch("/events/:eventId", { onRequest: [authenticate, requireAdmin] }, async (request, reply) => {
    const patchEventParams = object({
      eventId: string().trim().uuid(),
    });

    try {
      const { eventId } = patchEventParams.parse(request.params);
      const body = request.body as Record<string, unknown>;

      const existingEvent = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!existingEvent) {
        return reply.status(404).send({ message: "Event not found!" });
      }

      const data: any = {};

      if (typeof body.active === "boolean") {
        data.active = body.active;
      }

      if ("activePollId" in body) {
        data.activePollId = body.activePollId === null ? null : string().trim().uuid().parse(body.activePollId as string);
      }

      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data,
        include: {
          activePoll: {
            select: {
              id: true,
              title: true,
            },
          },
          polls: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      // Publish real-time update
      let messageType: "event_updated" | "event_activated" | "event_deactivated" | "poll_activated" = "event_updated";
      if (typeof data.active === "boolean") {
        messageType = data.active ? "event_activated" : "event_deactivated";
      } else if ("activePollId" in data) {
        messageType = "poll_activated";
      }

      admin.publish(eventId, {
        type: messageType,
        eventId,
        data: {
          event: updatedEvent,
        },
      });

      // Also publish to events list if event was activated/deactivated
      if (typeof data.active === "boolean") {
        eventsPubSub.publish({
          type: messageType as "event_activated" | "event_deactivated",
          data: {
            event: updatedEvent,
          },
        });
      }

      return reply.status(200).send({ event: updatedEvent });
    } catch (error) {
      console.error("Error patching event:", error);
      return reply.status(400).send({ message: "Failed to update event" });
    }
  });

  // DELETE event - admin only
  app.delete("/events/:eventId", { onRequest: [authenticate, requireAdmin] }, async (request, reply) => {
    const deleteEventParams = object({
      eventId: string().trim().uuid(),
    });

    try {
      const { eventId } = deleteEventParams.parse(request.params);

      const existingEvent = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!existingEvent) {
        return reply.status(404).send({ message: "Event not found!" });
      }

      await prisma.event.delete({
        where: { id: eventId },
      });

      return reply.status(200).send({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      return reply.status(400).send({ message: "Failed to delete event" });
    }
  });
}
