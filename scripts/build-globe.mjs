// Pre-computes the dotted-land pattern for the globe so the browser does no geometry work.
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";
import { geoContains } from "d3-geo";

const topo = JSON.parse(readFileSync(new URL("../node_modules/world-atlas/land-110m.json", import.meta.url)));
const land = feature(topo, topo.objects.land);
const N = 26000; // points on a Fibonacci sphere
const out = [];
const golden = Math.PI * (3 - Math.sqrt(5));
for (let i = 0; i < N; i++) {
  const y = 1 - (i / (N - 1)) * 2;
  const theta = golden * i;
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lng = ((((theta * 180) / Math.PI) % 360) + 540) % 360 - 180;
  if (geoContains(land, [lng, lat])) out.push(+lat.toFixed(2), +lng.toFixed(2));
}
writeFileSync(new URL("../public/land-dots.json", import.meta.url), JSON.stringify(out));
console.log(`globe: ${out.length / 2} land dots`);
