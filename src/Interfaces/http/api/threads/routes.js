import { Router } from 'express';

const createThreadsRouter = (handler, authMiddleware) => {
  const router = Router();

  router.post('/', authMiddleware, handler.postThreadHandler);
  router.get('/:threadId', handler.getThreadHandler);

  return router;
};

export default createThreadsRouter;