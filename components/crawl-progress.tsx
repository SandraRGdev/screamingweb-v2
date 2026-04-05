"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const statusConfig = {
  connecting: {
    label: "Conectando...",
    icon: Loader2,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  crawling: {
    label: "Rastreando...",
    icon: Loader2,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  completed: {
    label: "Completado",
    icon: CheckCircle2,
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
  stopped: {
    label: "Detenido",
    icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  error: {
    label: "Error",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
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
      className={`rounded-xl border p-5 ${config.bg} transition-colors`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon
            className={`h-5 w-5 ${config.color} ${status === "crawling" || status === "connecting" ? "animate-spin" : ""}`}
          />
          <span className={`text-sm font-semibold ${config.color}`}>
            {config.label}
          </span>
        </div>
        <span className="text-sm font-medium tabular-nums">
          {crawled} / {discovered}
        </span>
      </div>
      <Progress value={progress} />
      <div className="flex gap-2 mt-3">
        <Badge variant="secondary">{crawled} rastreadas</Badge>
        <Badge variant="outline">{discovered} descubiertas</Badge>
      </div>
    </div>
  );
}
