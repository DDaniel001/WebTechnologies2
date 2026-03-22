const express = require('express');
const router = express.Router();
const { getGames, createGame } = require('../controllers/gameController');

// Define routes for /api/games
router.get('/', getGames);    // GET request to list games
router.post('/', createGame); // POST request to add a game

module.exports = router;