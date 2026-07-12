export function AngularCornerBackground({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      className={`absolute inset-0 h-full w-full ${className}`}
    >
      <rect width="1200" height="800" fill="#ffffff" />
      <polygon points="0,0 360,0 0,320" fill="#111111" />
      <polygon points="0,0 210,0 0,180" fill="#F4C430" />
      <polygon points="1200,0 840,0 1200,300" fill="#F4C430" />
      <polygon points="1200,0 1010,0 1200,160" fill="#111111" />
      <polygon points="0,800 330,800 0,540" fill="#111111" />
      <polygon points="0,800 170,800 0,650" fill="#F4C430" />
      <polygon points="1200,800 830,800 1200,520" fill="#111111" />
      <polygon points="1200,800 1030,800 1200,650" fill="#F4C430" />
    </svg>
  );
}
