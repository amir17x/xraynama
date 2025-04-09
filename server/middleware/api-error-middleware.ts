import { Request, Response, NextFunction } from 'express';

/**
 * میدلور رهگیری خطاهای API و تبدیل پاسخ‌های HTML به JSON
 * 
 * این میدلور برای موارد زیر استفاده می‌شود:
 * 1. رهگیری درخواست‌های API (که با '/api/' شروع می‌شوند)
 * 2. بررسی اینکه اگر پاسخ HTML بود، آن را با خطای JSON جایگزین کند
 * 3. اطمینان از اینکه پاسخ‌های API همیشه JSON هستند
 */
export function apiErrorMiddleware(req: Request, res: Response, next: NextFunction) {
  // کپی متد اصلی res.send برای کد ما
  const originalSend = res.send;
  
  // فقط درخواست‌های API را بررسی کنیم
  if (req.originalUrl.startsWith('/api/')) {
    // جایگزینی تابع res.send برای بررسی نوع محتوا
    res.send = function(body: any) {
      // اگر جسم یک رشته است و شبیه HTML به نظر می‌رسد
      if (typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
        console.error(`[API ERROR] درخواست ${req.originalUrl} یک پاسخ HTML به جای JSON برگرداند.`);
        
        // تنظیم status code به 500 اگر هنوز ارسال نشده است
        if (!res.headersSent) {
          res.status(500);
        }
        
        // تنظیم نوع محتوا به JSON
        res.setHeader('Content-Type', 'application/json');
        
        // ارسال خطا به فرمت JSON
        return originalSend.call(res, JSON.stringify({
          error: 'Internal Server Error',
          message: 'API returned HTML instead of JSON. This may be due to a routing issue or an unhandled server error.',
          requestUrl: req.originalUrl,
          requestMethod: req.method
        }));
      }
      
      // در غیر این صورت، رفتار عادی res.send را حفظ کنیم
      return originalSend.call(res, body);
    };
  }
  
  next();
}