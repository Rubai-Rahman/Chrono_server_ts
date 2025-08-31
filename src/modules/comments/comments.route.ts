import express from 'express';
import { CommentController } from './comments.controller';

const router = express.Router();

router.get('/:id', CommentController.getCommentsByNewsId);

export const CommentRoutes = router;
