"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Search, 
  PieChart, 
  Boxes, 
  Newspaper, 
  BarChart3,
  Info,
  ChevronLeft,
  ChevronRight,
  BrainCircuit
} from "lucide-react";

export function SidebarV2({ isCollapsed = false, setIsCollapsed }: { isCollapsed?: boolean; setIsCollapsed?: (v: boolean) => void }) {
  const pathname = usePathname();

  const navItems = [
    { sec: "Overview" },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    
    { sec: "Research" },
    { label: "Screener", href: "/screener", icon: Search },
    { label: "Indices & Sectors", href: "/sectors", icon: Boxes },

    { sec: "Portfolio" },
    { label: "Portfolio", href: "/portfolio", icon: PieChart },

    { sec: "Intelligence" },
    { label: "PortfolioGPT", href: "/portfolio/intelligence", icon: BrainCircuit },
    { label: "News Feed", href: "/news", icon: Newspaper },

    { sec: "Company" },
    { label: "About Us", href: "/about", icon: Info },
  ];

  return (
    <aside className={`fixed left-0 top-0 bottom-0 bg-navy-card border-r border-border-subtle flex flex-col z-[100] hidden md:flex transition-all duration-300 ${isCollapsed ? 'w-[72px]' : 'w-[210px]'}`}>
      {/* Brand & Toggle */}
      <div className={`px-5 pt-6 pb-5 border-b border-border-subtle flex ${isCollapsed ? 'flex-col items-center' : 'items-center justify-between'}`}>
        {!isCollapsed ? (
          <div className="flex flex-col gap-1.5 overflow-hidden">
            <Link href="/dashboard" className="text-[26px] font-black tracking-widest text-t1 flex items-center select-none font-jakarta">
              Q<span className="text-[#60A5FA]">U</span>ANTR
            </Link>
            <div className="font-mono text-[9px] text-t3 tracking-[0.2em] opacity-80 select-none whitespace-nowrap">NSE · BSE · v2.4</div>
          </div>
        ) : (
          <Link href="/dashboard" className="text-[26px] font-black tracking-widest text-t1 flex items-center justify-center select-none font-jakarta w-full mb-3">
            Q
          </Link>
        )}
        <button 
          onClick={() => setIsCollapsed && setIsCollapsed(!isCollapsed)}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-highlight-hov text-t2 hover:text-t1 transition-colors shrink-0"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto no-scrollbar flex flex-col gap-1 px-3">
        {navItems.map((item, i) => {
          if (item.sec) {
            return !isCollapsed ? (
              <div key={i} className="px-2 pt-3 pb-1 font-mono text-[8px] tracking-[2px] uppercase text-t3">
                {item.sec}
              </div>
            ) : <div key={i} className="h-4" />;
          }

          const isActive = pathname === item.href;
          const Icon = item.icon as React.ElementType;

          return (
            <Link 
              key={i} 
              href={item.href!}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center ${isCollapsed ? 'justify-center w-[44px] h-[40px] px-0 mx-auto' : 'gap-3 px-3 py-2.5 w-full'} rounded-lg text-[13px] font-medium transition-all duration-150 select-none ${
                isActive 
                  ? "text-t1 bg-white/10" 
                  : "text-t3 hover:text-t1 hover:bg-highlight"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "opacity-100" : "opacity-70"}`} />
              {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User */}
      <div className={`border-t border-border-subtle p-4 flex ${isCollapsed ? 'justify-center' : 'items-center gap-3'}`}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime to-[#57FFD8] flex items-center justify-center text-xs font-bold text-navy shrink-0">
          AN
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <div className="text-[13px] font-semibold text-t1 truncate">Aditya N.</div>
            <div className="font-mono text-[9px] text-amber mt-0.5 truncate">Pro Plan</div>
          </div>
        )}
      </div>
    </aside>
  );
}
