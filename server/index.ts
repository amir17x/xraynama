import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { MongoDBStorage } from "./db/mongodb-storage";
import { storage } from "./storage";
import { apiErrorMiddleware } from "./middleware/api-error-middleware";

// Check if we need to use MongoDB
const useMongoDb = process.env.MONGODB_URI ? true : false;

// Initialize MongoDB storage if available
let mongoDBStorage: MongoDBStorage | null = null;
if (useMongoDb) {
  mongoDBStorage = new MongoDBStorage();
  
  // Replace storage reference with MongoDB implementation
  // This is a hack to make it work without changing all the code
  // that uses storage directly
  Object.setPrototypeOf(storage, mongoDBStorage);
  
  // Copy methods to the storage object
  for (const key of Object.getOwnPropertyNames(MongoDBStorage.prototype)) {
    if (key !== 'constructor') {
      (storage as any)[key] = (mongoDBStorage as any)[key];
    }
  }
  
  // Copy properties from the MongoDB storage instance
  for (const key of Object.getOwnPropertyNames(mongoDBStorage)) {
    if (key !== 'constructor') {
      (storage as any)[key] = (mongoDBStorage as any)[key];
    }
  }
  
  log("Using MongoDB storage", "storage");
} else {
  log("Using in-memory storage", "storage");
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// میدلور تبدیل پاسخ‌های HTML به JSON برای API ها
app.use(apiErrorMiddleware);

// Optimized logging middleware - only applied to API routes to reduce overhead
app.use("/api", (req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  // Only capture response in development mode for debugging
  let capturedJsonResponse: Record<string, any> | undefined = undefined;
  
  if (process.env.NODE_ENV !== 'production') {
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
  }

  res.on("finish", () => {
    const duration = Date.now() - start;
    let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
    
    // Only include response body in development for debugging
    if (process.env.NODE_ENV !== 'production' && capturedJsonResponse) {
      logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
    }

    log(logLine);
  });

  next();
});

/**
 * Start the server with optimized startup
 * - Connect to MongoDB asynchronously
 * - Register routes in parallel where possible
 * - Implement graceful error handling
 */

// Force development mode for Vite in Replit
process.env.NODE_ENV = "development";

(async () => {
  // Setup error handler middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    if (status >= 500) {
      console.error('Server error:', err);
    }
    
    res.status(status).json({ message });
    // Don't throw after sending response - this is an anti-pattern
    // that can cause unhandled promise rejections
  });

  // Start a parallel task for connecting to MongoDB
  const mongoConnectionPromise = (useMongoDb && mongoDBStorage) ? 
    mongoDBStorage.init().then(() => {
      log("Connected to MongoDB successfully", "mongodb");
    }).catch(error => {
      log(`Failed to connect to MongoDB: ${error}`, "mongodb");
      // Don't exit process on connection failure, allow reconnecting
    }) : 
    Promise.resolve();
  
  // Register health check route quickly without waiting for other tasks
  app.get("/api/health", (req, res) => {
    res.status(200).json({ 
      status: "ok", 
      timestamp: Date.now(),
      server: "Xraynama API"
    });
  });
  
  // Create base server first
  const server = await registerRoutes(app);
  
  // Setup Vite or static serving
  // Always use Vite in development mode on Replit
  await setupVite(app, server);
  
  // Wait for MongoDB connection to complete in parallel
  await mongoConnectionPromise.catch(error => {
    log(`MongoDB connection error: ${error}`, "mongodb");
    // Continue anyway - application can still function
  });
  
  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Server listening on port ${port}`, "server");
  });
  
  // Handle ungraceful shutdown
  process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down gracefully', 'server');
    server.close(() => {
      log('Server closed', 'server');
      process.exit(0);
    });
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't crash the server
  });
})();
