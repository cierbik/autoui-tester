"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityAuditor = void 0;
/**
 * A service class to perform a basic security audit on a web page.
 * It checks for HTTPS usage, mixed content, and essential security headers.
 */
class SecurityAuditor {
    // A list of headers we want to check for.
    HEADERS_TO_AUDIT = [
        "Content-Security-Policy",
        "Strict-Transport-Security",
        "X-Frame-Options",
        "X-Content-Type-Options",
        "Referrer-Policy",
    ];
    async audit(page, response) {
        const isHttps = response.url().startsWith("https://");
        const headers = this._auditHeaders(response);
        const mixedContent = isHttps ? await this._detectMixedContent(page) : [];
        return {
            isHttps,
            mixedContent,
            headers,
        };
    }
    /**
     * Checks for the presence and basic compliance of important security headers.
     * @param response - The main network response.
     */
    _auditHeaders(response) {
        const receivedHeaders = response.headers();
        const auditResults = [];
        for (const headerName of this.HEADERS_TO_AUDIT) {
            const lowerCaseHeaderName = headerName.toLowerCase();
            const value = receivedHeaders[lowerCaseHeaderName] || null;
            const present = value !== null;
            let compliant = false;
            let description = "";
            // Basic compliance checks and descriptions
            switch (lowerCaseHeaderName) {
                case "content-security-policy":
                    description =
                        "Helps prevent XSS attacks by defining allowed content sources.";
                    compliant = present;
                    break;
                case "strict-transport-security":
                    description = "Enforces secure (HTTPS) connections to the server.";
                    compliant = present;
                    break;
                case "x-frame-options":
                    description = "Protects against Clickjacking attacks.";
                    compliant = present && (value === "DENY" || value === "SAMEORIGIN");
                    break;
                case "x-content-type-options":
                    description =
                        "Prevents browsers from MIME-sniffing a response away from the declared content-type.";
                    compliant = present && value === "nosniff";
                    break;
                case "referrer-policy":
                    description =
                        "Controls how much referrer information is sent with requests.";
                    compliant =
                        present &&
                            [
                                "no-referrer",
                                "strict-origin",
                                "strict-origin-when-cross-origin",
                            ].includes(value || "");
                    break;
            }
            auditResults.push({
                name: headerName,
                value,
                present,
                description,
                compliant,
            });
        }
        return auditResults;
    }
    /**
     * Listens for all page requests to detect insecure (http://) resources on a secure (https://) page.
     * @param page - The Playwright Page instance.
     */
    async _detectMixedContent(page) {
        const insecureRequests = [];
        const activeContentTypes = [
            "script",
            "stylesheet",
            "iframe",
            "fetch",
            "xhr",
        ];
        page.on("request", (request) => {
            const url = request.url();
            if (url.startsWith("http://")) {
                const resourceType = request.resourceType();
                insecureRequests.push({
                    url,
                    type: activeContentTypes.includes(resourceType)
                        ? "active"
                        : "passive",
                });
            }
        });
        // We need to wait for the page to be fully loaded to ensure all requests are captured.
        await page.waitForLoadState("load");
        // It's good practice to remove the listener after use, although here the page context is temporary.
        page.removeAllListeners("request");
        return insecureRequests;
    }
}
exports.SecurityAuditor = SecurityAuditor;
