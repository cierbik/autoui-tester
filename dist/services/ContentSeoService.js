"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentSeoService = void 0;
class ContentSeoService {
    page;
    constructor(page) {
        this.page = page;
    }
    async audit() {
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
    /** Collecting basic SEO information like title, meta description, and H1 tags */
    async _getBasicSeo() {
        const titleLength = (await this.page.title()).length;
        const metaDescLocator = this.page.locator('meta[name="description"]');
        const metaDescription = (await metaDescLocator.count()) > 0
            ? await metaDescLocator.getAttribute("content")
            : null;
        const h1Count = await this.page.locator("h1").count();
        return { titleLength, metaDescription, h1Count };
    }
    /** Finding all links on the page and checking their HTTP status */
    async _findBrokenLinks() {
        const links = await this.page.$$eval("a[href]", (anchors) => anchors.map((a) => a.href));
        const uniqueLinks = [...new Set(links)].filter((link) => link.startsWith("http"));
        const brokenLinks = [];
        for (const link of uniqueLinks) {
            try {
                const response = await this.page
                    .context()
                    .request.head(link, { timeout: 5000 });
                if (response.status() >= 400) {
                    brokenLinks.push({ url: link, status: response.status() });
                }
            }
            catch (error) {
                // Ignore network errors and timeouts to not flood the report
                console.warn(`Could not check link ${link}:`, error.message);
            }
        }
        return brokenLinks;
    }
    /** Analyzing images for alt text and size */
    async _analyzeImages() {
        const images = await this.page.locator("img").evaluateAll((imgs) => imgs.map((img) => ({
            src: img.src,
            alt: img.alt,
        })));
        const analysisResults = [];
        for (const img of images) {
            let sizeInKb = 0;
            try {
                const response = await this.page
                    .context()
                    .request.head(img.src, { timeout: 5000 });
                const sizeInBytes = parseInt(response.headers()["content-length"] || "0", 10);
                if (sizeInBytes > 0) {
                    sizeInKb = Math.round(sizeInBytes / 1024);
                }
            }
            catch (error) {
                console.warn(`Could not fetch image size for ${img.src}:`, error.message);
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
exports.ContentSeoService = ContentSeoService;
