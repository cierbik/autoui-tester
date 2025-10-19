import { Page } from "playwright";
import { PageResult, CrawlerConfig } from "../types/interfaces"; // Ensure you import CrawlerConfig
import { PageNavigationService } from "../services/PageNavigationService";
import { PerformanceService } from "../services/PerformanceService";
import { MonitoringService } from "../services/MonitoringService";
import { ScreenshotService } from "../services/ScreenshotService";
import { AccessibilityService } from "../services/AccessibilityService";
import { SmartExplorer } from "../services/SmartExplorer";
import { SecurityAuditor } from "../services/SecurityAuditor";
import { ContentSeoService } from "../services/ContentSeoService";
import { NetworkService } from "../services/NetworkService";

export class BasePage {
  protected page: Page;
  protected visited = new Set<string>();
  protected results: PageResult[] = [];
  private config: CrawlerConfig; // Configuration object
  private viewportName: string;

  private navigationService: PageNavigationService;
  private performanceService: PerformanceService;
  private monitoringService: MonitoringService;
  private screenshotService: ScreenshotService;
  private accessibilityService: AccessibilityService;
  private smartExplorer: SmartExplorer;
  private securityAuditor: SecurityAuditor;
  private contentSeoService: ContentSeoService;
  private networkService: NetworkService;

  constructor(
    page: Page,
    viewportName: string,
    config?: Partial<CrawlerConfig>
  ) {
    this.page = page;
    this.viewportName = viewportName;
    // 👇 FIX: Introducing a config object for flexibility
    this.config = {
      maxDepth: 1,
      maxLinksPerPage: 2,
      ...config,
    };

    // Initialize services
    this.navigationService = new PageNavigationService(page);
    this.performanceService = new PerformanceService(page);
    this.monitoringService = new MonitoringService(page);
    this.screenshotService = new ScreenshotService(page);
    this.accessibilityService = new AccessibilityService(page);
    this.smartExplorer = new SmartExplorer(page);
    this.securityAuditor = new SecurityAuditor(); // Stateless version, no 'page' in constructor
    this.contentSeoService = new ContentSeoService(page);
    this.networkService = new NetworkService(page);
  }

  async explore(url: string, depth = 0): Promise<void> {
    if (this.visited.has(url) || depth > this.config.maxDepth) return;
    this.visited.add(url);

    console.log(`[${this.viewportName}] 🔍 Visiting: ${url}`);
    // 👇 FIX: Start listening for network requests BEFORE navigating to the page
    this.networkService.startListening();

    try {
      const { status, title, response } =
        await this.navigationService.navigateToUrl(url);

      // 👇 FIX: Running all independent audits in PARALLEL for maximum performance
      const [
        perf,
        screenshotPath,
        accessibility,
        smartData,
        securityAudit,
        seoAudit,
      ] = await Promise.all([
        this.performanceService.collectMetrics(),
        this.screenshotService.takeScreenshot(url, this.viewportName),
        this.accessibilityService.scan(),
        this.smartExplorer.explorePage(),
        this.securityAuditor.audit(this.page, response),
        this.contentSeoService.audit(),
      ]);

      // 👇 FIX: Perform network analysis at the end, after all resources have been collected
      const networkAnalysis = await this.networkService.getAnalysis();

      // 👇 FIX: Completed missing fields and corrected variable naming
      this.results.push({
        url,
        title,
        viewport: this.viewportName,
        htppStatus: status,
        consoleMessages: this.monitoringService.getConsoleMessages(),
        requests: this.monitoringService.getFailedRequests(), // This field is likely redundant if you have failedRequests
        failedRequests: this.monitoringService.getFailedRequests(),
        screenshotPath,
        loadTime: perf.loadTime,
        domContentLoaded: perf.domContentLoaded,
        ttfb: perf.ttfb,
        speedRating: perf.rating,
        accessibility,
        smartActions: smartData.actions,
        formsDetected: smartData.forms,
        securityAudit,
        seoAudit,
        networkAnalysis,
      });
    } catch (error) {
      console.error(`❌ Failed to process ${url}:`, error);
      // Optional: Save error information to the results
      this.results.push({
        url,
        title: "CRAWL_ERROR",
        viewport: this.viewportName,
        httpStatus: 0,
      } as any);
    }

    const links = await this.navigationService.getPageLinks();
    await this.processLinks(links, depth);
  }

  private async processLinks(links: string[], depth: number): Promise<void> {
    const linksToFollow = links
      .filter(
        (link) =>
          !this.visited.has(link) &&
          link.startsWith("http") &&
          !link.match(/\.(zip|pdf|png|jpg|jpeg|gif|svg|exe|mp4|mp3|avi|mov)$/i)
      )
      // 👇 FIX: Using the value from the config object
      .slice(0, this.config.maxLinksPerPage);

    for (const link of linksToFollow) {
      // 👇 FIX: Correct depth incrementation
      await this.explore(link, depth + 1);
    }
  }

  getResults(): PageResult[] {
    return this.results;
  }
}
