import type { CrawlerConfig, ParsedResult } from "./types";
import { DEFAULT_BLOCKED_EXTENSIONS } from "./types";
import {
  normalizeUrl,
  isSameDomain,
  isBlockedExtension,
  getDomain,
  isSafeUrl,
} from "./url-utils";
import { hybridFetch } from "./hybrid-fetcher";
import { parseHtml } from "./parser";
import { fetchRobotsTxt, waitForCrawlDelay } from "./robots";
import { fetchSitemap } from "./sitemap";

const LANGUAGE_BATCH_THRESHOLD = 1000;
const LANGUAGE_BATCH_SIZE = 200;
const DEFAULT_LANGUAGE_GROUP = "__default__";

function getScopePrefix(seedUrl: string): string {
  try {
    const pathname = new URL(seedUrl).pathname || "/";
    if (pathname === "/") return "/";
    return pathname.replace(/\/$/, "");
  } catch {
    return "/";
  }
}

function normalizeLanguageGroup(value: string | null | undefined): string {
  return value?.trim().toLowerCase() || DEFAULT_LANGUAGE_GROUP;
}

function detectLanguageFromUrl(url: string): string | null {
  try {
    const [firstSegment] = new URL(url).pathname.split("/").filter(Boolean);
    if (!firstSegment) return null;

    if (/^[a-z]{2,3}(?:-[a-z0-9]{2,8})?$/i.test(firstSegment)) {
      return firstSegment.toLowerCase();
    }

    return null;
  } catch {
    return null;
  }
}

function isWithinScope(url: string, scopePrefix: string): boolean {
  if (scopePrefix === "/") return true;
  try {
    const pathname = new URL(url).pathname.replace(/\/$/, "") || "/";
    return pathname === scopePrefix || pathname.startsWith(`${scopePrefix}/`);
  } catch {
    return false;
  }
}

/**
 * BFS crawler as an async generator. Yields ParsedResult for each page.
 * Stops when queue is empty, maxPages reached, maxDepth exceeded, or signal aborted.
 */
