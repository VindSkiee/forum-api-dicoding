import { describe, expect, it, vi } from 'vitest';
import RepliesHandler from '../handler.js';

const createResponse = () => {
  const response = {};

  response.status = vi.fn().mockReturnValue(response);
  response.json = vi.fn().mockReturnValue(response);

  return response;
};

describe('RepliesHandler', () => {
  it('should return 201 when posting a reply', async () => {
    const addedReply = { id: 'reply-123', content: 'sebuah balasan', owner: 'user-123' };
    const addReplyUseCase = { execute: vi.fn().mockResolvedValue(addedReply) };
    const container = { getInstance: vi.fn().mockReturnValue(addReplyUseCase) };
    const handler = new RepliesHandler(container);
    const request = {
      user: { id: 'user-123' },
      params: { threadId: 'thread-123', commentId: 'comment-123' },
      body: { content: 'sebuah balasan' },
    };
    const response = createResponse();
    const next = vi.fn();

    await handler.postReplyHandler(request, response, next);

    expect(container.getInstance).toBeCalledWith('AddReplyUseCase');
    expect(addReplyUseCase.execute).toBeCalledWith({
      content: 'sebuah balasan',
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    });
    expect(response.status).toBeCalledWith(201);
    expect(response.json).toBeCalledWith({
      status: 'success',
      data: { addedReply },
    });
    expect(next).not.toBeCalled();
  });

  it('should call next when posting a reply fails', async () => {
    const error = new Error('add reply failed');
    const addReplyUseCase = { execute: vi.fn().mockRejectedValue(error) };
    const container = { getInstance: vi.fn().mockReturnValue(addReplyUseCase) };
    const handler = new RepliesHandler(container);
    const request = {
      user: { id: 'user-123' },
      params: { threadId: 'thread-123', commentId: 'comment-123' },
      body: { content: 'sebuah balasan' },
    };
    const response = createResponse();
    const next = vi.fn();

    await handler.postReplyHandler(request, response, next);

    expect(next).toBeCalledWith(error);
    expect(response.status).not.toBeCalled();
    expect(response.json).not.toBeCalled();
  });

  it('should return 200 when deleting a reply', async () => {
    const deleteReplyUseCase = { execute: vi.fn().mockResolvedValue() };
    const container = { getInstance: vi.fn().mockReturnValue(deleteReplyUseCase) };
    const handler = new RepliesHandler(container);
    const request = {
      user: { id: 'user-123' },
      params: {
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      },
    };
    const response = createResponse();
    const next = vi.fn();

    await handler.deleteReplyHandler(request, response, next);

    expect(container.getInstance).toBeCalledWith('DeleteReplyUseCase');
    expect(deleteReplyUseCase.execute).toBeCalledWith({
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      owner: 'user-123',
    });
    expect(response.status).toBeCalledWith(200);
    expect(response.json).toBeCalledWith({ status: 'success' });
    expect(next).not.toBeCalled();
  });

  it('should call next when deleting a reply fails', async () => {
    const error = new Error('delete reply failed');
    const deleteReplyUseCase = { execute: vi.fn().mockRejectedValue(error) };
    const container = { getInstance: vi.fn().mockReturnValue(deleteReplyUseCase) };
    const handler = new RepliesHandler(container);
    const request = {
      user: { id: 'user-123' },
      params: {
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      },
    };
    const response = createResponse();
    const next = vi.fn();

    await handler.deleteReplyHandler(request, response, next);

    expect(next).toBeCalledWith(error);
    expect(response.status).not.toBeCalled();
    expect(response.json).not.toBeCalled();
  });
});