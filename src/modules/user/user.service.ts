import { User } from './user.model';

const signUpUser = async (userData: any) => {
  return await User.create(userData);
};

export const UserServices = {
  signUpUser,
};
