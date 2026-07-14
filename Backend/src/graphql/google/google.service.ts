import { AppError } from "../../middleware/ErrorHandler";
import dotenv from "dotenv";

dotenv.config();

export interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export async function verifyGoogleCredential(
  credentials: string,
): Promise<GoogleUser> {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${credentials}`,
  );

  if (!response.ok) {
    throw new AppError("Invalid Goofle credential", 401);
  }

  const data = await response.json();

  if (!data.sub || !data.email) {
    throw new AppError("Invalid Google token payload", 401);
  }

  const clientId = process.env.GOOGLE_SECRET_ID;
  if (clientId && data.aud !== clientId) {
    throw new AppError("Google token audience mismatch", 401);
  }

  return {
    sub: data.sub,
    email: data.email,
    name: data.name || data.email.split("@")[0],
    picture: data.picture,
  };
}
