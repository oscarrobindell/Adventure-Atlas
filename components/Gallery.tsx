"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Photo from "./Photo";
import Lightbox, { useLightbox, type LbItem } from "./Lightbox";

export default function Gallery({ photos }: { photos: (LbItem & { country: string; ratio: string })[] }) {
  const places = useMemo(() => ["Everywhere", ...new Set(photos.map((p) => p.country))], [photos]);
  const [place, setPlace] = useState("Everywhere");
  const shown = photos.filter((p) => place === "Everywhere" || p.country === place);
  const lb = useLightbox();
  return (
    <section className="px-6 md:px-12 pt-28">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
        <h1 className="display text-7xl md:text-9xl">Gal<span className="italic text-ember">lery</span></h1>
        <div role="group" aria-label="Filter by place" className="flex flex-wrap gap-2">
          {places.map((t) => (
            <button key={t} onClick={() => setPlace(t)} aria-pressed={place === t}
              className={`eyebrow rounded-full border px-4 py-2 transition-colors ${place === t ? "bg-bone !text-ink border-bone" : "border-bone/25 hover:border-bone"}`}>{t}</button>
          ))}
        </div>
      </div>
      <motion.div layout className="columns-2 md:columns-3 xl:columns-4 gap-4">
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => (
            <motion.button layout key={p.seed} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => lb.open(shown, i)} aria-label={`Open photo: ${p.alt}`}
              className="group relative mb-4 block w-full overflow-hidden break-inside-avoid cursor-zoom-in" style={{ aspectRatio: p.ratio }}>
              <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105"><Photo img={p} palette={p.palette!} seed={p.seed!} /></div>
              <div className="absolute inset-x-0 bottom-0 p-3 text-left bg-gradient-to-t from-ink/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="font-display text-lg">{p.caption}</p><p className="eyebrow">⌖ {p.meta}</p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
      <Lightbox {...lb} />
    </section>
  );
}
