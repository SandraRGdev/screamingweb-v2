import { beforeEach, describe, expect, it, vi } from "vitest";
import { crawlGenerator, createConfig } from "@/crawler/bfs";
import { hybridFetch } from "@/crawler/hybrid-fetcher";
import type { ParsedResult } from "@/crawler/types";

vi.mock("@/crawler/hybrid-fetcher", () => ({
  hybridFetch: vi.fn(),
}));

const hybridFetchMock = vi.mocked(hybridFetch);

const seedHtml =
  '<html><head><title>Home</title></head><body><a href="/alias-1">A</a><a href="/alias-2">B</a></body></html>';
const detailHtml = '<html><head><title>Offers</title></head><body></body></html>';

describe("crawlGenerator", () => {
  beforeEach(() => {
    hybridFetchMock.mockReset();
    hybridFetchMock.mockImplementation(async (url: string) => {
      if (url === "https://example.com") {
        return {
          html: seedHtml,
          status: 200,
          contentType: "text/html",
          url: "https://example.com/",
          method: "cheerio",
        };
      }

      if (url === "https://example.com/alias-1") {
        return {
          html: detailHtml,
          status: 200,
          contentType: "text/html",
          url: "https://example.com/ofertas/",
          method: "cheerio",
        };
      }

      if (url === "https://example.com/alias-2") {
        return {
          html: detailHtml,
          status: 200,
          contentType: "text/html",
          url: "https://example.com/ofertas/",
          method: "cheerio",
        };
      }

      return null;
    });
  });

  it("deduplicates pages that resolve to the same final URL", async () => {
    const results: ParsedResult[] = [];
    const config = createConfig({
      seedUrl: "https://example.com",
      maxDepth: 1,
      maxPages: 10,
      respectRobotsTxt: false,
    });

    for await (const page of crawlGenerator(config)) {
      results.push(page);
    }

    expect(results.map((page) => page.url)).toEqual([
      "https://example.com",
      "https://example.com/ofertas",
    ]);
  });

  it("prioritizes pages by language and rotates in batches on large crawls", async () => {
    const esLinks = Array.from({ length: 201 }, (_, index) => {
      const page = index + 1;
      return `<a href="/es/page-${page}">ES ${page}</a>`;
    }).join("");
    const enLink = '<a href="/en/page-1">EN 1</a>';

    hybridFetchMock.mockImplementation(async (url: string) => {
      if (url === "https://example.com") {
        return {
          html: `<html lang="es"><head><title>Home</title></head><body>${esLinks}${enLink}</body></html>`,
          status: 200,
          contentType: "text/html",
          url: "https://example.com",
          method: "cheerio",
        };
      }

      if (url.startsWith("https://example.com/es/page-")) {
        return {
          html: '<html lang="es"><head><title>ES</title></head><body></body></html>',
          status: 200,
          contentType: "text/html",
          url,
          method: "cheerio",
        };
      }

      if (url === "https://example.com/en/page-1") {
        return {
          html: '<html lang="en"><head><title>EN</title></head><body></body></html>',
          status: 200,
          contentType: "text/html",
          url,
          method: "cheerio",
        };
      }

      return null;
    });

    const results: ParsedResult[] = [];
    const config = createConfig({
      seedUrl: "https://example.com",
      maxDepth: 1,
      maxPages: 1000,
      respectRobotsTxt: false,
    });

    for await (const page of crawlGenerator(config)) {
      results.push(page);
    }

    const urls = results.map((page) => page.url);
    expect(urls[0]).toBe("https://example.com");
    expect(urls.slice(1, 201)).toEqual(
      Array.from({ length: 200 }, (_, index) => `https://example.com/es/page-${index + 1}`),
    );
    expect(urls[201]).toBe("https://example.com/en/page-1");
    expect(urls[202]).toBe("https://example.com/es/page-201");
  });

  it("limits crawl to the seed path when section scope is enabled", async () => {
    hybridFetchMock.mockImplementation(async (url: string) => {
      if (url === "https://mediumhoteles.com/ca") {
        return {
          html: '<html lang="ca"><head><title>CA Home</title></head><body><a href="/ca/habitaciones">CA</a><a href="/fr/chambres">FR</a></body></html>',
          status: 200,
          contentType: "text/html",
          url: "https://mediumhoteles.com/ca/",
          method: "cheerio",
        };
      }

      if (url === "https://mediumhoteles.com/ca/habitaciones") {
        return {
          html: '<html lang="ca"><head><title>CA Rooms</title></head><body></body></html>',
          status: 200,
          contentType: "text/html",
          url,
          method: "cheerio",
        };
      }

      if (url === "https://mediumhoteles.com/fr/chambres") {
        return {
          html: '<html lang="fr"><head><title>FR Rooms</title></head><body></body></html>',
          status: 200,
          contentType: "text/html",
          url,
          method: "cheerio",
        };
      }

      return null;
    });

    const results: ParsedResult[] = [];
    const config = createConfig({
      seedUrl: "https://mediumhoteles.com/ca/",
      maxDepth: 2,
      maxPages: 10,
      respectRobotsTxt: false,
      crawlScope: "section",
    });

    for await (const page of crawlGenerator(config)) {
      results.push(page);
    }

    expect(results.map((page) => page.url)).toEqual([
      "https://mediumhoteles.com/ca",
      "https://mediumhoteles.com/ca/habitaciones",
    ]);
  });
});
