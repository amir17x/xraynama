/**
 * اسکریپت واردسازی محتوا از TMDB API به MongoDB
 * این اسکریپت 50 فیلم، سریال و مستند را از TMDB API دریافت و به پایگاه داده MongoDB وارد می‌کند.
 */

import mongoose from 'mongoose';
import { connectToMongoDB } from '../db/mongo';
import { 
  Content, 
  Genre, 
  ContentGenre, 
  Tag,
  ContentTag
} from '../models/mongoose';
import { TMDBService } from '../tmdb-service';

// ایجاد نمونه از TMDBService
const tmdbService = new TMDBService();

// تعداد محتوایی که می‌خواهیم وارد کنیم
const TOTAL_MOVIES = 20;
const TOTAL_TV_SERIES = 20;
const TOTAL_DOCUMENTARIES = 10;

// زبان پیش‌فرض
const DEFAULT_LANGUAGE = 'fa-IR';

/**
 * تبدیل شناسه ژانر TMDB به نام‌های فارسی
 */
const genreIdToNameFa: Record<number, string> = {
  28: 'اکشن',
  12: 'ماجراجویی',
  16: 'انیمیشن',
  35: 'کمدی',
  80: 'جنایی',
  99: 'مستند',
  18: 'درام',
  10751: 'خانوادگی',
  14: 'فانتزی',
  36: 'تاریخی',
  27: 'ترسناک',
  10402: 'موزیکال',
  9648: 'معمایی',
  10749: 'عاشقانه',
  878: 'علمی-تخیلی',
  10770: 'فیلم تلویزیونی',
  53: 'هیجان‌انگیز',
  10752: 'جنگی',
  37: 'وسترن',
  10759: 'اکشن و ماجراجویی',
  10762: 'کودکان',
  10763: 'خبری',
  10764: 'واقع‌نما',
  10765: 'علمی تخیلی و فانتزی',
  10766: 'سریال',
  10767: 'گفتگو',
  10768: 'جنگ و سیاست'
};

/**
 * تبدیل شناسه ژانر TMDB به نام‌های انگلیسی
 */
const genreIdToNameEn: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics'
};

/**
 * تبدیل شناسه ژانر به slug
 */
const genreIdToSlug: Record<number, string> = {
  28: 'action',
  12: 'adventure',
  16: 'animation',
  35: 'comedy',
  80: 'crime',
  99: 'documentary',
  18: 'drama',
  10751: 'family',
  14: 'fantasy',
  36: 'history',
  27: 'horror',
  10402: 'music',
  9648: 'mystery',
  10749: 'romance',
  878: 'science-fiction',
  10770: 'tv-movie',
  53: 'thriller',
  10752: 'war',
  37: 'western',
  10759: 'action-adventure',
  10762: 'kids',
  10763: 'news',
  10764: 'reality',
  10765: 'sci-fi-fantasy',
  10766: 'soap',
  10767: 'talk',
  10768: 'war-politics'
};

/**
 * گرفتن یا ایجاد ژانر در پایگاه داده
 */
