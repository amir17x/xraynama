import { users, contents, videos, ratings, reviews, comments, playlists, playlistItems, watchHistory, favorites, badges, userBadges, watchParties, watchPartyParticipants } from "@shared/schema";
import type { User, InsertUser, Content, InsertContent, Video, InsertVideo, Rating, InsertRating, Review, InsertReview, Comment, InsertComment, Playlist, InsertPlaylist, PlaylistItem, InsertPlaylistItem, WatchHistory, InsertWatchHistory, Favorite, InsertFavorite, Badge, UserBadge, WatchParty, InsertWatchParty, WatchPartyParticipant, InsertWatchPartyParticipant } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(id: number, points: number): Promise<User | undefined>;
  
  // Content operations
  getContent(id: number): Promise<Content | undefined>;
  getAllContents(): Promise<Content[]>;
  getContentsByType(type: string): Promise<Content[]>;
  getContentsByGenre(genre: string): Promise<Content[]>;
  getContentsByTag(tag: string): Promise<Content[]>;
  getContentsByYear(year: number): Promise<Content[]>;
  searchContents(query: string): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  
  // Video operations
  getVideo(id: number): Promise<Video | undefined>;
  getVideosByContentId(contentId: number): Promise<Video[]>;
  getVideoBySeasonEpisode(contentId: number, season: number, episode: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  
  // Rating operations
  getRating(userId: number, contentId: number): Promise<Rating | undefined>;
  getAverageRating(contentId: number): Promise<number>;
  getRatingsCount(contentId: number): Promise<number>;
  createOrUpdateRating(rating: InsertRating): Promise<Rating>;
  
  // Review operations
  getReviews(contentId: number): Promise<Review[]>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  approveReview(id: number): Promise<Review | undefined>;
  updateReviewLikes(id: number, likesChange: number, dislikesChange: number): Promise<Review | undefined>;
  
  // Comment operations
  getComments(contentId: number): Promise<Comment[]>;
  getCommentsByUser(userId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  approveComment(id: number): Promise<Comment | undefined>;
  updateCommentLikes(id: number, likesChange: number, dislikesChange: number): Promise<Comment | undefined>;
  
  // Playlist operations
  getPlaylists(userId: number): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  addToPlaylist(playlistItem: InsertPlaylistItem): Promise<PlaylistItem>;
  removeFromPlaylist(playlistId: number, contentId: number): Promise<boolean>;
  
  // Watch history operations
  getWatchHistory(userId: number): Promise<WatchHistory[]>;
  updateWatchHistory(watchHistory: InsertWatchHistory): Promise<WatchHistory>;
  
  // Favorites operations
  getFavorites(userId: number): Promise<Favorite[]>;
  addToFavorites(favorite: InsertFavorite): Promise<Favorite>;
  removeFromFavorites(userId: number, contentId: number): Promise<boolean>;
  
  // Badge operations
  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: number): Promise<UserBadge[]>;
  
  // Watch party operations
  createWatchParty(watchParty: InsertWatchParty): Promise<WatchParty>;
  getWatchParty(partyCode: string): Promise<WatchParty | undefined>;
  joinWatchParty(watchPartyParticipant: InsertWatchPartyParticipant): Promise<WatchPartyParticipant>;
  getWatchPartyParticipants(partyId: number): Promise<WatchPartyParticipant[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contents: Map<number, Content>;
  private videos: Map<number, Video>;
  private ratings: Map<string, Rating>; // key: userId-contentId
  private reviews: Map<number, Review>;
  private comments: Map<number, Comment>;
  private playlists: Map<number, Playlist>;
  private playlistItems: Map<number, PlaylistItem>;
  private watchHistories: Map<string, WatchHistory>; // key: userId-contentId-videoId
  private favorites: Map<string, Favorite>; // key: userId-contentId
  private badges: Map<number, Badge>;
  private userBadges: Map<string, UserBadge>; // key: userId-badgeId
  private watchParties: Map<number, WatchParty>;
  private watchPartyParticipants: Map<number, WatchPartyParticipant>;
  
  currentUserId: number;
  currentContentId: number;
  currentVideoId: number;
  currentReviewId: number;
  currentCommentId: number;
  currentPlaylistId: number;
  currentPlaylistItemId: number;
  currentWatchHistoryId: number;
  currentFavoriteId: number;
  currentBadgeId: number;
  currentUserBadgeId: number;
  currentWatchPartyId: number;
  currentWatchPartyParticipantId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.contents = new Map();
    this.videos = new Map();
    this.ratings = new Map();
    this.reviews = new Map();
    this.comments = new Map();
    this.playlists = new Map();
    this.playlistItems = new Map();
    this.watchHistories = new Map();
    this.favorites = new Map();
    this.badges = new Map();
    this.userBadges = new Map();
    this.watchParties = new Map();
    this.watchPartyParticipants = new Map();
    
    this.currentUserId = 1;
    this.currentContentId = 1;
    this.currentVideoId = 1;
    this.currentReviewId = 1;
    this.currentCommentId = 1;
    this.currentPlaylistId = 1;
    this.currentPlaylistItemId = 1;
    this.currentWatchHistoryId = 1;
    this.currentFavoriteId = 1;
    this.currentBadgeId = 1;
    this.currentUserBadgeId = 1;
    this.currentWatchPartyId = 1;
    this.currentWatchPartyParticipantId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      points: 0,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPoints(id: number, points: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updated = {
      ...user,
      points: user.points + points
    };
    this.users.set(id, updated);
    return updated;
  }

  // Content operations
  async getContent(id: number): Promise<Content | undefined> {
    return this.contents.get(id);
  }

  async getAllContents(): Promise<Content[]> {
    return Array.from(this.contents.values());
  }

  async getContentsByType(type: string): Promise<Content[]> {
    return Array.from(this.contents.values()).filter(
      (content) => content.type === type,
    );
  }

  async getContentsByGenre(genre: string): Promise<Content[]> {
    return Array.from(this.contents.values()).filter(
      (content) => content.genres.includes(genre),
    );
  }

  async getContentsByTag(tag: string): Promise<Content[]> {
    return Array.from(this.contents.values()).filter(
      (content) => content.tags.includes(tag),
    );
  }

  async getContentsByYear(year: number): Promise<Content[]> {
    return Array.from(this.contents.values()).filter(
      (content) => content.year === year,
    );
  }

  async searchContents(query: string): Promise<Content[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.contents.values()).filter(
      (content) => 
        content.titleFa.toLowerCase().includes(lowercaseQuery) ||
        content.titleEn.toLowerCase().includes(lowercaseQuery) ||
        content.genres.some(genre => genre.toLowerCase().includes(lowercaseQuery)) ||
        content.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
        content.directors.some(director => director.toLowerCase().includes(lowercaseQuery)) ||
        content.actors.some(actor => actor.toLowerCase().includes(lowercaseQuery))
    );
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    const id = this.currentContentId++;
    const now = new Date();
    const content: Content = { 
      ...insertContent, 
      id, 
      createdAt: now
    };
    this.contents.set(id, content);
    return content;
  }

  // Video operations
  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getVideosByContentId(contentId: number): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      (video) => video.contentId === contentId,
    );
  }

  async getVideoBySeasonEpisode(contentId: number, season: number, episode: number): Promise<Video | undefined> {
    return Array.from(this.videos.values()).find(
      (video) => video.contentId === contentId && video.season === season && video.episode === episode,
    );
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.currentVideoId++;
    const now = new Date();
    const video: Video = { 
      ...insertVideo, 
      id, 
      createdAt: now
    };
    this.videos.set(id, video);
    return video;
  }

  // Rating operations
  async getRating(userId: number, contentId: number): Promise<Rating | undefined> {
    return this.ratings.get(`${userId}-${contentId}`);
  }

  async getAverageRating(contentId: number): Promise<number> {
    const contentRatings = Array.from(this.ratings.values()).filter(
      (rating) => rating.contentId === contentId,
    );
    
    if (contentRatings.length === 0) return 0;
    
    const sum = contentRatings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / contentRatings.length;
  }

  async getRatingsCount(contentId: number): Promise<number> {
    return Array.from(this.ratings.values()).filter(
      (rating) => rating.contentId === contentId,
    ).length;
  }

  async createOrUpdateRating(insertRating: InsertRating): Promise<Rating> {
    const key = `${insertRating.userId}-${insertRating.contentId}`;
    const existingRating = this.ratings.get(key);
    
    const now = new Date();
    if (existingRating) {
      const updated = {
        ...existingRating,
        rating: insertRating.rating,
        createdAt: now
      };
      this.ratings.set(key, updated);
      return updated;
    }
    
    const newRating: Rating = {
      ...insertRating,
      id: this.ratings.size + 1,
      createdAt: now
    };
    this.ratings.set(key, newRating);
    return newRating;
  }

  // Review operations
  async getReviews(contentId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.contentId === contentId && review.approved)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const now = new Date();
    const review: Review = {
      ...insertReview,
      id,
      approved: false,
      likes: 0,
      dislikes: 0,
      createdAt: now
    };
    this.reviews.set(id, review);
    return review;
  }

  async approveReview(id: number): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    
    const updated = {
      ...review,
      approved: true
    };
    this.reviews.set(id, updated);
    return updated;
  }

  async updateReviewLikes(id: number, likesChange: number, dislikesChange: number): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    
    const updated = {
      ...review,
      likes: Math.max(0, review.likes + likesChange),
      dislikes: Math.max(0, review.dislikes + dislikesChange)
    };
    this.reviews.set(id, updated);
    return updated;
  }

  // Comment operations
  async getComments(contentId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.contentId === contentId && comment.approved)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCommentsByUser(userId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const now = new Date();
    const comment: Comment = {
      ...insertComment,
      id,
      approved: false,
      likes: 0,
      dislikes: 0,
      createdAt: now
    };
    this.comments.set(id, comment);
    return comment;
  }

  async approveComment(id: number): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;
    
    const updated = {
      ...comment,
      approved: true
    };
    this.comments.set(id, updated);
    return updated;
  }

  async updateCommentLikes(id: number, likesChange: number, dislikesChange: number): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;
    
    const updated = {
      ...comment,
      likes: Math.max(0, comment.likes + likesChange),
      dislikes: Math.max(0, comment.dislikes + dislikesChange)
    };
    this.comments.set(id, updated);
    return updated;
  }

  // Playlist operations
  async getPlaylists(userId: number): Promise<Playlist[]> {
    return Array.from(this.playlists.values())
      .filter(playlist => playlist.userId === userId);
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = this.currentPlaylistId++;
    const now = new Date();
    const playlist: Playlist = {
      ...insertPlaylist,
      id,
      createdAt: now
    };
    this.playlists.set(id, playlist);
    return playlist;
  }

  async addToPlaylist(insertPlaylistItem: InsertPlaylistItem): Promise<PlaylistItem> {
    const id = this.currentPlaylistItemId++;
    const now = new Date();
    const playlistItem: PlaylistItem = {
      ...insertPlaylistItem,
      id,
      addedAt: now
    };
    this.playlistItems.set(id, playlistItem);
    return playlistItem;
  }

  async removeFromPlaylist(playlistId: number, contentId: number): Promise<boolean> {
    const items = Array.from(this.playlistItems.entries())
      .filter(([_, item]) => item.playlistId === playlistId && item.contentId === contentId);
    
    if (items.length === 0) return false;
    
    for (const [key, _] of items) {
      this.playlistItems.delete(key);
    }
    
    return true;
  }

  // Watch history operations
  async getWatchHistory(userId: number): Promise<WatchHistory[]> {
    return Array.from(this.watchHistories.values())
      .filter(history => history.userId === userId)
      .sort((a, b) => b.watchedAt.getTime() - a.watchedAt.getTime());
  }

  async updateWatchHistory(insertWatchHistory: InsertWatchHistory): Promise<WatchHistory> {
    const key = `${insertWatchHistory.userId}-${insertWatchHistory.contentId}-${insertWatchHistory.videoId}`;
    const existingHistory = this.watchHistories.get(key);
    
    const now = new Date();
    if (existingHistory) {
      const updated = {
        ...existingHistory,
        progress: insertWatchHistory.progress,
        watchedAt: now
      };
      this.watchHistories.set(key, updated);
      return updated;
    }
    
    const id = this.currentWatchHistoryId++;
    const newHistory: WatchHistory = {
      ...insertWatchHistory,
      id,
      watchedAt: now
    };
    this.watchHistories.set(key, newHistory);
    return newHistory;
  }

  // Favorites operations
  async getFavorites(userId: number): Promise<Favorite[]> {
    return Array.from(this.favorites.values())
      .filter(favorite => favorite.userId === userId)
      .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
  }

  async addToFavorites(insertFavorite: InsertFavorite): Promise<Favorite> {
    const key = `${insertFavorite.userId}-${insertFavorite.contentId}`;
    
    // Check if already exists
    const existing = this.favorites.get(key);
    if (existing) return existing;
    
    const id = this.currentFavoriteId++;
    const now = new Date();
    const favorite: Favorite = {
      ...insertFavorite,
      id,
      addedAt: now
    };
    this.favorites.set(key, favorite);
    return favorite;
  }

  async removeFromFavorites(userId: number, contentId: number): Promise<boolean> {
    const key = `${userId}-${contentId}`;
    const exists = this.favorites.has(key);
    
    if (!exists) return false;
    
    this.favorites.delete(key);
    return true;
  }

  // Badge operations
  async getAllBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }

  async getUserBadges(userId: number): Promise<UserBadge[]> {
    return Array.from(this.userBadges.values())
      .filter(userBadge => userBadge.userId === userId);
  }

  // Watch party operations
  async createWatchParty(insertWatchParty: InsertWatchParty): Promise<WatchParty> {
    const id = this.currentWatchPartyId++;
    const now = new Date();
    const watchParty: WatchParty = {
      ...insertWatchParty,
      id,
      createdAt: now,
      active: true
    };
    this.watchParties.set(id, watchParty);
    return watchParty;
  }

  async getWatchParty(partyCode: string): Promise<WatchParty | undefined> {
    return Array.from(this.watchParties.values())
      .find(party => party.partyCode === partyCode && party.active);
  }

  async joinWatchParty(insertWatchPartyParticipant: InsertWatchPartyParticipant): Promise<WatchPartyParticipant> {
    const id = this.currentWatchPartyParticipantId++;
    const now = new Date();
    const participant: WatchPartyParticipant = {
      ...insertWatchPartyParticipant,
      id,
      joinedAt: now
    };
    this.watchPartyParticipants.set(id, participant);
    return participant;
  }

  async getWatchPartyParticipants(partyId: number): Promise<WatchPartyParticipant[]> {
    return Array.from(this.watchPartyParticipants.values())
      .filter(participant => participant.partyId === partyId)
      .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());
  }

  // Initialize demo data
  private initializeDemoData() {
    // Initialize with sample data for testing
    // This would be removed in a production environment with real data
    
    // Sample badges
    const badges: Badge[] = [
      {
        id: this.currentBadgeId++,
        name: "کاربر فعال",
        description: "بعد از ۱۰۰ امتیاز",
        icon: "badge-active",
        requiredPoints: 100
      },
      {
        id: this.currentBadgeId++,
        name: "منتقد حرفه‌ای",
        description: "بعد از ۵ نقد تأییدشده",
        icon: "badge-critic",
        requiredPoints: 0
      },
      {
        id: this.currentBadgeId++,
        name: "فن انیمیشن",
        description: "بعد از تماشای ۱۰ انیمیشن",
        icon: "badge-animation",
        requiredPoints: 0
      }
    ];
    
    badges.forEach(badge => {
      this.badges.set(badge.id, badge);
    });
    
    // Sample content types for navbar
    const contentTypes = ["animation", "movie", "series", "documentary"];
    
    // Sample genres
    const genres = ["action", "adventure", "comedy", "drama", "sci-fi", "horror", "romance", "thriller"];
  }
}

export const storage = new MemStorage();
