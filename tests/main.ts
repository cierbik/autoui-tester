// src/main.ts

import { chromium } from "playwright";
import { Command } from "commander";
import { BasePage } from "../src/pages/BasePage";
import { Reporter } from "../src/helpers/Reporter";
import { ReportHelper } from "../src/helpers/ReportHelper";
import { PageResult } from "../src/types/interfaces"; // Assuming types are in this path

// 👇 1. The entire file is now structured around the CLI command
const program = new Command();

program
  .name("autoui-tester")
  .description(
    "A modular Playwright-based framework for automatic UI & performance testing."
  )
  .version("1.0.0");

program
  .command("crawl")
  .description("Crawl a website and generate a report")
  .argument("<url>", "The starting URL to crawl")
  .option("-d, --depth <number>", "Maximum crawl depth", "2")
  .option("-l, --max-links <number>", "Maximum links to follow per page", "10")
  .option("-o, --output <string>", "Output directory for the report", "reports")
  .action(async (url, options) => {
    console.log("🚀 Starting crawl for:", url);
    console.log("⚙️ Options:", options);

    // 👇 2. Report clearing now uses the dynamic output path from options
    await ReportHelper.clearReports(options.output);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // 👇 3. Crawler config is created from CLI options
    const crawlerConfig = {
      maxDepth: parseInt(options.depth, 10),
      maxLinksPerPage: parseInt(options.maxLinks, 10),
    };

    const crawler = new BasePage(page, crawlerConfig);

    try {
      // 👇 4. The hardcoded loop is replaced by a single call with the URL from the CLI
      await crawler.explore(url);
    } catch (error) {
      console.error("An unexpected error occurred during the crawl:", error);
    } finally {
      await browser.close();

      const results = crawler.getResults();
      if (results.length > 0) {
        // 👇 5. The Reporter also uses the dynamic output path
        const reporter = new Reporter(results, options.output);
        await reporter.generateHtmlReport();
        await ReportHelper.saveResults(results, options.output); // Pass path to saveResults as well

        analyzeResultsForCI(results);
      } else {
        console.log("No results were generated.");
      }
    }
  });

/**
 * Analyzes results for CI thresholds.
 * @param results The array of PageResult objects.
 */
function analyzeResultsForCI(results: PageResult[]): void {
  // ... (The CI analysis function we created earlier)
  console.log("\n🔍 Analyzing results for CI thresholds...");

  const thresholds = { maxCriticalAccessibilityIssues: 0, maxBrokenLinks: 0 };
  let issuesFound = false;
  // ... (rest of the function logic)

  if (issuesFound) {
    console.log("\n🔥 Failing CI build due to quality issues.");
    process.exit(1);
  } else {
    console.log("\n✅ All quality gates passed!");
  }
}

// 👇 6. This line parses the command-line arguments and executes the appropriate action
program.parse(process.argv);
