"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageNavigationService = void 0;
class PageNavigationService {
    page;
    constructor(page) {
        this.page = page;
    }
    async navigateToUrl(url) {
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
    async getPageLinks() {
        return await this.page.$$eval("a[href]", (anchors) => anchors.map((a) => (a.getAttribute("href") || "").trim()));
    }
}
exports.PageNavigationService = PageNavigationService;
