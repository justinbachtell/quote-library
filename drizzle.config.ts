import { defineConfig } from "drizzle-kit";
import { env } from "~/env";

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/drizzle",
  driver: "mysql2",
  dbCredentials: {
    uri: env.DATABASE_URL,
  },
  tablesFilter: ["quote-library_*"],
  // verbose: true,
  // strict: true,
});
