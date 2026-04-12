"use client";

import { Card } from "@/components/ui/card";
import {
  Globe,
  CheckCircle2,
  Ban,
  AlertTriangle,
} from "lucide-react";
import type { CrawlResult } from "@/lib/types";

export function CrawlSummary({ results }: { results: CrawlResult[] }) {
  const total = results.length;
  const indexable = results.filter((r) => r.esIndexable).length;
  const nonIndexable = total - indexable;
  const errors = results.filter((r) => r.status >= 400).length;

  const stats = [
    {
      label: "URLs totales",
      value: total,
      icon: Globe,
      color: "text-slate-800",
      bg: "from-slate-50 to-white",
      border: "border-slate-200",
    },
    {
      label: "Indexables",
      value: indexable,
      icon: CheckCircle2,
      color: "text-emerald-700",
      bg: "from-emerald-50 to-white",
      border: "border-emerald-200",
    },
    {
      label: "No indexables",
      value: nonIndexable,
      icon: Ban,
      color: "text-amber-700",
      bg: "from-amber-50 to-white",
      border: "border-amber-200",
    },
    {
      label: "Errores",
      value: errors,
      icon: AlertTriangle,
      color: "text-rose-700",
      bg: "from-rose-50 to-white",
      border: "border-rose-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className={`border ${stat.border} bg-gradient-to-br ${stat.bg} p-4 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.28)] transition-transform hover:-translate-y-0.5`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`rounded-lg bg-background/70 p-1.5 ${stat.color}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <div className={`text-2xl font-bold tabular-nums ${stat.color}`}>
              {stat.value}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
