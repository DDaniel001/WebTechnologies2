const User = require('../src/models/User');
const bcrypt = require('bcryptjs'); // Or require('bcrypt') depending on your package.json

// Mock bcrypt to avoid heavy cryptographic calculations during tests
jest.mock('bcryptjs');

describe('User Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('matchPassword()', () => {
    it('should return true if entered password matches the hashed password', async () => {
      // ARRANGE: Create a dummy user instance with a hashed password
      const user = new User({
        username: 'testuser',
        email: 'test@test.com',
        password: 'hashedPassword123'
      });

      // Mock bcrypt.compare to return true
      bcrypt.compare.mockResolvedValue(true);

      // ACT
      const isMatch = await user.matchPassword('plainTextPassword');

      // ASSERT
      expect(bcrypt.compare).toHaveBeenCalledWith('plainTextPassword', 'hashedPassword123');
      expect(isMatch).toBe(true);
    });

    it('should return false if entered password does not match', async () => {
      // ARRANGE
      const user = new User({ password: 'hashedPassword123' });
      bcrypt.compare.mockResolvedValue(false);

      // ACT
      const isMatch = await user.matchPassword('wrongPassword');

      // ASSERT
      expect(isMatch).toBe(false);
    });
  });
});