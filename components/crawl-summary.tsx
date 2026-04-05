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
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Indexables",
      value: indexable,
      icon: CheckCircle2,
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    {
      label: "No indexables",
      value: nonIndexable,
      icon: Ban,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      label: "Errores",
      value: errors,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className={`p-4 ${stat.bg} border ${stat.border}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs font-medium text-muted-foreground">
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
