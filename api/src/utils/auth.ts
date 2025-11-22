import { md5 } from "js-md5";
import crypto from "crypto";

const AUTH_SECRET = process.env.AUTH_SECRET || "default-secret-change-in-production";

export function generatePasswordHash(personID: string): string {
  const hash = crypto.createHash('md5').update(personID + AUTH_SECRET).digest('hex');
  return hash;
}

export function verifyPassword(personID: string, password: string): boolean {
  const expectedHash = generatePasswordHash(personID);
  return crypto.timingSafeEqual(
    Buffer.from(password),
    Buffer.from(expectedHash)
  );
}

export function generateToken(personID: string): string {
  const payload = {
    personID,
    iat: Math.floor(Date.now() / 1000),
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function verifyToken(token: string): { personID: string } | null {
  try {
    console.log(token)
    const payload = JSON.parse(Buffer.from(token, "base64").toString());
    
    return { personID: payload.personID };
  } catch {
    return null;
  }
}
