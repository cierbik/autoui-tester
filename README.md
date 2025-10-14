
# AutoUI Tester 🤖🧪

[](https://opensource.org/licenses/MIT)
[](https://www.typescriptlang.org/)
[](https://playwright.dev/)
[](https://www.google.com/search?q=package.json)

**AutoUI Tester** is an advanced and modular framework based on Playwright, designed for automated website auditing. The tool independently explores an entire website, collects key metrics, captures screenshots, and generates a clean, interactive HTML report—all without needing to write test scripts.

-----

## \#\# ✨ Key Features

The tool performs a comprehensive analysis of every discovered page, covering:

  * **🕵️ Smart Exploration:**

      * Automatically discovers and follows internal links up to a configurable depth.
      * Collects page titles, HTTP statuses, and captures screenshots for every visited page.

  * **📊 Performance Analysis:**

      * Measures key Web Vitals: **TTFB**, **DOM Content Loaded**, and **Load Time**.
      * Automatically provides a rating for each metric (🟢 Fast / 🟡 Medium / 🔴 Slow) for immediate feedback.

  * **♿ Accessibility Audit (WCAG):**

      * Uses the **axe-core** engine to check for compliance with WCAG standards.
      * Detects issues such as missing `alt` attributes, low contrast, and ARIA violations.

  * **🛡️ Security Audit:**

      * Checks for the presence and correctness of key HTTP security headers (CSP, HSTS, X-Frame-Options, etc.).
      * Detects resources loaded over an insecure connection (Mixed Content).

  * **🎯 Content & SEO Audit:**

      * Finds and reports **broken links** that return 4xx/5xx errors.
      * Analyzes images for missing alt text and excessively large file sizes.
      * Checks basic SEO metrics like title length, meta description presence, and `<h1>` tag count.

  * **🌐 Network & Resource Analysis:**

      * Calculates the **total page weight** and the number of network requests.
      * Identifies the **top 5 heaviest resources** (images, scripts) that slow down loading.
      * Detects **unused CSS**, indicating potential areas for optimization.

  * **🧾 Interactive Reporting:**

      * Generates a single, self-contained **HTML** file with a clean results table.
      * Allows for easy viewing of screenshots, failed requests, and detailed audit results.

-----

## \#\# 🛠️ Tech Stack

  * **[Playwright](https://playwright.dev/):** For browser automation and crawling.
  * **[TypeScript](https://www.typescriptlang.org/):** For robust and type-safe code.
  * **[Node.js](https://nodejs.org/):** As the runtime environment.
  * **[Commander.js](https://www.google.com/search?q=https://github.com/tj/commander.js):** To create a professional command-line interface (CLI).
  * **[Axe-Core](https://github.com/dequelabs/axe-core):** For accessibility scanning.

-----

## \#\# 🚀 Getting Started

### \#\#\# Prerequisites

  * [Node.js](https://nodejs.org/) (version 18.x or higher is recommended)
  * npm (comes with Node.js)

### \#\#\# Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/autoui-tester.git
    cd autoui-tester
    ```

2.  Install the dependencies:

    ```bash
    npm install
    ```

3.  Install Playwright's browsers:

    ```bash
    npx playwright install
    ```

### \#\#\# Usage

Run the crawler using the CLI, providing a starting URL.

```bash
npx ts-node src/index.ts crawl https://example.com
```

You can customize the crawl using various flags.

```bash
# Crawl up to depth 1, following a maximum of 5 links per page
npx ts-node src/index.ts crawl https://example.com --depth 1 --max-links 5

# Save the report to a different directory
npx ts-node src/index.ts crawl https://example.com --output my-custom-report
```

-----

## \#\# 💻 CLI Usage

The tool is controlled via a command-line interface. You can view all available options by using the `--help` flag.

```bash
npx ts-node src/index.ts crawl --help
```

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

-----

## \#\# ⚙️ Configuration

The crawler's behavior is controlled via CLI flags passed to the `crawl` command.

| Flag             | Description                        | Default Value |
| ---------------- | ---------------------------------- | ------------- |
| `-d`, `--depth`  | The maximum depth of the crawl.    | `2`           |
| `-l`, `--max-links`| Max links to follow on each page.  | `10`          |
| `-o`, `--output` | The directory to save the report.  | `reports`     |

-----

## \#\# 📊 Output

After the crawl is complete, the tool generates the following in the output directory (default: `reports/`):

  * `report.html`: The main interactive HTML report.
  * `screenshots/`: A directory containing all captured screenshots.
  * `report.json` (Optional): A JSON file with the raw data from the crawl, useful for further analysis or integration.

-----

## \#\# 🤝 Contributing

Contributions are welcome\! If you have ideas for new features or improvements, feel free to open an issue or submit a pull request.

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature`).
6.  Open a Pull Request.

-----

## \#\# 📄 License

This project is licensed under the MIT License. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.
