/* eslint-disable camelcase */
import { describe, it, expect, vi } from 'vitest';
import GetThreadUseCase from '../GetThreadUseCase.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly and format deleted comments and replies', async () => {
    const useCasePayload = { threadId: 'thread-123' };

    const expectedThread = { id: 'thread-123', title: 'sebuah thread', body: 'sebuah body thread', date: '2021', username: 'dicoding' };
    const expectedComments = [
      {
        id: 'comment-1',
        username: 'johndoe',
        date: '2021',
        content: 'sebuah comment',
        is_delete: false,
        like_count: 0,
      },
    ];
    const expectedReplies = [
      { id: 'reply-1', comment_id: 'comment-1', username: 'dicoding', date: '2021', content: 'balasan', is_delete: false },
      { id: 'reply-2', comment_id: 'comment-1', username: 'johndoe', date: '2021', content: 'rahasia', is_delete: true },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = vi.fn()
      .mockImplementation(() => Promise.resolve({ ...expectedThread }));
    mockCommentRepository.getCommentsByThreadId = vi.fn()
      .mockImplementation(() => Promise.resolve([...expectedComments]));
    mockReplyRepository.getRepliesByThreadId = vi.fn()
      .mockImplementation(() => Promise.resolve([...expectedReplies]));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const thread = await getThreadUseCase.execute(useCasePayload);

    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCasePayload.threadId);
    
    expect(thread).toStrictEqual({
      ...expectedThread,
      comments: [
        {
          id: 'comment-1',
          username: 'johndoe',
          date: '2021',
          content: 'sebuah comment',
          likeCount: 0,
          replies: [
            { id: 'reply-1', username: 'dicoding', date: '2021', content: 'balasan' },
            { id: 'reply-2', username: 'johndoe', date: '2021', content: '**balasan telah dihapus**' }, // tersensor
          ],
        },
      ],
    });
  });
});