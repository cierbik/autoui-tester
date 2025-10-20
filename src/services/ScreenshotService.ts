import { Page } from "playwright";
import path from "path";

export class ScreenshotService {
  constructor(private page: Page) {}

  // 👇 FIX: Add the viewportName argument
  async takeScreenshot(url: string, viewportName: string): Promise<string> {
    const urlPath = new URL(url).pathname.replace(/\//g, "_") || "home";
    // 👇 FIX: Use viewportName to create a unique file name
    const fileName = `${urlPath}-${viewportName}.png`;

    // Note: The output path is controlled by the Reporter,
    // this service just creates the file.
    const screenshotPath = path.join("reports", "screenshots", fileName);

    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  }
}
