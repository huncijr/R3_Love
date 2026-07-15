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
      return await getRomanticSongs();
    },
    getSpotifyAuthUrl: () => getSpotifyAuthUrl(),
    isSpotifyConnected: async (_: any, __: any, context: any) => {
      try {
        const userId = await getUserIdFromContext(context.token, true);
        return await spotifyService.isConnected(userId);
      } catch (error) {
        errorHandler(error);
      }
    },
    getSpotifyAccessToken: async (_: any, __: any, context: any) => {
      try {
        const userId = await getUserIdFromContext(context.token);
        const [foundUser] = await db
          .select({
            spotifyAccessToken: user.spotifyAccessToken,
            spotifyRefreshToken: user.spotifyRefreshToken,
            spotifyTokenExpiry: user.sportifyTokenExpiry,
          })
          .from(user)
          .where(eq(user.id, userId));

        const now = new Date();
        const expiry = foundUser.spotifyTokenExpiry;

        if (expiry && expiry <= now && foundUser.spotifyRefreshToken) {
          const newToken = await spotifyService.refreshAccessToken(
            foundUser.spotifyRefreshToken,
          );
          const newExpiry = new Date(Date.now() + 3600 * 1000);
          await db
            .update(user)
            .set({
              spotifyAccessToken: newToken,
              sportifyTokenExpiry: newExpiry,
            })
            .where(eq(user.id, userId));
          return newToken;
        }
        return foundUser.spotifyAccessToken;
      } catch (error) {
        errorHandler(error);
      }
    },
    getSpotifyProfile: async (_: any, __: any, context: any) => {
      try {
        const userId = await getUserIdFromContext(context.token, true);
        return await spotifyService.getProfile(userId);
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
      try {
        console.log("exchangeSpotifyCode resolver called", {
          code,
          hasToken: !!context.token,
        });
        const userId = await getUserIdFromContext(context.token);
        console.log("userId from token", userId);
        const tokens = await exchangeSpotifyCode(code);
        console.log("tokens received from Spotify", tokens);
        console.log("tokens", tokens);
        const expiryDate = new Date(Date.now() + tokens.expiresIn * 1000);
        await db
          .update(user)
          .set({
            spotifyAccessToken: tokens.accessToken,
            spotifyRefreshToken: tokens.refreshToken,
            sportifyTokenExpiry: expiryDate,
          })
          .where(eq(user.id, userId));
        return true;
      } catch (error) {
        errorHandler(error);
        return false;
      }
    },

    disconnectSpotify: async (_: any, __any: any, context: any) => {
      const userId = await getUserIdFromContext(context.token);
      await db
        .update(user)
        .set({
          spotifyAccessToken: null,
          spotifyRefreshToken: null,
          sportifyTokenExpiry: null,
        })
        .where(eq(user.id, userId));
      return true;
    },
  },
};
