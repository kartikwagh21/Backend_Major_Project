const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const seedRealisticData = require('./seedRealisticData');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ FATAL: MONGO_URI environment variable is not defined!');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ [MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);

    // Seed sample data ONLY if the database is completely empty
    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      console.log('ℹ️ Empty database detected on startup. Auto-seeding initial dataset...');
      await seedRealisticData(false);
    } else {
      console.log(`ℹ️ Existing database with ${customerCount} customers found. Skipping automatic seeder.`);
    }
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`);
    // If dev dependencies are present, try in-memory fallback
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const fallbackUri = mongod.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log(`✅ [Fallback Active]: Connected to in-memory MongoDB (${conn.connection.name})`);
      const customerCount = await Customer.countDocuments();
      if (customerCount === 0) {
        await seedRealisticData(false);
      }
    } catch (fallbackErr) {
      console.error('Could not connect to MongoDB Atlas nor fallback:', fallbackErr.message);
    }
  }
};

module.exports = connectDB;
