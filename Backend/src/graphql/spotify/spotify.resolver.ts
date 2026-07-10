import { eq } from "drizzle-orm";
import { db } from "../../db";
import { user } from "../../db/schema";
import {
  exchangeSpotifyCode,
  getRomanticSongs,
  getSpotifyAuthUrl,
} from "./spotify.service";
import { getUserIdFromContext } from "../../middleware/Auth";

export const spotifyResolver = {
  Query: {
    getRomanticSongs: async () => {
      await getRomanticSongs();
    },
    getSpotifyAuthUrl: () => getSpotifyAuthUrl(),
  },
  Mutation: {
    exchangeSpotifyCode: async (
      _: any,
      { code }: { code: string },
      context: any,
    ) => {
      const userId = getUserIdFromContext(context.token);
      const tokens = await exchangeSpotifyCode(code);
      const expiryDate = new Date(Date.now() + tokens.expiresIn * 1000);
      await db
        .update(user)
        .set({
          spotifyAccessToken: tokens.accessToken,
          spotifyRefreshToken: tokens.refreshToken,
          sportifyTokenExpiry: expiryDate,
        })
        .where(eq(user.id, userId));
    },
  },
};
