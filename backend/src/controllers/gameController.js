const Game = require('../models/Game');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Get all games
 * @route   GET /api/games
 * @access  Public
 */
const getGames = asyncHandler(async (req, res) => {
  const games = await Game.find({ user: req.user._id });
  res.status(200).json(games);
});

/**
 * @desc    Create a new game
 * @route   POST /api/games
 * @access  Private
 */
const createGame = asyncHandler(async (req, res) => {
  const { title, platform, genre, rating, status } = req.body;

  if (!title || !platform || !genre || !rating || !status) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  const game = await Game.create({
    title,
    platform,
    genre,
    rating,
    status,
    user: req.user._id, 
  });

  res.status(201).json(game);
});

/**
 * @desc    Get a single game by ID
 * @route   GET /api/games/:id
 * @access  Private
 */
const getGameById = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id);

  // Check for game and ownership
  if (!game || game.user.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Game not found');
  }

  res.json(game);
});

/**
 * @desc    Update a game
 * @route   PUT /api/games/:id
 * @access  Private
 */
const updateGame = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id);

  if (!game) {
    res.status(404);
    throw new Error('Game not found');
  }

  // Check for ownership
  if (game.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Returns the updated document
    runValidators: true,
  });

  res.json(updatedGame);
});

/**
 * @desc    Delete a game
 * @route   DELETE /api/games/:id
 * @access  Private
 */
const deleteGame = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id);

  if (!game) {
    res.status(404);
    throw new Error('Game not found');
  }

  // Check for ownership
  if (game.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await game.deleteOne();
  res.json({ message: 'Game removed' });
});

module.exports = {
  getGames,
  createGame,
  getGameById,
  updateGame,
  deleteGame,
};