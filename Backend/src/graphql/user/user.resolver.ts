import { db } from "../../db/index.js";
import { user } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { AppError, errorHandler } from "../../middleware/ErrorHandler.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../middleware/Auth.js";

export const userResolver = {
  Query: {
    users: async () => {
      try {
        return await db.select().from(user);
      } catch (error) {
        errorHandler(new AppError("Failet to fetch", 500));
      }
    },

    user: async (_parent: unknown, args: { id: string }) => {
      try {
        const result = await db.select().from(user).where(eq(user.id, args.id));
        if (result.length === 0) {
          errorHandler(new AppError("User not found", 404));
        }
        return result[0];
      } catch (error) {
        errorHandler(error);
      }
    },
  },

  Mutation: {
    createUser: async (
      _parent: unknown,
      args: {
        name: string;
        password: string;
        partnerName?: string;
        gender?: string;
      },
    ) => {
      try {
        const hashedPassword = await bcrypt.hash(args.password, 10);
        const newUser = {
          name: args.name,
          password: hashedPassword,
          partnerName: null,
          gender: args.gender || null,
        };

        const result = await db.insert(user).values(newUser).returning();
        const createdUser = result[0];
        const token = generateToken(createdUser.id);

        return {
          user: createdUser,
          token: token,
        };
      } catch (error) {
        errorHandler(error);
      }
    },
  },
};
