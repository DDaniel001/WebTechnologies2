const express = require('express');
const router = express.Router();
const { 
  getGames, 
  createGame, 
  getGameById, 
  updateGame, 
  deleteGame 
} = require('../controllers/gameController');

// 1. Import the protector middleware
const { protect } = require('../middleware/authMiddleware');

// Public route: anyone can list games
router.get('/', getGames);

// Protected routes: only logged-in users can use these
router.post('/', protect, createGame);
router.get('/:id', protect, getGameById);
router.put('/:id', protect, updateGame);
router.delete('/:id', protect, deleteGame);

module.exports = router;