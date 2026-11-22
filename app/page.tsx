import Link from "next/link";
import Hero from "@/components/Hero";
import Counter from "@/components/Counter";
import Reveal from "@/components/Reveal";
import AdventureCard from "@/components/AdventureCard";
import { getAdventures, getProfile, getStats } from "@/lib/content";
import { palettes, typeLabel } from "@/lib/palette";

export default function Home() {
  const adventures = getAdventures();
  const profile = getProfile();
  const s = getStats(adventures);

  const pins = [
    ...adventures.map((a) => ({ id: a.slug, title: a.title, sub: `${a.countries ? a.region : a.country} · ${a.date.slice(0, 4)}`, lat: a.coords[0], lng: a.coords[1], color: palettes[a.palette].accent, href: `/adventures/${a.slug}/` })),
  ];
  const journey = [...adventures].reverse().map((a) => a.slug);

  const stats = [
    { v: s.countries, l: "Countries" },
    { v: s.km, l: "Kilometres travelled", suffix: "" },
    { v: s.climbed, l: "Metres climbed" },
    { v: s.days, l: "Days travelling" },
    { v: s.nightsOutside, l: "Nights camping" },
    { v: s.highest, l: "Highest point (m)" },
  ].filter((x) => x.v > (x.l.startsWith("Highest") ? 1000 : 0));

  return (
    <>
      <Hero pins={pins} journey={journey} quote={profile.quote} quoteBy={profile.quoteBy}
        countries={s.countries} items={adventures.map((a) => ({ slug: a.slug, title: a.title, country: a.countries ? a.region : a.country, year: a.date.slice(0, 4), type: a.type, color: palettes[a.palette].accent }))} />

      {/* Stats */}
      <section className="px-6 md:px-12 py-32" aria-labelledby="stats-h">
        <Reveal><p className="eyebrow" id="stats-h">So far</p></Reveal>
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
          <Reveal><h2 id="stories-h" className="display text-6xl md:text-9xl">Trips</h2></Reveal>
          <Link href="/timeline/" className="eyebrow hover:text-bone">See the timeline →</Link>
        </div>
        <div className="grid md:grid-cols-12 gap-x-8 gap-y-20">
          {adventures.map((a, i) => (
            <Reveal key={a.slug} className={i % 2 ? "md:col-span-5 md:mt-48" : "md:col-span-7"}>
              <AdventureCard a={a} index={i} tall={i % 2 === 1} />
            </Reveal>
          ))}
        </div>
      </section>

    </>
  );
}
