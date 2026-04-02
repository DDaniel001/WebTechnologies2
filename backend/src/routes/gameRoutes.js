const express = require('express');
const router = express.Router();
const {
  getGames,
  createGame,
  getGameById,
  updateGame,
  deleteGame,
} = require('../controllers/gameController'); //

const { protect } = require('../middleware/authMiddleware'); //

/**
 * @route   /api/games
 */
router.route('/')
  .get(protect, getGames)
  .post(protect, createGame);

/**
 * @route   /api/games/:id
 */
router.route('/:id')
  .get(protect, getGameById)
  .put(protect, updateGame)
  .delete(protect, deleteGame);

module.exports = router;