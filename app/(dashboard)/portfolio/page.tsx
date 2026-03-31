"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Upload, LayoutGrid, List, BarChart3, PieChartIcon, BrainCircuit } from "lucide-react";
import { PortfolioSummary } from "@/components/portfolio/portfolio-summary";
import { AllocationChart } from "@/components/portfolio/allocation-chart";
import { PortfolioTable } from "@/components/portfolio/portfolio-table";
import { AddHoldingButton } from "@/components/portfolio/add-holding-button";
import { useState } from "react";

export default function PortfolioPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"table" | "grid">("table");

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const res = await fetch("/api/portfolio");
      return res.json();
    },
  });

  const { data: intelligence, isLoading: isIntelligenceLoading } = useQuery({
    queryKey: ["portfolio-intelligence"],
    queryFn: async () => {
      const res = await fetch("/api/portfolio/intelligence");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // Cache AI processing for 5 mins
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/portfolio/upload", {
        method: "POST",
        body: formData,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-lime" />
        <p className="text-t2 font-medium animate-pulse uppercase tracking-widest text-xs">
          Loading Portfolio...
        </p>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-t1 font-jakarta tracking-tight">Personal Portfolio</h1>
            <p className="text-t3 text-sm font-medium mt-1 uppercase tracking-wider">
               REAL-TIME PERFORMANCE & SECTORAL EXPOSURE
            </p>
          </div>

          <div className="flex items-center gap-3">
             <label className="flex items-center gap-2 px-6 py-2.5 bg-lime font-black text-base rounded-xl cursor-pointer hover:shadow-lg hover:shadow-lime/20 transition-all text-xs uppercase tracking-widest">
                <Upload className="w-4 h-4" />
                {uploadMutation.isPending ? "Uploading..." : "Import CSV"}
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadMutation.mutate(file);
                  }}
                />
             </label>
             <AddHoldingButton variant="outline" />
          </div>
        </div>

        {/* Top Summary */}
        <PortfolioSummary summary={portfolio?.summary} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 p-1 bg-navy-surf/50 border border-border-subtle rounded-xl">
                        <button 
                            onClick={() => setView("table")}
                            className={`p-2 rounded-lg transition-all ${view === "table" ? 'bg-lime/20 text-lime shadow-inner' : 'text-t3 hover:text-t2'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setView("grid")}
                            className={`p-2 rounded-lg transition-all ${view === "grid" ? 'bg-lime/20 text-lime shadow-inner' : 'text-t3 hover:text-t2'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] font-bold text-t3 uppercase tracking-widest border-b border-border-subtle pb-1">
                        <BarChart3 className="w-3 h-3" />
                        {portfolio?.holdings?.length || 0} Assets trackable
                    </div>
                </div>

                <PortfolioTable holdings={portfolio?.holdings || []} />
            </div>

            {/* Sidebar Analytics */}
            <div className="space-y-8">
                <AllocationChart holdings={portfolio?.holdings || []} />
                
                <div className="bento-card p-6 flex flex-col space-y-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-lime/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-lime/10 transition-colors pointer-events-none" />
                    
                    <h3 className="text-sm font-bold text-t1 font-jakarta uppercase tracking-widest flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-lime" />
                        Vertex AI Engine
                    </h3>
                    
                    {isIntelligenceLoading ? (
                        <div className="space-y-4 pt-2 animate-pulse">
                            <div className="h-4 bg-navy-surf rounded w-full"></div>
                            <div className="h-4 bg-navy-surf rounded w-5/6"></div>
                            <div className="h-4 bg-navy-surf rounded w-4/6"></div>
                            <div className="h-10 bg-navy-surf rounded mt-4"></div>
                        </div>
                    ) : intelligence && !intelligence.error ? (
                        <>
                            <p className="text-xs text-t2 leading-relaxed italic border-l-2 border-lime/30 pl-3">
                                "{intelligence.marketNarrative}"
                            </p>
                            
                            <div className="space-y-1 pt-4 border-t border-border-subtle">
                                <PulseStat 
                                  label="Health Score" 
                                  value={`${intelligence.healthScore}/100`} 
                                  color={intelligence.healthScore > 50 ? 'text-gain' : 'text-loss'} 
                                />
                                
                                {intelligence.topPerformer && (
                                    <div className="flex justify-between items-center py-2 border-b border-border-subtle hover:bg-navy-surf/30 transition-colors rounded px-1 -mx-1">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-t3 uppercase tracking-widest">Top Performer</span>
                                            <span className="text-xs text-t2 truncate max-w-[120px]">{intelligence.topPerformer.name}</span>
                                        </div>
                                        <span className="text-xs font-black uppercase text-gain">+{intelligence.topPerformer.performancePercentage}%</span>
                                    </div>
                                )}
                                
                                {intelligence.biggestDrag && (
                                    <div className="flex justify-between items-center py-2 -mx-1 px-1 hover:bg-navy-surf/30 transition-colors rounded">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-t3 uppercase tracking-widest">Biggest Drag</span>
                                            <span className="text-xs text-t2 truncate max-w-[120px]">{intelligence.biggestDrag.name}</span>
                                        </div>
                                        <span className="text-xs font-black uppercase text-loss">{intelligence.biggestDrag.performancePercentage}%</span>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-xs text-t3 p-4 bg-navy-surf/50 rounded-lg text-center">
                            Run an analysis to generate AI insights.
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}

function PulseStat({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-border-subtle last:border-0">
            <span className="text-[10px] font-bold text-t3 uppercase tracking-widest">{label}</span>
            <span className={`text-xs font-black uppercase ${color}`}>{value}</span>
        </div>
    );
}
