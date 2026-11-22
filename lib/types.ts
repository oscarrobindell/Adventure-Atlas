export type Img = { src: string; alt: string; caption?: string; portrait?: boolean };
export type PaletteName = "dusk" | "glacier" | "forest" | "ocean" | "desert" | "adriatic";

export type Adventure = {
  placeholder?: boolean;
  /** Real trip whose story is still a first draft. */
  draft?: boolean;
  /** Extra countries visited, for multi-country trips. */
  countries?: string[];
  /** Overrides the four stats under the cover. */
  stats?: { l: string; v: string }[];
  slug: string;
  title: string;
  subtitle: string;
  type: string;
  country: string;
  region: string;
  coords: [number, number];
  date: string;
  days: number;
  distanceKm: number;
  elevationGainM: number;
  highestPointM: number;
  maxDepthM?: number;
  nights: number;
  nightsOutside: number;
  palette: PaletteName;
  cover: Img;
  route: [number, number][];
  /** Optional per-leg travel modes for an accurate map: car, boat, plane, trail. */
  legs?: { mode: string; path: [number, number][] }[];
  /** Lakes drawn on the route map (OpenStreetMap outlines), for local trips where coastlines say nothing. */
  water?: [number, number][][];
  /** Named stops shown on the map. */
  stops?: { name: string; coords: [number, number]; anchor?: "start" | "end" }[];
  elevation: number[];
  chapters: { heading: string; body?: string; label?: string; bullets?: string[]; image?: Img; miniMap?: MiniMapSpec }[];
  gallery: Img[];
};

export type BucketItem = {
  title: string;
  country: string;
  coords: [number, number];
  type: string;
  when: string;
  note: string;
};

export type Profile = {
  name: string;
  tagline: string;
  intro: string;
  quote: string;
  quoteBy: string;
  location: string;
  socials: { label: string; href: string }[];
};

export type MiniMapSpec = {
  caption?: string;
  bounds: [[number, number], [number, number]]; // [lat, lng] corners the map is fitted to
  legs?: { mode: string; path: [number, number][] }[];
  stops: { name: string; coords: [number, number]; anchor?: "start" | "end" }[];
  water?: [number, number][][];
};

export type GearItem = { name: string; href: string; note?: string };
export type GearBrand = { name: string; href: string; code?: string; codeNote?: string; note?: string; items: GearItem[] };
export type Gear = { intro: string; brands: GearBrand[] };
