import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupAdminRoutes } from "./admin";
import { User } from '@shared/schema';

export async function registerRoutes(app: Express): Promise<Server> {
  // ===================================
  // عمومی API های
  // ===================================
  
  // Health check endpoint - fast response to verify server is alive
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: Date.now() });
  });
  
  // Set up authentication routes
  setupAuth(app);
  
  // Set up admin routes
  setupAdminRoutes(app);

  // ===================================
  // API های محتوا
  // ===================================

  // دریافت همه محتوا
  app.get("/api/content", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const content = await storage.getAllContent(limit, offset);
      res.json(content);
    } catch (error) {
      next(error);
    }
  });

  // دریافت جدیدترین محتوا
  app.get("/api/content/latest", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const content = await storage.getLatestContent(limit);
      res.json(content);
    } catch (error) {
      next(error);
    }
  });

  // دریافت محتوای با امتیاز بالا
  app.get("/api/content/top-rated", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const content = await storage.getTopRatedContent(limit);
      res.json(content);
    } catch (error) {
      next(error);
    }
  });

  // دریافت محتوای پیشنهادی با هوش مصنوعی
  app.get("/api/content/recommended", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const userId = req.user ? (req.user as User).id : null;
      
      const content = await storage.getRecommendedContent(userId, limit);
      res.json(content);
    } catch (error) {
      console.error("Error getting recommended content:", error);
      next(error);
    }
  });

  // دریافت محتوا بر اساس نوع
  app.get("/api/content/types/:type", async (req, res, next) => {
    try {
      const type = req.params.type;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      // تایید مقادیر ممکن برای نوع محتوا
      const validTypes = ['movie', 'series', 'animation', 'documentary'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ 
          error: "نوع محتوا نامعتبر است", 
          validTypes,
          message: "لطفاً یک نوع محتوای معتبر وارد کنید."
        });
      }
      
      const content = await storage.getContentByType(type, limit, offset);
      res.json(content);
    } catch (error) {
      next(error);
    }
  });

  // دریافت محتوا بر اساس ژانر
  app.get("/api/content/genres/:genre-slug", async (req, res, next) => {
    try {
      const genreSlug = req.params['genre-slug'];
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      // ابتدا ژانر را بر اساس اسلاگ پیدا می‌کنیم
      const genre = await storage.getGenreBySlug(genreSlug);
      
      if (!genre) {
        return res.status(404).json({ message: "ژانر مورد نظر یافت نشد" });
      }
      
      const content = await storage.getContentByGenre(genre.id, limit, offset);
      res.json(content);
    } catch (error) {
      next(error);
    }
  });

  // جستجوی محتوا
  app.get("/api/content/search", async (req, res, next) => {
    try {
      const query = req.query.query as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ message: "عبارت جستجو الزامی است" });
      }
      
      const content = await storage.searchContent(query, limit, offset);
      res.json(content);
    } catch (error) {
      next(error);
    }
  });

  // دریافت جزئیات یک محتوای خاص
  app.get("/api/content/:id", async (req, res, next) => {
    try {
      const contentId = parseInt(req.params.id);
      const content = await storage.getContentById(contentId);
      
      if (!content) {
        return res.status(404).json({ message: "محتوا یافت نشد" });
      }
      
      // Get additional content data
      const [genres, tags, videos] = await Promise.all([
        storage.getGenresByContentId(contentId),
        storage.getTagsByContentId(contentId),
        storage.getVideosByContentId(contentId)
      ]);
      
      // If it's a series, get seasons and episodes
      let seasons = [];
      if (content.type === 'series') {
        seasons = await storage.getSeasonsByContentId(contentId);
        
        // For each season, get episodes
        for (const season of seasons) {
          const episodes = await storage.getEpisodesBySeasonId(season.id);
          (season as any).episodes = episodes;
          
          // For each episode, get videos
          for (const episode of episodes) {
            const episodeVideos = await storage.getVideosByEpisodeId(episode.id);
            (episode as any).videos = episodeVideos;
          }
        }
      }
      
      // Get ratings info
      const ratings = await storage.getRatingsByContentId(contentId);
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length 
        : 0;
      
      // Get user specific data if authenticated
      let userRating = null;
      let isInWatchlist = false;
      let isInFavorites = false;
      
      if (req.isAuthenticated()) {
        const userId = req.user!.id;
        [userRating, isInWatchlist, isInFavorites] = await Promise.all([
          storage.getUserRatingForContent(userId, contentId),
          storage.isInWatchlist(userId, contentId),
          storage.isInFavorites(userId, contentId)
        ]);
      }
      
      res.json({
        ...content,
        genres,
        tags,
        videos,
        seasons,
        ratings: {
          average: avgRating,
          count: ratings.length,
          userRating
        },
        userInteractions: {
          isInWatchlist,
          isInFavorites
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // دریافت محتواهای مشابه با محتوای فعلی
  app.get("/api/content/:id/similar", async (req, res, next) => {
    try {
      const contentId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      const content = await storage.getSimilarContent(contentId, limit);
      res.json(content);
    } catch (error) {
      console.error(`Error getting similar content for ID ${req.params.id}:`, error);
      next(error);
    }
  });

  // جستجوی محتوا با استفاده از اسلاگ (عنوان تبدیل شده به URL)
  app.get("/api/content/slug/:slug", async (req, res, next) => {
    try {
      const slug = req.params.slug;
      const content = await storage.getContentBySlug(slug);
      
      if (!content) {
        return res.status(404).json({ message: "محتوا یافت نشد" });
      }
      
      res.json(content);
    } catch (error) {
      next(error);
    }
  });

  // ===================================
  // API های تعامل با محتوا
  // ===================================

  // دریافت نظرات یک محتوا
  app.get("/api/content/:id/interactions/comments", async (req, res, next) => {
    try {
      const contentId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const [comments, total] = await Promise.all([
        storage.getCommentsByContentId(contentId, limit, offset),
        storage.countCommentsByContentId(contentId)
      ]);
      
      // دریافت اطلاعات کاربر برای هر نظر
      const commentsWithUser = await Promise.all(comments.map(async (comment) => {
        const user = await storage.getUserById(comment.userId);
        return {
          ...comment,
          user: user ? {
            id: user.id,
            username: user.username,
            avatar: user.avatar
          } : null
        };
      }));
      
      res.json({
        comments: commentsWithUser,
        total,
        page: Math.floor(offset / limit) + 1,
        pages: Math.ceil(total / limit)
      });
    } catch (error) {
      next(error);
    }
  });

  // ثبت نظر جدید برای یک محتوا
  app.post("/api/content/:id/interactions/comments", async (req, res, next) => {
    try {
      // بررسی اعتبارسنجی کاربر
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
      }
      
      const contentId = parseInt(req.params.id);
      const userId = req.user!.id;
      const { text } = req.body;
      
      // بررسی داده‌های ورودی
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: "متن نظر الزامی است" });
      }
      
      // ایجاد نظر جدید
      const newComment = await storage.createComment({
        text,
        contentId,
        userId,
        isApproved: true // پیش‌فرض تایید شده
      });
      
      // دریافت اطلاعات کاربر
      const user = await storage.getUserById(userId);
      
      // ارسال پاسخ
      res.status(201).json({
        ...newComment,
        user: {
          id: user!.id,
          username: user!.username,
          avatar: user!.avatar
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // دریافت نقدهای یک محتوا
  app.get("/api/content/:id/interactions/reviews", async (req, res, next) => {
    try {
      const contentId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const [reviews, total] = await Promise.all([
        storage.getReviewsByContentId(contentId, limit, offset),
        storage.countReviewsByContentId(contentId)
      ]);
      
      // دریافت اطلاعات کاربر برای هر نقد
      const reviewsWithUser = await Promise.all(reviews.map(async (review) => {
        const user = await storage.getUserById(review.userId);
        return {
          ...review,
          user: user ? {
            id: user.id,
            username: user.username,
            avatar: user.avatar
          } : null
        };
      }));
      
      res.json({
        reviews: reviewsWithUser,
        total,
        page: Math.floor(offset / limit) + 1,
        pages: Math.ceil(total / limit)
      });
    } catch (error) {
      next(error);
    }
  });

  // ثبت نقد جدید برای یک محتوا
  app.post("/api/content/:id/interactions/reviews", async (req, res, next) => {
    try {
      // بررسی اعتبارسنجی کاربر
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
      }
      
      const contentId = parseInt(req.params.id);
      const userId = req.user!.id;
      const { text } = req.body;
      
      // بررسی داده‌های ورودی
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: "متن نقد الزامی است" });
      }
      
      // بررسی اینکه آیا کاربر قبلاً نقدی برای این محتوا ثبت کرده است یا خیر
      const existingReview = await storage.getReviewByUserAndContent(userId, contentId);
      if (existingReview) {
        return res.status(400).json({ 
          message: "شما قبلاً برای این محتوا نقد ثبت کرده‌اید", 
          existingReview
        });
      }
      
      // ایجاد نقد جدید
      const newReview = await storage.createReview({
        text,
        contentId,
        userId,
        isApproved: false // نقدها نیاز به تایید دارند
      });
      
      // دریافت اطلاعات کاربر
      const user = await storage.getUserById(userId);
      
      // ارسال پاسخ
      res.status(201).json({
        ...newReview,
        user: {
          id: user!.id,
          username: user!.username,
          avatar: user!.avatar
        }
      });
    } catch (error) {
      next(error);
    }
  });

  // امتیازدهی به محتوا
  app.post("/api/content/:id/interactions/rating", async (req, res, next) => {
    try {
      // بررسی اعتبارسنجی کاربر
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
      }
      
      const contentId = parseInt(req.params.id);
      const userId = req.user!.id;
      const { score } = req.body;
      
      // بررسی داده‌های ورودی
      if (score === undefined || score < 1 || score > 10 || !Number.isInteger(score)) {
        return res.status(400).json({ 
          message: "امتیاز باید عددی صحیح بین 1 تا 10 باشد" 
        });
      }
      
      // ایجاد یا به‌روزرسانی امتیاز
      let rating = await storage.getRatingByUserAndContent(userId, contentId);
      
      if (rating) {
        // به‌روزرسانی امتیاز موجود
        rating = await storage.updateRating(rating.id, { score });
      } else {
        // ایجاد امتیاز جدید
        rating = await storage.createRating({
          userId,
          contentId,
          score
        });
      }
      
      // محاسبه میانگین امتیازها
      const ratings = await storage.getRatingsByContentId(contentId);
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length 
        : 0;
      
      res.json({
        rating,
        average: avgRating,
        count: ratings.length
      });
    } catch (error) {
      next(error);
    }
  });

  // ===================================
  // API های کاربر
  // ===================================

  // دریافت اطلاعات کاربر فعلی
  app.get("/api/users/me", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
      }
      
      const userId = req.user!.id;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "کاربر یافت نشد" });
      }
      
      // حذف فیلدهای حساس
      const { password, ...userInfo } = user;
      
      res.json(userInfo);
    } catch (error) {
      next(error);
    }
  });

  // دریافت لیست تماشای کاربر
  app.get("/api/users/me/watchlist", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
      }
      
      const userId = req.user!.id;
      const watchlist = await storage.getWatchlist(userId);
      
      res.json(watchlist);
    } catch (error) {
      next(error);
    }
  });

  // افزودن محتوا به لیست تماشا
  app.post("/api/users/me/watchlist", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
      }
      
      const userId = req.user!.id;
      const { contentId } = req.body;
      
      if (!contentId) {
        return res.status(400).json({ message: "شناسه محتوا الزامی است" });
      }
      
      // بررسی وجود محتوا
      const content = await storage.getContentById(contentId);
      if (!content) {
        return res.status(404).json({ message: "محتوای مورد نظر یافت نشد" });
      }
      
      // بررسی اینکه آیا محتوا قبلاً در لیست تماشا وجود دارد یا خیر
      const isInWatchlist = await storage.isInWatchlist(userId, contentId);
      
      if (isInWatchlist) {
        return res.status(400).json({ message: "این محتوا قبلاً در لیست تماشای شما وجود دارد" });
      }
      
      // افزودن به لیست تماشا
      await storage.addToWatchlist(userId, contentId);
      
      res.status(201).json({ message: "محتوا با موفقیت به لیست تماشا اضافه شد" });
    } catch (error) {
      next(error);
    }
  });

  // حذف محتوا از لیست تماشا
  app.delete("/api/users/me/watchlist/:contentId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
      }
      
      const userId = req.user!.id;
      const contentId = parseInt(req.params.contentId);
      
      // حذف از لیست تماشا
      await storage.removeFromWatchlist(userId, contentId);
      
      res.json({ message: "محتوا با موفقیت از لیست تماشا حذف شد" });
    } catch (error) {
      next(error);
    }
  });

  // دریافت محتواهای مورد علاقه کاربر
  app.get("/api/users/me/favorites", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
      }
      
      const userId = req.user!.id;
      const favorites = await storage.getFavorites(userId);
      
      res.json(favorites);
    } catch (error) {
      next(error);
    }
  });

  // افزودن محتوا به علاقه‌مندی‌ها
  app.post("/api/users/me/favorites", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
      }
      
      const userId = req.user!.id;
      const { contentId } = req.body;
      
      if (!contentId) {
        return res.status(400).json({ message: "شناسه محتوا الزامی است" });
      }
      
      // بررسی وجود محتوا
      const content = await storage.getContentById(contentId);
      if (!content) {
        return res.status(404).json({ message: "محتوای مورد نظر یافت نشد" });
      }
      
      // بررسی اینکه آیا محتوا قبلاً در علاقه‌مندی‌ها وجود دارد یا خیر
      const isInFavorites = await storage.isInFavorites(userId, contentId);
      
      if (isInFavorites) {
        return res.status(400).json({ message: "این محتوا قبلاً در لیست علاقه‌مندی‌های شما وجود دارد" });
      }
      
      // افزودن به علاقه‌مندی‌ها
      await storage.addToFavorites(userId, contentId);
      
      res.status(201).json({ message: "محتوا با موفقیت به لیست علاقه‌مندی‌ها اضافه شد" });
    } catch (error) {
      next(error);
    }
  });

  // حذف محتوا از علاقه‌مندی‌ها
  app.delete("/api/users/me/favorites/:contentId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
      }
      
      const userId = req.user!.id;
      const contentId = parseInt(req.params.contentId);
      
      // حذف از علاقه‌مندی‌ها
      await storage.removeFromFavorites(userId, contentId);
      
      res.json({ message: "محتوا با موفقیت از لیست علاقه‌مندی‌ها حذف شد" });
    } catch (error) {
      next(error);
    }
  });

  // دریافت تاریخچه تماشا
  app.get("/api/users/me/history", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
      }
      
      const userId = req.user!.id;
      const history = await storage.getHistory(userId);
      
      res.json(history);
    } catch (error) {
      next(error);
    }
  });

  // افزودن محتوا به تاریخچه تماشا
  app.post("/api/users/me/history", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
      }
      
      const userId = req.user!.id;
      const { contentId, progress, timestamp } = req.body;
      
      if (!contentId) {
        return res.status(400).json({ message: "شناسه محتوا الزامی است" });
      }
      
      // بررسی وجود محتوا
      const content = await storage.getContentById(contentId);
      if (!content) {
        return res.status(404).json({ message: "محتوای مورد نظر یافت نشد" });
      }
      
      // ایجاد یا به‌روزرسانی سابقه تماشا
      const historyData = {
        userId,
        contentId,
        progress: progress || 0,
        timestamp: timestamp || new Date()
      };
      
      await storage.addToHistory(historyData);
      
      res.status(201).json({ message: "سابقه تماشا با موفقیت ثبت شد" });
    } catch (error) {
      next(error);
    }
  });

  // دریافت پلی‌لیست‌های کاربر
  app.get("/api/users/me/playlists", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
      }
      
      const userId = req.user!.id;
      const playlists = await storage.getPlaylistsByUserId(userId);
      
      res.json(playlists);
    } catch (error) {
      next(error);
    }
  });

  // ===================================
  // API های پلی‌لیست
  // ===================================

  // دریافت جزئیات یک پلی‌لیست
  app.get("/api/playlists/:id", async (req, res, next) => {
    try {
      const playlistId = parseInt(req.params.id);
      const playlist = await storage.getPlaylistById(playlistId);
      
      if (!playlist) {
        return res.status(404).json({ message: "پلی‌لیست یافت نشد" });
      }
      
      // بررسی دسترسی کاربر به پلی‌لیست خصوصی
      if (!playlist.isPublic && (!req.isAuthenticated() || req.user!.id !== playlist.userId)) {
        return res.status(403).json({ message: "شما به این پلی‌لیست دسترسی ندارید" });
      }
      
      // دریافت آیتم‌های پلی‌لیست
      const items = await storage.getPlaylistItems(playlistId);
      
      // دریافت اطلاعات کاربر سازنده
      const user = await storage.getUserById(playlist.userId);
      
      res.json({
        ...playlist,
        items,
        creator: user ? {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        } : null
      });
    } catch (error) {
      next(error);
    }
  });

  // ایجاد پلی‌لیست جدید
  app.post("/api/playlists", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
      }
      
      const userId = req.user!.id;
      const { title, description, isPublic = false } = req.body;
      
      if (!title || title.trim().length === 0) {
        return res.status(400).json({ message: "عنوان پلی‌لیست الزامی است" });
      }
      
      // ایجاد پلی‌لیست جدید
      const newPlaylist = await storage.createPlaylist({
        title,
        description: description || "",
        userId,
        isPublic: !!isPublic
      });
      
      res.status(201).json(newPlaylist);
    } catch (error) {
      next(error);
    }
  });

  // افزودن محتوا به پلی‌لیست
  app.post("/api/playlists/:id/items", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
      }
      
      const playlistId = parseInt(req.params.id);
      const userId = req.user!.id;
      const { contentId } = req.body;
      
      if (!contentId) {
        return res.status(400).json({ message: "شناسه محتوا الزامی است" });
      }
      
      // بررسی وجود پلی‌لیست و مالکیت آن
      const playlist = await storage.getPlaylistById(playlistId);
      
      if (!playlist) {
        return res.status(404).json({ message: "پلی‌لیست یافت نشد" });
      }
      
      if (playlist.userId !== userId) {
        return res.status(403).json({ message: "شما مالک این پلی‌لیست نیستید" });
      }
      
      // بررسی وجود محتوا
      const content = await storage.getContentById(contentId);
      if (!content) {
        return res.status(404).json({ message: "محتوای مورد نظر یافت نشد" });
      }
      
      // بررسی اینکه آیا محتوا قبلاً در پلی‌لیست وجود دارد یا خیر
      const isInPlaylist = await storage.isContentInPlaylist(playlistId, contentId);
      
      if (isInPlaylist) {
        return res.status(400).json({ message: "این محتوا قبلاً در پلی‌لیست وجود دارد" });
      }
      
      // افزودن به پلی‌لیست
      await storage.addToPlaylist(playlistId, contentId);
      
      res.status(201).json({ message: "محتوا با موفقیت به پلی‌لیست اضافه شد" });
    } catch (error) {
      next(error);
    }
  });

  // حذف محتوا از پلی‌لیست
  app.delete("/api/playlists/:id/items/:contentId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
      }
      
      const playlistId = parseInt(req.params.id);
      const contentId = parseInt(req.params.contentId);
      const userId = req.user!.id;
      
      // بررسی وجود پلی‌لیست و مالکیت آن
      const playlist = await storage.getPlaylistById(playlistId);
      
      if (!playlist) {
        return res.status(404).json({ message: "پلی‌لیست یافت نشد" });
      }
      
      if (playlist.userId !== userId) {
        return res.status(403).json({ message: "شما مالک این پلی‌لیست نیستید" });
      }
      
      // حذف از پلی‌لیست
      await storage.removeFromPlaylist(playlistId, contentId);
      
      res.json({ message: "محتوا با موفقیت از پلی‌لیست حذف شد" });
    } catch (error) {
      next(error);
    }
  });

  // ===================================
  // API های کمکی
  // ===================================

  // دریافت لیست ژانرها
  app.get("/api/genres", async (req, res, next) => {
    try {
      const genres = await storage.getAllGenres();
      res.json(genres);
    } catch (error) {
      next(error);
    }
  });

  // دریافت لیست تگ‌ها
  app.get("/api/tags", async (req, res, next) => {
    try {
      const tags = await storage.getAllTags();
      res.json(tags);
    } catch (error) {
      next(error);
    }
  });

  // ===================================
  // TMDB API ها
  // ===================================

  // دریافت فیلم‌های محبوب TMDB
  app.get("/api/tmdb/movies/popular", async (req, res, next) => {
    try {
      const { tmdbService } = await import('./tmdb-service');
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      
      const movies = await tmdbService.getPopularMovies(page, limit);
      res.json(movies);
    } catch (error) {
      console.error("Error fetching popular movies from TMDB:", error);
      res.status(500).json({ 
        error: "خطا در دریافت فیلم‌های محبوب", 
        message: "متأسفانه در حال حاضر امکان دریافت فیلم‌های محبوب وجود ندارد. لطفاً بعداً دوباره تلاش کنید."
      });
    }
  });

  // دریافت جزئیات فیلم از TMDB
  app.get("/api/tmdb/movies/:id", async (req, res, next) => {
    try {
      const { tmdbService } = await import('./tmdb-service');
      const movieId = parseInt(req.params.id);
      
      if (isNaN(movieId)) {
        return res.status(400).json({ 
          error: "شناسه فیلم نامعتبر است", 
          message: "لطفاً یک شناسه فیلم معتبر وارد کنید."
        });
      }
      
      const movieDetails = await tmdbService.getMovieDetails(movieId);
      res.json(movieDetails);
    } catch (error) {
      console.error(`Error fetching movie details from TMDB for ID ${req.params.id}:`, error);
      res.status(500).json({ 
        error: "خطا در دریافت جزئیات فیلم", 
        message: "متأسفانه در حال حاضر امکان دریافت جزئیات فیلم وجود ندارد. لطفاً بعداً دوباره تلاش کنید."
      });
    }
  });

  // جستجوی فیلم در TMDB
  app.get("/api/tmdb/search/movies", async (req, res, next) => {
    try {
      const { tmdbService } = await import('./tmdb-service');
      const query = req.query.query as string;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ 
          error: "عبارت جستجو الزامی است",
          message: "لطفاً یک عبارت جستجو وارد کنید." 
        });
      }
      
      const searchResults = await tmdbService.searchMovies(query, page);
      res.json(searchResults);
    } catch (error) {
      console.error(`Error searching movies from TMDB:`, error);
      res.status(500).json({ 
        error: "خطا در جستجوی فیلم‌ها", 
        message: "متأسفانه در حال حاضر امکان جستجوی فیلم‌ها وجود ندارد. لطفاً بعداً دوباره تلاش کنید."
      });
    }
  });

  // جستجوی یکپارچه در TMDB
  app.get("/api/tmdb/search/unified", async (req, res, next) => {
    try {
      const { tmdbService } = await import('./tmdb-service');
      const query = req.query.query as string || '';
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const externalId = req.query.external_id as string;
      const externalSource = req.query.external_source as string || 'imdb_id';
      
      // استخراج فیلترهای موجود برای روش discover
      const filters: any = {};
      
      if (req.query.sort_by) filters.sort_by = req.query.sort_by as string;
      if (req.query.primary_release_year) filters.primary_release_year = parseInt(req.query.primary_release_year as string);
      if (req.query.with_genres) {
        const genresStr = req.query.with_genres as string;
        if (genresStr.includes(',')) {
          filters.with_genres = genresStr.split(',').map(g => parseInt(g.trim()));
        } else {
          filters.with_genres = [parseInt(genresStr)];
        }
      }
      
      if (req.query.with_people) {
        const peopleStr = req.query.with_people as string;
        if (peopleStr.includes(',')) {
          filters.with_people = peopleStr.split(',').map(p => parseInt(p.trim()));
        } else {
          filters.with_people = [parseInt(peopleStr)];
        }
      }
      
      if (req.query.vote_average_gte) filters.vote_average_gte = parseFloat(req.query.vote_average_gte as string);
      if (req.query.vote_average_lte) filters.vote_average_lte = parseFloat(req.query.vote_average_lte as string);
      if (req.query.with_runtime_gte) filters.with_runtime_gte = parseInt(req.query.with_runtime_gte as string);
      if (req.query.with_runtime_lte) filters.with_runtime_lte = parseInt(req.query.with_runtime_lte as string);
      
      // جستجوی جامع
      const searchResults = await tmdbService.searchAllContent(
        query, 
        filters,
        externalId,
        externalSource,
        page
      );
      
      res.json(searchResults);
    } catch (error) {
      console.error(`Error in unified TMDB search:`, error);
      res.status(500).json({ 
        error: "خطا در جستجوی جامع", 
        message: "متأسفانه در حال حاضر امکان جستجوی جامع وجود ندارد. لطفاً بعداً دوباره تلاش کنید."
      });
    }
  });

  // کشف فیلم‌ها با فیلتر در TMDB
  app.get("/api/tmdb/discover/movies", async (req, res, next) => {
    try {
      const { tmdbService } = await import('./tmdb-service');
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      
      // استخراج پارامترهای فیلتر از query
      const options: any = {};
      
      if (req.query.sort_by) options.sort_by = req.query.sort_by as string;
      if (req.query.primary_release_year) options.primary_release_year = parseInt(req.query.primary_release_year as string);
      
      // پارامترهای با فرمت آرایه که با کاما جدا شده‌اند
      if (req.query.with_genres) {
        const genresStr = req.query.with_genres as string;
        if (genresStr.includes(',')) {
          options.with_genres = genresStr.split(',').map(g => parseInt(g.trim()));
        } else {
          options.with_genres = [parseInt(genresStr)];
        }
      }
      
      if (req.query.with_people) {
        const peopleStr = req.query.with_people as string;
        if (peopleStr.includes(',')) {
          options.with_people = peopleStr.split(',').map(p => parseInt(p.trim()));
        } else {
          options.with_people = [parseInt(peopleStr)];
        }
      }
      
      // پارامترهای عددی
      if (req.query.vote_average_gte) options.vote_average_gte = parseFloat(req.query.vote_average_gte as string);
      if (req.query.vote_average_lte) options.vote_average_lte = parseFloat(req.query.vote_average_lte as string);
      if (req.query.with_runtime_gte) options.with_runtime_gte = parseInt(req.query.with_runtime_gte as string);
      if (req.query.with_runtime_lte) options.with_runtime_lte = parseInt(req.query.with_runtime_lte as string);
      
      const discoverResults = await tmdbService.discoverMovies(options, page);
      res.json(discoverResults);
    } catch (error) {
      console.error(`Error discovering movies from TMDB:`, error);
      res.status(500).json({ 
        error: "خطا در کشف فیلم‌ها با فیلتر", 
        message: "متأسفانه در حال حاضر امکان کشف فیلم‌ها با فیلترهای انتخابی وجود ندارد. لطفاً بعداً دوباره تلاش کنید."
      });
    }
  });

  // یافتن محتوا با شناسه خارجی (IMDb، etc.)
  app.get("/api/tmdb/find/:external-id", async (req, res, next) => {
    try {
      const { tmdbService } = await import('./tmdb-service');
      const externalId = req.params['external-id'];
      const externalSource = req.query.external_source as string || 'imdb_id';
      
      if (!externalId || externalId.trim().length === 0) {
        return res.status(400).json({ 
          error: "شناسه خارجی الزامی است",
          message: "لطفاً یک شناسه خارجی معتبر وارد کنید." 
        });
      }
      
      // بررسی اعتبار منبع خارجی
      const validSources = ['imdb_id', 'tvdb_id', 'facebook_id', 'twitter_id', 'instagram_id'];
      if (!validSources.includes(externalSource)) {
        return res.status(400).json({ 
          error: "منبع خارجی نامعتبر است",
          validSources,
          message: "لطفاً یک منبع خارجی معتبر وارد کنید."
        });
      }
      
      const findResults = await tmdbService.findByExternalId(externalId, externalSource);
      res.json(findResults);
    } catch (error) {
      console.error(`Error finding content by external ID ${req.params['external-id']}:`, error);
      res.status(500).json({ 
        error: "خطا در جستجوی محتوا با شناسه خارجی", 
        message: "متأسفانه در حال حاضر امکان جستجوی محتوا با شناسه خارجی وجود ندارد. لطفاً بعداً دوباره تلاش کنید."
      });
    }
  });

  // آمار کش TMDB
  app.get("/api/tmdb/cache/stats", async (req, res, next) => {
    try {
      const { tmdbService } = await import('./tmdb-service');
      const { tmdbCacheService } = await import('./tmdb-cache-service');
      const stats = await tmdbCacheService.getCacheStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting TMDB cache stats:", error);
      res.status(500).json({ 
        error: "خطا در دریافت آمار کش TMDB", 
        message: "متأسفانه در حال حاضر امکان دریافت آمار کش TMDB وجود ندارد. لطفاً بعداً دوباره تلاش کنید."
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}