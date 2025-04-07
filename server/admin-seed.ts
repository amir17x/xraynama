import dotenv from 'dotenv';
import { hashPassword, storage } from './storage';
import { MongoDBStorage } from './db/mongodb-storage';

dotenv.config();

// دستیابی به نوع ذخیره‌سازی استفاده شده در سیستم
async function seedAdminUser() {
  console.log('Starting admin user seeding...');
  
  try {
    // اتصال به MongoDB اگر تنظیم شده باشد
    const useMongoDb = process.env.MONGODB_URI ? true : false;
    if (useMongoDb) {
      const mongoDBStorage = new MongoDBStorage();
      await mongoDBStorage.init();
      console.log('Connected to MongoDB for admin seeding');
      
      // جایگزینی مرجع storage با پیاده‌سازی MongoDB
      Object.setPrototypeOf(storage, mongoDBStorage);
      
      // کپی متدها به شیء storage
      for (const key of Object.getOwnPropertyNames(MongoDBStorage.prototype)) {
        if (key !== 'constructor') {
          (storage as any)[key] = (mongoDBStorage as any)[key];
        }
      }
      
      // کپی ویژگی‌ها از نمونه MongoDB storage
      for (const key of Object.getOwnPropertyNames(mongoDBStorage)) {
        if (key !== 'constructor') {
          (storage as any)[key] = (mongoDBStorage as any)[key];
        }
      }
    }
    
    // بررسی اینکه آیا کاربر ادمین قبلاً وجود دارد یا نه
    const existingAdmin = await storage.getUserByUsername('admin');
    
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping creation.');
    } else {
      // رمز عبور رو هش می‌کنیم
      const hashedPassword = await hashPassword('admin1234');
      
      // کاربر ادمین رو می‌سازیم
      const adminUser = {
        username: 'admin',
        email: 'admin@xraynama.com',
        password: hashedPassword,
        role: 'admin' as const,
        name: 'مدیر سیستم',
        avatar: null
      };
      
      // کاربر رو به دیتابیس اضافه می‌کنیم
      const result = await storage.createUser(adminUser);
      
      if (result) {
        console.log('Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: admin1234');
        console.log(result);
      } else {
        console.error('Failed to create admin user');
      }
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

// اجرای اسکریپت
seedAdminUser().catch(console.error);