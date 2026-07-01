import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing!");
}

// Generates a JWT token valid for 30 days
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
}

// Verifies and decodes a JWT token, returning the embedded userId
export function verifyToken(token: string): { userId: string } {
  // console.log(token);
  const decoded = jwt.verify(token, JWT_SECRET) as unknown;
  return decoded as { userId: string };
}
