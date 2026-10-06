/**
 * Line bicycle: two wheels, diamond frame, saddle, flat bar. Redrawn as strokes from the Weave
 * demo's icon (free-bicycle-icon-1054, 512px PNG) on the same geometry, so it tints with
 * `currentColor`. Decorative: always `aria-hidden`.
 */
export function BikeIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={18}
      viewBox="28 120 456 268"
    >
      <circle cx="123" cy="286" r="84" />
      <circle cx="388" cy="286" r="84" />
      {/* Chainstay, seat stay, seat tube, top tube, down tube */}
      <path d="M123 286H250M123 286L186 165M186 165L250 286M186 165H322M250 286L322 165" />
      {/* Saddle and post */}
      <path d="M140 150H196M180 150L186 165" />
      {/* Flat bar, stem, fork */}
      <path d="M296 137H336L322 165L388 286" />
      {/* Crank and pedal */}
      <path d="M250 286V311M232 311H268" />
    </svg>
  );
}
