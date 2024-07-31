import { Router } from 'express';
import { getTopics, getTopicDetails } from '../controllers/topicController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authMiddleware, getTopics);

router.get('/:id', authMiddleware, getTopicDetails);

export default router;
