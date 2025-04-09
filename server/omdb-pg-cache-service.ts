// omdb-pg-cache-service.ts - سرویس کش OMDb API با استفاده از PostgreSQL

import pg from 'pg';
const { Pool } = pg;
import { NormalizedOMDbContent, omdbService } from './omdb-service';
import dotenv from 'dotenv';

dotenv.config();

class OMDbPGCacheService {
  private pool: any; // Fixed type issue with Pool
  private readonly cacheDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private isConnected: boolean = false;
  private initialized: boolean = false;

  constructor() {
    try {
      console.log('[omdb-pg-cache] Connecting to PostgreSQL...');
      console.log('[omdb-pg-cache] Connection string:', process.env.DATABASE_URL ? 'Available' : 'Not available');
      
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      
      // Test the connection
      this.pool.query('SELECT NOW()', (err, res) => {
        if (err) {
          console.error('[omdb-pg-cache] Error connecting to PostgreSQL:', err);
          this.isConnected = false;
        } else {
          console.log('[omdb-pg-cache] Connected to PostgreSQL successfully');
          this.isConnected = true;
        }
      });
      
      // Initialize the database table when the service is created
      this.init();
    } catch (error) {
      console.error('[omdb-pg-cache] Error initializing PostgreSQL connection:', error);
      this.isConnected = false;
    }
  }

