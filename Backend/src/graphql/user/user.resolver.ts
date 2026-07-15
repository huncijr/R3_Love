import { db } from "../../db/index.js";
import {
  calendarEvents,
  calendarQuiz,
  giftRecommendations,
  giftUsage,
  user,
} from "../../db/schema.js";
import { and, desc, eq, ne } from "drizzle-orm";
import { AppError, errorHandler } from "../../middleware/ErrorHandler.js";
import bcrypt from "bcrypt";
import { generateToken, verifyToken } from "../../middleware/Auth.js";
import {
  generateDailyInsightFromAI,
  generateDeepQuestionsFromAI,
  generatePracticalQuestionsFromAI,
  getGiftRecommendationsFromAI,
  QuizAnswer,
} from "../ai/ai.service.js";
import { verifyTurnstileToken } from "../../utils/turnstile.js";
import crypto from "crypto";
import { verifyGoogleCredential } from "../google/google.service.js";
import { sendVerificationCode } from "../../utils/mailer.js";

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
    getGiftRecommendationsHistory: async (
      _parent: any,
      _args: any,
      context: any,
    ) => {
      const userId = getUserIdFromContext(context.token);
      try {
        const rows = await db
          .select()
          .from(giftRecommendations)
          .where(eq(giftRecommendations.userId, userId))
          .orderBy(desc(giftRecommendations.createdAt));
        return rows;
      } catch (error) {
        errorHandler(error);
      }
    },

    getDailyInsight: async () => {
      try {
        return await generateDailyInsightFromAI();
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
        turnstileToken: string;
      },
    ) => {
      try {
        const isHuman = await verifyTurnstileToken(args.turnstileToken);
        if (!isHuman) {
          throw new AppError("Turnstile verification failed", 403);
        }
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
      args: { name: string; password: string; turnstileToken: string },
    ) => {
      try {
        const isHuman = await verifyTurnstileToken(args.turnstileToken);
        if (!isHuman) {
          throw new AppError("Turnstile verification failed", 403);
        }
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

    sendVerificationEmail: async (_: any, __: any, context: any) => {
      try {
        const userId = getUserIdFromContext(context.token);
        const [foundUser] = await db
          .select({ email: user.email })
          .from(user)
          .where(eq(user.id, userId));

        if (!foundUser?.email) {
          throw new AppError("No email address found. Add an email first", 400);
        }

        const code = Math.floor(10000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        await db
          .update(user)
          .set({ verificationCode: code, verificationCodeExpiry: expiry })
          .where(eq(user.id, userId));

        const sent = await sendVerificationCode(foundUser.email, code);

        if (!sent) {
          throw new AppError("Failed to send verification email", 500);
        }
        return true;
      } catch (error) {
        errorHandler(error);
        return false;
      }
    },

    verifyEmail: async (_: any, args: { code: string }, context: any) => {
      try {
        const userId = getUserIdFromContext(context.token);
        const [foundUser] = await db
          .select({
            verificationCode: user.verificationCode,
            verificationCodeExpiry: user.verificationCodeExpiry,
          })
          .from(user)
          .where(eq(user.id, userId));

        if (!foundUser?.verificationCode) {
          throw new AppError("No verification code requested", 400);
        }

        if (new Date() > new Date(foundUser.verificationCodeExpiry!)) {
          throw new AppError(
            "Verification code expired, Request a new one",
            400,
          );
        }

        if (foundUser.verificationCode !== args.code) {
          throw new AppError("Invalid verification code", 400);
        }

        await db
          .update(user)
          .set({
            emailVerified: true,
            verificationCode: null,
            verificationCodeExpiry: null,
          })
          .where(eq(user.id, userId));

        return true;
      } catch (error) {
        errorHandler(error);
        return false;
      }
    },

    updateUserCountry: async (
      _: any,
      args: { country: string },
      context: any,
    ) => {
      try {
        console.log(args.country);
        const userId = getUserIdFromContext(context.token);
        const [updatedUser] = await db
          .update(user)
          .set({ country: args.country })
          .where(eq(user.id, userId))
          .returning();

        console.log(updatedUser);

        return updatedUser;
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

    updateUserGender: async (
      _: any,
      args: { gender: string },
      context: any,
    ) => {
      try {
        const userId = getUserIdFromContext(context.token);
        const [updatedUser] = await db
          .update(user)
          .set({ gender: args.gender })
          .where(eq(user.id, userId))
          .returning();
        return updatedUser;
      } catch (error) {
        errorHandler(error);
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
      context: any,
    ) => {
      try {
        const userId = getUserIdFromContext(context.token);
        const today = new Date().toISOString().slice(0, 10);
        const usageRows = await db
          .select()
          .from(giftUsage)
          .where(and(eq(giftUsage.userId, userId), eq(giftUsage.date, today)));

        const todayCount = usageRows[0]?.count ?? 0;
        if (todayCount >= 3) {
          throw new AppError("Daily gift recommendation limit reached", 429);
        }

        if (usageRows.length > 0) {
          await db
            .update(giftUsage)
            .set({ count: todayCount + 1, updatedAt: new Date() })
            .where(eq(giftUsage.id, usageRows[0].id));
        } else {
          await db.insert(giftUsage).values({ userId, date: today, count: 1 });
        }
        return await getGiftRecommendationsFromAI(answers);
      } catch (err) {
        errorHandler(err);
      }
    },

    saveGiftRecommendations: async (
      _parent: any,
      { input }: { input: any },
      context: any,
    ) => {
      const userId = getUserIdFromContext(context.token);
      try {
        const [saved] = await db
          .insert(giftRecommendations)
          .values({
            userId,
            answers: input.answers,
            recommendations: input.recommendations,
          })
          .returning();
        await db
          .update(user)
          .set({ giftDone: true })
          .where(eq(user.id, userId));

        return saved;
      } catch (error) {
        errorHandler(error);
      }
    },
    deleteGiftRecommendations: async (
      _parent: any,
      args: { id: string },
      context: any,
    ) => {
      const userId = getUserIdFromContext(context.token);
      try {
        await db
          .delete(giftRecommendations)
          .where(
            and(
              eq(giftRecommendations.id, args.id),
              eq(giftRecommendations.userId, userId),
            ),
          );
        return true;
      } catch (error) {
        errorHandler(error);
      }
    },

    markGameDone: async (
      _parent: unknown,
      _args: unknown,
      context: { token: string },
    ) => {
      try {
        const userId = getUserIdFromContext(context.token);
        await db
          .update(user)
          .set({ gameDone: true })
          .where(eq(user.id, userId));

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
    googleAuth: async (_parent: unknown, args: { credential: string }) => {
      try {
        const googleUser = await verifyGoogleCredential(args.credential);

        const existingByGoogleId = await db
          .select()
          .from(user)
          .where(eq(user.googleId, googleUser.sub));

        if (existingByGoogleId.length > 0) {
          const foundUser = existingByGoogleId[0];
          const token = generateToken(foundUser.id);
          return { user: foundUser, token };
        }

        const existingByName = await db
          .select()
          .from(user)
          .where(eq(user.name, googleUser.name));

        if (existingByName.length > 0) {
          const foundUser = existingByName[0];
          await db
            .update(user)
            .set({ googleId: googleUser.sub, email: googleUser.email })
            .where(eq(user.id, foundUser.id));
          const token = generateToken(foundUser.id);
          return { user: foundUser, token };
        }

        const randomPassword = crypto.randomBytes(32).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        const newUser = {
          name: googleUser.name,
          password: hashedPassword,
          googleId: googleUser.sub,
          email: googleUser.email,
          gender: null,
        };

        const result = await db.insert(user).values(newUser).returning();
        const createdUser = result[0];
        const token = generateToken(createdUser.id);

        return { user: createdUser, token };
      } catch (error) {
        errorHandler(error);
      }
    },
  },
};