async function getOrCreateGenre(genreId: number): Promise<mongoose.Types.ObjectId> {
  try {
    const nameFa = genreIdToNameFa[genreId] || `ژانر ${genreId}`;
    const nameEn = genreIdToNameEn[genreId] || `Genre ${genreId}`;
    const slug = genreIdToSlug[genreId] || `genre-${genreId}`;
    
    // جستجوی ژانر با slug
    let genre = await Genre.findOne({ slug });
    
    // اگر ژانر وجود نداشت، آن را ایجاد کن
    if (!genre) {
      genre = new Genre({
        name: nameFa, // استفاده از نام فارسی
        slug,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await genre.save();
      console.log(`Genre "${nameFa}" (${slug}) created.`);
    }
    
    return genre._id;
  } catch (error) {
    console.error(`Error getting or creating genre ${genreId}:`, error);
    throw error;
  }
}

/**
 * ایجاد تگ در پایگاه داده
 */
async function getOrCreateTag(tagName: string): Promise<mongoose.Types.ObjectId> {
  try {
    const slug = tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    
    // جستجوی تگ با slug
    let tag = await Tag.findOne({ slug });
    
    // اگر تگ وجود نداشت، آن را ایجاد کن
    if (!tag) {
      tag = new Tag({
        name: tagName,
        slug,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await tag.save();
      console.log(`Tag "${tagName}" (${slug}) created.`);
    }
    
    return tag._id;
  } catch (error) {
    console.error(`Error getting or creating tag ${tagName}:`, error);
    throw error;
  }
}

/**
 * ذخیره فیلم در پایگاه داده
 */
async function saveMovie(movieDetails: any): Promise<void> {
  try {
    // بررسی وجود فیلم با همین شناسه TMDB
    const existingContent = await Content.findOne({ 
      englishTitle: movieDetails.original_title
    });
    
    if (existingContent) {
      console.log(`Movie "${movieDetails.title}" already exists, skipping...`);
      return;
    }
    
    // ایجاد محتوای جدید
    const content = new Content({
      type: 'movie',
      title: movieDetails.title,
      englishTitle: movieDetails.original_title,
      description: movieDetails.overview || 'توضیحات موجود نیست',
      year: movieDetails.release_date ? parseInt(movieDetails.release_date.substring(0, 4)) : new Date().getFullYear(),
      duration: movieDetails.runtime || 90, // مدت زمان پیش‌فرض 90 دقیقه
      poster: movieDetails.poster_path || '',
      backdrop: movieDetails.backdrop_path || null,
      imdbRating: movieDetails.vote_average ? movieDetails.vote_average.toString() : '0',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // ذخیره محتوا
    const savedContent = await content.save();
    console.log(`Movie "${savedContent.title}" saved to MongoDB.`);
    
    // ذخیره ژانرها
    if (movieDetails.genres && movieDetails.genres.length > 0) {
      const genrePromises = movieDetails.genres.map(async (genre: any) => {
        try {
          const genreId = await getOrCreateGenre(genre.id);
          
          const contentGenre = new ContentGenre({
            contentId: savedContent._id,
            genreId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await contentGenre.save();
          console.log(`Genre ${genre.name} linked to movie "${savedContent.title}"`);
        } catch (error) {
          console.error(`Error linking genre ${genre.id} to movie "${savedContent.title}":`, error);
        }
      });
      
      await Promise.all(genrePromises);
    }
    
    // ایجاد تگ‌ها بر اساس زبان، کشور تولید و...
    const tags: string[] = [];
    
    // افزودن تگ بر اساس زبان اصلی
    if (movieDetails.original_language) {
      tags.push(`زبان: ${movieDetails.original_language}`);
    }
    
    // افزودن تگ بر اساس کشور تولید
    if (movieDetails.production_countries && movieDetails.production_countries.length > 0) {
      movieDetails.production_countries.forEach((country: any) => {
        tags.push(`کشور: ${country.name}`);
      });
    }
    
    // افزودن تگ بر اساس کمپانی تولید
    if (movieDetails.production_companies && movieDetails.production_companies.length > 0) {
      movieDetails.production_companies.slice(0, 3).forEach((company: any) => {
        tags.push(`کمپانی: ${company.name}`);
      });
    }
    
    // افزودن تگ با توجه به امتیاز
    if (movieDetails.vote_average) {
      if (movieDetails.vote_average >= 8) {
        tags.push('برترین‌ها');
      } else if (movieDetails.vote_average >= 7) {
        tags.push('پیشنهاد ویژه');
      }
    }
    
    // ذخیره تگ‌ها
    if (tags.length > 0) {
      const tagPromises = tags.map(async (tagName) => {
        try {
          const tagId = await getOrCreateTag(tagName);
          
          const contentTag = new ContentTag({
            contentId: savedContent._id,
            tagId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await contentTag.save();
          console.log(`Tag "${tagName}" linked to movie "${savedContent.title}"`);
        } catch (error) {
          console.error(`Error linking tag "${tagName}" to movie "${savedContent.title}":`, error);
        }
      });
      
      await Promise.all(tagPromises);
    }
  } catch (error) {
    console.error(`Error saving movie "${movieDetails.title || 'Unknown'}":`, error);
  }
}

/**
 * ذخیره سریال در پایگاه داده
 */
async function saveTVSeries(tvDetails: any): Promise<void> {
  try {
    // بررسی وجود سریال با همین شناسه TMDB
    const existingContent = await Content.findOne({ 
      englishTitle: tvDetails.original_name
    });
    
    if (existingContent) {
      console.log(`TV Series "${tvDetails.name}" already exists, skipping...`);
      return;
    }
    
    // محاسبه مدت زمان بر اساس متوسط زمان هر قسمت (یا پیش‌فرض 45 دقیقه) ضرب در تعداد قسمت‌ها در فصل اول
    let duration = 45; // پیش‌فرض برای هر قسمت
    if (tvDetails.episode_run_time && tvDetails.episode_run_time.length > 0) {
      // میانگین زمان قسمت‌ها
      duration = tvDetails.episode_run_time.reduce((a: number, b: number) => a + b, 0) / tvDetails.episode_run_time.length;
    }
    
    // ایجاد محتوای جدید
    const content = new Content({
      type: 'series',
      title: tvDetails.name,
      englishTitle: tvDetails.original_name,
      description: tvDetails.overview || 'توضیحات موجود نیست',
      year: tvDetails.first_air_date ? parseInt(tvDetails.first_air_date.substring(0, 4)) : new Date().getFullYear(),
      duration: duration, // مدت زمان میانگین هر قسمت
      poster: tvDetails.poster_path || '',
      backdrop: tvDetails.backdrop_path || null,
      imdbRating: tvDetails.vote_average ? tvDetails.vote_average.toString() : '0',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // ذخیره محتوا
    const savedContent = await content.save();
    console.log(`TV Series "${savedContent.title}" saved to MongoDB.`);
    
    // ذخیره ژانرها
    if (tvDetails.genres && tvDetails.genres.length > 0) {
      const genrePromises = tvDetails.genres.map(async (genre: any) => {
        try {
          const genreId = await getOrCreateGenre(genre.id);
          
          const contentGenre = new ContentGenre({
            contentId: savedContent._id,
            genreId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await contentGenre.save();
          console.log(`Genre ${genre.name} linked to TV series "${savedContent.title}"`);
        } catch (error) {
          console.error(`Error linking genre ${genre.id} to TV series "${savedContent.title}":`, error);
        }
      });
      
      await Promise.all(genrePromises);
    }
    
    // ایجاد تگ‌ها بر اساس زبان، کشور تولید و...
    const tags: string[] = [];
    
    // افزودن تگ بر اساس زبان اصلی
    if (tvDetails.original_language) {
      tags.push(`زبان: ${tvDetails.original_language}`);
    }
    
    // افزودن تگ بر اساس کشور تولید
    if (tvDetails.origin_country && tvDetails.origin_country.length > 0) {
      tvDetails.origin_country.forEach((country: string) => {
        tags.push(`کشور: ${country}`);
      });
    }
    
    // افزودن تگ بر اساس شبکه پخش
    if (tvDetails.networks && tvDetails.networks.length > 0) {
      tvDetails.networks.slice(0, 2).forEach((network: any) => {
        tags.push(`شبکه: ${network.name}`);
      });
    }
    
    // افزودن تگ با توجه به امتیاز
    if (tvDetails.vote_average) {
      if (tvDetails.vote_average >= 8) {
        tags.push('برترین‌ها');
      } else if (tvDetails.vote_average >= 7) {
        tags.push('پیشنهاد ویژه');
      }
    }
    
    // افزودن تگ بر اساس وضعیت پخش
    if (tvDetails.status) {
      const statusMapping: Record<string, string> = {
        'Returning Series': 'در حال پخش',
        'Ended': 'پایان یافته',
        'Canceled': 'لغو شده'
      };
      
      const statusTag = statusMapping[tvDetails.status];
      if (statusTag) {
        tags.push(statusTag);
      }
    }
    
    // ذخیره تگ‌ها
    if (tags.length > 0) {
      const tagPromises = tags.map(async (tagName) => {
        try {
          const tagId = await getOrCreateTag(tagName);
          
          const contentTag = new ContentTag({
            contentId: savedContent._id,
            tagId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await contentTag.save();
          console.log(`Tag "${tagName}" linked to TV series "${savedContent.title}"`);
        } catch (error) {
          console.error(`Error linking tag "${tagName}" to TV series "${savedContent.title}":`, error);
        }
      });
      
      await Promise.all(tagPromises);
    }
  } catch (error) {
    console.error(`Error saving TV series "${tvDetails.name || 'Unknown'}":`, error);
  }
}

/**
 * ذخیره مستند در پایگاه داده
 */
async function saveDocumentary(docDetails: any): Promise<void> {
  try {
    // بررسی وجود مستند با همین شناسه TMDB
    const existingContent = await Content.findOne({ 
      englishTitle: docDetails.original_title || docDetails.original_name
    });
    
    if (existingContent) {
      console.log(`Documentary "${docDetails.title || docDetails.name}" already exists, skipping...`);
      return;
    }
    
    // ایجاد محتوای جدید
    const content = new Content({
      type: 'documentary',
      title: docDetails.title || docDetails.name,
      englishTitle: docDetails.original_title || docDetails.original_name,
      description: docDetails.overview || 'توضیحات موجود نیست',
      year: docDetails.release_date || docDetails.first_air_date 
        ? parseInt((docDetails.release_date || docDetails.first_air_date).substring(0, 4)) 
        : new Date().getFullYear(),
      duration: docDetails.runtime || 90, // مدت زمان پیش‌فرض 90 دقیقه
      poster: docDetails.poster_path || '',
      backdrop: docDetails.backdrop_path || null,
      imdbRating: docDetails.vote_average ? docDetails.vote_average.toString() : '0',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // ذخیره محتوا
    const savedContent = await content.save();
    console.log(`Documentary "${savedContent.title}" saved to MongoDB.`);
    
    // ذخیره ژانرها (مستندها باید حتماً ژانر مستند داشته باشند)
    // ابتدا ژانر مستند را اضافه می‌کنیم
    const documentaryGenreId = await getOrCreateGenre(99); // 99 is Documentary genre in TMDB
    
    const contentGenre = new ContentGenre({
      contentId: savedContent._id,
      genreId: documentaryGenreId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await contentGenre.save();
    console.log(`Documentary genre linked to "${savedContent.title}"`);
    
    // اگر ژانرهای دیگری هم داشت، آن‌ها را هم اضافه می‌کنیم
    if (docDetails.genres && docDetails.genres.length > 0) {
      const genrePromises = docDetails.genres.map(async (genre: any) => {
        // اگر ژانر مستند نبود (چون قبلاً اضافه کردیم)
        if (genre.id !== 99) {
          try {
            const genreId = await getOrCreateGenre(genre.id);
            
            const contentGenre = new ContentGenre({
              contentId: savedContent._id,
              genreId,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            
            await contentGenre.save();
            console.log(`Genre ${genre.name} linked to documentary "${savedContent.title}"`);
          } catch (error) {
            console.error(`Error linking genre ${genre.id} to documentary "${savedContent.title}":`, error);
          }
        }
      });
      
      await Promise.all(genrePromises);
    }
    
    // ایجاد تگ‌ها بر اساس زبان، کشور تولید و...
    const tags: string[] = ['مستند']; // همیشه تگ مستند را داریم
    
    // افزودن تگ بر اساس زبان اصلی
    if (docDetails.original_language) {
      tags.push(`زبان: ${docDetails.original_language}`);
    }
    
    // افزودن تگ بر اساس کشور تولید
    if (docDetails.production_countries && docDetails.production_countries.length > 0) {
      docDetails.production_countries.forEach((country: any) => {
        tags.push(`کشور: ${country.name}`);
      });
    }
    
    // افزودن تگ بر اساس کمپانی تولید
    if (docDetails.production_companies && docDetails.production_companies.length > 0) {
      docDetails.production_companies.slice(0, 2).forEach((company: any) => {
        tags.push(`کمپانی: ${company.name}`);
      });
    }
    
    // افزودن تگ با توجه به امتیاز
    if (docDetails.vote_average) {
      if (docDetails.vote_average >= 8) {
        tags.push('برترین‌ها');
      } else if (docDetails.vote_average >= 7) {
        tags.push('پیشنهاد ویژه');
      }
    }
    
    // ذخیره تگ‌ها
    if (tags.length > 0) {
      const tagPromises = tags.map(async (tagName) => {
        try {
          const tagId = await getOrCreateTag(tagName);
          
          const contentTag = new ContentTag({
            contentId: savedContent._id,
            tagId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await contentTag.save();
          console.log(`Tag "${tagName}" linked to documentary "${savedContent.title}"`);
        } catch (error) {
          console.error(`Error linking tag "${tagName}" to documentary "${savedContent.title}":`, error);
        }
      });
      
      await Promise.all(tagPromises);
    }
  } catch (error) {
    console.error(`Error saving documentary "${docDetails.title || docDetails.name || 'Unknown'}":`, error);
  }
}

/**
 * دریافت و ذخیره فیلم‌های محبوب
 */
async function importPopularMovies(): Promise<void> {
  try {
    console.log(`Importing ${TOTAL_MOVIES} popular movies...`);
    
    // استفاده از discover برای فیلترینگ فیلم‌ها
    const response = await tmdbService.discoverMovies({
      sort_by: 'popularity.desc',
      vote_average_gte: 6, // حداقل امتیاز 6
      with_runtime_gte: 60, // حداقل 60 دقیقه باشد
      vote_count_gte: 1000 // حداقل 1000 رأی داشته باشد
    }, 1, DEFAULT_LANGUAGE);
    
    if (!response.results || response.results.length === 0) {
      console.log("No popular movies found.");
      return;
    }
    
    // محدود کردن به تعداد مورد نظر
    const moviesLimited = response.results.slice(0, TOTAL_MOVIES);
    console.log(`Found ${moviesLimited.length} movies, importing...`);
    
    // دریافت اطلاعات کامل هر فیلم و ذخیره آن
    for (const movie of moviesLimited) {
      try {
        console.log(`Fetching details for movie: ${movie.title} (ID: ${movie.id})`);
        const movieDetails = await tmdbService.getMovieDetails(movie.id, DEFAULT_LANGUAGE);
        await saveMovie(movieDetails);
      } catch (error) {
        console.error(`Error processing movie ${movie.title}:`, error);
      }
    }
    
    console.log(`Imported ${TOTAL_MOVIES} popular movies successfully.`);
  } catch (error) {
    console.error("Error importing popular movies:", error);
  }
}

/**
 * دریافت و ذخیره سریال‌های محبوب
 */
async function importPopularTVSeries(): Promise<void> {
  try {
    console.log(`Importing ${TOTAL_TV_SERIES} popular TV series...`);
    
    // استفاده از /discover/tv برای فیلترینگ سریال‌ها
    // این متد باید به TMDBService اضافه شود
    const response = await tmdbService.discoverTV({
      sort_by: 'popularity.desc',
      vote_average_gte: 7, // حداقل امتیاز 7
      vote_count_gte: 500 // حداقل 500 رأی داشته باشد
    }, 1, DEFAULT_LANGUAGE);
    
    if (!response.results || response.results.length === 0) {
      console.log("No popular TV series found.");
      return;
    }
    
    // محدود کردن به تعداد مورد نظر
    const seriesLimited = response.results.slice(0, TOTAL_TV_SERIES);
    console.log(`Found ${seriesLimited.length} TV series, importing...`);
    
    // دریافت اطلاعات کامل هر سریال و ذخیره آن
    for (const series of seriesLimited) {
      try {
        console.log(`Fetching details for TV series: ${series.name} (ID: ${series.id})`);
        const seriesDetails = await tmdbService.getTVSeriesDetails(series.id, DEFAULT_LANGUAGE);
        await saveTVSeries(seriesDetails);
      } catch (error) {
        console.error(`Error processing TV series ${series.name}:`, error);
      }
    }
    
    console.log(`Imported ${TOTAL_TV_SERIES} popular TV series successfully.`);
  } catch (error) {
    console.error("Error importing popular TV series:", error);
  }
}

/**
 * دریافت و ذخیره مستندها
 */
async function importDocumentaries(): Promise<void> {
  try {
    console.log(`Importing ${TOTAL_DOCUMENTARIES} documentaries...`);
    
    // استفاده از discover با فیلتر ژانر مستند
    const response = await tmdbService.discoverMovies({
      sort_by: 'popularity.desc',
      with_genres: '99', // ژانر مستند
      vote_average_gte: 7, // حداقل امتیاز 7
      vote_count_gte: 300 // حداقل 300 رأی داشته باشد
    }, 1, DEFAULT_LANGUAGE);
    
    if (!response.results || response.results.length === 0) {
      console.log("No documentaries found.");
      return;
    }
    
    // محدود کردن به تعداد مورد نظر
    const docsLimited = response.results.slice(0, TOTAL_DOCUMENTARIES);
    console.log(`Found ${docsLimited.length} documentaries, importing...`);
    
    // دریافت اطلاعات کامل هر مستند و ذخیره آن
    for (const doc of docsLimited) {
      try {
        console.log(`Fetching details for documentary: ${doc.title} (ID: ${doc.id})`);
        const docDetails = await tmdbService.getMovieDetails(doc.id, DEFAULT_LANGUAGE);
        await saveDocumentary(docDetails);
      } catch (error) {
        console.error(`Error processing documentary ${doc.title}:`, error);
      }
    }
    
    console.log(`Imported ${TOTAL_DOCUMENTARIES} documentaries successfully.`);
  } catch (error) {
    console.error("Error importing documentaries:", error);
  }
}

/**
 * تابع اصلی برای اجرای اسکریپت
 */
async function main() {
  try {
    console.log("Starting TMDB content import...");
    
    // اتصال به پایگاه داده MongoDB
    await connectToMongoDB();
    console.log("Connected to MongoDB.");
    
    // وارد کردن فیلم‌ها
    await importPopularMovies();
    
    // وارد کردن سریال‌ها
    await importPopularTVSeries();
    
    // وارد کردن مستندها
    await importDocumentaries();
    
    console.log("Content import completed successfully!");
  } catch (error) {
    console.error("Error in main import process:", error);
  } finally {
    // بستن اتصال به پایگاه داده
    setTimeout(() => {
      mongoose.connection.close();
      console.log("MongoDB connection closed.");
      process.exit(0);
    }, 1000);
  }
}

// اجرای اسکریپت
main();