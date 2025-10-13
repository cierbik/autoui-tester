export interface MixedContentResult {
  url: string;
  type: "active" | "passive";
}

export interface HeaderAuditResult {
  name: string;
  value: string | null;
  present: boolean;
  description: string;
  compliant: boolean;
}
export interface BrokenLink {
  url: string;
  status: number;
}

export interface ImageAnalysis {
  src: string;
  altTextMissing: boolean;
  sizeInKb: number;
}

export interface SeoAuditResult {
  titleLength: number;
  metaDescription: string | null;
  h1Count: number;
  brokenLinks: BrokenLink[]; // 👈 Dodaj to
  imageAnalysis: ImageAnalysis[]; // 👈 I to
}
export interface SecurityAuditResult {
  isHttps: boolean;
  mixedContent: MixedContentResult[];
  headers: HeaderAuditResult[];
}
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
  securityAudit: SecurityAuditResult;
  seoAudit: SeoAuditResult;
}
