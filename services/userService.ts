import User from '../models/User';

export const createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

export const getUserById = async (id) => {
  return await User.findById(id);
};

export const updateUser = async (id, updateData) => {
  return await User.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
}; 