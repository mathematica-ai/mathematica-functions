import User from '../models/User';
import { Types } from 'mongoose';

interface UserData {
  name: string;
  email: string;
  password: string;
}

type UserUpdateData = Partial<UserData>;

export const createUser = async (userData: UserData) => {
  const user = new User(userData);
  return await user.save();
};

export const getUserById = async (id: string | Types.ObjectId) => {
  return await User.findById(id);
};

export const updateUser = async (id: string | Types.ObjectId, updateData: UserUpdateData) => {
  return await User.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteUser = async (id: string | Types.ObjectId) => {
  return await User.findByIdAndDelete(id);
}; 