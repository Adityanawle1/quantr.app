import { Shield, Zap, Target, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="p-6 md:p-8 flex-1 w-full max-w-[1280px] mx-auto text-t1 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-3xl mt-4">
        <h1 className="text-4xl md:text-5xl font-black font-jakarta tracking-tight mb-4">
          Democratizing <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Institutional Intelligence</span>.
        </h1>
        <p className="text-[#8A9DB8] text-lg leading-relaxed mb-12">
          QUANTR leverages advanced algorithms and real-time data pipelines to bring hedge-fund level analytics directly to retail investors. We believe the Indian markets deserve cleaner data, faster execution, and absolute clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-navy-card/50 border border-border-subtle p-8 rounded-[24px]">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
            <Target className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold font-jakarta mb-3">Precision Engineering</h3>
          <p className="text-t3 leading-relaxed">
            Every metric, ratio, and chart is calculated with sub-millisecond latency. We don't just show data; we contextualize it against years of historical performance to give you the absolute edge.
          </p>
        </div>
        
        <div className="bg-navy-card/50 border border-border-subtle p-8 rounded-[24px]">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
            <Zap className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold font-jakarta mb-3">Unmatched Speed</h3>
          <p className="text-t3 leading-relaxed">
            From our Universal Search to our real-time portfolio tracking, everything is built on Edge infrastructure to ensure you never miss a tick during extreme market volatility.
          </p>
        </div>

        <div className="bg-navy-card/50 border border-border-subtle p-8 rounded-[24px]">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
            <Globe className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold font-jakarta mb-3">Built for India</h3>
          <p className="text-t3 leading-relaxed">
            We are deeply integrated with the NSE and BSE, understanding the nuances of the Indian financial ecosystem to bring tailored, hyper-local insights.
          </p>
        </div>

        <div className="bg-navy-card/50 border border-border-subtle p-8 rounded-[24px]">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold font-jakarta mb-3">Unbiased Data</h3>
          <p className="text-t3 leading-relaxed">
            We don't sell ads, and we don't push products. Our only objective is providing you with the exact, unmanipulated numbers needed to make your own independent conclusions.
          </p>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-[#1A2333] to-[#0B101A] border border-border-subtle rounded-[24px] p-8 md:p-12 text-center flex flex-col items-center justify-center mb-8">
        <h2 className="text-2xl font-black font-jakarta mb-3">Join the Future of Investing</h2>
        <p className="text-t3 mb-8 max-w-lg">
          QUANTR v2.4 represents our biggest leap forward. Experience the terminal today.
        </p>
        <button className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors">
          Start Screening
        </button>
      </div>

      <div className="pt-6 pb-12 border-t border-border-subtle text-center">
        <p className="text-[10px] text-[#4B6382] leading-relaxed max-w-4xl mx-auto font-mono uppercase tracking-wider">
          <strong>Disclaimer:</strong> QUANTR is a technology platform and not a registered broker, dealer, or investment advisor. Data provided on this platform is for informational and educational purposes only and does not constitute financial advice, investment recommendations, or an offer to buy or sell any securities. Investment in securities market are subject to market risks, read all the related documents carefully before investing. Past performance is not indicative of future returns. Please consult your financial advisor before taking any investment decisions.
        </p>
      </div>
    </main>
  );
}
