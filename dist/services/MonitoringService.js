"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
class MonitoringService {
    page;
    consoleMessages = [];
    failedRequests = [];
    constructor(page) {
        this.page = page;
        this.setupListeners();
    }
    setupListeners() {
        this.page.on("console", (msg) => {
            this.consoleMessages.push({ type: msg.type(), text: msg.text() });
        });
        this.page.on("response", (response) => {
            const status = response.status();
            if (status !== 200) {
                this.failedRequests.push({ url: response.url(), status });
            }
        });
    }
    getConsoleMessages() {
        return this.consoleMessages;
    }
    getFailedRequests() {
        return this.failedRequests;
    }
}
exports.MonitoringService = MonitoringService;
