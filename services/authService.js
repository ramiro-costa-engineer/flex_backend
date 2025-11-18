const User = require('../models/User');

async function validateCredentials(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    return null;
  }

  if (user.password !== password) {
    return null;
  }

  return user;
}

function generateToken() {
  return 'mock-jwt-token-' + Date.now();
}

function getUserInfo(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}

module.exports = {
  validateCredentials,
  generateToken,
  getUserInfo
};

