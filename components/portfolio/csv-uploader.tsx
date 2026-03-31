"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";
import { UploadCloud, FileType, CheckCircle2, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface ParsedHolding {
  symbol: string;
  quantity: number;
  avgPrice: number;
}

export function CsvUploader({ onUpload }: { onUpload: (holdings: ParsedHolding[]) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [holdings, setHoldings] = useState<ParsedHolding[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processCSV = (file: File) => {
    setFile(file);
    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsed = results.data.map((row: any) => {
            // Handle different broker formats
            // Zerodha: Instrument, Qty., Avg. cost
            // Groww: Symbol, Quantity, Average Price
            // Angel One: Symbol, Net Qty, Avg Price
            const symbol = row.Instrument || row.Symbol || row.symbol || row["Stock Symbol"] || "";
            const qtyStr = row["Qty."] || row.Quantity || row["Net Qty"] || row.quantity || "0";
            const avgPriceStr = row["Avg. cost"] || row["Average Price"] || row["Avg Price"] || row.avgPrice || "0";

            const quantity = parseInt(qtyStr.toString().replace(/,/g, ""), 10);
            const avgPrice = parseFloat(avgPriceStr.toString().replace(/,/g, ""));

            if (!symbol || isNaN(quantity) || isNaN(avgPrice)) {
                throw new Error("Invalid CSV format. Could not map Symbol, Quantity, or Avg Price.");
            }

            return { symbol: symbol.toString().trim().toUpperCase(), quantity, avgPrice };
          });
          setHoldings(parsed);
        } catch (e: any) {
          setError(e.message);
          setHoldings([]);
        }
      },
      error: (err: any) => {
        setError(err.message);
      }
    });
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "text/csv" || droppedFile?.name.endsWith(".csv")) {
      processCSV(droppedFile);
    } else {
      setError("Please upload a valid CSV file.");
    }
  }, []);

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
          onDragLeave={() => setIsHovering(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            isHovering ? "border-emerald-500 bg-emerald-500/5" : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/50"
          }`}
        >
          <div className="mx-auto w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
            <UploadCloud className="w-6 h-6 text-t2" />
          </div>
          <h3 className="text-zinc-200 font-medium text-lg mb-1">Upload your Portfolio CSV</h3>
          <p className="text-t3 text-sm mb-6">Supports Zerodha, Groww, Angel One, and standard formats.</p>
          <label htmlFor="csv-upload" className="cursor-pointer">
            <div className={cn(buttonVariants({ variant: "secondary" }), "mx-auto w-fit")}>
              Browse Files
            </div>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) processCSV(selected);
              }}
            />
          </label>
        </div>
      ) : (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <FileType className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-zinc-200 font-medium">{file.name}</h4>
                  <p className="text-xs text-t3">{holdings.length} holdings found</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-t2 hover:text-t1"
                onClick={() => { setFile(null); setHoldings([]); setError(null); }}
              >
                <X className="w-4 h-4 mr-2" /> Remove
              </Button>
            </div>

            {error ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-sm">
                {error}
              </div>
            ) : (
              <>
                <div className="border border-zinc-800 rounded-lg max-h-[300px] overflow-auto mb-6">
                  <Table>
                    <TableHeader className="bg-zinc-900 sticky top-0">
                      <TableRow className="border-zinc-800">
                        <TableHead className="text-t2">Symbol</TableHead>
                        <TableHead className="text-right text-t2">Qty</TableHead>
                        <TableHead className="text-right text-t2">Avg Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holdings.map((h, i) => (
                        <TableRow key={i} className="border-zinc-800/50">
                          <TableCell className="font-medium text-zinc-300">{h.symbol}</TableCell>
                          <TableCell className="text-right text-t2 tabular-nums">{h.quantity}</TableCell>
                          <TableCell className="text-right text-t2 tabular-nums">₹{h.avgPrice.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button className="w-full" onClick={() => onUpload(holdings)}>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Sync Portfolio
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
