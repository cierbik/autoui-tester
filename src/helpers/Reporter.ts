import fs from "fs-extra";
import path from "path";

export class Reporter {
  constructor(private results: any[], private outputDir = "reports") {}

  async generateHtmlReport() {
    await fs.ensureDir(this.outputDir);

    const rows = this.results
      .map((r) => {
        // konwersja na string tylko do wyświetlenia
        const consoleMsgsHtml = r.consoleMessages.length
          ? r.consoleMessages.map((m) => `[${m.type}] ${m.text}`).join("<br>")
          : "-";

        const failedReqsHtml = r.failedRequests.length
          ? r.failedRequests.join("<br>")
          : r.requests
              .filter((req) => req.status !== 200)
              .map((req) => `${req.url} (${req.status})`)
              .join("<br>") || "-";

        return `
      <tr>
        <td><a href="${r.url}" target="_blank">${r.url}</a></td>
        <td>${r.title}</td>
        <td>
  ${
    r.consoleMessages.length
      ? r.consoleMessages.map((cm) => `[${cm.type}] ${cm.text}`).join("<br>")
      : "-"
  }
  </td>
          <td>
    ${
      r.failedRequests.length
        ? r.failedRequests.map((fr) => `${fr.url} (${fr.status})`).join("<br>")
        : "-"
    }
  </td>
      <td><img src="${path.relative(
        this.outputDir,
        r.screenshotPath
      )}" width="200"/>
          
      </td>
      <td>
    ${
      r.accessibility?.length
        ? r.accessibility
            .map(
              (a) =>
                `<b>${a.impact?.toUpperCase()}</b>: ${a.description} <a href="${
                  a.helpUrl
                }" target="_blank">[more]</a>`
            )
            .join("<br>")
        : "✅ No issues"
    }
    </td> 
    <td>${r.ttfb?.toFixed(2)} s (${r.speedRating?.ttfb || "-"})</td>
    <td>${r.loadTime?.toFixed(2)} s (${r.speedRating?.loadTime || "-"})</td>
    <td>${r.domContentLoaded?.toFixed(2)} s (${
          r.speedRating?.domContentLoaded || "-"
        })</td>
        <td>${r.smartActions?.length ? r.smartActions.join("<br>") : "-"}</td>
        <td>${r.formsDetected ?? "-"}</td>

          </tr>
        `;
      })
      .join("");

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>UI Test Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          img { border: 1px solid #ddd; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>UI Test Report</h1>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Title</th>
              <th>Console Errors</th>
              <th>Failed Requests</th>
              <th>Screenshot</th>
              <th>Accessibility Issues</th>
              <th>Load Time</th>
              <th>DOMContentLoaded</th>
              <th>TTFB</th>
              <th>Smart Actions</th>
              <th>Forms</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const filePath = path.join(this.outputDir, "report.html");
    await fs.writeFile(filePath, html, "utf8");
    console.log(`✅ HTML report generated at ${filePath}`);
  }
}
