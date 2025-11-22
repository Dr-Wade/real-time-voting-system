import { FastifyInstance } from "fastify";
import { object, string } from "zod";
import { prisma } from "../../lib/prisma";
import { authenticate, AuthenticatedRequest } from "../middlewares/auth";

export async function getPoll(app: FastifyInstance) {

  app.get("/events/:eventId/polls", { onRequest: [authenticate] }, async (request, reply) => {
    const getEventPollsParams = object({
      eventId: string().trim().uuid(),
    });

    const { eventId } = getEventPollsParams.parse(request.params);

    const polls = await prisma.poll.findMany({
      where: { eventId },
      include: {
        options: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Enrich polls with vote scores from database
    const enrichedPolls = await Promise.all(
      polls.map(async (poll: any) => {
        const voteCounts = await prisma.vote.groupBy({
          by: ["pollOptionId"],
          where: { pollId: poll.id },
          _count: {
            id: true,
          },
        });

        const votes = voteCounts.reduce((obj: any, vc: any) => {
          obj[vc.pollOptionId] = vc._count.id;
          return obj;
        }, {} as Record<string, number>);

        return {
          ...poll,
          options: poll.options.map((option: any) => ({
            ...option,
            score: votes[option.id] || 0,
          })),
        };
      })
    );

    return reply.send({ polls: enrichedPolls });
  });


  app.get("/events/:eventId/polls/:pollId", { onRequest: [authenticate] }, async (request, reply) => {
    const getPollParams = object({
      eventId: string().trim().uuid(),
      pollId: string().trim().uuid(),
    });

    const { eventId, pollId } = getPollParams.parse(request.params);

    const poll = await prisma.poll.findUnique({
      where: {
        id: pollId,
      },
      include: {
        options: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!poll) {
      return reply.status(400).send({ message: "Poll not found!" });
    }

    // Get vote counts from database
    const voteCounts = await prisma.vote.groupBy({
      by: ["pollOptionId"],
      where: { pollId },
      _count: {
        id: true,
      },
    });

    const votes = voteCounts.reduce((obj: any, vc: any) => {
      obj[vc.pollOptionId] = vc._count.id;
      return obj;
    }, {} as Record<string, number>);

    return reply.send({
      poll: {
        id: poll.id,
        title: poll.title,
        options: poll.options.map((option: any) => {
          return {
            id: option.id,
            title: option.title,
            score: votes[option.id] || 0,
          };
        }),
      },
    });
  });
}
