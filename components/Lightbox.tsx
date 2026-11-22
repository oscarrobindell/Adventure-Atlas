"use client";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import Photo from "./Photo";
import type { Img, PaletteName } from "@/lib/types";

export type LbItem = Img & { palette?: PaletteName; seed?: string; meta?: string };

export function useLightbox() {
  const [items, setItems] = useState<LbItem[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const open = useCallback((list: LbItem[], i: number) => { setItems(list); setIndex(i); }, []);
  const close = useCallback(() => setIndex(null), []);
  return { items, index, setIndex, open, close };
}

export default function Lightbox({ items, index, setIndex, close, palette = "dusk", seed = "" }: ReturnType<typeof useLightbox> & { palette?: PaletteName; seed?: string }) {
  useEffect(() => {
    if (index === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setIndex((i) => (i! + 1) % items.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i! - 1 + items.length) % items.length);
    };
    addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [index, items.length, close, setIndex]);
  const it = index !== null ? items[index] : null;
  return (
    <AnimatePresence>
      {it && (
        <motion.div role="dialog" aria-modal="true" aria-label={it.alt} className="fixed inset-0 z-[55] bg-ink/95 backdrop-blur flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <div className="flex justify-between items-center px-6 md:px-12 py-5 eyebrow">
            <span>{index! + 1} / {items.length}</span>
            <button onClick={close} className="!text-bone" autoFocus>Close ✕</button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 md:px-20 min-h-0" onClick={(e) => e.stopPropagation()}>
            <button aria-label="Previous" className="hidden md:block font-display text-4xl px-6 text-mist hover:text-bone" onClick={() => setIndex((i) => (i! - 1 + items.length) % items.length)}>←</button>
            <motion.div key={index} className="max-h-full w-full max-w-5xl aspect-[3/2]" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <Photo img={it} palette={it.palette ?? palette} seed={it.seed ?? `${seed}${index}`} />
            </motion.div>
            <button aria-label="Next" className="hidden md:block font-display text-4xl px-6 text-mist hover:text-bone" onClick={() => setIndex((i) => (i! + 1) % items.length)}>→</button>
          </div>
          <div className="px-6 md:px-12 py-6 text-center">
            <p className="font-display text-2xl">{it.caption ?? it.alt}</p>
            {it.meta && <p className="eyebrow mt-2">{it.meta}</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
