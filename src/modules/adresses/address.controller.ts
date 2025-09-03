import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';

import { AddressServices } from './address.service';

export const postAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
      if (!req.user?._id) {
      res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: 'User not authenticated' });
      return;
    }
    const { name, line1, line2, city, state, postalCode, country, isDefault } =
      req.body;
    const result = await AddressServices.postAddress(req.user._id, {
      name,
      line1,
      line2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    });

    res.status(httpStatus.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

export const AddressController = {
  postAddress,
};
