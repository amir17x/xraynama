import mongoose from 'mongoose';
import { connectToMongoDB } from './db/mongo';
import { Content, Genre, Tag, ContentGenre, ContentTag, Video } from './models/mongoose';

// Sample movie data
const movies = [
  {
    type: 'movie',
    title: 'پرستیژ',
    englishTitle: 'The Prestige',
    description: 'دو شعبده‌باز رقیب در لندن اواخر قرن نوزدهم تلاش می‌کنند تا بهترین تردستی را ارائه دهند و در این راه به مبارزه خطرناکی کشیده می‌شوند.',
    year: 2006,
    duration: 130,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjA4NDI0MTIxNF5BMl5BanBnXkFtZTYwNTM0MzY2._V1_.jpg',
    backdrop: 'https://images.hdqwalls.com/wallpapers/the-prestige-wide.jpg',
    imdbRating: '8.5'
  },
  {
    type: 'movie',
    title: 'تلقین',
    englishTitle: 'Inception',
    description: 'یک دزد ماهر که در هنر استخراج اطلاعات حیاتی از ناخودآگاه افراد متخصص است، با پیشنهاد عجیبی روبرو می‌شود...',
    year: 2010,
    duration: 148,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
    backdrop: 'https://wallpapercave.com/wp/wp1916447.jpg',
    imdbRating: '8.8'
  },
  {
    type: 'movie',
    title: 'میان ستاره‌ای',
    englishTitle: 'Interstellar',
    description: 'در آینده‌ای که زمین رو به نابودی است، گروهی از فضانوردان سفری را از طریق یک کرم‌چاله آغاز می‌کنند تا به دنبال سیاره‌ای قابل سکونت برای بشریت بگردند.',
    year: 2014,
    duration: 169,
    poster: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
    backdrop: 'https://wallpapercave.com/wp/wp1890837.jpg',
    imdbRating: '8.6'
  }
];

// Sample TV series data
const series = [
  {
    type: 'series',
    title: 'بریکینگ بد',
    englishTitle: 'Breaking Bad',
    description: 'یک معلم شیمی دبیرستان پس از تشخیص سرطان، تصمیم می‌گیرد برای تأمین آینده خانواده‌اش به تولید و فروش متامفتامین روی آورد.',
    year: 2008,
    duration: 45,
    poster: 'https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDQ1LWFjMjMtNjA5ZDdiYjdiODU5XkEyXkFqcGdeQXVyMTMzNDExODE5._V1_.jpg',
    backdrop: 'https://wallpaperaccess.com/full/781822.jpg',
    imdbRating: '9.5'
  },
  {
    type: 'series',
    title: 'بازی تاج و تخت',
    englishTitle: 'Game of Thrones',
    description: 'چندین خاندان قدرتمند در سرزمینی افسانه‌ای برای تصاحب تاج و تخت آهنین با یکدیگر مبارزه می‌کنند.',
    year: 2011,
    duration: 60,
    poster: 'https://m.media-amazon.com/images/M/MV5BYTRiNDQwYzAtMzVlZS00NTI5LWJjYjUtMzkwNTUzMWMxZTllXkEyXkFqcGdeQXVyNDIzMzcwNjc@._V1_.jpg',
    backdrop: 'https://wallpapercave.com/wp/wp3978132.jpg',
    imdbRating: '9.2'
  }
];

// Sample animation data
const animations = [
  {
    type: 'animation',
    title: 'روح',
    englishTitle: 'Soul',
    description: 'یک معلم موسیقی که رویای نوازندگی در کلوپ‌های جاز را دارد، قبل از رسیدن به هدفش دچار حادثه می‌شود و روحش به دنیای دیگری منتقل می‌شود.',
    year: 2020,
    duration: 100,
    poster: 'https://m.media-amazon.com/images/M/MV5BZGE1MDg5M2MtNTkyZS00MTY5LTg1YzUtZTlhZmM1Y2EwNmFmXkEyXkFqcGdeQXVyNjA3OTI0MDc@._V1_.jpg',
    backdrop: 'https://wallpapercave.com/wp/wp8213562.jpg',
    imdbRating: '8.0'
  },
  {
    type: 'animation',
    title: 'داستان اسباب‌بازی',
    englishTitle: 'Toy Story',
    description: 'اسباب‌بازی‌های یک پسربچه زندگی مخفیانه‌ای دارند و با ورود اسباب‌بازی جدیدی به نام "باز لایتیر" ماجراهای جدیدی را تجربه می‌کنند.',
    year: 1995,
    duration: 81,
    poster: 'https://m.media-amazon.com/images/M/MV5BMDU2ZWJlMjktMTRhMy00ZTA5LWEzNDgtYmNmZTEwZTViZWJkXkEyXkFqcGdeQXVyNDQ2OTk4MzI@._V1_.jpg',
    backdrop: 'https://wallpapercave.com/wp/wp3616752.jpg',
    imdbRating: '8.3'
  }
];

// Sample documentary data
const documentaries = [
  {
    type: 'documentary',
    title: 'سیاره زمین',
    englishTitle: 'Planet Earth',
    description: 'این مستند طبیعت به بررسی زیستگاه‌های مختلف و تنوع حیات در کره زمین می‌پردازد.',
    year: 2006,
    duration: 550,
    poster: 'https://m.media-amazon.com/images/M/MV5BNmZlYzIzMTItY2EzYS00YTEyLTg0ZjEtMDMzZjM3ODdhN2UzXkEyXkFqcGdeQXVyNjI0MDg2NzE@._V1_.jpg',
    backdrop: 'https://wallpaperaccess.com/full/1442021.jpg',
    imdbRating: '9.4'
  },
  {
    type: 'documentary',
    title: 'سیزدهمین',
    englishTitle: 'The 13th',
    description: 'این مستند به بررسی سیستم زندان‌های آمریکا و نژادپرستی نهادینه در آن می‌پردازد.',
    year: 2016,
    duration: 100,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjAwMjU5NTAzOF5BMl5BanBnXkFtZTgwMjQwODQxMDI@._V1_.jpg',
    backdrop: 'https://s3.documentcloud.org/documents/3673134/The13th-FB-1200x674.jpg',
    imdbRating: '8.2'
  }
];

