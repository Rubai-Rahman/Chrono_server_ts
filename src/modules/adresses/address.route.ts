import express from 'express';
import { authMiddleware } from '@middleware/auth.middleware';
import { AddressController } from './address.controller';
import { validateRequest } from '@middleware/validateRequest';
import { AddressSchema } from './address.validation';

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  validateRequest(AddressSchema) as express.RequestHandler,
  AddressController.postAddress,
);

export const AddressRoutes = router;
