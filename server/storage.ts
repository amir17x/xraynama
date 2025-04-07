import { users, User, InsertUser, contents, Content, InsertContent, episodes, Episode, InsertEpisode,
  qualitySources, QualitySource, InsertQualitySource, ratings, Rating, InsertRating,
  reviews, Review, InsertReview, comments, Comment, InsertComment, watchHistory,
  WatchHistory, InsertWatchHistory, favorites, Favorite, InsertFavorite, playlists,
  Playlist, InsertPlaylist, playlistItems, PlaylistItem, InsertPlaylistItem, 
  watchParties, WatchParty, InsertWatchParty, watchPartyMembers, WatchPartyMember, 
  InsertWatchPartyMember, watchPartyChatMessages, WatchPartyChatMessage, InsertWatchPartyChatMessage } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(id: number, points: number): Promise<User | undefined>;
  
  // Content management
  getContent(id: number): Promise<Content | undefined>;
  getAllContents(type?: string, limit?: number): Promise<Content[]>;
  searchContents(query: string, filters?: Record<string, any>): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  
  // Episode management
  getEpisodes(contentId: number): Promise<Episode[]>;
  getEpisode(id: number): Promise<Episode | undefined>;
  createEpisode(episode: InsertEpisode): Promise<Episode>;
  
  // Quality sources management
  getQualitySources(contentId?: number, episodeId?: number): Promise<QualitySource[]>;
  createQualitySource(source: InsertQualitySource): Promise<QualitySource>;
  
  // Ratings management
  getRatings(contentId: number): Promise<Rating[]>;
  getUserRating(userId: number, contentId: number): Promise<Rating | undefined>;
  createRating(rating: InsertRating): Promise<Rating>;
  
  // Reviews management
  getReviews(contentId: number, approved?: boolean): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  toggleReviewApproval(id: number): Promise<Review | undefined>;
  likeReview(id: number): Promise<Review | undefined>;
  dislikeReview(id: number): Promise<Review | undefined>;
  
  // Comments management
  getComments(contentId: number, approved?: boolean): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  toggleCommentApproval(id: number): Promise<Comment | undefined>;
  likeComment(id: number): Promise<Comment | undefined>;
  dislikeComment(id: number): Promise<Comment | undefined>;
  
  // Watch history management
  getWatchHistory(userId: number): Promise<WatchHistory[]>;
  updateWatchProgress(userId: number, contentId: number, episodeId: number | null, progress: number, completed: boolean): Promise<WatchHistory | undefined>;
  
  // Favorites management
  getFavorites(userId: number): Promise<Favorite[]>;
  addFavorite(userId: number, contentId: number): Promise<Favorite>;
  removeFavorite(userId: number, contentId: number): Promise<boolean>;
  
  // Playlist management
  getPlaylists(userId: number): Promise<Playlist[]>;
  getPlaylist(id: number): Promise<Playlist | undefined>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  addToPlaylist(playlistId: number, contentId: number, order: number): Promise<PlaylistItem>;
  removeFromPlaylist(playlistId: number, contentId: number): Promise<boolean>;
  
  // Watch party management
  createWatchParty(watchParty: InsertWatchParty): Promise<WatchParty>;
  getWatchParty(partyCode: string): Promise<WatchParty | undefined>;
  joinWatchParty(partyId: number, userId: number): Promise<WatchPartyMember>;
  getWatchPartyMembers(partyId: number): Promise<WatchPartyMember[]>;
  addWatchPartyChatMessage(message: InsertWatchPartyChatMessage): Promise<WatchPartyChatMessage>;
  getWatchPartyChatMessages(partyId: number): Promise<WatchPartyChatMessage[]>;
  
  // Session storage
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contents: Map<number, Content>;
  private episodes: Map<number, Episode>;
  private qualitySources: Map<number, QualitySource>;
  private ratings: Map<number, Rating>;
  private reviews: Map<number, Review>;
  private comments: Map<number, Comment>;
  private watchHistories: Map<number, WatchHistory>;
  private favorites: Map<number, Favorite>;
  private playlists: Map<number, Playlist>;
  private playlistItems: Map<number, PlaylistItem>;
  private watchParties: Map<number, WatchParty>;
  private watchPartyMembers: Map<number, WatchPartyMember>;
  private watchPartyChatMessages: Map<number, WatchPartyChatMessage>;

  private currentIds: {
    users: number;
    contents: number;
    episodes: number;
    qualitySources: number;
    ratings: number;
    reviews: number;
    comments: number;
    watchHistories: number;
    favorites: number;
    playlists: number;
    playlistItems: number;
    watchParties: number;
    watchPartyMembers: number;
    watchPartyChatMessages: number;
  };

  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.contents = new Map();
    this.episodes = new Map();
    this.qualitySources = new Map();
    this.ratings = new Map();
    this.reviews = new Map();
    this.comments = new Map();
    this.watchHistories = new Map();
    this.favorites = new Map();
    this.playlists = new Map();
    this.playlistItems = new Map();
    this.watchParties = new Map();
    this.watchPartyMembers = new Map();
    this.watchPartyChatMessages = new Map();

    this.currentIds = {
      users: 1,
      contents: 1,
      episodes: 1,
      qualitySources: 1,
      ratings: 1,
      reviews: 1,
      comments: 1,
      watchHistories: 1,
      favorites: 1,
      playlists: 1,
      playlistItems: 1,
      watchParties: 1,
      watchPartyMembers: 1,
      watchPartyChatMessages: 1,
    };

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const now = new Date();
    const user: User = { 
      ...userData, 
      id,
      points: 0,
      createdAt: now,
      badges: [],
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPoints(id: number, points: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      points: user.points + points 
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Content methods
  async getContent(id: number): Promise<Content | undefined> {
    return this.contents.get(id);
  }

  async getAllContents(type?: string, limit?: number): Promise<Content[]> {
    let contents = Array.from(this.contents.values());
    
    if (type) {
      contents = contents.filter(content => content.type === type);
    }
    
    contents.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    if (limit) {
      contents = contents.slice(0, limit);
    }
    
    return contents;
  }

  async searchContents(query: string, filters?: Record<string, any>): Promise<Content[]> {
    let contents = Array.from(this.contents.values());
    
    // Text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      contents = contents.filter(content => 
        content.title.toLowerCase().includes(lowerQuery) || 
        content.englishTitle.toLowerCase().includes(lowerQuery) ||
        (content.synopsis && content.synopsis.toLowerCase().includes(lowerQuery)) ||
        (content.director && content.director.toLowerCase().includes(lowerQuery)) ||
        (content.actors && content.actors.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Apply filters
    if (filters) {
      if (filters.type) {
        contents = contents.filter(content => content.type === filters.type);
      }
      
      if (filters.year) {
        contents = contents.filter(content => content.year === filters.year);
      }
      
      if (filters.genres && filters.genres.length) {
        contents = contents.filter(content => 
          content.genres.some(genre => filters.genres.includes(genre))
        );
      }
      
      if (filters.tags && filters.tags.length) {
        contents = contents.filter(content => 
          content.tags.some(tag => filters.tags.includes(tag))
        );
      }
      
      if (filters.minRating) {
        contents = contents.filter(content => {
          const rating = parseFloat(content.imdbRating || "0");
          return rating >= filters.minRating;
        });
      }
    }
    
    return contents;
  }

  async createContent(contentData: InsertContent): Promise<Content> {
    const id = this.currentIds.contents++;
    const now = new Date();
    const content: Content = {
      ...contentData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.contents.set(id, content);
    return content;
  }

  // Episode methods
  async getEpisodes(contentId: number): Promise<Episode[]> {
    return Array.from(this.episodes.values())
      .filter(episode => episode.contentId === contentId)
      .sort((a, b) => {
        if (a.season !== b.season) {
          return a.season - b.season;
        }
        return a.episode - b.episode;
      });
  }

  async getEpisode(id: number): Promise<Episode | undefined> {
    return this.episodes.get(id);
  }

  async createEpisode(episodeData: InsertEpisode): Promise<Episode> {
    const id = this.currentIds.episodes++;
    const episode: Episode = {
      ...episodeData,
      id
    };
    this.episodes.set(id, episode);
    return episode;
  }

  // Quality sources methods
  async getQualitySources(contentId?: number, episodeId?: number): Promise<QualitySource[]> {
    let sources = Array.from(this.qualitySources.values());
    
    if (contentId) {
      sources = sources.filter(source => source.contentId === contentId);
    }
    
    if (episodeId) {
      sources = sources.filter(source => source.episodeId === episodeId);
    }
    
    return sources;
  }

  async createQualitySource(sourceData: InsertQualitySource): Promise<QualitySource> {
    const id = this.currentIds.qualitySources++;
    const source: QualitySource = {
      ...sourceData,
      id
    };
    this.qualitySources.set(id, source);
    return source;
  }

  // Ratings methods
  async getRatings(contentId: number): Promise<Rating[]> {
    return Array.from(this.ratings.values())
      .filter(rating => rating.contentId === contentId);
  }

  async getUserRating(userId: number, contentId: number): Promise<Rating | undefined> {
    return Array.from(this.ratings.values())
      .find(rating => rating.userId === userId && rating.contentId === contentId);
  }

  async createRating(ratingData: InsertRating): Promise<Rating> {
    // Check if user already rated this content
    const existingRating = await this.getUserRating(ratingData.userId, ratingData.contentId);
    
    if (existingRating) {
      // Update existing rating
      const updatedRating: Rating = {
        ...existingRating,
        rating: ratingData.rating,
      };
      this.ratings.set(existingRating.id, updatedRating);
      return updatedRating;
    }
    
    // Create new rating
    const id = this.currentIds.ratings++;
    const now = new Date();
    const rating: Rating = {
      ...ratingData,
      id,
      createdAt: now,
    };
    this.ratings.set(id, rating);
    return rating;
  }

  // Reviews methods
  async getReviews(contentId: number, approved?: boolean): Promise<Review[]> {
    let reviews = Array.from(this.reviews.values())
      .filter(review => review.contentId === contentId);
    
    if (approved !== undefined) {
      reviews = reviews.filter(review => review.approved === approved);
    }
    
    return reviews.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.currentIds.reviews++;
    const now = new Date();
    const review: Review = {
      ...reviewData,
      id,
      approved: false,
      likes: 0,
      dislikes: 0,
      createdAt: now,
    };
    this.reviews.set(id, review);
    return review;
  }

  async toggleReviewApproval(id: number): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    
    const updatedReview: Review = {
      ...review,
      approved: !review.approved,
    };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }

  async likeReview(id: number): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    
    const updatedReview: Review = {
      ...review,
      likes: review.likes + 1,
    };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }

  async dislikeReview(id: number): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    
    const updatedReview: Review = {
      ...review,
      dislikes: review.dislikes + 1,
    };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }

  // Comments methods
  async getComments(contentId: number, approved?: boolean): Promise<Comment[]> {
    let comments = Array.from(this.comments.values())
      .filter(comment => comment.contentId === contentId);
    
    if (approved !== undefined) {
      comments = comments.filter(comment => comment.approved === approved);
    }
    
    return comments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const id = this.currentIds.comments++;
    const now = new Date();
    const comment: Comment = {
      ...commentData,
      id,
      approved: false,
      likes: 0,
      dislikes: 0,
      createdAt: now,
    };
    this.comments.set(id, comment);
    return comment;
  }

  async toggleCommentApproval(id: number): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;
    
    const updatedComment: Comment = {
      ...comment,
      approved: !comment.approved,
    };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }

  async likeComment(id: number): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;
    
    const updatedComment: Comment = {
      ...comment,
      likes: comment.likes + 1,
    };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }

  async dislikeComment(id: number): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;
    
    const updatedComment: Comment = {
      ...comment,
      dislikes: comment.dislikes + 1,
    };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }

  // Watch history methods
  async getWatchHistory(userId: number): Promise<WatchHistory[]> {
    return Array.from(this.watchHistories.values())
      .filter(history => history.userId === userId)
      .sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }

  async updateWatchProgress(
    userId: number, 
    contentId: number, 
    episodeId: number | null, 
    progress: number, 
    completed: boolean
  ): Promise<WatchHistory | undefined> {
    // Check if entry exists
    const existingEntry = Array.from(this.watchHistories.values()).find(
      history => history.userId === userId && 
                history.contentId === contentId && 
                history.episodeId === episodeId
    );
    
    const now = new Date();
    
    if (existingEntry) {
      // Update existing entry
      const updatedEntry: WatchHistory = {
        ...existingEntry,
        progress,
        completed,
        updatedAt: now,
      };
      this.watchHistories.set(existingEntry.id, updatedEntry);
      return updatedEntry;
    }
    
    // Create new entry
    const id = this.currentIds.watchHistories++;
    const newEntry: WatchHistory = {
      id,
      userId,
      contentId,
      episodeId,
      progress,
      completed,
      createdAt: now,
      updatedAt: now,
    };
    this.watchHistories.set(id, newEntry);
    return newEntry;
  }

  // Favorites methods
  async getFavorites(userId: number): Promise<Favorite[]> {
    return Array.from(this.favorites.values())
      .filter(favorite => favorite.userId === userId)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async addFavorite(userId: number, contentId: number): Promise<Favorite> {
    // Check if already in favorites
    const existingFavorite = Array.from(this.favorites.values()).find(
      fav => fav.userId === userId && fav.contentId === contentId
    );
    
    if (existingFavorite) {
      return existingFavorite;
    }
    
    // Add to favorites
    const id = this.currentIds.favorites++;
    const now = new Date();
    const favorite: Favorite = {
      id,
      userId,
      contentId,
      createdAt: now,
    };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFavorite(userId: number, contentId: number): Promise<boolean> {
    const favorite = Array.from(this.favorites.values()).find(
      fav => fav.userId === userId && fav.contentId === contentId
    );
    
    if (!favorite) {
      return false;
    }
    
    return this.favorites.delete(favorite.id);
  }

  // Playlist methods
  async getPlaylists(userId: number): Promise<Playlist[]> {
    return Array.from(this.playlists.values())
      .filter(playlist => playlist.userId === userId)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }

  async createPlaylist(playlistData: InsertPlaylist): Promise<Playlist> {
    const id = this.currentIds.playlists++;
    const now = new Date();
    const playlist: Playlist = {
      ...playlistData,
      id,
      createdAt: now,
    };
    this.playlists.set(id, playlist);
    return playlist;
  }

  async addToPlaylist(playlistId: number, contentId: number, order: number): Promise<PlaylistItem> {
    // Check if item already in playlist
    const existingItem = Array.from(this.playlistItems.values()).find(
      item => item.playlistId === playlistId && item.contentId === contentId
    );
    
    if (existingItem) {
      // Update order if needed
      if (existingItem.order !== order) {
        const updatedItem: PlaylistItem = {
          ...existingItem,
          order,
        };
        this.playlistItems.set(existingItem.id, updatedItem);
        return updatedItem;
      }
      return existingItem;
    }
    
    // Add new item
    const id = this.currentIds.playlistItems++;
    const now = new Date();
    const playlistItem: PlaylistItem = {
      id,
      playlistId,
      contentId,
      order,
      addedAt: now,
    };
    this.playlistItems.set(id, playlistItem);
    return playlistItem;
  }

  async removeFromPlaylist(playlistId: number, contentId: number): Promise<boolean> {
    const item = Array.from(this.playlistItems.values()).find(
      item => item.playlistId === playlistId && item.contentId === contentId
    );
    
    if (!item) {
      return false;
    }
    
    return this.playlistItems.delete(item.id);
  }

  // Watch party methods
  async createWatchParty(watchPartyData: InsertWatchParty): Promise<WatchParty> {
    const id = this.currentIds.watchParties++;
    const now = new Date();
    const watchParty: WatchParty = {
      ...watchPartyData,
      id,
      isActive: true,
      createdAt: now,
    };
    this.watchParties.set(id, watchParty);
    return watchParty;
  }

  async getWatchParty(partyCode: string): Promise<WatchParty | undefined> {
    return Array.from(this.watchParties.values()).find(
      party => party.partyCode === partyCode && party.isActive
    );
  }

  async joinWatchParty(partyId: number, userId: number): Promise<WatchPartyMember> {
    // Check if already a member
    const existingMember = Array.from(this.watchPartyMembers.values()).find(
      member => member.partyId === partyId && member.userId === userId
    );
    
    if (existingMember) {
      return existingMember;
    }
    
    // Add member
    const id = this.currentIds.watchPartyMembers++;
    const now = new Date();
    const member: WatchPartyMember = {
      id,
      partyId,
      userId,
      joinedAt: now,
    };
    this.watchPartyMembers.set(id, member);
    return member;
  }

  async getWatchPartyMembers(partyId: number): Promise<WatchPartyMember[]> {
    return Array.from(this.watchPartyMembers.values())
      .filter(member => member.partyId === partyId)
      .sort((a, b) => 
        new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
      );
  }

  async addWatchPartyChatMessage(messageData: InsertWatchPartyChatMessage): Promise<WatchPartyChatMessage> {
    const id = this.currentIds.watchPartyChatMessages++;
    const now = new Date();
    const message: WatchPartyChatMessage = {
      ...messageData,
      id,
      createdAt: now,
    };
    this.watchPartyChatMessages.set(id, message);
    return message;
  }

  async getWatchPartyChatMessages(partyId: number): Promise<WatchPartyChatMessage[]> {
    return Array.from(this.watchPartyChatMessages.values())
      .filter(message => message.partyId === partyId)
      .sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }
}

export const storage = new MemStorage();