  private async init() {
    try {
      // Create table if it doesn't exist
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS omdb_cache (
          id SERIAL PRIMARY KEY,
          imdb_id TEXT UNIQUE,
          title TEXT,
          data JSONB NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      // Create indexes for better performance
      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS idx_omdb_cache_imdb_id ON omdb_cache (imdb_id);
        CREATE INDEX IF NOT EXISTS idx_omdb_cache_title ON omdb_cache (title);
        CREATE INDEX IF NOT EXISTS idx_omdb_cache_updated_at ON omdb_cache (updated_at);
      `);

      this.isConnected = true;
      this.initialized = true;
      console.log('[omdb-pg-cache] Cache table initialized');
    } catch (error) {
      console.error('[omdb-pg-cache] Error initializing cache table:', error);
      this.isConnected = false;
    }
  }

  /**
   * Get content by IMDb ID - either from cache or from OMDb API
   */
  async getContentByImdbId(imdbId: string): Promise<NormalizedOMDbContent | null> {
    if (!this.isConnected) {
      if (!this.initialized) {
        try {
          await this.init();
        } catch (error) {
          console.log('[omdb-pg-cache] Failed to initialize the cache, fetching directly from OMDb API');
          return omdbService.getContentByImdbId(imdbId);
        }
      }
      
      if (!this.isConnected) {
        console.log('[omdb-pg-cache] Not connected to PostgreSQL, fetching directly from OMDb API');
        return omdbService.getContentByImdbId(imdbId);
      }
    }

    try {
      // Check if we have this content in cache
      const cacheResult = await this.pool.query(
        'SELECT data, updated_at FROM omdb_cache WHERE imdb_id = $1',
        [imdbId]
      );
      
      if (cacheResult.rowCount > 0) {
        const cachedRow = cacheResult.rows[0];
        const cacheAge = Date.now() - new Date(cachedRow.updated_at).getTime();
        
        // If cache is still valid, return the cached data
        if (cacheAge < this.cacheDuration) {
          console.log(`[omdb-pg-cache] Cache hit for IMDb ID: ${imdbId}`);
          return cachedRow.data;
        }
        
        console.log(`[omdb-pg-cache] Cache expired for IMDb ID: ${imdbId}, refreshing`);
      } else {
        console.log(`[omdb-pg-cache] Cache miss for IMDb ID: ${imdbId}`);
      }
      
      // If cache miss or cache expired, fetch from OMDb API
      const content = await omdbService.getContentByImdbId(imdbId);
      
      if (content) {
        // Save to cache
        if (cacheResult.rowCount > 0) {
          // Update existing cache
          await this.pool.query(
            'UPDATE omdb_cache SET data = $1, updated_at = NOW() WHERE imdb_id = $2',
            [content, imdbId]
          );
        } else {
          // Create new cache entry
          await this.pool.query(
            'INSERT INTO omdb_cache (imdb_id, title, data) VALUES ($1, $2, $3)',
            [imdbId, content.title, content]
          );
        }
      }
      
      return content;
    } catch (error) {
      console.error('[omdb-pg-cache] Error accessing cache for IMDb ID:', imdbId, error);
      
      // If there's an error with the cache, try fetching directly
      return omdbService.getContentByImdbId(imdbId);
    }
  }

  /**
   * Search content by title - either from cache or from OMDb API
   */
  async searchByTitle(title: string): Promise<NormalizedOMDbContent | null> {
    if (!this.isConnected) {
      if (!this.initialized) {
        try {
          await this.init();
        } catch (error) {
          console.log('[omdb-pg-cache] Failed to initialize the cache, searching directly from OMDb API');
          return omdbService.searchByTitle(title);
        }
      }
      
      if (!this.isConnected) {
        console.log('[omdb-pg-cache] Not connected to PostgreSQL, searching directly from OMDb API');
        return omdbService.searchByTitle(title);
      }
    }

    try {
      // Check if we have this content in cache by title (case-insensitive search)
      const cacheResult = await this.pool.query(
        'SELECT data, updated_at FROM omdb_cache WHERE LOWER(title) = LOWER($1)',
        [title]
      );
      
      if (cacheResult.rowCount > 0) {
        const cachedRow = cacheResult.rows[0];
        const cacheAge = Date.now() - new Date(cachedRow.updated_at).getTime();
        
        // If cache is still valid, return the cached data
        if (cacheAge < this.cacheDuration) {
          console.log(`[omdb-pg-cache] Cache hit for title: ${title}`);
          return cachedRow.data;
        }
        
        console.log(`[omdb-pg-cache] Cache expired for title: ${title}, refreshing`);
      } else {
        console.log(`[omdb-pg-cache] Cache miss for title: ${title}`);
      }
      
      // If cache miss or cache expired, search from OMDb API
      const content = await omdbService.searchByTitle(title);
      
      if (content) {
        // Save to cache
        if (cacheResult.rowCount > 0) {
          // Update existing cache
          await this.pool.query(
            'UPDATE omdb_cache SET data = $1, updated_at = NOW() WHERE LOWER(title) = LOWER($2)',
            [content, title]
          );
        } else {
          // Create new cache entry
          await this.pool.query(
            'INSERT INTO omdb_cache (imdb_id, title, data) VALUES ($1, $2, $3)',
            [content.imdbID, content.title, content]
          );
        }
      }
      
      return content;
    } catch (error) {
      console.error('[omdb-pg-cache] Error accessing cache for title:', title, error);
      
      // If there's an error with the cache, try searching directly
      return omdbService.searchByTitle(title);
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      const expiryDate = new Date(Date.now() - this.cacheDuration);
      
      const result = await this.pool.query(
        'DELETE FROM omdb_cache WHERE updated_at < $1',
        [expiryDate]
      );
      
      console.log(`[omdb-pg-cache] Cleared ${result.rowCount} expired cache entries`);
    } catch (error) {
      console.error('[omdb-pg-cache] Error clearing expired cache:', error);
    }
  }
  
  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    if (!this.isConnected) {
      return {
        status: 'not connected',
        message: 'Cache service is not connected to PostgreSQL'
      };
    }
    
    try {
      const countResult = await this.pool.query('SELECT COUNT(*) FROM omdb_cache');
      const count = parseInt(countResult.rows[0].count);
      
      const oldestResult = await this.pool.query(
        'SELECT MIN(updated_at) as oldest FROM omdb_cache'
      );
      const oldest = oldestResult.rows[0].oldest;
      
      const newestResult = await this.pool.query(
        'SELECT MAX(updated_at) as newest FROM omdb_cache'
      );
      const newest = newestResult.rows[0].newest;
      
      return {
        status: 'connected',
        count,
        oldest,
        newest,
        cacheDuration: `${this.cacheDuration / (60 * 60 * 1000)} hours`
      };
    } catch (error) {
      console.error('[omdb-pg-cache] Error getting cache stats:', error);
      return {
        status: 'error',
        message: 'Error getting cache statistics'
      };
    }
  }
}

// Create and export a singleton instance
export const omdbPGCacheService = new OMDbPGCacheService();