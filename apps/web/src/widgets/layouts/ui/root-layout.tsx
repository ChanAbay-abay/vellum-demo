import { SiteFooter } from "@/features/site-footer";
import { SiteNav } from "@/features/site-nav";

/** Every page gets the floating nav and the footer; pages render their sections in between. */
export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
