import { createAuthClient } from "better-auth/react";

/**
 * Browser-only. Auth runs on the same origin as the site (`/api/auth`), so no base URL is needed.
 * It keeps state in nanostores, which are shared module state, so never use it during SSR.
 */
export const authClient = createAuthClient({
  basePath: "/api/auth"
}) as ReturnType<typeof createAuthClient>;

export type AuthClientSession = typeof authClient.$Infer.Session;
