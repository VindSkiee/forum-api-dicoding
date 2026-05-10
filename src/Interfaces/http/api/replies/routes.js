import { Router } from 'express';

const createRepliesRouter = (handler, authMiddleware) => {
  const router = Router({ mergeParams: true });

  router.post('/', authMiddleware, handler.postReplyHandler);
  router.delete('/:replyId', authMiddleware, handler.deleteReplyHandler);

  return router;
};

export default createRepliesRouter;