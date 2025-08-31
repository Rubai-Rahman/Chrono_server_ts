import express from 'express';
import { UserController } from './user.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = express.Router();

router.put('/', authMiddleware, UserController.createUser);

export const UserRoutes = router;
