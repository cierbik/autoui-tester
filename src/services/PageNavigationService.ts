import { Page } from "playwright";

export class PageNavigationService {
  constructor(private page: Page) {}

  async navigateToUrl(url: string): Promise<{ status: number; title: string }> {
    const response = await this.page.goto(url, {
      waitUntil: "domcontentloaded",
    });
    const status = response!.status();
    const title = await this.page.title();

    return { status, title };
  }

  async getPageLinks(): Promise<string[]> {
    return await this.page.$$eval("a[href]", (anchors) =>
      anchors.map((a) => (a.getAttribute("href") || "").trim())
    );
  }
}
