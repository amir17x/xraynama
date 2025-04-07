import mongoose, { Document, Schema } from 'mongoose';
import { contentTypeEnum, qualityEnum } from '@shared/schema';

// Define Password Reset interfaces
export interface VerificationCodeDocument extends Document {
  email: string;
  code: string;
  expiresAt: Date;
}

export interface ResetTokenDocument extends Document {
  email: string;
  token: string;
  expiresAt: Date;
}

// Define interfaces for Mongoose documents
export interface UserDocument extends Document {
  username: string;
  password: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentDocument extends Document {
  type: 'movie' | 'series' | 'animation' | 'documentary';
  title: string;
  englishTitle: string;
  description: string;
  year: number;
  duration: number;
  poster: string;
  backdrop?: string | null;
  imdbRating?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeasonDocument extends Document {
  title: string;
  description?: string | null;
  seasonNumber: number;
  contentId: mongoose.Types.ObjectId;
  year: number;
  posterImage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EpisodeDocument extends Document {
  title: string;
  description?: string | null;
  duration: number;
  seasonId: mongoose.Types.ObjectId;
  episodeNumber: number;
  thumbnail?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoDocument extends Document {
  quality: '480p' | '720p' | '1080p';
  streamUrl: string;
  downloadUrl: string;
  size?: number | null;
  contentId?: mongoose.Types.ObjectId | null;
  episodeId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenreDocument extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagDocument extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RatingDocument extends Document {
  userId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewDocument extends Document {
  userId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  text: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentDocument extends Document {
  userId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  text: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WatchlistDocument extends Document {
  userId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface FavoriteDocument extends Document {
  userId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaylistDocument extends Document {
  name: string;
  description?: string | null;
  userId: mongoose.Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaylistItemDocument extends Document {
  playlistId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define Mongoose schemas
const userSchema = new Schema<UserDocument>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, default: null },
  avatar: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const contentSchema = new Schema<ContentDocument>({
  type: { type: String, enum: ['movie', 'series', 'animation', 'documentary'], required: true },
  title: { type: String, required: true },
  englishTitle: { type: String, required: true },
  description: { type: String, required: true },
  year: { type: Number, required: true },
  duration: { type: Number, required: true },
  poster: { type: String, required: true },
  backdrop: { type: String, default: null },
  imdbRating: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const seasonSchema = new Schema<SeasonDocument>({
  title: { type: String, required: true },
  description: { type: String, default: null },
  seasonNumber: { type: Number, required: true },
  contentId: { type: Schema.Types.ObjectId, ref: 'Content', required: true },
  year: { type: Number, required: true },
  posterImage: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const episodeSchema = new Schema<EpisodeDocument>({
  title: { type: String, required: true },
  description: { type: String, default: null },
  duration: { type: Number, required: true },
  seasonId: { type: Schema.Types.ObjectId, ref: 'Season', required: true },
  episodeNumber: { type: Number, required: true },
  thumbnail: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const videoSchema = new Schema<VideoDocument>({
  quality: { type: String, enum: ['480p', '720p', '1080p'], required: true },
  streamUrl: { type: String, required: true },
  downloadUrl: { type: String, required: true },
  size: { type: Number, default: null },
  contentId: { type: Schema.Types.ObjectId, ref: 'Content', default: null },
  episodeId: { type: Schema.Types.ObjectId, ref: 'Episode', default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const genreSchema = new Schema<GenreDocument>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const tagSchema = new Schema<TagDocument>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const contentGenreSchema = new Schema({
  contentId: { type: Schema.Types.ObjectId, ref: 'Content', required: true },
  genreId: { type: Schema.Types.ObjectId, ref: 'Genre', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const contentTagSchema = new Schema({
  contentId: { type: Schema.Types.ObjectId, ref: 'Content', required: true },
  tagId: { type: Schema.Types.ObjectId, ref: 'Tag', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ratingSchema = new Schema<RatingDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: Schema.Types.ObjectId, ref: 'Content', required: true },
  score: { type: Number, required: true, min: 1, max: 10 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const reviewSchema = new Schema<ReviewDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: Schema.Types.ObjectId, ref: 'Content', required: true },
  text: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const commentSchema = new Schema<CommentDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: Schema.Types.ObjectId, ref: 'Content', required: true },
  text: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const watchlistSchema = new Schema<WatchlistDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: Schema.Types.ObjectId, ref: 'Content', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const favoriteSchema = new Schema<FavoriteDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: Schema.Types.ObjectId, ref: 'Content', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const watchHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: Schema.Types.ObjectId, ref: 'Content', required: true },
  episodeId: { type: Schema.Types.ObjectId, ref: 'Episode', default: null },
  position: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const playlistSchema = new Schema<PlaylistDocument>({
  name: { type: String, required: true },
  description: { type: String, default: null },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const playlistItemSchema = new Schema<PlaylistItemDocument>({
  playlistId: { type: Schema.Types.ObjectId, ref: 'Playlist', required: true },
  contentId: { type: Schema.Types.ObjectId, ref: 'Content', required: true },
  order: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Password Reset schemas
const verificationCodeSchema = new Schema<VerificationCodeDocument>({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const resetTokenSchema = new Schema<ResetTokenDocument>({
  email: { type: String, required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// Create Mongoose models
export const User = mongoose.model<UserDocument>('User', userSchema);
export const Content = mongoose.model<ContentDocument>('Content', contentSchema);
export const Season = mongoose.model<SeasonDocument>('Season', seasonSchema);
export const Episode = mongoose.model<EpisodeDocument>('Episode', episodeSchema);
export const Video = mongoose.model<VideoDocument>('Video', videoSchema);
export const Genre = mongoose.model<GenreDocument>('Genre', genreSchema);
export const Tag = mongoose.model<TagDocument>('Tag', tagSchema);
export const ContentGenre = mongoose.model('ContentGenre', contentGenreSchema);
export const ContentTag = mongoose.model('ContentTag', contentTagSchema);
export const Rating = mongoose.model<RatingDocument>('Rating', ratingSchema);
export const Review = mongoose.model<ReviewDocument>('Review', reviewSchema);
export const Comment = mongoose.model<CommentDocument>('Comment', commentSchema);
export const Watchlist = mongoose.model<WatchlistDocument>('Watchlist', watchlistSchema);
export const Favorite = mongoose.model<FavoriteDocument>('Favorite', favoriteSchema);
export const WatchHistory = mongoose.model('WatchHistory', watchHistorySchema);
export const Playlist = mongoose.model<PlaylistDocument>('Playlist', playlistSchema);
export const PlaylistItem = mongoose.model<PlaylistItemDocument>('PlaylistItem', playlistItemSchema);
export const VerificationCode = mongoose.model<VerificationCodeDocument>('VerificationCode', verificationCodeSchema);
export const ResetToken = mongoose.model<ResetTokenDocument>('ResetToken', resetTokenSchema);

// Add unique compound index for ContentGenre
ContentGenre.schema.index({ contentId: 1, genreId: 1 }, { unique: true });

// Add unique compound index for ContentTag
ContentTag.schema.index({ contentId: 1, tagId: 1 }, { unique: true });

// Add unique compound index for Watchlist
Watchlist.schema.index({ userId: 1, contentId: 1 }, { unique: true });

// Add unique compound index for Favorite
Favorite.schema.index({ userId: 1, contentId: 1 }, { unique: true });

// Add unique compound index for Rating
Rating.schema.index({ userId: 1, contentId: 1 }, { unique: true });

// Add unique compound index for PlaylistItem
PlaylistItem.schema.index({ playlistId: 1, contentId: 1 }, { unique: true });