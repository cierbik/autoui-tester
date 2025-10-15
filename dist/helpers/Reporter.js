"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reporter = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
class Reporter {
    results;
    outputDir;
    constructor(results, outputDir = "reports") {
        this.results = results;
        this.outputDir = outputDir;
    }
    async generateHtmlReport() {
        await fs_extra_1.default.ensureDir(this.outputDir);
        const reportDate = new Date().toLocaleString("en-US");
        const totalIssues = this.results.reduce((acc, r) => acc + (r.accessibility?.length ?? 0), 0);
        const summary = {
            pageCount: this.results.length,
            totalAccessibilityIssues: totalIssues,
            reportDate: reportDate,
        };
        const rows = this.results.map((r) => this._generateTableRow(r)).join("");
        const html = this._generateFullHtml(rows, summary);
        const filePath = path_1.default.join(this.outputDir, "report.html");
        await fs_extra_1.default.writeFile(filePath, html, "utf8");
        console.log(`✅ Interactive HTML report generated at: ${filePath}`);
    }
    _formatNetworkAnalysis(analysis) {
        if (!analysis)
            return '<span class="no-data">-</span>';
        const summaryHtml = `
    <div class="net-summary-item"><strong>Page Weight:</strong> ${analysis.totalPageWeightKb} KB</div>
    <div class="net-summary-item"><strong>Requests:</strong> ${analysis.totalRequests}</div>
    <div class="net-summary-item"><strong>Unused CSS:</strong> ${analysis.unusedCssPercentage}%</div>
  `;
        let heaviestHtml = "";
        if (analysis.topHeaviestResources.length > 0) {
            const items = analysis.topHeaviestResources
                .map((res) => `<li><strong>${res.sizeInKb} KB</strong> - <span class="net-url">${res.url}</span></li>`)
                .join("");
            heaviestHtml = `<div class="net-section"><strong>Heaviest Resources:</strong><ul>${items}</ul></div>`;
        }
        return `<div class="net-cell">${summaryHtml}${heaviestHtml}</div>`;
    }
    _formatContentSeoAudit(audit) {
        // Podstawowe SEO
        const basicSeoHtml = `
      <div class="seo-item"><strong>Title Length:</strong> ${audit.titleLength} chars</div>
      <div class="seo-item"><strong>Meta Desc:</strong> ${audit.metaDescription ? "✅ Found" : "❌ Missing"}</div>
      <div class="seo-item"><strong>H1 Tags:</strong> ${audit.h1Count === 1 ? "✅ 1" : `⚠️ ${audit.h1Count}`}</div>
    `;
        // Uszkodzone linki
        let brokenLinksHtml = "";
        if (audit.brokenLinks.length > 0) {
            const items = audit.brokenLinks
                .map((l) => `<li><span class="status-code">${l.status}</span> ${l.url}</li>`)
                .join("");
            brokenLinksHtml = `<div class="seo-section"><strong>Broken Links Found:</strong><ul>${items}</ul></div>`;
        }
        // Analiza obrazków
        const largeImages = audit.imageAnalysis.filter((img) => img.sizeInKb > 200);
        const missingAlts = audit.imageAnalysis.filter((img) => img.altTextMissing);
        let imageAnalysisHtml = "";
        if (largeImages.length > 0 || missingAlts.length > 0) {
            imageAnalysisHtml = `<div class="seo-section"><strong>Image Issues:</strong><ul>`;
            if (missingAlts.length > 0) {
                imageAnalysisHtml += `<li>⚠️ ${missingAlts.length} images missing alt text</li>`;
            }
            if (largeImages.length > 0) {
                imageAnalysisHtml += `<li>🐘 ${largeImages.length} images larger than 200 KB</li>`;
            }
            imageAnalysisHtml += `</ul></div>`;
        }
        return `<div class="seo-cell">${basicSeoHtml}${brokenLinksHtml}${imageAnalysisHtml ||
            '<div class="seo-section-ok">✅ No major content issues</div>'}</div>`;
    }
    _generateTableRow(r) {
        // Rzutuj 'r' na 'any', aby uniknąć błędów TS dla niekompletnych obiektów
        const result = r;
        const relativeScreenshotPath = result.screenshotPath
            ? path_1.default.relative(this.outputDir, result.screenshotPath).replace(/\\/g, "/")
            : null;
        // Używaj operatora '??' do zapewnienia wartości domyślnych dla każdego pola
        return `
    <tr>
      <td><a href="${result.url}" target="_blank">${result.url}</a></td>
      <td>${result.title ?? "N/A"}</td>
      <td class="cell-scrollable">${this._formatConsoleMessages(result.consoleMessages ?? [])}</td>
      <td class="cell-scrollable">${this._formatFailedRequests(result.failedRequests ?? [])}</td>
      <td>
        ${relativeScreenshotPath
            ? `<img src="${relativeScreenshotPath}" alt="Screenshot of ${result.title}" class="screenshot-thumb" loading="lazy" />`
            : `<span class="no-data">${result.title === "CRAWL_ERROR" ? "Crawl Error" : "No Screenshot"}</span>`}
      </td>
      <td>${this._formatAccessibility(result.accessibility)}</td>
      <td class="security-cell">${this._formatSecurityAudit(result.securityAudit)}</td>
      <td>${result.ttfb?.toFixed(2) ?? "-"} s <span class="rating">${result.speedRating?.ttfb ?? ""}</span></td>
      <td>${result.loadTime?.toFixed(2) ?? "-"} s <span class="rating">${result.speedRating?.loadTime ?? ""}</span></td>
      <td>${result.domContentLoaded?.toFixed(2) ?? "-"} s <span class="rating">${result.speedRating?.domContentLoaded ?? ""}</span></td>
      <td class="wrap">${result.smartActions?.join("<br>") || "-"}</td>
      <td>${result.formsDetected ?? "-"}</td>
      <td>${this._formatContentSeoAudit(result.seoAudit)}</td>
      <td>${this._formatNetworkAnalysis(result.networkAnalysis)}</td>
    </tr>`;
    }
    // --- Cell Formatting Helpers ---
    _formatConsoleMessages(messages) {
        if (!messages.length)
            return `<span class="no-data">-</span>`;
        return messages.map((m) => `[${m.type}] ${m.text}`).join("<br>");
    }
    _formatFailedRequests(requests) {
        if (!requests.length)
            return `<span class="no-data">-</span>`;
        return requests.map((fr) => `${fr.url} (${fr.status})`).join("<br>");
    }
    _formatSecurityAudit(audit) {
        if (!audit) {
            return '<span class="no-data">N/A (Crawl Error)</span>';
        }
        // 1. Status HTTPS
        const httpsStatus = audit.isHttps
            ? `<div class="https-status https-secure">🛡️ Secure (HTTPS)</div>`
            : `<div class="https-status https-insecure">❌ Insecure (HTTP)</div>`;
        // 2. Lista nagłówków bezpieczeństwa
        const headersList = audit.headers
            .map((h) => {
            const icon = h.compliant ? "✅" : "❌";
            const statusClass = h.compliant ? "compliant" : "non-compliant";
            return `<div class="header-item ${statusClass}" title="${h.description}">
              <span>${icon} ${h.name}</span>
            </div>`;
        })
            .join("");
        // 3. Lista "Mixed Content" (jeśli istnieje)
        let mixedContentList = "";
        if (audit.mixedContent.length > 0) {
            const items = audit.mixedContent
                .map((mc) => {
                const typeClass = mc.type === "active" ? "mc-label-active" : "mc-label-passive";
                return `<li class="mixed-content-item">
                <span class="mc-label ${typeClass}">${mc.type}</span>
                <span class="mc-url">${mc.url}</span>
              </li>`;
            })
                .join("");
            mixedContentList = `<div class="mixed-content-list">
                          <strong class="mixed-content-title">Mixed Content Found:</strong>
                          <ul>${items}</ul>
                        </div>`;
        }
        return `${httpsStatus}<div class="headers-list">${headersList}</div>${mixedContentList}`;
    }
    _formatAccessibility(issues) {
        if (!issues?.length) {
            return '<div class="accessibility-ok">✅ No issues found</div>';
        }
        return issues
            .map((a) => {
            const impact = a.impact?.toLowerCase() || "unknown";
            return `
          <div class="issue issue-${impact}">
            <span class="impact-label">${impact.toUpperCase()}</span>
            <p>${a.description} <a href="${a.helpUrl}" target="_blank" title="Learn more">[?]</a></p>
          </div>`;
        })
            .join("");
    }
    /**
     * Generates the full HTML structure.
     */
    _generateFullHtml(rows, summary) {
        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>UI Test Report</title>
        <style>${this._getStyles()}</style>
      </head>
      <body>
        <header>
          <h1>UI Test Report</h1>
          <div class="summary">
            <div><strong>Date:</strong> ${summary.reportDate}</div>
            <div><strong>Pages Scanned:</strong> ${summary.pageCount}</div>
            <div><strong>Accessibility Issues Found:</strong> ${summary.totalAccessibilityIssues}</div>
          </div>
        </header>
        
        <main class="table-container">
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Page Title</th>
                <th>Console</th>
                <th>Failed Requests</th>
                <th>Screenshot</th>
                <th>Accessibility (WCAG)</th>
                <th>Security Audit</th>
                <th>Content & SEO Audit</th>
                <th>TTFB</th>
                <th>Load</th>
                <th>DOM</th>
                <th>Actions</th>
                <th>Forms</th>
                <th>Network Analysis</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </main>

        <div id="modal" class="modal">
          <span class="modal-close">&times;</span>
          <img class="modal-content" id="modal-img">
          <div id="modal-caption"></div>
        </div>

        <script>${this._getScripts()}</script>
      </body>
      </html>`;
    }
    /**
     * Returns the JavaScript code for the report.
     */
    _getScripts() {
        return `
      document.addEventListener('DOMContentLoaded', () => {
        const modal = document.getElementById('modal');
        const modalImg = document.getElementById('modal-img');
        const captionText = document.getElementById('modal-caption');
        
        document.querySelectorAll('.screenshot-thumb').forEach(img => {
          img.onclick = () => {
            modal.style.display = 'block';
            modalImg.src = img.src;
            captionText.innerHTML = img.alt;
          }
        });

        const closeModal = () => modal.style.display = 'none';
        
        document.querySelector('.modal-close').onclick = closeModal;
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
            }
        };
      });
    `;
    }
    /**
     * Returns the CSS styles for the report.
     */
    _getStyles() {
        return `
      :root {
        --bg-color: #1a1a1a; --surface-color: #242424; --text-color: #f0f0f0;
        --border-color: #3d3d3d; --header-bg: #2c2c2c; --accent-color: #00bfa5;
        --critical-color: #ff5252; --serious-color: #ffab40; --moderate-color: #ffd740;
        --minor-color: #40c4ff;
      }
      * { box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: var(--bg-color); color: var(--text-color); margin: 0; padding: 1.5rem;
      }
      header { text-align: center; margin-bottom: 2rem; }
      h1 { color: var(--accent-color); margin: 0 0 1rem 0; }
      .summary { display: flex; justify-content: center; gap: 2rem; background: var(--surface-color); padding: 1rem; border-radius: 8px; flex-wrap: wrap; }
      .table-container {
          width: 100%; /* Kontener zajmuje całą dostępną szerokość */
          overflow-x: auto; /* Włącza poziomy scrollbar, GDY tabela jest za szeroka */
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
      table { border-collapse: collapse; width: 100%; min-width: 1800px }
      th, td { border: 1px solid var(--border-color); padding: 0.8rem 1rem; text-align: left; vertical-align: top; }
      th { background-color: var(--header-bg); position: sticky; top: 0; z-index: 2; font-size: 0.9rem; white-space: nowrap; }
      tr:nth-child(even) { background-color: var(--surface-color); }
      tr:hover { background-color: #3a3a3a; }
      a { color: var(--accent-color); text-decoration: none; word-break: break-all; }
      a:hover { text-decoration: underline; }
      .screenshot-thumb { width: 150px; border-radius: 6px; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; }
      .screenshot-thumb:hover { transform: scale(1.05); box-shadow: 0 0 10px rgba(0, 191, 165, 0.5); }
      .cell-scrollable { max-height: 150px; overflow-y: auto; font-size: 0.85rem; max-width: 300px; overflow-wrap: break-word; }
      .wrap { word-wrap: break-word; white-space: normal; }
      .no-data { color: #888; }
      .accessibility-ok { color: #4caf50; font-weight: bold; display: flex; align-items: center; gap: 0.5rem; }
      .issue { border-left: 4px solid; padding: 0.5rem 0.8rem; margin-bottom: 0.5rem; background: rgba(0,0,0,0.2); border-radius: 4px; }
      .issue p { margin: 0; }
      .issue .impact-label { font-weight: bold; display: block; margin-bottom: 0.25rem; font-size: 0.8em; }
      .issue-critical { border-color: var(--critical-color); } .issue-critical .impact-label { color: var(--critical-color); }
      .issue-serious { border-color: var(--serious-color); } .issue-serious .impact-label { color: var(--serious-color); }
      .issue-moderate { border-color: var(--moderate-color); } .issue-moderate .impact-label { color: var(--moderate-color); }
      .issue-minor { border-color: var(--minor-color); } .issue-minor .impact-label { color: var(--minor-color); }
      .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.9); }
      .modal-content { margin: auto; display: block; max-width: 90%; max-height: 85%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 8px; }
      .modal-close { position: absolute; top: 20px; right: 35px; color: #f1f1f1; font-size: 40px; font-weight: bold; cursor: pointer; }
      #modal-caption { text-align: center; color: #ccc; padding: 10px 0; }

    /* --- FIX: Dodano brakujące style dla audytu bezpieczeństwa --- */
      .security-cell { font-size: 0.85rem; white-space: normal; }
      .https-status { font-weight: bold; padding-bottom: 0.5rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); }
      .https-secure { color: var(--accent-color); }
      .https-insecure { color: var(--critical-color); }
      .headers-list { display: flex; flex-direction: column; gap: 0.3rem; }
      .header-item { cursor: help; }
      .header-item.non-compliant { color: #ffab40; }
      .mixed-content-list { margin-top: 0.8rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color); max-height: 100px; overflow-y: auto; }
      .mixed-content-title { color: var(--serious-color); display: block; margin-bottom: 0.25rem; }
      .mixed-content-list ul { margin: 0; padding-left: 1rem; }
      .mixed-content-item { margin-bottom: 0.25rem; word-break: break-all; }
      .mc-label { display: inline-block; padding: 2px 5px; border-radius: 4px; font-size: 0.75em; font-weight: bold; color: #111; margin-right: 0.5rem; }
      .mc-label-active { background-color: var(--critical-color); }
      .mc-label-passive { background-color: var(--moderate-color); }
    /* --- SEO & Content Audit Styles --- */
      .seo-cell { font-size: 0.85rem; }
      .seo-item { margin-bottom: 0.25rem; }
      .seo-section { margin-top: 0.8rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color); }
      .seo-section-ok { margin-top: 0.8rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color); color: var(--accent-color); font-weight: bold; }
      .seo-section ul { margin: 0.25rem 0 0; padding-left: 1rem; max-height: 100px; overflow-y: auto; }
      .seo-section li { margin-bottom: 0.25rem; word-break: break-all; }
      .status-code { font-weight: bold; color: var(--critical-color); margin-right: 0.5em; }
      .rating {
        margin-left: 0.5em;
        font-size: 0.9em;
        font-weight: bold;
      } 
    /* --- Network Analysis Styles --- */
.net-cell { 
  font-size: 0.85rem; 
  white-space: normal;
}
.net-summary-item { 
  margin-bottom: 0.25rem; 
}
.net-section { 
  margin-top: 0.8rem; 
  padding-top: 0.5rem; 
  border-top: 1px solid var(--border-color); 
}
.net-section ul { 
  margin: 0.25rem 0 0; 
  padding-left: 1rem; 
  list-style-type: none; 
  max-height: 120px;
  overflow-y: auto;
}
.net-section li { 
  margin-bottom: 0.25rem; 
}
.net-url { 
  word-break: break-all; 
  opacity: 0.8; 
  font-size: 0.9em;
}    
      @media (max-width: 768px) {
        body { padding: 1rem; }
        .summary { flex-direction: column; gap: 0.5rem; align-items: center; }
        th, td { padding: 0.6rem; font-size: 0.9rem; }
      }
    `;
    }
}
exports.Reporter = Reporter;
