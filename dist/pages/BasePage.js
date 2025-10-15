"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePage = void 0;
const PageNavigationService_1 = require("../services/PageNavigationService");
const PerformanceService_1 = require("../services/PerformanceService");
const MonitoringService_1 = require("../services/MonitoringService");
const ScreenshotService_1 = require("../services/ScreenshotService");
const AccessibilityService_1 = require("../services/AccessibilityService");
const SmartExplorer_1 = require("../services/SmartExplorer");
const SecurityAuditor_1 = require("../services/SecurityAuditor");
const ContentSeoService_1 = require("../services/ContentSeoService");
const NetworkService_1 = require("../services/NetworkService");
class BasePage {
    page;
    visited = new Set();
    results = [];
    config; // Configuration object
    navigationService;
    performanceService;
    monitoringService;
    screenshotService;
    accessibilityService;
    smartExplorer;
    securityAuditor;
    contentSeoService;
    networkService;
    constructor(page, config) {
        this.page = page;
        // 👇 FIX: Introducing a config object for flexibility
        this.config = {
            maxDepth: 1,
            maxLinksPerPage: 1,
            ...config,
        };
        // Initialize services
        this.navigationService = new PageNavigationService_1.PageNavigationService(page);
        this.performanceService = new PerformanceService_1.PerformanceService(page);
        this.monitoringService = new MonitoringService_1.MonitoringService(page);
        this.screenshotService = new ScreenshotService_1.ScreenshotService(page);
        this.accessibilityService = new AccessibilityService_1.AccessibilityService(page);
        this.smartExplorer = new SmartExplorer_1.SmartExplorer(page);
        this.securityAuditor = new SecurityAuditor_1.SecurityAuditor(); // Stateless version, no 'page' in constructor
        this.contentSeoService = new ContentSeoService_1.ContentSeoService(page);
        this.networkService = new NetworkService_1.NetworkService(page);
    }
    async explore(url, depth = 0) {
        if (this.visited.has(url) || depth > this.config.maxDepth)
            return;
        this.visited.add(url);
        console.log(`🔍 Visiting: ${url}`);
        // 👇 FIX: Start listening for network requests BEFORE navigating to the page
        this.networkService.startListening();
        try {
            const { status, title, response } = await this.navigationService.navigateToUrl(url);
            // 👇 FIX: Running all independent audits in PARALLEL for maximum performance
            const [perf, screenshotPath, accessibility, smartData, securityAudit, seoAudit,] = await Promise.all([
                this.performanceService.collectMetrics(),
                this.screenshotService.takeScreenshot(url),
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
        }
        catch (error) {
            console.error(`❌ Failed to process ${url}:`, error);
            // Optional: Save error information to the results
            this.results.push({ url, title: "CRAWL_ERROR", httpStatus: 0 });
        }
        const links = await this.navigationService.getPageLinks();
        await this.processLinks(links, depth);
    }
    async processLinks(links, depth) {
        const linksToFollow = links
            .filter((link) => !this.visited.has(link) &&
            link.startsWith("http") &&
            !link.match(/\.(zip|pdf|png|jpg|jpeg|gif|svg|exe|mp4|mp3|avi|mov)$/i))
            // 👇 FIX: Using the value from the config object
            .slice(0, this.config.maxLinksPerPage);
        for (const link of linksToFollow) {
            // 👇 FIX: Correct depth incrementation
            await this.explore(link, depth + 1);
        }
    }
    getResults() {
        return this.results;
    }
}
exports.BasePage = BasePage;
