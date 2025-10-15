"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceService = void 0;
class PerformanceService {
    page;
    constructor(page) {
        this.page = page;
    }
    getSpeedRating(value, type) {
        if (type === "ttfb") {
            if (value < 0.3)
                return "🟢 Fast";
            if (value < 0.6)
                return "🟡 Medium";
            return "🔴 Slow";
        }
        if (type === "dom") {
            if (value < 1.5)
                return "🟢 Fast";
            if (value < 3)
                return "🟡 Medium";
            return "🔴 Slow";
        }
        if (type === "load") {
            if (value < 2)
                return "🟢 Fast";
            if (value < 4)
                return "🟡 Medium";
            return "🔴 Slow";
        }
        return "⚪ Unknown";
    }
    async collectMetrics() {
        const t = await this.page.evaluate(() => {
            const timing = performance.timing;
            return {
                loadTime: (timing.loadEventEnd - timing.navigationStart) / 1000,
                domContentLoaded: (timing.domContentLoadedEventEnd - timing.navigationStart) / 1000,
                ttfb: (timing.responseStart - timing.navigationStart) / 1000,
            };
        });
        return {
            ...t,
            rating: {
                loadTime: this.getSpeedRating(t.loadTime, "load"),
                domContentLoaded: this.getSpeedRating(t.domContentLoaded, "dom"),
                ttfb: this.getSpeedRating(t.ttfb, "ttfb"),
            },
        };
    }
}
exports.PerformanceService = PerformanceService;
