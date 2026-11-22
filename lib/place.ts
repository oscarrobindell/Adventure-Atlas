import type { Adventure } from "./types";

/** "Dolomites, Italy" or, for multi-country trips, "The Balkans · 5 countries". */
export const place = (a: Pick<Adventure, "region" | "country" | "countries">) =>
  a.countries ? `${a.region} · ${a.countries.length} countries` : `${a.region}, ${a.country}`;
