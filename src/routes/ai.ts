import { Router } from 'express';
import { chatWithAI, getChatHistory } from '../controllers/aiController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.post('/chat', authMiddleware, chatWithAI);
router.get('/history', authMiddleware, getChatHistory);

export default router;
