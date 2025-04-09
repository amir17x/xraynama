import { MongoClient, Collection, Document } from 'mongodb';
import axios from 'axios';

/**
 * سرویس کش TMDB برای ذخیره و بازیابی داده‌های API
 */
export class TMDBCacheService {
  private client: MongoClient;
  private dbName: string = 'tmdb_cache_db';
  private collectionName: string = 'tmdb_cache';
  private collection: Collection | null = null;
  private connected: boolean = false;
  private connecting: boolean = false;
  private connectionPromise: Promise<void> | null = null;
  
  /**
   * مدت زمان اعتبار کش به ساعت
   * پس از این مدت، داده‌ها از TMDB دوباره دریافت می‌شوند
   */
  private cacheTTLHours: number = 24;
  
  constructor() {
    // استفاده از URI مانگو که در محیط تنظیم شده
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    this.client = new MongoClient(uri);
  }
  
  /**
   * اتصال به پایگاه داده MongoDB
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }
    
    if (this.connecting) {
      // اگر در حال اتصال هستیم، منتظر بمان
      if (this.connectionPromise) {
        return this.connectionPromise;
      }
    }
    
    // شروع اتصال
    this.connecting = true;
    
    try {
      this.connectionPromise = new Promise(async (resolve, reject) => {
        try {
          console.log('[tmdb-cache] Connecting to MongoDB...');
          await this.client.connect();
          console.log('[tmdb-cache] Connected to MongoDB successfully!');
          
          const db = this.client.db(this.dbName);
          this.collection = db.collection(this.collectionName);
          
          // ایجاد ایندکس برای بهبود کارایی جستجو
          if (this.collection) {
            await this.collection.createIndex({ key: 1 }, { unique: true });
            await this.collection.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });
          }
          
          this.connected = true;
          resolve();
        } catch (error) {
          console.error('[tmdb-cache] Error connecting to MongoDB:', error);
          this.connected = false;
          reject(error);
        } finally {
          this.connecting = false;
          this.connectionPromise = null;
        }
      });
      
      return this.connectionPromise;
    } catch (error) {
      console.error('[tmdb-cache] Connection error:', error);
      this.connecting = false;
      this.connectionPromise = null;
      throw error;
    }
  }
  
  /**
   * بستن اتصال پایگاه داده
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.connected = false;
    }
  }
  
  /**
   * ساخت کلید یکتا برای ذخیره در کش
   * @param endpoint مسیر API
   * @param params پارامترهای درخواست 
   * @returns کلید یکتا
   */
  private createCacheKey(endpoint: string, params: Record<string, any>): string {
    // ترکیب مسیر و پارامترها به عنوان کلید کش
    const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
    return `${endpoint}?${sortedParams}`;
  }
  
  /**
   * دریافت داده از کش یا TMDB API
   * @param endpoint مسیر API در TMDB
   * @param params پارامترهای درخواست
   * @param forceRefresh آیا داده‌ها باید از TMDB بازیابی شوند حتی اگر در کش موجود باشند
   * @returns داده‌های درخواستی
   */
  async getOrFetch(
    endpoint: string, 
    params: Record<string, any>,
    apiKey: string,
    accessToken: string,
    forceRefresh: boolean = false
  ): Promise<any> {
    try {
      // اتصال به پایگاه داده اگر متصل نیستیم
      if (!this.connected) {
        await this.connect();
      }
      
      // کلید کش برای این درخواست
      const cacheKey = this.createCacheKey(endpoint, params);
      
      // بررسی کش اگر بازیابی اجباری نباشد
      if (!forceRefresh && this.collection) {
        const cachedData = await this.collection.findOne({
          key: cacheKey,
          expires_at: { $gt: new Date() } // بررسی اعتبار کش
        });
        
        if (cachedData) {
          console.log(`[tmdb-cache] Cache hit for ${endpoint}`);
          return cachedData.data;
        }
      }
      
      // اگر داده در کش نباشد یا منقضی شده باشد، از API دریافت کن
      console.log(`[tmdb-cache] Cache miss for ${endpoint}, fetching from TMDB...`);
      
      const response = await axios.get(`https://api.themoviedb.org/3${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          ...params,
          api_key: apiKey
        }
      });
      
      const data = response.data;
      
      // ذخیره داده در کش
      if (this.collection) {
        // محاسبه زمان انقضا
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + this.cacheTTLHours);
        
        await this.collection.updateOne(
          { key: cacheKey },
          {
            $set: {
              key: cacheKey,
              data: data,
              timestamp: new Date(),
              created_at: new Date(),
              expires_at: expiresAt
            }
          },
          { upsert: true } // ایجاد یا به‌روزرسانی
        );
        
        console.log(`[tmdb-cache] Data cached for ${endpoint}`);
      }
      
      return data;
    } catch (error) {
      console.error(`[tmdb-cache] Error fetching data for ${endpoint}:`, error);
      
      // در صورت خطا، تلاش برای بازیابی هر داده موجود در کش بدون در نظر گرفتن زمان انقضا
      if (this.collection) {
        const cacheKey = this.createCacheKey(endpoint, params);
        const cachedData = await this.collection.findOne({ key: cacheKey });
        
        if (cachedData) {
          console.log(`[tmdb-cache] Returning expired cached data for ${endpoint} due to API error`);
          return cachedData.data;
        }
      }
      
      // اگر هیچ داده‌ای در کش نباشد، خطا را پرتاب کن
      throw error;
    }
  }
  
  /**
   * پاکسازی کش
   * @param endpoint مسیر API برای پاکسازی (اختیاری)
   */
  async clearCache(endpoint?: string): Promise<void> {
    try {
      if (!this.connected) {
        await this.connect();
      }
      
      if (this.collection) {
        if (endpoint) {
          // پاکسازی کش برای یک endpoint خاص
          const keyPattern = new RegExp(`^${endpoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
          await this.collection.deleteMany({ key: { $regex: keyPattern } });
          console.log(`[tmdb-cache] Cache cleared for ${endpoint}`);
        } else {
          // پاکسازی کل کش
          await this.collection.deleteMany({});
          console.log('[tmdb-cache] All cache cleared');
        }
      }
    } catch (error) {
      console.error('[tmdb-cache] Error clearing cache:', error);
      throw error;
    }
  }
  
