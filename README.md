# 🤖 AutoUI Tester

### 🧠 Intelligent Web UI & Performance Testing Framework

AutoUI Tester is a modular Playwright-based framework for **automatic exploration, performance auditing, accessibility scanning, and reporting** of any web application.

This tool can crawl entire websites, collect key metrics, capture screenshots, and generate a clean **HTML report** — all without writing extra test scripts.

---

## 🚀 Features

### 🔍 Smart Explorer

- Discovers internal links up to a configurable depth
- Collects **page titles**, **URLs**, and **HTTP statuses**
- Captures **screenshots** for every visited page
- Detects **console errors** and **failed requests**

### ⚡ Performance Analysis

Powered by `PerformanceService`, it measures:

| Metric              | Description                     | Rating                        |
| ------------------- | ------------------------------- | ----------------------------- |
| ⏱️ Load Time        | Total time until full page load | 🟢 Fast / 🟡 Medium / 🔴 Slow |
| 🧩 DOMContentLoaded | Time to DOM readiness           | 🟢 / 🟡 / 🔴                  |
| ⚙️ TTFB             | Time To First Byte              | 🟢 / 🟡 / 🔴                  |

### ♿ Accessibility Auditing

`AccessibilityService` uses [axe-core/playwright](https://github.com/dequelabs/axe-core-npm) to:

- Check **WCAG 2.1 compliance**
- Detect **missing alt attributes**, **contrast issues**, **ARIA violations**
- Return structured accessibility issues per page

### 🧠 AI-like Smart Exploration _(Experimental)_

`SmartExplorerService` heuristically:

- Identifies **key pages** like Login, Contact, Products
- Simulates user paths
- Avoids repetitive or external links intelligently

### 🧾 Reporting

`Reporter` generates:

- 📄 **HTML reports** → `reports/report.html`
- 📦 **JSON logs** → `reports/logs.json`
- Includes screenshots, console logs, performance, and accessibility data

---

## 🧩 How It Works

| Component                 | Description                                   |
| ------------------------- | --------------------------------------------- |
| 🧭 `BasePage`             | Orchestrates exploration and calls services   |
| 🔎 `MonitoringService`    | Collects console messages and failed requests |
| ⚡ `PerformanceService`   | Measures load, DOMContentLoaded, and TTFB     |
| ♿ `AccessibilityService` | Runs axe-core accessibility audits            |
| 🧠 `SmartExplorerService` | Optional AI-like exploration                  |
| 🧾 `Reporter`             | Generates HTML and JSON reports               |
| 🧹 `ReportHelper`         | Clears old reports and saves new ones         |

---

## 🧱 Extend the Framework

You can add:

- 🖼️ **Visual Regression Testing** → compare screenshots across runs
- 🔍 **SEO Audits** → extract meta tags, headings, and links
- 🔐 **Security Checks** → detect mixed content or HTTP-only cookies
- 🔄 **CI/CD Integration** → export results to Slack, GitHub, or Jenkins

---

## 🧠 Future Roadmap

- 🤖 AI-based auto form filling
- 📱 Multi-device & responsive mode testing
- 📊 Trend analytics with performance history
- 🚦 Lighthouse integration
- 🧭 Smart navigation learning

---

## ⚙️ Installation

```bash
git clone https://github.com/yourusername/autoui-tester.git
cd autoui-tester
npm install
npx playwright install
```
