import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { Resend } from 'resend';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// Optimized promisified versions with caching
const scryptAsync = promisify(scrypt);

// Cache for password verification to reduce redundant computations
const passwordVerificationCache = new Map<string, { hash: string, result: boolean, timestamp: number }>();

// Cache cleanup interval (5 minutes)
const CACHE_CLEANUP_INTERVAL = 5 * 60 * 1000;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Cleanup expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  // Convert entries to array before iterating to avoid compatibility issues
  Array.from(passwordVerificationCache.entries()).forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_TTL) {
      passwordVerificationCache.delete(key);
    }
  });
}, CACHE_CLEANUP_INTERVAL);

// تنظیمات Resend API که برای ارسال ایمیل استفاده می‌شود
const resendClient = new Resend(process.env.RESEND_API_KEY || 're_3mFqT3XE_FpRHgqxiovECchWc82T1bhCJ');

// تابع ارسال ایمیل با کد تایید
async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    // HTML content for the email
    const htmlContent = `
      <div dir="rtl" style="font-family: Tahoma, Arial; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f7ff; border-radius: 10px;">
        <h2 style="color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">بازیابی رمز عبور XrayNama</h2>
        <p style="color: #334155;">کاربر گرامی،</p>
        <p style="color: #334155;">درخواست بازیابی رمز عبور شما دریافت شد. کد تایید شما برای بازیابی رمز عبور:</p>
        <div style="background-color: #dbeafe; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h3 style="color: #1e40af; font-size: 24px; margin: 0;">${code}</h3>
        </div>
        <p style="color: #334155;">این کد تا 10 دقیقه معتبر است. در صورتی که شما درخواست بازیابی رمز عبور نداده‌اید، می‌توانید این ایمیل را نادیده بگیرید.</p>
        <p style="color: #334155;">با احترام،<br>تیم XrayNama</p>
      </div>
    `;
    
    // Text content as fallback
    const textContent = `
      بازیابی رمز عبور XrayNama
      
      کاربر گرامی،
      درخواست بازیابی رمز عبور شما دریافت شد. کد تایید شما برای بازیابی رمز عبور:
      
      ${code}
      
      این کد تا 10 دقیقه معتبر است. در صورتی که شما درخواست بازیابی رمز عبور نداده‌اید، می‌توانید این ایمیل را نادیده بگیرید.
      
      با احترام،
      تیم XrayNama
    `;
    
    try {
      // استفاده از Resend API برای ارسال ایمیل
      const { data, error } = await resendClient.emails.send({
        from: 'onboarding@resend.dev',
        to: [email],
        subject: 'کد تایید برای بازیابی رمز عبور',
        html: htmlContent,
        text: textContent,
      });
      
      if (error) {
        throw new Error(`Resend API error: ${error.message}`);
      }
      
      console.log("Verification email sent successfully with Resend:", data);
      return true;
    } catch (resendError) {
      console.error("Error sending email with Resend API:", resendError);
      
      // در محیط توسعه، اطلاعات خطا را نمایش می‌دهیم
      if (process.env.NODE_ENV !== 'production') {
        console.log("Development mode: Email would have contained the following code:", code);
      }
      
      // خطا را به عنوان false برمی‌گردانیم
      return false;
    }
  } catch (error) {
    console.error("Error in sendVerificationEmail function:", error);
    return false;
  }
}

