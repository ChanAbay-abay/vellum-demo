import { cn } from "@zo-stack/ui/lib/utils";

import { EdgeWordmark } from "@/shared/ui/logo";

import { type ModelContent } from "@/widgets/model-page/model/model-content";

/**
 * The model's name as the slanted display title (DESIGN.md §3), or the Edge SVG wordmark,
 * which is never typed. `giant` sizes the type to span the stage behind the 3D bike: the
 * font size is derived from the letter count (Jost 600 caps run ~0.68em per letter), so
 * FUERZA and TERRENO both fill the width without per-model tuning.
 */
export function ModelTitle({
  content,
  giant = false,
  tone = "black",
  className
}: {
  content: Pick<ModelContent, "name" | "wordmark">;
  giant?: boolean;
  tone?: "black" | "white";
  className?: string;
}) {
  if (content.wordmark === "edge") {
    return (
      <EdgeWordmark
        alt={giant ? "" : content.name}
        className={cn(giant ? "w-full" : "w-[min(32rem,80vw)]", className)}
        tone={tone}
      />
    );
  }

  return (
    <span
      aria-hidden={giant || undefined}
      className={cn(
        "model-name font-display block leading-[0.9] font-semibold tracking-[-0.04em] whitespace-nowrap uppercase",
        giant
          ? "origin-center text-center text-[calc((100vw-2*var(--gutter))/(var(--letters)*0.68))]"
          : "lg:text-display origin-bottom-left text-[5rem]",
        className
      )}
      style={giant ? ({ "--letters": content.name.length } as React.CSSProperties) : undefined}
    >
      {content.name}
    </span>
  );
}
