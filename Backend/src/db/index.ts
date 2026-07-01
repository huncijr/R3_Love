import { Client } from "pg";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

dotenv.config();

// PostgreSQL client with SSL for Supabase connection
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(client, { schema });

// Establishes database connection on server startup
export async function connectDatabase(): Promise<void> {
  await client.connect();
  console.log("Connected to supabase");
}
