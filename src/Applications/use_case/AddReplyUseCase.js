import NewReply from '../../Domains/replies/entities/NewReply.js';

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const newReply = new NewReply(useCasePayload);

    // Verifikasi thread dan comment exist
    await this._threadRepository.checkAvailabilityThread(newReply.threadId);
    await this._commentRepository.checkAvailabilityComment(newReply.commentId);

    return this._replyRepository.addReply(newReply);
  }
}

export default AddReplyUseCase;