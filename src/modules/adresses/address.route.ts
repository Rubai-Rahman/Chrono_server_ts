import express from 'express';
import { AddressController } from './address.controller';
import { validateRequest } from '@middleware/validateRequest';
import { AddressSchema } from './address.validation';
import { authMiddleware } from '@middleware/auth.middleware';

const router = express.Router();

router.post(
  '/create',
  authMiddleware,
  validateRequest(AddressSchema) as express.RequestHandler,
  AddressController.postAddress,
);
router.get('/all', authMiddleware, AddressController.getAllAddresses);
router.put('/update/:id', authMiddleware, AddressController.updateAddress);
router.delete('/delete/:id', authMiddleware, AddressController.deleteAddress);

export const AddressRoutes = router;
