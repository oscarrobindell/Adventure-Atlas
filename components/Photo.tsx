import { palettes } from "@/lib/palette";
import type { Img, PaletteName } from "@/lib/types";

/** Shows your photo when `src` is set; until then draws a generative landscape in the adventure's palette. */
export default function Photo({ img, palette, seed, className = "", priority = false }: {
  img: Img; palette: PaletteName; seed: string; className?: string; priority?: boolean;
}) {
  if (img.src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={img.src} alt={img.alt} loading={priority ? "eager" : "lazy"} className={`w-full h-full object-cover ${className}`} />;
  }
  return <Scene palette={palette} seed={seed + img.alt} label={img.alt} className={className} />;
}

function rng(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 3432918353), (h = (h << 13) | (h >>> 19));
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}

export function Scene({ palette, seed, label, className = "" }: { palette: PaletteName; seed: string; label: string; className?: string }) {
  const p = palettes[palette];
  const r = rng(seed);
  const W = 1600, H = 1000;
  const water = palette === "ocean";
  const id = "s" + Math.floor(r() * 1e9).toString(36);
  const sunX = 250 + r() * 1100, sunY = water ? 120 + r() * 120 : 330 + r() * 230;

  const ridges = p.ridges.map((fill, i) => {
    const base = water ? 420 + i * 150 : 470 + i * 130 + r() * 40;
    const amp = water ? 18 + i * 8 : 260 - i * 45;
    const pts: string[] = [];
    let y = base - r() * amp;
    const step = water ? 40 : 55 + i * 15;
    for (let x = -50; x <= W + 50; x += step) {
      y += (r() - 0.5) * amp * (water ? 0.6 : 0.9);
      y = Math.min(base + amp * 0.3, Math.max(base - amp, y));
      pts.push(`${x},${y.toFixed(1)}`);
    }
    return <polygon key={i} points={`-50,${H} ${pts.join(" ")} ${W + 50},${H}`} fill={fill} opacity={water ? 0.92 : 1} />;
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${label} (placeholder art)`} className={`w-full h-full block ${className}`}>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1={water ? "1" : "0"} x2="0" y2={water ? "0" : "1"}>
          <stop offset="0" stopColor={p.sky[0]} /><stop offset="1" stopColor={p.sky[1]} />
        </linearGradient>
        <radialGradient id={`${id}s`}><stop offset="0" stopColor={p.sun} stopOpacity="0.95" /><stop offset="0.25" stopColor={p.sun} stopOpacity="0.35" /><stop offset="1" stopColor={p.sun} stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}g)`} />
      {!water && Array.from({ length: 60 }, (_, i) => (
        <circle key={i} cx={r() * W} cy={r() * 380} r={r() * 1.4 + 0.3} fill="#fff" opacity={r() * 0.5} />
      ))}
      <circle cx={sunX} cy={sunY} r={water ? 520 : 380} fill={`url(#${id}s)`} />
      {!water && <circle cx={sunX} cy={sunY} r={38 + r() * 30} fill={p.sun} opacity="0.9" />}
      {water && Array.from({ length: 7 }, (_, i) => (
        <polygon key={i} points={`${sunX - 30 - i * 60},0 ${sunX + 30 - i * 60 + 40},0 ${sunX + 260 - i * 110},${H} ${sunX + 120 - i * 110},${H}`} fill={p.sun} opacity="0.05" />
      ))}
      {ridges}
      <rect width={W} height={H} fill={`url(#${id}g)`} opacity="0.12" style={{ mixBlendMode: "overlay" }} />
    </svg>
  );
}
