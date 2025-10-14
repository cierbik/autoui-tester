// w nowym pliku src/services/NetworkService.ts
import { Page } from "playwright";
import { NetworkAnalysisResult, ResourceInfo } from "../types/interfaces";

export class NetworkService {
  private page: Page;
  private resources: ResourceInfo[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  public startListening(): void {
    this.resources = [];
    this.page.on("response", async (response) => {
      try {
        const request = response.request();
        const headers = await response.allHeaders();
        const contentLength = parseInt(headers["content-length"] || "0", 10);

        if (contentLength > 0) {
          this.resources.push({
            url: request.url(),
            type: request.resourceType(),
            sizeInKb: Math.round(contentLength / 1024),
          });
        }
      } catch (error) {}
    });
  }

  public async getAnalysis(): Promise<NetworkAnalysisResult> {
    this.page.removeAllListeners("response");

    const unusedCssPercentage = await this._analyzeCssCoverage();

    const totalPageWeightKb = this.resources.reduce(
      (sum, res) => sum + res.sizeInKb,
      0
    );
    const topHeaviestResources = [...this.resources]
      .sort((a, b) => b.sizeInKb - a.sizeInKb)
      .slice(0, 5);

    return {
      totalPageWeightKb,
      totalRequests: this.resources.length,
      topHeaviestResources,
      unusedCssPercentage,
    };
  }

  private async _analyzeCssCoverage(): Promise<number> {
    await this.page.coverage.startCSSCoverage();

    const cssCoverage = await this.page.coverage.stopCSSCoverage();

    let totalBytes = 0;
    let usedBytes = 0;

    for (const entry of cssCoverage) {
      totalBytes += entry.text.length;
      for (const range of entry.ranges) {
        usedBytes += range.end - range.start;
      }
    }

    if (totalBytes === 0) return 0;

    const unusedPercentage = ((totalBytes - usedBytes) / totalBytes) * 100;
    return Math.round(unusedPercentage);
  }
}
