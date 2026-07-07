import dotenv from "dotenv";

dotenv.config();

export interface SpotifySong {
  title: string;
  artist: string;
  url: string;
  imageUrl: string;
}

const MOCK_SONGS: SpotifySong[] = [
  {
    title: "Perfect",
    artist: "Ed Sheeran",
    url: "https://open.spotify.com/track/0tgVpDi06FyKpA1zm0rEO5",
    imageUrl:
      "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96",
  },
  {
    title: "All of Me",
    artist: "John Legend",
    url: "https://open.spotify.com/track/3U4isOIWM3VvDubwSI3y7a",
    imageUrl:
      "https://i.scdn.co/image/ab67616d0000b2731d97a275a5bb915dc92f0477",
  },
  {
    title: "Just the Way You Are",
    artist: "Bruno Mars",
    url: "https://open.spotify.com/track/7BqBn9nzAq8spo54e7HX",
    imageUrl:
      "https://i.scdn.co/image/ab67616d0000b273f6b55ca93b332132b2e9a3c2",
  },
  {
    title: "A Thousand Years",
    artist: "Christina Perri",
    url: "https://open.spotify.com/track/6lanRgr6wXibZr8KgzXxBl",
    imageUrl:
      "https://i.scdn.co/image/ab67616d0000b273c82a683c61e665677e7e8c06",
  },
  {
    title: "Make You Feel My Love",
    artist: "Adele",
    url: "https://open.spotify.com/track/1P4e3w2t6A0Z7Y3q8X9vW",
    imageUrl:
      "https://i.scdn.co/image/ab67616d0000b2736f5b8e09b9aef5b1e4e3e1b0",
  },
];

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
  return MOCK_SONGS;
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
