import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should load config from dotenv when not in test environment', async () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '5000';
    process.env.PGHOST = 'db-host';
    process.env.PGPORT = '5432';
    process.env.PGUSER = 'db-user';
    process.env.PGPASSWORD = 'db-password';
    process.env.PGDATABASE = 'db-name';
    process.env.ACCESS_TOKEN_KEY = 'access-token-key';
    process.env.REFRESH_TOKEN_KEY = 'refresh-token-key';
    process.env.ACCESS_TOKEN_AGE = '3000';

    const { default: config } = await import('../config.js');

    expect(config.app.host).toEqual('0.0.0.0');
    expect(config.app.port).toEqual('5000');
    expect(config.database.host).toEqual('db-host');
    expect(config.auth.accessTokenKey).toEqual('access-token-key');
  });

  it('should load config from test dotenv when in test environment', async () => {
    process.env.NODE_ENV = 'test';
    process.env.PORT = '5001';

    const { default: config } = await import('../config.js');

    expect(config.app.host).toEqual('localhost');
    expect(config.app.port).toEqual('5001');
  });

  it('should set debug config in development environment', async () => {
    process.env.NODE_ENV = 'development';

    const { default: config } = await import('../config.js');

    expect(config.app.debug).toEqual({ request: ['error'] });
  });
});