import fs from "fs-extra";
import path from "path";
import { PageResult } from "../types/interfaces";

export class ReportHelper {
  private static readonly SCREENSHOTS_DIR = path.join("reports", "screenshots");
  private static readonly LOGS_FILE = path.join("reports", "logs.json");

  static async clearReports(): Promise<void> {
    if (await fs.pathExists(this.SCREENSHOTS_DIR)) {
      await fs.emptyDir(this.SCREENSHOTS_DIR);
    } else {
      await fs.ensureDir(this.SCREENSHOTS_DIR);
    }

    if (await fs.pathExists(this.LOGS_FILE)) {
      await fs.remove(this.LOGS_FILE);
    }

    console.log("✅ Cleared previous reports.");
  }

  static async saveResults(results: PageResult[]): Promise<void> {
    await fs.writeJson(this.LOGS_FILE, results, { spaces: 2 });
    console.log("✅ Exploration complete. Results saved to reports/logs.json");
  }
}
