import Link from "next/link";
import { UniversalSearch } from "@/components/universal-search";
import { Activity } from "lucide-react";

export function GlobalHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-zinc-100 p-1.5 rounded-lg group-hover:bg-zinc-200 transition-colors">
              <Activity className="h-4 w-4 text-zinc-950" />
            </div>
            <span className="font-bold text-lg tracking-tight text-zinc-100 hidden sm:inline-block">Quantr</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-t2">
            <Link href="/screener" className="hover:text-zinc-100 transition-colors hidden md:inline-block">Screener</Link>
            <Link href="/portfolio" className="hover:text-zinc-100 transition-colors hidden md:inline-block">Portfolio</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <UniversalSearch />
        </div>
      </div>
    </header>
  );
}
