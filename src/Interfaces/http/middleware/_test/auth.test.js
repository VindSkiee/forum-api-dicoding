import { describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import authMiddleware from '../auth.js';

describe('auth middleware', () => {
  it('should return 401 when authentication is missing', () => {
    const request = {
      headers: {},
    };
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    authMiddleware(request, response, next);

    expect(response.status).toBeCalledWith(401);
    expect(response.json).toBeCalledWith({
      status: 'fail',
      message: 'Missing authentication',
    });
    expect(next).not.toBeCalled();
  });

  it('should return 401 when token is invalid', () => {
    const request = {
      headers: {
        authorization: 'Bearer token-tidak-valid',
      },
    };
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();
    const verifySpy = vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('invalid token');
    });

    authMiddleware(request, response, next);

    expect(response.status).toBeCalledWith(401);
    expect(response.json).toBeCalledWith({
      status: 'fail',
      message: 'Token tidak valid',
    });
    expect(next).not.toBeCalled();

    verifySpy.mockRestore();
  });
});