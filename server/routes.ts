import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertRatingSchema, 
  insertReviewSchema, 
  insertCommentSchema, 
  insertPlaylistSchema,
  insertPlaylistItemSchema,
  insertWatchHistorySchema,
  insertFavoriteSchema,
  insertWatchPartySchema,
  insertWatchPartyParticipantSchema
} from "@shared/schema";

// Helper function to check if user is authenticated
function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "لطفا ابتدا وارد شوید" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Content routes
  app.get("/api/contents", async (req, res) => {
    try {
      const contents = await storage.getAllContents();
      res.json(contents);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت محتوا" });
    }
  });

  app.get("/api/contents/type/:type", async (req, res) => {
    try {
      const contents = await storage.getContentsByType(req.params.type);
      res.json(contents);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت محتوا" });
    }
  });

  app.get("/api/contents/genre/:genre", async (req, res) => {
    try {
      const contents = await storage.getContentsByGenre(req.params.genre);
      res.json(contents);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت محتوا" });
    }
  });

  app.get("/api/contents/tag/:tag", async (req, res) => {
    try {
      const contents = await storage.getContentsByTag(req.params.tag);
      res.json(contents);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت محتوا" });
    }
  });

  app.get("/api/contents/year/:year", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      if (isNaN(year)) {
        return res.status(400).json({ message: "سال نامعتبر است" });
      }
      const contents = await storage.getContentsByYear(year);
      res.json(contents);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت محتوا" });
    }
  });

  app.get("/api/contents/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "عبارت جستجو الزامی است" });
      }
      const contents = await storage.searchContents(query);
      res.json(contents);
    } catch (error) {
      res.status(500).json({ message: "خطا در جستجوی محتوا" });
    }
  });

  app.get("/api/contents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "شناسه نامعتبر است" });
      }
      const content = await storage.getContent(id);
      if (!content) {
        return res.status(404).json({ message: "محتوا یافت نشد" });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت محتوا" });
    }
  });

  // Video routes
  app.get("/api/videos/content/:contentId", async (req, res) => {
    try {
      const contentId = parseInt(req.params.contentId);
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "شناسه محتوا نامعتبر است" });
      }
      const videos = await storage.getVideosByContentId(contentId);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت ویدیوها" });
    }
  });

  app.get("/api/videos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "شناسه نامعتبر است" });
      }
      const video = await storage.getVideo(id);
      if (!video) {
        return res.status(404).json({ message: "ویدیو یافت نشد" });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت ویدیو" });
    }
  });

  // Rating routes
  app.post("/api/ratings", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertRatingSchema.parse(req.body);
      
      // Check if the user is trying to rate their own content
      if (validatedData.userId !== req.user.id) {
        return res.status(403).json({ message: "امکان رأی دادن با هویت دیگران وجود ندارد" });
      }
      
      const rating = await storage.createOrUpdateRating(validatedData);
      
      // Add points to user for rating
      await storage.updateUserPoints(req.user.id, 5);
      
      res.status(201).json(rating);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "اطلاعات نامعتبر", errors: error.errors });
      }
      res.status(500).json({ message: "خطا در ثبت امتیاز" });
    }
  });

  app.get("/api/ratings/content/:contentId", async (req, res) => {
    try {
      const contentId = parseInt(req.params.contentId);
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "شناسه محتوا نامعتبر است" });
      }
      
      const averageRating = await storage.getAverageRating(contentId);
      const ratingsCount = await storage.getRatingsCount(contentId);
      
      res.json({ averageRating, ratingsCount });
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت امتیازها" });
    }
  });

  // Review routes
  app.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      
      // Ensure the user is the one creating the review
      if (validatedData.userId !== req.user.id) {
        return res.status(403).json({ message: "امکان ثبت نقد با هویت دیگران وجود ندارد" });
      }
      
      const review = await storage.createReview(validatedData);
      
      // Add points to user for writing a review
      await storage.updateUserPoints(req.user.id, 20);
      
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "اطلاعات نامعتبر", errors: error.errors });
      }
      res.status(500).json({ message: "خطا در ثبت نقد" });
    }
  });

  app.get("/api/reviews/content/:contentId", async (req, res) => {
    try {
      const contentId = parseInt(req.params.contentId);
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "شناسه محتوا نامعتبر است" });
      }
      
      const reviews = await storage.getReviews(contentId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت نقدها" });
    }
  });

  app.post("/api/reviews/:id/like", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "شناسه نقد نامعتبر است" });
      }
      
      const review = await storage.updateReviewLikes(id, 1, 0);
      if (!review) {
        return res.status(404).json({ message: "نقد یافت نشد" });
      }
      
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: "خطا در ثبت لایک" });
    }
  });

  app.post("/api/reviews/:id/dislike", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "شناسه نقد نامعتبر است" });
      }
      
      const review = await storage.updateReviewLikes(id, 0, 1);
      if (!review) {
        return res.status(404).json({ message: "نقد یافت نشد" });
      }
      
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: "خطا در ثبت دیسلایک" });
    }
  });

  // Comment routes
  app.post("/api/comments", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      
      // Ensure the user is the one creating the comment
      if (validatedData.userId !== req.user.id) {
        return res.status(403).json({ message: "امکان ثبت کامنت با هویت دیگران وجود ندارد" });
      }
      
      const comment = await storage.createComment(validatedData);
      
      // Add points to user for commenting
      await storage.updateUserPoints(req.user.id, 5);
      
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "اطلاعات نامعتبر", errors: error.errors });
      }
      res.status(500).json({ message: "خطا در ثبت کامنت" });
    }
  });

  app.get("/api/comments/content/:contentId", async (req, res) => {
    try {
      const contentId = parseInt(req.params.contentId);
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "شناسه محتوا نامعتبر است" });
      }
      
      const comments = await storage.getComments(contentId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت کامنت‌ها" });
    }
  });

  app.post("/api/comments/:id/like", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "شناسه کامنت نامعتبر است" });
      }
      
      const comment = await storage.updateCommentLikes(id, 1, 0);
      if (!comment) {
        return res.status(404).json({ message: "کامنت یافت نشد" });
      }
      
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: "خطا در ثبت لایک" });
    }
  });

  app.post("/api/comments/:id/dislike", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "شناسه کامنت نامعتبر است" });
      }
      
      const comment = await storage.updateCommentLikes(id, 0, 1);
      if (!comment) {
        return res.status(404).json({ message: "کامنت یافت نشد" });
      }
      
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: "خطا در ثبت دیسلایک" });
    }
  });

  // Playlist routes
  app.post("/api/playlists", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPlaylistSchema.parse(req.body);
      
      // Ensure the user is the one creating the playlist
      if (validatedData.userId !== req.user.id) {
        return res.status(403).json({ message: "امکان ایجاد پلی‌لیست با هویت دیگران وجود ندارد" });
      }
      
      const playlist = await storage.createPlaylist(validatedData);
      res.status(201).json(playlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "اطلاعات نامعتبر", errors: error.errors });
      }
      res.status(500).json({ message: "خطا در ایجاد پلی‌لیست" });
    }
  });

  app.get("/api/playlists", isAuthenticated, async (req, res) => {
    try {
      const playlists = await storage.getPlaylists(req.user.id);
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت پلی‌لیست‌ها" });
    }
  });

  app.post("/api/playlists/items", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPlaylistItemSchema.parse(req.body);
      
      // Ensure the playlist belongs to the user
      const playlist = await storage.getPlaylists(req.user.id).then(
        playlists => playlists.find(p => p.id === validatedData.playlistId)
      );
      
      if (!playlist) {
        return res.status(403).json({ message: "امکان افزودن به پلی‌لیست دیگران وجود ندارد" });
      }
      
      const playlistItem = await storage.addToPlaylist(validatedData);
      res.status(201).json(playlistItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "اطلاعات نامعتبر", errors: error.errors });
      }
      res.status(500).json({ message: "خطا در افزودن به پلی‌لیست" });
    }
  });

  // Watch history routes
  app.post("/api/watch-history", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertWatchHistorySchema.parse(req.body);
      
      // Ensure the user is the one updating the watch history
      if (validatedData.userId !== req.user.id) {
        return res.status(403).json({ message: "امکان ثبت تاریخچه تماشا با هویت دیگران وجود ندارد" });
      }
      
      const watchHistory = await storage.updateWatchHistory(validatedData);
      
      // Add points for watching content
      await storage.updateUserPoints(req.user.id, 10);
      
      res.status(201).json(watchHistory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "اطلاعات نامعتبر", errors: error.errors });
      }
      res.status(500).json({ message: "خطا در ثبت تاریخچه تماشا" });
    }
  });

  app.get("/api/watch-history", isAuthenticated, async (req, res) => {
    try {
      const watchHistory = await storage.getWatchHistory(req.user.id);
      res.json(watchHistory);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت تاریخچه تماشا" });
    }
  });

  // Favorites routes
  app.post("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertFavoriteSchema.parse(req.body);
      
      // Ensure the user is the one adding to favorites
      if (validatedData.userId !== req.user.id) {
        return res.status(403).json({ message: "امکان افزودن به علاقه‌مندی‌ها با هویت دیگران وجود ندارد" });
      }
      
      const favorite = await storage.addToFavorites(validatedData);
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "اطلاعات نامعتبر", errors: error.errors });
      }
      res.status(500).json({ message: "خطا در افزودن به علاقه‌مندی‌ها" });
    }
  });

  app.get("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const favorites = await storage.getFavorites(req.user.id);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت علاقه‌مندی‌ها" });
    }
  });

  app.delete("/api/favorites/:contentId", isAuthenticated, async (req, res) => {
    try {
      const contentId = parseInt(req.params.contentId);
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "شناسه محتوا نامعتبر است" });
      }
      
      const success = await storage.removeFromFavorites(req.user.id, contentId);
      if (!success) {
        return res.status(404).json({ message: "علاقه‌مندی یافت نشد" });
      }
      
      res.status(200).json({ message: "با موفقیت حذف شد" });
    } catch (error) {
      res.status(500).json({ message: "خطا در حذف از علاقه‌مندی‌ها" });
    }
  });

  // Badge routes
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت نشان‌ها" });
    }
  });

  app.get("/api/badges/user", isAuthenticated, async (req, res) => {
    try {
      const userBadges = await storage.getUserBadges(req.user.id);
      res.json(userBadges);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت نشان‌های کاربر" });
    }
  });

  // Watch party routes
  app.post("/api/watch-parties", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertWatchPartySchema.parse(req.body);
      
      // Ensure the user is the host
      if (validatedData.hostId !== req.user.id) {
        return res.status(403).json({ message: "امکان ایجاد تماشای گروهی با هویت دیگران وجود ندارد" });
      }
      
      const watchParty = await storage.createWatchParty(validatedData);
      
      // Add points for creating a watch party
      await storage.updateUserPoints(req.user.id, 15);
      
      res.status(201).json(watchParty);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "اطلاعات نامعتبر", errors: error.errors });
      }
      res.status(500).json({ message: "خطا در ایجاد تماشای گروهی" });
    }
  });

  app.get("/api/watch-parties/:partyCode", async (req, res) => {
    try {
      const watchParty = await storage.getWatchParty(req.params.partyCode);
      
      if (!watchParty) {
        return res.status(404).json({ message: "تماشای گروهی یافت نشد یا منقضی شده است" });
      }
      
      res.json(watchParty);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت اطلاعات تماشای گروهی" });
    }
  });

  app.post("/api/watch-parties/join", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertWatchPartyParticipantSchema.parse(req.body);
      
      // Ensure the user is joining themselves
      if (validatedData.userId !== req.user.id) {
        return res.status(403).json({ message: "امکان پیوستن به تماشای گروهی با هویت دیگران وجود ندارد" });
      }
      
      const participant = await storage.joinWatchParty(validatedData);
      
      // Add points for joining a watch party
      await storage.updateUserPoints(req.user.id, 5);
      
      res.status(201).json(participant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "اطلاعات نامعتبر", errors: error.errors });
      }
      res.status(500).json({ message: "خطا در پیوستن به تماشای گروهی" });
    }
  });

  app.get("/api/watch-parties/:partyId/participants", async (req, res) => {
    try {
      const partyId = parseInt(req.params.partyId);
      if (isNaN(partyId)) {
        return res.status(400).json({ message: "شناسه تماشای گروهی نامعتبر است" });
      }
      
      const participants = await storage.getWatchPartyParticipants(partyId);
      res.json(participants);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت شرکت‌کنندگان تماشای گروهی" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
