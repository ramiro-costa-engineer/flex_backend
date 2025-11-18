const User = require('../models/User');

async function createUser(userData) {
  const user = new User(userData);
  return await user.save();
}

async function getUserByEmail(email) {
  return await User.findOne({ email: email.toLowerCase() });
}

async function getUserById(id) {
  return await User.findById(id);
}

async function updatePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId);
  if (!user) return { success: false, message: 'User not found' };
  if (user.password !== currentPassword) {
    return { success: false, message: 'Current password is incorrect' };
  }
  user.password = newPassword;
  await user.save();
  return { success: true };
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updatePassword
};

