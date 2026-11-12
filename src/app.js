import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiRouter } from './routes.js';
import { config } from './config.js';
import { errorHandler } from './middlewares/error-handler.js';
import { HttpError } from './utils/http-error.js';

export function createApp() {
  const app = express();

  // H15: antes se reflejaba cualquier Origin con credentials:true, el
  // límite de body era 50mb y no había headers de seguridad.
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins, credentials: true }));
  app.use(express.json({ limit: '10kb' }));
  app.use(morgan('dev'));
  app.use(express.static('public'));

  app.use('/api', apiRouter);

  app.use((req) => {
    throw new HttpError(404, `No existe la ruta ${req.method} ${req.originalUrl}`);
  });
  app.use(errorHandler);

  return app;
}
