const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    const seedRealisticData = require('./seedRealisticData');
    await seedRealisticData();
  } catch (error) {
    console.warn(`[Atlas Warning]: ${error.message}`);
    console.log('🔄 Launching local in-memory MongoDB engine fallback...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ [Fallback Active]: Connected to in-memory MongoDB (${conn.connection.name})`);
      const seedRealisticData = require('./seedRealisticData');
      await seedRealisticData();
    } catch (fallbackErr) {
      console.error('Failed to start fallback database:', fallbackErr.message);
    }
  }
};

module.exports = connectDB;
