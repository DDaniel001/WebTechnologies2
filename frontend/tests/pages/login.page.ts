import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly emailError: Locator;
  readonly serverError: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[formControlName="email"]');
    this.passwordInput = page.locator('input[formControlName="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.emailError = page.locator('mat-error', { hasText: 'Email is required' });
    this.serverError = page.locator('p.error-text, .error-message');
    this.registerLink = page.locator('a[routerLink="/register"]');
  }

  async navigate() {
    await this.page.goto('http://localhost:4200/login');
  }

  async login(email: string, pass: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.submitButton.click();
  }
}