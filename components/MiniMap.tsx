"use client";
import { motion } from "motion/react";
import { useId } from "react";
import type { MapData } from "@/lib/map";

const dash: Record<string, string | undefined> = { boat: "7 6", plane: "2 7" };

/** A small map of one day's journey, used where there is no photo. Draws its route when scrolled into view. */
export default function MiniMap({ map, accent, caption }: { map: MapData; accent: string; caption?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <figure className="mt-10">
      <div className="w-full aspect-[16/10] overflow-hidden bg-bone/[0.03] ring-1 ring-bone/10">
        <svg viewBox={`0 0 ${map.w} ${map.h}`} className="w-full h-full" role="img" aria-label={`Map: ${map.stops.map((s) => s.name).join(", ")}`}>
          <defs>
            <radialGradient id={`${uid}v`} cx="50%" cy="50%" r="75%">
              <stop offset="60%" stopColor="#061520" stopOpacity="0" />
              <stop offset="100%" stopColor="#061520" stopOpacity="0.55" />
            </radialGradient>
          </defs>
          <path d={map.land} fill="#e6f1ee" fillOpacity="0.08" stroke="#e6f1ee" strokeOpacity="0.28" strokeWidth="0.8" />
          <path d={map.borders} fill="none" stroke="#e6f1ee" strokeOpacity="0.18" strokeWidth="0.7" strokeDasharray="3 3" />
          {map.legs.map((l, i) => (
            <g key={i}>
              <path d={l.d} fill="none" stroke="#e6f1ee" strokeOpacity="0.12" strokeWidth="2.6" strokeDasharray={dash[l.mode]} strokeLinecap="round" />
              <mask id={`${uid}m${i}`} maskUnits="userSpaceOnUse">
                <motion.path d={l.d} fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, margin: "-20% 0px" }}
                  transition={{ duration: 1.8, ease: [0.65, 0, 0.35, 1], delay: 0.2 }} />
              </mask>
              <path d={l.d} fill="none" stroke={accent} strokeWidth="2.6" strokeDasharray={dash[l.mode]} strokeLinecap="round" strokeLinejoin="round" mask={`url(#${uid}m${i})`} />
            </g>
          ))}
          <rect width={map.w} height={map.h} fill={`url(#${uid}v)`} />
          {map.stops.map((s, i) => (
            <g key={i}>
              <circle cx={s.x} cy={s.y} r="5" fill="#061520" stroke={accent} strokeWidth="2" />
              <text x={s.x + (s.anchor === "end" ? -11 : 11)} y={s.y + 4} textAnchor={s.anchor} fill="#e6f1ee" fillOpacity="0.85" fontSize="12.5"
                fontFamily="var(--font-mono)" letterSpacing="1.4" stroke="#061520" strokeWidth="3.5" paintOrder="stroke">{s.name.toUpperCase()}</text>
            </g>
          ))}
        </svg>
      </div>
      {caption && <figcaption className="eyebrow mt-3">{caption}</figcaption>}
    </figure>
  );
}
