import { ClosingCta } from "@/shared/ui/closing-cta";

import { CTA } from "@/pages/merch/config/merch.content";
import { ProductsSection } from "@/pages/merch/ui/products-section";
import { StickersSection } from "@/pages/merch/ui/stickers-section";

/**
 * /merch (PRD "Merch"). SiteNav and SiteFooter are mounted around every page by RootLayout.
 * Grounds: paper (header + grid) → bone (sticker set) → ink (closing CTA) → ink footer.
 */
export function MerchPage() {
  return (
    <>
      <ProductsSection />
      <StickersSection />
      <ClosingCta {...CTA} />
    </>
  );
}
