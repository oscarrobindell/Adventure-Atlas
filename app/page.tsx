import Link from "next/link";
import Hero from "@/components/Hero";
import Counter from "@/components/Counter";
import Reveal from "@/components/Reveal";
import AdventureCard from "@/components/AdventureCard";
import { getAdventures, getBucketList, getProfile, getStats } from "@/lib/content";
import { palettes, typeLabel } from "@/lib/palette";

export default function Home() {
  const adventures = getAdventures();
  const bucket = getBucketList();
  const profile = getProfile();
  const s = getStats(adventures);

  const pins = [
    ...adventures.map((a) => ({ id: a.slug, title: a.title, sub: `${a.countries ? a.region : a.country} · ${a.date.slice(0, 4)}`, lat: a.coords[0], lng: a.coords[1], color: palettes[a.palette].accent, href: `/adventures/${a.slug}/` })),
    ...bucket.map((b) => ({ id: `dream-${b.title}`, title: b.title, sub: `${b.country} · ${b.when}`, lat: b.coords[0], lng: b.coords[1], color: "#8ea9ad", dream: true })),
  ];
  const journey = [...adventures].reverse().map((a) => a.slug);

  const stats = [
    { v: s.countries, l: "Countries" },
    { v: s.km, l: "Kilometres travelled", suffix: "" },
    { v: s.climbed, l: "Metres climbed" },
    { v: s.days, l: "Days out there" },
    { v: s.nightsOutside, l: "Nights under the stars" },
    { v: s.highest, l: "Highest point (m)" },
  ].filter((x) => x.v > (x.l.startsWith("Highest") ? 1000 : 0));

  return (
    <>
      <Hero pins={pins} journey={journey} name={profile.name} intro={profile.intro}
        countries={s.countries} items={adventures.map((a) => ({ slug: a.slug, title: a.title, country: a.countries ? a.region : a.country, year: a.date.slice(0, 4), type: a.type, color: palettes[a.palette].accent }))} />

      {/* Stats */}
      <section className="px-6 md:px-12 py-32" aria-labelledby="stats-h">
        <Reveal><p className="eyebrow" id="stats-h">The tally so far</p></Reveal>
        <dl className="grid grid-cols-2 md:grid-cols-3 border-t hairline mt-6">
          {stats.map((x, i) => (
            <Reveal key={x.l} delay={i * 0.06} className="border-b hairline md:[&:not(:nth-child(3n))]:border-r py-10 md:px-8 md:[&:nth-child(3n+1)]:pl-0">
              <dt className="eyebrow">{x.l}</dt>
              <dd className="display text-6xl md:text-8xl mt-4"><Counter value={x.v} /></dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Stories */}
      <section className="px-6 md:px-12" aria-labelledby="stories-h">
        <div className="flex items-end justify-between mb-12">
          <Reveal><h2 id="stories-h" className="display text-6xl md:text-9xl">Field<br /><span className="italic text-ember">notes</span></h2></Reveal>
          <Link href="/timeline/" className="eyebrow hover:text-bone">All on the timeline →</Link>
        </div>
        <div className="grid md:grid-cols-12 gap-x-8 gap-y-20">
          {adventures.map((a, i) => (
            <Reveal key={a.slug} className={i % 2 ? "md:col-span-5 md:mt-48" : "md:col-span-7"}>
              <AdventureCard a={a} index={i} tall={i % 2 === 1} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Bucket list */}
      <section className="px-6 md:px-12 pt-40" aria-labelledby="bucket-h">
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <Reveal>
              <p className="eyebrow">Bucket list</p>
              <h2 id="bucket-h" className="display text-6xl md:text-8xl mt-4">Not <span className="italic text-mist">yet.</span></h2>
              <p className="text-mist mt-6 max-w-xs leading-relaxed">The faded pins on the globe. Places that are already pulling at me.</p>
            </Reveal>
          </div>
          <ol className="md:col-span-8 border-t hairline">
            {bucket.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.05}>
                <li className="group grid grid-cols-12 gap-4 items-baseline py-6 border-b hairline border-dashed">
                  <span className="col-span-2 md:col-span-1 font-mono text-xs text-mist">{String(i + 1).padStart(2, "0")}</span>
                  <div className="col-span-10 md:col-span-7">
                    <p className="font-display text-3xl md:text-4xl text-bone/60 group-hover:text-bone transition-colors">{b.title}</p>
                    <p className="text-sm text-mist mt-1">{b.note}</p>
                  </div>
                  <span className="hidden md:block md:col-span-2 eyebrow">{typeLabel[b.type] ?? b.type}</span>
                  <span className="hidden md:block md:col-span-2 eyebrow text-right">{b.country} · {b.when}</span>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
