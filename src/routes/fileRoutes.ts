import { Router } from 'express';
import { getFiles, downloadFile } from '../controllers/fileController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authMiddleware,getFiles);
router.get('/:fileName',authMiddleware, downloadFile);

export default router;
