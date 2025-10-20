"use strict";
// in src/helpers/ReportHelper.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportHelper = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
class ReportHelper {
    // 👇 STEP 1: Remove the static, hardcoded paths.
    // private static readonly SCREENSHOTS_DIR = ...
    // private static readonly LOGS_FILE = ...
    /**
     * Clears the report directory based on the provided path.
     * @param outputDir The directory to clear.
     */
    static async clearReports(outputDir = "reports") {
        // 👇 STEP 2: Create paths dynamically based on the argument.
        const screenshotsDir = path_1.default.join(outputDir, "screenshots");
        // fs.emptyDir() creates the directory if it doesn't exist and clears it if it does.
        // This is simpler than checking `pathExists` first.
        await fs_extra_1.default.emptyDir(screenshotsDir);
        // Also, remove the old JSON report file if it exists.
        const jsonReportPath = path_1.default.join(outputDir, "report.json");
        await fs_extra_1.default.remove(jsonReportPath);
        console.log(`✅ Cleared previous reports in '${outputDir}'.`);
    }
    /**
     * Saves the results to a JSON file in the specified directory.
     * @param results The crawl results.
     * @param outputDir The directory to save the file in.
     */
    // 👇 STEP 3: Update `saveResults` to also accept `outputDir`.
    static async saveResults(results, outputDir = "reports") {
        const filePath = path_1.default.join(outputDir, "report.json");
        await fs_extra_1.default.writeJson(filePath, results, { spaces: 2 });
        // 👇 STEP 4: Update the log message to show the dynamic path.
        console.log(`✅ Exploration complete. Results saved to ${filePath}`);
    }
}
exports.ReportHelper = ReportHelper;
