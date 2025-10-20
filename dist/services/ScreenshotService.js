"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenshotService = void 0;
const path_1 = __importDefault(require("path"));
class ScreenshotService {
    page;
    constructor(page) {
        this.page = page;
    }
    // 👇 FIX: Add the viewportName argument
    async takeScreenshot(url, viewportName) {
        const urlPath = new URL(url).pathname.replace(/\//g, "_") || "home";
        // 👇 FIX: Use viewportName to create a unique file name
        const fileName = `${urlPath}-${viewportName}.png`;
        // Note: The output path is controlled by the Reporter,
        // this service just creates the file.
        const screenshotPath = path_1.default.join("reports", "screenshots", fileName);
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        return screenshotPath;
    }
}
exports.ScreenshotService = ScreenshotService;
