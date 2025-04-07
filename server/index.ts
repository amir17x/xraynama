import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { MongoDBStorage } from "./db/mongodb-storage";
import { storage } from "./storage";

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

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Connect to MongoDB if available
  if (useMongoDb && mongoDBStorage) {
    try {
      await mongoDBStorage.init();
      log("Connected to MongoDB successfully", "mongodb");
    } catch (error) {
      log(`Failed to connect to MongoDB: ${error}`, "mongodb");
      process.exit(1);
    }
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
