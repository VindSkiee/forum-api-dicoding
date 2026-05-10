import express from 'express';
import ClientError from '../../Commons/exceptions/ClientError.js';
import DomainErrorTranslator from '../../Commons/exceptions/DomainErrorTranslator.js';
import users from '../../Interfaces/http/api/users/index.js';
import authentications from '../../Interfaces/http/api/authentications/index.js';
import authMiddleware from '../../Interfaces/http/middleware/auth.js';
import threadsRateLimiter from '../../Interfaces/http/middleware/rateLimit.js';
import createThreadsApi from '../../Interfaces/http/api/threads/index.js';
import createCommentsApi from '../../Interfaces/http/api/comments/index.js';
import createRepliesApi from '../../Interfaces/http/api/replies/index.js';

const createServer = async (container) => {
  const app = express();
  const threadsRouter = createThreadsApi(container, authMiddleware);
  const commentsRouter = createCommentsApi(container, authMiddleware);
  const repliesRouter = createRepliesApi(container, authMiddleware);

  // Middleware for parsing JSON
  app.use(express.json());

  // Register routes
  app.use('/users', users(container));
  app.use('/authentications', authentications(container));

  app.use('/threads', threadsRateLimiter);
  app.use('/threads', threadsRouter);
  app.use('/threads/:threadId/comments', commentsRouter);

  app.use('/threads/:threadId/comments/:commentId/replies', repliesRouter);


  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    const translatedError = DomainErrorTranslator.translate(error);

    if (translatedError instanceof ClientError) {
      return res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    });
  });

  app.use((req, res) => {
    res.status(404).json({
      status: 'fail',
      message: 'Route not found',
    });
  });



  return app;
};

export default createServer;
