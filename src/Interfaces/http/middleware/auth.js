import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'fail',
      message: 'Missing authentication',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);

    req.user = decoded;

    next();
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token tidak valid',
    });
  }
};

export default authMiddleware;