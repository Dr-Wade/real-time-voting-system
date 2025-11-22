import { FastifyInstance } from "fastify";
import { object, string } from "zod";
import { voting } from "../../utils/voting-pub-sub";

export async function pollResults(app: FastifyInstance) {
  app.get(
    "/polls/:pollId/results",
    { websocket: true },
    (socket: any, request) => {
      const getPollParams = object({
        pollId: string().trim().uuid(),
      });

      try {
        const { pollId } = getPollParams.parse(request.params);

        const subscriber = (message: any) => {
          if (socket && socket.readyState === 1) {
            socket.send(JSON.stringify(message));
          }
        };

        voting.subscribe(pollId, subscriber);

        socket.on("close", () => {
          voting.unsubscribe(pollId, subscriber);
        });
      } catch (error) {
        console.error("Error in poll results WebSocket:", error);
        socket.close();
      }
    }
  );
}
