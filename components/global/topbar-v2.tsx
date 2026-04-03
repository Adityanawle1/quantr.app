"use client";

import { Search, Bell, Menu, ChevronUp, ChevronDown, Moon, Sun, User, LogOut } from "lucide-react";
import { UniversalSearch } from "@/components/universal-search";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { signout } from "@/app/actions/auth";
import Link from "next/link";

export function TopbarV2() {
  const TICKERS = [
    {s:'NIFTY 50',p:'24,613.5',c:'0.77%',g:1},{s:'SENSEX',p:'81,224.0',c:'0.80%',g:1},
    {s:'BANK NIFTY',p:'52,374.1',c:'0.41%',g:0},{s:'RELIANCE',p:'2,934.5',c:'1.2%',g:1},
    {s:'TCS',p:'3,812.0',c:'0.6%',g:1},{s:'HDFCBANK',p:'1,612.0',c:'0.4%',g:0},
    {s:'INFOSYS',p:'1,524.0',c:'1.8%',g:1},{s:'BAJFIN',p:'7,124.0',c:'4.2%',g:1},
    {s:'WIPRO',p:'298.0',c:'1.1%',g:0},{s:'AXISBANK',p:'1,067.0',c:'0.7%',g:1},
    {s:'ZOMATO',p:'218.0',c:'2.6%',g:1},{s:'TATAMOTORS',p:'768.0',c:'1.4%',g:1},
  ];

  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  // Double array for seamless marquee
  const items = [...TICKERS, ...TICKERS];

  return (
    <header className="h-[56px] flex items-center px-6 border-b border-border-subtle bg-navy/90 backdrop-blur-[20px] sticky top-0 z-50 gap-4">
      {/* Mobile Menu Icon */}
      <div className="md:hidden text-t3 cursor-pointer">
        <Menu className="w-5 h-5" />
      </div>

      {/* Ticker */}
      <div className="flex-1 overflow-hidden" style={{ maskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)" }}>
        <div className="inline-flex whitespace-nowrap animate-[tickmove_60s_linear_infinite] hover:[animation-play-state:paused]">
          {items.map((t, idx) => (
            <div key={idx} className="flex items-center gap-3 px-6 h-[56px] border-r border-border-subtle group hover:bg-white/[0.04] transition-colors cursor-pointer select-none">
              <span className="font-jakarta text-[12px] font-bold text-[#8A9DB8] group-hover:text-t1 transition-colors">{t.s}</span>
              <span className="font-mono text-[13px] font-semibold text-t1">₹{t.p}</span>
              <span className={`font-mono text-[12px] font-bold flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-md ${t.g ? "text-gain bg-gain/10" : "text-loss bg-loss/10"}`}>
                {t.g ? <ChevronUp className="w-3.5 h-3.5 text-gain" /> : <ChevronDown className="w-3.5 h-3.5 text-loss" />}
                {t.c}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-8 h-8 bg-navy-surf border border-border-subtle rounded-lg flex items-center justify-center text-t3 transition-colors hover:border-border-subtle hover:text-t1"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </button>

        <button className="w-8 h-8 bg-navy-surf border border-border-subtle rounded-lg flex items-center justify-center text-t3 transition-colors hover:border-border-subtle hover:text-t1">
          <Bell className="w-3.5 h-3.5" />
        </button>

        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-border-subtle">
            <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-[10px] font-black text-t1 uppercase leading-tight truncate max-w-[100px]">
                {user.email?.split('@')[0]}
              </span>
              <button 
                onClick={() => signout()}
                className="text-[9px] font-bold text-t3 hover:text-loss transition-colors uppercase tracking-widest text-left"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <Link 
            href="/login"
            className="px-4 py-1.5 bg-emerald-500 text-zinc-950 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-emerald-400 transition-all ml-2"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
