import fs from "node:fs";
import path from "node:path";
import type { Adventure, BucketItem, Profile } from "./types";

const root = path.join(process.cwd(), "content");
const read = <T,>(p: string): T => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));

/** Every JSON file in content/adventures becomes an adventure page. Newest first. */
export function getAdventures(): Adventure[] {
  return fs
    .readdirSync(path.join(root, "adventures"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => read<Adventure>(`adventures/${f}`))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const getAdventure = (slug: string) => getAdventures().find((a) => a.slug === slug);
export const getBucketList = () => read<BucketItem[]>("bucket-list.json");
export const getProfile = () => read<Profile>("profile.json");

export function getStats(list = getAdventures()) {
  return {
    adventures: list.length,
    countries: new Set(list.flatMap((a) => a.countries ?? [a.country])).size,
    km: list.reduce((s, a) => s + a.distanceKm, 0),
    climbed: list.reduce((s, a) => s + a.elevationGainM, 0),
    days: list.reduce((s, a) => s + a.days, 0),
    nightsOutside: list.reduce((s, a) => s + a.nightsOutside, 0),
    highest: Math.max(...list.map((a) => a.highestPointM)),
  };
}