export async function* crawlGenerator(
  config: CrawlerConfig,
): AsyncGenerator<ParsedResult> {
  const seedDomain = getDomain(config.seedUrl);
  const seedNormalized = normalizeUrl(config.seedUrl);
  const scopePrefix = getScopePrefix(config.seedUrl);
  const queueBuckets = new Map<string, Array<{
    url: string;
    depth: number;
    discoveredFrom: string | null;
  }>>();
  const queueOrder: string[] = [];
  const visited = new Set<string>();
  const queued = new Set<string>([seedNormalized]);
  const yielded = new Set<string>();
  let activeLanguageGroup: string | null = null;
  let activeLanguageBatchCount = 0;
  const activeLanguageBatchSize =
    config.maxPages >= LANGUAGE_BATCH_THRESHOLD ? LANGUAGE_BATCH_SIZE : Number.POSITIVE_INFINITY;

  // Track URL discovery count to debug duplicates
  const discoveryCount = new Map<string, number>();

  const enqueue = (
    item: { url: string; depth: number; discoveredFrom: string | null },
    group: string,
  ) => {
    const normalizedGroup = normalizeLanguageGroup(group);
    const bucket = queueBuckets.get(normalizedGroup);
    if (bucket) {
      bucket.push(item);
      return;
    }

    queueBuckets.set(normalizedGroup, [item]);
    queueOrder.push(normalizedGroup);
  };

  const removeGroup = (group: string) => {
    queueBuckets.delete(group);
    const index = queueOrder.indexOf(group);
    if (index >= 0) {
      queueOrder.splice(index, 1);
    }
    if (activeLanguageGroup === group) {
      activeLanguageGroup = null;
      activeLanguageBatchCount = 0;
    }
  };

  const takeNextItem = () => {
    if (queueOrder.length === 0) return null;

    const currentIndex = activeLanguageGroup
      ? queueOrder.indexOf(activeLanguageGroup)
      : -1;

    if (activeLanguageGroup && currentIndex !== -1) {
      const currentBucket = queueBuckets.get(activeLanguageGroup);
      if (currentBucket?.length && activeLanguageBatchCount < activeLanguageBatchSize) {
        activeLanguageBatchCount++;
        const item = currentBucket.shift()!;
        if (currentBucket.length === 0) removeGroup(activeLanguageGroup);
        return item;
      }
    }

    for (let offset = 0; offset < queueOrder.length; offset++) {
      const index = currentIndex === -1
        ? offset
        : (currentIndex + offset + 1) % queueOrder.length;
      const group = queueOrder[index];
      const bucket = queueBuckets.get(group);
      if (!bucket?.length) continue;

      activeLanguageGroup = group;
      activeLanguageBatchCount = 1;
      const item = bucket.shift()!;
      if (bucket.length === 0) removeGroup(group);
      return item;
    }

    return null;
  };

  console.log(`[CRAWL START] Seed: ${config.seedUrl}, MaxDepth: ${config.maxDepth}, MaxPages: ${config.maxPages}`);

  // Fetch robots.txt once per crawl if enabled
  const robots = config.respectRobotsTxt
    ? await fetchRobotsTxt(config.seedUrl, config.userAgent)
    : null;
  const crawlDelay = robots?.getCrawlDelay() ?? 0;

  enqueue(
    { url: seedNormalized, depth: 0, discoveredFrom: null },
    detectLanguageFromUrl(seedNormalized) ?? DEFAULT_LANGUAGE_GROUP,
  );

  // Seed queue with sitemap URLs (discovered from robots.txt Sitemap: directives)
  if (robots) {
    const sitemapUrls = robots.getSitemaps();
    console.log(`[SITEMAP] Found ${sitemapUrls.length} sitemap URLs`);
    for (const sitemapUrl of sitemapUrls) {
      console.log(`[SITEMAP] Fetching: ${sitemapUrl}`);
      const sitemapResult = await fetchSitemap(sitemapUrl);
      console.log(`[SITEMAP] Fetched ${sitemapResult.urls.length} URLs`);
      for (const url of sitemapResult.urls) {
        const normalized = normalizeUrl(url);
        if (
          !visited.has(normalized) &&
          !queued.has(normalized) &&
          isSameDomain(normalized, seedDomain) &&
          !isBlockedExtension(normalized, config.blockedExtensions) &&
          isSafeUrl(normalized)
        ) {
          queued.add(normalized);
          enqueue({ url: normalized, depth: 0, discoveredFrom: "sitemap" }, DEFAULT_LANGUAGE_GROUP);
        }
      }
    }
  }

  while (visited.size < config.maxPages) {
    if (config.signal?.aborted) return;

    const item = takeNextItem();
    if (!item) break;
    const normalized = normalizeUrl(item.url);

    // Debug: check if URL was discovered multiple times
    const prevCount = discoveryCount.get(normalized) ?? 0;
    discoveryCount.set(normalized, prevCount + 1);
    if (prevCount > 0) {
      console.error(`[MULTI-DISCOVERY] ${normalized} discovered ${prevCount + 1} times`);
    }

    if (visited.has(normalized)) {
      console.error(`[ALREADY VISITED] ${normalized}`);
      continue;
    }
    if (yielded.has(normalized)) {
      console.error(`[ALREADY YIELDED] ${normalized}`);
      continue;
    }
    if (item.depth > config.maxDepth) continue;
    if (config.sameDomainOnly && !isSameDomain(normalized, seedDomain)) continue;
    if (config.crawlScope === "section" && !isWithinScope(normalized, scopePrefix)) continue;
    if (isBlockedExtension(normalized, config.blockedExtensions)) continue;

    // SSRF protection
    if (!isSafeUrl(normalized)) continue;

    // robots.txt check
    if (robots && !robots.isAllowed(normalized)) continue;

    visited.add(normalized);
    queued.delete(normalized);

    // Respect crawl-delay
    if (crawlDelay > 0) {
      await waitForCrawlDelay(crawlDelay, config.signal).catch(() => {});
    }

    const fetchResult = await hybridFetch(normalized, config.userAgent, {
      forceJs: config.useJs,
    });
    if (!fetchResult) continue;

    const finalUrl = normalizeUrl(fetchResult.url);

    // Don't yield the same resolved URL twice.
    // This catches aliases and redirect targets that collapse to one page.
    if (yielded.has(finalUrl)) {
      console.error(`[DUPLICATE] Already yielded final URL: ${finalUrl}`);
      continue;
    }

    visited.add(finalUrl);
    yielded.add(finalUrl);

    const parsed = parseHtml(fetchResult, item.depth, seedDomain);
    const pageGroup = normalizeLanguageGroup(
      parsed.lang ?? detectLanguageFromUrl(parsed.url) ?? null,
    );

    yield {
      ...parsed,
      url: finalUrl,
    };

    console.log(`[CRAWL] Queue groups: ${queueOrder.length}, Visited: ${visited.size}, Queued Set: ${queued.size}`);
    for (const link of parsed.internalLinks) {
      const linkNormalized = normalizeUrl(link);
      if (!visited.has(linkNormalized) && !queued.has(linkNormalized)) {
        if (config.crawlScope === "section" && !isWithinScope(linkNormalized, scopePrefix)) {
          continue;
        }
        queued.add(linkNormalized);
        enqueue(
          {
            url: linkNormalized,
            depth: item.depth + 1,
            discoveredFrom: normalized,
          },
          detectLanguageFromUrl(linkNormalized) ?? pageGroup,
        );
      }
    }
    queued.delete(normalized);
  }
}

/** Create a CrawlerConfig with sensible defaults */
export function createConfig(partial: Partial<CrawlerConfig> = {}): CrawlerConfig {
  return {
    seedUrl: partial.seedUrl || "https://example.com",
    maxDepth: partial.maxDepth ?? 3,
    maxPages: partial.maxPages ?? 500,
    userAgent: partial.userAgent || "ScreamingWeb/1.0",
    sameDomainOnly: partial.sameDomainOnly ?? true,
    crawlScope: partial.crawlScope ?? "site",
    blockedExtensions: partial.blockedExtensions || DEFAULT_BLOCKED_EXTENSIONS,
    useJs: partial.useJs ?? false,
    respectRobotsTxt: partial.respectRobotsTxt ?? true,
    signal: partial.signal,
  };
}
