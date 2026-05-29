import { describe, expect, it } from 'vitest';
import ToggleLikeComment from '../ToggleLikeComment.js';

describe('ToggleLikeComment entity', () => {
  it('should throw when payload is missing required property', () => {
    expect(() => new ToggleLikeComment({})).toThrowError(
      'TOGGLE_LIKE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw when payload does not meet data type specification', () => {
    const payload = {
      threadId: 123,
      commentId: 'comment-123',
      owner: 'user-123',
    };

    expect(() => new ToggleLikeComment(payload)).toThrowError(
      'TOGGLE_LIKE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create toggle like comment entity correctly', () => {
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const toggleLikeComment = new ToggleLikeComment(payload);

    expect(toggleLikeComment.threadId).toEqual(payload.threadId);
    expect(toggleLikeComment.commentId).toEqual(payload.commentId);
    expect(toggleLikeComment.owner).toEqual(payload.owner);
  });
});