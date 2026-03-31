"use client";

import { useState } from "react";
import { SidebarV2 } from "@/components/global/sidebar-v2";
import { TopbarV2 } from "@/components/global/topbar-v2";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <SidebarV2 isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div 
        className={`transition-all duration-300 relative z-10 flex flex-col min-h-screen ${
          isCollapsed ? "md:ml-[72px]" : "md:ml-[210px]"
        }`}
      >
        <TopbarV2 />
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </>
  );
}
