import { type ErrorRouteComponent, createRouter } from "@tanstack/react-router";

import { DefaultNotFoundPage } from "@/pages/default-not-found";

import { routeTree } from "@/routeTree.gen";

export function getRouter() {
  return createRouter({
    /**
     * Don't use defaultErrorComponent and prefer __root's errorComponent
     * in order to prevent nesting with existing layouts
     * @see {@link https://github.com/TanStack/router/issues/1181#issuecomment-2192468966}
     */
    defaultErrorComponent: (({ error }) => {
      throw error;
    }) satisfies ErrorRouteComponent,
    defaultNotFoundComponent: DefaultNotFoundPage,
    // Lenis + <HashScroll> handle `#section` scrolling. The router's instant jump would cancel the smooth scroll.
    defaultHashScrollIntoView: false,
    // Prefetch <Link> targets on hover and touch
    defaultPreload: "intent",
    // https://tanstack.com/router/latest/docs/guide/render-optimizations
    defaultStructuralSharing: true,
    routeTree,
    scrollRestoration: true
  });
}

declare module "@tanstack/react-router" {
  // Declaration merging needs an interface
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
