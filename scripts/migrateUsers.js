require('dotenv').config();
const mongoose = require('mongoose');
const userService = require('../services/userService');

const usersToSeed = [
  {
    name: 'Super Admin',
    email: 'superadmin@flexliving.com',
    password: 'admin123',
    role: 'super-admin'
  },
  {
    name: 'Manager',
    email: 'manager@flexliving.com',
    password: 'admin123',
    role: 'manager'
  }
];

async function seedUsers() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flexliving';

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB:', mongoUri);

    for (const user of usersToSeed) {
      const existing = await userService.getUserByEmail(user.email);
      if (existing) {
        console.log(`User already exists: ${user.email}`);
        continue;
      }

      await userService.createUser(user);
      console.log(`Created user: ${user.email} (${user.role})`);
    }

    console.log('User migration completed.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

seedUsers();

