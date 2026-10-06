import { Footer } from "@/features/footer";
import { Navbar } from "@/features/navbar";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
