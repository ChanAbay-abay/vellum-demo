import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";

import { createAuth } from "#@/index";

/**
 * Returns the signed-in user or null. Call it from a route `beforeLoad` to guard pages.
 *
 * For securing server functions or API routes, use authMiddleware from middleware.ts instead.
 */
export const $getUser = createServerFn({ method: "GET" }).handler(async () => {
  const user = await _getUser();
  return user;
});

type GetUserServerQuery = {
  disableCookieCache?: boolean | undefined;
  disableRefresh?: boolean | undefined;
};

/**
 * Server-only util, meant to be used by the $getUser server function and auth middleware so logic can be shared with optional query params.
 *
 * For server app logic, consider using authMiddleware instead.
 */
export const _getUser = createServerOnlyFn(async (query?: GetUserServerQuery) => {
  const session = await createAuth().api.getSession({
    headers: getRequest().headers,
    query,
    returnHeaders: true
  });

  // Forward any Set-Cookie headers to the client, e.g. for session/cache refresh
  const cookies = session.headers?.getSetCookie();
  if (cookies?.length) {
    setResponseHeader("Set-Cookie", cookies);
  }

  return session.response?.user ?? null;
});
