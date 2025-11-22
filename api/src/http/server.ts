import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import fastify from "fastify";
import staticPlugin from "@fastify/static";
import path from "path";
import { config } from "../config/index.schema";
import { createPoll } from "./routes/create-poll";
import { getPoll } from "./routes/get-poll";
import { voteOnPoll } from "./routes/vote-on-poll";
import { events } from "./routes/events";
import { authRoutes } from "./routes/auth";
import { pollResults } from "./websocket/poll-results";
import { adminUpdates } from "./websocket/admin-updates";
import { registerEventsUpdatesWebSocket } from "./websocket/events-updates";
import { registerAuthMiddleware } from "./middlewares/auth";

const { PORT, COOKIE_SECRET } = config;

async function start() {
  const app = fastify();

  app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.register(cookie, {
    secret: COOKIE_SECRET,
    hook: "onRequest",
  });

  app.register(websocket);

  await registerAuthMiddleware(app);

  // Register API routes with /api prefix
  app.register(authRoutes, { prefix: "/api" });
  app.register(createPoll, { prefix: "/api" });
  app.register(getPoll, { prefix: "/api" });
  app.register(voteOnPoll, { prefix: "/api" });
  app.register(events, { prefix: "/api" });

  // WebSocket routes (no prefix needed)
  app.register(pollResults);
  app.register(adminUpdates);
  app.register(registerEventsUpdatesWebSocket);

  // Serve static files (admin dashboard)
  const publicDir = path.join(__dirname, "../../public");
  app.register(staticPlugin, {
    root: publicDir,
    prefix: "/",
  });

  // SPA fallback: serve index.html for all non-API routes
  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith("/api") || request.url.startsWith("/ws")) {
      reply.status(404).send({ message: "Not found" });
    } else {
      reply.type("text/html").sendFile("index.html");
    }
  });

  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`HTTP server running on port ${PORT}`);
}

start().catch(console.error);
