import { TAddress } from './address.interface';
import { Address } from './address.model';

export const createAddress = async (userId: string, address: TAddress) => {
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

const updateAddress = async (
  userId: string,
  id: string,
  addressData: TAddress,
) => {
  try {
    if (addressData.isDefault) {
      await Address.updateMany(
        { userId, _id: { $ne: id }, isDefault: true },
        {
          $set: {
            isDefault: false,
          },
        },
      );
    }

    // Step 2: Update the target address
    const updatedAddress = await Address.findOneAndUpdate(
      { _id: id, userId },
      addressData,
      { new: true },
    );

    return updatedAddress;
  } catch (error) {
    throw error;
  }
};

const deleteAddress = async (userId: string, id: string) => {
  try {
    const deletedAddress = await Address.findOneAndDelete({ _id: id, userId });
    return deletedAddress;
  } catch (error) {
    throw error;
  }
};

export const AddressServices = {
  createAddress,
  getAllAddresses,
  updateAddress,
  deleteAddress,
};
