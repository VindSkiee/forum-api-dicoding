import request from 'supertest';
import { describe, it, expect, afterEach, afterAll, beforeAll } from 'vitest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';
import jwt from 'jsonwebtoken';

describe('HTTP server - /threads/{threadId}/comments endpoint', () => {
  let app;
  let accessToken;

  beforeAll(async () => {
    app = await createServer(container);
    accessToken = jwt.sign({ id: 'user-123' }, process.env.ACCESS_TOKEN_KEY);
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      const requestPayload = {
        content: 'sebuah komentar',
      };

      // Action
      const response = await request(app)
        .post('/threads/thread-123/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(
        requestPayload.content,
      );
      expect(responseJson.data.addedComment.owner).toEqual('user-123');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      const requestPayload = {}; // Payload kosong

      // Action
      const response = await request(app)
        .post('/threads/thread-123/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 404 when thread is not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const requestPayload = {
        content: 'sebuah komentar',
      };

      // Action
      const response = await request(app)
        .post('/threads/thread-tidak-ada/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 401 when missing authentication', async () => {
      // Action
      const response = await request(app)
        .post('/threads/thread-123/comments')
        .send({
          content: 'sebuah komentar',
        });

      // Assert
      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and soft delete comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      // Action
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 when deleting other user comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' }); // user requester
      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'otheruser',
      }); // owner asli
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-456',
      });

      // Action
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(403);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 when thread or comment is not found', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });

      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-tidak-ada')
        .set('Authorization', `Bearer ${accessToken}`);

      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 and toggle like', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      // Action
      const likeResponse = await request(app)
        .put('/threads/thread-123/comments/comment-123/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      const likeResponseJson = JSON.parse(likeResponse.text);
      expect(likeResponse.status).toEqual(200);
      expect(likeResponseJson.status).toEqual('success');

      const getResponse = await request(app).get('/threads/thread-123');
      const getResponseJson = JSON.parse(getResponse.text);
      expect(getResponse.status).toEqual(200);
      expect(getResponseJson.data.thread.comments[0].likeCount).toEqual(1);

      const unlikeResponse = await request(app)
        .put('/threads/thread-123/comments/comment-123/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(unlikeResponse.status).toEqual(200);

      const getResponseAfterUnlike = await request(app).get(
        '/threads/thread-123',
      );
      const getResponseAfterUnlikeJson = JSON.parse(
        getResponseAfterUnlike.text,
      );
      expect(getResponseAfterUnlikeJson.data.thread.comments[0].likeCount).toEqual(
        0,
      );
    });

    it('should response 401 when missing authentication', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const response = await request(app)
        .put('/threads/thread-123/comments/comment-123/likes');

      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread is not found', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const response = await request(app)
        .put('/threads/thread-tidak-ada/comments/comment-123/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 when comment is not found', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });

      const response = await request(app)
        .put('/threads/thread-123/comments/comment-tidak-ada/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      const responseJson = JSON.parse(response.text);
      expect(response.status).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });
});
