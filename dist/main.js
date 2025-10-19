"use strict";
// src/main.ts
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const commander_1 = require("commander");
const BasePage_1 = require("./pages/BasePage");
const Reporter_1 = require("./helpers/Reporter");
const ReportHelper_1 = require("./helpers/ReportHelper");
// A map of predefined viewport configurations
const VIEWPORT_CONFIGS = {
    desktop: { viewport: { width: 1920, height: 1080 } },
    mobile: playwright_1.devices["iPhone 13 Pro"],
    tablet: playwright_1.devices["iPad Pro 11"],
};
const program = new commander_1.Command();
program
    .name("autoui-tester")
    .description("A modular Playwright-based framework for automatic UI & performance testing.")
    .version("1.0.0");
program
    .command("crawl")
    .description("Crawl a website and generate a report")
    .argument("<url>", "The starting URL to crawl")
    .option("-d, --depth <number>", "Maximum crawl depth", "2")
    .option("-l, --max-links <number>", "Maximum links to follow per page", "2")
    .option("-o, --output <string>", "Output directory for the report", "reports")
    .option("-v, --viewports <string>", 'Comma-separated viewports (e.g., "desktop,mobile")', "desktop")
    .action(async (url, options) => {
    console.log("🚀 Starting crawl for:", url);
    console.log("⚙️ Options:", options);
    // Clear the report directory based on the output option
    await ReportHelper_1.ReportHelper.clearReports(options.output);
    const browser = await playwright_1.chromium.launch({ headless: true });
    // An array to collect results from all viewports
    let allResults = [];
    // Parse the comma-separated viewport names
    const viewportNames = options.viewports
        .split(",")
        .map((v) => v.trim());
    // --- VIEWPORT LOOP ---
    // Iterate over each requested viewport name
    for (const viewportName of viewportNames) {
        console.log(`\n--- Starting audit for viewport: ${viewportName} ---`);
        const viewportConfig = VIEWPORT_CONFIGS[viewportName];
        if (!viewportConfig) {
            console.warn(`⚠️ Unknown viewport name: ${viewportName}. Skipping.`);
            continue; // Skip to the next viewport
        }
        // Create a new context and page for this specific viewport
        const context = await browser.newContext(viewportConfig);
        const page = await context.newPage();
        // Prepare the config for the crawler instance
        const crawlerConfig = {
            maxDepth: parseInt(options.depth, 10),
            maxLinksPerPage: parseInt(options.maxLinks, 10),
        };
        // Create a new BasePage (crawler) instance for this context
        const crawler = new BasePage_1.BasePage(page, viewportName, crawlerConfig);
        try {
            // Start the crawl
            await crawler.explore(url);
            // Add the results from this crawl to the main results array
            allResults = allResults.concat(crawler.getResults());
        }
        catch (error) {
            console.error(`An unexpected error occurred during crawl for viewport ${viewportName}:`, error);
        }
        finally {
            await context.close(); // Close the context to free up resources
        }
    }
    // --- END OF VIEWPORT LOOP ---
    await browser.close(); // Close the browser after all viewports are done
    // Generate the final report if any results were collected
    if (allResults.length > 0) {
        const reporter = new Reporter_1.Reporter(allResults, options.output);
        await reporter.generateHtmlReport();
        await ReportHelper_1.ReportHelper.saveResults(allResults, options.output);
        // Run the CI analysis on the combined results
        analyzeResultsForCI(allResults);
    }
    else {
        console.log("No results were generated across all viewports.");
    }
});
/**
 * Analyzes the crawl results against defined quality thresholds.
 * Exits with a non-zero code if any threshold is breached (for CI/CD).
 * @param results The array of PageResult objects.
 */
function analyzeResultsForCI(results) {
    console.log("\n🔍 Analyzing results for CI thresholds...");
    // Define your quality gates (thresholds) here
    const thresholds = {
        maxCriticalAccessibilityIssues: 0,
        maxBrokenLinks: 5,
    };
    let criticalAccessibilityIssues = 0;
    let brokenLinks = 0;
    let issuesFound = false;
    // Aggregate issues from all page results
    for (const result of results) {
        if (result.accessibility) {
            criticalAccessibilityIssues += result.accessibility.filter((issue) => issue.impact === "critical").length;
        }
        if (result.seoAudit && result.seoAudit.brokenLinks) {
            brokenLinks += result.seoAudit.brokenLinks.length;
        }
    }
    console.log(`- Found ${criticalAccessibilityIssues} critical accessibility issues.`);
    console.log(`- Found ${brokenLinks} broken links.`);
    // Check if any thresholds were breached
    if (criticalAccessibilityIssues > thresholds.maxCriticalAccessibilityIssues) {
        console.error(`❌ CI Threshold breached: Found ${criticalAccessibilityIssues} critical accessibility issues (limit is ${thresholds.maxCriticalAccessibilityIssues}).`);
        issuesFound = true;
    }
    if (brokenLinks > thresholds.maxBrokenLinks) {
        console.error(`❌ CI Threshold breached: Found ${brokenLinks} broken links (limit is ${thresholds.maxBrokenLinks}).`);
        issuesFound = true;
    }
    if (issuesFound) {
        console.log("\n🔥 Failing CI build due to quality issues.");
        process.exit(1); // Exit with an error code to fail the pipeline
    }
    else {
        console.log("\n✅ All quality gates passed!");
    }
}
// Parse command-line arguments and run the program
program.parse(process.argv);
