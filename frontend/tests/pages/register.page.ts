import { Page, Locator } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly passwordLengthError: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('input[formControlName="username"]');
    this.emailInput = page.locator('input[formControlName="email"]');
    this.passwordInput = page.locator('input[formControlName="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.passwordLengthError = page.locator('mat-error').filter({ hasText: 'Min 6 characters required' });
    this.loginLink = page.locator('a[routerLink="/login"]');
  }

  async navigate() {
    await this.page.goto('http://localhost:4200/register');
  }

  async register(username: string, email: string, pass: string) {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.submitButton.click();
  }
}