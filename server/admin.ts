import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// میان‌افزار بررسی دسترسی ادمین
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "ابتدا وارد حساب کاربری خود شوید" });
  }
  
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: "شما دسترسی لازم برای این عملیات را ندارید" });
  }
  
  next();
}

// تنظیم مسیرهای ادمین
export function setupAdminRoutes(app: Express) {
  // === آمار و ارقام ===
  
  // آمار کاربران
  app.get("/api/admin/stats/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const totalUsers = users.length;
      
      // تعداد کاربران جدید در 7 روز گذشته
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const newUsers = users.filter(user => 
        new Date(user.createdAt) > oneWeekAgo
      ).length;
      
      res.json({
        total: totalUsers,
        new: newUsers
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "خطا در دریافت آمار کاربران" });
    }
  });
  
  // آمار محتوا
  app.get("/api/admin/stats/content", isAdmin, async (req, res) => {
    try {
      const allContent = await storage.getAllContent();
      const totalContent = allContent.length;
      
      // تفکیک بر اساس نوع
      const movies = allContent.filter(content => content.type === 'movie').length;
      const series = allContent.filter(content => content.type === 'series').length;
      const animations = allContent.filter(content => content.type === 'animation').length;
      const documentaries = allContent.filter(content => content.type === 'documentary').length;
      
      res.json({
        total: totalContent,
        movies,
        series,
        animations,
        documentaries
      });
    } catch (error) {
      console.error("Error fetching content stats:", error);
      res.status(500).json({ message: "خطا در دریافت آمار محتوا" });
    }
  });
  
  // آمار نظرات
  app.get("/api/admin/stats/comments", isAdmin, async (req, res) => {
    try {
      const comments = await storage.getAllComments();
      const totalComments = comments.length;
      
      // تعداد نظرات در انتظار تایید
      const pendingComments = comments.filter(comment => !comment.isApproved).length;
      
      res.json({
        total: totalComments,
        pending: pendingComments
      });
    } catch (error) {
      console.error("Error fetching comment stats:", error);
      res.status(500).json({ message: "خطا در دریافت آمار نظرات" });
    }
  });
  
  // آمار نقدها
  app.get("/api/admin/stats/reviews", isAdmin, async (req, res) => {
    try {
      const reviews = await storage.getAllReviews();
      const totalReviews = reviews.length;
      
      // تعداد نقدهای در انتظار تایید
      const pendingReviews = reviews.filter(review => !review.isApproved).length;
      
      res.json({
        total: totalReviews,
        pending: pendingReviews
      });
    } catch (error) {
      console.error("Error fetching review stats:", error);
      res.status(500).json({ message: "خطا در دریافت آمار نقدها" });
    }
  });
  
  // === مدیریت کاربران ===
  
  // لیست کاربران
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "خطا در دریافت لیست کاربران" });
    }
  });
  
  // جزئیات یک کاربر
  app.get("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "کاربر مورد نظر یافت نشد" });
      }
      
      // دریافت اطلاعات تکمیلی کاربر
      const favorites = await storage.getUserFavorites(user.id);
      const watchlist = await storage.getUserWatchlist(user.id);
      const history = await storage.getUserHistory(user.id);
      const comments = await storage.getUserComments(user.id);
      const reviews = await storage.getUserReviews(user.id);
      
      res.json({
        ...user,
        favorites,
        watchlist,
        history,
        comments,
        reviews
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ message: "خطا در دریافت جزئیات کاربر" });
    }
  });
  
  // ویرایش کاربر
  app.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const { username, email, name, role } = req.body;
      
      // اطمینان از اینکه اطلاعات کاربر admin قابل تغییر نیست
      if (username === 'admin' && role !== 'admin') {
        return res.status(403).json({ message: "تغییر نقش کاربر admin امکان‌پذیر نیست" });
      }
      
      const updatedUser = await storage.updateUser(parseInt(req.params.id), {
        username,
        email,
        name,
        role
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "کاربر مورد نظر یافت نشد" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "خطا در بروزرسانی اطلاعات کاربر" });
    }
  });
  
  // مسدود کردن/رفع مسدودی کاربر
  app.patch("/api/admin/users/:id/toggle-block", isAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "کاربر مورد نظر یافت نشد" });
      }
      
      // حفاظت از کاربر admin
      if (user.username === 'admin') {
        return res.status(403).json({ message: "امکان مسدود کردن کاربر admin وجود ندارد" });
      }
      
      const isBlocked = user.role === 'blocked';
      const updatedUser = await storage.updateUser(user.id, {
        role: isBlocked ? 'user' : 'blocked'
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error toggling user block status:", error);
      res.status(500).json({ message: "خطا در تغییر وضعیت مسدودی کاربر" });
    }
  });
  
  // حذف کاربر
  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "کاربر مورد نظر یافت نشد" });
      }
      
      // حفاظت از کاربر admin
      if (user.username === 'admin') {
        return res.status(403).json({ message: "امکان حذف کاربر admin وجود ندارد" });
      }
      
      await storage.deleteUser(user.id);
      res.status(200).json({ message: "کاربر با موفقیت حذف شد" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "خطا در حذف کاربر" });
    }
  });
  
  // === مدیریت محتوا ===
  
  // لیست تمام محتواها
  app.get("/api/admin/content", isAdmin, async (req, res) => {
    try {
      const content = await storage.getAllContent();
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "خطا در دریافت لیست محتوا" });
    }
  });
  
  // دریافت یک محتوا
  app.get("/api/admin/content/:id", isAdmin, async (req, res) => {
    try {
      const content = await storage.getContent(parseInt(req.params.id));
      if (!content) {
        return res.status(404).json({ message: "محتوای مورد نظر یافت نشد" });
      }
      
      // دریافت اطلاعات تکمیلی محتوا
      const comments = await storage.getContentComments(content.id);
      const reviews = await storage.getContentReviews(content.id);
      const genres = await storage.getContentGenres(content.id);
      const tags = await storage.getContentTags(content.id);
      const videos = await storage.getContentVideos(content.id);
      
      // اگر سریال است، فصل‌ها و قسمت‌ها را هم دریافت کن
      let seasons = [];
      let episodes = [];
      if (content.type === 'series') {
        seasons = await storage.getContentSeasons(content.id);
        
        // برای هر فصل، قسمت‌هایش را دریافت کن
        for (const season of seasons) {
          const seasonEpisodes = await storage.getSeasonEpisodes(season.id);
          episodes = [...episodes, ...seasonEpisodes];
        }
      }
      
      res.json({
        ...content,
        comments,
        reviews,
        genres,
        tags,
        videos,
        ...(content.type === 'series' && { seasons, episodes })
      });
    } catch (error) {
      console.error("Error fetching content details:", error);
      res.status(500).json({ message: "خطا در دریافت جزئیات محتوا" });
    }
  });
  
  // افزودن محتوای جدید
  app.post("/api/admin/content", isAdmin, async (req, res) => {
    try {
      const { 
        title, englishTitle, type, description, year, 
        duration, poster, backdrop, imdbRating,
        hasPersianDubbing, hasPersianSubtitle,
        genres, tags
      } = req.body;
      
      // ایجاد محتوای جدید
      const newContent = await storage.createContent({
        title,
        englishTitle, 
        type, 
        description, 
        year, 
        duration, 
        poster, 
        backdrop, 
        imdbRating,
        hasPersianDubbing, 
        hasPersianSubtitle
      });
      
      // افزودن ژانرها
      if (genres && genres.length > 0) {
        for (const genreId of genres) {
          await storage.addContentGenre(newContent.id, parseInt(genreId));
        }
      }
      
      // افزودن تگ‌ها
      if (tags && tags.length > 0) {
        for (const tagId of tags) {
          await storage.addContentTag(newContent.id, parseInt(tagId));
        }
      }
      
      res.status(201).json(newContent);
    } catch (error) {
      console.error("Error creating content:", error);
      res.status(500).json({ message: "خطا در ایجاد محتوای جدید" });
    }
  });
  
  // ویرایش محتوا
  app.patch("/api/admin/content/:id", isAdmin, async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      const { 
        title, englishTitle, type, description, year, 
        duration, poster, backdrop, imdbRating,
        hasPersianDubbing, hasPersianSubtitle,
        genres, tags
      } = req.body;
      
      // ویرایش محتوا
      const updatedContent = await storage.updateContent(contentId, {
        title,
        englishTitle, 
        type, 
        description, 
        year, 
        duration, 
        poster, 
        backdrop, 
        imdbRating,
        hasPersianDubbing, 
        hasPersianSubtitle
      });
      
      if (!updatedContent) {
        return res.status(404).json({ message: "محتوای مورد نظر یافت نشد" });
      }
      
      // بروزرسانی ژانرها
      if (genres && genres.length > 0) {
        // حذف ژانرهای قبلی
        await storage.removeContentGenres(contentId);
        
        // افزودن ژانرهای جدید
        for (const genreId of genres) {
          await storage.addContentGenre(contentId, parseInt(genreId));
        }
      }
      
      // بروزرسانی تگ‌ها
      if (tags && tags.length > 0) {
        // حذف تگ‌های قبلی
        await storage.removeContentTags(contentId);
        
        // افزودن تگ‌های جدید
        for (const tagId of tags) {
          await storage.addContentTag(contentId, parseInt(tagId));
        }
      }
      
      res.json(updatedContent);
    } catch (error) {
      console.error("Error updating content:", error);
      res.status(500).json({ message: "خطا در بروزرسانی محتوا" });
    }
  });
  
  // حذف محتوا
  app.delete("/api/admin/content/:id", isAdmin, async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      const content = await storage.getContent(contentId);
      
      if (!content) {
        return res.status(404).json({ message: "محتوای مورد نظر یافت نشد" });
      }
      
      // حذف همه وابستگی‌ها
      await storage.removeContentGenres(contentId);
      await storage.removeContentTags(contentId);
      await storage.removeContentVideos(contentId);
      
      // اگر سریال است، فصل‌ها و قسمت‌ها را هم حذف کن
      if (content.type === 'series') {
        const seasons = await storage.getContentSeasons(contentId);
        for (const season of seasons) {
          await storage.removeSeasonEpisodes(season.id);
        }
        await storage.removeContentSeasons(contentId);
      }
      
      // حذف نظرات و نقدها
      await storage.removeContentComments(contentId);
      await storage.removeContentReviews(contentId);
      
      // حذف محتوا
      await storage.deleteContent(contentId);
      
      res.status(200).json({ message: "محتوا با موفقیت حذف شد" });
    } catch (error) {
      console.error("Error deleting content:", error);
      res.status(500).json({ message: "خطا در حذف محتوا" });
    }
  });
  
  // === فصل‌ها و قسمت‌ها (برای سریال‌ها) ===
  
  // افزودن فصل جدید
  app.post("/api/admin/content/:id/seasons", isAdmin, async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      const { title, seasonNumber, year } = req.body;
      
      const content = await storage.getContent(contentId);
      if (!content) {
        return res.status(404).json({ message: "محتوای مورد نظر یافت نشد" });
      }
      
      if (content.type !== 'series') {
        return res.status(400).json({ message: "افزودن فصل فقط برای سریال‌ها امکان‌پذیر است" });
      }
      
      const newSeason = await storage.createSeason({
        contentId,
        title,
        seasonNumber,
        year
      });
      
      res.status(201).json(newSeason);
    } catch (error) {
      console.error("Error creating season:", error);
      res.status(500).json({ message: "خطا در ایجاد فصل جدید" });
    }
  });
  
  // ویرایش فصل
  app.patch("/api/admin/seasons/:id", isAdmin, async (req, res) => {
    try {
      const seasonId = parseInt(req.params.id);
      const { title, seasonNumber, year } = req.body;
      
      const updatedSeason = await storage.updateSeason(seasonId, {
        title,
        seasonNumber,
        year
      });
      
      if (!updatedSeason) {
        return res.status(404).json({ message: "فصل مورد نظر یافت نشد" });
      }
      
      res.json(updatedSeason);
    } catch (error) {
      console.error("Error updating season:", error);
      res.status(500).json({ message: "خطا در بروزرسانی فصل" });
    }
  });
  
  // حذف فصل
  app.delete("/api/admin/seasons/:id", isAdmin, async (req, res) => {
    try {
      const seasonId = parseInt(req.params.id);
      
      // حذف تمام قسمت‌های فصل
      await storage.removeSeasonEpisodes(seasonId);
      
      // حذف فصل
      await storage.deleteSeason(seasonId);
      
      res.status(200).json({ message: "فصل با موفقیت حذف شد" });
    } catch (error) {
      console.error("Error deleting season:", error);
      res.status(500).json({ message: "خطا در حذف فصل" });
    }
  });
  
  // افزودن قسمت جدید
  app.post("/api/admin/seasons/:id/episodes", isAdmin, async (req, res) => {
    try {
      const seasonId = parseInt(req.params.id);
      const { title, episodeNumber, duration, description, thumbnail } = req.body;
      
      const season = await storage.getSeason(seasonId);
      if (!season) {
        return res.status(404).json({ message: "فصل مورد نظر یافت نشد" });
      }
      
      const newEpisode = await storage.createEpisode({
        seasonId,
        title,
        episodeNumber,
        duration,
        description,
        thumbnail
      });
      
      res.status(201).json(newEpisode);
    } catch (error) {
      console.error("Error creating episode:", error);
      res.status(500).json({ message: "خطا در ایجاد قسمت جدید" });
    }
  });
  
  // ویرایش قسمت
  app.patch("/api/admin/episodes/:id", isAdmin, async (req, res) => {
    try {
      const episodeId = parseInt(req.params.id);
      const { title, episodeNumber, duration, description, thumbnail } = req.body;
      
      const updatedEpisode = await storage.updateEpisode(episodeId, {
        title,
        episodeNumber,
        duration,
        description,
        thumbnail
      });
      
      if (!updatedEpisode) {
        return res.status(404).json({ message: "قسمت مورد نظر یافت نشد" });
      }
      
      res.json(updatedEpisode);
    } catch (error) {
      console.error("Error updating episode:", error);
      res.status(500).json({ message: "خطا در بروزرسانی قسمت" });
    }
  });
  
  // حذف قسمت
  app.delete("/api/admin/episodes/:id", isAdmin, async (req, res) => {
    try {
      const episodeId = parseInt(req.params.id);
      
      // حذف ویدیوهای مرتبط با قسمت
      await storage.removeEpisodeVideos(episodeId);
      
      // حذف قسمت
      await storage.deleteEpisode(episodeId);
      
      res.status(200).json({ message: "قسمت با موفقیت حذف شد" });
    } catch (error) {
      console.error("Error deleting episode:", error);
      res.status(500).json({ message: "خطا در حذف قسمت" });
    }
  });
  
  // === مدیریت ویدیوها ===
  
  // افزودن ویدیو به محتوا
  app.post("/api/admin/content/:id/videos", isAdmin, async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      const { quality, streamUrl, downloadUrl, size } = req.body;
      
      const content = await storage.getContent(contentId);
      if (!content) {
        return res.status(404).json({ message: "محتوای مورد نظر یافت نشد" });
      }
      
      const newVideo = await storage.createVideo({
        contentId,
        episodeId: null,
        quality,
        streamUrl,
        downloadUrl,
        size
      });
      
      res.status(201).json(newVideo);
    } catch (error) {
      console.error("Error adding video to content:", error);
      res.status(500).json({ message: "خطا در افزودن ویدیو به محتوا" });
    }
  });
  
  // افزودن ویدیو به قسمت
  app.post("/api/admin/episodes/:id/videos", isAdmin, async (req, res) => {
    try {
      const episodeId = parseInt(req.params.id);
      const { quality, streamUrl, downloadUrl, size } = req.body;
      
      const episode = await storage.getEpisode(episodeId);
      if (!episode) {
        return res.status(404).json({ message: "قسمت مورد نظر یافت نشد" });
      }
      
      const newVideo = await storage.createVideo({
        contentId: null,
        episodeId,
        quality,
        streamUrl,
        downloadUrl,
        size
      });
      
      res.status(201).json(newVideo);
    } catch (error) {
      console.error("Error adding video to episode:", error);
      res.status(500).json({ message: "خطا در افزودن ویدیو به قسمت" });
    }
  });
  
  // ویرایش ویدیو
  app.patch("/api/admin/videos/:id", isAdmin, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const { quality, streamUrl, downloadUrl, size } = req.body;
      
      const updatedVideo = await storage.updateVideo(videoId, {
        quality,
        streamUrl,
        downloadUrl,
        size
      });
      
      if (!updatedVideo) {
        return res.status(404).json({ message: "ویدیو مورد نظر یافت نشد" });
      }
      
      res.json(updatedVideo);
    } catch (error) {
      console.error("Error updating video:", error);
      res.status(500).json({ message: "خطا در بروزرسانی ویدیو" });
    }
  });
  
  // حذف ویدیو
  app.delete("/api/admin/videos/:id", isAdmin, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      
      await storage.deleteVideo(videoId);
      
      res.status(200).json({ message: "ویدیو با موفقیت حذف شد" });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "خطا در حذف ویدیو" });
    }
  });
  
  // === مدیریت ژانرها ===
  
  // دریافت تمام ژانرها
  app.get("/api/admin/genres", isAdmin, async (req, res) => {
    try {
      const genres = await storage.getAllGenres();
      res.json(genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
      res.status(500).json({ message: "خطا در دریافت لیست ژانرها" });
    }
  });
  
  // افزودن ژانر جدید
  app.post("/api/admin/genres", isAdmin, async (req, res) => {
    try {
      const { name, slug } = req.body;
      
      // بررسی تکراری نبودن نام ژانر
      const existingGenre = await storage.getGenreBySlug(slug);
      if (existingGenre) {
        return res.status(400).json({ message: "ژانر با این نام قبلاً ثبت شده است" });
      }
      
      const newGenre = await storage.createGenre({ name, slug });
      res.status(201).json(newGenre);
    } catch (error) {
      console.error("Error creating genre:", error);
      res.status(500).json({ message: "خطا در ایجاد ژانر جدید" });
    }
  });
  
  // ویرایش ژانر
  app.patch("/api/admin/genres/:id", isAdmin, async (req, res) => {
    try {
      const genreId = parseInt(req.params.id);
      const { name, slug } = req.body;
      
      // بررسی تکراری نبودن نام ژانر
      const existingGenre = await storage.getGenreBySlug(slug);
      if (existingGenre && existingGenre.id !== genreId) {
        return res.status(400).json({ message: "ژانر با این نام قبلاً ثبت شده است" });
      }
      
      const updatedGenre = await storage.updateGenre(genreId, { name, slug });
      
      if (!updatedGenre) {
        return res.status(404).json({ message: "ژانر مورد نظر یافت نشد" });
      }
      
      res.json(updatedGenre);
    } catch (error) {
      console.error("Error updating genre:", error);
      res.status(500).json({ message: "خطا در بروزرسانی ژانر" });
    }
  });
  
  // حذف ژانر
  app.delete("/api/admin/genres/:id", isAdmin, async (req, res) => {
    try {
      const genreId = parseInt(req.params.id);
      
      // حذف ارتباط‌های ژانر با محتواها
      await storage.removeGenreFromContent(genreId);
      
      // حذف ژانر
      await storage.deleteGenre(genreId);
      
      res.status(200).json({ message: "ژانر با موفقیت حذف شد" });
    } catch (error) {
      console.error("Error deleting genre:", error);
      res.status(500).json({ message: "خطا در حذف ژانر" });
    }
  });
  
  // === مدیریت تگ‌ها ===
  
  // دریافت تمام تگ‌ها
  app.get("/api/admin/tags", isAdmin, async (req, res) => {
    try {
      const tags = await storage.getAllTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ message: "خطا در دریافت لیست تگ‌ها" });
    }
  });
  
  // افزودن تگ جدید
  app.post("/api/admin/tags", isAdmin, async (req, res) => {
    try {
      const { name, slug } = req.body;
      
      // بررسی تکراری نبودن نام تگ
      const existingTag = await storage.getTagBySlug(slug);
      if (existingTag) {
        return res.status(400).json({ message: "تگ با این نام قبلاً ثبت شده است" });
      }
      
      const newTag = await storage.createTag({ name, slug });
      res.status(201).json(newTag);
    } catch (error) {
      console.error("Error creating tag:", error);
      res.status(500).json({ message: "خطا در ایجاد تگ جدید" });
    }
  });
  
  // ویرایش تگ
  app.patch("/api/admin/tags/:id", isAdmin, async (req, res) => {
    try {
      const tagId = parseInt(req.params.id);
      const { name, slug } = req.body;
      
      // بررسی تکراری نبودن نام تگ
      const existingTag = await storage.getTagBySlug(slug);
      if (existingTag && existingTag.id !== tagId) {
        return res.status(400).json({ message: "تگ با این نام قبلاً ثبت شده است" });
      }
      
      const updatedTag = await storage.updateTag(tagId, { name, slug });
      
      if (!updatedTag) {
        return res.status(404).json({ message: "تگ مورد نظر یافت نشد" });
      }
      
      res.json(updatedTag);
    } catch (error) {
      console.error("Error updating tag:", error);
      res.status(500).json({ message: "خطا در بروزرسانی تگ" });
    }
  });
  
  // حذف تگ
  app.delete("/api/admin/tags/:id", isAdmin, async (req, res) => {
    try {
      const tagId = parseInt(req.params.id);
      
      // حذف ارتباط‌های تگ با محتواها
      await storage.removeTagFromContent(tagId);
      
      // حذف تگ
      await storage.deleteTag(tagId);
      
      res.status(200).json({ message: "تگ با موفقیت حذف شد" });
    } catch (error) {
      console.error("Error deleting tag:", error);
      res.status(500).json({ message: "خطا در حذف تگ" });
    }
  });
  
  // === مدیریت نظرات ===
  
  // دریافت تمام نظرات
  app.get("/api/admin/comments", isAdmin, async (req, res) => {
    try {
      const comments = await storage.getAllComments();
      
      // اطلاعات کاربر و محتوای مرتبط با هر نظر را اضافه می‌کنیم
      const commentsWithDetails = await Promise.all(
        comments.map(async (comment) => {
          const user = await storage.getUser(comment.userId);
          const content = await storage.getContent(comment.contentId);
          
          return {
            ...comment,
            user: user ? { id: user.id, username: user.username, name: user.name } : null,
            content: content ? { id: content.id, title: content.title } : null
          };
        })
      );
      
      res.json(commentsWithDetails);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "خطا در دریافت لیست نظرات" });
    }
  });
  
  // تایید نظر
  app.patch("/api/admin/comments/:id/approve", isAdmin, async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      
      const updatedComment = await storage.updateComment(commentId, {
        isApproved: true
      });
      
      if (!updatedComment) {
        return res.status(404).json({ message: "نظر مورد نظر یافت نشد" });
      }
      
      res.json(updatedComment);
    } catch (error) {
      console.error("Error approving comment:", error);
      res.status(500).json({ message: "خطا در تایید نظر" });
    }
  });
  
  // رد نظر
  app.patch("/api/admin/comments/:id/reject", isAdmin, async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      
      const updatedComment = await storage.updateComment(commentId, {
        isApproved: false,
        isRejected: true
      });
      
      if (!updatedComment) {
        return res.status(404).json({ message: "نظر مورد نظر یافت نشد" });
      }
      
      res.json(updatedComment);
    } catch (error) {
      console.error("Error rejecting comment:", error);
      res.status(500).json({ message: "خطا در رد نظر" });
    }
  });
  
  // حذف نظر
  app.delete("/api/admin/comments/:id", isAdmin, async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      
      await storage.deleteComment(commentId);
      
      res.status(200).json({ message: "نظر با موفقیت حذف شد" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "خطا در حذف نظر" });
    }
  });
  
  // === مدیریت نقدها ===
  
  // دریافت تمام نقدها
  app.get("/api/admin/reviews", isAdmin, async (req, res) => {
    try {
      const reviews = await storage.getAllReviews();
      
      // اطلاعات کاربر و محتوای مرتبط با هر نقد را اضافه می‌کنیم
      const reviewsWithDetails = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.userId);
          const content = await storage.getContent(review.contentId);
          
          return {
            ...review,
            user: user ? { id: user.id, username: user.username, name: user.name } : null,
            content: content ? { id: content.id, title: content.title } : null
          };
        })
      );
      
      res.json(reviewsWithDetails);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "خطا در دریافت لیست نقدها" });
    }
  });
  
  // تایید نقد
  app.patch("/api/admin/reviews/:id/approve", isAdmin, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      
      const updatedReview = await storage.updateReview(reviewId, {
        isApproved: true
      });
      
      if (!updatedReview) {
        return res.status(404).json({ message: "نقد مورد نظر یافت نشد" });
      }
      
      res.json(updatedReview);
    } catch (error) {
      console.error("Error approving review:", error);
      res.status(500).json({ message: "خطا در تایید نقد" });
    }
  });
  
  // رد نقد
  app.patch("/api/admin/reviews/:id/reject", isAdmin, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      
      const updatedReview = await storage.updateReview(reviewId, {
        isApproved: false,
        isRejected: true
      });
      
      if (!updatedReview) {
        return res.status(404).json({ message: "نقد مورد نظر یافت نشد" });
      }
      
      res.json(updatedReview);
    } catch (error) {
      console.error("Error rejecting review:", error);
      res.status(500).json({ message: "خطا در رد نقد" });
    }
  });
  
  // حذف نقد
  app.delete("/api/admin/reviews/:id", isAdmin, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      
      await storage.deleteReview(reviewId);
      
      res.status(200).json({ message: "نقد با موفقیت حذف شد" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "خطا در حذف نقد" });
    }
  });
}