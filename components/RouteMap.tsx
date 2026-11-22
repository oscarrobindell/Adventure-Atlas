"use client";
import { motion, useTransform, type MotionValue } from "motion/react";
import { useId } from "react";
import type { MapData } from "@/lib/map";

const style: Record<string, { dash?: string; width: number; label: string; muted?: boolean }> = {
  car: { width: 2.6, label: "By road" },
  trail: { width: 2.6, label: "On foot" },
  boat: { dash: "7 6", width: 2.4, label: "By boat" },
  plane: { dash: "2 7", width: 2.2, label: "By air", muted: true },
};

function Leg({ leg, progress, accent, id }: { leg: MapData["legs"][number]; progress: MotionValue<number>; accent: string; id: string }) {
  const s = style[leg.mode] ?? style.trail;
  const len = useTransform(progress, (p) => Math.max(0, Math.min(1, (p - leg.from) / Math.max(0.0001, leg.to - leg.from))));
  return (
    <g>
      <mask id={id} maskUnits="userSpaceOnUse">
        <motion.path d={leg.d} fill="none" stroke="#fff" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: len }} />
      </mask>
      <path d={leg.d} fill="none" stroke="#efe9df" strokeOpacity="0.14" strokeWidth={s.width} strokeDasharray={s.dash} strokeLinecap="round" strokeLinejoin="round" />
      <path d={leg.d} fill="none" stroke={s.muted ? "#efe9df" : accent} strokeWidth={s.width} strokeDasharray={s.dash} strokeLinecap="round" strokeLinejoin="round" mask={`url(#${id})`} />
    </g>
  );
}

/** A real map of the route (coastlines, borders, each leg by its travel mode) that draws itself as you scroll. */
export default function RouteMap({ map, elevation, progress, accent, unit = "m" }: {
  map: MapData; elevation: number[]; progress: MotionValue<number>; accent: string; unit?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const modes = [...new Set(map.legs.map((l) => l.mode))];
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${map.w} ${map.h}`} className="w-full" role="img" aria-label={`Route map through ${map.stops.map((s) => s.name).join(", ")}`}>
        <defs>
          <clipPath id={`${uid}c`}><rect width={map.w} height={map.h} rx="2" /></clipPath>
        </defs>
        <g clipPath={`url(#${uid}c)`}>
          <path d={map.land} fill="#efe9df" fillOpacity="0.07" stroke="#efe9df" strokeOpacity="0.22" strokeWidth="0.7" />
          <path d={map.borders} fill="none" stroke="#efe9df" strokeOpacity="0.16" strokeWidth="0.6" strokeDasharray="3 3" />
          {map.legs.map((l, i) => <Leg key={i} leg={l} progress={progress} accent={accent} id={`${uid}m${i}`} />)}
          {map.stops.map((s, i) => (
            <g key={i}>
              <circle cx={s.x} cy={s.y} r="4" fill="#07090b" stroke={accent} strokeWidth="1.8" />
              <text x={s.x + (s.anchor === "end" ? -9 : 9)} y={s.y + 3.5} textAnchor={s.anchor} fill="#efe9df" fillOpacity="0.75" fontSize="10.5" fontFamily="var(--font-mono)" letterSpacing="1.2"
                stroke="#07090b" strokeWidth="3" paintOrder="stroke">{s.name.toUpperCase()}</text>
            </g>
          ))}
        </g>
      </svg>
      {modes.length > 1 && (
        <ul className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
          {modes.map((m) => (
            <li key={m} className="eyebrow flex items-center gap-2">
              <svg width="28" height="6" aria-hidden><line x1="1" y1="3" x2="27" y2="3" stroke={style[m]?.muted ? "#efe9df" : accent} strokeWidth="2.4" strokeDasharray={style[m]?.dash} strokeLinecap="round" /></svg>
              {style[m]?.label ?? m}
            </li>
          ))}
        </ul>
      )}
      {elevation.length > 1 && <Elevation elevation={elevation} progress={progress} accent={accent} unit={unit} />}
    </div>
  );
}

function Elevation({ elevation, progress, accent, unit }: { elevation: number[]; progress: MotionValue<number>; accent: string; unit: string }) {
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
  );
}
