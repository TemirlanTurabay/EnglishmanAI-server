import { Router } from 'express';
import { createKTP } from '../controllers/ktpController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.post('/create', authMiddleware, createKTP);

export default router;
