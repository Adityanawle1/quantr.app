import { MarketTicker } from "@/components/market-ticker";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-emerald-500/30">
      <div className="fixed top-0 left-0 right-0 z-50">
        <MarketTicker />
      </div>

      <nav className="h-16 flex items-center px-8 border-b border-white/5 backdrop-blur-xl bg-black/50 fixed top-10 left-0 right-0 z-40">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <span className="text-black font-black text-lg">Q</span>
          </div>
          <span className="font-black text-xl tracking-tighter text-white">Quantr</span>
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6 pt-32">
        <div className="w-full max-w-md relative">
          {/* Decorative Elements */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 bento-card p-8 md:p-12 border border-white/10 bg-zinc-950/50 backdrop-blur-sm rounded-[32px] shadow-2xl">
            {children}
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
        &copy; 2026 Quantr Technologies &bull; Institutional Grade Security
      </footer>
    </div>
  );
}
