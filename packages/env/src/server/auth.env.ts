import process from "node:process";

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * Server-only. Imported by `@zo-stack/auth`, so it is only validated once the app uses auth.
 */
export const ENV_AUTH = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {
    // Generate with: vp run auth:secret
    BETTER_AUTH_SECRET: z.string().min(32)
  }
});
