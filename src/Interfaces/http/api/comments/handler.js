import AddCommentUseCase from '../../../../Applications/use_case/AddCommentUseCase.js';
import DeleteCommentUseCase from '../../../../Applications/use_case/DeleteCommentUseCase.js';
import ToggleLikeCommentUseCase from '../../../../Applications/use_case/ToggleLikeCommentUseCase.js';

class CommentsHandler {
  constructor(container) {
    this._container = container;
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.toggleLikeCommentHandler = this.toggleLikeCommentHandler.bind(this);
  }

  async postCommentHandler(req, res, next) {
    try {
      // Di Express dan middleware yang kita buat, data token ada di req.user
      const owner = req.user.id;
      const { threadId } = req.params;

      const addCommentUseCase = this._container.getInstance(
        AddCommentUseCase.name,
      );
      const addedComment = await addCommentUseCase.execute({
        content: req.body.content,
        threadId,
        owner,
      });

      res.status(201).json({
        status: 'success',
        data: {
          addedComment,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCommentHandler(req, res, next) {
    try {
      const owner = req.user.id;
      const { threadId, commentId } = req.params;

      const deleteCommentUseCase = this._container.getInstance(
        DeleteCommentUseCase.name,
      );
      await deleteCommentUseCase.execute({
        threadId,
        commentId,
        owner,
      });

      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleLikeCommentHandler(req, res, next) {
    try {
      const owner = req.user.id;
      const { threadId, commentId } = req.params;

      const toggleLikeCommentUseCase = this._container.getInstance(
        ToggleLikeCommentUseCase.name,
      );

      await toggleLikeCommentUseCase.execute({
        threadId,
        commentId,
        owner,
      });

      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CommentsHandler;
