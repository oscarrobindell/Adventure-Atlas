import fs from "node:fs";
import path from "node:path";
import { feature, mesh, merge } from "topojson-client";
import { geoMercator, geoPath, geoDistance, geoInterpolate } from "d3-geo";
import type { Adventure, MiniMapSpec } from "./types";

/** Everything the route map needs, pre-projected on the server so no geodata ships to the browser. */
export type MapData = {
  w: number; h: number;
  land: string; borders: string;
  legs: { mode: string; d: string; from: number; to: number }[]; // from/to: share of the whole journey (0–1)
  stops: { name: string; x: number; y: number; anchor: "start" | "end" }[];
};

let topo: any;
const world = () =>
  (topo ??= JSON.parse(fs.readFileSync(path.join(process.cwd(), "node_modules/world-atlas/countries-10m.json"), "utf8")));

export function buildMap(a: Adventure, w = 600, h = 520): MapData {
  const legs = a.legs ?? [{ mode: "trail", path: a.route }];
  const stops = a.stops ?? [
    { name: "Start", coords: a.route[0] },
    { name: "Finish", coords: a.route[a.route.length - 1] },
  ];
  return project(legs, stops, legs.flatMap((l) => l.path), w, h, 36);
}

/** A small map for a single day: fitted to the given bounds rather than to the legs. */
export function buildMiniMap(m: MiniMapSpec, w = 600, h = 375): MapData {
  const [[a, b], [c, d]] = m.bounds;
  return project(m.legs ?? [], m.stops, [[a, b], [c, d], [a, d], [c, b]], w, h, 0);
}

function project(legs: { mode: string; path: [number, number][] }[], stops: { name: string; coords: [number, number]; anchor?: "start" | "end" }[], all: [number, number][], w: number, h: number, pad: number): MapData {
  const line = { type: "MultiPoint" as const, coordinates: all.map(([la, lo]) => [lo, la]) };
  const proj = geoMercator().fitExtent([[pad, pad], [w - pad, h - pad]], line);
  proj.clipExtent([[-10, -10], [w + 10, h + 10]]);
  const gp = geoPath(proj).digits(1);

  const t = world();
  const land = gp(merge(t, t.objects.countries.geometries) as any) ?? "";
  const borders = gp(mesh(t, t.objects.countries, (x: any, y: any) => x !== y) as any) ?? "";

  // Project each leg. Flights become a gentle arc between their endpoints.
  const projected = legs.map((l) => {
    let pts = l.path.map(([la, lo]) => proj([lo, la])!) as [number, number][];
    if (l.mode === "plane") {
      const [p0, p1] = [pts[0], pts[pts.length - 1]];
      const dx = p1[0] - p0[0], dy = p1[1] - p0[1], len = Math.hypot(dx, dy);
      const c: [number, number] = [(p0[0] + p1[0]) / 2 + (dy / len) * len * 0.22, (p0[1] + p1[1]) / 2 - (dx / len) * len * 0.22];
      pts = Array.from({ length: 25 }, (_, i) => { const s = i / 24; return [(1 - s) ** 2 * p0[0] + 2 * (1 - s) * s * c[0] + s * s * p1[0], (1 - s) ** 2 * p0[1] + 2 * (1 - s) * s * c[1] + s * s * p1[1]]; });
    }
    const len = pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
    return { mode: l.mode, d: "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("L"), len };
  });
  const total = projected.reduce((s, l) => s + l.len, 0) || 1;
  let acc = 0;
  const outLegs = projected.map((l) => { const from = acc / total; acc += l.len; return { mode: l.mode, d: l.d, from, to: acc / total }; });

  return {
    w, h, land, borders, legs: outLegs,
    stops: stops.map((s) => { const [x, y] = proj([s.coords[1], s.coords[0]])!; return { name: s.name, x, y, anchor: s.anchor ?? (x > w * 0.7 ? "end" : "start") }; }),
  };
}

// Kept for future use (e.g. great-circle flights on very long legs).
export const _geo = { geoDistance, geoInterpolate, feature };
