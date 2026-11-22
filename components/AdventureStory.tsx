"use client";
import { place } from "@/lib/place";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import Photo from "./Photo";
import RouteMap from "./RouteMap";
import MiniMap from "./MiniMap";
import Lightbox, { useLightbox } from "./Lightbox";
import { palettes, typeLabel } from "@/lib/palette";
import type { Adventure } from "@/lib/types";
import type { MapData } from "@/lib/map";

export default function AdventureStory({ a, next, map, minis = [] }: { a: Adventure; next: Adventure; map: MapData; minis?: (MapData | null)[] }) {
  const p = palettes[a.palette];
  const hero = useRef<HTMLDivElement>(null);
  const story = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroP } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const y = useTransform(heroP, [0, 1], ["0%", "30%"]);
  const scale = useTransform(heroP, [0, 1], [1, 1.15]);
  const fade = useTransform(heroP, [0, 0.7], [1, 0]);
  const { scrollYProgress: sp } = useScroll({ target: story, offset: ["start 60%", "end 80%"] });
  const progress = useSpring(sp, { stiffness: 80, damping: 25 });
  const lb = useLightbox();
  const isDive = a.type === "dive";

  const stats = [
    { l: "Distance", v: `${a.distanceKm.toLocaleString("en-US")} km` },
    { l: "Days", v: a.days },
    isDive ? { l: "Max depth", v: `${a.maxDepthM} m` } : { l: "Highest point", v: `${a.highestPointM.toLocaleString("en-US")} m` },
    isDive ? { l: "Nights at sea", v: a.nightsOutside } : { l: "Elevation gain", v: `${a.elevationGainM.toLocaleString("en-US")} m` },
  ];
  const shown = a.stats ?? stats;
  const chapterImgs = a.chapters.flatMap((c) => (c.image ? [c.image] : []));
  const photos = [...chapterImgs, ...a.gallery];
  const imgIndex = (i: number) => a.chapters.slice(0, i).filter((c) => c.image).length;
  const daily = a.chapters.length > 12;

  return (
    <article style={{ ["--accent" as string]: p.accent }}>
      {/* Cinematic cover */}
      <div ref={hero} className="relative h-[100svh] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y, scale }}><Photo img={a.cover} palette={a.palette} seed={a.slug} priority /></motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink" />
        <motion.div style={{ opacity: fade }} className="absolute inset-x-0 bottom-0 px-6 md:px-12 pb-16">
          <p className="eyebrow" style={{ color: p.accent }}>{typeLabel[a.type] ?? a.type} · {place(a)} · {new Date(a.date).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}</p>
          <h1 className="display text-[19vw] md:text-[13vw] mt-3">{a.title}</h1>
          <p className="font-display italic text-2xl md:text-4xl text-bone/80 mt-2 max-w-3xl">{a.subtitle}</p>
          {a.placeholder && <p className="mt-6 inline-block eyebrow border border-dashed border-bone/30 px-3 py-1">Placeholder story · swap in your own</p>}
          {a.draft && <p className="mt-6 inline-block eyebrow border border-dashed border-bone/30 px-3 py-1">Draft story · more to come</p>}
        </motion.div>
      </div>

      {/* Stats strip */}
      <dl className="grid grid-cols-2 md:grid-cols-4 px-6 md:px-12 border-y hairline">
        {shown.map((s) => (
          <div key={s.l} className="py-8 md:pr-8 border-b md:border-b-0 hairline md:[&:not(:last-child)]:border-r md:px-8 md:first:pl-0">
            <dt className="eyebrow">{s.l}</dt><dd className="display text-5xl md:text-6xl mt-3">{s.v}</dd>
          </div>
        ))}
      </dl>

      {/* Sticky map + chapters */}
      <div ref={story} className="relative grid md:grid-cols-12 gap-8 px-6 md:px-12 pt-24">
        <div className="hidden md:block md:col-span-5">
          <div className="sticky top-24">
            <p className="eyebrow mb-4">The route</p>
            <RouteMap map={map} elevation={a.elevation} progress={progress} accent={p.accent} />
          </div>
        </div>
        <div className={`md:col-span-7 md:col-start-6 pb-24 ${daily ? "space-y-24" : "space-y-40"}`}>
          {a.chapters.map((c, i) => (
            <section key={i}>
              <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-15% 0px" }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}>
                <p className="font-mono text-xs" style={{ color: p.accent }}>{c.label ?? `Day ${Math.max(1, Math.round((i / Math.max(1, a.chapters.length - 1)) * a.days))} / ${a.days}`}</p>
                <h2 className={`display mt-3 ${daily && !c.image && !minis[i] ? "text-4xl md:text-5xl" : "text-5xl md:text-7xl"}`}>{c.heading}</h2>
                {c.body && <p className="text-lg md:text-xl leading-relaxed text-bone/80 mt-6 max-w-xl first-letter:font-display first-letter:text-6xl first-letter:float-left first-letter:mr-2 first-letter:leading-[0.8]">{c.body}</p>}
                {c.bullets && (
                  <ul className="mt-6 max-w-xl space-y-3">
                    {c.bullets.map((b, j) => (
                      <li key={j} className="grid grid-cols-[1.25rem_1fr] text-lg leading-snug text-bone/80">
                        <span aria-hidden className="mt-[0.55em] h-px w-3" style={{ background: p.accent }} />{b}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
              {!c.image && minis[i] && <MiniMap map={minis[i]!} accent={p.accent} caption={c.miniMap?.caption} />}
              {c.image && (
              <motion.figure className="mt-10" initial={{ clipPath: "inset(12% 12% 12% 12%)" }} whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }} viewport={{ once: true, margin: "-10% 0px" }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}>
                <button className={`block overflow-hidden cursor-zoom-in ${c.image.portrait ? "aspect-[4/5] w-full md:w-3/5" : "w-full aspect-[16/10]"}`} onClick={() => lb.open(photos, imgIndex(i))} aria-label={`Open photo: ${c.image.alt}`}>
                  <Photo img={c.image} palette={a.palette} seed={`${a.slug}${i}`} />
                </button>
                {c.image.caption && <figcaption className="eyebrow mt-3">{c.image.caption}</figcaption>}
              </motion.figure>
              )}
            </section>
          ))}
        </div>
      </div>

      {/* Mobile map */}
      <div className="md:hidden px-6 pb-16"><p className="eyebrow mb-4">The route</p><RouteMap map={map} elevation={a.elevation} progress={progress} accent={p.accent} /></div>

      {/* Contact sheet */}
      {a.gallery.length > 0 && (
        <section className="px-6 md:px-12 py-16 border-t hairline">
          <p className="eyebrow mb-6">Contact sheet</p>
          <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x">
            {a.gallery.map((g, i) => (
              <button key={i} onClick={() => lb.open(photos, chapterImgs.length + i)} className="snap-start shrink-0 w-[70vw] md:w-[28vw] text-left cursor-zoom-in group">
                <div className="aspect-[4/5] overflow-hidden"><div className="w-full h-full transition-transform duration-1000 group-hover:scale-105"><Photo img={g} palette={a.palette} seed={`${a.slug}g${i}`} /></div></div>
                <p className="eyebrow mt-2">{g.caption}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Next */}
      <Link href={`/adventures/${next.slug}/`} className="group relative block h-[70vh] overflow-hidden mt-16">
        <div className="absolute inset-0 transition-transform duration-[2s] group-hover:scale-105"><Photo img={next.cover} palette={next.palette} seed={next.slug} /></div>
        <div className="absolute inset-0 bg-ink/50 group-hover:bg-ink/30 transition-colors duration-700" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="eyebrow !text-bone">Next adventure</p>
          <p className="display text-7xl md:text-[10vw] mt-4">{next.title}</p>
          <p className="eyebrow mt-4" style={{ color: palettes[next.palette].accent }}>{next.country} →</p>
        </div>
      </Link>
      <Lightbox {...lb} palette={a.palette} seed={a.slug} />
    </article>
  );
}
