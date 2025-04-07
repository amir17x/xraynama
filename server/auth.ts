import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import nodemailer from "nodemailer";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);
// تنظیمات MailerSend API (نگه‌داری شده برای سازگاری)
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
});

// استفاده مستقیم از API MailerSend بدون استفاده از SMTP
// ترنسپورتر Nodemailer برای پشتیبانی از کد قبلی (استفاده نمی‌شود)
const transporter = nodemailer.createTransport({
  jsonTransport: true // استفاده از ترنسپورتر JSON برای تست (ایمیل‌ها ارسال نمی‌شوند)
});

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
      // استفاده از API MailerSend برای ارسال ایمیل
      const sender = new Sender("no-reply@mailersend.net", "XrayNama");
      const recipients = [new Recipient(email)];
      
      const emailParams = new EmailParams()
        .setFrom(sender)
        .setTo(recipients)
        .setSubject("کد تایید برای بازیابی رمز عبور")
        .setHtml(htmlContent)
        .setText(textContent);
      
      const response = await mailerSend.email.send(emailParams);
      console.log("Verification email sent successfully:", response);
      return true;
    } catch (mailerSendError) {
      console.error("Error sending email with MailerSend API:", mailerSendError);
      
      // اگر با API MailerSend نتوانستیم ایمیل بفرستیم، از Nodemailer برای تست استفاده می‌کنیم
      // که البته در حالت jsonTransport فقط لاگ می‌شود و ارسال نمی‌شود
      try {
        const info = await transporter.sendMail({
          from: '"XrayNama" <no-reply@mailersend.net>',
          to: email,
          subject: "کد تایید برای بازیابی رمز عبور",
          text: textContent,
          html: htmlContent
        });
        
        console.log("Email logged but not sent (using JSON transport):", info);
      } catch (nodemailerError) {
        console.error("Also failed with Nodemailer:", nodemailerError);
      }
      
      // خطا را به عنوان false برمی‌گردانیم، اما کد را در کنسول نمایش می‌دهیم
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
      // استفاده از API MailerSend برای ارسال ایمیل
      const sender = new Sender("no-reply@mailersend.net", "XrayNama");
      const recipients = [new Recipient(email)];
      
      const emailParams = new EmailParams()
        .setFrom(sender)
        .setTo(recipients)
        .setSubject("تایید تغییر رمز عبور")
        .setHtml(htmlContent)
        .setText(textContent);
      
      const response = await mailerSend.email.send(emailParams);
      console.log("Password change confirmation email sent successfully:", response);
      return true;
    } catch (mailerSendError) {
      console.error("Error sending email with MailerSend API:", mailerSendError);
      
      // اگر با API MailerSend نتوانستیم ایمیل بفرستیم، از Nodemailer برای تست استفاده می‌کنیم
      // که البته در حالت jsonTransport فقط لاگ می‌شود و ارسال نمی‌شود
      try {
        const info = await transporter.sendMail({
          from: '"XrayNama" <no-reply@mailersend.net>',
          to: email,
          subject: "تایید تغییر رمز عبور",
          text: textContent,
          html: htmlContent
        });
        
        console.log("Password change confirmation email logged (using JSON transport):", info);
      } catch (nodemailerError) {
        console.error("Also failed with Nodemailer:", nodemailerError);
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

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
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
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({ message: "نام کاربری یا رمز عبور اشتباه است" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json(user);
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
    res.json(req.user);
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
