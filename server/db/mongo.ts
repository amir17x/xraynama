import mongoose from 'mongoose';
import { log } from '../vite';

// Get MongoDB connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MongoDB URI is missing. Please set the MONGODB_URI environment variable.');
}

// Connect to MongoDB
export const connectToMongoDB = async () => {
  try {
    log(`Connecting to MongoDB...`, 'mongodb');
    
    const options = {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };
    
    await mongoose.connect(MONGODB_URI, options);
    
    log(`Connected to MongoDB successfully!`, 'mongodb');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      log(`MongoDB connection error: ${err}`, 'mongodb');
    });
    
    mongoose.connection.on('disconnected', () => {
      log('MongoDB disconnected. Trying to reconnect...', 'mongodb');
    });
    
    mongoose.connection.on('reconnected', () => {
      log('MongoDB reconnected successfully!', 'mongodb');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        log('MongoDB connection closed through app termination', 'mongodb');
        process.exit(0);
      } catch (err) {
        log(`Error closing MongoDB connection: ${err}`, 'mongodb');
        process.exit(1);
      }
    });
    
    return mongoose.connection;
  } catch (error) {
    log(`Failed to connect to MongoDB: ${error}`, 'mongodb');
    process.exit(1);
  }
};

export const getMongoDBConnection = () => {
  return mongoose.connection;
};

export const disconnectFromMongoDB = async () => {
  try {
    await mongoose.connection.close();
    log('MongoDB connection closed', 'mongodb');
  } catch (error) {
    log(`Error disconnecting from MongoDB: ${error}`, 'mongodb');
    throw error;
  }
};