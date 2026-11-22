import Link from "next/link";
import Photo from "./Photo";
import { palettes, typeLabel } from "@/lib/palette";
import type { Adventure } from "@/lib/types";

export default function AdventureCard({ a, index, tall = false }: { a: Adventure; index: number; tall?: boolean }) {
  return (
    <Link href={`/adventures/${a.slug}/`} className="group block">
      <div className={`relative overflow-hidden ${tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
        <div className="absolute inset-0 transition-transform duration-[1.6s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]">
          <Photo img={a.cover} palette={a.palette} seed={a.slug} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
        <span className="absolute top-4 left-4 font-mono text-xs">{String(index + 1).padStart(2, "0")}</span>
        <span className="absolute top-4 right-4 eyebrow !text-bone/80 border border-bone/30 rounded-full px-3 py-1">{typeLabel[a.type] ?? a.type}</span>
        <div className="absolute bottom-0 inset-x-0 p-5">
          <p className="eyebrow" style={{ color: palettes[a.palette].accent }}>{a.region}, {a.country} · {a.date.slice(0, 4)}</p>
          <h3 className="display text-4xl md:text-5xl mt-2">{a.title}</h3>
        </div>
      </div>
      <div className="flex justify-between mt-3 text-sm text-mist">
        <span>{a.subtitle}</span>
        <span className="font-mono text-xs whitespace-nowrap pl-4">{a.distanceKm.toLocaleString("en-US")} km</span>
      </div>
    </Link>
  );
}
