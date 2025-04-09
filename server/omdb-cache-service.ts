// omdb-cache-service.ts - سرویس کش برای OMDb API

import { MongoClient, Collection } from 'mongodb';
import { NormalizedOMDbContent, omdbService } from './omdb-service';
import dotenv from 'dotenv';

dotenv.config();

// Define the cache document structure
interface OMDbCacheDocument {
  imdbId: string;
  title?: string;
  data: NormalizedOMDbContent;
  createdAt: Date;
  updatedAt: Date;
}

class OMDbCacheService {
  private client: MongoClient;
  private collection: Collection<OMDbCacheDocument> | null = null;
  private readonly cacheDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private dbUrl: string;
  private dbName: string;
  private isConnected: boolean = false;

  constructor() {
    this.dbUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017';
    this.dbName = process.env.MONGODB_DB || 'xraynama';
    this.client = new MongoClient(this.dbUrl);
    
    // Connect to MongoDB when the service is initialized
    this.connect();
  }

  private async connect() {
    try {
      console.log('[omdb-cache] Connecting to MongoDB...');
      await this.client.connect();
      console.log('[omdb-cache] Connected to MongoDB successfully!');
      
      const db = this.client.db(this.dbName);
      this.collection = db.collection<OMDbCacheDocument>('omdb_cache');
      
      // Create indexes
      await this.collection.createIndexes([
        { key: { imdbId: 1 }, name: 'imdbId_index', unique: true },
        { key: { title: 1 }, name: 'title_index' },
        { key: { updatedAt: 1 }, name: 'updatedAt_index' }
      ]);
      
      this.isConnected = true;
    } catch (error) {
      console.error('[omdb-cache] Error connecting to MongoDB:', error);
      this.isConnected = false;
    }
  }

  /**
   * Get content by IMDb ID - either from cache or from OMDb API
   */
  async getContentByImdbId(imdbId: string): Promise<NormalizedOMDbContent | null> {
    if (!this.isConnected || !this.collection) {
      if (!this.isConnected) {
        console.log('[omdb-cache] Not connected to MongoDB, attempting to connect...');
        await this.connect();
      }
      
      if (!this.isConnected) {
        console.log('[omdb-cache] Failed to connect to MongoDB, fetching directly from OMDb API');
        return omdbService.getContentByImdbId(imdbId);
      }
    }

    try {
      // Check if we have this content in cache
      const cachedContent = await this.collection.findOne({ imdbId });
      
      if (cachedContent) {
        const cacheAge = Date.now() - cachedContent.updatedAt.getTime();
        
        // If cache is still valid, return the cached data
        if (cacheAge < this.cacheDuration) {
          console.log(`[omdb-cache] Cache hit for IMDb ID: ${imdbId}`);
          return cachedContent.data;
        }
        
        console.log(`[omdb-cache] Cache expired for IMDb ID: ${imdbId}, refreshing`);
      } else {
        console.log(`[omdb-cache] Cache miss for IMDb ID: ${imdbId}`);
      }
      
      // If cache miss or cache expired, fetch from OMDb API
      const content = await omdbService.getContentByImdbId(imdbId);
      
      if (content) {
        // Save to cache
        const now = new Date();
        
        if (cachedContent) {
          // Update existing cache
          await this.collection.updateOne(
            { imdbId },
            { 
              $set: { 
                data: content,
                updatedAt: now
              } 
            }
          );
        } else {
          // Create new cache entry
          await this.collection.insertOne({
            imdbId,
            title: content.title,
            data: content,
            createdAt: now,
            updatedAt: now
          });
        }
      }
      
      return content;
    } catch (error) {
      console.error('[omdb-cache] Error accessing cache for IMDb ID:', imdbId, error);
      
      // If there's an error with the cache, try fetching directly
      return omdbService.getContentByImdbId(imdbId);
    }
  }

  /**
   * Search content by title - either from cache or from OMDb API
   */
  async searchByTitle(title: string): Promise<NormalizedOMDbContent | null> {
    if (!this.isConnected || !this.collection) {
      if (!this.isConnected) {
        console.log('[omdb-cache] Not connected to MongoDB, attempting to connect...');
        await this.connect();
      }
      
      if (!this.isConnected) {
        console.log('[omdb-cache] Failed to connect to MongoDB, searching directly from OMDb API');
        return omdbService.searchByTitle(title);
      }
    }

    try {
      // Check if we have this content in cache by title
      const cachedContent = await this.collection.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } });
      
      if (cachedContent) {
        const cacheAge = Date.now() - cachedContent.updatedAt.getTime();
        
        // If cache is still valid, return the cached data
        if (cacheAge < this.cacheDuration) {
          console.log(`[omdb-cache] Cache hit for title: ${title}`);
          return cachedContent.data;
        }
        
        console.log(`[omdb-cache] Cache expired for title: ${title}, refreshing`);
      } else {
        console.log(`[omdb-cache] Cache miss for title: ${title}`);
      }
      
      // If cache miss or cache expired, search from OMDb API
      const content = await omdbService.searchByTitle(title);
      
      if (content) {
        // Save to cache
        const now = new Date();
        
        if (cachedContent) {
          // Update existing cache
          await this.collection.updateOne(
            { title: { $regex: new RegExp(`^${title}$`, 'i') } },
            { 
              $set: { 
                data: content,
                updatedAt: now
              } 
            }
          );
        } else {
          // Create new cache entry
          await this.collection.insertOne({
            imdbId: content.imdbID,
            title: content.title,
            data: content,
            createdAt: now,
            updatedAt: now
          });
        }
      }
      
      return content;
    } catch (error) {
      console.error('[omdb-cache] Error accessing cache for title:', title, error);
      
      // If there's an error with the cache, try searching directly
      return omdbService.searchByTitle(title);
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(): Promise<void> {
    if (!this.isConnected || !this.collection) return;
    
    try {
      const expiryDate = new Date(Date.now() - this.cacheDuration);
      
      const result = await this.collection.deleteMany({
        updatedAt: { $lt: expiryDate }
      });
      
      console.log(`[omdb-cache] Cleared ${result.deletedCount} expired cache entries`);
    } catch (error) {
      console.error('[omdb-cache] Error clearing expired cache:', error);
    }
  }
}

// Create and export a singleton instance
export const omdbCacheService = new OMDbCacheService();