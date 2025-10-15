````markdown
# AutoUI Tester 🤖🧪

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Framework-Playwright-green.svg)](https://playwright.dev/)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange.svg)](package.json)
[![CI Status](https://github.com/your-username/autoui-tester/actions/workflows/ui-audit.yml/badge.svg)](https://github.com/your-username/autoui-tester/actions)

**AutoUI Tester** is an advanced and modular framework based on Playwright, designed for automated website auditing. The tool independently explores an entire website, collects key metrics, captures screenshots, and generates a clean, interactive HTML report—all without needing to write test scripts.



---
## ✨ Key Features

The tool performs a comprehensive analysis of every discovered page, covering:

- **🕵️ Smart Exploration:** Automatically discovers and follows internal links up to a configurable depth, collecting titles, HTTP statuses, and screenshots.

- **📊 Performance Analysis:** Measures key metrics (**TTFB**, **DOM Content Loaded**, **Load Time**) and provides an instant rating (🟢 Fast / 🟡 Medium / 🔴 Slow).

- **♿ Accessibility Audit (WCAG):** Uses the **axe-core** engine to check for compliance with WCAG standards, detecting issues like missing `alt` attributes, low contrast, and ARIA violations.

- **🛡️ Security Audit:** Checks for key HTTP security headers (CSP, HSTS, etc.) and detects resources loaded over an insecure connection (Mixed Content).

- **🎯 Content & SEO Audit:** Finds and reports **broken links**, analyzes images for missing alt text and large file sizes, and checks basic SEO metrics.

- **🌐 Network & Resource Analysis:** Calculates total **page weight**, counts network requests, identifies the heaviest resources, and detects **unused CSS**.

- **🤖 Smart Interaction:** Simulates user behavior by automatically filling forms with mock data and clicking on key action buttons.

- **🧾 Interactive Reporting:** Generates a single, self-contained **HTML** file with a detailed, filterable, and sortable results table.

---
## 🛠️ Tech Stack

- **[Playwright](https://playwright.dev/):** For browser automation and crawling.
- **[TypeScript](https://www.typescriptlang.org/):** For robust and type-safe code.
- **[Node.js](https://nodejs.org/):** As the runtime environment.
- **[Commander.js](https://github.com/tj/commander.js):** To create a professional command-line interface (CLI).
- **[Axe-Core](https://github.com/dequelabs/axe-core):** For accessibility scanning.
- **[Faker.js](https://fakerjs.dev/):** For generating realistic mock data for form filling.

---
## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or higher)
- npm (comes with Node.js)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/autoui-tester.git](https://github.com/your-username/autoui-tester.git)
    cd autoui-tester
    ```

2.  **Install dependencies:**
    ```bash
    npm ci
    ```

3.  **Install Playwright's browsers:** (The `--with-deps` flag is crucial for CI environments)
    ```bash
    npx playwright install --with-deps
    ```

4.  **Configure the `audit` script:**
    Open your `package.json` file and add the `audit` script to the `"scripts"` section.
    ```json
    "scripts": {
      "audit": "ts-node src/main.ts"
    },
    ```

---
## 💻 CLI Usage

The primary way to use the tool is via the `npm run audit` script. All arguments after `--` are passed directly to the application.

**To display the help menu:**
```bash
npm run audit -- crawl --help
````

This will show all available commands and options:

```
Usage: autoui-tester crawl [options] <url>

Crawl a website and generate a report

Arguments:
  <url>                 The starting URL to crawl

Options:
  -d, --depth <number>  Maximum crawl depth (default: "2")
  -l, --max-links <number> Maximum links to follow per page (default: "10")
  -o, --output <string> Output directory for the report (default: "reports")
  -h, --help            display help for command
```

### Example Commands

```bash
# Run a basic crawl with default settings
npm run audit -- crawl [https://example.com](https://example.com)

# Run a shallow crawl (depth 0) and save to a custom folder
npm run audit -- crawl [https://example.com](https://example.com) --depth 0 --output my-audit-report
```

-----

## ⚙️ CI/CD Integration

This tool is designed to be used as a quality gate in a CI/CD pipeline like GitHub Actions. It can automatically fail a build if certain quality thresholds are not met (e.g., if new critical accessibility issues or broken links are found).

To set this up, create a `.github/workflows/ui-audit.yml` file in your repository.

\<details\>
\<summary\>Click to see an example GitHub Actions workflow file\</summary\>

```yaml
# .github/workflows/ui-audit.yml

name: AutoUI Tester Audit

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  audit:
    name: Run UI Audit
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run AutoUI Tester
        # Replace the URL with your staging or preview deployment URL
        run: npm run audit -- crawl [https://your-staging-site.com](https://your-staging-site.com) --depth 1

      - name: Upload report artifact
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: ui-audit-report
          path: reports/
```

\</details\>

-----

## 📊 Output

After the crawl is complete, the tool generates the following in the specified output directory (default: `reports/`):

  - **`report.html`**: The main interactive HTML report.
  - **`report.json`**: A JSON file with the raw data from the crawl, useful for diffing or further analysis.
  - **`screenshots/`**: A directory containing all captured screenshots.

-----

## 🤝 Contributing

Contributions are welcome\! If you have ideas for new features or improvements, feel free to open an issue or submit a pull request.

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature`).
6.  Open a Pull Request.

-----

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

