const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const DB_URI = 'mongodb://localhost:27017/FitManager';

async function seed() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(DB_URI);
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const email = 'admin@fitmanager.com';
    const existing = await usersCollection.findOne({ email });
    
    if (existing) {
      console.log('Super Admin already exists! You can log in with:');
      console.log('Email: admin@fitmanager.com');
      console.log('Password: superadmin123 (if you have not changed it)');
      process.exit(0);
    }

    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash('superadmin123', 10);
    
    console.log('Inserting Super Admin record...');
    await usersCollection.insertOne({
      email,
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      gymId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
    });

    console.log('\n✅ Super Admin successfully created!');
    console.log('------------------------------------');
    console.log('Email: admin@fitmanager.com');
    console.log('Password: superadmin123');
    console.log('------------------------------------\n');
    
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
