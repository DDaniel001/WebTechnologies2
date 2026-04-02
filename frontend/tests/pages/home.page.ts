import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly addGameBtn: Locator;
  readonly titleInput: Locator;
  readonly genreInput: Locator;
  readonly ratingInput: Locator;
  readonly platformSelect: Locator;
  readonly statusSelect: Locator;
  readonly logoutBtn: Locator;
  readonly gameCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addGameBtn = page.locator('button:has-text("Add Game")');
    this.titleInput = page.locator('input[formControlName="title"]');
    this.genreInput = page.locator('input[formControlName="genre"]');
    this.ratingInput = page.locator('input[formControlName="rating"]');
    this.platformSelect = page.locator('mat-select[formControlName="platform"]');
    this.statusSelect = page.locator('mat-select[formControlName="status"]');
    this.logoutBtn = this.logoutBtn = page.locator('button[color="warn"]:has-text("Logout")');
    this.gameCards = page.locator('mat-card.game-card');
  }

  async navigate() {
    await this.page.goto('http://localhost:4200/home');
  }

  async fillNewGameForm(title: string, platform: string, genre: string, rating: string, status: string) {
    await this.titleInput.fill(title);
    await this.platformSelect.click();
    await this.page.locator('mat-option').filter({ hasText: platform }).click();
    await this.genreInput.fill(genre);
    await this.ratingInput.fill(rating);
    await this.statusSelect.click();
    await this.page.locator('mat-option').filter({ hasText: status }).click();
  }

  getGameCard(title: string): Locator {
    return this.gameCards.filter({ hasText: title });
  }

  async deleteGame(title: string) {
    const card = this.getGameCard(title);
    await card.locator('button[color="warn"]').click();
  }
}