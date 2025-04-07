import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { WebSocketServer, WebSocket as WS } from "ws";
const OPEN = 1; // WebSocket ready state constant
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  const httpServer = createServer(app);
  
  // WebSocket server for watch parties
  const wss = new WebSocketServer({ server: httpServer });
  
  // Stores active watch party WebSocket connections
  const watchPartyClients = new Map<string, Map<string, WS>>();
  
  wss.on("connection", (ws: WS) => {
    let partyCode: string | null = null;
    let clientId: string | null = null;
    
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === "join-party") {
          partyCode = data.partyCode;
          clientId = data.clientId || nanoid(8);
          
          // Initialize party room if not exists
          if (!watchPartyClients.has(partyCode)) {
            watchPartyClients.set(partyCode, new Map());
          }
          
          // Add client to party room
          watchPartyClients.get(partyCode)?.set(clientId, ws);
          
          // Send join confirmation
          ws.send(JSON.stringify({
            type: "joined",
            clientId,
            clients: Array.from(watchPartyClients.get(partyCode)?.keys() || [])
          }));
          
          // Notify others
          broadcastToParty(partyCode, {
            type: "user-joined",
            clientId,
            clients: Array.from(watchPartyClients.get(partyCode)?.keys() || [])
          }, clientId);
        }
        
        if (data.type === "chat" && partyCode) {
          // Broadcast chat message
          broadcastToParty(partyCode, {
            type: "chat",
            clientId,
            message: data.message,
            timestamp: new Date()
          });
        }
        
        if (data.type === "player-state" && partyCode) {
          // Broadcast player state
          broadcastToParty(partyCode, {
            type: "player-state",
            clientId,
            ...data
          });
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    
    ws.on("close", () => {
      if (partyCode && clientId) {
        // Remove client from party
        watchPartyClients.get(partyCode)?.delete(clientId);
        
        // Clean up empty party rooms
        if (watchPartyClients.get(partyCode)?.size === 0) {
          watchPartyClients.delete(partyCode);
        } else {
          // Notify others about departure
          broadcastToParty(partyCode, {
            type: "user-left",
            clientId,
            clients: Array.from(watchPartyClients.get(partyCode)?.keys() || [])
          });
        }
      }
    });
    
    // Helper function to broadcast to party
    function broadcastToParty(partyCode: string, data: any, excludeClientId?: string) {
      const party = watchPartyClients.get(partyCode);
      if (!party) return;
      
      const message = JSON.stringify(data);
      party.forEach((client, id) => {
        if (id !== excludeClientId && client.readyState === OPEN) {
          client.send(message);
        }
      });
    }
  });
  
  // Content API routes
  app.get("/api/contents", async (req, res) => {
    try {
      const { type, limit } = req.query;
      const contents = await storage.getAllContents(
        type as string | undefined,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(contents);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت محتواها" });
    }
  });
  
  app.get("/api/contents/:id", async (req, res) => {
    try {
      const content = await storage.getContent(parseInt(req.params.id));
      if (!content) {
        return res.status(404).json({ message: "محتوا یافت نشد" });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت محتوا" });
    }
  });
  
  app.get("/api/contents/:id/episodes", async (req, res) => {
    try {
      const episodes = await storage.getEpisodes(parseInt(req.params.id));
      res.json(episodes);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت قسمت‌ها" });
    }
  });
  
  app.get("/api/contents/:id/sources", async (req, res) => {
    try {
      const sources = await storage.getQualitySources(parseInt(req.params.id));
      res.json(sources);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت منابع" });
    }
  });
  
  app.get("/api/episodes/:id/sources", async (req, res) => {
    try {
      const sources = await storage.getQualitySources(undefined, parseInt(req.params.id));
      res.json(sources);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت منابع" });
    }
  });
  
  app.get("/api/search", async (req, res) => {
    try {
      const { q, type, year, genres, tags, minRating } = req.query;
      
      const filters: Record<string, any> = {};
      if (type) filters.type = type;
      if (year) filters.year = parseInt(year as string);
      if (genres) filters.genres = (genres as string).split(",");
      if (tags) filters.tags = (tags as string).split(",");
      if (minRating) filters.minRating = parseFloat(minRating as string);
      
      const results = await storage.searchContents(q as string || "", filters);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "خطا در جستجو" });
    }
  });
  
  // Rating API routes
  app.get("/api/contents/:id/ratings", async (req, res) => {
    try {
      const ratings = await storage.getRatings(parseInt(req.params.id));
      
      // Calculate average rating
      let average = 0;
      if (ratings.length > 0) {
        average = ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length;
      }
      
      res.json({
        ratings,
        average,
        count: ratings.length
      });
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت امتیازها" });
    }
  });
  
  app.post("/api/contents/:id/ratings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const contentId = parseInt(req.params.id);
      const { rating } = req.body;
      
      if (!rating || rating < 1 || rating > 10) {
        return res.status(400).json({ message: "امتیاز باید بین 1 تا 10 باشد" });
      }
      
      const newRating = await storage.createRating({
        userId: req.user.id,
        contentId,
        rating
      });
      
      // Award points for rating
      await storage.updateUserPoints(req.user.id, 5);
      
      res.status(201).json(newRating);
    } catch (error) {
      res.status(500).json({ message: "خطا در ثبت امتیاز" });
    }
  });
  
  // Reviews API routes
  app.get("/api/contents/:id/reviews", async (req, res) => {
    try {
      // Only return approved reviews for non-admin users
      const approved = !req.isAuthenticated() || req.user.role !== "admin" ? true : undefined;
      const reviews = await storage.getReviews(parseInt(req.params.id), approved);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت نقدها" });
    }
  });
  
  app.post("/api/contents/:id/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const contentId = parseInt(req.params.id);
      const { text } = req.body;
      
      if (!text || text.length < 10) {
        return res.status(400).json({ message: "متن نقد باید حداقل 10 کاراکتر باشد" });
      }
      
      if (text.length > 500) {
        return res.status(400).json({ message: "متن نقد نباید بیش از 500 کاراکتر باشد" });
      }
      
      const review = await storage.createReview({
        userId: req.user.id,
        contentId,
        text
      });
      
      // Award points for writing a review
      await storage.updateUserPoints(req.user.id, 20);
      
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ message: "خطا در ثبت نقد" });
    }
  });
  
  app.post("/api/reviews/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const review = await storage.likeReview(parseInt(req.params.id));
      if (!review) {
        return res.status(404).json({ message: "نقد یافت نشد" });
      }
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: "خطا در ثبت لایک" });
    }
  });
  
  app.post("/api/reviews/:id/dislike", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const review = await storage.dislikeReview(parseInt(req.params.id));
      if (!review) {
        return res.status(404).json({ message: "نقد یافت نشد" });
      }
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: "خطا در ثبت دیس‌لایک" });
    }
  });
  
  // Comments API routes
  app.get("/api/contents/:id/comments", async (req, res) => {
    try {
      // Only return approved comments for non-admin users
      const approved = !req.isAuthenticated() || req.user.role !== "admin" ? true : undefined;
      const comments = await storage.getComments(parseInt(req.params.id), approved);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت کامنت‌ها" });
    }
  });
  
  app.post("/api/contents/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const contentId = parseInt(req.params.id);
      const { text } = req.body;
      
      if (!text || text.length < 3) {
        return res.status(400).json({ message: "متن کامنت باید حداقل 3 کاراکتر باشد" });
      }
      
      if (text.length > 300) {
        return res.status(400).json({ message: "متن کامنت نباید بیش از 300 کاراکتر باشد" });
      }
      
      const comment = await storage.createComment({
        userId: req.user.id,
        contentId,
        text
      });
      
      // Award points for commenting
      await storage.updateUserPoints(req.user.id, 5);
      
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ message: "خطا در ثبت کامنت" });
    }
  });
  
  app.post("/api/comments/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const comment = await storage.likeComment(parseInt(req.params.id));
      if (!comment) {
        return res.status(404).json({ message: "کامنت یافت نشد" });
      }
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: "خطا در ثبت لایک" });
    }
  });
  
  app.post("/api/comments/:id/dislike", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const comment = await storage.dislikeComment(parseInt(req.params.id));
      if (!comment) {
        return res.status(404).json({ message: "کامنت یافت نشد" });
      }
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: "خطا در ثبت دیس‌لایک" });
    }
  });
  
  // Watch history API routes
  app.get("/api/watch-history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const history = await storage.getWatchHistory(req.user.id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت تاریخچه تماشا" });
    }
  });
  
  app.post("/api/watch-progress", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const { contentId, episodeId, progress, completed } = req.body;
      
      if (!contentId || progress === undefined) {
        return res.status(400).json({ message: "اطلاعات ناقص است" });
      }
      
      const watchProgress = await storage.updateWatchProgress(
        req.user.id,
        contentId,
        episodeId || null,
        progress,
        completed || false
      );
      
      // If completed, award points for watching content
      if (completed) {
        await storage.updateUserPoints(req.user.id, 10);
      }
      
      res.json(watchProgress);
    } catch (error) {
      res.status(500).json({ message: "خطا در ثبت پیشرفت" });
    }
  });
  
  // Favorites API routes
  app.get("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const favorites = await storage.getFavorites(req.user.id);
      
      // Get content details for each favorite
      const favoriteContents = await Promise.all(
        favorites.map(async (fav) => {
          const content = await storage.getContent(fav.contentId);
          return { ...fav, content };
        })
      );
      
      res.json(favoriteContents);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت علاقه‌مندی‌ها" });
    }
  });
  
  app.post("/api/favorites/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const contentId = parseInt(req.params.id);
      const favorite = await storage.addFavorite(req.user.id, contentId);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ message: "خطا در افزودن به علاقه‌مندی‌ها" });
    }
  });
  
  app.delete("/api/favorites/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const contentId = parseInt(req.params.id);
      const success = await storage.removeFavorite(req.user.id, contentId);
      
      if (!success) {
        return res.status(404).json({ message: "علاقه‌مندی یافت نشد" });
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "خطا در حذف از علاقه‌مندی‌ها" });
    }
  });
  
  // Playlist API routes
  app.get("/api/playlists", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const playlists = await storage.getPlaylists(req.user.id);
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت پلی‌لیست‌ها" });
    }
  });
  
  app.post("/api/playlists", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const { name, description, isPublic } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "نام پلی‌لیست الزامی است" });
      }
      
      const playlist = await storage.createPlaylist({
        userId: req.user.id,
        name,
        description: description || "",
        isPublic: isPublic || false
      });
      
      res.status(201).json(playlist);
    } catch (error) {
      res.status(500).json({ message: "خطا در ایجاد پلی‌لیست" });
    }
  });
  
  app.post("/api/playlists/:id/items", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const playlistId = parseInt(req.params.id);
      const { contentId, order } = req.body;
      
      // Check if playlist exists and belongs to user
      const playlist = await storage.getPlaylist(playlistId);
      if (!playlist) {
        return res.status(404).json({ message: "پلی‌لیست یافت نشد" });
      }
      
      if (playlist.userId !== req.user.id) {
        return res.status(403).json({ message: "دسترسی غیرمجاز" });
      }
      
      const playlistItem = await storage.addToPlaylist(
        playlistId,
        contentId,
        order || 0
      );
      
      res.status(201).json(playlistItem);
    } catch (error) {
      res.status(500).json({ message: "خطا در افزودن به پلی‌لیست" });
    }
  });
  
  app.delete("/api/playlists/:playlistId/items/:contentId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const playlistId = parseInt(req.params.playlistId);
      const contentId = parseInt(req.params.contentId);
      
      // Check if playlist exists and belongs to user
      const playlist = await storage.getPlaylist(playlistId);
      if (!playlist) {
        return res.status(404).json({ message: "پلی‌لیست یافت نشد" });
      }
      
      if (playlist.userId !== req.user.id) {
        return res.status(403).json({ message: "دسترسی غیرمجاز" });
      }
      
      const success = await storage.removeFromPlaylist(playlistId, contentId);
      
      if (!success) {
        return res.status(404).json({ message: "آیتم در پلی‌لیست یافت نشد" });
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "خطا در حذف از پلی‌لیست" });
    }
  });
  
  // Watch Party API routes
  app.post("/api/watch-parties", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const { contentId, episodeId } = req.body;
      
      if (!contentId) {
        return res.status(400).json({ message: "شناسه محتوا الزامی است" });
      }
      
      // Generate a random 6-character code
      const partyCode = nanoid(6);
      
      // Set expiration to 24 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      const watchParty = await storage.createWatchParty({
        creatorId: req.user.id,
        contentId,
        episodeId: episodeId || null,
        partyCode,
        expiresAt
      });
      
      // Automatically join the party as creator
      await storage.joinWatchParty(watchParty.id, req.user.id);
      
      // Award points for creating a watch party
      await storage.updateUserPoints(req.user.id, 10);
      
      res.status(201).json(watchParty);
    } catch (error) {
      res.status(500).json({ message: "خطا در ایجاد تماشای گروهی" });
    }
  });
  
  app.get("/api/watch-parties/:code", async (req, res) => {
    try {
      const watchParty = await storage.getWatchParty(req.params.code);
      
      if (!watchParty) {
        return res.status(404).json({ message: "تماشای گروهی یافت نشد یا منقضی شده است" });
      }
      
      // Get content details
      const content = await storage.getContent(watchParty.contentId);
      
      // Get episode details if applicable
      let episode = null;
      if (watchParty.episodeId) {
        episode = await storage.getEpisode(watchParty.episodeId);
      }
      
      // Get quality sources
      const sources = await storage.getQualitySources(
        watchParty.contentId,
        watchParty.episodeId || undefined
      );
      
      // Get members
      const members = await storage.getWatchPartyMembers(watchParty.id);
      
      // Get chat messages
      const messages = await storage.getWatchPartyChatMessages(watchParty.id);
      
      res.json({
        ...watchParty,
        content,
        episode,
        sources,
        members,
        messages
      });
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت اطلاعات تماشای گروهی" });
    }
  });
  
  app.post("/api/watch-parties/:code/join", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const watchParty = await storage.getWatchParty(req.params.code);
      
      if (!watchParty) {
        return res.status(404).json({ message: "تماشای گروهی یافت نشد یا منقضی شده است" });
      }
      
      // Join party
      const member = await storage.joinWatchParty(watchParty.id, req.user.id);
      
      // Award points for joining a watch party
      await storage.updateUserPoints(req.user.id, 5);
      
      res.status(200).json(member);
    } catch (error) {
      res.status(500).json({ message: "خطا در پیوستن به تماشای گروهی" });
    }
  });
  
  app.post("/api/watch-parties/:code/chat", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "لطفاً ابتدا وارد شوید" });
    }
    
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "پیام الزامی است" });
      }
      
      const watchParty = await storage.getWatchParty(req.params.code);
      
      if (!watchParty) {
        return res.status(404).json({ message: "تماشای گروهی یافت نشد یا منقضی شده است" });
      }
      
      // Add chat message
      const chatMessage = await storage.addWatchPartyChatMessage({
        partyId: watchParty.id,
        userId: req.user.id,
        message
      });
      
      res.status(201).json(chatMessage);
    } catch (error) {
      res.status(500).json({ message: "خطا در ارسال پیام" });
    }
  });
  
  return httpServer;
}
