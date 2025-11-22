import { FastifyInstance } from "fastify";
import { object, string } from "zod";
import { admin } from "../../utils/admin-pub-sub";

export async function adminUpdates(app: FastifyInstance) {
  app.get(
    "/admin/events/:eventId/updates",
    { websocket: true },
    (connection: any, request) => {
      const getEventParams = object({
        eventId: string().trim().uuid(),
      });

      try {
        const { eventId } = getEventParams.parse(request.params);
        const socket = connection.socket || connection;

        const subscriber = (message: any) => {
          if (socket && socket.readyState === 1) {
            socket.send(JSON.stringify(message));
          }
        };

        admin.subscribe(eventId, subscriber);

        socket.on("close", () => {
          admin.unsubscribe(eventId, subscriber);
        });
      } catch (error) {
        console.error("Error in admin updates WebSocket:", error);
      }
    }
  );
}
