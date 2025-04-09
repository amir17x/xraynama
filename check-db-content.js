/**
 * اسکریپت بررسی اطلاعات محتوا در پایگاه داده MongoDB
 */

import mongoose from 'mongoose';
import { connectToMongoDB } from './server/db/mongo.ts';
import { Content } from './server/models/mongoose.ts';

async function checkDatabaseContent() {
  try {
    console.log('=== بررسی محتوای پایگاه داده MongoDB ===');
    
    // اتصال به پایگاه داده MongoDB
    await connectToMongoDB();
    console.log("Connected to MongoDB.");
    
    // شمارش کل محتوا
    const totalContent = await Content.countDocuments();
    console.log(`Total content in database: ${totalContent}`);
    
    // شمارش به تفکیک نوع محتوا
    const contentByType = await Content.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('Content by type:');
    contentByType.forEach(item => {
      console.log(`- ${item._id}: ${item.count}`);
    });
    
    // نمایش 5 مورد از هر نوع محتوا
    const contentTypes = ['movie', 'series', 'documentary', 'animation'];
    
    for (const type of contentTypes) {
      const contents = await Content.find({ type }).sort({ createdAt: -1 }).limit(5);
      console.log(`\nRecent ${type}s:`);
      
      contents.forEach(content => {
        console.log(`- ${content.title} (${content.englishTitle}) - Year: ${content.year}`);
      });
    }
    
  } catch (error) {
    console.error("Error checking database content:", error);
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
checkDatabaseContent();