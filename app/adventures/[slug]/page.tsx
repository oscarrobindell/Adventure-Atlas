import { notFound } from "next/navigation";
import AdventureStory from "@/components/AdventureStory";
import { getAdventure, getAdventures } from "@/lib/content";

export const generateStaticParams = () => getAdventures().map((a) => ({ slug: a.slug }));
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = getAdventure((await params).slug);
  return a ? { title: a.title, description: a.subtitle } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const all = getAdventures();
  const i = all.findIndex((a) => a.slug === slug);
  if (i < 0) notFound();
  return <AdventureStory a={all[i]} next={all[(i + 1) % all.length]} />;
}
