import { db } from "../../db/index.js";
import { calendarEvents, calendarQuiz, user } from "../../db/schema.js";
import { and, eq } from "drizzle-orm";
import { AppError, errorHandler } from "../../middleware/ErrorHandler.js";
import bcrypt from "bcrypt";
import { generateToken, verifyToken } from "../../middleware/Auth.js";
import {
  generateDeepQuestionsFromAI,
  generatePracticalQuestionsFromAI,
  getGiftRecommendationsFromAI,
  QuizAnswer,
} from "../ai/ai.service.js";

// Extracts and verifies user ID from JWT token in request context
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
    // Returns all registered users (admin/debug use)
    users: async () => {
      try {
        return await db.select().from(user);
      } catch (error) {
        errorHandler(new AppError("Failet to fetch", 500));
      }
    },

    // Returns a single user by ID
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

    // Fetches the calendar quiz data for the authenticated user
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
    // Returns completion status of all three game modules
    getUserProgress: async (
      _parent: unknown,
      _args: unknown,
      context: { token: string },
    ) => {
      try {
        const userId = getUserIdFromContext(context.token);
        const result = await db
          .select({
            calendarDone: user.calendarDone,
            giftDone: user.giftDone,
            gameDone: user.gameDone,
          })
          .from(user)
          .where(eq(user.id, userId));
        return (
          result[0] || { calendarDone: false, giftDone: false, gameDone: false }
        );
      } catch (error) {
        errorHandler(error);
      }
    },
    // Loads all calendar events belonging to the authenticated user
    getCalendarEvents: async (
      _parent: unknown,
      _args: unknown,
      context: { token: string },
    ) => {
      try {
        const userId = getUserIdFromContext(context.token);
        const events = await db
          .select()
          .from(calendarEvents)
          .where(eq(calendarEvents.userId, userId));

        return events.map((event) => ({
          ...event,
          startDate: event.startDate.toISOString(),
          createdAt: event.createdAt.toISOString(),
        }));
      } catch (error) {
        errorHandler(error);
      }
    },
  },

  Mutation: {
    // Registers a new user with hashed password and returns auth token
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

    // Authenticates user and returns JWT token
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

    // Upserts calendar quiz answers and marks calendar module as completed
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

          await db
            .update(user)
            .set({ calendarDone: true })
            .where(eq(user.id, userId));
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

        await db
          .update(user)
          .set({ calendarDone: true })
          .where(eq(user.id, userId));
        return result[0];
      } catch (error) {
        errorHandler(error);
      }
    },
    // Creates a new custom event in the user's calendar
    saveCalendarEvent: async (
      _parent: unknown,
      args: {
        event: {
          title: string;
          description?: string;
          startDate: string;
          allDay?: boolean;
          color?: string;
        };
      },
      context: { token: string },
    ) => {
      try {
        const userId = getUserIdFromContext(context.token);
        const result = await db
          .insert(calendarEvents)
          .values({
            userId,
            title: args.event.title,
            description: args.event.description || null,
            startDate: new Date(args.event.startDate),
            allDay: args.event.allDay ?? true,
            color: args.event.color || null,
          })
          .returning();
        console.log("[DEBUG] Found events in DB:", result);

        return result[0];
      } catch (error) {}
    },

    // Removes a calendar event by ID (only if owned by the authenticated user)
    deleteCalendarEvent: async (
      _parents: unknown,
      args: { id: string },
      context: { token: string },
    ) => {
      try {
        const userId = getUserIdFromContext(context.token);
        const events = await db
          .delete(calendarEvents)
          .where(
            and(
              eq(calendarEvents.id, args.id),
              eq(calendarEvents.userId, userId),
            ),
          );
        console.log("[DEBUG] Found events in DB:", events);

        return true;
      } catch (err) {
        errorHandler(err);
      }
    },

    generateDeepQuestions: async (
      _: any,
      { answers }: { answers: QuizAnswer[] },
    ) => {
      return await generateDeepQuestionsFromAI(answers);
    },
    generatePracticalQuestions: async (
      _: any,
      { answers }: { answers: QuizAnswer[] },
    ) => {
      return await generatePracticalQuestionsFromAI(answers);
    },
    getGiftRecommendations: async (
      _: any,
      { answers }: { answers: QuizAnswer[] },
    ) => {
      return await getGiftRecommendationsFromAI(answers);
    },
  },
};
