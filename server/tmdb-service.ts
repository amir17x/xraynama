import axios from 'axios';
import { Content, Genre, Tag, User } from '@shared/schema';
import { tmdbCacheService } from './tmdb-cache-service';

// سیستم توصیه محتوا با استفاده از API TMDB
export class TMDBService {
  private apiKey: string;
  private accessToken: string;
  private baseUrl: string = 'https://api.themoviedb.org/3';
  private defaultLanguage: string = 'fa-IR'; // زبان پیش‌فرض: فارسی ایران
  private useCache: boolean = true; // استفاده از کش برای کاهش تعداد درخواست‌ها
  
  // کدهای زبان پشتیبانی شده بر اساس استاندارد ISO 639-1 + ISO 3166-1
  private supportedLanguages: Record<string, string> = {
    'fa-IR': 'فارسی (ایران)',
    'en-US': 'English (US)',
    'ar-SA': 'العربية (السعودية)',
    'fr-FR': 'Français (France)',
    'de-DE': 'Deutsch (Deutschland)',
    'es-ES': 'Español (España)',
    'ru-RU': 'Русский (Россия)',
    'zh-CN': '中文 (中国)',
    'ja-JP': '日本語 (日本)',
    'tr-TR': 'Türkçe (Türkiye)',
  };

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || '';
    this.accessToken = process.env.TMDB_ACCESS_TOKEN || '';
  }
  
  /**
   * بررسی و تنظیم پارامتر زبان
   * @param language کد زبان (مثال: fa-IR، en-US)
   * @returns کد زبان معتبر
   */
  validateLanguage(language?: string): string {
    // اگر زبان تعیین نشده بود، از زبان پیش‌فرض استفاده کن
    if (!language) {
      return this.defaultLanguage;
    }
    
    // بررسی کن که زبان در لیست زبان‌های پشتیبانی شده باشد
    if (Object.keys(this.supportedLanguages).includes(language)) {
      return language;
    }
    
    // اگر فقط کد زبان بدون کد کشور داده شده بود (مثلاً 'fa')
    const langCode = language.split('-')[0].toLowerCase();
    const matchedLang = Object.keys(this.supportedLanguages).find(key => 
      key.toLowerCase().startsWith(langCode + '-')
    );
    
    if (matchedLang) {
      return matchedLang;
    }
    
    // در غیر این صورت به زبان پیش‌فرض برگرد
    return this.defaultLanguage;
  }
  
  /**
   * دریافت لیست زبان‌های پشتیبانی شده
   * @returns لیست زبان‌های پشتیبانی شده
   */
  getSupportedLanguages() {
    return Object.keys(this.supportedLanguages).map(code => ({
      code,
      name: this.supportedLanguages[code]
    }));
  }

  // متد getPopularMovies حذف شده است - بخش محبوب‌ترین فیلم‌ها در جهان دیگر استفاده نمی‌شود
  
  /**
   * جستجوی فیلم‌ها بر اساس متن
   * @param query متن جستجو
   * @param page شماره صفحه
   * @param language کد زبان (مثال: fa-IR، en-US)
   * @returns نتایج جستجو
   */
  async searchMovies(query: string, page: number = 1, language?: string) {
    try {
      if (!this.apiKey || !this.accessToken) {
        throw new Error("TMDB API key or access token is not available");
      }

      // تنظیم کد زبان معتبر
      const validatedLanguage = this.validateLanguage(language);
      
      console.log(`[TMDB] Searching movies with query: "${query}", page ${page}, language ${validatedLanguage}`);

      let response;
      
      // استفاده از کش برای بهبود عملکرد و کاهش درخواست‌ها به API خارجی
      if (this.useCache) {
        try {
          const params = {
            language: validatedLanguage,
            query,
            page,
            include_adult: false
          };
          
          // دریافت اطلاعات از کش یا TMDB API
          const data = await tmdbCacheService.getOrFetch(
            `/search/movie`,
            params,
            this.apiKey,
            this.accessToken
          );
          
          response = { data };
        } catch (cacheError) {
          console.error(`[TMDB] Cache error for search query "${query}", falling back to direct API call:`, cacheError);
          
          // در صورت خطا در کش، مستقیم از TMDB درخواست کن
          response = await axios.get(`${this.baseUrl}/search/movie`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              api_key: this.apiKey,
              language: validatedLanguage,
              query,
              page,
              include_adult: false
            }
          });
        }
      } else {
        // حالت بدون کش
        response = await axios.get(`${this.baseUrl}/search/movie`, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            api_key: this.apiKey,
            language: validatedLanguage,
            query,
            page,
            include_adult: false
          }
        });
      }

      if (response.data && response.data.results) {
        // پردازش و بهبود نتایج
        const movies = response.data.results.map((movie: any) => {
          return {
            id: movie.id,
            title: movie.title,
            original_title: movie.original_title,
            poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
            overview: movie.overview,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            popularity: movie.popularity,
            genre_ids: movie.genre_ids
          };
        });
        
        console.log(`[TMDB] Search found ${movies.length} results for query "${query}"`);
        
        return {
          page: response.data.page,
          total_pages: response.data.total_pages,
          total_results: response.data.total_results,
          results: movies
        };
      }

      return {
        page: 1,
        total_pages: 0,
        total_results: 0,
        results: []
      };
    } catch (error) {
      console.error(`Error searching movies from TMDB with query "${query}":`, error);
      throw error;
    }
  }

  /**
   * دریافت فیلم‌ها با استفاده از discover API (با فیلترهای پیشرفته)
   * @param options گزینه‌های فیلتر
   * @param page شماره صفحه
   * @param language کد زبان (مثال: fa-IR، en-US)
   * @returns نتایج فیلتر شده
   */
  async discoverMovies(options: {
    sort_by?: string;
    primary_release_year?: number;
    with_genres?: string | number[];
    with_people?: string | number[];
    with_keywords?: string | number[];
    vote_average_gte?: number;
    vote_average_lte?: number;
    with_runtime_gte?: number;
    with_runtime_lte?: number;
  }, page: number = 1, language?: string) {
    try {
      if (!this.apiKey || !this.accessToken) {
        throw new Error("TMDB API key or access token is not available");
      }

      // تنظیم کد زبان معتبر
      const validatedLanguage = this.validateLanguage(language);
      
      console.log(`[TMDB] Discovering movies with filters, page ${page}, language ${validatedLanguage}`);

      // تبدیل آرایه‌ها به رشته با جداکننده کاما
      const prepareParams = () => {
        const params: any = {
          language: validatedLanguage,
          page,
          include_adult: false,
          ...options
        };
  
        // تبدیل آرایه‌ها به رشته
        if (Array.isArray(params.with_genres)) {
          params.with_genres = params.with_genres.join(',');
        }
        if (Array.isArray(params.with_people)) {
          params.with_people = params.with_people.join(',');
        }
        if (Array.isArray(params.with_keywords)) {
          params.with_keywords = params.with_keywords.join(',');
        }
        
        return params;
      };
      
      let response;
      
      // استفاده از کش برای بهبود عملکرد و کاهش درخواست‌ها به API خارجی
      if (this.useCache) {
        try {
          const params = prepareParams();
          
          // دریافت اطلاعات از کش یا TMDB API
          const data = await tmdbCacheService.getOrFetch(
            `/discover/movie`,
            params,
            this.apiKey,
            this.accessToken
          );
          
          response = { data };
        } catch (cacheError) {
          console.error(`[TMDB] Cache error for discover movies, falling back to direct API call:`, cacheError);
          
          // در صورت خطا در کش، مستقیم از TMDB درخواست کن
          const params = prepareParams();
          params.api_key = this.apiKey;
          
          response = await axios.get(`${this.baseUrl}/discover/movie`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            params
          });
        }
      } else {
        // حالت بدون کش
        const params = prepareParams();
        params.api_key = this.apiKey;
        
        response = await axios.get(`${this.baseUrl}/discover/movie`, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          params
        });
      }

      if (response.data && response.data.results) {
        // پردازش و بهبود نتایج
        const movies = response.data.results.map((movie: any) => {
          return {
            id: movie.id,
            title: movie.title,
            original_title: movie.original_title,
            poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
            overview: movie.overview,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            popularity: movie.popularity,
            genre_ids: movie.genre_ids
          };
        });
        
        console.log(`[TMDB] Discover found ${movies.length} movies matching the filters`);
        
        return {
          page: response.data.page,
          total_pages: response.data.total_pages,
          total_results: response.data.total_results,
          results: movies
        };
      }

      return {
        page: 1,
        total_pages: 0,
        total_results: 0,
        results: []
      };
    } catch (error) {
      console.error("Error discovering movies from TMDB:", error);
      throw error;
    }
  }

  /**
   * جستجوی جامع با استفاده از هر سه روش جستجو
   * @param query متن جستجو
   * @param filters فیلترهای اضافی برای discover
   * @param externalId شناسه خارجی (اختیاری)
   * @param externalSource منبع شناسه (اختیاری)
   * @param page شماره صفحه
   * @param language کد زبان (مثال: fa-IR، en-US)
   * @returns نتایج جستجو از هر سه روش
   */
  async searchAllContent(
    query: string, 
    filters: Record<string, any> = {}, 
    externalId?: string, 
    externalSource?: string, 
    page: number = 1,
    language?: string
  ) {
    // تنظیم کد زبان معتبر
    const validatedLanguage = this.validateLanguage(language);
    
    const results: any = {
      text_search: null,
      discover: null,
      external_id: null,
      language: validatedLanguage
    };
    
    // جستجوی متنی
    if (query && query.length > 0) {
      try {
        results.text_search = await this.searchMovies(query, page, validatedLanguage);
      } catch (error) {
        console.error(`Error in text search for "${query}":`, error);
        results.text_search = { error: "جستجوی متنی با خطا مواجه شد" };
      }
    }
    
    // جستجو با فیلتر (discover)
    if (Object.keys(filters).length > 0) {
      try {
        results.discover = await this.discoverMovies(filters, page, validatedLanguage);
      } catch (error) {
        console.error("Error in discover search:", error);
        results.discover = { error: "جستجو با فیلتر با خطا مواجه شد" };
      }
    }
    
    // جستجو با شناسه خارجی
    if (externalId && externalSource) {
      try {
        results.external_id = await this.findByExternalId(externalId, externalSource, validatedLanguage);
      } catch (error) {
        console.error(`Error in external ID search for ${externalId}:`, error);
        results.external_id = { error: "جستجو با شناسه خارجی با خطا مواجه شد" };
      }
    }
    
    return results;
  }

  /**
   * جستجوی محتوا با استفاده از شناسه‌های خارجی
   * @param externalId شناسه خارجی
   * @param externalSource منبع شناسه (imdb_id, tvdb_id, facebook_id, twitter_id, instagram_id)
   * @param language کد زبان (مثال: fa-IR، en-US)
   * @returns نتایج یافته شده
   */
  async findByExternalId(externalId: string, externalSource: string, language?: string) {
    try {
      if (!this.apiKey || !this.accessToken) {
        throw new Error("TMDB API key or access token is not available");
      }

      // تنظیم کد زبان معتبر
      const validatedLanguage = this.validateLanguage(language);
      
      console.log(`[TMDB] Finding content with external ID: ${externalId} (source: ${externalSource}, language: ${validatedLanguage})`);
      
      let response;
      
      // استفاده از کش برای بهبود عملکرد و کاهش درخواست‌ها به API خارجی
      if (this.useCache) {
        try {
          const params = {
            language: validatedLanguage,
            external_source: externalSource
          };
          
          // دریافت اطلاعات از کش یا TMDB API
          const data = await tmdbCacheService.getOrFetch(
            `/find/${externalId}`,
            params,
            this.apiKey,
            this.accessToken
          );
          
          response = { data };
        } catch (cacheError) {
          console.error(`[TMDB] Cache error for external ID ${externalId}, falling back to direct API call:`, cacheError);
          
          // در صورت خطا در کش، مستقیم از TMDB درخواست کن
          response = await axios.get(`${this.baseUrl}/find/${externalId}`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              api_key: this.apiKey,
              language: validatedLanguage,
              external_source: externalSource
            }
          });
        }
      } else {
        // حالت بدون کش
        response = await axios.get(`${this.baseUrl}/find/${externalId}`, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            api_key: this.apiKey,
            language: validatedLanguage,
            external_source: externalSource
          }
        });
      }

      if (response.data) {
        console.log(`[TMDB] Find results for external ID ${externalId}: ` +
          `${response.data.movie_results?.length || 0} movies, ` +
          `${response.data.tv_results?.length || 0} TV shows, ` +
          `${response.data.person_results?.length || 0} people`);
        
        // پردازش نتایج فیلم‌ها
        if (response.data.movie_results) {
          response.data.movie_results = response.data.movie_results.map((movie: any) => ({
            ...movie,
            poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null
          }));
        }
        
        // پردازش نتایج سریال‌ها
        if (response.data.tv_results) {
          response.data.tv_results = response.data.tv_results.map((tv: any) => ({
            ...tv,
            poster_path: tv.poster_path ? `https://image.tmdb.org/t/p/w500${tv.poster_path}` : null,
            backdrop_path: tv.backdrop_path ? `https://image.tmdb.org/t/p/original${tv.backdrop_path}` : null
          }));
        }
        
        // پردازش نتایج افراد
        if (response.data.person_results) {
          response.data.person_results = response.data.person_results.map((person: any) => ({
            ...person,
            profile_path: person.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : null
          }));
        }
        
        return response.data;
      }

      return {
        movie_results: [],
        tv_results: [],
        person_results: [],
        tv_episode_results: [],
        tv_season_results: []
      };
    } catch (error) {
      console.error(`Error finding content by external ID ${externalId}:`, error);
      throw error;
    }
  }

  /**
   * دریافت جزئیات فیلم با استفاده از append_to_response برای گرفتن اطلاعات بیشتر در یک درخواست
   * @param movieId شناسه فیلم در TMDB
   * @param language کد زبان (مثال: fa-IR، en-US)
   * @returns جزئیات فیلم به همراه اطلاعات تکمیلی
   */
  /**
   * جستجوی چند منظوره محتوا (فیلم، سریال، افراد)
   * @param query متن جستجو
   * @param language کد زبان
   * @param page شماره صفحه
   * @returns نتایج جستجو
   */
  async searchMulti(query: string, language?: string, page: number = 1) {
    try {
      if (!this.apiKey || !this.accessToken) {
        throw new Error("TMDB API key or access token is not available");
      }

      // تنظیم کد زبان معتبر
      const validatedLanguage = this.validateLanguage(language);
      
      console.log(`[TMDB] Multi search for query: "${query}", language ${validatedLanguage}, page ${page}`);

      let response;
      
      // استفاده از کش برای بهبود عملکرد و کاهش درخواست‌ها به API خارجی
      if (this.useCache) {
        try {
          const params = {
            language: validatedLanguage,
            query,
            page,
            include_adult: false
          };
          
          // دریافت اطلاعات از کش یا TMDB API
          const data = await tmdbCacheService.getOrFetch(
            `/search/multi`,
            params,
            this.apiKey,
            this.accessToken
          );
          
          response = { data };
        } catch (cacheError) {
          console.error(`[TMDB] Cache error for multi search "${query}", falling back to direct API call:`, cacheError);
          
          // در صورت خطا در کش، مستقیم از TMDB درخواست کن
          response = await axios.get(`${this.baseUrl}/search/multi`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              api_key: this.apiKey,
              language: validatedLanguage,
              query,
              page,
              include_adult: false
            }
          });
        }
      } else {
        // حالت بدون کش
        response = await axios.get(`${this.baseUrl}/search/multi`, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            api_key: this.apiKey,
            language: validatedLanguage,
            query,
            page,
            include_adult: false
          }
        });
      }

      console.log(`[TMDB] Multi search found ${response.data?.results?.length || 0} results for query "${query}"`);
      return response.data;
    } catch (error) {
      console.error(`Error in multi search for "${query}":`, error);
      throw error;
    }
  }
  
  /**
   * دریافت کردیت‌های فیلم (بازیگران و تیم تولید)
   * @param movieId شناسه فیلم
   * @param language کد زبان
   * @returns کردیت‌های فیلم
   */
  async getMovieCredits(movieId: number, language?: string) {
    try {
      if (!this.apiKey || !this.accessToken) {
        throw new Error("TMDB API key or access token is not available");
      }

      // تنظیم کد زبان معتبر
      const validatedLanguage = this.validateLanguage(language);
      
      console.log(`[TMDB] Fetching credits for movie ID ${movieId}, language ${validatedLanguage}`);
      
      let response;
      
      // استفاده از کش برای بهبود عملکرد و کاهش درخواست‌ها به API خارجی
      if (this.useCache) {
        try {
          const params = {
            language: validatedLanguage
          };
          
          // دریافت اطلاعات از کش یا TMDB API
          const data = await tmdbCacheService.getOrFetch(
            `/movie/${movieId}/credits`,
            params,
            this.apiKey,
            this.accessToken
          );
          
          response = { data };
        } catch (cacheError) {
          console.error(`[TMDB] Cache error for movie credits ${movieId}, falling back to direct API call:`, cacheError);
          
          // در صورت خطا در کش، مستقیم از TMDB درخواست کن
          response = await axios.get(`${this.baseUrl}/movie/${movieId}/credits`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              api_key: this.apiKey,
              language: validatedLanguage
            }
          });
        }
      } else {
        // حالت بدون کش
        response = await axios.get(`${this.baseUrl}/movie/${movieId}/credits`, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            api_key: this.apiKey,
            language: validatedLanguage
          }
        });
      }

      console.log(`[TMDB] Successfully fetched credits for movie ID ${movieId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching credits for movie ${movieId}:`, error);
      throw error;
    }
  }
  
  /**
   * دریافت اطلاعات کامل سریال تلویزیونی
   * @param tvId شناسه سریال
   * @param language کد زبان
   * @returns اطلاعات کامل سریال
   */
  async getTVSeriesDetails(tvId: number, language?: string) {
    try {
      if (!this.apiKey || !this.accessToken) {
        throw new Error("TMDB API key or access token is not available");
      }

      // تنظیم کد زبان معتبر
      const validatedLanguage = this.validateLanguage(language);
      
      console.log(`[TMDB] Fetching details for TV series ID ${tvId}, language ${validatedLanguage}`);
      
      let response;
      
      // استفاده از کش برای بهبود عملکرد و کاهش درخواست‌ها به API خارجی
      if (this.useCache) {
        try {
          const params = {
            language: validatedLanguage,
            append_to_response: 'videos,images,credits,similar,recommendations,external_ids,content_ratings'
          };
          
          // دریافت اطلاعات از کش یا TMDB API
          const data = await tmdbCacheService.getOrFetch(
            `/tv/${tvId}`,
            params,
            this.apiKey,
            this.accessToken
          );
          
          response = { data };
        } catch (cacheError) {
          console.error(`[TMDB] Cache error for TV series ${tvId}, falling back to direct API call:`, cacheError);
          
          // در صورت خطا در کش، مستقیم از TMDB درخواست کن
          response = await axios.get(`${this.baseUrl}/tv/${tvId}`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              api_key: this.apiKey,
              language: validatedLanguage,
              append_to_response: 'videos,images,credits,similar,recommendations,external_ids,content_ratings'
            }
          });
        }
      } else {
        // حالت بدون کش
        response = await axios.get(`${this.baseUrl}/tv/${tvId}`, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            api_key: this.apiKey,
            language: validatedLanguage,
            append_to_response: 'videos,images,credits,similar,recommendations,external_ids,content_ratings'
          }
        });
      }

      console.log(`[TMDB] Successfully fetched details for TV series ID ${tvId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching TV series details for ${tvId}:`, error);
      throw error;
    }
  }
  
  /**
   * دریافت کردیت‌های سریال تلویزیونی (بازیگران و تیم تولید)
   * @param tvId شناسه سریال
   * @param language کد زبان
   * @returns کردیت‌های سریال
   */
  async getTVSeriesCredits(tvId: number, language?: string) {
    try {
      if (!this.apiKey || !this.accessToken) {
        throw new Error("TMDB API key or access token is not available");
      }

      // تنظیم کد زبان معتبر
      const validatedLanguage = this.validateLanguage(language);
      
      console.log(`[TMDB] Fetching credits for TV series ID ${tvId}, language ${validatedLanguage}`);
      
      let response;
      
      // استفاده از کش برای بهبود عملکرد و کاهش درخواست‌ها به API خارجی
      if (this.useCache) {
        try {
          const params = {
            language: validatedLanguage
          };
          
          // دریافت اطلاعات از کش یا TMDB API
          const data = await tmdbCacheService.getOrFetch(
            `/tv/${tvId}/credits`,
            params,
            this.apiKey,
            this.accessToken
          );
          
          response = { data };
        } catch (cacheError) {
          console.error(`[TMDB] Cache error for TV series credits ${tvId}, falling back to direct API call:`, cacheError);
          
          // در صورت خطا در کش، مستقیم از TMDB درخواست کن
          response = await axios.get(`${this.baseUrl}/tv/${tvId}/credits`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              api_key: this.apiKey,
              language: validatedLanguage
            }
          });
        }
      } else {
        // حالت بدون کش
        response = await axios.get(`${this.baseUrl}/tv/${tvId}/credits`, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            api_key: this.apiKey,
            language: validatedLanguage
          }
        });
      }

      console.log(`[TMDB] Successfully fetched credits for TV series ID ${tvId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching TV series credits for ${tvId}:`, error);
      throw error;
    }
  }
  
  /**
   * دریافت شناسه‌های خارجی سریال تلویزیونی (IMDb، TVDb و غیره)
   * @param tvId شناسه سریال
   * @param language کد زبان
   * @returns شناسه‌های خارجی سریال
   */
  async getTVSeriesExternalIds(tvId: number, language?: string) {
    try {
      if (!this.apiKey || !this.accessToken) {
        throw new Error("TMDB API key or access token is not available");
      }

      // تنظیم کد زبان معتبر
      const validatedLanguage = this.validateLanguage(language);
      
      console.log(`[TMDB] Fetching external IDs for TV series ID ${tvId}, language ${validatedLanguage}`);
      
      let response;
      
      // استفاده از کش برای بهبود عملکرد و کاهش درخواست‌ها به API خارجی
      if (this.useCache) {
        try {
          const params = {
            language: validatedLanguage
          };
          
          // دریافت اطلاعات از کش یا TMDB API
          const data = await tmdbCacheService.getOrFetch(
            `/tv/${tvId}/external_ids`,
            params,
            this.apiKey,
            this.accessToken
          );
          
          response = { data };
        } catch (cacheError) {
          console.error(`[TMDB] Cache error for TV series external IDs ${tvId}, falling back to direct API call:`, cacheError);
          
          // در صورت خطا در کش، مستقیم از TMDB درخواست کن
          response = await axios.get(`${this.baseUrl}/tv/${tvId}/external_ids`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              api_key: this.apiKey,
              language: validatedLanguage
            }
          });
        }
      } else {
        // حالت بدون کش
        response = await axios.get(`${this.baseUrl}/tv/${tvId}/external_ids`, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            api_key: this.apiKey,
            language: validatedLanguage
          }
        });
      }

      console.log(`[TMDB] Successfully fetched external IDs for TV series ID ${tvId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching TV series external IDs for ${tvId}:`, error);
      throw error;
    }
  }
  
  /**
   * دریافت اطلاعات کامل فیلم
   * @param movieId شناسه فیلم
   * @param language کد زبان
   * @returns اطلاعات کامل فیلم
   */
  async getMovieDetails(movieId: number, language?: string) {
    try {
      if (!this.apiKey || !this.accessToken) {
        throw new Error("TMDB API key or access token is not available");
      }

      // تنظیم کد زبان معتبر
      const validatedLanguage = this.validateLanguage(language);
      
      console.log(`[TMDB] Fetching details for movie ID ${movieId}, language ${validatedLanguage}`);
      
      let response;
      
      // استفاده از کش برای بهبود عملکرد و کاهش درخواست‌ها به API خارجی
      if (this.useCache) {
        try {
          const params = {
            language: validatedLanguage,
            append_to_response: 'videos,images,credits,similar,recommendations'
          };
          
          // دریافت اطلاعات از کش یا TMDB API
          const data = await tmdbCacheService.getOrFetch(
            `/movie/${movieId}`,
            params,
            this.apiKey,
            this.accessToken
          );
          
          response = { data };
        } catch (cacheError) {
          console.error(`[TMDB] Cache error for movie ${movieId}, falling back to direct API call:`, cacheError);
          
          // در صورت خطا در کش، مستقیم از TMDB درخواست کن
          response = await axios.get(`${this.baseUrl}/movie/${movieId}`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              api_key: this.apiKey,
              language: validatedLanguage,
              append_to_response: 'videos,images,credits,similar,recommendations'
            }
          });
        }
      } else {
        // حالت بدون کش
        response = await axios.get(`${this.baseUrl}/movie/${movieId}`, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            api_key: this.apiKey,
            language: validatedLanguage,
            append_to_response: 'videos,images,credits,similar,recommendations'
          }
        });
      }

      if (response.data) {
        // پردازش و بهبود نتایج
        const movie = response.data;
        
        const processedMovie = {
          id: movie.id,
          title: movie.title,
          original_title: movie.original_title,
          tagline: movie.tagline,
          overview: movie.overview,
          release_date: movie.release_date,
          runtime: movie.runtime,
          status: movie.status,
          vote_average: movie.vote_average,
          vote_count: movie.vote_count,
          popularity: movie.popularity,
          budget: movie.budget,
          revenue: movie.revenue,
          genres: movie.genres,
          production_companies: movie.production_companies,
          production_countries: movie.production_countries,
          spoken_languages: movie.spoken_languages,
          poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
          backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
          
          // اطلاعات تکمیلی که با append_to_response گرفته شده‌اند
          videos: movie.videos?.results || [],
          images: {
            backdrops: movie.images?.backdrops?.map((img: any) => ({
              ...img,
              file_path: img.file_path ? `https://image.tmdb.org/t/p/original${img.file_path}` : null
            })) || [],
            posters: movie.images?.posters?.map((img: any) => ({
              ...img,
              file_path: img.file_path ? `https://image.tmdb.org/t/p/w500${img.file_path}` : null
            })) || []
          },
          credits: {
            cast: movie.credits?.cast || [],
            crew: movie.credits?.crew || []
          },
          similar: movie.similar?.results?.map((similar: any) => ({
            id: similar.id,
            title: similar.title,
            poster_path: similar.poster_path ? `https://image.tmdb.org/t/p/w500${similar.poster_path}` : null,
            vote_average: similar.vote_average
          })) || [],
          recommendations: movie.recommendations?.results?.map((rec: any) => ({
            id: rec.id,
            title: rec.title,
            poster_path: rec.poster_path ? `https://image.tmdb.org/t/p/w500${rec.poster_path}` : null,
            vote_average: rec.vote_average
          })) || []
        };
        
        console.log(`[TMDB] Successfully fetched details for movie "${processedMovie.title}"`);
        
        return processedMovie;
      }

      throw new Error("Invalid response format from TMDB");
    } catch (error) {
      console.error(`Error fetching movie details from TMDB for ID ${movieId}:`, error);
      throw error;
    }
  }

  /**
   * توصیه محتوا با توجه به ترجیحات کاربر
   * @param userId شناسه کاربر
   * @param watchHistory تاریخچه تماشا
   * @param favorites محتواهای مورد علاقه
   * @param allContent همه محتواهای موجود
   * @param allGenres همه ژانرها
   * @param allTags همه تگ‌ها
   * @param count تعداد محتواهای پیشنهادی
   * @param language کد زبان (مثال: fa-IR، en-US)
   * @returns لیست محتواهای پیشنهادی
   */
  async getRecommendedContent(
    userId: number | null,
    watchHistory: any[],
    favorites: Content[],
    allContent: Content[],
    allGenres: Genre[],
    allTags: Tag[],
    count: number = 5,
    language?: string
  ): Promise<Content[]> {
    try {
      // تنظیم کد زبان معتبر
      const validatedLanguage = this.validateLanguage(language);
      
      console.log(`[TMDB] Getting recommended content, language ${validatedLanguage}`);
      
      // اگر هیچ کاربر یا تاریخچه‌ای وجود ندارد، محتواهای محبوب را برگردان
      if (!userId && watchHistory.length === 0 && favorites.length === 0) {
        return this.getPopularContent(allContent, count);
      }

      // استخراج ترجیحات کاربر
      const userPreferences = this.extractUserPreferences(watchHistory, favorites, allGenres, allTags);

      // لیست محتواهای توصیه شده
      let recommendedContentIds: number[] = [];

      // بررسی اینکه کلید API و توکن دسترسی موجود باشند
      if (!this.apiKey || !this.accessToken) {
        throw new Error("TMDB API key or access token is not available");
      }

      // ترجیحات ژانری کاربر را استخراج کن
      const preferredGenreIds = this.mapGenreNamesToTMDBIds(userPreferences.genres);

      // اگر ژانرهای مورد علاقه وجود داشته باشند از آنها استفاده کن
      if (preferredGenreIds.length > 0) {
        try {
          // دریافت توصیه ها بر اساس ژانر
          const response = await axios.get(`${this.baseUrl}/discover/movie`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              api_key: this.apiKey,
              with_genres: preferredGenreIds.join(','),
              language: validatedLanguage,
              page: 1
            }
          });

          if (response.data && response.data.results) {
            // تبدیل نتایج TMDB به شناسه‌های محتوای ما
            const tmdbIds = response.data.results.map((item: any) => item.id);
            recommendedContentIds = this.mapTMDBIdsToContentIds(tmdbIds, allContent);
          }
        } catch (error) {
          console.error("Error fetching genre-based recommendations from TMDB:", error);
        }
      }

      // اگر محتواهای مورد علاقه وجود دارند، از آنها برای دریافت توصیه‌ها استفاده کن
      if (recommendedContentIds.length < count && favorites.length > 0) {
        for (const favorite of favorites.slice(0, 3)) { // محدود به 3 مورد برای جلوگیری از فراخوانی‌های زیاد API
          try {
            // پیدا کردن معادل TMDB برای این محتوا
            const tmdbId = this.mapContentToTMDBId(favorite, 'movie');
            
            if (tmdbId) {
              // دریافت توصیه‌ها بر اساس این محتوا
              const response = await axios.get(`${this.baseUrl}/movie/${tmdbId}/recommendations`, {
                headers: {
                  'Authorization': `Bearer ${this.accessToken}`,
                  'Content-Type': 'application/json'
                },
                params: {
                  api_key: this.apiKey,
                  language: validatedLanguage,
                  page: 1
                }
              });

              if (response.data && response.data.results) {
                // تبدیل نتایج TMDB به شناسه‌های محتوای ما
                const tmdbIds = response.data.results.map((item: any) => item.id);
                const contentIds = this.mapTMDBIdsToContentIds(tmdbIds, allContent);
                
                // افزودن شناسه‌های جدید به لیست توصیه‌ها
                for (const id of contentIds) {
                  if (!recommendedContentIds.includes(id)) {
                    recommendedContentIds.push(id);
                  }
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching recommendations for content ID ${favorite.id}:`, error);
          }
          
          // اگر به تعداد کافی توصیه جمع‌آوری شده، خارج شو
          if (recommendedContentIds.length >= count) break;
        }
      }

      // اگر تاریخچه تماشا وجود دارد، از آن برای توصیه‌های بیشتر استفاده کن
      if (recommendedContentIds.length < count && watchHistory.length > 0) {
        for (const watched of watchHistory.slice(-3)) { // از 3 مورد آخر استفاده کن
          try {
            if (!watched.content) continue;
            
            // پیدا کردن معادل TMDB برای این محتوا
            const tmdbId = this.mapContentToTMDBId(watched.content, 'movie');
            
            if (tmdbId) {
              // دریافت توصیه‌ها بر اساس این محتوا
              const response = await axios.get(`${this.baseUrl}/movie/${tmdbId}/similar`, {
                headers: {
                  'Authorization': `Bearer ${this.accessToken}`,
                  'Content-Type': 'application/json'
                },
                params: {
                  api_key: this.apiKey,
                  language: validatedLanguage,
                  page: 1
                }
              });

              if (response.data && response.data.results) {
                // تبدیل نتایج TMDB به شناسه‌های محتوای ما
                const tmdbIds = response.data.results.map((item: any) => item.id);
                const contentIds = this.mapTMDBIdsToContentIds(tmdbIds, allContent);
                
                // افزودن شناسه‌های جدید به لیست توصیه‌ها
                for (const id of contentIds) {
                  if (!recommendedContentIds.includes(id)) {
                    recommendedContentIds.push(id);
                  }
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching similar content for history item:`, error);
          }
          
          // اگر به تعداد کافی توصیه جمع‌آوری شده، خارج شو
          if (recommendedContentIds.length >= count) break;
        }
      }

      // افزودن محتواهای محبوب در صورت نیاز
      if (recommendedContentIds.length < count) {
        // دریافت محتواهای محبوب از TMDB
        try {
          const response = await axios.get(`${this.baseUrl}/movie/popular`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              api_key: this.apiKey,
              language: validatedLanguage,
              page: 1
            }
          });

          if (response.data && response.data.results) {
            // تبدیل نتایج TMDB به شناسه‌های محتوای ما
            const tmdbIds = response.data.results.map((item: any) => item.id);
            const contentIds = this.mapTMDBIdsToContentIds(tmdbIds, allContent);
            
            // افزودن شناسه‌های جدید به لیست توصیه‌ها
            for (const id of contentIds) {
              if (!recommendedContentIds.includes(id)) {
                recommendedContentIds.push(id);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching popular content from TMDB:", error);
        }
      }

      // فیلتر کردن محتواهایی که وجود دارند و برگرداندن آنها
      let recommendedContent = allContent.filter(item => recommendedContentIds.includes(item.id));
      
      // اگر هنوز تعداد کافی نداریم، از الگوریتم محلی استفاده کن
      if (recommendedContent.length < count) {
        const popularContent = this.getPopularContent(
          allContent.filter(item => !recommendedContentIds.includes(item.id)), 
          count - recommendedContent.length
        );
        recommendedContent = [...recommendedContent, ...popularContent];
      }
      
      return recommendedContent.slice(0, count);
    } catch (error) {
      console.error("Error getting TMDB recommendations:", error);
      // در صورت خطا، محتواهای محبوب را برگردان
      return this.getPopularContent(allContent, count);
    }
  }

  /**
   * دریافت محتواهای مشابه با یک محتوای خاص
   * @param contentItem محتوای مورد نظر
   * @param allContent همه محتواها
   * @param allGenres همه ژانرها 
   * @param allTags همه تگ‌ها
   * @param count تعداد محتواهای پیشنهادی
   * @param language کد زبان (مثال: fa-IR، en-US)
   * @returns لیست محتواهای مشابه
   */
  async getSimilarContent(
    contentItem: Content,
    allContent: Content[],
    allGenres: Genre[],
    allTags: Tag[],
    count: number = 5,
    language?: string
  ): Promise<Content[]> {
    try {
      // تمام محتواها بجز محتوای فعلی را لیست کن
      const otherContent = allContent.filter(item => item.id !== contentItem.id);
      
      // تنظیم کد زبان معتبر
      const validatedLanguage = this.validateLanguage(language);
      
      // لیست شناسه‌های محتواهای مشابه
      let similarContentIds: number[] = [];
      
      // بررسی اینکه کلید API و توکن دسترسی موجود باشند
      if (!this.apiKey || !this.accessToken) {
        throw new Error("TMDB API key or access token is not available");
      }
      
      console.log(`[TMDB] Finding similar content for ID ${contentItem.id}, language ${validatedLanguage}`);
      
      // پیدا کردن معادل TMDB برای این محتوا
      const tmdbId = this.mapContentToTMDBId(contentItem, 'movie');
      
      if (tmdbId) {
        try {
          // 1. دریافت محتواهای مشابه
          const similarResponse = await axios.get(`${this.baseUrl}/movie/${tmdbId}/similar`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              api_key: this.apiKey,
              language: validatedLanguage,
              page: 1
            }
          });

          if (similarResponse.data && similarResponse.data.results) {
            // تبدیل نتایج TMDB به شناسه‌های محتوای ما
            const tmdbIds = similarResponse.data.results.map((item: any) => item.id);
            const contentIds = this.mapTMDBIdsToContentIds(tmdbIds, allContent);
            
            // افزودن شناسه‌های جدید به لیست محتواهای مشابه
            for (const id of contentIds) {
              if (!similarContentIds.includes(id)) {
                similarContentIds.push(id);
              }
            }
          }
          
          // 2. دریافت توصیه‌ها
          const recommendationsResponse = await axios.get(`${this.baseUrl}/movie/${tmdbId}/recommendations`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              api_key: this.apiKey,
              language: validatedLanguage,
              page: 1
            }
          });

          if (recommendationsResponse.data && recommendationsResponse.data.results) {
            // تبدیل نتایج TMDB به شناسه‌های محتوای ما
            const tmdbIds = recommendationsResponse.data.results.map((item: any) => item.id);
            const contentIds = this.mapTMDBIdsToContentIds(tmdbIds, allContent);
            
            // افزودن شناسه‌های جدید به لیست محتواهای مشابه
            for (const id of contentIds) {
              if (!similarContentIds.includes(id)) {
                similarContentIds.push(id);
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching similar content for ID ${contentItem.id}:`, error);
        }
      }
      
      // استخراج ژانرهای محتوای فعلی
      const contentGenreIds = this.getContentGenres(contentItem.id, [contentItem, ...otherContent]);
      
      // اگر هنوز به تعداد کافی محتوای مشابه نداریم و ژانرهای محتوا مشخص است
      if (similarContentIds.length < count && contentGenreIds.length > 0) {
        try {
          // تبدیل ژانرهای ما به ژانرهای TMDB
          const tmdbGenreIds = this.mapGenreIdsToTMDBIds(contentGenreIds, allGenres);
          
          if (tmdbGenreIds.length > 0) {
            // دریافت محتواها بر اساس ژانر
            const response = await axios.get(`${this.baseUrl}/discover/movie`, {
              headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
              },
              params: {
                api_key: this.apiKey,
                with_genres: tmdbGenreIds.join(','),
                language: validatedLanguage,
                page: 1,
                primary_release_year: contentItem.year // محدود به سال انتشار مشابه
              }
            });

            if (response.data && response.data.results) {
              // تبدیل نتایج TMDB به شناسه‌های محتوای ما
              const tmdbIds = response.data.results.map((item: any) => item.id);
              const contentIds = this.mapTMDBIdsToContentIds(tmdbIds, allContent);
              
              // افزودن شناسه‌های جدید به لیست محتواهای مشابه
              for (const id of contentIds) {
                if (!similarContentIds.includes(id) && id !== contentItem.id) {
                  similarContentIds.push(id);
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching genre-based similar content from TMDB:", error);
        }
      }
      
      // فیلتر کردن محتواهایی که وجود دارند
      let similarContent = otherContent.filter(item => similarContentIds.includes(item.id));
      
      // اگر تعداد محتواهای مشابه کمتر از count باشد، از الگوریتم محلی استفاده کن
      if (similarContent.length < count) {
        const fallbackSimilar = this.getBasicSimilarContent(
          contentItem, 
          otherContent.filter(item => !similarContentIds.includes(item.id)),
          allGenres,
          allTags,
          count - similarContent.length
        );
        similarContent = [...similarContent, ...fallbackSimilar];
      }
      
      return similarContent.slice(0, count);
    } catch (error) {
      console.error("Error getting TMDB similar content:", error);
      // در صورت خطا، از الگوریتم محلی برای یافتن محتواهای مشابه استفاده کن
      return this.getBasicSimilarContent(contentItem, allContent.filter(item => item.id !== contentItem.id), allGenres, allTags, count);
    }
  }
  
  /**
   * تبدیل نام ژانرها به شناسه‌های TMDB
   */
  private mapGenreNamesToTMDBIds(genreNames: string[]): number[] {
    const genreMap: { [key: string]: number } = {
      // ژانرهای فارسی به شناسه‌های TMDB
      'اکشن': 28,
      'ماجراجویی': 12,
      'انیمیشن': 16,
      'کمدی': 35,
      'جنایی': 80,
      'مستند': 99,
      'درام': 18,
      'خانوادگی': 10751,
      'فانتزی': 14,
      'تاریخی': 36,
      'ترسناک': 27,
      'موزیکال': 10402,
      'معمایی': 9648,
      'عاشقانه': 10749,
      'علمی تخیلی': 878,
      'دلهره‌آور': 53,
      'جنگی': 10752,
      'وسترن': 37,
      
      // ژانرهای انگلیسی به شناسه‌های TMDB
      'Action': 28,
      'Adventure': 12,
      'Animation': 16,
      'Comedy': 35,
      'Crime': 80,
      'Documentary': 99,
      'Drama': 18,
      'Family': 10751,
      'Fantasy': 14,
      'History': 36,
      'Horror': 27,
      'Music': 10402,
      'Mystery': 9648,
      'Romance': 10749,
      'Science Fiction': 878,
      'Thriller': 53,
      'War': 10752,
      'Western': 37
    };
    
    return genreNames
      .map(name => genreMap[name])
      .filter(id => id !== undefined);
  }
  
  /**
   * تبدیل شناسه‌های ژانر ما به شناسه‌های TMDB
   */
  private mapGenreIdsToTMDBIds(genreIds: number[], allGenres: Genre[]): number[] {
    // ابتدا شناسه‌های ژانر را به نام‌ها تبدیل کن
    const genreNames = genreIds
      .map(id => allGenres.find(g => g.id === id)?.name || '')
      .filter(name => name !== '');
    
    // سپس نام‌ها را به شناسه‌های TMDB تبدیل کن
    return this.mapGenreNamesToTMDBIds(genreNames);
  }
  
  /**
   * تبدیل محتوا به شناسه TMDB
   */
  private mapContentToTMDBId(content: Content, type: 'movie' | 'tv' = 'movie'): number | null {
    // این متد باید محتوای ما را به محتوای معادل در TMDB تبدیل کند
    // در یک پیاده‌سازی واقعی، ما باید این نگاشت را در پایگاه داده ذخیره کنیم
    // اما برای این مثال، یک الگوریتم ساده ارائه می‌دهیم
    
    // جستجو بر اساس عنوان انگلیسی در TMDB
    try {
      const englishTitle = content.englishTitle || content.title;
      // در اینجا می‌توان از search API استفاده کرد اما این فراخوانی را انجام نمی‌دهیم
      // زیرا هر بار نیاز به فراخوانی API داریم و این ممکن است باعث محدودیت تعداد درخواست شود
      
      // بجای آن، یک الگوریتم ساده استفاده می‌کنیم
      // این یک روش ساده و غیردقیق است و در محیط واقعی باید بهبود یابد
      
      // به عنوان مثال، می‌توانیم از هش عنوان انگلیسی + سال استفاده کنیم
      const hash = this.simpleHash(englishTitle + content.year.toString());
      
      // TMDB IDs معمولاً اعداد 5-7 رقمی هستند، بنابراین هش را به عدد مثبت 6 رقمی تبدیل می‌کنیم
      return Math.abs(hash) % 900000 + 100000;
    } catch (error) {
      console.error("Error mapping content to TMDB ID:", error);
      return null;
    }
  }
  
  /**
   * تبدیل شناسه‌های TMDB به شناسه‌های محتوای ما
   */
  private mapTMDBIdsToContentIds(tmdbIds: number[], allContent: Content[]): number[] {
    // این متد باید شناسه‌های TMDB را به شناسه‌های محتوای ما تبدیل کند
    // در یک پیاده‌سازی واقعی، ما باید این نگاشت را در پایگاه داده ذخیره کنیم
    
    // برای این مثال، محتواهای تصادفی را انتخاب می‌کنیم
    // توجه کنید که در یک پیاده‌سازی واقعی، این روش مناسب نیست
    const contentIds: number[] = [];
    
    // برای هر شناسه TMDB، یک محتوای مناسب پیدا کن
    for (const tmdbId of tmdbIds) {
      // محاسبه یک شاخص تصادفی اما قابل تکرار برای هر شناسه TMDB
      const index = tmdbId % allContent.length;
      
      // افزودن شناسه محتوا اگر قبلاً اضافه نشده باشد
      const contentId = allContent[index]?.id;
      if (contentId && !contentIds.includes(contentId)) {
        contentIds.push(contentId);
      }
    }
    
    return contentIds;
  }
  
  /**
   * استخراج ترجیحات کاربر از تاریخچه و علاقه‌مندی‌ها
   */
  private extractUserPreferences(
    watchHistory: any[],
    favorites: Content[],
    allGenres: Genre[],
    allTags: Tag[]
  ): any {
    // محتواهایی که کاربر تماشا کرده است
    const watchedContentIds = watchHistory.map(item => item.contentId);
    const watchedContent = watchHistory.map(item => item.content).filter(Boolean);
    
    // محتواهای مورد علاقه کاربر
    const favoriteContentIds = favorites.map(item => item.id);
    
    // ژانرهای مورد علاقه کاربر
    const genreCounts: { [key: string]: number } = {};
    [...watchedContent, ...favorites].forEach(content => {
      if (!content) return;
      
      const contentGenreIds = this.getContentGenres(content.id, [...watchedContent, ...favorites]);
      contentGenreIds.forEach(genreId => {
        const genre = allGenres.find(g => g.id === genreId);
        if (genre) {
          genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
        }
      });
    });
    
    // انواع محتوای مورد علاقه کاربر
    const contentTypeCounts: { [key: string]: number } = {};
    [...watchedContent, ...favorites].forEach(content => {
      if (!content || !content.type) return;
      contentTypeCounts[content.type] = (contentTypeCounts[content.type] || 0) + 1;
    });
    
    // مرتب‌سازی و انتخاب موارد پرتکرار
    const genres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
    
    const contentTypes = Object.entries(contentTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    return {
      genres,
      contentTypes,
      watchedContentIds,
      favoriteContentIds
    };
  }
  
  /**
   * محاسبه هش ساده برای یک رشته
   */
  private simpleHash(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // تبدیل به 32bit integer
    }
    
    return hash;
  }
  
  /**
   * روش ساده برای یافتن محتواهای محبوب
   */
  private getPopularContent(allContent: Content[], count: number): Content[] {
    // در این پیاده‌سازی ساده، محتواها را بر اساس سال انتشار و میزان بازدید مرتب می‌کنیم
    return [...allContent]
      .sort((a, b) => {
        // ابتدا بر اساس میزان بازدید یا محبوبیت (اگر وجود داشته باشد)
        const aPopularity = (a as any).viewCount || (a as any).popularity || 0;
        const bPopularity = (b as any).viewCount || (b as any).popularity || 0;
        
        if (aPopularity !== bPopularity) {
          return bPopularity - aPopularity;
        }
        
        // سپس بر اساس سال انتشار
        return b.year - a.year;
      })
      .slice(0, count);
  }
  
  /**
   * روش ساده برای یافتن محتواهای مشابه
   */
  private getBasicSimilarContent(
    contentItem: Content,
    otherContent: Content[],
    allGenres: Genre[],
    allTags: Tag[],
    count: number
  ): Content[] {
    // ژانرها و تگ‌های محتوای مورد نظر
    const contentGenreIds = this.getContentGenres(contentItem.id, [contentItem, ...otherContent]);
    const contentTagIds = this.getContentTags(contentItem.id, [contentItem, ...otherContent]);
    
    // محاسبه امتیاز شباهت برای هر محتوا
    const contentWithSimilarity = otherContent.map(item => {
      const itemGenreIds = this.getContentGenres(item.id, [contentItem, ...otherContent]);
      const itemTagIds = this.getContentTags(item.id, [contentItem, ...otherContent]);
      
      // تعداد ژانرهای مشترک
      const commonGenres = itemGenreIds.filter(id => contentGenreIds.includes(id)).length;
      
      // تعداد تگ‌های مشترک
      const commonTags = itemTagIds.filter(id => contentTagIds.includes(id)).length;
      
      // امتیاز بر اساس شباهت نوع، سال، ژانرها و تگ‌ها
      let score = 0;
      
      // نوع محتوا یکسان
      if (item.type === contentItem.type) {
        score += 2;
      }
      
      // سال انتشار نزدیک (در محدوده 5 سال)
      if (Math.abs(item.year - contentItem.year) <= 5) {
        score += 1;
      }
      
      // ژانرهای مشترک (هر ژانر 2 امتیاز)
      score += commonGenres * 2;
      
      // تگ‌های مشترک (هر تگ 1 امتیاز)
      score += commonTags;
      
      return { content: item, score };
    });
    
    // مرتب‌سازی بر اساس امتیاز شباهت و انتخاب count مورد اول
    return contentWithSimilarity
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => item.content);
  }
  
  /**
   * دریافت ژانرهای یک محتوا (پیاده‌سازی ساده)
   */
  private getContentGenres(contentId: number, allContent: any[]): number[] {
    // در این پیاده‌سازی ساده فرض می‌کنیم هر محتوا دارای ویژگی genres است
    const content = allContent.find(item => item.id === contentId);
    if (content && content.genres && Array.isArray(content.genres)) {
      return content.genres;
    }
    return [];
  }
  
  /**
   * دریافت تگ‌های یک محتوا (پیاده‌سازی ساده)
   */
  private getContentTags(contentId: number, allContent: any[]): number[] {
    // در این پیاده‌سازی ساده فرض می‌کنیم هر محتوا دارای ویژگی tags است
    const content = allContent.find(item => item.id === contentId);
    if (content && content.tags && Array.isArray(content.tags)) {
      return content.tags;
    }
    return [];
  }
}

// ایجاد نمونه واحد از سرویس
export const tmdbService = new TMDBService();