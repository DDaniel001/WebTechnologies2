const Game = require('../models/Game');

/**
 * @desc    Get all games from the database
 * @route   GET /api/games
 */
const getGames = async (req, res) => {
  try {
    const games = await Game.find();
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Add a new game to the inventory
 * @route   POST /api/games
 */
const createGame = async (req, res) => {
  try {
    // Check if the game already exists to prevent duplicates
    const gameExists = await Game.findOne({ title: req.body.title });

    if (gameExists) {
      return res.status(400).json({ message: 'Game already exists' });
    }

    const game = await Game.create(req.body);
    res.status(201).json(game);
  } catch (error) {
    // Return validation errors (e.g., if a field is missing)
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getGames,
  createGame
};