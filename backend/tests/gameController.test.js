//npm test -- --coverage
const Game = require('../src/models/Game');
const {
  getGames,
  createGame,
  getGameById,
  updateGame,
  deleteGame,
} = require('../src/controllers/gameController');

// Mocking the Game model
jest.mock('../src/models/Game');

describe('Game Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Standard mock request with user ID
    req = {
      user: { _id: 'user123' },
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getGames()', () => {
    it('should return all games for the logged-in user', async () => {
      const mockGames = [{ title: 'Game 1', user: 'user123' }];
      Game.find = jest.fn().mockResolvedValue(mockGames);

      await getGames(req, res);

      expect(Game.find).toHaveBeenCalledWith({ user: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockGames);
    });
  });

  describe('createGame()', () => {
    it('should create a new game', async () => {
      req.body = {
        title: 'New Game',
        platform: 'PC',
        genre: 'RPG',
        rating: 9,
        status: 'Playing',
      };
      const mockGame = { ...req.body, user: 'user123' };
      Game.create = jest.fn().mockResolvedValue(mockGame);

      await createGame(req, res);

      expect(Game.create).toHaveBeenCalledWith({
        ...req.body,
        user: 'user123',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockGame);
    });

    it('should throw an error if required fields are missing', async () => {
      req.body = { title: 'Incomplete Game' };

      await expect(createGame(req, res)).rejects.toThrow(
        'Please add all required fields'
      );
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getGameById()', () => {
    it('should return a game if it exists and belongs to the user', async () => {
      // FIX: Added 'user' property to match ownership check in controller
      const mockGame = { _id: 'game123', title: 'Test Game', user: 'user123' };
      req.params.id = 'game123';
      Game.findById = jest.fn().mockResolvedValue(mockGame);

      await getGameById(req, res);

      expect(Game.findById).toHaveBeenCalledWith('game123');
      expect(res.json).toHaveBeenCalledWith(mockGame);
    });

    it('should throw 404 error if game is not found or not owned by user', async () => {
      req.params.id = 'nonexistent';
      Game.findById = jest.fn().mockResolvedValue(null);

      await expect(getGameById(req, res)).rejects.toThrow('Game not found');
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateGame()', () => {
    it('should update the game and return the updated document', async () => {
      req.params.id = 'game123';
      req.body = { title: 'Updated Title' };
      // FIX: Mock original game must have the owner's ID
      const originalGame = { _id: 'game123', user: 'user123', title: 'Old Title' };
      const updatedGame = { ...originalGame, ...req.body };

      Game.findById = jest.fn().mockResolvedValue(originalGame);
      Game.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedGame);

      await updateGame(req, res);

      expect(Game.findById).toHaveBeenCalledWith('game123');
      expect(Game.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(updatedGame);
    });

    it('should throw 401 error if user tries to update someone else\'s game', async () => {
        req.params.id = 'game123';
        const otherUsersGame = { _id: 'game123', user: 'differentUser', title: 'Old Title' };
        Game.findById = jest.fn().mockResolvedValue(otherUsersGame);

        await expect(updateGame(req, res)).rejects.toThrow('User not authorized');
        expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('deleteGame()', () => {
    it('should delete the game and return a success message', async () => {
      req.params.id = 'game123';
      // FIX: Mock game must have the owner's ID
      const mockGame = { 
        _id: 'game123', 
        user: 'user123', 
        deleteOne: jest.fn().mockResolvedValue(true) 
      };
      Game.findById = jest.fn().mockResolvedValue(mockGame);

      await deleteGame(req, res);

      expect(Game.findById).toHaveBeenCalledWith('game123');
      expect(mockGame.deleteOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Game removed' });
    });

    it('should throw 401 error if user tries to delete someone else\'s game', async () => {
        req.params.id = 'game123';
        const otherUsersGame = { _id: 'game123', user: 'differentUser' };
        Game.findById = jest.fn().mockResolvedValue(otherUsersGame);

        await expect(deleteGame(req, res)).rejects.toThrow('User not authorized');
        expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});