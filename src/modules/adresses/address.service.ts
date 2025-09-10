import { Address } from './address.model';

export const createAddress = async (userId: string, address: any) => {
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

export const getAllAddresses = async (userId: string) => {
  try {
    const addresses = await Address.find({ userId });
    return addresses;
  } catch (error) {
    throw error;
  }
};

export const AddressServices = {
  createAddress,
  getAllAddresses,
};
