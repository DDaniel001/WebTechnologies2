# WebTechnologies2
# Videójáték Nyilvántartó Rendszer

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

## Alkalmazott technológiák

### Backend
* **Node.js & Express.js**
* **MongoDB & Mongoose**: Dokumentum-orientált adatbázis és ODM.
* **jsonwebtoken**: Token alapú hitelesítéshez.
* **bcryptjs**: Jelszavak biztonságos hasheléséhez.
* **express-rate-limit**: Kérések számának korlátozásához a biztonság érdekében.
* **express-async-handler**: Aszinkron hibák kezeléséhez a tiszta kódért.

### Frontend (Fejlesztés alatt)
* **Angular 17+**
* **Angular Material** (UI komponensek)

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
| **POST** | `/api/auth/register` | Create a new user account | None |
| **POST** | `/api/auth/login` | Authenticate and receive a JWT Token | Rate Limited |
| **GET** | `/api/games` | List all video games | Public |
| **POST** | `/api/games` | Add a new game to the inventory | **JWT Token** |
| **GET** | `/api/games/:id` | Get details of a specific game | **JWT Token** |
| **PUT** | `/api/games/:id` | Update an existing game's information | **JWT Token** |
| **DELETE** | `/api/games/:id` | Remove a game from the system | **JWT Token** |