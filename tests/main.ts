import { chromium } from "playwright";
import fs from "fs-extra";
import { BasePage } from "../src/pages/BasePage";
import { ReportHelper } from "../src/helpers/ReportHelper";
import { Reporter } from "../src/helpers/Reporter";
(async () => {
  await ReportHelper.clearReports();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fs.ensureDir("reports/screenshots");

  const basePage = new BasePage(page);
  await basePage.explore("https://twinklecandle.com");

  await browser.close();
  const reporter = new Reporter(basePage.getResults());
  await reporter.generateHtmlReport();
  await ReportHelper.saveResults(basePage.getResults());
})();
