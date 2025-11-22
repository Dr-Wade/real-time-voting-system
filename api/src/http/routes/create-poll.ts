import { FastifyInstance } from "fastify";
import { array, object, string } from "zod";
import { prisma } from "../../lib/prisma";
import { authenticate, requireAdmin } from "../middlewares/auth";

export async function createPoll(app: FastifyInstance) {

  app.post("/events/:eventId/polls", { onRequest: [authenticate, requireAdmin] }, async (request, reply) => {

    const createPollParams = object({
      eventId: string().trim().uuid(),
    });

    const createPollBody = object({
      id: string().trim().uuid().optional(),
      title: string().trim(),
      options: array(string().trim()),
    });

    const { eventId } = createPollParams.parse(request.params);
    const { id, title, options } = createPollBody.parse(request.body);

    if (id) {
      const existingPoll = await prisma.poll.findUnique({
        where: { id },
      });

      if (!existingPoll) {
        return reply.status(404).send({ message: "Poll not found!" });
      }

      await prisma.poll.update({
        where: { id },
        data: {
          title,
          options: {
            deleteMany: {},
            createMany: {
              data: options.map((option) => ({
                title: option,
              })),
            },
          },
        },
      });

      return reply.status(200).send({ pollId: id });
    }

    const poll = await prisma.poll.create({
      data: {
        title,
        eventId: eventId || undefined,
        options: {
          createMany: {
            data: options.map((option) => {
              return {
                title: option,
              };
            }),
          },
        },
      },
    });

    return reply.status(201).send({ pollId: poll.id });
  });
}