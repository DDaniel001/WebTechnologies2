import { test, expect, type Route } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { RegisterPage } from './pages/register.page';
import { HomePage } from './pages/home.page';

test.describe('1. Security & Route Guards', () => {
  test('should redirect unauthenticated users from root to home page', async ({ page }) => {
    // ACT: Navigate to root
    await page.goto('http://localhost:4200/');
    
    // ASSERT: Verify redirection to home/login handled by guard
    await expect(page).toHaveURL(/.*\/home/);
  });

  test('should navigate between Login and Register pages', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const registerPage = new RegisterPage(page);

    await loginPage.navigate();
    
    // ACT: Switch to Register
    await loginPage.registerLink.click();
    await expect(page).toHaveURL(/.*\/register/);
    
    // ACT: Switch back to Login
    await registerPage.loginLink.click();
    await expect(page).toHaveURL(/.*\/login/);
  });
});

test.describe('2. Authentication (Unhappy Paths & Validation)', () => {
  test('should disable login button if form is invalid and show required errors', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    
    // ASSERT: Initially disabled
    await expect(loginPage.submitButton).toBeDisabled();

    // ACT: Touch and leave email field to trigger validation
    await loginPage.emailInput.click();
    await page.locator('body').click(); 

    // ASSERT: Validation message should appear
    await expect(loginPage.emailError).toBeVisible();
  });

  test('should show error text from server with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // MOCK: Unauthorized login attempt
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid email or password' }),
      });
    });

    await loginPage.navigate();
    await loginPage.login('hacker@mail.com', 'wrongpassword');

    // ASSERT: Verify server error visibility
    await expect(loginPage.serverError).toBeVisible();
    await expect(loginPage.serverError).toContainText('Invalid email or password');
  });
});

test.describe('3. Registration Flow', () => {
  test('should successfully register a new user and redirect to login', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    // MOCK: Successful registration
    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: 'mock-uuid-123',
          username: 'Automated Tester',
          email: 'test@test.com',
          token: 'mock-jwt-token'
        }),
      });
    });

    await registerPage.navigate();
    
    const uniqueEmail = `playwright_${Date.now()}@test.com`;
    await registerPage.register('Automated Tester', uniqueEmail, 'securePass123');

    // ASSERT: Success leads back to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should show validation errors on registration form', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigate();
    
    // ACT: Fill invalid password length
    await registerPage.passwordInput.fill('123');
    await page.locator('body').click(); 

    // ASSERT: Error should block submission
    await expect(registerPage.passwordLengthError).toBeVisible();
    await expect(registerPage.submitButton).toBeDisabled();
  });
});

test.describe('4. Game Vault E2E User Journey (Happy Path)', () => {
  test('should login, check form validation, add a new game, and delete it', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    // MOCK: Auth and Game endpoints
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ _id: '1', username: 'asd', email: 'asd@asd.com', token: 'fake-token' }),
      });
    });

    await page.route('**/api/games', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, body: JSON.stringify([]) });
      } else if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          body: JSON.stringify({ _id: 'game-1', title: 'Playwright Masterpiece', platform: 'PC', genre: 'Testing', rating: 10, status: 'Playing' })
        });
      }
    });

    await page.route('**/api/games/*', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 200, body: JSON.stringify({ message: 'Game removed' }) });
      }
    });

    // 1. Authenticate
    await loginPage.navigate();
    await loginPage.login('asd@asd.com', 'asdasd');
    await expect(page).toHaveURL(/.*\/home/);

    // 2. Test Dashboard Form Validation
    await expect(homePage.addGameBtn).toBeDisabled(); 

    // 3. Add a new game
    await homePage.fillNewGameForm('Playwright Masterpiece', 'PC', 'Testing', '10', 'Playing');
    
    await expect(homePage.addGameBtn).toBeEnabled();
    await homePage.addGameBtn.click();

    // 4. Verify creation
    const newCard = homePage.getGameCard('Playwright Masterpiece');
    await expect(newCard).toBeVisible();

    // 5. Delete and verify removal
    await homePage.deleteGame('Playwright Masterpiece');
    await expect(newCard).not.toBeVisible();

    // 6. Logout
    await homePage.logoutBtn.click();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should display empty state when no games exist', async ({ page }) => {
    const homePage = new HomePage(page);

    // MOCK: Empty game list
    await page.route('**/api/games', async (route) => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify([]) 
      });
    });
    
    // Inject mock user to bypass guard
    await page.addInitScript(() => {
      window.localStorage.setItem('user', JSON.stringify({ 
        _id: '123', 
        username: 'Tester', 
        token: 'fake-jwt' 
      }));
    });

    await homePage.navigate();

    // ASSERT: No cards should be present
    await expect(homePage.gameCards).toHaveCount(0);
  });
});

test.describe('5. Search Functionality', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);

    // MOCK: User session setup
    await page.addInitScript(() => {
      window.localStorage.setItem('user', JSON.stringify({ 
        _id: 'user-1', 
        username: 'Tester', 
        token: 'mock-jwt' 
      }));
    });

    // MOCK: Initial game list for search testing
    await page.route('**/api/games', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { _id: 'g1', title: 'The Witcher 3', platform: 'PC', genre: 'RPG', rating: 10, status: 'Completed' },
            { _id: 'g2', title: 'Halo', platform: 'Xbox', genre: 'FPS', rating: 8, status: 'Playing' }
          ]),
        });
      }
    });

    await homePage.navigate();
  });

  test('should filter games using the search bar', async () => {
    // ASSERT: Initially 2 cards visible
    await expect(homePage.gameCards).toHaveCount(2);

    // ACT: Filter by "Witcher"
    await homePage.searchInput.fill('Witcher');

    // ASSERT: Only the matching game should be visible
    await expect(homePage.gameCards).toHaveCount(1);
    await expect(homePage.getGameCard('The Witcher 3')).toBeVisible();
    await expect(homePage.getGameCard('Halo')).not.toBeVisible();
  });
});

