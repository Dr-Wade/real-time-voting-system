import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import fastify from "fastify";
import { config } from "../config/index.schema";
import { createPoll } from "./routes/create-poll";
import { getPoll } from "./routes/get-poll";
import { voteOnPoll } from "./routes/vote-on-poll";
import { events } from "./routes/events";
import { authRoutes } from "./routes/auth";
import { pollResults } from "./websocket/poll-results";
import { adminUpdates } from "./websocket/admin-updates";
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

  app.register(authRoutes);
  app.register(createPoll);
  app.register(getPoll);
  app.register(voteOnPoll);
  app.register(events);

  app.register(pollResults);
  app.register(adminUpdates);

  await app.listen({ port: PORT });
  console.log("HTTP server running!");
}

start().catch(console.error);
