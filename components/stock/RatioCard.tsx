import * as Tooltip from '@radix-ui/react-tooltip'
import { Info } from 'lucide-react'

const RATIO_DESCRIPTIONS: Record<string, string> = {
  'P/E':           'Price-to-Earnings: How much investors pay per ₹1 of earnings. Lower may indicate undervaluation.',
  'P/B':           'Price-to-Book: Compares stock price to net asset value. P/B < 1 may signal undervaluation.',
  'EPS':           'Earnings Per Share: Net profit divided by shares outstanding. Higher is generally better.',
  'ROE':           'Return on Equity: Net income as % of shareholders equity. Higher means more efficient use of capital.',
  'ROCE':          'Return on Capital Employed: Profitability relative to all capital used, including debt.',
  'Debt/Equity':   'Debt-to-Equity: Total debt divided by equity. Lower is safer; high D/E adds financial risk.',
  'Dividend Yield':'Annual dividend as % of share price. Higher yield can signal income; check payout sustainability.',
  'Market Cap':    'Total market value of all shares. Mega cap (>₹2L Cr), Large (₹50K–2L Cr), Mid (₹5K–50K Cr), Small (<₹5K Cr).',
  'Revenue Growth':'Year-over-year revenue increase. Consistent growth suggests strong business momentum.',
  'Profit Growth': 'Year-over-year net profit growth. Signals improving operational efficiency or volume expansion.',
  'Current Ratio': 'Current assets ÷ current liabilities. >1 means company can cover short-term obligations.',
}

const SHAREHOLDING_DESCRIPTIONS: Record<string, string> = {
  'Promoters':   'Founders and major controlling shareholders. High promoter holding (>50%) often signals confidence in the business.',
  'FII':         'Foreign Institutional Investors — large overseas funds. Rising FII stake usually signals global confidence.',
  'DII':         'Domestic Institutional Investors — LIC, mutual funds, insurance companies. Rising DII holding shows domestic conviction.',
  'Public':      'Retail and other public shareholders. High public float improves liquidity but may increase volatility.',
  'Pledged':     'Shares pledged as collateral by promoters. High pledging (>25%) is a red flag — promoter may be under financial stress.',
}

interface Props {
  label: string
  value: string | number
  type?: 'ratio' | 'shareholding'
  positive?: boolean
}

export default function RatioCard({ label, value, type = 'ratio', positive }: Props) {
  const descriptions = type === 'ratio' ? RATIO_DESCRIPTIONS : SHAREHOLDING_DESCRIPTIONS
  const description = descriptions[label]

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div className="bg-[var(--bg-elevated)] rounded-xl p-4 cursor-default hover:bg-[var(--border)] transition-colors">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs text-[var(--text-muted)]">{label}</span>
              {description && <Info size={11} className="text-[var(--text-muted)] opacity-60" />}
            </div>
            <p className={`text-lg font-bold ${positive == null ? 'text-[var(--text)]' : positive ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}`}>
              {value ?? '—'}
            </p>
          </div>
        </Tooltip.Trigger>
        {description && (
          <Tooltip.Portal>
            <Tooltip.Content
              className="max-w-xs bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl px-4 py-3 text-xs text-[var(--text)] leading-relaxed z-50"
              sideOffset={6}
            >
              <strong className="block mb-1 text-[var(--accent)]">{label}</strong>
              {description}
              <Tooltip.Arrow className="fill-[var(--border)]" />
            </Tooltip.Content>
          </Tooltip.Portal>
        )}
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
