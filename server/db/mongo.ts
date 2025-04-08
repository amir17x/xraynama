import mongoose from 'mongoose';
import { log } from '../vite';

// Get MongoDB connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Connection state
let isConnecting = false;
let mongoConnection: mongoose.Connection | null = null;

// Optimized Connect to MongoDB with connection pooling and caching
export const connectToMongoDB = async () => {
  try {
    // Return existing connection if already established
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
    
    // Return null if no URI is provided
    if (!MONGODB_URI) {
      log(`No MongoDB URI provided, skipping connection`, 'mongodb');
      return null;
    }
    
    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
      log(`MongoDB connection already in progress, waiting...`, 'mongodb');
      // Wait for the existing connection attempt to complete
      await new Promise<void>((resolve) => {
        const checkConnection = () => {
          if (!isConnecting || mongoose.connection.readyState === 1) {
            resolve();
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
      return mongoose.connection;
    }
    
    isConnecting = true;
    log(`Connecting to MongoDB...`, 'mongodb');
    
    const options = {
      autoIndex: process.env.NODE_ENV !== 'production', // Only create indexes in development
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      // Optimize for a production environment with connection pooling
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Keep at least 5 connections open
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      family: 4, // Use IPv4, skip trying IPv6
    };
    
    try {
      await mongoose.connect(MONGODB_URI as string, options);
      mongoConnection = mongoose.connection;
      log(`Connected to MongoDB successfully!`, 'mongodb');
    } finally {
      isConnecting = false;
    }
    
    // Setup connection events only once
    if (!mongoConnection) {
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
      
      mongoConnection = mongoose.connection;
    }
    
    return mongoConnection;
  } catch (error) {
    isConnecting = false;
    log(`Failed to connect to MongoDB: ${error}`, 'mongodb');
    // Don't exit the process on connection failure, allow retry
    return null;
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