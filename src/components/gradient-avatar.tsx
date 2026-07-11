import { cn } from "../lib/utils";

const PALETTE = [
  "from-brand to-amber-600",
  "from-neutral-700 to-neutral-900",
  "from-teal-500 to-emerald-600",
  "from-indigo-500 to-violet-600",
  "from-rose-400 to-orange-500",
  "from-sky-500 to-blue-600",
];

function hashIndex(seed: string, len: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % len;
}

const SIZES = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
} as const;

export function GradientAvatar({
  name,
  initials,
  size = "md",
  className,
}: {
  name: string;
  initials?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const gradient = PALETTE[hashIndex(name, PALETTE.length)];
  const text =
    initials ??
    name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-bold text-white shadow-sm",
        gradient,
        SIZES[size],
        className,
      )}
    >
      {text}
    </span>
  );
}
