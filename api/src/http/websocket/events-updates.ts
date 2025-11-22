import { FastifyInstance } from "fastify";
import { events } from "../../utils/events-pub-sub";

export const registerEventsUpdatesWebSocket = async (app: FastifyInstance) => {
    const handler = (socket: any, request: any) => {
        console.log("Client connected to events updates WebSocket");

        const subscriber = (message: any) => {
            try {
                socket.send(JSON.stringify(message));
            } catch (error) {
                console.error("Failed to send events update:", error);
            }
        };

        events.subscribe(subscriber);

        socket.on("close", () => {
            console.log("Client disconnected from events updates");
            events.unsubscribe(subscriber);
        });

        socket.on("error", (error: Error) => {
            console.error("Events updates WebSocket error:", error);
            events.unsubscribe(subscriber);
        });
    };

    app.get("/events/updates", { websocket: true }, handler);
};