  /**
   * تنظیم مدت زمان اعتبار کش
   * @param hours تعداد ساعت
   */
  setCacheTTL(hours: number): void {
    if (hours > 0) {
      this.cacheTTLHours = hours;
      console.log(`[tmdb-cache] Cache TTL set to ${hours} hours`);
    } else {
      console.error('[tmdb-cache] Invalid TTL value. Must be greater than 0.');
    }
  }
  
  /**
   * دریافت وضعیت کش
   * @returns اطلاعات آماری کش
   */
  async getCacheStats(): Promise<any> {
    try {
      if (!this.connected) {
        await this.connect();
      }
      
      if (this.collection) {
        const now = new Date();
        const totalCount = await this.collection.countDocuments();
        const validCount = await this.collection.countDocuments({ expires_at: { $gt: now } });
        const expiredCount = totalCount - validCount;
        
        // به‌جای استفاده از stats که در نسخه‌های جدید MongoDB متفاوت است، 
        // از روش ساده‌تری برای تخمین اندازه استفاده می‌کنیم
        let storageSizeKB = 0;
        
        // نمونه‌گیری برای تخمین اندازه متوسط هر سند
        const sampleSize = Math.min(10, totalCount);
        if (sampleSize > 0) {
          const samples = await this.collection.find({}).limit(sampleSize).toArray();
          let totalSizeBytes = 0;
          for (const sample of samples) {
            // تخمین اندازه با تبدیل به JSON و بررسی طول رشته
            totalSizeBytes += JSON.stringify(sample).length;
          }
          const avgSizeBytes = totalSizeBytes / sampleSize;
          storageSizeKB = Math.round((avgSizeBytes * totalCount) / 1024);
        }
        
        // گرفتن توزیع نوع داده‌ها در کش برای استخراج آمار به تفکیک endpoint
        // از پردازش ساده‌تری استفاده می‌کنیم که با نسخه‌های مختلف MongoDB سازگار باشد
        const pipeline = [
          { 
            $group: { 
              _id: { 
                $regexFind: { 
                  input: "$key", 
                  regex: "^([^?]+)" 
                }
              },
              count: { $sum: 1 }
            } 
          },
          {
            $project: {
              endpoint: { $ifNull: [{ $arrayElemAt: ["$_id.captures", 0] }, "unknown"] },
              count: 1,
              _id: 0
            }
          },
          { $sort: { count: -1 } }
        ];
        
        const endpointStats = await this.collection.aggregate(pipeline).toArray();
        
        // آمار مربوط به زمان ایجاد و انقضا
        const oldestCache = await this.collection.find({}).sort({ created_at: 1 }).limit(1).toArray();
        const newestCache = await this.collection.find({}).sort({ created_at: -1 }).limit(1).toArray();
        const soonestExpiry = await this.collection.find({ expires_at: { $gt: now } })
                                                  .sort({ expires_at: 1 }).limit(1).toArray();

        // محاسبه درصد کش‌های معتبر
        const validPercentage = totalCount > 0 ? Math.round((validCount / totalCount) * 100) : 0;
        
        return {
          summary: {
            total: totalCount,
            valid: validCount,
            expired: expiredCount,
            validPercentage: validPercentage,
            ttlHours: this.cacheTTLHours,
            storageSizeKB: storageSizeKB,
            databaseName: this.dbName,
            collectionName: this.collectionName
          },
          timestamps: {
            serverTime: now,
            oldestCacheCreated: oldestCache.length > 0 ? oldestCache[0].created_at : null,
            newestCacheCreated: newestCache.length > 0 ? newestCache[0].created_at : null,
            nextExpiry: soonestExpiry.length > 0 ? soonestExpiry[0].expires_at : null
          },
          endpointDistribution: endpointStats
        };
      }
      
      return { error: 'Collection not available' };
    } catch (error) {
      console.error('[tmdb-cache] Error getting cache stats:', error);
      return { error: String(error) };
    }
  }
}

// ایجاد نمونه واحد از سرویس
export const tmdbCacheService = new TMDBCacheService();