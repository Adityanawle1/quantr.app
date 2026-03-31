import { IndexCards } from "./index-cards"
import { TopMovers } from "./top-movers"
import { SectorHeatmap } from "./sector-heatmap"
import { FiftyTwoWeekHighs } from "./fifty-two-week-highs"

export function BentoGrid() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col space-y-8">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-50">Market Overview</h2>
        <p className="text-t2 text-lg">Live pulse of the Indian markets.</p>
      </div>

      <div className="flex flex-col space-y-6">
        {/* Index row */}
        <IndexCards />

        {/* Main Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-1 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <TopMovers />
          </div>
          <div className="col-span-1 lg:col-span-1 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <SectorHeatmap />
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-1 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <FiftyTwoWeekHighs />
          </div>
        </div>
      </div>
    </section>
  )
}
