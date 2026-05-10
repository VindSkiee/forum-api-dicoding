import request from 'supertest';
import { describe, it, expect, afterEach, afterAll, beforeAll } from 'vitest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';
import jwt from 'jsonwebtoken';

describe('HTTP server - /threads endpoint', () => {
  let app;
  let accessToken;

  beforeAll(async () => {
    app = await createServer(container);
    // Buat token JWT valid untuk simulasi autentikasi
    accessToken = jwt.sign({ id: 'user-123' }, process.env.ACCESS_TOKEN_KEY);
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
      expect(responseJson.data.addedThread.owner).toEqual('user-123');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const requestPayload = {
        title: 'sebuah thread',
      };

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 401 when missing authentication', async () => {
      // Action
      const response = await request(app)
        .post('/threads')
        .send({
          title: 'sebuah thread',
          body: 'sebuah body thread',
        });

      // Assert
      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread details with comments', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      // Gunakan instance query postgres untuk membuat komentar langsung
      await pool.query(
        "INSERT INTO comments VALUES('comment-1', 'thread-123', 'sebuah comment', 'user-123', false, '2021-08-08T07:22:33.555Z')",
      );
      await pool.query(
        "INSERT INTO comments VALUES('comment-2', 'thread-123', 'rahasia', 'user-123', true, '2021-08-08T07:26:21.338Z')",
      );

      // Action
      const response = await request(app).get('/threads/thread-123');

      // Assert
      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.id).toEqual('thread-123');
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].content).toEqual(
        'sebuah comment',
      );
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(0);
      expect(responseJson.data.thread.comments[1].content).toEqual(
        '**komentar telah dihapus**',
      );
      expect(responseJson.data.thread.comments[1].likeCount).toEqual(0);
    });

    it('should response 404 when thread not found', async () => {
      const response = await request(app).get('/threads/thread-tidak-ada');
      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });
});
