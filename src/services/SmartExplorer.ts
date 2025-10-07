import { Page } from "playwright";

export class SmartExplorer {
  constructor(private page: Page) {}

  /**
   * Main method – explores a given page automatically,
   * simulating real user interactions (scrolling, clicking, filling forms).
   */
  async explorePage(url: string) {
    const actions: string[] = [];

    actions.push(`🤖 Exploring: ${url}`);

    // Scroll halfway down the page – simulates a user reading content
    await this.page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
    await this.page.waitForTimeout(1000);
    actions.push("🖱️ Scrolled halfway down");

    // Detect all forms on the page
    const forms = await this.page.$$eval("form", (forms) => forms.length);
    if (forms > 0) actions.push(`🧾 Detected ${forms} form(s)`);

    // Automatically fill up to 5 input fields with mock data
    const inputs = await this.page.$$("input");
    for (const input of inputs.slice(0, 5)) {
      const type = (await input.getAttribute("type")) || "text";
      let value = "";

      // Choose value depending on input type
      switch (type) {
        case "email":
          value = "test@example.com";
          break;
        case "password":
          value = "Password123!";
          break;
        case "text":
        default:
          value = "Sample input text";
      }

      try {
        await input.fill(value);
        actions.push(`✍️ Filled input (${type}): "${value}"`);
      } catch {
        actions.push(`⚠️ Could not fill input (${type})`);
      }
    }

    // Find and click "important" buttons like login, submit, buy, etc.
    const buttons = await this.page.$$eval(
      "button, input[type=submit]",
      (btns) =>
        btns
          .map((b) => b.textContent?.trim() || b.getAttribute("value") || "")
          .filter((text) =>
            /(login|sign in|next|continue|submit|ok|accept|buy|add to cart)/i.test(
              text
            )
          )
          .slice(0, 3)
    );

    for (const text of buttons) {
      try {
        await this.page.locator(`text=${text}`).click({ timeout: 2000 });
        actions.push(`🟢 Clicked button: "${text}"`);
        await this.page.waitForTimeout(500);
      } catch {
        actions.push(`🔴 Failed to click button: "${text}"`);
      }
    }

    // Try to interact with navigation links in <nav> or <header>
    const navLinks = await this.page.$$eval("nav a, header a", (links) =>
      links
        .map((l) => l.textContent?.trim() || "")
        .filter((t) => t && t.length < 30)
        .slice(0, 3)
    );

    for (const text of navLinks) {
      try {
        await this.page.locator(`text=${text}`).click({ timeout: 2000 });
        actions.push(`🧭 Navigated via menu link: "${text}"`);
        await this.page.waitForTimeout(800);
      } catch {
        actions.push(`⚠️ Failed to click nav link: "${text}"`);
      }
    }

    // Scroll to the very bottom – simulates a full page read
    await this.page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight)
    );
    actions.push("📜 Scrolled to bottom");

    // Return a summary of what was done
    return { actions, forms };
  }
}
