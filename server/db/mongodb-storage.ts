import { connectToMongoDB } from './mongo';
import mongoose from 'mongoose';
import { IStorage } from '../storage';
import { 
  User, InsertUser, Content, InsertContent,
  Season, InsertSeason, Episode, InsertEpisode,
  Video, InsertVideo, Genre, InsertGenre,
  Tag, InsertTag, Rating, InsertRating, 
  Review, InsertReview, Comment, InsertComment, 
  Watchlist, InsertWatchlist, Favorite, InsertFavorite, 
  Playlist, InsertPlaylist
} from '@shared/schema';

import {
  User as UserModel,
  Content as ContentModel,
  Season as SeasonModel,
  Episode as EpisodeModel,
  Video as VideoModel,
  Genre as GenreModel,
  Tag as TagModel,
  ContentGenre,
  ContentTag,
  Rating as RatingModel,
  Review as ReviewModel,
  Comment as CommentModel,
  Watchlist as WatchlistModel,
  Favorite as FavoriteModel,
  WatchHistory,
  Playlist as PlaylistModel,
  PlaylistItem,
  VerificationCode,
  ResetToken
} from '../models/mongoose';
import session from 'express-session';
import * as connectMongoDBSession from 'connect-mongodb-session';
import { Schema, Document } from 'mongoose';

const MongoDBStore = connectMongoDBSession.default(session);

export class MongoDBStorage implements IStorage {
  // Lazy-loaded session store
  private _sessionStore: any = null;
  
  public get sessionStore(): any {
    // Lazy initialize the session store only when needed
    if (!this._sessionStore) {
      this._sessionStore = new MongoDBStore({
        uri: process.env.MONGODB_URI!,
        collection: 'sessions',
        expires: 1000 * 60 * 60 * 24 * 7, // 1 week
        // Use a standard connection options format
        // that's compatible with MongoDBStore
      });

      // Handle session store errors
      this._sessionStore.on('error', (error: any) => {
        console.error('Session store error:', error);
      });
    }
    return this._sessionStore;
  }

  constructor() {
    // Defer session store creation until actually needed
  }

