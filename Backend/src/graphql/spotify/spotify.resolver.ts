import { eq } from "drizzle-orm";
import { db } from "../../db";
import { user } from "../../db/schema";
import {
  exchangeSpotifyCode,
  getRomanticSongs,
  getSpotifyAuthUrl,
} from "./spotify.service";
import { getUserIdFromContext } from "../../middleware/Auth";
import { errorHandler } from "../../middleware/ErrorHandler";
import * as spotifyService from "./spotify.service.js";

export const spotifyResolver = {
  Query: {
    getRomanticSongs: async () => {
      await getRomanticSongs();
    },
    getSpotifyAuthUrl: () => getSpotifyAuthUrl(),
    isSpotifyConnected: async (_: any, __: any, context: any) => {
      try {
        const userId = getUserIdFromContext(context.token);
        return await spotifyService.isConnected(userId);
      } catch (error) {
        errorHandler(error);
      }
    },
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
