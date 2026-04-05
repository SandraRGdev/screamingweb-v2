"use client";

import { CrawlForm } from "@/components/crawl-form";
import { CrawlProgress } from "@/components/crawl-progress";
import { CrawlSummary } from "@/components/crawl-summary";
import { CrawlResultsTable } from "@/components/crawl-results-table";
import { useCrawlStream } from "@/hooks/use-crawl-stream";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function HomePage() {
  const { state, startCrawl, stopCrawl, reset } = useCrawlStream();
  const isIdle = state.status === "idle";
  const isActive =
    state.status === "connecting" || state.status === "crawling";
  const isDone =
    state.status === "completed" ||
    state.status === "stopped" ||
    state.status === "error";

  return (
    <main className="container mx-auto py-8 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            ScreamingWeb
          </h1>
          <p className="text-sm text-muted-foreground">
            Rastreador SEO — Descubre todas las URLs internas
          </p>
        </div>
      </div>

      {isIdle && <CrawlForm onSubmit={startCrawl} />}

      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {isActive && (
        <div className="space-y-4">
          <CrawlProgress
            crawled={state.stats.crawled}
            discovered={state.stats.discovered}
            status={state.status as "connecting" | "crawling"}
          />
          <Button onClick={stopCrawl} variant="destructive" size="lg">
            Detener rastreo
          </Button>
        </div>
      )}

      {isDone && !isIdle && (
        <div className="space-y-6">
          <CrawlProgress
            crawled={state.stats.crawled}
            discovered={state.stats.discovered}
            status={state.status as "connecting" | "crawling" | "completed" | "stopped" | "error"}
          />
          <div className="flex gap-2">
            <Button onClick={reset} size="lg">
              Nuevo rastreo
            </Button>
          </div>
          {state.results.length > 0 && (
            <>
              <CrawlSummary results={state.results} />
              <CrawlResultsTable
                results={state.results}
                seedUrl={state.seedUrl}
              />
            </>
          )}
        </div>
      )}
    </main>
  );
}
