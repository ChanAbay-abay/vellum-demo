import { Outlet, createFileRoute } from "@tanstack/react-router";

import { RootLayout } from "@/widgets/layouts";

export const Route = createFileRoute("/(root-layout)")({
  component: () => (
    <RootLayout>
      <Outlet />
    </RootLayout>
  )
});
