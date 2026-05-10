import { Router } from 'express';

const createCommentsRouter = (handler, authMiddleware) => {
  const router = Router({ mergeParams: true });

  router.post('/', authMiddleware, handler.postCommentHandler);

  router.delete('/:commentId', authMiddleware, handler.deleteCommentHandler);

  router.put('/:commentId/likes', authMiddleware, handler.toggleLikeCommentHandler);

  return router;
};

export default createCommentsRouter;