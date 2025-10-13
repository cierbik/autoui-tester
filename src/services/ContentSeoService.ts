import { Page } from "playwright";
import { SeoAuditResult, BrokenLink, ImageAnalysis } from "../types/interfaces";

export class ContentSeoService {
  constructor(private page: Page) {}

  public async audit(): Promise<SeoAuditResult> {
    const [basicSeo, brokenLinks, imageAnalysis] = await Promise.all([
      this._getBasicSeo(),
      this._findBrokenLinks(),
      this._analyzeImages(),
    ]);

    return {
      ...basicSeo,
      brokenLinks,
      imageAnalysis,
    };
  }

  /** Zbiera podstawowe dane SEO (przeniesione z poprzedniej wersji) */
  private async _getBasicSeo() {
    const titleLength = (await this.page.title()).length;
    const metaDescription = await this.page
      .locator('meta[name="description"]')
      .getAttribute("content");
    const h1Count = await this.page.locator("h1").count();
    return { titleLength, metaDescription, h1Count };
  }

  /** Znajduje wszystkie linki na stronie i sprawdza, czy nie są uszkodzone */
  private async _findBrokenLinks(): Promise<BrokenLink[]> {
    const links = await this.page.$$eval(
      "a[href]",
      (anchors: HTMLAnchorElement[]) => anchors.map((a) => a.href)
    );

    const uniqueLinks = [...new Set(links)].filter((link) =>
      link.startsWith("http")
    );
    const brokenLinks: BrokenLink[] = [];

    for (const link of uniqueLinks) {
      try {
        const response = await this.page
          .context()
          .request.head(link, { timeout: 5000 });
        if (response.status() >= 400) {
          brokenLinks.push({ url: link, status: response.status() });
        }
      } catch (error) {
        // Ignorujemy błędy timeoutu lub DNS, aby nie przerywać skanowania
        console.warn(`Could not check link ${link}:`, error.message);
      }
    }
    return brokenLinks;
  }

  /** Analizuje wszystkie obrazki pod kątem braku tekstu alternatywnego i rozmiaru */
  private async _analyzeImages(): Promise<ImageAnalysis[]> {
    const images = await this.page
      .locator("img")
      .evaluateAll((imgs) =>
        imgs.map((img) => ({
          src: (img as HTMLImageElement).src,
          alt: (img as HTMLImageElement).alt,
        }))
      );

    const analysisResults: ImageAnalysis[] = [];
    for (const img of images) {
      let sizeInKb = 0;
      try {
        const response = await this.page
          .context()
          .request.head(img.src, { timeout: 5000 });
        const sizeInBytes = parseInt(
          response.headers()["content-length"] || "0",
          10
        );
        if (sizeInBytes > 0) {
          sizeInKb = Math.round(sizeInBytes / 1024);
        }
      } catch (error) {
        console.warn(
          `Could not fetch image size for ${img.src}:`,
          error.message
        );
      }

      analysisResults.push({
        src: img.src,
        altTextMissing: !img.alt,
        sizeInKb: sizeInKb,
      });
    }
    return analysisResults;
  }
}
