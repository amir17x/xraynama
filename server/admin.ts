import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Admin middleware to protect admin routes
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "شما باید ابتدا وارد شوید" });
  }

  // Check if user has admin role
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "شما دسترسی لازم برای این عملیات را ندارید" });
  }

  next();
}

export function setupAdminRoutes(app: Express) {
  // Middleware for all admin routes
  app.use("/api/admin/*", isAdmin);

  // Get admin stats
  app.get("/api/admin/stats/users", async (req, res, next) => {
    try {
      // Get total users count
      const users = await storage.getAllUsers();
      const total = users.length;

      // Get new users in the last 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const newUsers = users.filter(user => new Date(user.createdAt) >= oneDayAgo).length;

      // Get admin users count
      const adminUsers = users.filter(user => user.role === 'admin').length;

      res.json({
        total,
        new: newUsers,
        admins: adminUsers
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/stats/content", async (req, res, next) => {
    try {
      // Get all content
      const contentList = await storage.getAllContent(1000); // Fetch a large number
      const total = contentList.length;

      // Count by type
      const movies = contentList.filter(item => item.type === 'movie').length;
      const series = contentList.filter(item => item.type === 'series').length;
      const animations = contentList.filter(item => item.type === 'animation').length;
      const documentaries = contentList.filter(item => item.type === 'documentary').length;

      res.json({
        total,
        movies,
        series,
        animations,
        documentaries
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/stats/comments", async (req, res, next) => {
    try {
      // Get total comments count
      const total = await storage.getCommentsCount();
      
      // Get pending comments count
      const pending = await storage.getPendingCommentsCount();
      
      res.json({
        total,
        pending
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/stats/reviews", async (req, res, next) => {
    try {
      // Get total reviews count
      const total = await storage.getReviewsCount();
      
      // Get pending reviews count
      const pending = await storage.getPendingReviewsCount();
      
      res.json({
        total,
        pending
      });
    } catch (error) {
      next(error);
    }
  });

  // User management routes
  app.get("/api/admin/users", async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const role = req.query.role as string || null;
      
      const { users, totalUsers, totalPages } = await storage.getFilteredUsers(page, limit, search, role);
      
      res.json({
        users,
        totalUsers,
        totalPages,
        currentPage: page
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/users/:id", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "کاربر یافت نشد" });
      }
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/admin/users/:id", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      const { username, email, name, role } = req.body;
      
      // Verify user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "کاربر یافت نشد" });
      }
      
      // Create update data
      const updateData: any = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (name !== undefined) updateData.name = name;
      if (role && (role === 'user' || role === 'admin')) updateData.role = role;
      
      // Update user
      const updatedUser = await storage.updateUser(userId, updateData);
      
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/users/:id", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Verify user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "کاربر یافت نشد" });
      }
      
      // Don't allow to delete yourself
      if (userId === req.user!.id) {
        return res.status(400).json({ message: "شما نمی‌توانید حساب کاربری خود را حذف کنید" });
      }
      
      // Delete user
      await storage.deleteUser(userId);
      
      res.json({ message: "کاربر با موفقیت حذف شد" });
    } catch (error) {
      next(error);
    }
  });

  // Content management routes
  app.get("/api/admin/content", async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const type = req.query.type as string || null;
      
      const { content, totalItems, totalPages } = await storage.getFilteredContent(page, limit, search, type);
      
      res.json({
        content,
        totalItems,
        totalPages,
        currentPage: page
      });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/content/:id", async (req, res, next) => {
    try {
      const contentId = parseInt(req.params.id);
      
      // Verify content exists
      const content = await storage.getContentById(contentId);
      if (!content) {
        return res.status(404).json({ message: "محتوا یافت نشد" });
      }
      
      // Delete content
      await storage.deleteContent(contentId);
      
      res.json({ message: "محتوا با موفقیت حذف شد" });
    } catch (error) {
      next(error);
    }
  });

  // Comments management routes
  app.get("/api/admin/comments", async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const status = req.query.status as string || 'pending';
      
      const { comments, totalItems, totalPages } = await storage.getFilteredComments(page, limit, search, status);
      
      res.json({
        comments,
        totalItems,
        totalPages,
        currentPage: page
      });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/admin/comments/:id/approve", async (req, res, next) => {
    try {
      const commentId = parseInt(req.params.id);
      
      // Approve comment
      await storage.approveComment(commentId);
      
      res.json({ message: "نظر با موفقیت تأیید شد" });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/admin/comments/:id/reject", async (req, res, next) => {
    try {
      const commentId = parseInt(req.params.id);
      
      // Reject comment
      await storage.rejectComment(commentId);
      
      res.json({ message: "نظر با موفقیت رد شد" });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/comments/:id", async (req, res, next) => {
    try {
      const commentId = parseInt(req.params.id);
      
      // Delete comment
      await storage.deleteComment(commentId);
      
      res.json({ message: "نظر با موفقیت حذف شد" });
    } catch (error) {
      next(error);
    }
  });

  // Reviews management routes
  app.get("/api/admin/reviews", async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const status = req.query.status as string || 'pending';
      
      const { reviews, totalItems, totalPages } = await storage.getFilteredReviews(page, limit, search, status);
      
      res.json({
        reviews,
        totalItems,
        totalPages,
        currentPage: page
      });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/admin/reviews/:id/approve", async (req, res, next) => {
    try {
      const reviewId = parseInt(req.params.id);
      
      // Approve review
      await storage.approveReview(reviewId);
      
      res.json({ message: "نقد با موفقیت تأیید شد" });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/admin/reviews/:id/reject", async (req, res, next) => {
    try {
      const reviewId = parseInt(req.params.id);
      
      // Reject review
      await storage.rejectReview(reviewId);
      
      res.json({ message: "نقد با موفقیت رد شد" });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/reviews/:id", async (req, res, next) => {
    try {
      const reviewId = parseInt(req.params.id);
      
      // Delete review
      await storage.deleteReview(reviewId);
      
      res.json({ message: "نقد با موفقیت حذف شد" });
    } catch (error) {
      next(error);
    }
  });

  // Genres management routes
  app.get("/api/admin/genres", async (req, res, next) => {
    try {
      const genres = await storage.getAllGenres();
      res.json(genres);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/genres", async (req, res, next) => {
    try {
      const { name, slug } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({ message: "نام و اسلاگ ژانر الزامی است" });
      }
      
      // Create genre
      const genre = await storage.createGenre({ name, slug });
      
      res.status(201).json(genre);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/genres/:id", async (req, res, next) => {
    try {
      const genreId = parseInt(req.params.id);
      
      // Delete genre
      await storage.deleteGenre(genreId);
      
      res.json({ message: "ژانر با موفقیت حذف شد" });
    } catch (error) {
      next(error);
    }
  });

  // Tags management routes
  app.get("/api/admin/tags", async (req, res, next) => {
    try {
      const tags = await storage.getAllTags();
      res.json(tags);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/tags", async (req, res, next) => {
    try {
      const { name, slug } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({ message: "نام و اسلاگ برچسب الزامی است" });
      }
      
      // Create tag
      const tag = await storage.createTag({ name, slug });
      
      res.status(201).json(tag);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/tags/:id", async (req, res, next) => {
    try {
      const tagId = parseInt(req.params.id);
      
      // Delete tag
      await storage.deleteTag(tagId);
      
      res.json({ message: "برچسب با موفقیت حذف شد" });
    } catch (error) {
      next(error);
    }
  });
}