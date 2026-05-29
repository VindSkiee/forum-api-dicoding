import HealthHandler from './handler.js';
import createHealthRouter from './routes.js';

export default () => {
  const healthHandler = new HealthHandler();
  return createHealthRouter(healthHandler);
};
