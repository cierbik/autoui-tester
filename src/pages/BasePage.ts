import { Page } from "playwright";
import { PageResult } from "../types/interfaces";
import { PageNavigationService } from "../services/PageNavigationService";
import { PerformanceService } from "../services/PerformanceService";
import { MonitoringService } from "../services/MonitoringService";
import { ScreenshotService } from "../services/ScreenshotService";
import { AccessibilityService } from "../services/AccessibilityService";
import { SmartExplorer } from "../services/SmartExplorer";
import { SecurityAuditor } from "../services/SecurityAuditor";

export class BasePage {
  protected page: Page;
  protected visited = new Set<string>();
  protected results: PageResult[] = [];

  private navigationService: PageNavigationService;
  private performanceService: PerformanceService;
  private monitoringService: MonitoringService;
  private screenshotService: ScreenshotService;
  private accessibilityService: AccessibilityService;
  private smartExplorer: SmartExplorer;
  private securityAuditor: SecurityAuditor;

  constructor(page: Page) {
    this.page = page;
    this.navigationService = new PageNavigationService(page);
    this.performanceService = new PerformanceService(page);
    this.monitoringService = new MonitoringService(page);
    this.screenshotService = new ScreenshotService(page);
    this.accessibilityService = new AccessibilityService(page);
    this.smartExplorer = new SmartExplorer(page);
    // 👇 POPRAWKA 1: Przekaż 'page' do konstruktora SecurityAuditor
    this.securityAuditor = new SecurityAuditor();
  }

  async explore(url: string, depth = 0): Promise<void> {
    if (this.visited.has(url) || depth > 5) return;
    this.visited.add(url);

    console.log(`🔍 Visiting: ${url}`);

    const { status, title, response } =
      await this.navigationService.navigateToUrl(url);

    const securityAudit = await this.securityAuditor.audit(this.page, response);

    // Collect performance metrics
    const perf = await this.performanceService.collectMetrics();

    // Take screenshot
    const screenshotPath = await this.screenshotService.takeScreenshot(url);

    // Accessibility scan
    const accessibility = await this.accessibilityService.scan();

    // Smart exploration
    const smartData = await this.smartExplorer.explorePage(url);

    // Store results
    this.results.push({
      url,
      title,
      consoleMessages: this.monitoringService.getConsoleMessages(),
      requests: this.monitoringService.getFailedRequests(),
      failedRequests: this.monitoringService.getFailedRequests(),
      screenshotPath,
      loadTime: perf.loadTime,
      domContentLoaded: perf.domContentLoaded,
      ttfb: perf.ttfb,
      speedRating: perf.rating,
      accessibility,
      smartActions: smartData.actions,
      formsDetected: smartData.forms,
      securityAudit: securityAudit,
    });

    // Get and process links
    const links = await this.navigationService.getPageLinks();
    await this.processLinks(links, depth);
  }

  private async processLinks(links: string[], depth: number): Promise<void> {
    for (const link of links.slice(0, 3)) {
      if (
        !this.visited.has(link) &&
        link.startsWith("http") &&
        !link.match(/\.(zip|pdf|png|jpg|jpeg|gif|svg|exe|mp4|mp3|avi|mov)$/i)
      ) {
        await this.explore(link, depth + 2);
      }
    }
  }

  getResults(): PageResult[] {
    return this.results;
  }
}
