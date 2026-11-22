import { place } from "@/lib/place";
import Gallery from "@/components/Gallery";
import { getAdventures } from "@/lib/content";

export const metadata = { title: "Gallery" };
const ratios = ["4/5", "3/2", "1/1", "2/3", "4/3", "3/4"];

export default function Page() {
  // Every photo from every adventure, tagged with where it was taken.
  const photos = getAdventures().flatMap((a) =>
    [a.cover, ...a.chapters.flatMap((c) => (c.image ? [c.image] : [])), ...a.gallery].map((img, i) => ({
      ...img, caption: img.caption ?? a.title, palette: a.palette, seed: `${a.slug}-${i}`,
      country: a.countries ? a.region : a.country, meta: place(a), ratio: ratios[(i + a.slug.length) % ratios.length],
    }))
  );
  return <Gallery photos={photos} />;
}
