import { useEffect, useRef } from "react";

import { cn } from "@zo-stack/ui/lib/utils";

/**
 * Animated film grain: sparse flickering specks drawn on a half-resolution canvas.
 * Only animates while visible; a single still frame for reduced-motion users.
 */
export function GrainCanvas({
  className,
  density = 0.01,
  fps = 12
}: {
  className?: string;
  density?: number;
  fps?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let lastDraw = 0;
    let visible = false;

    const drawGrain = () => {
      const { height, width } = canvas;
      const image = context.createImageData(width, height);
      for (let index = 0; index < image.data.length; index += 4) {
        if (Math.random() < density) {
          const shade = 140 + Math.random() * 115;
          image.data[index] = shade;
          image.data[index + 1] = shade;
          image.data[index + 2] = shade;
          image.data[index + 3] = 30 + Math.random() * 110;
        }
      }
      context.putImageData(image, 0, 0);
    };

    const loop = (time: number) => {
      if (!visible) return;
      frame = requestAnimationFrame(loop);
      if (time - lastDraw < 1000 / fps) return;
      lastDraw = time;
      drawGrain();
    };

    const resize = () => {
      canvas.width = Math.ceil(canvas.clientWidth / 2);
      canvas.height = Math.ceil(canvas.clientHeight / 2);
      drawGrain();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting) && !prefersReducedMotion;
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(loop);
    });

    resize();
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [density, fps]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    />
  );
}
