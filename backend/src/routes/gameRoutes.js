const express = require('express');
const router = express.Router();
const { 
  getGames, 
  createGame, 
  getGameById, 
  updateGame, 
  deleteGame 
} = require('../controllers/gameController');

// Route for /api/games
router.route('/')
  .get(getGames)
  .post(createGame);

// Routes for /api/games/:id
router.route('/:id')
  .get(getGameById)
  .put(updateGame)
  .delete(deleteGame);

module.exports = router;