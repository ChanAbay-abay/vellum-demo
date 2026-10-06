import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [
      // Blocks cross-site requests to server functions (e.g. a contact form handler).
      createCsrfMiddleware({
        filter: (ctx) => ctx.handlerType === "serverFn"
      })
    ]
  };
});
