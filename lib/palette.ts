import type { PaletteName } from "./types";

// Each palette drives the placeholder landscapes and the accent colour of an adventure page.
export const palettes: Record<PaletteName, { sky: [string, string]; sun: string; ridges: string[]; accent: string }> = {
  dusk:    { sky: ["#2b1d3a", "#e9805b"], sun: "#ffd29a", ridges: ["#8a4f6a", "#5e3352", "#3a2038", "#1d1220"], accent: "#ff9e6d" },
  glacier: { sky: ["#0d1b2a", "#7fb8c9"], sun: "#e8fbff", ridges: ["#5d8ea3", "#3c6478", "#24404f", "#111f28"], accent: "#8fe3ff" },
  forest:  { sky: ["#0f1d17", "#c9b37a"], sun: "#fff1c4", ridges: ["#557256", "#36513c", "#213528", "#101b14"], accent: "#c8e27a" },
  ocean:   { sky: ["#03131f", "#2c7da0"], sun: "#c6f1ff", ridges: ["#1f6280", "#144660", "#0b2d42", "#041522"], accent: "#5fd4ff" },
  desert:  { sky: ["#271426", "#f0a35e"], sun: "#ffe3a8", ridges: ["#c0603a", "#8e3f27", "#5a2619", "#2a120c"], accent: "#ffb25b" },
};

export const typeLabel: Record<string, string> = {
  hike: "Hike", climb: "Climb", roadtrip: "Road trip", dive: "Dive", expedition: "Expedition", paddle: "Paddle", travel: "Travel",
};
