import NewComment from '../../Domains/comments/entities/NewComment.js';

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const newComment = new NewComment(useCasePayload);
    // Verifikasi apakah thread ada di database
    await this._threadRepository.checkAvailabilityThread(newComment.threadId);

    return this._commentRepository.addComment(newComment);
  }
}

export default AddCommentUseCase;