"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenshotService = void 0;
class ScreenshotService {
    page;
    constructor(page) {
        this.page = page;
    }
    async takeScreenshot(url) {
        const screenshotPath = `reports/screenshots/${Date.now()}.png`;
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        return screenshotPath;
    }
}
exports.ScreenshotService = ScreenshotService;
