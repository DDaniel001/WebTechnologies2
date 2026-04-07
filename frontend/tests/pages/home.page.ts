import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly addGameBtn: Locator;
  readonly updateGameBtn: Locator;
  readonly cancelBtn: Locator;
  readonly searchInput: Locator;
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
    this.updateGameBtn = page.locator('button:has-text("Update Game")');
    this.cancelBtn = page.locator('button:has-text("Cancel")');
    this.searchInput = page.locator('input[placeholder*="Search by title"]');
    this.titleInput = page.locator('input[formControlName="title"]');
    this.genreInput = page.locator('input[formControlName="genre"]');
    this.ratingInput = page.locator('input[formControlName="rating"]');
    this.platformSelect = page.locator('mat-select[formControlName="platform"]');
    this.statusSelect = page.locator('mat-select[formControlName="status"]');
    
    this.logoutBtn = page.locator('mat-card.welcome-card button:has-text("Logout")');
    
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
    return this.gameCards.filter({ 
      has: this.page.locator('mat-card-title', { hasText: new RegExp(`^${title}$`) }) 
    });
  }

  async clickEditOnCard(title: string) {
    const card = this.getGameCard(title);
    await card.locator('button:has(mat-icon:text("edit"))').click();
  }

  async deleteGame(title: string) {
    const card = this.getGameCard(title);
    await card.locator('button[color="warn"]').click();
  }
}