test.describe('6. Update Functionality', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);

    await page.addInitScript(() => {
      window.localStorage.setItem('user', JSON.stringify({ 
        _id: 'user-1', 
        username: 'Tester', 
        token: 'mock-jwt' 
      }));
    });

    // MOCK: Game to be edited
    await page.route('**/api/games', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { _id: 'g2', title: 'Halo', platform: 'Xbox', genre: 'FPS', rating: 8, status: 'Playing' }
          ]),
        });
      }
    });

    await homePage.navigate();
  });

  test('should enter edit mode, change title and save update', async ({ page }) => {
    // MOCK: Successful update response
    await page.route('**/api/games/g2', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            _id: 'g2', title: 'Halo Infinite', platform: 'Xbox', genre: 'FPS', rating: 9, status: 'Playing' 
          }),
        });
      }
    });

    // ACT: Click edit icon on card
    await homePage.clickEditOnCard('Halo');

    // ASSERT: Form switched to update mode
    await expect(homePage.updateGameBtn).toBeVisible();
    await expect(homePage.titleInput).toHaveValue('Halo');

    // ACT: Change title and save
    await homePage.titleInput.fill('Halo Infinite');
    await homePage.updateGameBtn.click();

    // ASSERT: Verify UI update
    await expect(homePage.getGameCard('Halo Infinite')).toBeVisible();
    await expect(homePage.getGameCard('Halo')).not.toBeVisible();
  });
});

test.describe('7. Game Management - Unhappy Paths', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);

    // MOCK: Inject user session
    await page.addInitScript(() => {
      window.localStorage.setItem('user', JSON.stringify({ 
        _id: 'user-1', 
        username: 'Tester', 
        token: 'mock-jwt' 
      }));
    });
  });

  test('should keep "Add Game" button disabled for invalid input', async () => {
    await homePage.navigate();
    await homePage.platformSelect.click();
    await homePage.page.locator('mat-option').filter({ hasText: 'PC' }).click();
    
    // ASSERT: Button should remain disabled because title is required
    await expect(homePage.addGameBtn).toBeDisabled();
  });

  test('should show error snackbar when server fails to delete a game', async ({ page }) => {
    // MOCK: Initial list with one game
    await page.route('**/api/games', async (route: Route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([{ _id: 'g-err', title: 'Error Game', platform: 'PC', genre: 'Test', rating: 5, status: 'Backlog' }])
      });
    });
    
    await homePage.navigate();

    // MOCK: Delete request fails with 500
    await page.route('**/api/games/g-err', async (route: Route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 500, body: JSON.stringify({ message: 'Internal Server Error' }) });
      } else {
        await route.continue();
      }
    });

    // ACT: Try to delete
    await homePage.deleteGame('Error Game');

    // ASSERT: Verify error snackbar appears
    await expect(page.locator('simple-snack-bar')).toContainText('Error deleting game');
  });

  test('should show error snackbar when server fails to update a game', async ({ page }) => {
    // MOCK: Initial list
    await page.route('**/api/games', async (route: Route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([{ _id: 'g-up-err', title: 'Old Title', platform: 'PC', genre: 'Test', rating: 5, status: 'Backlog' }])
      });
    });
    await homePage.navigate();
    
    // MOCK: Update failure
    await page.route('**/api/games/g-up-err', async (route: Route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({ status: 500, body: JSON.stringify({ message: 'Update failed' }) });
      }
    });

    await homePage.clickEditOnCard('Old Title');
    await homePage.titleInput.fill('New Title Attempt');
    await homePage.updateGameBtn.click();

    // ASSERT: Error notification should appear
    await expect(page.locator('simple-snack-bar')).toContainText('Error updating game');
  });

  test('should display specialized message when search has no results', async ({ page }) => { 
    // MOCK: Initial list
    await page.route('**/api/games', async (route: Route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([{ _id: 'g1', title: 'Witcher 3', platform: 'PC', genre: 'RPG', rating: 10, status: 'Completed' }])
      });
    });
    
    await homePage.navigate();

    // ACT: Search for something non-existent
    await homePage.searchInput.fill('Super Mario');

    // ASSERT: Specific empty state message for search should appear
    await expect(page.locator('.empty-text')).toContainText('No matching games found');
  });

  test('should display specialized message for search terms with only spaces', async ({ page }) => {
    // MOCK: Initial list
    await page.route('**/api/games', async (route: Route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([{ _id: 'g1', title: 'Witcher 3', platform: 'PC', genre: 'RPG', rating: 10, status: 'Completed' }])
      });
    });
    await homePage.navigate();

    // ACT: Search for spaces only
    await homePage.searchInput.fill('   ');

    // ASSERT: Should treat spaces as no results found
    await expect(page.locator('.empty-text')).toContainText('No matching games found');
  });
});