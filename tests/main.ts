import { chromium } from "playwright";
import fs from "fs-extra";
import { BasePage } from "../src/pages/BasePage";
import { ReportHelper } from "../src/helpers/ReportHelper";
import { Reporter } from "../src/helpers/Reporter";
import path from "path";
(async () => {
  await ReportHelper.clearReports();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const urlsFile = path.join(__dirname, "..", "src", "helpers", "urls.json");
  const urls: string[] = JSON.parse(fs.readFileSync(urlsFile, "utf8"));
  await fs.ensureDir("reports/screenshots");

  const basePage = new BasePage(page);
  for (const url of urls) {
    console.log(`➡️ Testing: ${url}`);
    await basePage.explore(url);
  }

  await browser.close();
  const reporter = new Reporter(basePage.getResults());
  await reporter.generateHtmlReport();
  await ReportHelper.saveResults(basePage.getResults());
})();
