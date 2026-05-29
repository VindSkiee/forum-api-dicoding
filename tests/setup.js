import dotenv from 'dotenv';
import path from 'path';

process.env.NODE_ENV = 'test';

dotenv.config({
  path: path.resolve(process.cwd(), '.test.env'),
});


process.env.ACCESS_TOKEN_KEY = process.env.ACCESS_TOKEN_KEY || 'test_access_token_key';
process.env.REFRESH_TOKEN_KEY = process.env.REFRESH_TOKEN_KEY || 'test_refresh_token_key';

process.env.PGHOST = process.env.PGHOST || 'localhost';
process.env.PGPORT = process.env.PGPORT || '5432';
process.env.PGUSER = process.env.PGUSER || 'arvind';
process.env.PGPASSWORD = process.env.PGPASSWORD || 'admin';
process.env.PGDATABASE = process.env.PGDATABASE || 'forumapi_test';
