import { Page } from "playwright";
import AxeBuilder from "@axe-core/playwright";

export class AccessibilityService {
  constructor(private page: Page) {}

  async scan() {
    const results = await new AxeBuilder({ page: this.page }).analyze();

    // Return most important info
    return results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.length,
    }));
  }
}
