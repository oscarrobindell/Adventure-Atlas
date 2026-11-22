# Field Atlas — your adventure website

A cinematic personal site: a 3D globe of everywhere you've been, a scroll-driven story for every trip,
a scrubbable timeline, a photo gallery, live stats and a bucket list.

Everything you see right now is **placeholder content** (made-up trips and generated landscape art).
Swap in your own and the whole site updates itself.

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Add an adventure (no code)

1. Copy any file in `content/adventures/` and rename it, e.g. `content/adventures/scotland-west-highland-way.json`.
2. Edit the fields:
   - `slug` – the web address (`/adventures/<slug>/`). Lowercase, dashes, must match nothing else.
   - `title`, `subtitle`, `type` (`hike`, `climb`, `roadtrip`, `dive`, `paddle`, `travel`, `expedition`)
   - `country`, `region`, `coords` – `[latitude, longitude]` for the globe pin (right-click any spot in Google Maps to copy it)
   - `date` (`YYYY-MM-DD`), `days`, `distanceKm`, `elevationGainM`, `highestPointM`, `nights`, `nightsOutside`
   - `palette` – the mood of the page: `dusk`, `glacier`, `forest`, `ocean` or `desert`
   - `route` – a list of `[lat, lng]` points the route line follows (a dozen is plenty)
   - `elevation` – a list of heights in metres along the way, for the elevation chart
   - `chapters` – the story, each with a `heading`, `body` and `image`
   - `gallery` – extra photos for the contact sheet and the gallery page
3. Delete `"placeholder": true`.

The homepage stats, the globe, the timeline and the gallery all pick it up automatically.

## Add your photos

Put images in `public/photos/` (e.g. `public/photos/dolomites/lake.jpg`) and set the image's `src`:

```json
"image": { "src": "/photos/dolomites/lake.jpg", "alt": "Lago di Braies at dawn", "caption": "Before the crowds." }
```

Any image with an empty `src` shows the generated landscape instead, so you can add photos gradually.
Keep files under ~500 KB each (export at 2400px wide, JPG quality ~80) so the site stays fast.

## Your details and bucket list

- `content/profile.json` – your name, tagline, intro and social links
- `content/bucket-list.json` – dream trips, shown as faded pins on the globe and in the "Not yet" list

## Put it online for free (Vercel)

1. Push this folder to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new), import the repository and click **Deploy**. No settings needed.
3. Every time you push a change, Vercel rebuilds the site.

The site also builds to plain static files (`npm run build` → `out/`), so Netlify, Cloudflare Pages or GitHub Pages work too.

## What's inside

- `app/` – pages (home, adventure, timeline, gallery)
- `components/Globe.tsx` – the three.js globe (dotted continents, pins, journey arcs, drag and fly-in)
- `components/AdventureStory.tsx` + `RouteMap.tsx` – the scroll-driven story, route drawing and elevation profile
- `components/Timeline.tsx`, `Gallery.tsx`, `Lightbox.tsx`
- `components/Photo.tsx` – your photo, or generated placeholder art
- `scripts/build-globe.mjs` – pre-computes the globe's land dots

Built with Next.js, TypeScript, Tailwind CSS, Motion and three.js. Respects "reduce motion" settings,
works with a keyboard, and needs no API keys.
