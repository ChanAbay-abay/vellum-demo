import { cn } from "@zo-stack/ui/lib/utils";

import { SiteFooter } from "@/features/site-footer";
import { SiteNav } from "@/features/site-nav";

export function CenteredLayout({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <div className={cn("flex min-h-screen flex-col", className)}>
        <SiteNav />
        <main className="relative -top-(--navbar-height) grid flex-1 place-items-center pt-(--navbar-height)">
          {children}
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
