import { Router } from 'express';
import { registerUser, loginUser, googleAuth, googleAuthCallback } from '../controllers/authController';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);

export default router;
