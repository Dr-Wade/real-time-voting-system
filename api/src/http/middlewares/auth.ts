import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "../../utils/auth";

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    personID: string;
  };
}

export async function registerAuthMiddleware(app: FastifyInstance) {
  app.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      const token = request.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return reply.status(401).send({ message: "Missing authorization token" });
      }

      const payload = verifyToken(token);
      if (!payload) {
        return reply.status(401).send({ message: "Invalid token" });
      }

      (request as AuthenticatedRequest).user = payload;
    } catch (error) {
      return reply.status(401).send({ message: "Authentication failed" });
    }
  });
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return reply.status(401).send({ message: "Missing authorization token" });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return reply.status(401).send({ message: "Invalid token" });
    }

    (request as AuthenticatedRequest).user = payload;
  } catch (error) {
    return reply.status(401).send({ message: "Authentication failed" });
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const adminPersonID = process.env.ADMIN_PERSON_ID;

  if (!adminPersonID) {
    return reply.status(500).send({ message: "Admin not configured" });
  }

  const user = (request as AuthenticatedRequest).user;
  if (!user || user.personID !== adminPersonID) {
    return reply.status(403).send({ message: "Admin access required" });
  }
}

declare global {
  namespace FastifyInstance {
    function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  }
}
