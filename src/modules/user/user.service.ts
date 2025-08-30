import { User } from './user.model';
import { TUser } from './user.interface';

const createUserIntoDB = async (userData: TUser) => {
  const userExist = await User.isUserExists(userData.name);
  if (userExist) {
    return userExist;
  }
  const result = await User.create(userData);
  return {
    name: result.name,
    email: result.email,
    isActive: result.isActive,
    photoUrl: result.photoUrl,
    rememberMe: result.rememberMe,
    role: result.role,
  };
};

export const UserServices = {
  createUserIntoDB,
};
