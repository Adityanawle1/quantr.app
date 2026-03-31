import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface CompanyHeaderProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export function CompanyHeader({ symbol, name, price, change }: CompanyHeaderProps) {
  const isPositive = change >= 0;

  return (
    <div className="w-full glass rounded-[20px] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 relative overflow-hidden group">
      {/* Decorative background glow */}
      <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] -mr-32 -mt-32 transition-colors duration-500 ${isPositive ? 'bg-gain/10' : 'bg-loss/10'}`} />
      
      <div className="flex flex-col relative z-10 mb-2 md:mb-0">
        <h1 className="text-[28px] font-semibold tracking-tight text-t1 mb-1">
          {symbol}
        </h1>
        <p className="text-[13px] font-medium text-t2">{name}</p>
      </div>
      
      <div className="mt-6 md:mt-0 flex flex-col items-start md:items-end relative z-10">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col items-end">
            <span className="text-[28px] font-semibold tracking-tight text-t1">
              ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className={`flex items-center text-[13px] font-semibold px-2.5 py-1.5 rounded-lg transition-all duration-300 ${
            isPositive 
              ? 'bg-[#3DD68C]/10 text-[#3DD68C] border border-[#3DD68C]/20' 
              : 'bg-[#E8627A]/10 text-[#E8627A] border border-[#E8627A]/20'
          }`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
            {Math.abs(change)}%
          </div>
        </div>
        <p className="text-t3 text-[10px] font-medium mt-2.5 uppercase tracking-widest text-right">
          LIVE • Market is Open
        </p>
      </div>
    </div>
  );
}
