/** Static export: the whole site builds to plain files in /out, free to host anywhere (Vercel, Netlify, GitHub Pages). */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: process.env.BASE_PATH || "",
  env: { NEXT_PUBLIC_BASE_PATH: process.env.BASE_PATH || "" },
};
export default nextConfig;
