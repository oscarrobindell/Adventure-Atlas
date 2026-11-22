import CopyCode from "@/components/CopyCode";
import { getGear } from "@/lib/content";

export const metadata = { title: "Gear" };

const ext = { target: "_blank", rel: "noopener noreferrer sponsored" };

export default function Page() {
  const { intro, brands } = getGear();
  return (
    <section className="px-6 md:px-12 pt-28 md:pt-36">
      <h1 className="display text-7xl md:text-9xl">Gear</h1>
      {intro && <p className="text-mist mt-6 max-w-xl leading-relaxed">{intro}</p>}
      {brands.length === 0 ? (
        <p className="text-mist mt-10">Links coming soon.</p>
      ) : (
        <div className="mt-16 border-t hairline">
          {brands.map((b) => (
            <article key={b.name} className="grid md:grid-cols-12 gap-6 py-10 border-b hairline">
              <div className="md:col-span-4">
                <h2 className="font-display text-4xl md:text-5xl">
                  <a href={b.href} {...ext} className="hover:text-ember transition-colors">{b.name} ↗</a>
                </h2>
                {b.note && <p className="text-mist mt-3 max-w-xs leading-relaxed">{b.note}</p>}
                {b.code && (
                  <div className="mt-5 flex items-center gap-3 flex-wrap">
                    <CopyCode code={b.code} />
                    {b.codeNote && <span className="text-sm text-mist">{b.codeNote}</span>}
                  </div>
                )}
              </div>
              <ul className="md:col-span-8 md:border-l hairline md:pl-8">
                {b.items.map((it) => (
                  <li key={it.name} className="border-b hairline last:border-b-0">
                    <a href={it.href} {...ext} className="group flex items-baseline justify-between gap-6 py-4">
                      <span>
                        <span className="text-lg text-bone group-hover:text-ember transition-colors">{it.name}</span>
                        {it.note && <span className="block text-sm text-mist mt-1">{it.note}</span>}
                      </span>
                      <span className="eyebrow whitespace-nowrap group-hover:text-bone">Shop ↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
          <p className="text-sm text-mist mt-8 max-w-xl">Some of these are ambassador or affiliate links. Buying through them may support me at no extra cost to you.</p>
        </div>
      )}
    </section>
  );
}
