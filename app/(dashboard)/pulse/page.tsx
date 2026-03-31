import { Activity } from "lucide-react";

export default function PulsePage() {
  return (
    <main className="p-6 md:p-8 flex-1 w-full max-w-[1280px] mx-auto flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-16 h-16 bg-gaindm border border-gainbr rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(61,214,140,0.15)]">
        <Activity className="w-8 h-8 text-gain" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-t1 mb-2">Market Pulse</h1>
      <p className="text-t3 font-mono text-[13px] max-w-md text-center">
        Live orderbook visualization and high-frequency order flow tracking module is under active development.
      </p>
    </main>
  );
}
