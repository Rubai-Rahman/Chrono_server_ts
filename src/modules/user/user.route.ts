import express from 'express';
import { UserController } from './user.controller';

const router = express.Router();

router.put('/', UserController.createUser);

export const UserRoutes = router;
