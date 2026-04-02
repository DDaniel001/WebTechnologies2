import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { RegisterPage } from './pages/register.page';
import { HomePage } from './pages/home.page';

test.describe('1. Security & Route Guards', () => {
  test('should redirect unauthenticated users from root to home page', async ({ page }) => {
    // ACT
    await page.goto('http://localhost:4200/');
    
    // ASSERT
    await expect(page).toHaveURL(/.*\/home/);
  });

  test('should navigate between Login and Register pages', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const registerPage = new RegisterPage(page);

    await loginPage.navigate();
    
    // Switch to Register
    await loginPage.registerLink.click();
    await expect(page).toHaveURL(/.*\/register/);
    
    // Switch back to Login
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

    // ACT: Touch and leave email field
    await loginPage.emailInput.click();
    await page.locator('body').click(); 

    // ASSERT
    await expect(loginPage.emailError).toBeVisible();
  });

  test('should show error text from server with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // MOCK
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid email or password' }),
      });
    });

    await loginPage.navigate();
    await loginPage.login('hacker@mail.com', 'wrongpassword');

    // ASSERT
    await expect(loginPage.serverError).toBeVisible();
    await expect(loginPage.serverError).toContainText('Invalid email or password');
  });
});

test.describe('3. Registration Flow', () => {
  test('should successfully register a new user and redirect to login', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    // MOCK
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

    // ASSERT
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should show validation errors on registration form', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigate();
    
    // ACT: Trigger validation on short password
    await registerPage.passwordInput.fill('123');
    await page.locator('body').click(); 

    // ASSERT
    await expect(registerPage.passwordLengthError).toBeVisible();
    await expect(registerPage.submitButton).toBeDisabled();
  });
});

test.describe('4. Game Vault E2E User Journey (Happy Path)', () => {
  test('should login, check form validation, add a new game, and delete it', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    // MOCK: Endpoints
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

    // MOCK
    await page.route('**/api/games', async (route) => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json',
        body: JSON.stringify([]) 
      });
    });
    
    await page.addInitScript(() => {
      window.localStorage.setItem('user', JSON.stringify({ 
        _id: '123', 
        username: 'Tester', 
        token: 'fake-jwt' 
      }));
    });

    await homePage.navigate();

    // ASSERT
    await expect(homePage.gameCards).toHaveCount(0);
  });
});