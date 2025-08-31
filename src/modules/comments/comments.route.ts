import express from 'express';

const router = express.Router();

// // Public routes - no authentication required
// router.get('/', getAllComments);
// router.get('/:id', getCommentById);

export const CommentRoutes = router;
