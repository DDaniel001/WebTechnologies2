# Test Plan & Manual Testing Documentation

This document outlines the manual testing procedures performed to ensure the quality, security, and reliability of the Game Vault application.

## 1. Authentication System (Auth)

### Test Case 1.1: User Registration (Happy Path)
* **Action:** Navigate to the `/register` page and submit valid credentials (username, email, password >= 6 characters).
* **Expected Result:** A new user is created in the database, and the application redirects to the `/login` page.
* **Status:** Passed

### Test Case 1.2: Invalid Registration Validation
* **Action:** Submit the registration form with an invalid email format or a password shorter than 6 characters.
* **Expected Result:** The form submission is blocked, the "Register" button is disabled, and Angular Material error messages are displayed beneath the inputs.
* **Status:** Passed

### Test Case 1.3: User Login & Token Storage
* **Action:** Submit valid credentials on the `/login` page.
* **Expected Result:** The backend responds with a JWT token, the token is saved in the browser's `localStorage`, and the user is redirected to the `/home` dashboard.
* **Status:** Passed

## 2. Dashboard & Game Management (CRUD)

### Test Case 2.1: Fetching Games (Read)
* **Action:** Log in with an existing account.
* **Expected Result:** The dashboard loads and automatically fetches the user's specific game collection from the backend, displaying them as Material cards.
* **Status:** Passed

### Test Case 2.2: Adding a New Game (Create)
* **Action:** Fill out the "Add New Game" form on the dashboard and click "Add Game".
* **Expected Result:** The game is sent to the backend, saved in MongoDB, and the UI updates instantly (using `ChangeDetectorRef`) to show the new game without a page reload.
* **Status:** Passed

### Test Case 2.3: Deleting a Game (Delete)
* **Action:** Click the red delete icon on an existing game card.
* **Expected Result:** The game is permanently removed from the database and instantly disappears from the UI list.
* **Status:** Passed

## 3. Security & Middleware

### Test Case 3.1: Route Protection (JWT Authentication)
* **Action:** Attempt to directly access the backend `/api/games` endpoint via Postman without a valid `Authorization: Bearer <token>` header.
* **Expected Result:** The backend auth middleware blocks the request and responds with a `401 Unauthorized` status.
* **Status:** Passed

### Test Case 3.2: Rate Limiting
* **Action:** Spam the login/register endpoint multiple times within a short window.
* **Expected Result:** The server blocks the requests and returns a `429 Too Many Requests` error to prevent brute-force attacks.
* **Status:** Passed