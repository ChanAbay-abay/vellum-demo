import "@tanstack/react-start/server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { ENV_DB } from "@zo-stack/env/server/db.env";

import { authRelations } from "#@/schema/auth.schema";
import { relations } from "#@/schema/relations";

export * from "drizzle-orm/sql";

/**
 * Creates a new client. Call it per request.
 *
 * Cloudflare Workers can't reuse a connection across requests, so a module-level
 * client breaks there. `max: 1` keeps each request to one connection, and
 * `prepare: false` keeps it working behind poolers like Supabase's transaction
 * pooler (port 6543) or PgBouncer.
 */
export function createDb() {
  const client = postgres(ENV_DB.DATABASE_URL, {
    max: 1,
    prepare: false
  });

  return drizzle({
    client,
    // `defineRelationsPart()` must be merged after the main `defineRelations()` config.
    // https://orm.drizzle.team/docs/relations-v2#relations-parts
    relations: { ...relations, ...authRelations }
  });
}

export type Db = ReturnType<typeof createDb>;
