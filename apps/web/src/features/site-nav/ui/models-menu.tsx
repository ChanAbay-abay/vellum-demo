import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@zo-stack/ui/components/dropdown-menu";
import { Picture } from "@zo-stack/ui/components/picture";
import { cn } from "@zo-stack/ui/lib/utils";

import edgeThumb from "@/shared/assets/images/edge/edge-gen2-crop.jpg?responsive";
import fuerzaThumb from "@/shared/assets/images/fuerza/retro-greige/fuerza-retro-greige-bike.jpg?responsive";
import terrenoThumb from "@/shared/assets/images/terreno/terreno-mtb-ugc.jpg?responsive";

import { NAV_TRIGGER } from "@/features/site-nav/ui/nav-trigger";

import { NAV } from "@/config/layout.content";

/** Keyed by the item's route, so a reordered config can't mismatch thumbs */
const THUMBS = {
  "/models/fuerza": fuerzaThumb,
  "/models/edge": edgeThumb,
  "/models/terreno": terrenoThumb
} as const;

// The primitive paints the highlighted item (and its descendants) in accent colours; the bone fill keeps ink text.
const ITEM =
  "flex cursor-pointer items-center gap-[1rem] rounded-[1rem] p-[0.5rem] outline-hidden transition-colors duration-200 focus:bg-bone focus:text-ink not-data-[variant=destructive]:focus:**:text-current";

/**
 * "Catalogue ▾": Radix dropdown (arrow keys, Esc, focus return, aria-expanded) listing the three
 * models with a small thumb each, then "All models" and "Merch". Non-modal, so opening it doesn't lock
 * page scroll under Lenis. Same frosted paper as the pill instead of a shadow or border.
 */
export function ModelsMenu({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <DropdownMenu modal={false} onOpenChange={onOpenChange} open={open}>
      <DropdownMenuTrigger className={cn(NAV_TRIGGER, "group/models")}>
        {NAV.models.label}
        <ChevronDown
          aria-hidden
          className="size-[0.9rem] transition-transform duration-200 group-data-[state=open]/models:rotate-180"
          strokeWidth={1.5}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-paper/90 text-ink w-[22rem] rounded-[1.5rem] p-[0.5rem] shadow-none ring-0 backdrop-blur-md"
        sideOffset={20}
      >
        {NAV.models.items.map((item) => (
          <DropdownMenuItem key={item.to} asChild className={ITEM}>
            <Link to={item.to}>
              <Picture
                alt=""
                className="bg-bone block h-[3.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-[0.75rem]"
                image={THUMBS[item.to]}
                imgClassName="size-full object-cover"
                sizes="72px"
              />
              <span className="flex flex-col gap-[0.25rem]">
                <span className="text-label">{item.label}</span>
                <span className="text-caption text-muted-foreground">{item.line}</span>
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
        {[NAV.models.all, NAV.models.merch].map((link) => (
          <DropdownMenuItem
            key={link.to}
            asChild
            className={cn(ITEM, "text-label justify-between px-[1rem] py-[1rem]")}
          >
            <Link to={link.to}>
              {link.label}
              <span aria-hidden>→</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
