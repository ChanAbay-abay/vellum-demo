import { m, useMotionValue, useSpring, useTransform } from "motion/react";

import { SplitReveal } from "@zo-stack/ui/components/split-reveal";

import { ActionLink } from "@/shared/ui/action-link";
import { ArrowRightIcon } from "@/shared/ui/icons";

import { COLLECTION } from "@/pages/home/config/home.content";
import { FINISHES, Instrument } from "@/pages/home/ui/instrument";

const SPRING = { damping: 20, mass: 0.6, stiffness: 120 };

export function CollectionSection() {
  return (
    <section
      id={COLLECTION.id}
      className="bg-paper text-ink relative px-[1.875rem] pt-[5rem] pb-[1.875rem]"
    >
      <SplitReveal as="h2" className="font-display text-title uppercase" text={COLLECTION.title} />

      <div className="mt-[4rem] grid gap-[2rem] md:grid-cols-2">
        {COLLECTION.items.map((item) => (
          <ActionLink
            key={item.name}
            action={item.cta}
            className="group border-rule flex flex-col overflow-hidden border p-[1rem] md:min-h-[38.9375rem] md:p-[1.5rem] lg:p-[2rem]"
          >
            <h3 className="font-display text-heading uppercase">{item.name}</h3>
            <p className="text-subheading text-ink/50 font-medium uppercase">{item.detail}</p>
            <TurnableObject finish={FINISHES[item.finish]} />
            <span className="text-caption ml-auto flex items-center gap-[0.5rem] font-semibold uppercase">
              {item.cta.label}
              <ArrowRightIcon className="h-[0.625rem] w-[0.8125rem] transition-transform duration-300 group-hover:translate-x-[0.25rem]" />
            </span>
          </ActionLink>
        ))}
      </div>
    </section>
  );
}

/** The object turns to follow the pointer, like a product you can pick up and inspect. */
function TurnableObject({ finish }: { finish: (typeof FINISHES)[keyof typeof FINISHES] }) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateY = useSpring(useTransform(pointerX, [-1, 1], [-52, -8]), SPRING);
  const rotateX = useSpring(useTransform(pointerY, [-1, 1], [40, 22]), SPRING);

  return (
    <div
      className="relative my-[1rem] grid min-h-[26rem] flex-1 place-items-center"
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
        pointerY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
      }}
    >
      <div
        aria-hidden
        className="bg-ink/25 absolute bottom-[10%] h-[5%] w-[38%] rounded-[50%] blur-[1.5rem]"
      />
      <m.div
        className="relative aspect-square w-[min(24rem,56%)]"
        initial={{ opacity: 0, y: 30 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ amount: 0.4, once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <Instrument
          className="size-full"
          finish={finish}
          rotateX={rotateX}
          rotateY={rotateY}
          rotateZ={-10}
          strapPanels={3}
        />
      </m.div>
    </div>
  );
}
