"use client";

import { FileText, ExternalLink, Download, Building2, Globe } from "lucide-react";

interface CompanyReportsProps {
  symbol: string;
  name: string;
}

// ── URL Constructors ──────────────────────────────────────

function getBSEFilingsUrl(symbol: string): string {
  // BSE corporate filings – financial results page
  return `https://www.bseindia.com/corporates/Comp_Resultsnew.aspx`;
}

function getNSEFilingsUrl(symbol: string): string {
  // NSE corporate filings – financial results filtered by symbol
  return `https://www.nseindia.com/companies-listing/corporate-filings-financial-results?symbol=${encodeURIComponent(symbol)}`;
}

function getInvestorRelationsUrl(companyName: string): string {
  // Google search fallback for the company's investor relations page
  const query = `${companyName} investor relations annual report`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

// ── Mock Report Data ──────────────────────────────────────

interface ReportEntry {
  title: string;
  type: "annual" | "quarterly";
  date: string;
  source: "BSE" | "NSE";
}

function generateReports(symbol: string): ReportEntry[] {
  return [
    { title: "Annual Report FY 2024-25", type: "annual", date: "May 2025", source: "BSE" },
    { title: "Annual Report FY 2023-24", type: "annual", date: "May 2024", source: "BSE" },
    { title: "Annual Report FY 2022-23", type: "annual", date: "Jun 2023", source: "BSE" },
    { title: "Q3 FY25 — Quarterly Results", type: "quarterly", date: "Jan 2025", source: "NSE" },
    { title: "Q2 FY25 — Quarterly Results", type: "quarterly", date: "Oct 2024", source: "NSE" },
    { title: "Q1 FY25 — Quarterly Results", type: "quarterly", date: "Jul 2024", source: "NSE" },
    { title: "Q4 FY24 — Quarterly Results", type: "quarterly", date: "Apr 2024", source: "NSE" },
  ];
}

// ── Component ─────────────────────────────────────────────

export function CompanyReports({ symbol, name }: CompanyReportsProps) {
  const reports = generateReports(symbol);
  const annuals = reports.filter((r) => r.type === "annual");
  const quarterlies = reports.filter((r) => r.type === "quarterly");

  const bseUrl = getBSEFilingsUrl(symbol);
  const nseUrl = getNSEFilingsUrl(symbol);
  const irUrl = getInvestorRelationsUrl(name);

  return (
    <div className="space-y-8">
      {/* Quick Links Bar */}
      <div className="flex flex-wrap gap-3">
        <a
          href={nseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all duration-200"
        >
          <Building2 className="w-4 h-4" />
          NSE Filings
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
        <a
          href={bseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/20 hover:border-blue-500/30 transition-all duration-200"
        >
          <Building2 className="w-4 h-4" />
          BSE Filings
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
        <a
          href={irUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-surf border border-border text-t2 text-sm font-medium hover:bg-navy-hov hover:border-border transition-all duration-200"
        >
          <Globe className="w-4 h-4" />
          Investor Relations
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Annual Reports */}
        <div className="bento-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-t1">Annual Reports</h3>
          </div>

          <div className="space-y-3">
            {annuals.map((report) => (
              <ReportRow
                key={report.title}
                report={report}
                symbol={symbol}
                nseUrl={nseUrl}
                bseUrl={bseUrl}
              />
            ))}
          </div>
        </div>

        {/* Quarterly Results */}
        <div className="bento-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <FileText className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-t1">Quarterly Results</h3>
          </div>

          <div className="space-y-3">
            {quarterlies.map((report) => (
              <ReportRow
                key={report.title}
                report={report}
                symbol={symbol}
                nseUrl={nseUrl}
                bseUrl={bseUrl}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Fallback / Disclaimer */}
      <div className="rounded-xl border border-border-subtle bg-highlight px-5 py-4 flex items-start gap-3">
        <Globe className="w-5 h-5 text-t3 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-t2">
            Can&apos;t find a report?{" "}
            <a
              href={irUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
            >
              Search {name}&apos;s Investor Relations page
            </a>{" "}
            for the latest filings and documents.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Report Row ────────────────────────────────────────────

function ReportRow({
  report,
  symbol,
  nseUrl,
  bseUrl,
}: {
  report: ReportEntry;
  symbol: string;
  nseUrl: string;
  bseUrl: string;
}) {
  const linkUrl = report.source === "NSE" ? nseUrl : bseUrl;

  return (
    <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-highlight px-4 py-3 hover:bg-highlight-hov hover:border-border-subtle transition-all duration-200 group">
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-t1 truncate">{report.title}</span>
        <span className="text-xs text-t3 mt-0.5">{report.date}</span>
      </div>

      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-surf text-t2 border border-border-subtle hover:bg-emerald-500/15 hover:text-emerald-400 hover:border-emerald-500/30 transition-all duration-200 shrink-0 ml-4"
      >
        <Download className="w-3.5 h-3.5" />
        <span>View PDF</span>
      </a>
    </div>
  );
}
