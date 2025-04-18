import { 
  users, User, InsertUser, content, Content, InsertContent,
  seasons, Season, InsertSeason, episodes, Episode, InsertEpisode,
  videos, Video, InsertVideo, genres, Genre, InsertGenre,
  tags, Tag, InsertTag, contentGenres, contentTags,
  ratings, Rating, InsertRating, reviews, Review, InsertReview,
  comments, Comment, InsertComment, watchlist, Watchlist, InsertWatchlist,
  favorites, Favorite, InsertFavorite, watchHistory, playlists, Playlist, InsertPlaylist,
  playlistItems
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

const MemoryStore = createMemoryStore(session);

// Interface for password reset
export interface ResetToken {
  email: string;
  token: string;
  expiresAt: Date;
}

export interface VerificationCode {
  email: string;
  code: string;
  expiresAt: Date;
}

// Interface for the storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getFilteredUsers(page: number, limit: number, search: string, role: string | null): Promise<{ users: User[], totalUsers: number, totalPages: number }>;
  
  // Password reset operations
  createVerificationCode(email: string): Promise<string>;
  verifyCode(email: string, code: string): Promise<boolean>;
  createResetToken(email: string): Promise<string>;
  verifyResetToken(email: string, token: string): Promise<boolean>;
  resetPassword(email: string, newPassword: string): Promise<boolean>;
  
  // AI recommendation operations
  getRecommendedContent(userId: number | null, limit?: number): Promise<Content[]>;
  getSimilarContent(contentId: number, limit?: number): Promise<Content[]>;

  // Content operations
  getAllContent(limit?: number, offset?: number): Promise<Content[]>;
  getContentById(id: number): Promise<Content | undefined>;
  getContentByType(type: string, limit?: number, offset?: number): Promise<Content[]>;
  getContentByGenre(genre: string, limit?: number, offset?: number): Promise<Content[]>;
  searchContent(query: string, filters?: any): Promise<Content[]>;
  getLatestContent(limit?: number): Promise<Content[]>;
  getTopRatedContent(limit?: number): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  deleteContent(id: number): Promise<void>;
  getFilteredContent(page: number, limit: number, search: string, type: string | null): Promise<{ content: Content[], totalItems: number, totalPages: number }>;

  // Seasons operations
  getSeasonsByContentId(contentId: number): Promise<Season[]>;
  createSeason(season: InsertSeason): Promise<Season>;

  // Episodes operations
  getEpisodesBySeasonId(seasonId: number): Promise<Episode[]>;
  createEpisode(episode: InsertEpisode): Promise<Episode>;

  // Videos operations
  getVideosByContentId(contentId: number): Promise<Video[]>;
  getVideosByEpisodeId(episodeId: number): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;

  // Genres operations
  getAllGenres(): Promise<Genre[]>;
  getGenresByContentId(contentId: number): Promise<Genre[]>;
  createGenre(genre: InsertGenre): Promise<Genre>;
  addGenreToContent(contentId: number, genreId: number): Promise<void>;
  deleteGenre(id: number): Promise<void>;

  // Tags operations
  getAllTags(): Promise<Tag[]>;
  getTagsByContentId(contentId: number): Promise<Tag[]>;
  createTag(tag: InsertTag): Promise<Tag>;
  addTagToContent(contentId: number, tagId: number): Promise<void>;
  deleteTag(id: number): Promise<void>;

  // Ratings operations
  getRatingsByContentId(contentId: number): Promise<Rating[]>;
  getUserRatingForContent(userId: number, contentId: number): Promise<Rating | undefined>;
  createRating(rating: InsertRating): Promise<Rating>;
  updateRating(id: number, score: number): Promise<Rating | undefined>;

  // Reviews operations
  getReviewsByContentId(contentId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  approveReview(id: number): Promise<void>;
  rejectReview(id: number): Promise<void>;
  deleteReview(id: number): Promise<void>;
  getReviewsCount(): Promise<number>;
  getPendingReviewsCount(): Promise<number>;
  getFilteredReviews(page: number, limit: number, search: string, status: string): Promise<{ reviews: any[], totalItems: number, totalPages: number }>;

  // Comments operations
  getCommentsByContentId(contentId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  approveComment(id: number): Promise<void>;
  rejectComment(id: number): Promise<void>;
  deleteComment(id: number): Promise<void>;
  getCommentsCount(): Promise<number>;
  getPendingCommentsCount(): Promise<number>;
  getFilteredComments(page: number, limit: number, search: string, status: string): Promise<{ comments: any[], totalItems: number, totalPages: number }>;

  // Watchlist operations
  getUserWatchlist(userId: number): Promise<Content[]>;
  addToWatchlist(watchlistItem: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(userId: number, contentId: number): Promise<void>;
  isInWatchlist(userId: number, contentId: number): Promise<boolean>;

  // Favorites operations
  getUserFavorites(userId: number): Promise<Content[]>;
  addToFavorites(favorite: InsertFavorite): Promise<Favorite>;
  removeFromFavorites(userId: number, contentId: number): Promise<void>;
  isInFavorites(userId: number, contentId: number): Promise<boolean>;

  // Watch History operations
  getUserWatchHistory(userId: number): Promise<any[]>;
  addToWatchHistory(userId: number, contentId: number, episodeId?: number, position?: number): Promise<void>;
  updateWatchHistory(userId: number, contentId: number, episodeId?: number, position?: number, completed?: boolean): Promise<void>;

  // Playlists operations
  getUserPlaylists(userId: number): Promise<Playlist[]>;
  getPlaylistById(id: number): Promise<Playlist | undefined>;
  getPlaylistItems(playlistId: number): Promise<Content[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  addToPlaylist(playlistId: number, contentId: number, order: number): Promise<void>;
  removeFromPlaylist(playlistId: number, contentId: number): Promise<void>;

  // Session store
  sessionStore: any;
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private contentMap: Map<number, Content>;
  private seasonsMap: Map<number, Season>;
  private episodesMap: Map<number, Episode>;
  private videosMap: Map<number, Video>;
  private genresMap: Map<number, Genre>;
  private tagsMap: Map<number, Tag>;
  private contentGenresMap: Map<number, { contentId: number, genreId: number }>;
  private contentTagsMap: Map<number, { contentId: number, tagId: number }>;
  private ratingsMap: Map<number, Rating>;
  private reviewsMap: Map<number, Review>;
  private commentsMap: Map<number, Comment>;
  private watchlistMap: Map<number, Watchlist>;
  private favoritesMap: Map<number, Favorite>;
  private watchHistoryMap: Map<number, any>;
  private playlistsMap: Map<number, Playlist>;
  private playlistItemsMap: Map<number, { playlistId: number, contentId: number, order: number }>;
  
  // Maps for password reset
  private verificationCodesMap: Map<string, VerificationCode>;
  private resetTokensMap: Map<string, ResetToken>;
  
  public sessionStore: any; // Using any instead of session.SessionStore due to type issues
  private currentIds: {
    users: number;
    content: number;
    seasons: number;
    episodes: number;
    videos: number;
    genres: number;
    tags: number;
    contentGenres: number;
    contentTags: number;
    ratings: number;
    reviews: number;
    comments: number;
    watchlist: number;
    favorites: number;
    watchHistory: number;
    playlists: number;
    playlistItems: number;
  };

  constructor() {
    this.usersMap = new Map();
    this.contentMap = new Map();
    this.seasonsMap = new Map();
    this.episodesMap = new Map();
    this.videosMap = new Map();
    this.genresMap = new Map();
    this.tagsMap = new Map();
    this.contentGenresMap = new Map();
    this.contentTagsMap = new Map();
    this.ratingsMap = new Map();
    this.reviewsMap = new Map();
    this.commentsMap = new Map();
    this.watchlistMap = new Map();
    this.favoritesMap = new Map();
    this.watchHistoryMap = new Map();
    this.playlistsMap = new Map();
    this.playlistItemsMap = new Map();
    
    // Initialize password reset maps
    this.verificationCodesMap = new Map();
    this.resetTokensMap = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    this.currentIds = {
      users: 1,
      content: 1,
      seasons: 1,
      episodes: 1,
      videos: 1,
      genres: 1,
      tags: 1,
      contentGenres: 1,
      contentTags: 1,
      ratings: 1,
      reviews: 1,
      comments: 1,
      watchlist: 1,
      favorites: 1,
      watchHistory: 1,
      playlists: 1,
      playlistItems: 1
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now, 
      updatedAt: now,
      avatar: insertUser.avatar || null,
      role: insertUser.role || 'user' // Default to 'user' if not specified
    };
    this.usersMap.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.usersMap.get(id);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      ...userData, 
      updatedAt: new Date() 
    };
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.usersMap.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }

  async getFilteredUsers(page: number, limit: number, search: string, role: string | null): Promise<{ users: User[], totalUsers: number, totalPages: number }> {
    let users = Array.from(this.usersMap.values());
    
    // Apply search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      users = users.filter(user => 
        user.username.toLowerCase().includes(lowerSearch) || 
        user.email.toLowerCase().includes(lowerSearch) ||
        (user.name && user.name.toLowerCase().includes(lowerSearch))
      );
    }
    
    // Apply role filter
    if (role) {
      users = users.filter(user => user.role === role);
    }
    
    // Sort by creation date, newest first
    users = users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Calculate pagination
    const totalUsers = users.length;
    const totalPages = Math.ceil(totalUsers / limit);
    const offset = (page - 1) * limit;
    const paginatedUsers = users.slice(offset, offset + limit);
    
    return {
      users: paginatedUsers,
      totalUsers,
      totalPages
    };
  }

  // Content methods
  async getAllContent(limit: number = 10, offset: number = 0): Promise<Content[]> {
    return Array.from(this.contentMap.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }

  async getContentById(id: number): Promise<Content | undefined> {
    return this.contentMap.get(id);
  }

  async getContentByType(type: string, limit: number = 10, offset: number = 0): Promise<Content[]> {
    return Array.from(this.contentMap.values())
      .filter(content => content.type === type)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }
  
  async getContentByGenre(genre: string, limit: number = 10, offset: number = 0): Promise<Content[]> {
    // First find the genre ID based on the genre name
    const genreObj = Array.from(this.genresMap.values())
      .find(g => g.name.toLowerCase() === genre.toLowerCase());
    
    if (!genreObj) return [];
    
    // Find all content associated with this genre
    const contentIds = Array.from(this.contentGenresMap.values())
      .filter(cg => cg.genreId === genreObj.id)
      .map(cg => cg.contentId);
    
    // Get the content items
    const contentItems = Array.from(this.contentMap.values())
      .filter(content => contentIds.includes(content.id))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
    
    return contentItems;
  }

  async searchContent(query: string, filters: any = {}): Promise<Content[]> {
    let results = Array.from(this.contentMap.values());
    
    // Basic search by title
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(item => 
        item.title.toLowerCase().includes(lowerQuery) || 
        item.englishTitle.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Apply filters
    if (filters.type) {
      results = results.filter(item => item.type === filters.type);
    }
    
    if (filters.year) {
      if (filters.year.from && filters.year.to) {
        results = results.filter(item => item.year >= filters.year.from && item.year <= filters.year.to);
      } else if (filters.year.from) {
        results = results.filter(item => item.year >= filters.year.from);
      } else if (filters.year.to) {
        results = results.filter(item => item.year <= filters.year.to);
      }
    }
    
    if (filters.minRating) {
      // This would require joining with ratings data
      // Simple implementation for in-memory
      results = results.filter(item => {
        const contentRatings = Array.from(this.ratingsMap.values())
          .filter(rating => rating.contentId === item.id);
        
        if (contentRatings.length === 0) return false;
        
        const avgRating = contentRatings.reduce((sum, rating) => sum + rating.score, 0) / contentRatings.length;
        return avgRating >= filters.minRating;
      });
    }
    
    return results;
  }

  async getLatestContent(limit: number = 10): Promise<Content[]> {
    return Array.from(this.contentMap.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getTopRatedContent(limit: number = 10): Promise<Content[]> {
    // Get all content
    const allContent = Array.from(this.contentMap.values());
    
    // Calculate average ratings
    const contentWithRatings = allContent.map(item => {
      const contentRatings = Array.from(this.ratingsMap.values())
        .filter(rating => rating.contentId === item.id);
      
      const avgRating = contentRatings.length > 0 
        ? contentRatings.reduce((sum, rating) => sum + rating.score, 0) / contentRatings.length 
        : 0;
      
      return { ...item, avgRating };
    });
    
    // Sort by average rating and return top N
    return contentWithRatings
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, limit);
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    const id = this.currentIds.content++;
    const now = new Date();
    const content: Content = { 
      ...insertContent, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.contentMap.set(id, content);
    return content;
  }

  async deleteContent(id: number): Promise<void> {
    this.contentMap.delete(id);
  }

  async getFilteredContent(page: number, limit: number, search: string, type: string | null): Promise<{ content: Content[], totalItems: number, totalPages: number }> {
    let content = Array.from(this.contentMap.values());
    
    // Apply search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      content = content.filter(item => 
        item.title.toLowerCase().includes(lowerSearch) || 
        item.englishTitle.toLowerCase().includes(lowerSearch) ||
        (item.description && item.description.toLowerCase().includes(lowerSearch))
      );
    }
    
    // Apply type filter
    if (type) {
      content = content.filter(item => item.type === type);
    }
    
    // Sort by creation date, newest first
    content = content.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Calculate pagination
    const totalItems = content.length;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;
    const paginatedContent = content.slice(offset, offset + limit);
    
    return {
      content: paginatedContent,
      totalItems,
      totalPages
    };
  }

  // Seasons methods
  async getSeasonsByContentId(contentId: number): Promise<Season[]> {
    return Array.from(this.seasonsMap.values())
      .filter(season => season.contentId === contentId)
      .sort((a, b) => a.seasonNumber - b.seasonNumber);
  }

  async createSeason(insertSeason: InsertSeason): Promise<Season> {
    const id = this.currentIds.seasons++;
    const now = new Date();
    const season: Season = { 
      ...insertSeason, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.seasonsMap.set(id, season);
    return season;
  }

  // Episodes methods
  async getEpisodesBySeasonId(seasonId: number): Promise<Episode[]> {
    return Array.from(this.episodesMap.values())
      .filter(episode => episode.seasonId === seasonId)
      .sort((a, b) => a.episodeNumber - b.episodeNumber);
  }

  async createEpisode(insertEpisode: InsertEpisode): Promise<Episode> {
    const id = this.currentIds.episodes++;
    const now = new Date();
    const episode: Episode = { 
      ...insertEpisode, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.episodesMap.set(id, episode);
    return episode;
  }

  // Videos methods
  async getVideosByContentId(contentId: number): Promise<Video[]> {
    return Array.from(this.videosMap.values())
      .filter(video => video.contentId === contentId);
  }

  async getVideosByEpisodeId(episodeId: number): Promise<Video[]> {
    return Array.from(this.videosMap.values())
      .filter(video => video.episodeId === episodeId);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.currentIds.videos++;
    const now = new Date();
    const video: Video = { 
      ...insertVideo, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.videosMap.set(id, video);
    return video;
  }

  // Genres methods
  async getAllGenres(): Promise<Genre[]> {
    return Array.from(this.genresMap.values());
  }

  async getGenresByContentId(contentId: number): Promise<Genre[]> {
    // Find genre IDs associated with this content
    const genreIds = Array.from(this.contentGenresMap.values())
      .filter(cg => cg.contentId === contentId)
      .map(cg => cg.genreId);
    
    // Get the genre objects
    return genreIds.map(id => this.genresMap.get(id)).filter(Boolean) as Genre[];
  }

  async createGenre(insertGenre: InsertGenre): Promise<Genre> {
    const id = this.currentIds.genres++;
    const now = new Date();
    const genre: Genre = { 
      ...insertGenre, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.genresMap.set(id, genre);
    return genre;
  }

  async addGenreToContent(contentId: number, genreId: number): Promise<void> {
    const id = this.currentIds.contentGenres++;
    this.contentGenresMap.set(id, { contentId, genreId });
  }
  
  async deleteGenre(id: number): Promise<void> {
    // Delete the genre
    this.genresMap.delete(id);
    
    // Delete all associations with content
    Array.from(this.contentGenresMap.entries())
      .filter(([_, item]) => item.genreId === id)
      .forEach(([key, _]) => {
        this.contentGenresMap.delete(key);
      });
  }

  // Tags methods
  async getAllTags(): Promise<Tag[]> {
    return Array.from(this.tagsMap.values());
  }

  async getTagsByContentId(contentId: number): Promise<Tag[]> {
    // Find tag IDs associated with this content
    const tagIds = Array.from(this.contentTagsMap.values())
      .filter(ct => ct.contentId === contentId)
      .map(ct => ct.tagId);
    
    // Get the tag objects
    return tagIds.map(id => this.tagsMap.get(id)).filter(Boolean) as Tag[];
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const id = this.currentIds.tags++;
    const now = new Date();
    const tag: Tag = { 
      ...insertTag, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.tagsMap.set(id, tag);
    return tag;
  }

  async addTagToContent(contentId: number, tagId: number): Promise<void> {
    const id = this.currentIds.contentTags++;
    this.contentTagsMap.set(id, { contentId, tagId });
  }
  
  async deleteTag(id: number): Promise<void> {
    // Delete the tag
    this.tagsMap.delete(id);
    
    // Delete all associations with content
    Array.from(this.contentTagsMap.entries())
      .filter(([_, item]) => item.tagId === id)
      .forEach(([key, _]) => {
        this.contentTagsMap.delete(key);
      });
  }

  // Ratings methods
  async getRatingsByContentId(contentId: number): Promise<Rating[]> {
    return Array.from(this.ratingsMap.values())
      .filter(rating => rating.contentId === contentId);
  }

  async getUserRatingForContent(userId: number, contentId: number): Promise<Rating | undefined> {
    return Array.from(this.ratingsMap.values())
      .find(rating => rating.userId === userId && rating.contentId === contentId);
  }

  async createRating(insertRating: InsertRating): Promise<Rating> {
    const id = this.currentIds.ratings++;
    const now = new Date();
    const rating: Rating = { 
      ...insertRating, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.ratingsMap.set(id, rating);
    return rating;
  }

  async updateRating(id: number, score: number): Promise<Rating | undefined> {
    const rating = this.ratingsMap.get(id);
    if (!rating) return undefined;
    
    const updatedRating = { 
      ...rating, 
      score, 
      updatedAt: new Date() 
    };
    this.ratingsMap.set(id, updatedRating);
    return updatedRating;
  }

  // Reviews methods
  async getReviewsByContentId(contentId: number): Promise<Review[]> {
    return Array.from(this.reviewsMap.values())
      .filter(review => review.contentId === contentId && review.isApproved)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentIds.reviews++;
    const now = new Date();
    const review: Review = { 
      ...insertReview, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.reviewsMap.set(id, review);
    return review;
  }

  async approveReview(id: number): Promise<void> {
    const review = this.reviewsMap.get(id);
    if (review) {
      this.reviewsMap.set(id, { ...review, isApproved: true, isRejected: false, updatedAt: new Date() });
    }
  }
  
  async rejectReview(id: number): Promise<void> {
    const review = this.reviewsMap.get(id);
    if (review) {
      this.reviewsMap.set(id, { ...review, isApproved: false, isRejected: true, updatedAt: new Date() });
    }
  }
  
  async deleteReview(id: number): Promise<void> {
    this.reviewsMap.delete(id);
  }
  
  async getReviewsCount(): Promise<number> {
    return this.reviewsMap.size;
  }
  
  async getPendingReviewsCount(): Promise<number> {
    return Array.from(this.reviewsMap.values()).filter(review => 
      !review.isApproved && !review.isRejected
    ).length;
  }
  
  async getFilteredReviews(page: number, limit: number, search: string, status: string): Promise<{ reviews: any[], totalItems: number, totalPages: number }> {
    let reviews = Array.from(this.reviewsMap.values());
    
    // Apply status filter
    if (status === 'pending') {
      reviews = reviews.filter(review => !review.isApproved && !review.isRejected);
    } else if (status === 'approved') {
      reviews = reviews.filter(review => review.isApproved === true);
    } else if (status === 'rejected') {
      reviews = reviews.filter(review => review.isRejected === true);
    }
    
    // Apply search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      reviews = reviews.filter(review => 
        review.text.toLowerCase().includes(lowerSearch) || 
        (review.title && review.title.toLowerCase().includes(lowerSearch))
      );
    }
    
    // Sort by creation date, newest first
    reviews = reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Get user and content details for each review
    const reviewsWithDetails = reviews.map(review => {
      const user = this.usersMap.get(review.userId);
      const content = this.contentMap.get(review.contentId);
      
      return {
        ...review,
        user: user ? {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role
        } : null,
        content: content ? {
          id: content.id,
          title: content.title,
          englishTitle: content.englishTitle,
          type: content.type,
          poster: content.poster
        } : null
      };
    });
    
    // Calculate pagination
    const totalItems = reviewsWithDetails.length;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;
    const paginatedReviews = reviewsWithDetails.slice(offset, offset + limit);
    
    return {
      reviews: paginatedReviews,
      totalItems,
      totalPages
    };
  }

  // Comments methods
  async getCommentsByContentId(contentId: number): Promise<Comment[]> {
    return Array.from(this.commentsMap.values())
      .filter(comment => comment.contentId === contentId && comment.isApproved)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentIds.comments++;
    const now = new Date();
    const comment: Comment = { 
      ...insertComment, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.commentsMap.set(id, comment);
    return comment;
  }

  async approveComment(id: number): Promise<void> {
    const comment = this.commentsMap.get(id);
    if (comment) {
      this.commentsMap.set(id, { ...comment, isApproved: true, isRejected: false, updatedAt: new Date() });
    }
  }

  async rejectComment(id: number): Promise<void> {
    const comment = this.commentsMap.get(id);
    if (comment) {
      this.commentsMap.set(id, { ...comment, isApproved: false, isRejected: true, updatedAt: new Date() });
    }
  }

  async deleteComment(id: number): Promise<void> {
    this.commentsMap.delete(id);
  }

  async getCommentsCount(): Promise<number> {
    return this.commentsMap.size;
  }

  async getPendingCommentsCount(): Promise<number> {
    return Array.from(this.commentsMap.values()).filter(comment => 
      !comment.isApproved && !comment.isRejected
    ).length;
  }

  async getFilteredComments(page: number, limit: number, search: string, status: string): Promise<{ comments: any[], totalItems: number, totalPages: number }> {
    let comments = Array.from(this.commentsMap.values());
    
    // Apply status filter
    if (status === 'pending') {
      comments = comments.filter(comment => !comment.isApproved && !comment.isRejected);
    } else if (status === 'approved') {
      comments = comments.filter(comment => comment.isApproved === true);
    } else if (status === 'rejected') {
      comments = comments.filter(comment => comment.isRejected === true);
    }
    
    // Apply search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      comments = comments.filter(comment => 
        comment.text.toLowerCase().includes(lowerSearch)
      );
    }
    
    // Sort by creation date, newest first
    comments = comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Get user and content details for each comment
    const commentsWithDetails = comments.map(comment => {
      const user = this.usersMap.get(comment.userId);
      const content = this.contentMap.get(comment.contentId);
      
      return {
        ...comment,
        user: user ? {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role
        } : null,
        content: content ? {
          id: content.id,
          title: content.title,
          englishTitle: content.englishTitle,
          type: content.type,
          poster: content.poster
        } : null
      };
    });
    
    // Calculate pagination
    const totalItems = commentsWithDetails.length;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;
    const paginatedComments = commentsWithDetails.slice(offset, offset + limit);
    
    return {
      comments: paginatedComments,
      totalItems,
      totalPages
    };
  }

  // Watchlist methods
  async getUserWatchlist(userId: number): Promise<Content[]> {
    // Find content IDs in the user's watchlist
    const contentIds = Array.from(this.watchlistMap.values())
      .filter(item => item.userId === userId)
      .map(item => item.contentId);
    
    // Get the content objects
    return contentIds
      .map(id => this.contentMap.get(id))
      .filter(Boolean) as Content[];
  }

  async addToWatchlist(insertWatchlist: InsertWatchlist): Promise<Watchlist> {
    // Check if already exists
    const exists = Array.from(this.watchlistMap.values()).find(
      item => item.userId === insertWatchlist.userId && item.contentId === insertWatchlist.contentId
    );
    
    if (exists) return exists;
    
    const id = this.currentIds.watchlist++;
    const now = new Date();
    const watchlistItem: Watchlist = { 
      ...insertWatchlist, 
      id, 
      createdAt: now
    };
    this.watchlistMap.set(id, watchlistItem);
    return watchlistItem;
  }

  async removeFromWatchlist(userId: number, contentId: number): Promise<void> {
    const item = Array.from(this.watchlistMap.entries()).find(
      ([_, item]) => item.userId === userId && item.contentId === contentId
    );
    
    if (item) {
      this.watchlistMap.delete(item[0]);
    }
  }

  async isInWatchlist(userId: number, contentId: number): Promise<boolean> {
    return Array.from(this.watchlistMap.values()).some(
      item => item.userId === userId && item.contentId === contentId
    );
  }

  // Favorites methods
  async getUserFavorites(userId: number): Promise<Content[]> {
    // Find content IDs in the user's favorites
    const contentIds = Array.from(this.favoritesMap.values())
      .filter(item => item.userId === userId)
      .map(item => item.contentId);
    
    // Get the content objects
    return contentIds
      .map(id => this.contentMap.get(id))
      .filter(Boolean) as Content[];
  }

  async addToFavorites(insertFavorite: InsertFavorite): Promise<Favorite> {
    // Check if already exists
    const exists = Array.from(this.favoritesMap.values()).find(
      item => item.userId === insertFavorite.userId && item.contentId === insertFavorite.contentId
    );
    
    if (exists) return exists;
    
    const id = this.currentIds.favorites++;
    const now = new Date();
    const favoriteItem: Favorite = { 
      ...insertFavorite, 
      id, 
      createdAt: now
    };
    this.favoritesMap.set(id, favoriteItem);
    return favoriteItem;
  }

  async removeFromFavorites(userId: number, contentId: number): Promise<void> {
    const item = Array.from(this.favoritesMap.entries()).find(
      ([_, item]) => item.userId === userId && item.contentId === contentId
    );
    
    if (item) {
      this.favoritesMap.delete(item[0]);
    }
  }

  async isInFavorites(userId: number, contentId: number): Promise<boolean> {
    return Array.from(this.favoritesMap.values()).some(
      item => item.userId === userId && item.contentId === contentId
    );
  }

  // Watch History methods
  async getUserWatchHistory(userId: number): Promise<any[]> {
    return Array.from(this.watchHistoryMap.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async addToWatchHistory(userId: number, contentId: number, episodeId?: number, position: number = 0): Promise<void> {
    // Check if already exists
    const existingItem = Array.from(this.watchHistoryMap.values()).find(
      item => item.userId === userId && item.contentId === contentId && 
      (episodeId ? item.episodeId === episodeId : !item.episodeId)
    );
    
    if (existingItem) {
      // Update existing item
      await this.updateWatchHistory(userId, contentId, episodeId, position);
      return;
    }
    
    // Add new item
    const id = this.currentIds.watchHistory++;
    const now = new Date();
    
    this.watchHistoryMap.set(id, {
      id,
      userId,
      contentId,
      episodeId: episodeId || null,
      position,
      completed: false,
      createdAt: now,
      updatedAt: now
    });
  }

  async updateWatchHistory(
    userId: number, 
    contentId: number, 
    episodeId?: number, 
    position?: number, 
    completed?: boolean
  ): Promise<void> {
    const existingItemEntry = Array.from(this.watchHistoryMap.entries()).find(
      ([_, item]) => item.userId === userId && item.contentId === contentId && 
      (episodeId ? item.episodeId === episodeId : !item.episodeId)
    );
    
    if (existingItemEntry) {
      const [id, item] = existingItemEntry;
      const updatedItem = { 
        ...item,
        position: position !== undefined ? position : item.position,
        completed: completed !== undefined ? completed : item.completed,
        updatedAt: new Date()
      };
      
      this.watchHistoryMap.set(id, updatedItem);
    }
  }

  // Playlists methods
  async getUserPlaylists(userId: number): Promise<Playlist[]> {
    return Array.from(this.playlistsMap.values())
      .filter(playlist => playlist.userId === userId);
  }

  async getPlaylistById(id: number): Promise<Playlist | undefined> {
    return this.playlistsMap.get(id);
  }

  async getPlaylistItems(playlistId: number): Promise<Content[]> {
    // Find content IDs in the playlist
    const playlistItems = Array.from(this.playlistItemsMap.values())
      .filter(item => item.playlistId === playlistId)
      .sort((a, b) => a.order - b.order);
    
    // Get the content objects
    return playlistItems
      .map(item => this.contentMap.get(item.contentId))
      .filter(Boolean) as Content[];
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = this.currentIds.playlists++;
    const now = new Date();
    const playlist: Playlist = { 
      ...insertPlaylist, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.playlistsMap.set(id, playlist);
    return playlist;
  }

  async addToPlaylist(playlistId: number, contentId: number, order: number): Promise<void> {
    const id = this.currentIds.playlistItems++;
    
    this.playlistItemsMap.set(id, {
      playlistId,
      contentId,
      order
    });
  }

  async removeFromPlaylist(playlistId: number, contentId: number): Promise<void> {
    const item = Array.from(this.playlistItemsMap.entries()).find(
      ([_, item]) => item.playlistId === playlistId && item.contentId === contentId
    );
    
    if (item) {
      this.playlistItemsMap.delete(item[0]);
    }
  }
  
  // Password reset methods
  async createVerificationCode(email: string): Promise<string> {
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    
    // Store the verification code
    this.verificationCodesMap.set(email, {
      email,
      code,
      expiresAt
    });
    
    return code;
  }
  
  async verifyCode(email: string, code: string): Promise<boolean> {
    const verificationData = this.verificationCodesMap.get(email);
    
    if (!verificationData) {
      return false;
    }
    
    // Check if code is expired
    if (new Date() > verificationData.expiresAt) {
      this.verificationCodesMap.delete(email);
      return false;
    }
    
    // Check if code matches
    if (verificationData.code !== code) {
      return false;
    }
    
    // Code is valid, remove it and create a reset token
    this.verificationCodesMap.delete(email);
    return true;
  }
  
  async createResetToken(email: string): Promise<string> {
    // Generate a random token
    const token = Array.from(Array(32), () => Math.floor(Math.random() * 36).toString(36)).join('');
    
    // Set expiration time (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    // Store the reset token
    this.resetTokensMap.set(email, {
      email,
      token,
      expiresAt
    });
    
    return token;
  }
  
  async verifyResetToken(email: string, token: string): Promise<boolean> {
    const resetData = this.resetTokensMap.get(email);
    
    if (!resetData) {
      return false;
    }
    
    // Check if token is expired
    if (new Date() > resetData.expiresAt) {
      this.resetTokensMap.delete(email);
      return false;
    }
    
    // Check if token matches
    if (resetData.token !== token) {
      return false;
    }
    
    return true;
  }
  
  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    
    if (!user) {
      return false;
    }
    
    // Hash the new password and update user's password
    const hashedPassword = await hashPassword(newPassword);
    await this.updateUser(user.id, { password: hashedPassword });
    
    // Remove the reset token
    this.resetTokensMap.delete(email);
    
    return true;
  }

  // Content recommendation methods
  async getRecommendedContent(userId: number | null, limit: number = 5): Promise<Content[]> {
    try {
      // دریافت کاربر
      const user = userId ? await this.getUser(userId) : null;
      
      // دریافت تاریخچه تماشا و محتواهای مورد علاقه کاربر
      let watchHistory: any[] = [];
      let favorites: Content[] = [];
      
      if (userId) {
        watchHistory = await this.getUserWatchHistory(userId);
        favorites = await this.getUserFavorites(userId);
      }
      
      // دریافت همه محتواها
      const allContent = Array.from(this.contentMap.values());
      
      // اگر کاربر وجود دارد و علاقه‌مندی‌ها دارد، محتوای مشابه با علاقه‌مندی‌ها را برگردان
      if (userId && favorites.length > 0) {
        // دسته‌بندی محتوا براساس ژانر محتواهای مورد علاقه
        const favoriteGenreIds = favorites
          .flatMap(fav => fav.genres || [])
          .map(g => g.id);
        
        const recommendedByGenre = allContent
          .filter(c => !favorites.some(f => f.id === c.id)) // حذف محتواهایی که قبلاً در علاقه‌مندی‌ها هستند
          .filter(c => {
            const contentGenreIds = (c.genres || []).map(g => g.id);
            return contentGenreIds.some(id => favoriteGenreIds.includes(id));
          })
          .sort((a, b) => b.imdbRating - a.imdbRating)
          .slice(0, limit);
        
        if (recommendedByGenre.length > 0) {
          return recommendedByGenre;
        }
      }
      
      // در غیر این صورت، محتواهای با بالاترین امتیاز را برگردان
      return allContent
        .sort((a, b) => b.imdbRating - a.imdbRating)
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting AI recommended content:", error);
      // در صورت خطا، محتواهای جدید را برگردان
      return this.getLatestContent(limit);
    }
  }
  
  async getSimilarContent(contentId: number, limit: number = 5): Promise<Content[]> {
    try {
      // دریافت محتوای مورد نظر
      const contentItem = await this.getContentById(contentId);
      
      if (!contentItem) {
        throw new Error(`Content with ID ${contentId} not found`);
      }
      
      // دریافت همه محتواها
      const allContent = Array.from(this.contentMap.values());
      
      // یافتن محتواهای مشابه براساس نوع محتوا
      const similarByType = allContent
        .filter(c => c.id !== contentItem.id) // حذف خود محتوا
        .filter(c => c.type === contentItem.type) // فقط محتوای هم‌نوع
        .sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0)) // مرتب‌سازی بر اساس امتیاز
        .slice(0, limit);
      
      if (similarByType.length > 0) {
        return similarByType;
      }
      
      // اگر محتوای مشابه براساس نوع یافت نشد، محتواهای با امتیاز بالا را برگردان
      return allContent
        .filter(c => c.id !== contentItem.id) // حذف خود محتوا
        .sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0))
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting similar content:", error);
      
      // در صورت خطا، محتواهای جدید هم‌نوع را برگردان
      const contentItem = await this.getContentById(contentId);
      if (contentItem) {
        return this.getContentByType(contentItem.type, limit);
      }
      
      return this.getLatestContent(limit);
    }
  }
}

export const storage = new MemStorage();
