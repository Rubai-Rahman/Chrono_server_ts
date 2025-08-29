import { User } from './user.model';
import { TUser } from './user.interface';

const createUserIntoDB = async (userData: TUser) => {
  if (await User.isUserExists(userData.name)) {
    throw new Error('User already exists');
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
