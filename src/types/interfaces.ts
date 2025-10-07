export interface PageResult {
  url: string;
  title: string;
  consoleMessages: { type: string; text: string }[];
  requests: { url: string; status: number }[];
  screenshotPath: string;
  failedRequests: { url: string; status: number }[];
  loadTime?: number;
  domContentLoaded?: number;
  ttfb?: number;
  speedRating?: {
    loadTime: string;
    domContentLoaded: string;
    ttfb: string;
  };
  accessibility?: {
    id: string;
    impact: string;
    description: string;
    help: string;
    helpUrl: string;
    nodes: number;
  }[];
  smartActions?: string[]; // 🔹 np. kliknięcia AI
  formsDetected?: number;
}
