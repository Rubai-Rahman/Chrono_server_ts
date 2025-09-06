import express from 'express';
import { userController } from './user.controller';
// import { authMiddleware } from '@middleware/auth.middleware';

const router = express.Router();

router.post('/signup', userController.signUp);
router.post('/login', userController.logIn);
router.post('/refresh', userController.refresh);
router.post('/logout', userController.logout);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

export const UserRoutes = router;
