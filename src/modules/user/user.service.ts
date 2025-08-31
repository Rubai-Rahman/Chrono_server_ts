import { User } from './user.model';

// user.service.ts
const getUserProfile = async (userId: string) => {
  return await User.findById(userId).select('-__v -createdAt -updatedAt');
};

export const UserServices = {
  getUserProfile,
};
