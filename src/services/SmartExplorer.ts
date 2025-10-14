import { Page, Locator } from "playwright";
import { faker } from "@faker-js/faker"; // Pamiętaj, aby dodać: npm install @faker-js/faker --save-dev

/**
 * Interface for configuring the SmartExplorer behavior.
 */
interface SmartExplorerConfig {
  maxInputsToFill: number;
  maxActionButtons: number;
  maxNavLinks: number;
  actionButtonKeywords: RegExp;
}

export class SmartExplorer {
  private page: Page;
  private config: SmartExplorerConfig;
  private actions: string[] = [];

  /**
   * Constructor for SmartExplorer.
   */
  constructor(page: Page, config?: Partial<SmartExplorerConfig>) {
    this.page = page;
    this.config = {
      maxInputsToFill: 10,
      maxActionButtons: 3,
      maxNavLinks: 3,
      actionButtonKeywords:
        /(login|sign in|next|continue|submit|ok|accept|buy|add to cart)/i,
      ...config,
    };
  }

  /**
   *   Main method to explore the page by interacting with forms, buttons, and scrolling.
   */
  public async explorePage(): Promise<{ actions: string[]; forms: number }> {
    this.actions = [`🤖 Exploring: ${this.page.url()}`];
    await this._handleOverlays();
    const formsCount = await this._interactWithForms();
    await this._clickActionButtons();
    // await this._clickNavigationLinks(); // Odkomentuj, jeśli chcesz, aby crawler aktywnie nawigował po menu
    await this._scrollPage();

    return { actions: this.actions, forms: formsCount };
  }

  /**
   * Scrolls the page to simulate user behavior.
   */
  private async _scrollPage(): Promise<void> {
    try {
      await this.page.evaluate(() => window.scrollBy(0, window.innerHeight));
      this.actions.push("🖱️ Scrolled down the page");
      await this.page.waitForLoadState("domcontentloaded");
      await this.page.evaluate(() =>
        window.scrollTo(0, document.body.scrollHeight)
      );
      this.actions.push("📜 Scrolled to bottom");
    } catch (error) {
      this.actions.push(`⚠️ Could not scroll page: ${error.message}`);
    }
  }

  private async _handleOverlays(): Promise<void> {
    // Regex to find common "accept" button texts
    const acceptRegex = /^(Accept|OK|Got it|I agree|Akceptuję|Zgoda|Rozumiem)/i;

    try {
      // Wait for a short moment to let overlays appear
      await this.page.waitForTimeout(1000);

      // Find a button with accepting text and click it if it exists
      const acceptButton = this.page.getByRole("button", { name: acceptRegex });

      if (await acceptButton.isVisible()) {
        await acceptButton.click();
        this.actions.push("✅ Accepted cookie banner/overlay.");
        await this.page.waitForLoadState("domcontentloaded"); // Wait for any potential reloads
      }
    } catch (error) {
      // No overlay found, which is fine. We can ignore the error.
      this.actions.push("ℹ️ No common overlays detected.");
    }
  }
  /**
   * Find and interact with forms on the page.
   */
  private async _interactWithForms(): Promise<number> {
    const forms = await this.page.locator("form").count();
    if (forms > 0) this.actions.push(`🧾 Detected ${forms} form(s)`);

    // 1. Handle overlays before interacting with forms
    const fillableInputs = await this.page
      .locator(
        'input[type="text"], input[type="email"], input[type="password"], input[type="tel"], input[type="number"], textarea'
      )
      .all();
    for (const input of fillableInputs.slice(0, this.config.maxInputsToFill)) {
      await this._fillTextInput(input);
    }

    // 2. Handle overlays after filling text inputs
    const checkableInputs = await this.page
      .locator('input[type="checkbox"], input[type="radio"]')
      .all();
    for (const input of checkableInputs.slice(0, this.config.maxInputsToFill)) {
      await this._checkInput(input);
    }

    return forms;
  }

  /**
   * Checks and selects checkboxes or radio buttons.
   */
  private async _checkInput(input: Locator): Promise<void> {
    const type = (await input.getAttribute("type")) || "unknown";
    try {
      if (!(await input.isChecked()) && (await input.isEnabled())) {
        await input.check();
        this.actions.push(`✔️ Checked input (${type})`);
      }
    } catch (error) {
      this.actions.push(`⚠️ Could not check input (${type}): ${error.message}`);
    }
  }

  /**
   * Fills text-based inputs with realistic data using Faker.js.
   */
  private async _fillTextInput(input: Locator): Promise<void> {
    const type = (await input.getAttribute("type")) || "text";
    let value = "";

    try {
      if (!(await input.isEditable())) {
        this.actions.push(`ℹ️ Input (${type}) is not editable.`);
        return;
      }

      switch (type) {
        case "email":
          value = faker.internet.email();
          break;
        case "password":
          value = faker.internet.password();
          break;
        case "tel":
          value = faker.phone.number();
          break;
        case "number":
          value = faker.number.int({ min: 1, max: 100 }).toString();
          break;
        case "text":
        default:
          const placeholder = (await input.getAttribute("placeholder")) || "";
          if (/name/i.test(placeholder)) value = faker.person.fullName();
          else if (/address/i.test(placeholder))
            value = faker.location.streetAddress();
          else value = faker.lorem.sentence(3);
      }

      await input.fill(value);
      this.actions.push(`✍️ Filled input (${type})`);
    } catch (error) {
      this.actions.push(`⚠️ Could not fill input (${type}): ${error.message}`);
    }
  }

  /**
   * Finds and clicks buttons that match common action keywords.
   */
  private async _clickActionButtons(): Promise<void> {
    const buttons = await this.page
      .getByRole("button", { name: this.config.actionButtonKeywords })
      .all();

    for (const button of buttons.slice(0, this.config.maxActionButtons)) {
      const text = ((await button.textContent()) || "").trim();
      try {
        if (await button.isEnabled()) {
          await button.click({ timeout: 3000 });
          this.actions.push(`🟢 Clicked button: "${text}"`);
          await this.page.waitForLoadState("domcontentloaded");
          break;
        }
      } catch (error) {
        this.actions.push(
          `🔴 Failed to click button "${text}": ${error.message}`
        );
      }
    }
  }

  /**
   * Clicks navigation links in <nav> or <header> elements to explore the site.
   */
  private async _clickNavigationLinks(): Promise<void> {
    const navLinks = await this.page.locator("nav a, header a").all();

    for (const link of navLinks.slice(0, this.config.maxNavLinks)) {
      const text = ((await link.textContent()) || "").trim();
      if (!text) continue;

      try {
        if (await link.isEnabled()) {
          await link.click({ timeout: 3000 });
          this.actions.push(`🧭 Navigated via menu link: "${text}"`);
          await this.page.waitForLoadState("domcontentloaded");
        }
      } catch (error) {
        this.actions.push(
          `⚠️ Failed to click nav link "${text}": ${error.message}`
        );
      }
    }
  }
}
