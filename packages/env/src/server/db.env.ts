import process from "node:process";

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * Server-only. Imported by `@zo-stack/db`, so it is only validated once the app uses the database.
 */
export const ENV_DB = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {
    // Postgres connection string (VPS Postgres or Supabase pooler URL).
    DATABASE_URL: z.string().min(1)
  }
});
