import { tool } from "ai";
import { z } from "zod";
import { env } from "~/server/env";

export const firecrawlScrape = tool({
  description:
    "Scrape a URL and return content in various formats (markdown, html, etc.)",
  parameters: z.object({
    url: z.string().url().describe("The URL to scrape"),
    formats: z
      .array(
        z.enum([
          "markdown",
          "html",
          "rawHtml",
          "links",
          "screenshot",
          "screenshot@fullPage",
          "json",
        ]),
      )
      .default(["markdown"])
      .describe("Formats to return the content in"),
  }),
  execute: async ({ url, formats }) => {
    console.log(`[Firecrawl Tool] Starting scrape for URL: ${url}`);
    console.log(`[Firecrawl Tool] Requested formats: ${formats.join(", ")}`);
    console.log(
      `[Firecrawl Tool] API Key is ${env.FIRECRAWL_API_KEY ? "SET" : "NOT SET"}`,
    );

    const startTime = Date.now();

    try {
      console.log(`[Firecrawl Tool] Making API request to Firecrawl...`);
      const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.FIRECRAWL_API_KEY}`,
        },
        body: JSON.stringify({ url, formats }),
      });

      const elapsed = Date.now() - startTime;
      console.log(`[Firecrawl Tool] API response received in ${elapsed}ms`);
      console.log(
        `[Firecrawl Tool] Response status: ${res.status} ${res.statusText}`,
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[Firecrawl Tool] API error response: ${errorText}`);
        throw new Error(`Firecrawl API error: ${res.status} - ${errorText}`);
      }

      const data = (await res.json()) as {
        success: boolean;
        data?: {
          markdown?: string;
          html?: string;
          rawHtml?: string;
          links?: string[];
          screenshot?: string;
          json?: unknown;
          metadata?: unknown;
        };
        error?: string;
      };

      console.log(`[Firecrawl Tool] Successfully scraped URL`);
      console.log(
        `[Firecrawl Tool] Response data keys: ${Object.keys(data).join(", ")}`,
      );

      if (data.data?.markdown) {
        console.log(
          `[Firecrawl Tool] Markdown content length: ${data.data.markdown.length} chars`,
        );
      }

      return data;
    } catch (error) {
      console.error(`[Firecrawl Tool] Error scraping URL:`, error);
      throw error;
    }
  },
});

// Export as an object that matches the tools format expected by generateText
export const firecrawlTools = {
  firecrawl_scrape: firecrawlScrape,
};
