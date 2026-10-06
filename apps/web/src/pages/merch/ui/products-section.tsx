import { Picture } from "@zo-stack/ui/components/picture";
import { cn } from "@zo-stack/ui/lib/utils";

import { ArrowUpRightIcon } from "@/shared/ui/icons";
import { InquireLink } from "@/shared/ui/inquire-link";
import { Reveal } from "@/shared/ui/reveal";
import { Stripe } from "@/shared/ui/stripe";

import { HEADER, PRODUCTS } from "@/pages/merch/config/merch.content";

/** Cards in the first row sit above the fold at 1440×900, so they enter on CSS, not on scroll. */
const FIRST_ROW = 3;

/**
 * Page top on paper: the h1 with the Retro stripe under it, the body line offset right, then the
 * product grid (DESIGN.md §8 product card: 4:5 image on bone, name, meta in caption, "Inquire").
 * The whole card is one Instagram DM link, like the home merch row's cards. No prices.
 *
 * The header and first row use a CSS mount entrance (above the fold, never held behind JS, RULES
 * motion split); the second row reveals on scroll. Images keep their box from `aspect-4/5`, so
 * nothing shifts as they load.
 */
export function ProductsSection() {
  return (
    <section
      aria-labelledby="merch-heading"
      className="bg-paper text-ink px-(--gutter) pt-[8.5rem] pb-[5rem] lg:pt-[10rem] lg:pb-[8rem]"
    >
      <div className="grid animate-in gap-[2rem] duration-1000 fade-in slide-in-from-bottom-4 lg:grid-cols-12 lg:items-end lg:gap-x-[1.5rem]">
        <div className="lg:col-span-8">
          <div className="inline-flex flex-col">
            <h1
              className="lg:text-title text-[3rem] leading-[0.95] font-semibold tracking-[-0.03em]"
              id="merch-heading"
            >
              {HEADER.heading.map((line) => (
                <span className="block whitespace-nowrap" key={line}>
                  {line}
                </span>
              ))}
            </h1>
            <Stripe angle={0} bandHeight="0.3rem" className="mt-[1.5rem] w-full" />
          </div>
        </div>
        <p className="text-body max-w-[36ch] lg:col-span-4 lg:col-start-9">{HEADER.body}</p>
      </div>

      <ul className="mt-[3.5rem] grid gap-x-[1.5rem] gap-y-[3.5rem] sm:grid-cols-2 lg:mt-[4.5rem] lg:grid-cols-3 lg:gap-y-[4.5rem]">
        {PRODUCTS.map((product, i) => {
          const card = <ProductCard aboveFold={i < FIRST_ROW} product={product} />;
          return (
            <li key={product.name}>
              {i < FIRST_ROW ? (
                <div
                  className="h-full animate-in duration-1000 fill-mode-both fade-in slide-in-from-bottom-4"
                  // Per-card stagger is runtime data, so it rides an inline delay.
                  style={{ animationDelay: `${150 + i * 80}ms` }}
                >
                  {card}
                </div>
              ) : (
                <Reveal className="h-full" delay={(i - FIRST_ROW) * 0.08}>
                  {card}
                </Reveal>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ProductCard({
  product,
  aboveFold
}: {
  product: (typeof PRODUCTS)[number];
  aboveFold: boolean;
}) {
  return (
    <InquireLink className="group flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
      <div className="bg-bone relative aspect-4/5 min-h-[16rem] overflow-hidden">
        <Picture
          alt={product.alt}
          className="absolute inset-0 block size-full"
          image={product.image}
          imgClassName="size-full object-cover transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
          priority={aboveFold}
          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>
      <div className="mt-[1.25rem] flex flex-col gap-[0.35rem]">
        <span className="text-subheading">{product.name}</span>
        {"note" in product ? <span className="text-caption">{product.note}</span> : null}
        {product.meta ? (
          <span className="text-caption text-muted-foreground">{product.meta}</span>
        ) : null}
      </div>
      <span
        className={cn(
          "text-label relative mt-auto inline-flex items-center gap-[0.6rem] self-start pt-[1.25rem]",
          // The link underline (DESIGN.md §5 card hover), drawn from the left on card hover.
          "after:absolute after:inset-x-0 after:-bottom-[0.35rem] after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-400 after:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100"
        )}
      >
        Inquire
        <ArrowUpRightIcon className="w-[0.65rem]" />
      </span>
    </InquireLink>
  );
}
