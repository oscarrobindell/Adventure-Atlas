"use client";
import { motion, useTransform, type MotionValue } from "motion/react";
import { useMemo } from "react";

/** Draws the route as you scroll. `progress` is 0–1. */
export default function RouteMap({ route, elevation, progress, accent, unit = "m" }: {
  route: [number, number][]; elevation: number[]; progress: MotionValue<number>; accent: string; unit?: string;
}) {
  const W = 600, H = 460, pad = 50;
  const { d, pts } = useMemo(() => {
    const lats = route.map((p) => p[0]), lngs = route.map((p) => p[1]);
    const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const k = Math.cos((midLat * Math.PI) / 180);
    const xs = lngs.map((l) => l * k), ys = lats;
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const s = Math.min((W - pad * 2) / (x1 - x0 || 1), (H - pad * 2) / (y1 - y0 || 1));
    const ox = (W - (x1 - x0) * s) / 2, oy = (H - (y1 - y0) * s) / 2;
    const pts = route.map((_, i) => [ox + (xs[i] - x0) * s, H - (oy + (ys[i] - y0) * s)] as [number, number]);
    // Smooth Catmull-Rom → Bézier.
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
      d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return { d, pts };
  }, [route]);

  const contours = useMemo(() => Array.from({ length: 5 }, (_, i) => {
    const cx = W * [0.18, 0.78, 0.5, 0.22, 0.82][i], cy = H * [0.25, 0.3, 0.55, 0.8, 0.82][i];
    return Array.from({ length: 4 }, (_, j) => {
      const r = 14 + j * 18;
      const p = Array.from({ length: 24 }, (_, t) => {
        const a = (t / 24) * Math.PI * 2, w = 1 + 0.18 * Math.sin(a * 3 + i + j * 0.6);
        return `${(cx + Math.cos(a) * r * w * 1.3).toFixed(1)},${(cy + Math.sin(a) * r * w).toFixed(1)}`;
      });
      return `M${p.join("L")}Z`;
    });
  }).flat(), []);

  const loop = Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 12;
  // Elevation profile
  const EW = 600, EH = 90;
  const lo = Math.min(...elevation), hi = Math.max(...elevation);
  const ep = elevation.map((e, i) => [(i / (elevation.length - 1)) * EW, EH - 8 - ((e - lo) / (hi - lo || 1)) * (EH - 24)]);
  const eLine = "M" + ep.map((p) => p.join(",")).join("L");
  const clip = useTransform(progress, (v) => `inset(0 ${100 - v * 100}% 0 0)`);
  const current = useTransform(progress, (v) => {
    const f = v * (elevation.length - 1), i = Math.floor(f), t = f - i;
    return Math.round(elevation[i] + ((elevation[i + 1] ?? elevation[i]) - elevation[i]) * t).toLocaleString("en-US") + " " + unit;
  });

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Route map">
        <g stroke="#efe9df" strokeOpacity="0.06" fill="none">{contours.map((c, i) => <path key={i} d={c} />)}</g>
        <path d={d} fill="none" stroke="#efe9df" strokeOpacity="0.15" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
        <motion.path d={d} fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" style={{ pathLength: progress }} />
        {(loop ? [pts[0]] : [pts[0], pts[pts.length - 1]]).map((p, i) => (
          <g key={i}><circle cx={p[0]} cy={p[1]} r="6" fill="#07090b" stroke={accent} strokeWidth="2" />
            <text x={p[0] + 12} y={p[1] + 4} fill="#9aa3a8" fontSize="11" fontFamily="var(--font-mono)" letterSpacing="2">{loop ? "START · FINISH" : i ? "FINISH" : "START"}</text></g>
        ))}
      </svg>
      <div className="mt-4">
        <div className="flex justify-between eyebrow mb-2"><span>Elevation</span><motion.span className="text-bone">{current}</motion.span></div>
        <div className="relative">
          <svg viewBox={`0 0 ${EW} ${EH}`} className="w-full block" preserveAspectRatio="none" aria-hidden>
            <path d={`${eLine}L${EW},${EH}L0,${EH}Z`} fill="#efe9df" fillOpacity="0.05" />
            <path d={eLine} fill="none" stroke="#efe9df" strokeOpacity="0.25" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
          <motion.svg viewBox={`0 0 ${EW} ${EH}`} className="w-full block absolute inset-0" preserveAspectRatio="none" style={{ clipPath: clip }} aria-hidden>
            <path d={`${eLine}L${EW},${EH}L0,${EH}Z`} fill={accent} fillOpacity="0.18" />
            <path d={eLine} fill="none" stroke={accent} strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </motion.svg>
        </div>
      </div>
    </div>
  );
}
