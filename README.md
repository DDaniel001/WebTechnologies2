# Videójáték Nyilvántartó Rendszer
[![Playwright Tests](https://github.com/DDaniel001/WebTechnologies2/actions/workflows/playwright.yml/badge.svg)](https://github.com/DDaniel001/WebTechnologies2/actions/workflows/playwright.yml)

Ez egy Webtechnológiák 2 kurzusra készített beadandó feladat, amely egy modern, MEAN stack (MongoDB, Express, Angular, Node.js) alapú készletnyilvántartó alkalmazás.

## Megvalósított Backend Funkciók

A backend egy REST API, amely az alábbi funkciókkal rendelkezik:

* **User Authentication (JWT)**: Biztonságos regisztráció és bejelentkezés JSON Web Token használatával.
* **Password Security**: A jelszavak tárolása előtt automatikus `bcryptjs` alapú titkosítás történik a Modell szinten.
* **Route Protection**: Egy egyedi `protect` middleware ellenőrzi a tokent, mielőtt hozzáférést engedne a bizalmas adatokhoz.
* **Security & Rate Limiting**: Védelem a brute-force támadások ellen; a kérések száma korlátozva van (általános és auth-specifikus limitek).
* **Global Error Handling**: Egységes hibaformátum és `asyncHandler` alapú tiszta kódstruktúra, try-catch blokkok nélkül a kontrollerekben.
* **CRUD Operations**: Teljes körű játékkezelés (Hozzáadás, Listázás, Módosítás, Törlés) felhasználókhoz kötve.

---

---

## Automatizált Tesztelési Architektúra (QA Portfólió)

*Ez a szekció a projektben implementált minőségbiztosítási (QA) folyamatokat részletezi, bemutatva az elvárt automatizált tesztelési megoldásokat.*

### 1. End-to-End (E2E) Tesztelés (Playwright)

![Frontend Automated Tests](docs/frontend_automated_tests.png)

A frontend automatizált UI tesztelését a **Playwright** biztosítja, amely valós felhasználói viselkedéseket és kritikus folyamatokat szimulál.
* **Page Object Model (POM):** A tesztkészlet a POM tervezési minta alapján épül fel. A HTML lokátorok és az oldal-specifikus műveletek külön osztályokba vannak szervezve (pl. `login.page.ts`, `home.page.ts`), ami magas szintű karbantarthatóságot eredményez.
* **API Mocking és Hálózat Elfogás:** A backend függőségek hatékonyan el vannak különítve a Playwright `page.route()` metódusának segítségével. Ez lehetővé teszi a frontend logika (pl. üres állapotok, szerverhibák és adatmegjelenítés) tesztelését az élő adatbázistól függetlenül.
* **UI Állapot Validáció:** A tesztek szigorúan ellenőrzik a komplex UI állapotokat, beleértve az űrlapok gombjainak `disabled` (kikapcsolt) állapotát érvénytelen adatok esetén, valamint az Angular Material validációs hibaüzeneteinek pontos megjelenését.

### 2. Backend Unit- és Integrációs Tesztelés (Jest)

![Backend Coverage](docs/backend_coverage.png)

A Node.js REST API egységteszteket tartalmaz az üzleti logika integritásának és biztonságának garantálása érdekében.
* **Izolált Tesztelés (Mocking):** A `jest.mock()` használatával az adatbázis réteg (Mongoose modellek) és a kriptográfiai funkciók (bcrypt) mockolva lettek, így a tesztek villámgyorsan és egymástól teljesen elszigetelten futnak.
* **AAA Minta:** Minden teszteset szigorúan követi az **Arrange, Act, Assert** (Előkészítés, Végrehajtás, Ellenőrzés) struktúrát a maximális átláthatóság érdekében.
* **Happy Path és Negatív Ágak:** A tesztek nem csupán az ideális lefutást ("Happy Path") vizsgálják, hanem a negatív ágakat és a hibás bemeneteket (unhappy paths) is, garantálva a megfelelő hibaüzenetek és státuszkódok visszaadását.

### 3. CI/CD Pipeline (GitHub Actions)
A projekt egy teljesen automatizált Folyamatos Integrációs (CI) folyamattal rendelkezik, amely a **GitHub Actions** segítségével lett felépítve.
* Minden, a `main` ágra történő feltöltés (push) esetén egy felhős Linux szerver automatikusan létrehoz egy friss MongoDB példányt, feltelepíti a Node.js v20-at, majd a háttérben elindítja a backend és frontend szervereket.
* A folyamat TCP port monitorozást használ, hogy megvárja a szerverek teljes betöltődését, mielőtt a Playwright teszteket headless (háttérben futó) böngészőkben elindítaná, garantálva a stabil és megbízható tesztfutásokat.

---

## Alkalmazott technológiák

### Backend
* **Node.js & Express.js**
* **MongoDB & Mongoose**: Dokumentum-orientált adatbázis és ODM.
* **jsonwebtoken & bcryptjs**: Hitelesítéshez és jelszavak hasheléséhez.
* **express-rate-limit & express-async-handler**: Biztonság és hibakezelés.

### Frontend
* **Angular 17+**
* **Angular Material** (UI komponensek)

### Tesztelés
* **Jest** (Backend-Egység tesztek)
* **Playwright** (Frontend-Automatizált E2E tesztek)

---

## Telepítés és futtatás

### 1. Előfeltételek
- Node.js (LTS verzió)
- MongoDB Community Server & Compass
- Postman (a teszteléshez)

### 2. Környezeti változók (.env)
A `backend` mappában hozzon létre egy `.env` fájlt az alábbi struktúrával:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/gamer_inventory
JWT_SECRET=your_super_secret_key_here
```

### Backend indítása
1. `cd backend`
2. `npm install`
3. `npm run dev` (nodemon használatával)

### Frontend indítása
1. `cd frontend`
2. `npm install`
3. `ng serve`
4. Nyissa meg a böngészőt a `http://localhost:4200` címen.

---

| Method | Endpoint | Description | Protection |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Create a new user account | Rate Limited |
| **POST** | `/api/auth/login` | Authenticate and receive a JWT Token | Rate Limited |
| **GET** | `/api/games` | List all video games | Public |
| **POST** | `/api/games` | Add a new game to the inventory | **JWT Token** |
| **GET** | `/api/games/:id` | Get details of a specific game | **JWT Token** |
| **PUT** | `/api/games/:id` | Update an existing game's information | **JWT Token** |
| **DELETE** | `/api/games/:id` | Remove a game from the system | **JWT Token** |