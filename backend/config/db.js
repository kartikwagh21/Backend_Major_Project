const mongoose = require('mongoose');

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
    
    // Seed sample realistic data on startup if needed
    const seedRealisticData = require('./seedRealisticData');
    await seedRealisticData();
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`);
    // If dev dependencies are present, try in-memory fallback
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const fallbackUri = mongod.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log(`✅ [Fallback Active]: Connected to in-memory MongoDB (${conn.connection.name})`);
      const seedRealisticData = require('./seedRealisticData');
      await seedRealisticData();
    } catch (fallbackErr) {
      console.error('Could not connect to MongoDB Atlas nor fallback:', fallbackErr.message);
    }
  }
};

module.exports = connectDB;
