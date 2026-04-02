const { protect } = require('../src/middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../src/models/User');

describe('Auth Middleware - protect()', () => {
  let req, res, next;

  beforeEach(() => {
    // ARRANGE: Set up the mock objects
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // Suppress console.error during tests to keep terminal output clean
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    console.error.mockRestore(); // Restore console.error after each test
  });

  it('should return 401 if no authorization header is present', async () => {
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token found' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header does not start with Bearer', async () => {
    req.headers.authorization = 'Basic sometoken123';
    await protect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should call next() and attach user to request if token is valid', async () => {
    req.headers.authorization = 'Bearer validtoken123';
    jwt.verify.mockReturnValue({ id: 'testUserId' });

    const mockUser = { _id: 'testUserId', username: 'testuser' };
    
    // Simply return the mock user directly
    User.findById.mockResolvedValue(mockUser);

    await protect(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('validtoken123', process.env.JWT_SECRET);
    expect(User.findById).toHaveBeenCalledWith('testUserId');
    expect(req.user).toEqual(mockUser); 
    expect(next).toHaveBeenCalled(); 
  });

  it('should respond with 401 if token is invalid or expired', async () => {
    req.headers.authorization = 'Bearer invalidtoken123';
    
    // Force jwt.verify to throw an error
    jwt.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    // The middleware catches the error internally, it does not throw!
    await protect(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
    expect(next).not.toHaveBeenCalled();
  });
});