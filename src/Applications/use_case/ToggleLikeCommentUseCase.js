import ToggleLikeComment from '../../Domains/comments/entities/ToggleLikeComment.js';

class ToggleLikeCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const toggleLikeComment = new ToggleLikeComment(useCasePayload);

    await this._threadRepository.checkAvailabilityThread(toggleLikeComment.threadId);
    await this._commentRepository.checkAvailabilityComment(toggleLikeComment.commentId);

    const isLiked = await this._commentRepository.isCommentLiked(
      toggleLikeComment.commentId,
      toggleLikeComment.owner,
    );

    if (isLiked) {
      await this._commentRepository.deleteCommentLike(
        toggleLikeComment.commentId,
        toggleLikeComment.owner,
      );
      return;
    }

    await this._commentRepository.addCommentLike(
      toggleLikeComment.commentId,
      toggleLikeComment.owner,
    );
  }
}

export default ToggleLikeCommentUseCase;
