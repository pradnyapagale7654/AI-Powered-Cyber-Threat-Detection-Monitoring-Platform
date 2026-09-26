const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  try {
    if (mongoURI) {
      console.log(`Connecting to configured MongoDB URI: ${mongoURI}`);
      await mongoose.connect(mongoURI);
      console.log('MongoDB connected successfully via URI.');
      return;
    }
  } catch (err) {
    console.warn(`Failed to connect to primary MONGODB_URI: ${err.message}. Starting in-memory MongoDB fallback...`);
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    console.log('Spinning up in-memory MongoDB server for seamless zero-config setup...');
    const mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`In-memory MongoDB started and connected at: ${memoryUri}`);
  } catch (memErr) {
    console.error('Critical Error starting MongoDB:', memErr.message);
  }
};

module.exports = connectDB;
