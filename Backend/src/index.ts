import { ApolloServer } from "@apollo/server";

import {
  StandaloneServerContextFunctionArgument,
  startStandaloneServer,
} from "@apollo/server/standalone";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { userSchema } from "./graphql/user/user.schema";
import { userResolver } from "./graphql/user/user.resolver";
import { connectDatabase } from "./db";

dotenv.config();

const Node_env = process.env.NODE_ENV || "development";
const PORT = Number(process.env.PORT) || 4000;
const isDevelopment = Node_env === "development";

const corsOption = {
  origin: isDevelopment ? ["http://localhost:4200", "*"] : ["https://..."],
  credentials: true,
};

interface MyContext {
  token: string;
}

const typeDefs = userSchema;
const resolvers = userResolver;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: isDevelopment,
});

async function startServer(): Promise<void> {
  await connectDatabase();
  const { url }: { url: string } = await startStandaloneServer(server, {
    listen: { port: PORT },
    // Context function típusosítva – nincs többé 'implicitly any' hiba!
    context: async (
      contextArgs: StandaloneServerContextFunctionArgument,
    ): Promise<MyContext> => {
      const token: string = contextArgs.req.headers.authorization || "";
      return { token };
    },
  });

  console.log(`Server running at: ${url}`);
}

startServer();
