import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import "@tanstack/react-start/server-only";
import { betterAuth } from "better-auth";

import { createDb } from "@zo-stack/db";
import * as schema from "@zo-stack/db/schema";
import { ENV_AUTH } from "@zo-stack/env/server/auth.env";
import { ENV_WEB_ISOMORPHIC } from "@zo-stack/env/web/env.isomorphic";

export const AUTH_BASE_PATH = "/api/auth";

/**
 * Creates a Better Auth instance. Call it per request (same reason as `createDb()`:
 * Cloudflare Workers can't share a DB connection across requests).
 */
export function createAuth() {
  return betterAuth({
    baseURL: ENV_WEB_ISOMORPHIC.VITE_SITE_URL,
    basePath: AUTH_BASE_PATH,
    secret: ENV_AUTH.BETTER_AUTH_SECRET,
    database: drizzleAdapter(createDb(), {
      provider: "pg",
      schema
    }),

    // https://www.better-auth.com/docs/concepts/session-management#session-caching
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60 // 5 minutes
      }
    },

    // https://www.better-auth.com/docs/authentication/email-password
    emailAndPassword: {
      enabled: true
    },

    advanced: {
      database: {
        // https://www.better-auth.com/docs/adapters/drizzle#joins
        joins: true
      }
    },

    telemetry: {
      enabled: false
    }
  });
}

export type AuthSession = ReturnType<typeof createAuth>["$Infer"]["Session"];
