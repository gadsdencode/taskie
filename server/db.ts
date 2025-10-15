import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure WebSocket for Neon serverless
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // @ts-ignore - ws package is needed for Node.js environments
  webSocketConstructor: ws,
});

export const db = drizzle(pool, { schema });
