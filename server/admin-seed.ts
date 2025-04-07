import dotenv from 'dotenv';
import { MemStorage, hashPassword } from './storage';

dotenv.config();

// دستیابی به نوع ذخیره‌سازی استفاده شده در سیستم
async function seedAdminUser() {
  console.log('Starting admin user seeding...');
  
  try {
    // ایجاد یک نمونه از ذخیره‌سازی
    const storage = new MemStorage();
    
    // بررسی اینکه آیا کاربر ادمین قبلاً وجود دارد یا نه
    const existingAdmin = await storage.getUserByUsername('admin');
    
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping creation.');
    } else {
      // رمز عبور رو هش می‌کنیم
      const hashedPassword = await hashPassword('admin123');
      
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
        console.log('Password: admin123');
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