"use client";
import { place } from "@/lib/place";
import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import Photo from "./Photo";
import { palettes, typeLabel } from "@/lib/palette";
import type { Adventure } from "@/lib/types";

/** Vertical scroll drives a horizontal film strip of adventures. The year rail is a scrubber. */
export default function Timeline({ adventures }: { adventures: Adventure[] }) {
  const types = useMemo(() => ["all", ...new Set(adventures.map((a) => a.type))], [adventures]);
  const [filter, setFilter] = useState("all");
  const list = useMemo(() => [...adventures].reverse().filter((a) => filter === "all" || a.type === filter), [adventures, filter]);

  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  useLayoutEffect(() => {
    const m = () => setDist(Math.max(0, (track.current?.scrollWidth ?? 0) - innerWidth));
    m(); addEventListener("resize", m); return () => removeEventListener("resize", m);
  }, [list]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const x = useTransform(smooth, (v) => -v * dist);
  const bar = useTransform(smooth, (v) => `${v * 100}%`);

  const years = [...new Set(list.map((a) => a.date.slice(0, 4)))];
  const jump = (f: number) => {
    const el = section.current!; const top = el.offsetTop, h = el.offsetHeight - innerHeight;
    scrollTo({ top: top + f * h, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <section ref={section} style={{ height: `calc(100vh + ${dist}px)` }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
        <div className="px-6 md:px-12 pt-28 flex flex-wrap items-end justify-between gap-6">
          <h1 className="display text-7xl md:text-9xl">Time<span className="italic text-ember">line</span></h1>
          <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button key={t} onClick={() => { setFilter(t); jump(0); }} aria-pressed={filter === t}
                className={`eyebrow rounded-full border px-4 py-2 transition-colors ${filter === t ? "bg-bone !text-ink border-bone" : "border-bone/25 hover:border-bone"}`}>
                {t === "all" ? "All" : typeLabel[t] ?? t}
              </button>
            ))}
          </div>
        </div>

        <motion.div ref={track} style={{ x }} className="flex-1 flex items-center gap-10 md:gap-16 px-6 md:px-12 w-max">
          {list.map((a, i) => {
            const newYear = i === 0 || list[i - 1].date.slice(0, 4) !== a.date.slice(0, 4);
            return (
              <div key={a.slug} className="flex items-center gap-10 md:gap-16">
                {newYear && <p className="display text-[22vh] text-transparent [-webkit-text-stroke:1px_rgba(230,241,238,.35)] select-none">{a.date.slice(0, 4)}</p>}
                <Link href={`/adventures/${a.slug}/`} className={`group block w-[72vw] md:w-[32vw] ${i % 2 ? "self-end mb-[6vh]" : "self-start mt-[4vh]"}`}>
                  <div className="aspect-[4/3] overflow-hidden"><div className="w-full h-full transition-transform duration-[1.4s] group-hover:scale-105"><Photo img={a.cover} palette={a.palette} seed={a.slug} /></div></div>
                  <p className="eyebrow mt-4" style={{ color: palettes[a.palette].accent }}>{new Date(a.date).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })} · {typeLabel[a.type]}</p>
                  <p className="display text-4xl md:text-5xl mt-2">{a.title}</p>
                  <p className="text-mist text-sm mt-1">{place(a)} · {a.days} days · {a.distanceKm.toLocaleString("en-US")} km</p>
                </Link>
              </div>
            );
          })}
          <div className="w-[20vw] shrink-0 eyebrow">To be continued →</div>
        </motion.div>

        {/* Scrubber */}
        <div className="px-6 md:px-12 pb-8">
          <div className="relative h-8 cursor-pointer" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); jump((e.clientX - r.left) / r.width); }}
            role="slider" aria-label="Scrub timeline" aria-valuemin={0} aria-valuemax={100} tabIndex={0}
            onKeyDown={(e) => { if (e.key === "ArrowRight") scrollBy({ top: innerHeight / 2 }); if (e.key === "ArrowLeft") scrollBy({ top: -innerHeight / 2 }); }}>
            <div className="absolute top-1/2 inset-x-0 h-px bg-bone/20" />
            <motion.div className="absolute top-1/2 left-0 h-px bg-ember" style={{ width: bar }} />
            {years.map((y, i) => (
              <span key={y} className={`absolute top-0 eyebrow ${i === 0 ? "" : i === years.length - 1 ? "-translate-x-full" : "-translate-x-1/2"}`} style={{ left: `${years.length > 1 ? (i / (years.length - 1)) * 100 : 0}%` }}>{y}</span>
            ))}
            <motion.span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-ember shadow-[0_0_20px_var(--color-ember)]" style={{ left: bar }} />
          </div>
        </div>
      </div>
    </section>
  );
}
