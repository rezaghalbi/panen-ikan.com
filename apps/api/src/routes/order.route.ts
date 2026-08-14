import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  handleMidtransNotification,
} from '../controllers/order.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Webhook callback endpoint for Midtrans Payment Gateway
router.post('/notification', handleMidtransNotification);

// User protected routes
router.post('/', authMiddleware, createOrder);
router.get('/my-orders', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getOrderById);

// Admin protected routes
router.get('/', authMiddleware, adminMiddleware, getAllOrders);
router.patch('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);

export default router;
