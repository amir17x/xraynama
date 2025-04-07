import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

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
        return res.status(404).json({ message: "کاربری با این ایمیل وجود ندارد" });
      }
      
      // Generate and save verification code
      const code = await storage.createVerificationCode(email);
      
      // In a real application, we would send an email with the code here
      // For demo purposes, we'll just return a success message and log the code
      console.log(`Verification code for ${email}: ${code}`);
      
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
      
      return res.status(200).json({ 
        message: "رمز عبور با موفقیت تغییر یافت" 
      });
    } catch (error) {
      next(error);
    }
  });
}
