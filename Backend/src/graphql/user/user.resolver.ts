import { db } from "../../db/index.js";
import { user } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export const userResolver = {
  Query: {
    // Összes user lekérdezése
    users: async () => {
      return await db.select().from(user);
    },

    // Egy user lekérdezése ID alapján
    user: async (_parent: unknown, args: { id: string }) => {
      const result = await db.select().from(user).where(eq(user.id, args.id));
      return result[0] || null;
    },
  },

  Mutation: {
    // Új user létrehozása
    createUser: async (
      _parent: unknown,
      args: {
        name: string;
        password: string;
        partnerName?: string;
        gender?: string;
        isSingle?: boolean;
      },
    ) => {
      const newUser = {
        name: args.name,
        password: args.password,
        partnerName: args.partnerName || null,
        gender: args.gender || null,
        isSingle: args.isSingle ?? false,
      };

      const result = await db.insert(user).values(newUser).returning();
      return result[0];
    },
  },
};
