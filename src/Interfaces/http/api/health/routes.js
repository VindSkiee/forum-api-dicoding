import { Router } from 'express';

const createHealthRouter = (handler) => {
  const router = Router();

  router.get('/', handler.getHealthHandler);

  return router;
};

export default createHealthRouter;