// Genres
const genres = [
  { name: 'اکشن', slug: 'action' },
  { name: 'درام', slug: 'drama' },
  { name: 'علمی تخیلی', slug: 'sci-fi' },
  { name: 'جنایی', slug: 'crime' },
  { name: 'ماجراجویی', slug: 'adventure' },
  { name: 'کمدی', slug: 'comedy' },
  { name: 'مستند', slug: 'documentary' },
  { name: 'انیمیشن', slug: 'animation' },
  { name: 'خانوادگی', slug: 'family' },
  { name: 'تاریخی', slug: 'history' }
];

// Tags
const tags = [
  { name: 'برنده اسکار', slug: 'oscar-winner' },
  { name: 'زمان', slug: 'time' },
  { name: 'فضا', slug: 'space' },
  { name: 'ذهن', slug: 'mind' },
  { name: 'خانواده', slug: 'family' },
  { name: 'طبیعت', slug: 'nature' },
  { name: 'سرطان', slug: 'cancer' },
  { name: 'مواد مخدر', slug: 'drugs' },
  { name: 'قدرت', slug: 'power' },
  { name: 'جادو', slug: 'magic' }
];

// Video URLs for streaming and download
const videoUrls = {
  '480p': 'https://example.com/videos/480p/',
  '720p': 'https://example.com/videos/720p/',
  '1080p': 'https://example.com/videos/1080p/'
};

// Content-Genre mapping
const contentGenreMap = {
  'The Prestige': ['drama', 'sci-fi', 'mystery'],
  'Inception': ['action', 'sci-fi', 'adventure'],
  'Interstellar': ['drama', 'sci-fi', 'adventure'],
  'Breaking Bad': ['drama', 'crime', 'thriller'],
  'Game of Thrones': ['drama', 'action', 'adventure'],
  'Soul': ['animation', 'family', 'comedy'],
  'Toy Story': ['animation', 'family', 'adventure'],
  'Planet Earth': ['documentary', 'nature'],
  'The 13th': ['documentary', 'history', 'crime']
};

// Content-Tag mapping
const contentTagMap = {
  'The Prestige': ['magic', 'mind'],
  'Inception': ['mind', 'time'],
  'Interstellar': ['space', 'time'],
  'Breaking Bad': ['cancer', 'drugs'],
  'Game of Thrones': ['power'],
  'Soul': ['family', 'mind'],
  'Toy Story': ['family'],
  'Planet Earth': ['nature'],
  'The 13th': ['power', 'history']
};

// Function to seed database
async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Connect to MongoDB
    await connectToMongoDB();

    // Clear collections
    console.log('Clearing existing data...');
    await Content.deleteMany({});
    await Genre.deleteMany({});
    await Tag.deleteMany({});
    await ContentGenre.deleteMany({});
    await ContentTag.deleteMany({});
    await Video.deleteMany({});

    // Insert genres
    console.log('Adding genres...');
    const createdGenres = await Genre.insertMany(genres);
    const genreMap = new Map();
    createdGenres.forEach(genre => {
      genreMap.set(genre.slug, genre._id);
    });

    // Insert tags
    console.log('Adding tags...');
    const createdTags = await Tag.insertMany(tags);
    const tagMap = new Map();
    createdTags.forEach(tag => {
      tagMap.set(tag.slug, tag._id);
    });

    // Combine all content
    const allContent = [...movies, ...series, ...animations, ...documentaries];
    
    // Insert content
    console.log('Adding content...');
    const contentPromises = allContent.map(async (contentItem) => {
      const newContent = await Content.create(contentItem);
      
      // Add videos for this content
      const qualities = ['480p', '720p', '1080p'];
      const videoPromises = qualities.map(quality => {
        return Video.create({
          contentId: newContent._id,
          quality: quality,
          streamUrl: `${videoUrls[quality]}${contentItem.englishTitle.toLowerCase().replace(/\s+/g, '-')}/stream.mp4`,
          downloadUrl: `${videoUrls[quality]}${contentItem.englishTitle.toLowerCase().replace(/\s+/g, '-')}/download.mp4`,
          size: quality === '480p' ? 500 : quality === '720p' ? 1000 : 2000
        });
      });
      await Promise.all(videoPromises);
      
      // Add content-genre associations
      const genreSlugs = contentGenreMap[contentItem.englishTitle] || [];
      const contentGenrePromises = genreSlugs.map(slug => {
        if (genreMap.has(slug)) {
          return ContentGenre.create({
            contentId: newContent._id,
            genreId: genreMap.get(slug)
          });
        }
        return Promise.resolve();
      });
      await Promise.all(contentGenrePromises);
      
      // Add content-tag associations
      const tagSlugs = contentTagMap[contentItem.englishTitle] || [];
      const contentTagPromises = tagSlugs.map(slug => {
        if (tagMap.has(slug)) {
          return ContentTag.create({
            contentId: newContent._id,
            tagId: tagMap.get(slug)
          });
        }
        return Promise.resolve();
      });
      await Promise.all(contentTagPromises);
      
      return newContent;
    });
    
    await Promise.all(contentPromises);
    
    console.log('✅ Database seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// Execute seeding
seedDatabase();