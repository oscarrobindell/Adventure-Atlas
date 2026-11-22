import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { getProfile } from "@/lib/content";

const profile = getProfile();

export const metadata: Metadata = {
  title: { default: `${profile.name} — Travels`, template: `%s · ${profile.name}` },
  description: profile.intro,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:bg-bone focus:text-ink focus:px-3 focus:py-2">Skip to content</a>
        <Nav name={profile.name} />
        <main id="main">{children}</main>
        <footer className="border-t hairline px-6 md:px-12 py-16 mt-32 flex flex-col md:flex-row gap-8 justify-between">
          <div>
            <p className="display text-5xl md:text-7xl">{profile.name}</p>
          </div>
          <ul className="flex gap-6 items-end">
            {profile.socials.filter((s) => s.href !== "#").map((s) => (
              <li key={s.label}><a className="eyebrow hover:text-bone transition-colors" href={s.href} {...(s.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{s.label} ↗</a></li>
            ))}
          </ul>
        </footer>
      </body>
    </html>
  );
}
