import { ApolloServer } from "@apollo/server";

import {
  StandaloneServerContextFunctionArgument,
  startStandaloneServer,
} from "@apollo/server/standalone";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { spotifyTypeDefs, userSchema } from "./graphql/user/user.schema";
import { userResolver } from "./graphql/user/user.resolver";
import { connectDatabase } from "./db";
import { AppError } from "./middleware/ErrorHandler";
import { spotifyResolver } from "./graphql/spotify/spotify.resolver";

dotenv.config();

const Node_env = process.env.NODE_ENV || "development";
const PORT = Number(process.env.PORT) || 4000;
const isDevelopment = Node_env === "development";

// Parses a raw cookie string into a key-value object for easy access
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    if (name) cookies[name] = rest.join("=");
  });
  return cookies;
}

// CORS configuration allowing local development and production origins
const corsOption = {
  origin: isDevelopment
    ? ["http://localhost:4200", "*"]
    : process.env.SITE_DOMAIN,
  credentials: true,
};

// GraphQL context shape containing the extracted JWT token from the request
interface MyContext {
  token: string;
}

const typeDefs = [userSchema, spotifyTypeDefs];
const resolvers = [userResolver, spotifyResolver];

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: isDevelopment,
  formatError: (formattedError, error) => {
    if (!isDevelopment) {
      delete formattedError.extensions?.stacktrace;
    }
    if (error instanceof AppError) {
      return {
        ...formattedError,
        extensions: {
          ...formattedError.extensions,
          code: "OPERATIONAL_ERROR",
          statusCode: error.statusCode,
        },
      };
    }
    return formattedError;
  },
});

// Initializes the database connection and starts the Apollo GraphQL server
async function startServer(): Promise<void> {
  await connectDatabase();
  const { url }: { url: string } = await startStandaloneServer(server, {
    listen: { port: PORT },
    context: async (
      contextArgs: StandaloneServerContextFunctionArgument,
    ): Promise<MyContext> => {
      const authHeader = contextArgs.req.headers.authorization || "";
      const token: string = authHeader.startsWith("Bearer")
        ? authHeader.slice(7)
        : authHeader;
      return { token };
    },
  });

  console.log(`Server running at: ${url}`);
}

startServer();
