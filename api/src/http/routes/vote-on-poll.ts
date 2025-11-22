import { FastifyInstance } from "fastify";
import { object, string } from "zod";
import { prisma } from "../../lib/prisma";
import { voting } from "../../utils/voting-pub-sub";
import { authenticate, AuthenticatedRequest } from "../middlewares/auth";
import { canUserVoteOnEventType } from "../../utils/event-access";

export async function voteOnPoll(app: FastifyInstance) {
  // Check if user has already voted on a poll
  app.get("/events/:eventId/polls/:pollId/my-vote", { onRequest: [authenticate] }, async (request, reply) => {
    const params = object({
      eventId: string().trim().uuid(),
      pollId: string().trim().uuid(),
    });

    const { pollId } = params.parse(request.params);

    const user = (request as AuthenticatedRequest).user;
    if (!user) {
      return reply.status(401).send({ message: "Authentication required" });
    }

    try {
      const userVote = await prisma.vote.findUnique({
        where: {
          personID_pollId: {
            personID: user.personID,
            pollId,
          },
        },
      });

      if (userVote) {
        return reply.status(200).send({ pollOptionId: userVote.pollOptionId });
      }

      return reply.status(204).send();
    } catch (error) {
      console.error("Error checking user vote:", error);
      return reply.status(400).send({ message: "Failed to check vote status" });
    }
  });

  app.post("/events/:eventId/polls/:pollId/votes", { onRequest: [authenticate] }, async (request, reply) => {
    const voteOnPollBody = object({
      pollOptionId: string().trim().uuid(),
    });

    const voteOnPollParams = object({
      eventId: string().trim().uuid(),
      pollId: string().trim().uuid(),
    });

    const { eventId, pollId } = voteOnPollParams.parse(request.params);
    const { pollOptionId } = voteOnPollBody.parse(request.body);

    const user = (request as AuthenticatedRequest).user;
    if (!user) {
      return reply.status(401).send({ message: "Authentication required" });
    }

    const personID = user.personID;

    // Get the poll and its associated event
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { event: true },
    });

    if (!poll) {
      return reply.status(404).send({ message: "Poll not found" });
    }

    // Check if user has access to vote on this event type
    if (poll.event) {
      const hasAccess = await canUserVoteOnEventType(personID, poll.event.type);
      if (!hasAccess) {
        return reply.status(403).send({
          message: `You don't have permission to vote on ${poll.event.type} events`,
        });
      }
    }

    // Check if user already voted on this poll
    const userPreviousVoteOnPoll = await prisma.vote.findUnique({
      where: {
        personID_pollId: {
          personID,
          pollId,
        },
      },
    });

    if (userPreviousVoteOnPoll) {
      if (userPreviousVoteOnPoll.pollOptionId === pollOptionId) {
        return reply
          .status(400)
          .send({ message: "You have already voted on this poll!" });
      }

      await prisma.vote.delete({
        where: {
          id: userPreviousVoteOnPoll.id,
        },
      });

      // Get updated vote count for previous option
      const previousVoteCount = await prisma.vote.count({
        where: {
          pollOptionId: userPreviousVoteOnPoll.pollOptionId,
        },
      });

      voting.publish(pollId, {
        pollOptionId: userPreviousVoteOnPoll.pollOptionId,
        votes: previousVoteCount,
      });
    }

    // Create new vote
    await prisma.vote.create({
      data: {
        sessionId: request.id,
        personID,
        pollId,
        pollOptionId,
      },
    });

    // Get updated vote count for new option
    const newVoteCount = await prisma.vote.count({
      where: {
        pollOptionId,
      },
    });

    voting.publish(pollId, {
      pollOptionId,
      votes: newVoteCount,
    });

    return reply.status(201).send();
  });
}
