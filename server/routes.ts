import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupAdminRoutes } from "./admin";
import { User } from '@shared/schema';

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Set up admin routes
  setupAdminRoutes(app);

  // Content routes
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

  app.get("/api/content/latest", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const content = await storage.getLatestContent(limit);
      res.json(content);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/content/top-rated", async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const content = await storage.getTopRatedContent(limit);
      res.json(content);
    } catch (error) {
      next(error);
    }
  });

  // Content recommendation routes with AI
  app.get("/api/content/recommended", async (req, res, next) => {
    try {
      // دریافت توصیه‌های محتوا با هوش مصنوعی
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const userId = req.user ? (req.user as User).id : null;
      
      const content = await storage.getRecommendedContent(userId, limit);
      res.json(content);
    } catch (error) {
      console.error("Error getting recommended content:", error);
      next(error);
    }
  });
  
  app.get("/api/content/:id/similar", async (req, res, next) => {
    try {
      // دریافت محتواهای مشابه با محتوای فعلی با هوش مصنوعی
      const contentId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      const content = await storage.getSimilarContent(contentId, limit);
      res.json(content);
    } catch (error) {
      console.error(`Error getting similar content for ID ${req.params.id}:`, error);
      next(error);
    }
  });
  
  // API برای دریافت سریال‌های به‌روز شده
  app.get("/api/series", async (req, res, next) => {
    try {
      // دریافت محتواهایی که نوع آن‌ها سریال است
      const series = await storage.getContentByType('series', 20, 0);
      
      // تبدیل داده‌ها به فرمت مورد نیاز کامپوننت
      const seriesList = series.map(item => {
        // تعیین اینکه آیا سریال قسمت جدید دارد یا خیر (برای مثال، اگر کمتر از 7 روز از انتشار گذشته باشد)
        const latestEpisodeDate = item.updatedAt || item.createdAt || new Date();
        const daysSinceRelease = Math.floor((Date.now() - new Date(latestEpisodeDate).getTime()) / (1000 * 60 * 60 * 24));
        
        const networkMapping: any = {
          'netflix': 'نتفلیکس',
          'hulu': 'هولو',
          'amazon': 'آمازون',
          'hbo': 'اچ‌بی‌او',
          'apple': 'اپل تی‌وی+'
        };
        
        // تولید اطلاعات قسمت و فصل به صورت تصادفی برای نمونه
        const season = Math.floor(Math.random() * 5) + 1;
        const episode = Math.floor(Math.random() * 10) + 1;
        
        return {
          id: item.id.toString(),
          title: item.title,
          thumbnail: item.poster, // استفاده از پوستر به عنوان تصویر بندانگشتی
          network: item.network || networkMapping[item.country?.toLowerCase()] || 'ایران‌نما',
          networkLogo: `/logos/${item.network?.toLowerCase() || 'default'}.png`,
          description: `قسمت ${episode}، فصل ${season}`,
          latestEpisodeDate: latestEpisodeDate,
          hasNewEpisode: daysSinceRelease < 7, // نمایش به عنوان جدید اگر کمتر از 7 روز گذشته باشد
          url: `/content/${item.id}`
        };
      });
      
      // مرتب‌سازی بر اساس تاریخ انتشار آخرین قسمت
      const sortedSeriesList = seriesList.sort((a, b) => {
        return new Date(b.latestEpisodeDate).getTime() - new Date(a.latestEpisodeDate).getTime();
      });
      
      res.json(sortedSeriesList);
    } catch (error) {
      next(error);
    }
  });

  // جستجوی محتوا با استفاده از اسلاگ (عنوان انگلیسی)
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
        seasons: content.type === 'series' ? seasons : undefined,
        ratings: {
          count: ratings.length,
          averageScore: avgRating,
          userRating
        },
        isInWatchlist,
        isInFavorites
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/content/type/:type", async (req, res, next) => {
    try {
      const type = req.params.type;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      if (!['movie', 'series', 'animation', 'documentary'].includes(type)) {
        return res.status(400).json({ message: "نوع محتوا نامعتبر است" });
      }
      
      const content = await storage.getContentByType(type, limit, offset);
      res.json(content);
    } catch (error) {
      next(error);
    }
  });

  // Search route
  app.get("/api/search", async (req, res, next) => {
    try {
      const query = req.query.q as string || '';
      let filters: any = {};
      
      // Parse filters from query params
      if (req.query.type) filters.type = req.query.type;
      if (req.query.year_from || req.query.year_to) {
        filters.year = {};
        if (req.query.year_from) filters.year.from = parseInt(req.query.year_from as string);
        if (req.query.year_to) filters.year.to = parseInt(req.query.year_to as string);
      }
      if (req.query.min_rating) filters.minRating = parseFloat(req.query.min_rating as string);
      
      const results = await storage.searchContent(query, filters);
      res.json(results);
    } catch (error) {
      next(error);
    }
  });

  // Genres and tags routes
  app.get("/api/genres", async (req, res, next) => {
    try {
      const genres = await storage.getAllGenres();
      res.json(genres);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/tags", async (req, res, next) => {
    try {
      const tags = await storage.getAllTags();
      res.json(tags);
    } catch (error) {
      next(error);
    }
  });

  // Comments and reviews routes
  app.get("/api/content/:id/comments", async (req, res, next) => {
    try {
      // بررسی معتبر بودن ObjectId
      const contentId = req.params.id;
      
      // تایید اینکه آیا contentId یک ObjectId معتبر است
      const { isValidObjectId } = await import('mongoose');
      if (!isValidObjectId(contentId)) {
        return res.status(400).json({ message: "شناسه محتوا نامعتبر است" });
      }
      
      // دریافت نظرات با استفاده از storage
      const comments = await storage.getCommentsByContentId(contentId);
      
      // افزودن اطلاعات کاربر به هر نظر
      const commentsWithUserInfo = await Promise.all(
        comments.map(async (comment) => {
          // دریافت اطلاعات کاربر
          const user = await storage.getUserById(comment.userId);
          
          return {
            ...comment,
            userName: user ? user.name : 'کاربر ناشناس',
            userAvatar: user ? user.avatar : undefined
          };
        })
      );
      
      res.json(commentsWithUserInfo);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/content/:id/comments", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "برای ثبت نظر باید وارد شوید" });
      }
      
      const contentId = parseInt(req.params.id);
      const { text } = req.body;
      
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: "متن نظر نمی‌تواند خالی باشد" });
      }
      
      const comment = await storage.createComment({
        userId: req.user!.id,
        contentId,
        text,
        isApproved: false
      });
      
      res.status(201).json({
        ...comment,
        message: "نظر شما با موفقیت ثبت شد و پس از تایید نمایش داده خواهد شد"
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/content/:id/reviews", async (req, res, next) => {
    try {
      // بررسی معتبر بودن ObjectId
      const contentId = req.params.id;
      
      // تایید اینکه آیا contentId یک ObjectId معتبر است
      const { isValidObjectId } = await import('mongoose');
      if (!isValidObjectId(contentId)) {
        return res.status(400).json({ message: "شناسه محتوا نامعتبر است" });
      }
      
      // دریافت نقدها با استفاده از storage
      const reviews = await storage.getReviewsByContentId(contentId);
      
      // افزودن اطلاعات کاربر به هر نقد
      const reviewsWithUserInfo = await Promise.all(
        reviews.map(async (review) => {
          // دریافت اطلاعات کاربر
          const user = await storage.getUserById(review.userId);
          
          return {
            ...review,
            userName: user ? user.name : 'کاربر ناشناس',
            userAvatar: user ? user.avatar : undefined
          };
        })
      );
      
      res.json(reviewsWithUserInfo);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/content/:id/reviews", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "برای ثبت نقد باید وارد شوید" });
      }
      
      const contentId = parseInt(req.params.id);
      const { text, title, score, hasContainsSpoiler } = req.body;
      
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: "متن نقد نمی‌تواند خالی باشد" });
      }
      
      if (!title || title.trim().length === 0) {
        return res.status(400).json({ message: "عنوان نقد نمی‌تواند خالی باشد" });
      }
      
      // اطمینان از معتبر بودن امتیاز
      const validScore = parseFloat(score) || 5;
      if (validScore < 0 || validScore > 5) {
        return res.status(400).json({ message: "امتیاز باید عددی بین 0 تا 5 باشد" });
      }
      
      const review = await storage.createReview({
        userId: req.user!.id,
        contentId,
        title,
        text,
        score: validScore,
        hasContainsSpoiler: !!hasContainsSpoiler,
        isApproved: false,
        isRejected: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // دریافت اطلاعات کاربر برای پاسخ
      const user = await storage.getUserById(req.user!.id);
      
      res.status(201).json({
        ...review,
        userName: user ? user.name : 'کاربر ناشناس',
        userAvatar: user ? user.avatar : undefined,
        message: "نقد شما با موفقیت ثبت شد و پس از تایید نمایش داده خواهد شد"
      });
    } catch (error) {
      next(error);
    }
  });

  // Ratings route
  app.post("/api/content/:id/rate", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "برای امتیاز دادن باید وارد شوید" });
      }
      
      const contentId = parseInt(req.params.id);
      const { score } = req.body;
      
      if (typeof score !== 'number' || score < 1 || score > 10) {
        return res.status(400).json({ message: "امتیاز باید عددی بین 1 تا 10 باشد" });
      }
      
      // Check if user has already rated this content
      const existingRating = await storage.getUserRatingForContent(req.user!.id, contentId);
      
      let rating;
      if (existingRating) {
        // Update existing rating
        rating = await storage.updateRating(existingRating.id, score);
      } else {
        // Create new rating
        rating = await storage.createRating({
          userId: req.user!.id,
          contentId,
          score
        });
      }
      
      // Get updated average rating
      const allRatings = await storage.getRatingsByContentId(contentId);
      const avgRating = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;
      
      res.json({
        rating,
        averageScore: avgRating,
        count: allRatings.length
      });
    } catch (error) {
      next(error);
    }
  });

  // Watchlist routes
  app.get("/api/user/watchlist", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "برای مشاهده لیست تماشا باید وارد شوید" });
      }
      
      const watchlist = await storage.getUserWatchlist(req.user!.id);
      res.json(watchlist);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/content/:id/watchlist", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "برای افزودن به لیست تماشا باید وارد شوید" });
      }
      
      const contentId = parseInt(req.params.id);
      
      // Check if content exists
      const content = await storage.getContentById(contentId);
      if (!content) {
        return res.status(404).json({ message: "محتوا یافت نشد" });
      }
      
      // Add to watchlist
      await storage.addToWatchlist({
        userId: req.user!.id,
        contentId
      });
      
      res.json({ message: "با موفقیت به لیست تماشا اضافه شد" });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/content/:id/watchlist", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "برای حذف از لیست تماشا باید وارد شوید" });
      }
      
      const contentId = parseInt(req.params.id);
      
      // Remove from watchlist
      await storage.removeFromWatchlist(req.user!.id, contentId);
      
      res.json({ message: "با موفقیت از لیست تماشا حذف شد" });
    } catch (error) {
      next(error);
    }
  });

  // Favorites routes
  app.get("/api/user/favorites", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "برای مشاهده علاقه‌مندی‌ها باید وارد شوید" });
      }
      
      const favorites = await storage.getUserFavorites(req.user!.id);
      res.json(favorites);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/content/:id/favorites", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "برای افزودن به علاقه‌مندی‌ها باید وارد شوید" });
      }
      
      const contentId = parseInt(req.params.id);
      
      // Check if content exists
      const content = await storage.getContentById(contentId);
      if (!content) {
        return res.status(404).json({ message: "محتوا یافت نشد" });
      }
      
      // Add to favorites
      await storage.addToFavorites({
        userId: req.user!.id,
        contentId
      });
      
      res.json({ message: "با موفقیت به علاقه‌مندی‌ها اضافه شد" });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/content/:id/favorites", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "برای حذف از علاقه‌مندی‌ها باید وارد شوید" });
      }
      
      const contentId = parseInt(req.params.id);
      
      // Remove from favorites
      await storage.removeFromFavorites(req.user!.id, contentId);
      
      res.json({ message: "با موفقیت از علاقه‌مندی‌ها حذف شد" });
    } catch (error) {
      next(error);
    }
  });

  // Watch history routes
  app.get("/api/user/history", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "برای مشاهده تاریخچه تماشا باید وارد شوید" });
      }
      
      const history = await storage.getUserWatchHistory(req.user!.id);
      res.json(history);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/content/:id/history", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "برای ثبت تاریخچه تماشا باید وارد شوید" });
      }
      
      const contentId = parseInt(req.params.id);
      const { episodeId, position, completed } = req.body;
      
      // Add or update watch history
      if (completed) {
        await storage.updateWatchHistory(
          req.user!.id,
          contentId,
          episodeId ? parseInt(episodeId) : undefined,
          position,
          completed
        );
      } else {
        await storage.addToWatchHistory(
          req.user!.id,
          contentId,
          episodeId ? parseInt(episodeId) : undefined,
          position
        );
      }
      
      res.json({ message: "تاریخچه تماشا با موفقیت ثبت شد" });
    } catch (error) {
      next(error);
    }
  });

  // Playlists routes
  app.get("/api/user/playlists", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "برای مشاهده پلی‌لیست‌ها باید وارد شوید" });
      }
      
      const playlists = await storage.getUserPlaylists(req.user!.id);
      res.json(playlists);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/playlists/:id", async (req, res, next) => {
    try {
      const playlistId = parseInt(req.params.id);
      const playlist = await storage.getPlaylistById(playlistId);
      
      if (!playlist) {
        return res.status(404).json({ message: "پلی‌لیست یافت نشد" });
      }
      
      // Check if user can access this playlist
      if (!playlist.isPublic && (!req.isAuthenticated() || req.user!.id !== playlist.userId)) {
        return res.status(403).json({ message: "شما به این پلی‌لیست دسترسی ندارید" });
      }
      
      const items = await storage.getPlaylistItems(playlistId);
      
      res.json({
        ...playlist,
        items
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/playlists", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "برای ایجاد پلی‌لیست باید وارد شوید" });
      }
      
      const { name, description, isPublic } = req.body;
      
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: "نام پلی‌لیست نمی‌تواند خالی باشد" });
      }
      
      const playlist = await storage.createPlaylist({
        userId: req.user!.id,
        name,
        description: description || "",
        isPublic: isPublic || false
      });
      
      res.status(201).json(playlist);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/playlists/:id/items", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "برای افزودن به پلی‌لیست باید وارد شوید" });
      }
      
      const playlistId = parseInt(req.params.id);
      const { contentId } = req.body;
      
      if (!contentId) {
        return res.status(400).json({ message: "شناسه محتوا الزامی است" });
      }
      
      // Check if playlist exists and belongs to user
      const playlist = await storage.getPlaylistById(playlistId);
      if (!playlist) {
        return res.status(404).json({ message: "پلی‌لیست یافت نشد" });
      }
      
      if (playlist.userId !== req.user!.id) {
        return res.status(403).json({ message: "شما اجازه تغییر این پلی‌لیست را ندارید" });
      }
      
      // Check if content exists
      const content = await storage.getContentById(parseInt(contentId));
      if (!content) {
        return res.status(404).json({ message: "محتوا یافت نشد" });
      }
      
      // Get current items to determine order
      const items = await storage.getPlaylistItems(playlistId);
      const order = items.length + 1;
      
      // Add to playlist
      await storage.addToPlaylist(playlistId, parseInt(contentId), order);
      
      res.json({ message: "محتوا با موفقیت به پلی‌لیست اضافه شد" });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/playlists/:id/items/:contentId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "برای حذف از پلی‌لیست باید وارد شوید" });
      }
      
      const playlistId = parseInt(req.params.id);
      const contentId = parseInt(req.params.contentId);
      
      // Check if playlist exists and belongs to user
      const playlist = await storage.getPlaylistById(playlistId);
      if (!playlist) {
        return res.status(404).json({ message: "پلی‌لیست یافت نشد" });
      }
      
      if (playlist.userId !== req.user!.id) {
        return res.status(403).json({ message: "شما اجازه تغییر این پلی‌لیست را ندارید" });
      }
      
      // Remove from playlist
      await storage.removeFromPlaylist(playlistId, contentId);
      
      res.json({ message: "محتوا با موفقیت از پلی‌لیست حذف شد" });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
