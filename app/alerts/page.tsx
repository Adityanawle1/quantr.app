import { Bell } from "lucide-react";

export default function AlertsPage() {
  return (
    <main className="p-6 md:p-8 flex-1 w-full max-w-[1280px] mx-auto flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-16 h-16 bg-ambrdk border border-[rgba(245,158,11,0.2)] rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
        <Bell className="w-8 h-8 text-amber" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-t1 mb-2">Smart Alerts</h1>
      <p className="text-t3 font-mono text-[13px] max-w-md text-center">
        Custom triggers for technical breakouts, moving average crosses, and sentiment shifts are under active development.
      </p>
    </main>
  );
}
