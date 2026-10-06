import { type Config } from "drizzle-kit";

import { ENV_DB } from "@zo-stack/env/server/db.env";

export default {
  breakpoints: true,
  introspect: {
    casing: "preserve"
  },
  dbCredentials: {
    url: ENV_DB.DATABASE_URL
  },
  dialect: "postgresql",
  out: "./migrations",
  schema: "./src/schema/index.ts",

  verbose: true
} satisfies Config;
