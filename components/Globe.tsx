"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";

export type GlobePin = { id: string; title: string; sub: string; lat: number; lng: number; color: string; dream?: boolean; href?: string };

const R = 1;
const toVec = (lat: number, lng: number, r = R) => {
  const phi = ((90 - lat) * Math.PI) / 180, th = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
};
const facing = (lat: number, lng: number) => ({ x: (lat * Math.PI) / 180, y: -Math.PI / 2 - (lng * Math.PI) / 180 });
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/** Interactive textured Earth. Drag to spin, click a glowing pin to fly in. `focus` (pin id) turns the globe to that pin. */
export default function Globe({ pins, journey, focus, onHover }: { pins: GlobePin[]; journey: string[]; focus?: string | null; onHover?: (id: string | null) => void }) {
  const mount = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const api = useRef<{ focus: (id: string | null) => void } | null>(null);
  const router = useRouter();
  const [hover, setHover] = useState<GlobePin | null>(null);
  const [ready, setReady] = useState(false);
  const hoverRef = useRef<string | null>(null);

  useEffect(() => { api.current?.focus(focus ?? null); }, [focus]);

  useEffect(() => {
    const el = mount.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "pan-y";
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    let camZ = 4.2, camZTarget = 4.2;
    camera.position.set(0, 0, camZ);

    const globe = new THREE.Group();
    globe.rotation.order = "XYZ";
    scene.add(globe);

    // Realistic Earth: NASA Blue Marble colour, relief bump, shiny oceans, drifting clouds.
    const base = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/globe`;
    const loader = new THREE.TextureLoader();
    const tex = (f: string, srgb = false) => { const t = loader.load(`${base}/${f}`, () => { loaded++; if (loaded >= 2) setReady(true); }); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
    let loaded = 0;
    const earthMat = new THREE.MeshPhongMaterial({
      map: tex("earth-day.jpg", true), bumpMap: tex("earth-bump.jpg"), bumpScale: 0.6,
      specularMap: tex("earth-water.jpg"), specular: new THREE.Color("#3a6f8f"), shininess: 18,
    });
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 96), earthMat));
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.008, 96, 96),
      new THREE.MeshPhongMaterial({ color: 0xffffff, alphaMap: tex("earth-clouds.jpg"), transparent: true, opacity: 0.55, depthWrite: false }),
    );
    globe.add(clouds);

    // Light: soft fill plus a low "sun" from the upper left so the globe has a day side.
    scene.add(new THREE.AmbientLight(0xbfd8ff, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(-3, 1.6, 3); scene.add(sun);

    // Atmosphere: back-side fresnel glow.
    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.1, 64, 64),
      new THREE.ShaderMaterial({
        side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        uniforms: { c: { value: new THREE.Color("#4fb8ff") } },
        vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
        fragmentShader: `uniform vec3 c; varying vec3 vN; void main(){ float i = pow(0.62 - dot(vN, vec3(0,0,1.)), 4.0); gl_FragColor = vec4(c, 1.) * i * 1.8; }`,
      })
    );
    scene.add(atmo);

    // Pins.
    const hits: THREE.Mesh[] = [];
    const rings: { m: THREE.Mesh; o: number; dream?: boolean }[] = [];
    const byId = new Map<string, GlobePin>();
    pins.forEach((p, i) => {
      byId.set(p.id, p);
      const pos = toVec(p.lat, p.lng, R * 1.005);
      const col = new THREE.Color(p.color);
      const core = new THREE.Mesh(new THREE.SphereGeometry(p.dream ? 0.008 : 0.014, 16, 16), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: p.dream ? 0.5 : 1 }));
      core.position.copy(pos); globe.add(core);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.026, 48), new THREE.MeshBasicMaterial({ color: col, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
      ring.position.copy(pos); ring.lookAt(pos.clone().multiplyScalar(2)); globe.add(ring);
      rings.push({ m: ring, o: i * 0.37, dream: p.dream });
      if (!p.dream) {
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.12, 6), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.6 }));
        beam.position.copy(toVec(p.lat, p.lng, R * 1.06)); beam.lookAt(new THREE.Vector3()); beam.rotateX(Math.PI / 2); globe.add(beam);
      }
      const hit = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.copy(pos); hit.userData.id = p.id; globe.add(hit); hits.push(hit);
    });

    // Journey arcs between adventures, in the order they happened.
    const arcs: THREE.Line[] = [];
    for (let i = 0; i < journey.length - 1; i++) {
      const a = byId.get(journey[i]), b = byId.get(journey[i + 1]);
      if (!a || !b) continue;
      const va = toVec(a.lat, a.lng), vb = toVec(b.lat, b.lng);
      const mid = va.clone().add(vb).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(R + va.distanceTo(vb) * 0.45);
      const pts = new THREE.QuadraticBezierCurve3(va, mid, vb).getPoints(80);
      const g = new THREE.BufferGeometry().setFromPoints(pts); g.setDrawRange(0, 0);
      const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xe8fff6, transparent: true, opacity: 0.6 }));
      globe.add(line); arcs.push(line);
    }

    // Rotation state.
    const start = facing(30, -20);
    const rot = { x: start.x, y: start.y }, tgt = { ...rot };
    let vel = 0, dragging = false, moved = 0, last = { x: 0, y: 0 }, focused: string | null = null, idle = 0;
    globe.rotation.set(rot.x, rot.y, 0);

    api.current = {
      focus: (id) => {
        focused = id;
        if (!id) { camZTarget = 4.2; return; }
        const p = byId.get(id); if (!p) return;
        const f = facing(p.lat, p.lng);
        tgt.x = f.x; tgt.y = rot.y + wrap(f.y - rot.y); vel = 0; camZTarget = 3.5;
      },
    };

    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    const pick = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(hits)[0];
      if (!hit) return null;
      // Only pins on the visible hemisphere.
      const wp = hit.object.getWorldPosition(new THREE.Vector3());
      return wp.z > 0.15 ? byId.get(hit.object.userData.id as string) ?? null : null;
    };

    const down = (e: PointerEvent) => { dragging = true; moved = 0; last = { x: e.clientX, y: e.clientY }; renderer.domElement.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      if (dragging) {
        const dx = e.clientX - last.x, dy = e.clientY - last.y;
        moved += Math.abs(dx) + Math.abs(dy);
        tgt.y += dx * 0.006; tgt.x = Math.max(-1.2, Math.min(1.2, tgt.x + dy * 0.006)); vel = dx * 0.006;
        last = { x: e.clientX, y: e.clientY }; idle = 0;
      } else {
        const p = pick(e);
        renderer.domElement.style.cursor = p ? "pointer" : "grab";
        setHover((h) => (h?.id === p?.id ? h : p));
        onHover?.(p?.id ?? null);
      }
    };
    const up = (e: PointerEvent) => {
      dragging = false;
      if (moved < 6) {
        const p = pick(e);
        if (p?.href) { api.current!.focus(p.id); camZTarget = 2.2; setTimeout(() => router.push(p.href!), reduce ? 0 : 650); }
      }
    };
    const el2 = renderer.domElement;
    el2.addEventListener("pointerdown", down); el2.addEventListener("pointermove", move);
    el2.addEventListener("pointerup", up); el2.addEventListener("pointerleave", () => { setHover(null); onHover?.(null); });

    const resize = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    resize(); const ro = new ResizeObserver(resize); ro.observe(el);

    let visible = true;
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting)); io.observe(el);

    const clock = new THREE.Clock(); let raf = 0, t0 = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05); t0 += dt; idle += dt;
      if (!dragging) {
        if (!focused && !reduce && idle > 1.5) tgt.y += dt * 0.06;
        tgt.y += vel; vel *= 0.92;
      }
      rot.x += (tgt.x - rot.x) * 0.08; rot.y += (tgt.y - rot.y) * 0.08;
      globe.rotation.set(rot.x, rot.y, 0);
      camZ += (camZTarget - camZ) * 0.06; camera.position.z = camZ;
      if (!reduce) clouds.rotation.y += dt * 0.008;
      rings.forEach(({ m, o, dream }) => {
        const k = reduce ? 0.5 : ((t0 * 0.6 + o) % 1);
        const s = 1 + k * (dream ? 1.2 : 2.6); m.scale.set(s, s, s);
        (m.material as THREE.MeshBasicMaterial).opacity = (1 - k) * (dream ? 0.35 : 0.9);
      });
      arcs.forEach((l, i) => {
        const n = Math.max(0, Math.min(81, Math.floor((t0 - 1 - i * 0.5) * 60)));
        l.geometry.setDrawRange(0, reduce ? 81 : n);
      });
      // Floating label for the hovered/focused pin.
      const id = hoverRef.current ?? focused;
      if (label.current) {
        const p = id ? byId.get(id) : null;
        if (p) {
          const v = toVec(p.lat, p.lng, R * 1.12).applyMatrix4(globe.matrixWorld);
          const front = v.z > 0.1; v.project(camera);
          label.current.style.opacity = front ? "1" : "0";
          label.current.style.transform = `translate(${(v.x * 0.5 + 0.5) * el.clientWidth}px, ${(-v.y * 0.5 + 0.5) * el.clientHeight}px)`;
        } else label.current.style.opacity = "0";
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); renderer.dispose(); el.removeChild(renderer.domElement); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  hoverRef.current = hover?.id ?? null;
  const shown = hover ?? pins.find((p) => p.id === focus) ?? null;

  return (
    <div className="relative w-full h-full">
      <div ref={mount} className={`absolute inset-0 transition-opacity duration-[1500ms] ${ready ? "opacity-100" : "opacity-0"}`} style={{ cursor: "grab" }}
        role="img" aria-label="Interactive globe of adventures. Use the list of adventures for keyboard navigation." />
      <div ref={label} className="pointer-events-none absolute left-0 top-0 transition-opacity duration-200" style={{ opacity: 0 }}>
        {shown && (
          <div className="-translate-x-1/2 -translate-y-full pb-3 whitespace-nowrap text-center">
            <p className="font-display text-2xl leading-none">{shown.title}</p>
            <p className="eyebrow mt-1" style={{ color: shown.color }}>{shown.dream ? "Not yet · " : ""}{shown.sub}</p>
          </div>
        )}
      </div>
    </div>
  );
}
