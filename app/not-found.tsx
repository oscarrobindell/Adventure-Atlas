import Link from "next/link";
export default function NotFound() {
  return <section className="h-screen flex flex-col items-center justify-center text-center px-6"><p className="eyebrow">404</p><h1 className="display text-7xl md:text-9xl mt-4">Page not found.</h1><Link href="/" className="eyebrow mt-8 hover:text-bone">Back home →</Link></section>;
}
