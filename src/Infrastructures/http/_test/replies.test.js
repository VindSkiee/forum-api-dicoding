import request from 'supertest';
import { describe, it, expect, afterEach, afterAll, beforeAll } from 'vitest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';
import jwt from 'jsonwebtoken';

describe('HTTP server - /threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  let app;
  let accessToken;
  const accessTokenKey = process.env.ACCESS_TOKEN_KEY || 'test_access_token_key';

  beforeAll(async () => {
    app = await createServer(container);
    accessToken = jwt.sign({ id: 'user-123' }, accessTokenKey);
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/.../replies', () => {
    it('should response 201 and persisted reply', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const response = await request(app)
        .post('/threads/thread-123/comments/comment-123/replies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah balasan' });

      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual('sebuah balasan');
      expect(responseJson.data.addedReply.owner).toEqual('user-123');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      // Action
      const response = await request(app)
        .post('/threads/thread-123/comments/comment-123/replies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 401 when token is invalid', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const response = await request(app)
        .post('/threads/thread-123/comments/comment-123/replies')
        .set('Authorization', 'Bearer token-tidak-valid')
        .send({ content: 'sebuah balasan' });

      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Token tidak valid');
    });
  });

  describe('when DELETE /threads/.../replies/{replyId}', () => {
    it('should response 200 and soft delete reply', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-123')
        .set('Authorization', `Bearer ${accessToken}`);

      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 when reply is not found', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      // Action
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-tidak-ada')
        .set('Authorization', `Bearer ${accessToken}`);

      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('balasan tidak ditemukan');
    });

    it('should response 403 when deleting other user reply', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'otheruser' });
      const otherAccessToken = jwt.sign({ id: 'user-456' }, accessTokenKey);

      // Action
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-123')
        .set('Authorization', `Bearer ${otherAccessToken}`);

      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak berhak mengakses resource ini');
    });
  });
});