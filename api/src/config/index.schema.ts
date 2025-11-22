import "dotenv/config";
import { coerce, object, string } from "zod";

const configVars = process.env;

const configSchema = object({
  PORT: coerce.number().default(3333),
  COOKIE_SECRET: string({
    error: "Cookie secret is mandatory!",
  }).trim(),
  POSTGRES_USER: string({
    error: "PostgreSQL user is mandatory!",
  }).trim(),
  POSTGRES_PASSWORD: string({
    error: "PostgreSQL password is mandatory!",
  }).trim(),
  POSTGRES_DB: string({
    error: "PostgreSQL database name is mandatory!",
  }).trim(),
  POSTGRES_PORT: coerce.number().default(55432),
  REDIS_PORT: coerce.number().default(6379),
  DATABASE_URL: string({
    error: "Prisma database url reference is mandatory!",
  }).trim(),
});

export const config = configSchema.parse(configVars);
