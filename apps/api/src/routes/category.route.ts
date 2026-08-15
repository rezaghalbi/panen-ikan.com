import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
} from '../controllers/category.controller';
import { verifyToken, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// GET bisa diakses semua orang (tanpa verifyToken)
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// POST hanya boleh Admin
router.post('/', verifyToken, adminMiddleware, createCategory);

export default router;
