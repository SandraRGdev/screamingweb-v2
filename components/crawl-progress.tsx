"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const statusConfig = {
  connecting: {
    label: "Conectando...",
    icon: Loader2,
    color: "text-slate-700",
    bg: "bg-slate-50 border-slate-200",
  },
  crawling: {
    label: "Rastreando...",
    icon: Loader2,
    color: "text-slate-700",
    bg: "bg-slate-50 border-slate-200",
  },
  completed: {
    label: "Completado",
    icon: CheckCircle2,
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
  },
  stopped: {
    label: "Detenido",
    icon: AlertCircle,
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  error: {
    label: "Error",
    icon: XCircle,
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-200",
  },
};

export function CrawlProgress({
  crawled,
  discovered,
  status,
}: {
  crawled: number;
  discovered: number;
  status: "connecting" | "crawling" | "completed" | "stopped" | "error";
}) {
  const progress =
    discovered > 0 ? Math.min((crawled / discovered) * 100, 100) : 0;
  const config = statusConfig[status] || statusConfig.crawling;
  const Icon = config.icon;

  return (
    <div
      className={`rounded-2xl border border-border/60 bg-card/90 p-5 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.28)] transition-colors ${status === "crawling" || status === "connecting" ? "ring-1 ring-primary/10" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            className={`h-5 w-5 ${config.color} ${status === "crawling" || status === "connecting" ? "animate-spin" : ""}`}
          />
          <span className={`text-sm font-semibold ${config.color}`}>
            {config.label}
          </span>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium tabular-nums text-foreground">
          {crawled} / {discovered}
        </span>
      </div>
      <Progress value={progress} className="h-2.5" />
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          {crawled} rastreadas
        </Badge>
        <Badge variant="outline" className="rounded-full px-3 py-1">
          {discovered} descubiertas
        </Badge>
      </div>
    </div>
  );
}
