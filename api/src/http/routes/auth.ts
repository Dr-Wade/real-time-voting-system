import { FastifyInstance } from "fastify";
import { object, string, array } from "zod";
import { prisma } from "../../lib/prisma";
import { generatePasswordHash, generateToken, verifyToken } from "../../utils/auth";
import { authenticate, requireAdmin, AuthenticatedRequest } from "../middlewares/auth";
import { grantUserEventTypeAccess } from "../../utils/event-access";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/login", async (request, reply) => {
    const loginSchema = object({
      personID: string().trim().min(1),
      password: string().trim().min(1),
    });

    try {
      const { personID, password } = loginSchema.parse(request.body);

      // Verify password
      const expectedHash = generatePasswordHash(personID);
      console.log(expectedHash);
      if (password !== expectedHash) {
        return reply.status(401).send({ message: "Invalid credentials" });
      }

      // Get or create user
      let user = await prisma.user.findUnique({
        where: { personID },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            personID,
            name: personID,
          },
        });
      }

      // Generate token
      const token = generateToken(personID);

      return reply.status(200).send({
        token,
        user: {
          personID: user.personID,
          name: user.name,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return reply.status(400).send({ message: "Invalid request" });
    }
  });

  app.post("/auth/register", async (request, reply) => {
    const registerSchema = object({
      personID: string().trim().min(1),
      name: string().trim().min(1),
    });

    try {
      const { personID, name } = registerSchema.parse(request.body);

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { personID },
      });

      if (existingUser) {
        return reply.status(400).send({ message: "User already exists" });
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          personID,
          name,
        },
      });

      // Generate token
      const token = generateToken(personID);

      return reply.status(201).send({
        token,
        user: {
          personID: user.personID,
          name: user.name,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      return reply.status(400).send({ message: "Invalid request" });
    }
  });

  app.get("/auth/me", async (request, reply) => {
    const token = request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return reply.status(401).send({ message: "Missing authorization token" });
    }

    try {
      // Decode the token to get personID
      const payload = verifyToken(token);
      if (!payload) {
        return reply.status(401).send({ message: "Invalid token" });
      }

      const user = await prisma.user.findUnique({
        where: { personID: payload.personID },
      });

      if (!user) {
        return reply.status(404).send({ message: "User not found" });
      }

      return reply.status(200).send({
        user: {
          personID: user.personID,
          name: user.name,
          allowedEventTypes: user.allowedEventTypes,
        },
      });
    } catch (error) {
      console.error("Get user error:", error);
      return reply.status(400).send({ message: "Invalid request" });
    }
  });

  // Admin endpoint: Grant user access to event types
  app.patch(
    "/auth/users/:personID/event-types",
    { onRequest: [authenticate, requireAdmin] },
    async (request, reply) => {
      const paramsSchema = object({
        personID: string().trim().min(1),
      });

      const bodySchema = object({
        allowedEventTypes: array(string().trim()),
      });

      try {
        const { personID } = paramsSchema.parse(request.params);
        const { allowedEventTypes } = bodySchema.parse(request.body);

        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { personID },
        });

        if (!user) {
          return reply.status(404).send({ message: "User not found" });
        }

        // Grant access
        await grantUserEventTypeAccess(personID, allowedEventTypes);

        const updatedUser = await prisma.user.findUnique({
          where: { personID },
        });

        return reply.status(200).send({
          message: "User event type access updated",
          user: {
            personID: updatedUser!.personID,
            name: updatedUser!.name,
            allowedEventTypes: updatedUser!.allowedEventTypes,
          },
        });
      } catch (error) {
        console.error("Update user event types error:", error);
        return reply.status(400).send({ message: "Invalid request" });
      }
    }
  );
}
