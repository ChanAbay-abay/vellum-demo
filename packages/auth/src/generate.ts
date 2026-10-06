import { createAuth } from "#@/index";

// The Better Auth CLI looks for an exported variable named `auth`.
// Keep this file CLI-only so requests still get a fresh instance from `createAuth()`.
export const auth = createAuth();
