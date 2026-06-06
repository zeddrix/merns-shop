import path from 'path';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { seoBotMiddleware } from './middleware/seoBotMiddleware.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import seoRoutes from './routes/seoRoutes.js';

dotenv.config();

const app = express();

if (process.env.NODE_ENV !== 'production') {
  app.use(
    cors({
      origin: [
        'http://localhost:5020',
        'http://127.0.0.1:5020',
        'http://localhost:5030',
        'http://127.0.0.1:5030'
      ],
      credentials: true
    })
  );
}

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(cookieParser());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/config/paypal', (_req, res) => res.send(process.env.PAYPAL_CLIENT_ID ?? ''));

app.use(seoRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(seoBotMiddleware);
  app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

  app.get('/{*splat}', (_req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
  );
} else if (process.env.NODE_ENV !== 'test') {
  app.get('/', (_req, res) => {
    res.send('API is running...');
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
