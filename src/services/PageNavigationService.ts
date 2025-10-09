import { Page, Response } from "playwright";

export class PageNavigationService {
  constructor(private page: Page) {}

  async navigateToUrl(
    url: string
  ): Promise<{ status: number; title: string; response: Response }> {
    const response = await this.page.goto(url, {
      waitUntil: "domcontentloaded",
    });
    if (!response) {
      throw new Error(`Navigation to ${url} failed to return a response.`);
    }

    const status = response.status();
    const title = await this.page.title();

    // 👇 Zwróć cały obiekt response
    return { status, title, response };
  }

  async getPageLinks(): Promise<string[]> {
    return await this.page.$$eval("a[href]", (anchors) =>
      anchors.map((a) => (a.getAttribute("href") || "").trim())
    );
  }
}