  // Initialize connection to MongoDB
  async init() {
    await connectToMongoDB();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = await UserModel.findById(id);
      if (!user) return undefined;
      
      return this.mongoUserToUser(user);
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ username });
      if (!user) return undefined;
      
      return this.mongoUserToUser(user);
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ email });
      if (!user) return undefined;
      
      return this.mongoUserToUser(user);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const newUser = new UserModel({
        ...insertUser,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedUser = await newUser.save();
      return this.mongoUserToUser(savedUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        id, 
        { ...userData, updatedAt: new Date() }, 
        { new: true }
      );
      
      if (!updatedUser) return undefined;
      return this.mongoUserToUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  // Content operations
  async getAllContent(limit: number = 10, offset: number = 0): Promise<Content[]> {
    try {
      const contents = await ContentModel.find()
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);

      return contents.map(this.mongoContentToContent);
    } catch (error) {
      console.error('Error fetching all content:', error);
      return [];
    }
  }

  async getContentById(id: number): Promise<Content | undefined> {
    try {
      const content = await ContentModel.findById(id);
      if (!content) return undefined;
      
      return this.mongoContentToContent(content);
    } catch (error) {
      console.error('Error fetching content by ID:', error);
      return undefined;
    }
  }

  async getContentBySlug(slug: string): Promise<Content | undefined> {
    try {
      // first try to see if this is a MongoDB ID
      if (/^[0-9a-fA-F]{24}$/.test(slug)) {
        try {
          const content = await ContentModel.findById(slug);
          if (content) {
            return this.mongoContentToContent(content);
          }
        } catch (err) {
          // If there's an error or not found as ID, continue to slug check
        }
      }
      
      // استفاده از englishTitle به‌جای شناسه MongoDB
      // حذف فاصله‌ها و استفاده از regex برای تطبیق دقیق‌تر
      const slugPattern = slug.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      
      const contents = await ContentModel.find({});
      const matchedContent = contents.find(content => {
        const contentSlug = (content.englishTitle || "").replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        return contentSlug === slugPattern;
      });
      
      if (!matchedContent) return undefined;
      
      return this.mongoContentToContent(matchedContent);
    } catch (error) {
      console.error('Error fetching content by slug:', error);
      return undefined;
    }
  }

  async getContentByType(type: string, limit: number = 10, offset: number = 0): Promise<Content[]> {
    try {
      const contents = await ContentModel.find({ type })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);

      return contents.map(this.mongoContentToContent);
    } catch (error) {
      console.error(`Error fetching content by type ${type}:`, error);
      return [];
    }
  }

  async searchContent(query: string, filters: any = {}): Promise<Content[]> {
    try {
      let searchQuery: any = {};
      
      // Basic search by title
      if (query) {
        searchQuery.$or = [
          { title: { $regex: query, $options: 'i' } },
          { englishTitle: { $regex: query, $options: 'i' } }
        ];
      }
      
      // Apply filters
      if (filters.type) {
        searchQuery.type = filters.type;
      }
      
      if (filters.year) {
        searchQuery.year = {};
        if (filters.year.from) searchQuery.year.$gte = filters.year.from;
        if (filters.year.to) searchQuery.year.$lte = filters.year.to;
      }
      
      const contents = await ContentModel.find(searchQuery).sort({ createdAt: -1 });
      
      // If there's a minimum rating filter, filter in memory after fetching
      if (filters.minRating) {
        const contentsWithRatings = await Promise.all(
          contents.map(async (content) => {
            const ratings = await RatingModel.find({ contentId: content._id });
            if (ratings.length === 0) return { content, avgRating: 0 };
            
            const avgRating = ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length;
            return { content, avgRating };
          })
        );
        
        return contentsWithRatings
          .filter(item => item.avgRating >= filters.minRating)
          .map(item => this.mongoContentToContent(item.content));
      }
      
      return contents.map(this.mongoContentToContent);
    } catch (error) {
      console.error('Error searching content:', error);
      return [];
    }
  }

  async getLatestContent(limit: number = 10): Promise<Content[]> {
    try {
      const contents = await ContentModel.find()
        .sort({ createdAt: -1 })
        .limit(limit);

      return contents.map(this.mongoContentToContent);
    } catch (error) {
      console.error('Error fetching latest content:', error);
      return [];
    }
  }

  async getTopRatedContent(limit: number = 10): Promise<Content[]> {
    try {
      // First get all content
      const allContents = await ContentModel.find();
      
      // Now calculate average ratings for each piece of content
      const contentsWithRatings = await Promise.all(
        allContents.map(async (content) => {
          const ratings = await RatingModel.find({ contentId: content._id });
          const avgRating = ratings.length > 0 
            ? ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length 
            : 0;
          
          return { content, avgRating };
        })
      );
      
      // Sort by average rating and return top N
      return contentsWithRatings
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, limit)
        .map(item => this.mongoContentToContent(item.content));
    } catch (error) {
      console.error('Error fetching top rated content:', error);
      return [];
    }
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    try {
      const newContent = new ContentModel({
        ...insertContent,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedContent = await newContent.save();
      return this.mongoContentToContent(savedContent);
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  }

  // Seasons operations
  async getSeasonsByContentId(contentId: number): Promise<Season[]> {
    try {
      const seasons = await SeasonModel.find({ contentId })
        .sort({ seasonNumber: 1 });

      return seasons.map(this.mongoSeasonToSeason);
    } catch (error) {
      console.error(`Error fetching seasons for content ${contentId}:`, error);
      return [];
    }
  }

  async createSeason(insertSeason: InsertSeason): Promise<Season> {
    try {
      const newSeason = new SeasonModel({
        ...insertSeason,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedSeason = await newSeason.save();
      return this.mongoSeasonToSeason(savedSeason);
    } catch (error) {
      console.error('Error creating season:', error);
      throw error;
    }
  }

  // Episodes operations
  async getEpisodesBySeasonId(seasonId: number): Promise<Episode[]> {
    try {
      const episodes = await EpisodeModel.find({ seasonId })
        .sort({ episodeNumber: 1 });

      return episodes.map(this.mongoEpisodeToEpisode);
    } catch (error) {
      console.error(`Error fetching episodes for season ${seasonId}:`, error);
      return [];
    }
  }

  async createEpisode(insertEpisode: InsertEpisode): Promise<Episode> {
    try {
      const newEpisode = new EpisodeModel({
        ...insertEpisode,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedEpisode = await newEpisode.save();
      return this.mongoEpisodeToEpisode(savedEpisode);
    } catch (error) {
      console.error('Error creating episode:', error);
      throw error;
    }
  }

  // Videos operations
  async getVideosByContentId(contentId: number): Promise<Video[]> {
    try {
      const videos = await VideoModel.find({ contentId });
      return videos.map(this.mongoVideoToVideo);
    } catch (error) {
      console.error(`Error fetching videos for content ${contentId}:`, error);
      return [];
    }
  }

  async getVideosByEpisodeId(episodeId: number): Promise<Video[]> {
    try {
      const videos = await VideoModel.find({ episodeId });
      return videos.map(this.mongoVideoToVideo);
    } catch (error) {
      console.error(`Error fetching videos for episode ${episodeId}:`, error);
      return [];
    }
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    try {
      const newVideo = new VideoModel({
        ...insertVideo,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedVideo = await newVideo.save();
      return this.mongoVideoToVideo(savedVideo);
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  }

  // Genres operations
  async getAllGenres(): Promise<Genre[]> {
    try {
      const genres = await GenreModel.find().sort({ name: 1 });
      return genres.map(this.mongoGenreToGenre);
    } catch (error) {
      console.error('Error fetching all genres:', error);
      return [];
    }
  }

  async getGenresByContentId(contentId: number): Promise<Genre[]> {
    try {
      // Find all content-genre relationships for this content
      const contentGenres = await ContentGenre.find({ contentId });
      
      // Get all genre IDs
      const genreIds = contentGenres.map(cg => cg.genreId);
      
      // Fetch all genres with these IDs
      const genres = await GenreModel.find({ _id: { $in: genreIds } });
      
      return genres.map(this.mongoGenreToGenre);
    } catch (error) {
      console.error(`Error fetching genres for content ${contentId}:`, error);
      return [];
    }
  }

  async createGenre(insertGenre: InsertGenre): Promise<Genre> {
    try {
      const newGenre = new GenreModel({
        ...insertGenre,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedGenre = await newGenre.save();
      return this.mongoGenreToGenre(savedGenre);
    } catch (error) {
      console.error('Error creating genre:', error);
      throw error;
    }
  }

  async addGenreToContent(contentId: number, genreId: number): Promise<void> {
    try {
      const contentGenre = new ContentGenre({
        contentId,
        genreId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await contentGenre.save();
    } catch (error) {
      console.error(`Error adding genre ${genreId} to content ${contentId}:`, error);
      throw error;
    }
  }

  // Tags operations
  async getAllTags(): Promise<Tag[]> {
    try {
      const tags = await TagModel.find().sort({ name: 1 });
      return tags.map(this.mongoTagToTag);
    } catch (error) {
      console.error('Error fetching all tags:', error);
      return [];
    }
  }

  async getTagsByContentId(contentId: number): Promise<Tag[]> {
    try {
      // Find all content-tag relationships for this content
      const contentTags = await ContentTag.find({ contentId });
      
      // Get all tag IDs
      const tagIds = contentTags.map(ct => ct.tagId);
      
      // Fetch all tags with these IDs
      const tags = await TagModel.find({ _id: { $in: tagIds } });
      
      return tags.map(this.mongoTagToTag);
    } catch (error) {
      console.error(`Error fetching tags for content ${contentId}:`, error);
      return [];
    }
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    try {
      const newTag = new TagModel({
        ...insertTag,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedTag = await newTag.save();
      return this.mongoTagToTag(savedTag);
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  }

  async addTagToContent(contentId: number, tagId: number): Promise<void> {
    try {
      const contentTag = new ContentTag({
        contentId,
        tagId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await contentTag.save();
    } catch (error) {
      console.error(`Error adding tag ${tagId} to content ${contentId}:`, error);
      throw error;
    }
  }

  // Ratings operations
  async getRatingsByContentId(contentId: number): Promise<Rating[]> {
    try {
      const ratings = await RatingModel.find({ contentId });
      return ratings.map(this.mongoRatingToRating);
    } catch (error) {
      console.error(`Error fetching ratings for content ${contentId}:`, error);
      return [];
    }
  }

  async getUserRatingForContent(userId: number, contentId: number): Promise<Rating | undefined> {
    try {
      const rating = await RatingModel.findOne({ userId, contentId });
      if (!rating) return undefined;
      
      return this.mongoRatingToRating(rating);
    } catch (error) {
      console.error(`Error fetching rating for user ${userId} and content ${contentId}:`, error);
      return undefined;
    }
  }

  async createRating(insertRating: InsertRating): Promise<Rating> {
    try {
      const newRating = new RatingModel({
        ...insertRating,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedRating = await newRating.save();
      return this.mongoRatingToRating(savedRating);
    } catch (error) {
      console.error('Error creating rating:', error);
      throw error;
    }
  }

  async updateRating(id: number, score: number): Promise<Rating | undefined> {
    try {
      const updatedRating = await RatingModel.findByIdAndUpdate(
        id,
        { score, updatedAt: new Date() },
        { new: true }
      );
      
      if (!updatedRating) return undefined;
      return this.mongoRatingToRating(updatedRating);
    } catch (error) {
      console.error(`Error updating rating ${id}:`, error);
      return undefined;
    }
  }

  // Reviews operations
  async getReviewsByContentId(contentId: string | number): Promise<Review[]> {
    try {
      // اگر contentId از نوع عدد باشد، آن را به ObjectId تبدیل میکنیم
      let objectId;
      
      if (typeof contentId === 'number') {
        console.warn("Warning: contentId was passed as a number. Convert it to a valid MongoDB ObjectId before use.");
        return [];
      } else {
        try {
          objectId = new mongoose.Types.ObjectId(contentId);
        } catch (err) {
          console.error(`Invalid ObjectId format: ${contentId}`, err);
          return [];
        }
      }
      
      const reviews = await ReviewModel.find({ contentId: objectId, isApproved: true })
        .sort({ createdAt: -1 });
      
      return reviews.map(this.mongoReviewToReview);
    } catch (error) {
      console.error(`Error fetching reviews for content ${contentId}:`, error);
      return [];
    }
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    try {
      const newReview = new ReviewModel({
        ...insertReview,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedReview = await newReview.save();
      return this.mongoReviewToReview(savedReview);
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  async approveReview(id: number): Promise<void> {
    try {
      await ReviewModel.findByIdAndUpdate(id, { isApproved: true, updatedAt: new Date() });
    } catch (error) {
      console.error(`Error approving review ${id}:`, error);
      throw error;
    }
  }
  
  async getReviewsCount(): Promise<number> {
    try {
      return await ReviewModel.countDocuments();
    } catch (error) {
      console.error('Error getting reviews count:', error);
      return 0;
    }
  }
  
  async getPendingReviewsCount(): Promise<number> {
    try {
      return await ReviewModel.countDocuments({ isApproved: false });
    } catch (error) {
      console.error('Error getting pending reviews count:', error);
      return 0;
    }
  }
  
  async getFilteredReviews(
    page: number = 1, 
    limit: number = 10, 
    sortField: string = 'createdAt', 
    sortOrder: string = 'desc',
    filter?: { isApproved?: boolean }
  ): Promise<{ reviews: Review[], total: number }> {
    try {
      const skip = (page - 1) * limit;
      const sort: any = {};
      sort[sortField || 'createdAt'] = sortOrder === 'asc' ? 1 : -1;
      
      let query = {};
      if (filter && filter.isApproved !== undefined) {
        query = { isApproved: filter.isApproved };
      }
      
      const [reviews, total] = await Promise.all([
        ReviewModel.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit),
        ReviewModel.countDocuments(query)
      ]);
      
      return {
        reviews: reviews.map(this.mongoReviewToReview),
        total
      };
    } catch (error) {
      console.error('Error getting filtered reviews:', error);
      return { reviews: [], total: 0 };
    }
  }

  // Comments operations
  async getCommentsByContentId(contentId: string | number): Promise<Comment[]> {
    try {
      // اگر contentId از نوع عدد باشد، آن را به ObjectId تبدیل میکنیم
      let objectId;
      
      if (typeof contentId === 'number') {
        console.warn("Warning: contentId was passed as a number. Convert it to a valid MongoDB ObjectId before use.");
        return [];
      } else {
        try {
          objectId = new mongoose.Types.ObjectId(contentId);
        } catch (err) {
          console.error(`Invalid ObjectId format: ${contentId}`, err);
          return [];
        }
      }
      
      const comments = await CommentModel.find({ contentId: objectId, isApproved: true })
        .sort({ createdAt: -1 });
      
      return comments.map(this.mongoCommentToComment);
    } catch (error) {
      console.error(`Error fetching comments for content ${contentId}:`, error);
      return [];
    }
  }
  
  async getCommentsCount(): Promise<number> {
    try {
      return await CommentModel.countDocuments();
    } catch (error) {
      console.error('Error getting comments count:', error);
      return 0;
    }
  }
  
  async getPendingCommentsCount(): Promise<number> {
    try {
      return await CommentModel.countDocuments({ isApproved: false });
    } catch (error) {
      console.error('Error getting pending comments count:', error);
      return 0;
    }
  }
  
  async getFilteredComments(
    page: number = 1, 
    limit: number = 10, 
    sortField: string = 'createdAt', 
    sortOrder: string = 'desc',
    filter?: { isApproved?: boolean }
  ): Promise<{ comments: Comment[], total: number }> {
    try {
      const skip = (page - 1) * limit;
      const sort: any = {};
      sort[sortField || 'createdAt'] = sortOrder === 'asc' ? 1 : -1;
      
      let query = {};
      if (filter && filter.isApproved !== undefined) {
        query = { isApproved: filter.isApproved };
      }
      
      const [comments, total] = await Promise.all([
        CommentModel.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit),
        CommentModel.countDocuments(query)
      ]);
      
      return {
        comments: comments.map(this.mongoCommentToComment),
        total
      };
    } catch (error) {
      console.error('Error getting filtered comments:', error);
      return { comments: [], total: 0 };
    }
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    try {
      const newComment = new CommentModel({
        ...insertComment,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedComment = await newComment.save();
      return this.mongoCommentToComment(savedComment);
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async approveComment(id: number): Promise<void> {
    try {
      await CommentModel.findByIdAndUpdate(id, { isApproved: true, updatedAt: new Date() });
    } catch (error) {
      console.error(`Error approving comment ${id}:`, error);
      throw error;
    }
  }

  // Watchlist operations
  async getUserWatchlist(userId: number): Promise<Content[]> {
    try {
      // Get all watchlist items for this user
      const watchlistItems = await WatchlistModel.find({ userId });
      
      // Get content IDs
      const contentIds = watchlistItems.map(item => item.contentId);
      
      // Fetch content for each ID
      const contents = await ContentModel.find({ _id: { $in: contentIds } });
      
      return contents.map(this.mongoContentToContent);
    } catch (error) {
      console.error(`Error fetching watchlist for user ${userId}:`, error);
      return [];
    }
  }

  async addToWatchlist(insertWatchlist: InsertWatchlist): Promise<Watchlist> {
    try {
      const newWatchlistItem = new WatchlistModel({
        ...insertWatchlist,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedItem = await newWatchlistItem.save();
      return this.mongoWatchlistToWatchlist(savedItem);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  }

  async removeFromWatchlist(userId: number, contentId: number): Promise<void> {
    try {
      await WatchlistModel.findOneAndDelete({ userId, contentId });
    } catch (error) {
      console.error(`Error removing content ${contentId} from watchlist for user ${userId}:`, error);
      throw error;
    }
  }

  async isInWatchlist(userId: number, contentId: number): Promise<boolean> {
    try {
      const watchlistItem = await WatchlistModel.findOne({ userId, contentId });
      return !!watchlistItem;
    } catch (error) {
      console.error(`Error checking if content ${contentId} is in watchlist for user ${userId}:`, error);
      return false;
    }
  }

  // Favorites operations
  async getUserFavorites(userId: number): Promise<Content[]> {
    try {
      // Get all favorite items for this user
      const favoriteItems = await FavoriteModel.find({ userId });
      
      // Get content IDs
      const contentIds = favoriteItems.map(item => item.contentId);
      
      // Fetch content for each ID
      const contents = await ContentModel.find({ _id: { $in: contentIds } });
      
      return contents.map(this.mongoContentToContent);
    } catch (error) {
      console.error(`Error fetching favorites for user ${userId}:`, error);
      return [];
    }
  }

  async addToFavorites(insertFavorite: InsertFavorite): Promise<Favorite> {
    try {
      const newFavoriteItem = new FavoriteModel({
        ...insertFavorite,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedItem = await newFavoriteItem.save();
      return this.mongoFavoriteToFavorite(savedItem);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  async removeFromFavorites(userId: number, contentId: number): Promise<void> {
    try {
      await FavoriteModel.findOneAndDelete({ userId, contentId });
    } catch (error) {
      console.error(`Error removing content ${contentId} from favorites for user ${userId}:`, error);
      throw error;
    }
  }

  async isInFavorites(userId: number, contentId: number): Promise<boolean> {
    try {
      const favoriteItem = await FavoriteModel.findOne({ userId, contentId });
      return !!favoriteItem;
    } catch (error) {
      console.error(`Error checking if content ${contentId} is in favorites for user ${userId}:`, error);
      return false;
    }
  }

  // Watch History operations
  async getUserWatchHistory(userId: number): Promise<any[]> {
    try {
      // Get all watch history items for this user
      const historyItems = await WatchHistory.find({ userId })
        .sort({ updatedAt: -1 });
      
      // Now get content details for each item
      const enrichedHistory = await Promise.all(
        historyItems.map(async (item) => {
          const content = await ContentModel.findById(item.contentId);
          let episode = null;
          
          if (item.episodeId) {
            episode = await EpisodeModel.findById(item.episodeId);
          }
          
          return {
            ...item.toObject(),
            content: content ? this.mongoContentToContent(content) : null,
            episode: episode ? this.mongoEpisodeToEpisode(episode) : null
          };
        })
      );
      
      return enrichedHistory;
    } catch (error) {
      console.error(`Error fetching watch history for user ${userId}:`, error);
      return [];
    }
  }

  async addToWatchHistory(
    userId: number, 
    contentId: number, 
    episodeId?: number, 
    position: number = 0
  ): Promise<void> {
    try {
      // Check if history entry already exists
      const query: any = { userId, contentId };
      if (episodeId) query.episodeId = episodeId;
      
      const existingEntry = await WatchHistory.findOne(query);
      
      if (existingEntry) {
        // Update existing entry
        existingEntry.position = position;
        existingEntry.updatedAt = new Date();
        await existingEntry.save();
      } else {
        // Create new entry
        const newHistoryItem = new WatchHistory({
          userId,
          contentId,
          episodeId,
          position,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await newHistoryItem.save();
      }
    } catch (error) {
      console.error('Error adding to watch history:', error);
      throw error;
    }
  }

  async updateWatchHistory(
    userId: number, 
    contentId: number, 
    episodeId?: number, 
    position?: number, 
    completed?: boolean
  ): Promise<void> {
    try {
      // Find the history entry
      const query: any = { userId, contentId };
      if (episodeId) query.episodeId = episodeId;
      
      const historyItem = await WatchHistory.findOne(query);
      
      if (historyItem) {
        // Update fields
        if (position !== undefined) historyItem.position = position;
        if (completed !== undefined) historyItem.completed = completed;
        historyItem.updatedAt = new Date();
        
        await historyItem.save();
      } else {
        // Create new entry if it doesn't exist
        const newHistoryItem = new WatchHistory({
          userId,
          contentId,
          episodeId,
          position: position || 0,
          completed: completed || false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await newHistoryItem.save();
      }
    } catch (error) {
      console.error('Error updating watch history:', error);
      throw error;
    }
  }

  // Playlists operations
  async getUserPlaylists(userId: number): Promise<Playlist[]> {
    try {
      const playlists = await PlaylistModel.find({ userId });
      return playlists.map(this.mongoPlaylistToPlaylist);
    } catch (error) {
      console.error(`Error fetching playlists for user ${userId}:`, error);
      return [];
    }
  }

  async getPlaylistById(id: number): Promise<Playlist | undefined> {
    try {
      const playlist = await PlaylistModel.findById(id);
      if (!playlist) return undefined;
      
      return this.mongoPlaylistToPlaylist(playlist);
    } catch (error) {
      console.error(`Error fetching playlist ${id}:`, error);
      return undefined;
    }
  }

  async getPlaylistItems(playlistId: number): Promise<Content[]> {
    try {
      // Get all playlist items
      const playlistItems = await PlaylistItem.find({ playlistId })
        .sort({ order: 1 });
      
      // Get content IDs
      const contentIds = playlistItems.map(item => item.contentId);
      
      // Fetch content for each ID
      const contents = await ContentModel.find({ _id: { $in: contentIds } });
      
      // Sort contents based on original order
      const contentMap = new Map();
      contents.forEach(content => {
        contentMap.set(content._id.toString(), content);
      });
      
      return playlistItems
        .map(item => contentMap.get(item.contentId.toString()))
        .filter(Boolean)
        .map(this.mongoContentToContent);
    } catch (error) {
      console.error(`Error fetching items for playlist ${playlistId}:`, error);
      return [];
    }
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    try {
      const newPlaylist = new PlaylistModel({
        ...insertPlaylist,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedPlaylist = await newPlaylist.save();
      return this.mongoPlaylistToPlaylist(savedPlaylist);
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  }

  async addToPlaylist(playlistId: number, contentId: number, order: number): Promise<void> {
    try {
      const playlistItem = new PlaylistItem({
        playlistId,
        contentId,
        order,
        createdAt: new Date()
      });
      
      await playlistItem.save();
    } catch (error) {
      console.error(`Error adding content ${contentId} to playlist ${playlistId}:`, error);
      throw error;
    }
  }

  async removeFromPlaylist(playlistId: number, contentId: number): Promise<void> {
    try {
      await PlaylistItem.findOneAndDelete({ playlistId, contentId });
      
      // Re-order remaining items
      const remainingItems = await PlaylistItem.find({ playlistId }).sort({ order: 1 });
      
      for (let i = 0; i < remainingItems.length; i++) {
        remainingItems[i].order = i + 1;
        await remainingItems[i].save();
      }
    } catch (error) {
      console.error(`Error removing content ${contentId} from playlist ${playlistId}:`, error);
      throw error;
    }
  }

  // Helper methods to convert between MongoDB and Drizzle schemas
  private mongoUserToUser(mongoUser: any): User {
    return {
      id: mongoUser._id,
      username: mongoUser.username,
      password: mongoUser.password,
      email: mongoUser.email,
      name: mongoUser.name,
      avatar: mongoUser.avatar,
      createdAt: mongoUser.createdAt,
      updatedAt: mongoUser.updatedAt
    };
  }

  private mongoContentToContent(mongoContent: any): Content {
    return {
      id: mongoContent._id,
      title: mongoContent.title,
      englishTitle: mongoContent.englishTitle,
      type: mongoContent.type,
      description: mongoContent.description,
      year: mongoContent.year,
      duration: mongoContent.duration,
      poster: mongoContent.poster,
      backdrop: mongoContent.backdrop,
      imdbRating: mongoContent.imdbRating,
      createdAt: mongoContent.createdAt,
      updatedAt: mongoContent.updatedAt
    };
  }

  private mongoSeasonToSeason(mongoSeason: any): Season {
    return {
      id: mongoSeason._id,
      contentId: mongoSeason.contentId,
      seasonNumber: mongoSeason.seasonNumber,
      title: mongoSeason.title,
      description: mongoSeason.description,
      year: mongoSeason.year,
      posterImage: mongoSeason.posterImage,
      createdAt: mongoSeason.createdAt,
      updatedAt: mongoSeason.updatedAt
    };
  }

  private mongoEpisodeToEpisode(mongoEpisode: any): Episode {
    return {
      id: mongoEpisode._id,
      seasonId: mongoEpisode.seasonId,
      episodeNumber: mongoEpisode.episodeNumber,
      title: mongoEpisode.title,
      description: mongoEpisode.description,
      duration: mongoEpisode.duration,
      thumbnail: mongoEpisode.thumbnail,
      createdAt: mongoEpisode.createdAt,
      updatedAt: mongoEpisode.updatedAt
    };
  }

  private mongoVideoToVideo(mongoVideo: any): Video {
    return {
      id: mongoVideo._id,
      contentId: mongoVideo.contentId,
      episodeId: mongoVideo.episodeId,
      quality: mongoVideo.quality,
      streamUrl: mongoVideo.streamUrl,
      downloadUrl: mongoVideo.downloadUrl,
      size: mongoVideo.size,
      createdAt: mongoVideo.createdAt,
      updatedAt: mongoVideo.updatedAt
    };
  }

  private mongoGenreToGenre(mongoGenre: any): Genre {
    return {
      id: mongoGenre._id,
      name: mongoGenre.name,
      slug: mongoGenre.slug,
      createdAt: mongoGenre.createdAt,
      updatedAt: mongoGenre.updatedAt
    };
  }

  private mongoTagToTag(mongoTag: any): Tag {
    return {
      id: mongoTag._id,
      name: mongoTag.name,
      slug: mongoTag.slug,
      createdAt: mongoTag.createdAt,
      updatedAt: mongoTag.updatedAt
    };
  }

  private mongoRatingToRating(mongoRating: any): Rating {
    return {
      id: mongoRating._id,
      userId: mongoRating.userId,
      contentId: mongoRating.contentId,
      score: mongoRating.score,
      createdAt: mongoRating.createdAt,
      updatedAt: mongoRating.updatedAt
    };
  }

  private mongoReviewToReview(mongoReview: any): Review {
    return {
      id: mongoReview._id,
      userId: mongoReview.userId,
      contentId: mongoReview.contentId,
      text: mongoReview.text,
      isApproved: mongoReview.isApproved,
      createdAt: mongoReview.createdAt,
      updatedAt: mongoReview.updatedAt
    };
  }

  private mongoCommentToComment(mongoComment: any): Comment {
    return {
      id: mongoComment._id,
      userId: mongoComment.userId,
      contentId: mongoComment.contentId,
      text: mongoComment.text,
      isApproved: mongoComment.isApproved,
      createdAt: mongoComment.createdAt,
      updatedAt: mongoComment.updatedAt
    };
  }

  private mongoWatchlistToWatchlist(mongoWatchlist: any): Watchlist {
    return {
      id: mongoWatchlist._id,
      userId: mongoWatchlist.userId,
      contentId: mongoWatchlist.contentId,
      createdAt: mongoWatchlist.createdAt
    };
  }

  private mongoFavoriteToFavorite(mongoFavorite: any): Favorite {
    return {
      id: mongoFavorite._id,
      userId: mongoFavorite.userId,
      contentId: mongoFavorite.contentId,
      createdAt: mongoFavorite.createdAt
    };
  }

  private mongoPlaylistToPlaylist(mongoPlaylist: any): Playlist {
    return {
      id: mongoPlaylist._id,
      userId: mongoPlaylist.userId,
      name: mongoPlaylist.name,
      description: mongoPlaylist.description,
      isPublic: mongoPlaylist.isPublic,
      createdAt: mongoPlaylist.createdAt,
      updatedAt: mongoPlaylist.updatedAt
    };
  }
  
  // Password reset operations
  async createVerificationCode(email: string): Promise<string> {
    try {
      // Generate a random 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Set expiration time (10 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      
      // Delete any existing verification codes for this email
      await VerificationCode.deleteMany({ email });
      
      // Create a new verification code
      const verificationCode = new VerificationCode({
        email,
        code,
        expiresAt
      });
      
      await verificationCode.save();
      return code;
    } catch (error) {
      console.error('Error creating verification code:', error);
      throw error;
    }
  }
  
  async verifyCode(email: string, code: string): Promise<boolean> {
    try {
      // Find the verification code
      const verificationCode = await VerificationCode.findOne({ 
        email,
        code,
        expiresAt: { $gt: new Date() } // Check if not expired
      });
      
      // If code is valid, return true
      return !!verificationCode;
    } catch (error) {
      console.error('Error verifying code:', error);
      return false;
    }
  }
  
  async createResetToken(email: string): Promise<string> {
    try {
      // Generate a random token
      const token = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
      
      // Set expiration time (1 hour from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      
      // Delete any existing reset tokens for this email
      await ResetToken.deleteMany({ email });
      
      // Create a new reset token
      const resetToken = new ResetToken({
        email,
        token,
        expiresAt
      });
      
      await resetToken.save();
      return token;
    } catch (error) {
      console.error('Error creating reset token:', error);
      throw error;
    }
  }
  
  async verifyResetToken(email: string, token: string): Promise<boolean> {
    try {
      // Find the reset token
      const resetToken = await ResetToken.findOne({ 
        email,
        token,
        expiresAt: { $gt: new Date() } // Check if not expired
      });
      
      // If token is valid, return true
      return !!resetToken;
    } catch (error) {
      console.error('Error verifying reset token:', error);
      return false;
    }
  }
  
  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    try {
      // Find the user by email
      const user = await UserModel.findOne({ email });
      if (!user) return false;
      
      // Update the user's password
      user.password = newPassword;
      user.updatedAt = new Date();
      await user.save();
      
      // Delete any verification codes and reset tokens for this email
      await VerificationCode.deleteMany({ email });
      await ResetToken.deleteMany({ email });
      
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  }

  // AI recommendation methods
  async getRecommendedContent(userId: number | null, limit: number = 5): Promise<Content[]> {
    try {
      // استفاده از سرویس هوش مصنوعی برای توصیه محتوا
      const { aiRecommendationService } = await import('../ai-service');
      
      // دریافت کاربر
      const user = userId ? await this.getUser(userId) : null;
      
      // دریافت تاریخچه تماشا و محتواهای مورد علاقه کاربر
      let watchHistory: any[] = [];
      let favorites: Content[] = [];
      
      if (userId) {
        watchHistory = await this.getUserWatchHistory(userId);
        favorites = await this.getUserFavorites(userId);
      }
      
      // دریافت همه محتواها، ژانرها و تگ‌ها
      const allContent = await ContentModel.find().lean();
      const allGenres = await GenreModel.find().lean();
      const allTags = await TagModel.find().lean();
      
      // تبدیل محتواها به فرمت مورد نیاز
      const convertedContent: Content[] = allContent.map(content => {
        const id = typeof content._id === 'string' ? 
          parseInt(content._id.substring(0, 8), 16) : 
          parseInt(content._id.toString().substring(0, 8), 16);
          
        return {
          ...content,
          id
        } as unknown as Content;
      });
      
      // تبدیل ژانرها به فرمت مورد نیاز
      const convertedGenres: Genre[] = allGenres.map(genre => {
        const id = typeof genre._id === 'string' ? 
          parseInt(genre._id.substring(0, 8), 16) : 
          parseInt(genre._id.toString().substring(0, 8), 16);
          
        return {
          ...genre,
          id
        } as unknown as Genre;
      });
      
      // تبدیل تگ‌ها به فرمت مورد نیاز
      const convertedTags: Tag[] = allTags.map(tag => {
        const id = typeof tag._id === 'string' ? 
          parseInt(tag._id.substring(0, 8), 16) : 
          parseInt(tag._id.toString().substring(0, 8), 16);
          
        return {
          ...tag,
          id
        } as unknown as Tag;
      });
      
      // دریافت توصیه‌ها از سرویس هوش مصنوعی
      const recommendedContent = await aiRecommendationService.getContentRecommendations(
        user,
        watchHistory,
        favorites,
        convertedContent,
        convertedGenres,
        convertedTags,
        limit
      );
      
      // بازگرداندن نتایج
      return recommendedContent;
    } catch (error) {
      console.error("Error getting AI recommended content:", error);
      // در صورت خطا، محتواهای جدید را برگردان
      return this.getLatestContent(limit);
    }
  }
  
  async getSimilarContent(contentId: number, limit: number = 5): Promise<Content[]> {
    try {
      // یافتن محتوا با بهترین تطابق
      const allContent = await ContentModel.find().lean();
      
      // پیدا کردن محتوای موردنظر یا استفاده از شناسه ObjectId
      let contentItem = null;
      
      // اگر contentId یک عدد است، سعی کنیم بهترین تطابق را پیدا کنیم
      if (typeof contentId === 'number') {
        contentItem = allContent.find(content => {
          const id = typeof content._id === 'string' ? 
            parseInt(content._id.substring(0, 8), 16) : 
            parseInt(content._id.toString().substring(0, 8), 16);
          return id === contentId;
        });
      }
      
      // اگر هنوز محتوا پیدا نشده، سعی کنیم با ObjectId پیدا کنیم
      if (!contentItem) {
        // در MongoDB مستقیماً از ObjectId استفاده می‌کنیم
        try {
          const hexId = contentId.toString(16).padStart(24, '0');
          const objectId = new mongoose.Types.ObjectId(hexId);
          contentItem = await ContentModel.findById(objectId).lean();
        } catch (error) {
          console.error("Error converting contentId to ObjectId:", error);
        }
      }
      
      if (!contentItem) {
        throw new Error(`Content with ID ${contentId} not found`);
      }
      
      // استفاده از سرویس هوش مصنوعی برای یافتن محتواهای مشابه
      const { aiRecommendationService } = await import('../ai-service');
      
      // دریافت ژانرها و تگ‌ها
      const allGenres = await GenreModel.find().lean();
      const allTags = await TagModel.find().lean();
      
      // تبدیل محتوا به فرمت مورد نیاز
      const id = typeof contentItem._id === 'string' ? 
        parseInt(contentItem._id.substring(0, 8), 16) : 
        parseInt(contentItem._id.toString().substring(0, 8), 16);
        
      const convertedContentItem = {
        ...contentItem,
        id
      } as unknown as Content;
      
      // تبدیل محتواها به فرمت مورد نیاز
      const convertedContent: Content[] = allContent.map(content => {
        const id = typeof content._id === 'string' ? 
          parseInt(content._id.substring(0, 8), 16) : 
          parseInt(content._id.toString().substring(0, 8), 16);
          
        return {
          ...content,
          id
        } as unknown as Content;
      });
      
      // تبدیل ژانرها به فرمت مورد نیاز
      const convertedGenres: Genre[] = allGenres.map(genre => {
        const id = typeof genre._id === 'string' ? 
          parseInt(genre._id.substring(0, 8), 16) : 
          parseInt(genre._id.toString().substring(0, 8), 16);
          
        return {
          ...genre,
          id
        } as unknown as Genre;
      });
      
      // تبدیل تگ‌ها به فرمت مورد نیاز
      const convertedTags: Tag[] = allTags.map(tag => {
        const id = typeof tag._id === 'string' ? 
          parseInt(tag._id.substring(0, 8), 16) : 
          parseInt(tag._id.toString().substring(0, 8), 16);
          
        return {
          ...tag,
          id
        } as unknown as Tag;
      });
      
      // دریافت محتواهای مشابه از سرویس هوش مصنوعی
      const similarContent = await aiRecommendationService.getSimilarContent(
        convertedContentItem,
        convertedContent,
        convertedGenres,
        convertedTags,
        limit
      );
      
      // بازگرداندن نتایج
      return similarContent;
    } catch (error) {
      console.error("Error getting AI similar content:", error);
      
      // در صورت خطا، محتواهای جدید هم‌نوع را برگردان
      if (typeof contentId === 'number') {
        try {
          // تبدیل به ObjectId
          const hexId = contentId.toString(16).padStart(24, '0');
          const objectId = new mongoose.Types.ObjectId(hexId);
          const contentItem = await ContentModel.findById(objectId).lean();
          
          if (contentItem && contentItem.type) {
            return this.getContentByType(contentItem.type, limit);
          }
        } catch (innerError) {
          console.error("Inner error in fallback:", innerError);
        }
      }
      
      return this.getLatestContent(limit);
    }
  }
}