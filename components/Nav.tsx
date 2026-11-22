"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/timeline/", label: "Timeline" },
  { href: "/gallery/", label: "Gallery" },
];

export default function Nav({ name }: { name: string }) {
  const path = usePathname();
  return (
    <header className="fixed top-0 inset-x-0 z-50 px-6 md:px-12 py-5 flex items-center justify-between mix-blend-difference">
      <Link href="/" className="font-display text-xl tracking-tight italic">{name}<span className="not-italic text-ember">.</span></Link>
      <nav aria-label="Main">
        <ul className="flex gap-6 md:gap-10">
          {links.map((l) => {
            const active = l.href === "/" ? path === "/" : path?.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link href={l.href} aria-current={active ? "page" : undefined}
                  className={`eyebrow !text-bone relative after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-bone after:transition-all ${active ? "after:w-full" : "after:w-0 hover:after:w-full"}`}>
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
