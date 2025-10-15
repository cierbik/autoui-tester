// in src/helpers/ReportHelper.ts

import fs from "fs-extra";
import path from "path";
import { PageResult } from "../types/interfaces";

export class ReportHelper {
  // 👇 STEP 1: Remove the static, hardcoded paths.
  // private static readonly SCREENSHOTS_DIR = ...
  // private static readonly LOGS_FILE = ...

  /**
   * Clears the report directory based on the provided path.
   * @param outputDir The directory to clear.
   */
  static async clearReports(outputDir: string = "reports"): Promise<void> {
    // 👇 STEP 2: Create paths dynamically based on the argument.
    const screenshotsDir = path.join(outputDir, "screenshots");

    // fs.emptyDir() creates the directory if it doesn't exist and clears it if it does.
    // This is simpler than checking `pathExists` first.
    await fs.emptyDir(screenshotsDir);

    // Also, remove the old JSON report file if it exists.
    const jsonReportPath = path.join(outputDir, "report.json");
    await fs.remove(jsonReportPath);

    console.log(`✅ Cleared previous reports in '${outputDir}'.`);
  }

  /**
   * Saves the results to a JSON file in the specified directory.
   * @param results The crawl results.
   * @param outputDir The directory to save the file in.
   */
  // 👇 STEP 3: Update `saveResults` to also accept `outputDir`.
  static async saveResults(
    results: PageResult[],
    outputDir: string = "reports"
  ): Promise<void> {
    const filePath = path.join(outputDir, "report.json");
    await fs.writeJson(filePath, results, { spaces: 2 });

    // 👇 STEP 4: Update the log message to show the dynamic path.
    console.log(`✅ Exploration complete. Results saved to ${filePath}`);
  }
}
