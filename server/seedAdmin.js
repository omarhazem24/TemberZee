const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });

    if (adminExists) {
        adminExists.password = 'Zxcv12341234';
        await adminExists.save();
        console.log('Admin password updated successfully');
        process.exit();
    }

    const adminUser = {
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      email: 'admin@example.com',
      password: 'Zxcv12341234',
      role: 'admin',
      phoneNumber: '1234567890',
      isEmailVerified: true,
      isPhoneVerified: true,
      address: {
          street: 'Admin St',
          city: 'Admin City',
          state: 'AD',
          zip: '00000',
          country: 'AdminLand'
      }
    };

    await User.create(adminUser);

    console.log('Admin user created successfully');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
