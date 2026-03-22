# WebTechnologies2# Videójáték Nyilvántartó Rendszer

Ez egy Webtechnológiák 2 kurzusra készített beadandó feladat, amely egy modern, MEAN stack (MongoDB, Express, Angular, Node.js) alapú készletnyilvántartó alkalmazás.

## Funkciók
- **Hitelesítés**: Biztonságos bejelentkezési felület.
- **Nyilvántartás**: Játékok listázása az adatbázisból.
- **Bővítés**: Új játékok felvétele szigorú típusellenőrzéssel és validációval.
- **Validáció**: Hibás adatformátumok (pl. szám helyett szöveg) szűrése mind a kliens, mind a szerver oldalon.

## Alkalmazott technológiák
- **Frontend**: Angular 17+, Angular Material (UI/UX)
- **Backend**: Node.js, Express.js
- **Adatbázis**: MongoDB (Mongoose ODM)

## Telepítés és futtatás

### Előfeltételek
- Node.js (LTS verzió)
- MongoDB Community Server & Compass
- Postman (a teszteléshez)

### Backend indítása
1. `cd backend`
2. `npm install`
3. Hozza létre egy `.env` fájlt a kapcsolati adatokkal.
4. `npm run dev` (nodemon használatával)

### Frontend indítása
1. `cd frontend`
2. `npm install`
3. `ng serve`
4. Nyissa meg a böngészőt a `http://localhost:4200` címen.