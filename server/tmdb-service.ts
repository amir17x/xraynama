import axios from 'axios';
import { Content, Genre, Tag, User } from '@shared/schema';

// سیستم توصیه محتوا با استفاده از API TMDB
export class TMDBService {
  private apiKey: string;
  private accessToken: string;
  private baseUrl: string = 'https://api.themoviedb.org/3';

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || '';
    this.accessToken = process.env.TMDB_ACCESS_TOKEN || '';
  }

  /**
   * دریافت فیلم‌های محبوب از TMDB
   * @param page شماره صفحه
   * @param limit تعداد نتایج
   * @returns لیست فیلم‌های محبوب
   */
  async getPopularMovies(page: number = 1, limit: number = 10) {
    try {
      if (!this.apiKey || !this.accessToken) {
        throw new Error("TMDB API key or access token is not available");
      }

      const response = await axios.get(`${this.baseUrl}/movie/popular`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          api_key: this.apiKey,
          language: 'fa-IR',
          page,
          include_adult: false
        }
      });

      if (response.data && response.data.results) {
        // پردازش و بهبود نتایج
        const movies = response.data.results
          .slice(0, limit)
          .map((movie: any) => {
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
      console.error("Error fetching popular movies from TMDB:", error);
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
   * @returns لیست محتواهای پیشنهادی
   */
  async getRecommendedContent(
    userId: number | null,
    watchHistory: any[],
    favorites: Content[],
    allContent: Content[],
    allGenres: Genre[],
    allTags: Tag[],
    count: number = 5
  ): Promise<Content[]> {
    try {
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
              language: 'fa-IR',
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
                  language: 'fa-IR',
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
                  language: 'fa-IR',
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
              language: 'fa-IR',
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
   * @returns لیست محتواهای مشابه
   */
  async getSimilarContent(
    contentItem: Content,
    allContent: Content[],
    allGenres: Genre[],
    allTags: Tag[],
    count: number = 5
  ): Promise<Content[]> {
    try {
      // تمام محتواها بجز محتوای فعلی را لیست کن
      const otherContent = allContent.filter(item => item.id !== contentItem.id);
      
      // لیست شناسه‌های محتواهای مشابه
      let similarContentIds: number[] = [];
      
      // بررسی اینکه کلید API و توکن دسترسی موجود باشند
      if (!this.apiKey || !this.accessToken) {
        throw new Error("TMDB API key or access token is not available");
      }
      
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
              language: 'fa-IR',
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
              language: 'fa-IR',
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
                language: 'fa-IR',
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