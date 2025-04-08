import mongoose from 'mongoose';
import { connectToMongoDB } from './db/mongo';
import { Content, User, Review, Comment } from './models/mongoose';

// نمونه نقدها
const sampleReviews = [
  {
    title: 'شاهکاری از نولان',
    text: 'فیلم پرستیژ یکی از بهترین آثار کریستوفر نولان است که با پیچش‌های داستانی جذاب، مخاطب را تا آخر فیلم میخکوب می‌کند. بازی درخشان کریستین بیل و هیو جکمن ستودنی است.',
    score: 4.5,
    hasContainsSpoiler: false,
    isApproved: true,
    isRejected: false
  },
  {
    title: 'یک داستان ذهنی پیچیده',
    text: 'اینسپشن فیلمی است که ذهن شما را به چالش می‌کشد. لئوناردو دی‌کاپریو در این فیلم نقش خود را به خوبی ایفا کرده است. پایان فیلم به گونه‌ای است که می‌تواند تفسیرهای مختلفی داشته باشد و این موضوع باعث می‌شود تا مدت‌ها پس از تماشای فیلم، همچنان به آن فکر کنید.',
    score: 5,
    hasContainsSpoiler: true,
    isApproved: true,
    isRejected: false
  },
  {
    title: 'یک شاهکار علمی-تخیلی',
    text: 'میان‌ستاره‌ای فیلمی است که علاوه بر جنبه‌های علمی دقیق، لایه‌های احساسی عمیقی دارد. رابطه پدر و دختر در این فیلم بسیار تأثیرگذار است. موسیقی هانس زیمر نیز جان تازه‌ای به فیلم بخشیده است.',
    score: 4.8,
    hasContainsSpoiler: true,
    isApproved: true,
    isRejected: false
  },
  {
    title: 'دنیایی عمیق از اخلاق و قدرت',
    text: 'بریکینگ بد یکی از بهترین سریال‌های تاریخ است. والتر وایت یکی از پیچیده‌ترین شخصیت‌های تلویزیونی است که تحول او از یک معلم شیمی به یک قاچاقچی مواد مخدر، به خوبی به تصویر کشیده شده است.',
    score: 5,
    hasContainsSpoiler: false,
    isApproved: true,
    isRejected: false
  },
  {
    title: 'فراتر از یک انیمیشن',
    text: 'روح پیکسار تنها یک انیمیشن نیست، بلکه اثری فلسفی درباره معنای زندگی است. این فیلم به ما یادآوری می‌کند که گاهی آنقدر درگیر رؤیاهایمان می‌شویم که از لذت بردن از لحظات کوچک زندگی غافل می‌شویم.',
    score: 4.2,
    hasContainsSpoiler: false,
    isApproved: true,
    isRejected: false
  }
];

// نمونه نظرات
const sampleComments = [
  {
    text: 'پایان فیلم خیلی غافلگیرکننده بود!',
    isApproved: true,
    isRejected: false
  },
  {
    text: 'بازی بازیگران فوق‌العاده بود.',
    isApproved: true,
    isRejected: false
  },
  {
    text: 'موسیقی متن این فیلم یکی از بهترین موسیقی‌های متن تاریخ سینماست.',
    isApproved: true,
    isRejected: false
  },
  {
    text: 'تصویربرداری این فیلم بی‌نظیر است!',
    isApproved: true,
    isRejected: false
  },
  {
    text: 'این فصل از سریال واقعاً هیجان‌انگیز بود!',
    isApproved: true,
    isRejected: false
  }
];

async function seedSampleReviewsAndComments() {
  console.log('🌱 Starting sample reviews and comments seeding...');
  
  try {
    // اتصال به مونگو دی‌بی
    await connectToMongoDB();

    // دریافت تمام محتواها و کاربران
    const contents = await Content.find().limit(5);
    const users = await User.find().limit(3);
    
    if (contents.length === 0) {
      throw new Error('No content found. Please run the main seed script first.');
    }
    
    if (users.length === 0) {
      throw new Error('No users found. Please create some users first.');
    }

    console.log(`Found ${contents.length} contents and ${users.length} users to work with.`);

    // پاک کردن نقدها و نظرات قبلی
    await Review.deleteMany({});
    await Comment.deleteMany({});
    
    // ایجاد نقدها
    console.log('Adding sample reviews...');
    const reviewPromises = sampleReviews.map(async (review, index) => {
      const contentIndex = index % contents.length;
      const userIndex = index % users.length;
      
      return Review.create({
        contentId: contents[contentIndex]._id,
        userId: users[userIndex]._id,
        title: review.title,
        text: review.text,
        score: review.score,
        hasContainsSpoiler: review.hasContainsSpoiler,
        isApproved: review.isApproved,
        isRejected: review.isRejected,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    await Promise.all(reviewPromises);
    
    // ایجاد نظرات
    console.log('Adding sample comments...');
    const commentPromises = sampleComments.map(async (comment, index) => {
      const contentIndex = index % contents.length;
      const userIndex = index % users.length;
      
      return Comment.create({
        contentId: contents[contentIndex]._id,
        userId: users[userIndex]._id,
        text: comment.text,
        isApproved: comment.isApproved,
        isRejected: comment.isRejected,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    await Promise.all(commentPromises);
    
    console.log('✅ Sample reviews and comments seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding sample reviews and comments:', error);
  } finally {
    // بستن اتصال
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// اجرای سیدینگ
seedSampleReviewsAndComments();