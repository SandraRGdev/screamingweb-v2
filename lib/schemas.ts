import { z } from "zod";

export const crawlRequestSchema = z.object({
  url: z.string().url(),
  maxDepth: z.number().min(1).max(50).default(50),
  maxPages: z.number().min(1).max(5000).default(5000),
  useJs: z.boolean().default(false),
  respectRobotsTxt: z.boolean().default(true),
  crawlScope: z.enum(["site", "section"]).default("site"),
});

export type CrawlRequest = z.infer<typeof crawlRequestSchema>;
