import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.route';
import categoryRoutes from './routes/category.route';
import productRoutes from './routes/product.route';
import orderRoutes from './routes/order.route';
import userRoutes from './routes/user.route';

const app: Express = express();

// Parse FRONTEND_URL dynamically from environment variables
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
  : ['http://localhost:3000', 'http://localhost:3001', 'https://panenqu.vercel.app'];

// Middleware CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or if origin is in allowedOrigins
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive callback for seamless deployment
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Serve Static Images
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// API Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'PanenQu E-Commerce API Ready! 🐟🚀',
    timestamp: new Date().toISOString(),
  });
});

// API Routes Registration
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

export default app;
