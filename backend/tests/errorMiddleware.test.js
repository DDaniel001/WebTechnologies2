const { errorHandler } = require('../src/middleware/errorMiddleware');

describe('Error Middleware - errorHandler()', () => {
  let req, res, next;

  beforeEach(() => {
    // ARRANGE
    req = {};
    res = {
      statusCode: 200, 
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should set status to 500 if current status is 200', () => {
    const err = new Error('Test server error');
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test server error' })
    );
  });

  it('should keep the existing status code if it is not 200', () => {
    res.statusCode = 400;
    const err = new Error('Bad request error');
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should hide the error stack trace in production environment', () => {
    // ARRANGE: Temporarily change environment to production
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const err = new Error('Secret error');
    err.stack = 'This should be hidden';

    // ACT
    errorHandler(err, req, res, next);

    // ASSERT: Expect the stack to be hidden (null)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Secret error',
      stack: null 
    });

    // CLEANUP: Restore the original environment
    process.env.NODE_ENV = originalEnv;
  });
});