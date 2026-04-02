const { getGames, createGame, getGameById, updateGame, deleteGame } = require('../src/controllers/gameController');
const Game = require('../src/models/Game');

// Mock the database model
jest.mock('../src/models/Game');

describe('Game Controller', () => {
  let req, res;

  beforeEach(() => {
    // ARRANGE: Set up request and response mocks
    req = {
      user: { _id: 'testUserId123' },
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    // Clear mock data after each test to avoid interference
    jest.clearAllMocks();
  });

  describe('getGames()', () => {
    it('should fetch and return games for the logged-in user', async () => {
      const mockGames = [{ title: 'The Witcher 3' }, { title: 'Cyberpunk 2077' }];
      Game.find.mockResolvedValue(mockGames);

      await getGames(req, res);

      expect(Game.find).toHaveBeenCalledWith({ user: 'testUserId123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockGames);
    });
  });

  describe('createGame()', () => {
    it('should create a new game and return 201 status', async () => {
      req.body = {
        title: 'Elden Ring',
        platform: 'PC',
        genre: 'RPG',
        rating: 10,
        status: 'Playing'
      };

      const newGame = { ...req.body, user: 'testUserId123', _id: 'game123' };
      Game.create.mockResolvedValue(newGame);

      await createGame(req, res);

      expect(Game.create).toHaveBeenCalledWith({
        ...req.body,
        user: 'testUserId123'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newGame);
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = {};

      await expect(createGame(req, res)).rejects.toThrow('Please add all required fields');
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getGameById()', () => {
    it('should return a game if it exists', async () => {
      // ARRANGE
      req.params.id = 'game123';
      const mockGame = { _id: 'game123', title: 'Halo' };
      Game.findById.mockResolvedValue(mockGame);

      // ACT
      await getGameById(req, res);

      // ASSERT
      expect(Game.findById).toHaveBeenCalledWith('game123');
      expect(res.json).toHaveBeenCalledWith(mockGame);
    });

    it('should throw an error with 404 status if game is not found', async () => {
      req.params.id = 'invalidId';
      Game.findById.mockResolvedValue(null);

      await expect(getGameById(req, res)).rejects.toThrow('Game not found');
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateGame()', () => {
    it('should update the game and return the updated document', async () => {
      // ARRANGE
      req.params.id = 'game123';
      req.body = { status: 'Completed' };
      const existingGame = { _id: 'game123', status: 'Playing' };
      const updatedGame = { _id: 'game123', status: 'Completed' };
      
      Game.findById.mockResolvedValue(existingGame);
      Game.findByIdAndUpdate.mockResolvedValue(updatedGame);

      // ACT
      await updateGame(req, res);

      // ASSERT
      expect(Game.findByIdAndUpdate).toHaveBeenCalledWith('game123', req.body, { new: true, runValidators: true });
      expect(res.json).toHaveBeenCalledWith(updatedGame);
    });

    it('should throw 404 if trying to update a non-existent game', async () => {
      req.params.id = 'invalidId';
      Game.findById.mockResolvedValue(null);

      await expect(updateGame(req, res)).rejects.toThrow('Game not found');
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteGame()', () => {
    it('should delete the game and return a success message', async () => {
      // ARRANGE
      req.params.id = 'game123';
      const mockGame = { _id: 'game123', deleteOne: jest.fn().mockResolvedValue({}) };
      Game.findById.mockResolvedValue(mockGame);

      // ACT
      await deleteGame(req, res);

      // ASSERT
      expect(mockGame.deleteOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Game removed' });
    });

    it('should throw 404 if trying to delete a non-existent game', async () => {
      req.params.id = 'invalidId';
      Game.findById.mockResolvedValue(null);

      await expect(deleteGame(req, res)).rejects.toThrow('Game not found');
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});