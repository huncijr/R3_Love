import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { user } from "../db/schema";
import { AppError } from "./ErrorHandler";

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

export async function getUserIdFromContext(
  token: string | undefined,
  allowUnverified = false,
): Promise<string> {
  if (!token) {
    throw new Error("Unathorized");
  }
  const decoded = verifyToken(token);

  if (!allowUnverified) {
    const [foundUser] = await db
      .select({ email: user.email, emailVerified: user.emailVerified })
      .from(user)
      .where(eq(user.id, decoded.userId));
    if (foundUser?.email && !foundUser.emailVerified) {
      throw new AppError(
        "Email not verified. Please verify your email first.",
        403,
      );
    }
  }
  return decoded.userId;
}