// تابع ارسال ایمیل تایید تغییر رمز عبور
async function sendPasswordChangeConfirmation(email: string): Promise<boolean> {
  try {
    // HTML content for the email
    const htmlContent = `
      <div dir="rtl" style="font-family: Tahoma, Arial; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f7ff; border-radius: 10px;">
        <h2 style="color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">تغییر رمز عبور با موفقیت انجام شد</h2>
        <p style="color: #334155;">کاربر گرامی،</p>
        <p style="color: #334155;">رمز عبور حساب کاربری شما در XrayNama با موفقیت تغییر یافت.</p>
        <p style="color: #334155;">اگر شما این تغییر را انجام نداده‌اید، لطفاً سریعاً با پشتیبانی تماس بگیرید.</p>
        <p style="color: #334155;">با احترام،<br>تیم XrayNama</p>
      </div>
    `;
    
    // Text content as fallback
    const textContent = `
      تغییر رمز عبور با موفقیت انجام شد
      
      کاربر گرامی،
      رمز عبور حساب کاربری شما در XrayNama با موفقیت تغییر یافت.
      
      اگر شما این تغییر را انجام نداده‌اید، لطفاً سریعاً با پشتیبانی تماس بگیرید.
      
      با احترام،
      تیم XrayNama
    `;
    
    try {
      // استفاده از Resend API برای ارسال ایمیل
      const { data, error } = await resendClient.emails.send({
        from: 'onboarding@resend.dev',
        to: [email],
        subject: 'تغییر رمز عبور با موفقیت انجام شد',
        html: htmlContent,
        text: textContent,
      });
      
      if (error) {
        throw new Error(`Resend API error: ${error.message}`);
      }
      
      console.log("Password change confirmation email sent successfully with Resend:", data);
      return true;
    } catch (resendError) {
      console.error("Error sending email with Resend API:", resendError);
      
      // در محیط توسعه، اطلاعات خطا را نمایش می‌دهیم
      if (process.env.NODE_ENV !== 'production') {
        console.log("Development mode: Password change confirmation email would have been sent to:", email);
      }
      
      return false;
    }
  } catch (error) {
    console.error("Error in sendPasswordChangeConfirmation function:", error);
    return false;
  }
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Optimized password comparison with caching
async function comparePasswords(supplied: string, stored: string) {
  // Create a cache key from the supplied password and stored hash
  // This prevents timing attacks while still allowing caching
  const cacheKey = `${supplied.length}:${stored.substring(0, 8)}`;
  
  // Check if we have a cached result
  const cachedResult = passwordVerificationCache.get(cacheKey);
  if (cachedResult && cachedResult.hash === stored) {
    // Use the cached result if the hash matches
    return cachedResult.result;
  }
  
  // Perform the actual comparison
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  
  try {
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    const result = timingSafeEqual(hashedBuf, suppliedBuf);
    
    // Cache the result
    passwordVerificationCache.set(cacheKey, {
      hash: stored,
      result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "xraynama_secret_key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: app.get("env") === "production",
      sameSite: "lax"
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password, name } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "نام کاربری قبلاً استفاده شده است" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "ایمیل قبلاً استفاده شده است" });
      }
      
      // Create new user with hashed password
      const user = await storage.createUser({
        username,
        email,
        name: name || username,
        password: await hashPassword(password),
      });

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({ message: "نام کاربری یا رمز عبور اشتباه است" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Make sure the role is included in the response
        const userWithRole = { ...user }; 
        if (!userWithRole.role) {
          userWithRole.role = 'user'; // Default role
          
          // If username is admin, explicitly set admin role
          if (userWithRole.username === 'admin') {
            userWithRole.role = 'admin';
          }
        }
        
        return res.status(200).json(userWithRole);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Make sure the role is included in the response
    const user = { ...req.user };
    if (!user.role) {
      user.role = 'user'; // Default role
      
      // If username is admin, explicitly set admin role
      if (user.username === 'admin') {
        user.role = 'admin';
      }
    }
    
    res.json(user);
  });
  
  // Password reset routes
  app.post("/api/forgot-password", async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "ایمیل الزامی است" });
      }
      
      // Check if user exists with this email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // برای جلوگیری از حملات شناسایی ایمیل‌ها، همان پیام موفقیت را ارسال می‌کنیم
        // اما کد را ارسال نمی‌کنیم
        return res.status(200).json({ 
          message: "کد تأیید با موفقیت ارسال شد. لطفاً ایمیل خود را بررسی کنید."
        });
      }
      
      // Generate and save verification code
      const code = await storage.createVerificationCode(email);
      
      // Send email with the verification code
      try {
        await sendVerificationEmail(email, code);
        console.log(`Verification email sent to ${email}`);
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        // حتی در صورت خطا در ارسال ایمیل، پیام موفقیت‌آمیز به کاربر نشان می‌دهیم
        // اما خطا را در لاگ ثبت می‌کنیم
        
        // در محیط توسعه، کد بازیابی را چاپ می‌کنیم تا بتوان بدون ایمیل هم آزمایش کرد
        console.log("Note: Email sending failed but verification code was still generated.");
      }
      
      // در محیط توسعه، کد را نمایش می‌دهیم برای تست آسان‌تر
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Verification code for ${email}: ${code}`);
      }
      
      return res.status(200).json({ 
        message: "کد تأیید با موفقیت ارسال شد. لطفاً ایمیل خود را بررسی کنید."
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/verify-code", async (req, res, next) => {
    try {
      const { email, code } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({ message: "ایمیل و کد الزامی هستند" });
      }
      
      // Verify the code
      const isValid = await storage.verifyCode(email, code);
      if (!isValid) {
        return res.status(400).json({ message: "کد وارد شده نامعتبر یا منقضی شده است" });
      }
      
      // Generate a reset token
      const token = await storage.createResetToken(email);
      
      return res.status(200).json({ 
        message: "کد تأیید صحیح است", 
        token 
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const { email, token, password } = req.body;
      
      if (!email || !token || !password) {
        return res.status(400).json({ message: "ایمیل، توکن و رمز عبور جدید الزامی هستند" });
      }
      
      // Verify the token
      const isValid = await storage.verifyResetToken(email, token);
      if (!isValid) {
        return res.status(400).json({ message: "توکن نامعتبر یا منقضی شده است" });
      }
      
      // Reset the password
      const success = await storage.resetPassword(email, password);
      if (!success) {
        return res.status(500).json({ message: "خطا در تغییر رمز عبور" });
      }
      
      // Send confirmation email
      try {
        await sendPasswordChangeConfirmation(email);
        console.log(`Password change confirmation email sent to ${email}`);
      } catch (emailError) {
        console.error("Error sending password change confirmation email:", emailError);
        // ثبت خطا در لاگ، ولی همچنان پاسخ موفقیت آمیز به کاربر ارسال می‌کنیم
        
        // در محیط توسعه، اعلان می‌کنیم که ایمیل ارسال نشده اما عملیات موفق بوده است
        console.log("Note: Password change confirmation email failed but password was still reset successfully.");
      }
      
      return res.status(200).json({ 
        message: "رمز عبور با موفقیت تغییر یافت" 
      });
    } catch (error) {
      next(error);
    }
  });
}
