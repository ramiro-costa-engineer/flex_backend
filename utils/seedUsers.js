const User = require('../models/User');

async function seedUsers() {
  try {
    const existingManager = await User.findOne({ email: 'manager@flexliving.com' });
    
    if (!existingManager) {
      await User.create({
        name: 'Manager',
        email: 'manager@flexliving.com',
        password: 'admin123',
        role: 'manager'
      });
      console.log('Manager user created');
    }

    const existingSuperAdmin = await User.findOne({ email: 'admin@flexliving.com' });
    
    if (!existingSuperAdmin) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@flexliving.com',
        password: 'admin123',
        role: 'super-admin'
      });
      console.log('Super admin user created');
    }

    console.log('User seeding completed');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

module.exports = { seedUsers };

