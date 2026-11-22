import type { PaletteName } from "./types";

// Each palette drives the placeholder landscapes and the accent colour of an adventure page.
export const palettes: Record<PaletteName, { sky: [string, string]; sun: string; ridges: string[]; accent: string }> = {
  dusk:    { sky: ["#0a2230", "#3f9e86"], sun: "#e2fff0", ridges: ["#3d8a6e", "#2a6652", "#1a4438", "#0c241e"], accent: "#9be37a" },
  glacier: { sky: ["#0d1b2a", "#7fb8c9"], sun: "#e8fbff", ridges: ["#5d8ea3", "#3c6478", "#24404f", "#111f28"], accent: "#8fe3ff" },
  forest:  { sky: ["#0f1d17", "#c9b37a"], sun: "#fff1c4", ridges: ["#557256", "#36513c", "#213528", "#101b14"], accent: "#c8e27a" },
  ocean:   { sky: ["#03131f", "#2c7da0"], sun: "#c6f1ff", ridges: ["#1f6280", "#144660", "#0b2d42", "#041522"], accent: "#3fe0c5" },
  adriatic: { sky: ["#0b2340", "#58b4d6"], sun: "#eafbff", ridges: ["#3f8f98", "#2a6b78", "#1a4a58", "#0c2632"], accent: "#5ec8ff" },
  desert:  { sky: ["#271426", "#f0a35e"], sun: "#ffe3a8", ridges: ["#c0603a", "#8e3f27", "#5a2619", "#2a120c"], accent: "#ffb25b" },
};

export const typeLabel: Record<string, string> = {
  hike: "Hike", climb: "Climb", roadtrip: "Road trip", dive: "Dive", expedition: "Expedition", paddle: "Paddle", travel: "Journey",
};
