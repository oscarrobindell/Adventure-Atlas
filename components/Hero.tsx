"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import Globe, { type GlobePin } from "./Globe";

type Item = { slug: string; title: string; country: string; year: string; type: string; color: string };

export default function Hero({ pins, journey, items, name, intro }: { pins: GlobePin[]; journey: string[]; items: Item[]; name: string; intro: string }) {
  const [focus, setFocus] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const ease = [0.16, 1, 0.3, 1] as const;
  return (
    <section className="relative h-[100svh] min-h-[640px] overflow-hidden">
      <div className="absolute inset-0 top-[30%] opacity-50 md:opacity-100 md:top-0 md:left-[28%]">
        <Globe pins={pins} journey={journey} focus={focus} onHover={setHover} />
      </div>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_70%_50%,transparent_30%,#07090b_80%)]" />

      <div className="relative z-10 h-full px-6 md:px-12 pt-28 pb-10 flex flex-col justify-between pointer-events-none">
        <div>
          <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 1 }}>
            {items.length} adventures · {new Set(items.map((i) => i.country)).size} countries
          </motion.p>
          <h1 className="display text-[18vw] md:text-[10.5vw] mt-4">
            {["A life", "on the move."].map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.08em]">
                <motion.span className={`block ${i === 1 ? "italic text-ember" : ""}`} initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.3 + i * 0.12, duration: 1.2, ease }}>
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p className="max-w-sm mt-6 text-mist leading-relaxed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 1 }}>
            {intro} <span className="text-bone">— {name}</span>
          </motion.p>
        </div>

        <motion.nav aria-label="Adventures" className="pointer-events-auto max-w-xs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }}>
          <p className="eyebrow mb-3">Spin the globe, or pick one</p>
          <ul className="border-t hairline">
            {items.map((a) => {
              const on = hover === a.slug || focus === a.slug;
              return (
                <li key={a.slug} className="border-b hairline">
                  <Link href={`/adventures/${a.slug}/`} onMouseEnter={() => setFocus(a.slug)} onMouseLeave={() => setFocus(null)}
                    onFocus={() => setFocus(a.slug)} onBlur={() => setFocus(null)}
                    className="group flex items-baseline gap-3 py-2 transition-colors">
                    <span className="font-mono text-[10px] text-mist w-9">{a.year}</span>
                    <span className="font-display text-lg transition-transform duration-500 group-hover:translate-x-1" style={{ color: on ? a.color : undefined }}>{a.title}</span>
                    <span className="ml-auto eyebrow !text-[9px]">{a.country}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </motion.nav>
      </div>

      <div className="hidden md:flex absolute bottom-8 right-6 md:right-12 z-10 eyebrow items-center gap-3">
        <span className="inline-block w-px h-10 bg-bone/40 animate-pulse" /> Scroll
      </div>
    </section>
  );
}
