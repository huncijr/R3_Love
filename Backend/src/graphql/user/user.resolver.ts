import { db } from "../../db/index.js";
import { calendarQuiz, user } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { AppError, errorHandler } from "../../middleware/ErrorHandler.js";
import bcrypt from "bcrypt";
import { generateToken, verifyToken } from "../../middleware/Auth.js";

const getUserIdFromContext = (token: string): string => {
  if (!token) throw new AppError("Unathorized", 401);
  try {
    const decoded = verifyToken(token);
    return decoded.userId;
  } catch {
    throw new AppError("Invalid token", 401);
  }
};

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

    getCalendarQuiz: async (
      _parent: unknown,
      _args: unknown,
      context: { token: string },
    ) => {
      try {
        const userId = getUserIdFromContext(context.token);
        const result = await db
          .select()
          .from(calendarQuiz)
          .where(eq(calendarQuiz.userId, userId));
        return result[0] || null;
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
        gender?: string;
      },
    ) => {
      try {
        const hashedPassword = await bcrypt.hash(args.password, 10);
        const newUser = {
          name: args.name,
          password: hashedPassword,
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
    login: async (
      _parent: unknown,
      args: { name: string; password: string },
    ) => {
      try {
        const result = await db
          .select()
          .from(user)
          .where(eq(user.name, args.name));
        if (result.length === 0) {
          throw new AppError("Invalid username or password", 401);
        }
        const foundUser = result[0];

        if (!foundUser.password) {
          throw new AppError("Invalid username or password", 401);
        }

        const isPasswordValid = await bcrypt.compare(
          args.password,
          foundUser.password,
        );

        const token = generateToken(foundUser.id);
        return {
          user: foundUser,
          token: token,
        };
      } catch (error) {
        errorHandler(error);
      }
    },
    saveCalendarQuiz: async (
      _parent: unknown,
      args: {
        isSingle: boolean;
        partnerName?: string;
        datingDate?: string;
        partnerBirthday?: string;
      },
      context: { token: string },
    ) => {
      try {
        const userId = getUserIdFromContext(context.token) as string;
        console.log(userId);
        const existing = await db
          .select()
          .from(calendarQuiz)
          .where(eq(calendarQuiz.userId, userId));

        if (existing.length > 0) {
          const result = await db
            .update(calendarQuiz)
            .set({
              isSingle: args.isSingle,
              partnerName: args.partnerName || null,
              datingDate: args.datingDate || null,
              partnerBirthday: args.partnerBirthday || null,
              updatedAt: new Date(),
            })
            .where(eq(calendarQuiz.userId, userId))
            .returning();
          return result[0];
        }

        const result = await db
          .insert(calendarQuiz)
          .values([
            {
              userId,
              isSingle: args.isSingle,
              partnerName: args.partnerName || null,
              datingDate: args.datingDate || null,
              partnerBirthday: args.partnerBirthday || null,
            },
          ])
          .returning();
        return result[0];
      } catch (error) {
        errorHandler(error);
      }
    },
  },
};
