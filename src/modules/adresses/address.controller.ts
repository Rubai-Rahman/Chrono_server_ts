import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';

import { AddressServices } from './address.service';
import { AuthRequest } from '@middleware/auth.middleware';

export const postAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const { user } = req;
  console.log('User===:', user);
  const addressData = req.body;
  try {
    const newAddress = await AddressServices.createAddress(
      user!.userId,
      addressData,
    );
    res.status(httpStatus.CREATED).json(newAddress);
  } catch (error) {
    next(error);
  }
};

export const getAllAddresses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const { user } = req;
  try {
    const addresses = await AddressServices.getAllAddresses(user!.userId);
    res.status(httpStatus.OK).json(addresses);
  } catch (error) {
    next(error);
  }
};

export const AddressController = {
  postAddress,
  getAllAddresses,
};
