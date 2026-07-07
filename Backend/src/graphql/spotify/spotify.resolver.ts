import { getRomanticSongs } from "./spotify.service";

export const spotifyResolver = {
  Query: {
    getRomanticSongs: async () => {
      return await getRomanticSongs();
    },
  },
};
