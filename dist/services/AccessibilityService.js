"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessibilityService = void 0;
const playwright_1 = __importDefault(require("@axe-core/playwright"));
class AccessibilityService {
    page;
    constructor(page) {
        this.page = page;
    }
    async scan() {
        const results = await new playwright_1.default({ page: this.page }).analyze();
        // Return most important info
        return results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            help: v.help,
            helpUrl: v.helpUrl,
            nodes: v.nodes.length,
        }));
    }
}
exports.AccessibilityService = AccessibilityService;
