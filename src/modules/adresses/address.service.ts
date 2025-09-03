import { Address } from './address.model';

export const postAddress = async (userId: string, address: any) => {
  try {
    const result = await Address.create({
      userId,
      ...address,
    });
    return result;
  } catch (error) {
    throw error;
  }
};

export const AddressServices = {
  postAddress,
};
