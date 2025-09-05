import express from 'express';
import { userController } from './user.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = express.Router();

router.post('/signup', userController.SignUP);
// router.post('/login', userController.login);
// router.post('/refresh', userController.refresh);
router.post('/logout', userController.logout);

export const UserRoutes = router;
