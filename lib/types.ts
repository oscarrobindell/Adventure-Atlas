export type Img = { src: string; alt: string; caption?: string };
export type PaletteName = "dusk" | "glacier" | "forest" | "ocean" | "desert";

export type Adventure = {
  placeholder?: boolean;
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
  elevation: number[];
  chapters: { heading: string; body: string; image: Img }[];
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
  location: string;
  socials: { label: string; href: string }[];
};
