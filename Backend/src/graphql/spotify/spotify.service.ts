import dotenv from "dotenv";
import { errorHandler } from "../../middleware/ErrorHandler";
import { db } from "../../db";
import { user } from "../../db/schema";
import { eq } from "drizzle-orm";

dotenv.config();

export interface SpotifySong {
  title: string;
  artist: string;
  url: string;
  imageUrl: string;
}

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

function getSpotifyCredentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing Spotify environment variables");
  }
  return { clientId, clientSecret, redirectUri };
}

export function getSpotifyAuthUrl(): string {
  const { clientId, redirectUri } = getSpotifyCredentials();
  const scope = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-modify-playback-state",
    "user-read-playback-state",
  ].join(" ");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope,
    redirect_uri: redirectUri,
    show_dialog: "true",
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeSpotifyCode(
  code: string,
): Promise<SpotifyTokens> {
  const { clientId, clientSecret, redirectUri } = getSpotifyCredentials();

  const response = await fetch("https://accounts.spotify.com/api/token", {
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`Spotify token exchange error: ${response.status}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is missing");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Spotify token error: ${response.status}`);
  }
  const data = await response.json();
  return data.access_token;
}

export async function getRomanticSongs(): Promise<SpotifySong[]> {
  const token = await getAccessToken();
  console.log(token);
  const response = await fetch(
    "https://api.spotify.com/v1/search?q=love&type=track&limit=5",
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  console.log(response);
  if (!response.ok) {
    throw new Error(`Spotify search error: ${response.status}`);
  }

  const data = await response.json();
  console.log(data);
  const tracks = data.tracks?.items || [];
  return tracks.map((track: any) => ({
    title: track.name,
    artist: track.artists.map((a: any) => a.name).join(", "),
    url: track.external_urls.spotify,
    imageUrl: track.album?.images?.[0]?.url ?? "",
  }));
}

export async function isConnected(userId: string): Promise<boolean> {
  try {
    const result = await db
      .select({
        spotifyAccessToken: user.spotifyAccessToken,
      })
      .from(user)
      .where(eq(user.id, userId));
    const foundUser = result[0];
    return !!foundUser?.spotifyAccessToken;
  } catch (error) {
    errorHandler(error);
    return false;
  }
}
