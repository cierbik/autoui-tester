import { Page } from "playwright";

export class MonitoringService {
  private consoleMessages: { type: string; text: string }[] = [];
  private failedRequests: { url: string; status: number }[] = [];

  constructor(private page: Page) {
    this.setupListeners();
  }

  private setupListeners(): void {
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
