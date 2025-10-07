import { Page } from "playwright";

export class ScreenshotService {
  constructor(private page: Page) {}

  async takeScreenshot(url: string): Promise<string> {
    const screenshotPath = `reports/screenshots/${Date.now()}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  }
}
