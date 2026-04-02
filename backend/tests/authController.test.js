const { registerUser, loginUser } = require('../src/controllers/authController');
const User = require('../src/models/User');

jest.mock('../src/models/User');

describe('Auth Controller', () => {
  let req, res;

  // Provide a dummy secret key for the JWT generator during testing
  beforeAll(() => {
    process.env.JWT_SECRET = 'supersecret_test_key';
  });

  beforeEach(() => {
    // ARRANGE: Setup mock request and response
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser()', () => {
    it('should register a new user successfully', async () => {
      // ARRANGE
      req.body = { username: 'testuser', email: 'test@test.com', password: 'password123' };
      
      // Mock that the user does not exist yet
      User.findOne.mockResolvedValue(null);
      
      // Mock the successful creation of a user
      const mockCreatedUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@test.com'
      };
      User.create.mockResolvedValue(mockCreatedUser);

      // ACT
      await registerUser(req, res);

      // ASSERT
      expect(User.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: 'user123',
          username: 'testuser',
          email: 'test@test.com',
          token: expect.any(String)
        })
      );
    });

    it('should throw 400 if user creation fails in the database', async () => {
      // ARRANGE
      req.body = { username: 'testuser', email: 'test@test.com', password: 'password123' };
      User.findOne.mockResolvedValue(null);
      
      // Mock a database failure (returns null instead of user)
      User.create.mockResolvedValue(null);

      // ACT & ASSERT
      await expect(registerUser(req, res)).rejects.toThrow('Invalid user data provided');
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should throw 400 if fields are missing', async () => {
      // ACT & ASSERT
      await expect(registerUser(req, res)).rejects.toThrow('Please add all fields');
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should throw 400 if user already exists', async () => {
      // ARRANGE
      req.body = { username: 'test', email: 'test@test.com', password: 'password123' };
      User.findOne.mockResolvedValue({ email: 'test@test.com' });

      // ACT & ASSERT
      await expect(registerUser(req, res)).rejects.toThrow('User already exists');
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('loginUser()', () => {
    it('should login successfully with valid credentials', async () => {
      // ARRANGE
      req.body = { email: 'test@test.com', password: 'password123' };
      
      const mockUser = {
        _id: 'user123',
        username: 'test',
        email: 'test@test.com',
        matchPassword: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      // ACT
      await loginUser(req, res);

      // ASSERT
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
      expect(mockUser.matchPassword).toHaveBeenCalledWith('password123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: 'user123',
          username: 'test',
          email: 'test@test.com',
          token: expect.any(String) 
        })
      );
    });

    it('should throw 401 with invalid credentials', async () => {
      // ARRANGE
      req.body = { email: 'test@test.com', password: 'wrongpassword' };
      
      const mockUser = {
        matchPassword: jest.fn().mockResolvedValue(false)
      };
      
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      // ACT & ASSERT
      await expect(loginUser(req, res)).rejects.toThrow('Invalid email or password');
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});