import dotenv from "dotenv";

dotenv.config();

export interface SpotifySong {
  title: string;
  artist: string;
  url: string;
  imageUrl: string;
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
