"use client";

import { CrawlForm } from "@/components/crawl-form";
import { CrawlProgress } from "@/components/crawl-progress";
import { CrawlSummary } from "@/components/crawl-summary";
import { CrawlResultsTable } from "@/components/crawl-results-table";
import { useCrawlStream } from "@/hooks/use-crawl-stream";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <main className="relative mx-auto w-full max-w-[1600px] px-6 py-8 sm:px-8 lg:px-12 xl:px-16">
      <section className="mb-8 w-full overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-6 px-6 py-7 sm:px-8 lg:px-10 xl:px-12">
          <div className="w-full space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <Search className="h-3.5 w-3.5" />
              Screaming Web
            </div>
            <div className="space-y-4">
              <h1 className="w-full max-w-none text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl lg:text-[4rem] xl:text-[4.75rem]">
                SEO crawling profesional para webs{" "}
                <span className="lg:block">multidioma</span>
              </h1>
              <p className="max-w-5xl text-sm leading-6 text-muted-foreground sm:text-base lg:whitespace-nowrap">
                Descubre URLs internas, segmenta por idioma o sección y sigue el rastreo en tiempo real con una interfaz más clara y moderna.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-[0.72rem] uppercase tracking-[0.18em]">
                  Multidioma
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1.5 text-[0.72rem] uppercase tracking-[0.18em]">
                  Tiempo real
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1.5 text-[0.72rem] uppercase tracking-[0.18em]">
                  Batch crawl
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isIdle && <CrawlForm onSubmit={startCrawl} />}

      {state.error && (
        <div className="rounded-2xl border border-red-200/80 bg-red-50/80 p-4 text-sm text-red-700 shadow-sm">
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
          <Button type="button" onClick={stopCrawl} variant="destructive" size="lg">
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
            <Button type="button" onClick={reset} size="lg">
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
