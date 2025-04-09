/**
 * اسکریپت اجرای وارد کردن محتوا از TMDB API به MongoDB
 */

import { execSync } from 'child_process';

console.log('=== شروع واردسازی محتوا از TMDB API به MongoDB ===');
console.log('این اسکریپت فیلم‌ها، سریال‌ها، مستندها و انیمیشن‌های محبوب را از TMDB دریافت و به پایگاه داده MongoDB وارد می‌کند.');
console.log('لطفاً منتظر بمانید...');
console.log('');

try {
  // اجرای اسکریپت TypeScript با TSX
  console.log('در حال اجرای اسکریپت import-tmdb-content.ts...');
  execSync('npx tsx server/scripts/import-tmdb-content.ts', { stdio: 'inherit' });
  
  console.log('');
  console.log('=== واردسازی محتوا با موفقیت انجام شد ===');
  console.log('اکنون می‌توانید برنامه را اجرا کنید و محتوای وارد شده را مشاهده نمایید.');
} catch (error) {
  console.error('خطا در اجرای اسکریپت واردسازی:', error.message);
  console.error('لطفاً اطمینان حاصل کنید که:');
  console.error('1. به اینترنت متصل هستید');
  console.error('2. کلید API معتبر TMDB در متغیرهای محیطی تنظیم شده است');
  console.error('3. اتصال MongoDB برقرار است');
  process.exit(1);
}