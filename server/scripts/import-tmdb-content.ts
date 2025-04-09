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
const TOTAL_MOVIES = 30;
const TOTAL_TV_SERIES = 30;
const TOTAL_DOCUMENTARIES = 15;
const TOTAL_ANIMATIONS = 10;

// زبان پیش‌فرض
const DEFAULT_LANGUAGE = 'en-US';

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
    
    // دریافت اطلاعات بازیگران و کارگردان از credits
    let director = null;
    let actors: string[] = [];
    let country = null;
    let languages = null;
    
    // استخراج کارگردان از سازندگان (crew)
    if (movieDetails.credits && movieDetails.credits.crew) {
      const directors = movieDetails.credits.crew.filter((person: any) => person.job === 'Director');
      if (directors.length > 0) {
        director = directors.map((d: any) => d.name).join(', ');
      }
    }
    
    // استخراج بازیگران از گروه بازیگران (cast)
    if (movieDetails.credits && movieDetails.credits.cast) {
      actors = movieDetails.credits.cast
        .slice(0, 10) // محدود به 10 بازیگر اصلی
        .map((actor: any) => actor.name);
    }
    
    // استخراج کشور تولید
    if (movieDetails.production_countries && movieDetails.production_countries.length > 0) {
      country = movieDetails.production_countries.map((c: any) => c.name).join(', ');
    }
    
    // استخراج زبان‌ها
    if (movieDetails.spoken_languages && movieDetails.spoken_languages.length > 0) {
      languages = movieDetails.spoken_languages.map((l: any) => l.name || l.english_name).join(', ');
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
      director: director,
      actors: actors,
      country: country,
      languages: languages,
      hasPersianDubbing: false, // به صورت پیش‌فرض بدون دوبله فارسی
      hasPersianSubtitle: true, // به صورت پیش‌فرض با زیرنویس فارسی
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
    
    // دریافت اطلاعات بازیگران و سازندگان از credits
    let director = null;
    let actors: string[] = [];
    let country = null;
    let languages = null;
    
    // استخراج سازندگان و تهیه‌کنندگان (crew)
    if (tvDetails.credits && tvDetails.credits.crew) {
      const creators = tvDetails.credits.crew.filter((person: any) => 
        ['Creator', 'Executive Producer', 'Director'].includes(person.job)
      );
      if (creators.length > 0) {
        director = creators.map((d: any) => d.name).join(', ');
      }
    }
    
    // استخراج بازیگران از گروه بازیگران (cast)
    if (tvDetails.credits && tvDetails.credits.cast) {
      actors = tvDetails.credits.cast
        .slice(0, 10) // محدود به 10 بازیگر اصلی
        .map((actor: any) => actor.name);
    }
    
    // استخراج کشور تولید
    if (tvDetails.origin_country && tvDetails.origin_country.length > 0) {
      country = tvDetails.origin_country.join(', ');
    }
    
    // استخراج زبان‌ها
    if (tvDetails.languages && tvDetails.languages.length > 0) {
      languages = tvDetails.languages.join(', ');
    } else if (tvDetails.original_language) {
      languages = tvDetails.original_language;
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
      director: director,
      actors: actors,
      country: country,
      languages: languages,
      hasPersianDubbing: false, // به صورت پیش‌فرض بدون دوبله فارسی
      hasPersianSubtitle: true, // به صورت پیش‌فرض با زیرنویس فارسی
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
    
    // دریافت اطلاعات بازیگران و کارگردان از credits
    let director = null;
    let actors: string[] = [];
    let country = null;
    let languages = null;
    
    // استخراج کارگردان از سازندگان (crew)
    if (docDetails.credits && docDetails.credits.crew) {
      const directors = docDetails.credits.crew.filter((person: any) => 
        ['Director', 'Producer', 'Executive Producer'].includes(person.job)
      );
      if (directors.length > 0) {
        director = directors.map((d: any) => d.name).join(', ');
      }
    }
    
    // استخراج بازیگران از گروه بازیگران (cast)
    if (docDetails.credits && docDetails.credits.cast) {
      actors = docDetails.credits.cast
        .slice(0, 10) // محدود به 10 نفر اصلی
        .map((actor: any) => actor.name);
    }
    
    // استخراج کشور تولید
    if (docDetails.production_countries && docDetails.production_countries.length > 0) {
      country = docDetails.production_countries.map((c: any) => c.name).join(', ');
    }
    
    // استخراج زبان‌ها
    if (docDetails.spoken_languages && docDetails.spoken_languages.length > 0) {
      languages = docDetails.spoken_languages.map((l: any) => l.name || l.english_name).join(', ');
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
      director: director,
      actors: actors,
      country: country,
      languages: languages,
      hasPersianDubbing: false, // به صورت پیش‌فرض بدون دوبله فارسی
      hasPersianSubtitle: true, // به صورت پیش‌فرض با زیرنویس فارسی
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
    
    // یک آرایه از فیلترهای مختلف برای تنوع بیشتر
    const filters = [
      {
        sort_by: 'popularity.desc',
        vote_average_gte: 6, // حداقل امتیاز 6
        with_runtime_gte: 60, // حداقل 60 دقیقه باشد
        vote_count_gte: 200, // حداقل 200 رأی داشته باشد
        page: 1
      },
      {
        sort_by: 'popularity.desc',
        vote_average_gte: 7, // حداقل امتیاز 7
        with_runtime_gte: 60, // حداقل 60 دقیقه باشد
        vote_count_gte: 100, // حداقل 100 رأی داشته باشد
        page: 2
      },
      {
        sort_by: 'vote_average.desc',
        vote_average_gte: 7.5, // حداقل امتیاز 7.5
        with_runtime_gte: 60, // حداقل 60 دقیقه باشد
        vote_count_gte: 100, // حداقل 100 رأی داشته باشد
        page: 1
      },
      {
        sort_by: 'release_date.desc',
        vote_average_gte: 6, // حداقل امتیاز 6
        with_runtime_gte: 60, // حداقل 60 دقیقه باشد
        vote_count_gte: 50, // حداقل 50 رأی داشته باشد
        page: 1
      }
    ];

    let allMovies: any[] = [];
    
    // دریافت فیلم‌ها با استفاده از فیلترهای مختلف
    for (const filter of filters) {
      try {
        console.log(`Discovering movies with filter: ${JSON.stringify(filter)}...`);
        const { page, ...otherFilters } = filter;
        const response = await tmdbService.discoverMovies(otherFilters, page, DEFAULT_LANGUAGE);
        
        if (response.results && response.results.length > 0) {
          console.log(`Found ${response.results.length} movies with filter.`);
          allMovies = [...allMovies, ...response.results];
        }
      } catch (error) {
        console.error(`Error discovering movies with filter:`, error);
      }
    }
    
    // جلوگیری از تکرار فیلم‌ها
    const uniqueMovies = allMovies.filter((movie, index, self) =>
      index === self.findIndex((m) => m.id === movie.id)
    );
    
    // محدود کردن به تعداد مورد نظر
    const moviesLimited = uniqueMovies.slice(0, TOTAL_MOVIES);
    console.log(`Found ${moviesLimited.length} unique movies, importing...`);
    
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
    
    console.log(`Imported popular movies successfully.`);
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
    
    // یک آرایه از فیلترهای مختلف برای تنوع بیشتر سریال‌ها
    const filters = [
      {
        sort_by: 'popularity.desc',
        vote_average_gte: 7, // حداقل امتیاز 7
        vote_count_gte: 100, // حداقل 100 رأی داشته باشد
        page: 1
      },
      {
        sort_by: 'popularity.desc',
        vote_average_gte: 6, // حداقل امتیاز 6
        vote_count_gte: 50, // حداقل 50 رأی داشته باشد
        page: 2
      },
      {
        sort_by: 'vote_average.desc',
        vote_average_gte: 8, // حداقل امتیاز 8
        vote_count_gte: 50, // حداقل 50 رأی داشته باشد
        page: 1
      },
      {
        sort_by: 'first_air_date.desc',
        vote_average_gte: 6, // حداقل امتیاز 6
        vote_count_gte: 30, // حداقل 30 رأی داشته باشد
        page: 1
      }
    ];

    let allSeries: any[] = [];
    
    // دریافت سریال‌ها با استفاده از فیلترهای مختلف
    for (const filter of filters) {
      try {
        console.log(`Discovering TV series with filter: ${JSON.stringify(filter)}...`);
        const { page, ...otherFilters } = filter;
        const response = await tmdbService.discoverTV(otherFilters, page, DEFAULT_LANGUAGE);
        
        if (response.results && response.results.length > 0) {
          console.log(`Found ${response.results.length} TV series with filter.`);
          allSeries = [...allSeries, ...response.results];
        }
      } catch (error) {
        console.error(`Error discovering TV series with filter:`, error);
      }
    }
    
    // جلوگیری از تکرار سریال‌ها
    const uniqueSeries = allSeries.filter((series, index, self) =>
      index === self.findIndex((s) => s.id === series.id)
    );
    
    // محدود کردن به تعداد مورد نظر
    const seriesLimited = uniqueSeries.slice(0, TOTAL_TV_SERIES);
    console.log(`Found ${seriesLimited.length} unique TV series, importing...`);
    
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
    
    console.log(`Imported popular TV series successfully.`);
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
    
    // یک آرایه از فیلترهای مختلف برای تنوع بیشتر مستندها
    const filters = [
      {
        sort_by: 'popularity.desc',
        with_genres: '99', // ژانر مستند
        vote_average_gte: 7, // حداقل امتیاز 7
        vote_count_gte: 50, // حداقل 50 رأی داشته باشد
        page: 1
      },
      {
        sort_by: 'vote_average.desc',
        with_genres: '99', // ژانر مستند
        vote_average_gte: 7.5, // حداقل امتیاز 7.5
        vote_count_gte: 30, // حداقل 30 رأی داشته باشد
        page: 1
      },
      {
        sort_by: 'release_date.desc',
        with_genres: '99', // ژانر مستند
        vote_average_gte: 6, // حداقل امتیاز 6
        vote_count_gte: 30, // حداقل 30 رأی داشته باشد
        page: 1
      },
      {
        sort_by: 'popularity.desc',
        with_genres: '99', // ژانر مستند
        vote_average_gte: 6, // حداقل امتیاز 6
        vote_count_gte: 40, // حداقل 40 رأی داشته باشد
        page: 2
      }
    ];

    let allDocs: any[] = [];
    
    // دریافت مستندها با استفاده از فیلترهای مختلف
    for (const filter of filters) {
      try {
        console.log(`Discovering documentaries with filter: ${JSON.stringify(filter)}...`);
        const { page, ...otherFilters } = filter;
        const response = await tmdbService.discoverMovies(otherFilters, page, DEFAULT_LANGUAGE);
        
        if (response.results && response.results.length > 0) {
          console.log(`Found ${response.results.length} documentaries with filter.`);
          allDocs = [...allDocs, ...response.results];
        }
      } catch (error) {
        console.error(`Error discovering documentaries with filter:`, error);
      }
    }
    
    // جلوگیری از تکرار مستندها
    const uniqueDocs = allDocs.filter((doc, index, self) =>
      index === self.findIndex((d) => d.id === doc.id)
    );
    
    // محدود کردن به تعداد مورد نظر
    const docsLimited = uniqueDocs.slice(0, TOTAL_DOCUMENTARIES);
    console.log(`Found ${docsLimited.length} unique documentaries, importing...`);
    
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
    
    console.log(`Imported documentaries successfully.`);
  } catch (error) {
    console.error("Error importing documentaries:", error);
  }
}

/**
 * دریافت و ذخیره انیمیشن‌ها
 */
async function importAnimations(): Promise<void> {
  try {
    console.log(`Importing ${TOTAL_ANIMATIONS} animations...`);
    
    // یک آرایه از فیلترهای مختلف برای تنوع بیشتر انیمیشن‌ها
    const filters = [
      {
        sort_by: 'popularity.desc',
        with_genres: '16', // ژانر انیمیشن
        vote_average_gte: 7, // حداقل امتیاز 7
        vote_count_gte: 100, // حداقل 100 رأی داشته باشد
        page: 1
      },
      {
        sort_by: 'vote_average.desc',
        with_genres: '16', // ژانر انیمیشن
        vote_average_gte: 7.5, // حداقل امتیاز 7.5
        vote_count_gte: 50, // حداقل 50 رأی داشته باشد
        page: 1
      },
      {
        sort_by: 'release_date.desc',
        with_genres: '16', // ژانر انیمیشن
        vote_average_gte: 6.5, // حداقل امتیاز 6.5
        vote_count_gte: 40, // حداقل 40 رأی داشته باشد
        page: 1
      },
      {
        sort_by: 'popularity.desc',
        with_genres: '16', // ژانر انیمیشن
        with_original_language: 'ja', // انیمه ژاپنی
        vote_average_gte: 7, // حداقل امتیاز 7
        vote_count_gte: 50, // حداقل 50 رأی داشته باشد
        page: 1
      }
    ];

    let allAnimations: any[] = [];
    
    // دریافت انیمیشن‌ها با استفاده از فیلترهای مختلف
    for (const filter of filters) {
      try {
        console.log(`Discovering animations with filter: ${JSON.stringify(filter)}...`);
        const { page, ...otherFilters } = filter;
        const response = await tmdbService.discoverMovies(otherFilters, page, DEFAULT_LANGUAGE);
        
        if (response.results && response.results.length > 0) {
          console.log(`Found ${response.results.length} animations with filter.`);
          allAnimations = [...allAnimations, ...response.results];
        }
      } catch (error) {
        console.error(`Error discovering animations with filter:`, error);
      }
    }
    
    // جلوگیری از تکرار انیمیشن‌ها
    const uniqueAnimations = allAnimations.filter((anim, index, self) =>
      index === self.findIndex((a) => a.id === anim.id)
    );
    
    // محدود کردن به تعداد مورد نظر
    const animationsLimited = uniqueAnimations.slice(0, TOTAL_ANIMATIONS);
    console.log(`Found ${animationsLimited.length} unique animations, importing...`);
    
    // دریافت اطلاعات کامل هر انیمیشن و ذخیره آن
    for (const anim of animationsLimited) {
      try {
        console.log(`Fetching details for animation: ${anim.title} (ID: ${anim.id})`);
        const animDetails = await tmdbService.getMovieDetails(anim.id, DEFAULT_LANGUAGE);
        
        // تغییر نوع به انیمیشن
        await saveAnimation(animDetails);
      } catch (error) {
        console.error(`Error processing animation ${anim.title}:`, error);
      }
    }
    
    console.log(`Imported animations successfully.`);
  } catch (error) {
    console.error("Error importing animations:", error);
  }
}

/**
 * ذخیره انیمیشن در پایگاه داده
 */
async function saveAnimation(animDetails: any): Promise<void> {
  try {
    // بررسی وجود انیمیشن با همین شناسه TMDB
    const existingContent = await Content.findOne({ 
      englishTitle: animDetails.original_title
    });
    
    if (existingContent) {
      console.log(`Animation "${animDetails.title}" already exists, skipping...`);
      return;
    }
    
    // دریافت اطلاعات بازیگران و کارگردان از credits
    let director = null;
    let actors: string[] = [];
    let country = null;
    let languages = null;
    
    // استخراج کارگردان از سازندگان (crew)
    if (animDetails.credits && animDetails.credits.crew) {
      const directors = animDetails.credits.crew.filter((person: any) => 
        ['Director', 'Animation Director'].includes(person.job)
      );
      if (directors.length > 0) {
        director = directors.map((d: any) => d.name).join(', ');
      }
    }
    
    // استخراج بازیگران صداپیشه از گروه بازیگران (cast)
    if (animDetails.credits && animDetails.credits.cast) {
      actors = animDetails.credits.cast
        .slice(0, 10) // محدود به 10 بازیگر اصلی
        .map((actor: any) => actor.name);
    }
    
    // استخراج کشور تولید
    if (animDetails.production_countries && animDetails.production_countries.length > 0) {
      country = animDetails.production_countries.map((c: any) => c.name).join(', ');
    }
    
    // استخراج زبان‌ها
    if (animDetails.spoken_languages && animDetails.spoken_languages.length > 0) {
      languages = animDetails.spoken_languages.map((l: any) => l.name || l.english_name).join(', ');
    }
    
    // ایجاد محتوای جدید
    const content = new Content({
      type: 'animation',
      title: animDetails.title,
      englishTitle: animDetails.original_title,
      description: animDetails.overview || 'توضیحات موجود نیست',
      year: animDetails.release_date ? parseInt(animDetails.release_date.substring(0, 4)) : new Date().getFullYear(),
      duration: animDetails.runtime || 90, // مدت زمان پیش‌فرض 90 دقیقه
      poster: animDetails.poster_path || '',
      backdrop: animDetails.backdrop_path || null,
      imdbRating: animDetails.vote_average ? animDetails.vote_average.toString() : '0',
      director: director,
      actors: actors,
      country: country,
      languages: languages,
      hasPersianDubbing: false, // به صورت پیش‌فرض بدون دوبله فارسی
      hasPersianSubtitle: true, // به صورت پیش‌فرض با زیرنویس فارسی
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // ذخیره محتوا
    const savedContent = await content.save();
    console.log(`Animation "${savedContent.title}" saved to MongoDB.`);
    
    // ذخیره ژانرها
    if (animDetails.genres && animDetails.genres.length > 0) {
      const genrePromises = animDetails.genres.map(async (genre: any) => {
        try {
          const genreId = await getOrCreateGenre(genre.id);
          
          const contentGenre = new ContentGenre({
            contentId: savedContent._id,
            genreId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await contentGenre.save();
          console.log(`Genre ${genre.name} linked to animation "${savedContent.title}"`);
        } catch (error) {
          console.error(`Error linking genre ${genre.id} to animation "${savedContent.title}":`, error);
        }
      });
      
      await Promise.all(genrePromises);
    }
    
    // ایجاد تگ‌ها بر اساس زبان، کشور تولید و...
    const tags: string[] = [];
    
    // افزودن تگ برای انیمیشن
    tags.push('انیمیشن');
    
    // افزودن تگ بر اساس زبان اصلی
    if (animDetails.original_language) {
      tags.push(`زبان: ${animDetails.original_language}`);
      
      // تگ‌های ویژه برای انیمه‌ها
      if (animDetails.original_language === 'ja') {
        tags.push('انیمه');
      }
    }
    
    // افزودن تگ بر اساس کشور تولید
    if (animDetails.production_countries && animDetails.production_countries.length > 0) {
      animDetails.production_countries.forEach((country: any) => {
        tags.push(`کشور: ${country.name}`);
      });
    }
    
    // افزودن تگ بر اساس کمپانی تولید
    if (animDetails.production_companies && animDetails.production_companies.length > 0) {
      animDetails.production_companies.slice(0, 3).forEach((company: any) => {
        // تگ‌های ویژه برای استودیوهای معروف انیمیشن
        if (['Pixar', 'Disney', 'DreamWorks', 'Studio Ghibli', 'Illumination'].includes(company.name)) {
          tags.push(`استودیو: ${company.name}`);
        } else {
          tags.push(`کمپانی: ${company.name}`);
        }
      });
    }
    
    // افزودن تگ با توجه به امتیاز
    if (animDetails.vote_average) {
      if (animDetails.vote_average >= 8) {
        tags.push('برترین‌ها');
      } else if (animDetails.vote_average >= 7) {
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
          console.log(`Tag "${tagName}" linked to animation "${savedContent.title}"`);
        } catch (error) {
          console.error(`Error linking tag "${tagName}" to animation "${savedContent.title}":`, error);
        }
      });
      
      await Promise.all(tagPromises);
    }
  } catch (error) {
    console.error(`Error saving animation "${animDetails.title || 'Unknown'}":`, error);
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
    
    // وارد کردن انیمیشن‌ها
    await importAnimations();
    
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