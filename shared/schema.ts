import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  points: integer("points").default(0).notNull(),
});

// Content Model
export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  titleFa: text("title_fa").notNull(),
  titleEn: text("title_en").notNull(),
  type: text("type").notNull(), // "animation", "movie", "series", "documentary"
  directors: text("directors").array().notNull(),
  actors: text("actors").array().notNull(),
  year: integer("year").notNull(),
  duration: integer("duration").notNull(), // in minutes
  summaryFa: text("summary_fa").notNull(),
  summaryEn: text("summary_en").notNull(),
  genres: text("genres").array().notNull(),
  tags: text("tags").array().notNull(),
  imdbRating: real("imdb_rating"),
  poster: text("poster").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Videos Model (for episodes of series or different quality versions)
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contents.id),
  title: text("title").notNull(),
  description: text("description"),
  season: integer("season"), // null for movies, documentaries
  episode: integer("episode"), // null for movies, documentaries
  videoUrl480p: text("video_url_480p").notNull(),
  videoUrl720p: text("video_url_720p").notNull(),
  videoUrl1080p: text("video_url_1080p").notNull(),
  downloadUrl480p: text("download_url_480p").notNull(),
  downloadUrl720p: text("download_url_720p").notNull(),
  downloadUrl1080p: text("download_url_1080p").notNull(),
  thumbnail: text("thumbnail"),
  duration: integer("duration").notNull(), // in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Ratings Model
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contents.id),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-10
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reviews Model
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contents.id),
  userId: integer("user_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  approved: boolean("approved").default(false).notNull(),
  likes: integer("likes").default(0).notNull(),
  dislikes: integer("dislikes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Comments Model
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contents.id),
  userId: integer("user_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  approved: boolean("approved").default(false).notNull(),
  likes: integer("likes").default(0).notNull(),
  dislikes: integer("dislikes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Playlists Model
export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// PlaylistItems Model
export const playlistItems = pgTable("playlist_items", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull().references(() => playlists.id),
  contentId: integer("content_id").notNull().references(() => contents.id),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

// WatchHistory Model
export const watchHistory = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contentId: integer("content_id").notNull().references(() => contents.id),
  videoId: integer("video_id").notNull().references(() => videos.id),
  watchedAt: timestamp("watched_at").defaultNow().notNull(),
  progress: integer("progress").default(0).notNull(), // in seconds
});

// Favorites Model
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contentId: integer("content_id").notNull().references(() => contents.id),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

// Badges Model
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  requiredPoints: integer("required_points").notNull(),
});

// UserBadges Model
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  badgeId: integer("badge_id").notNull().references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// WatchParty Model
export const watchParties = pgTable("watch_parties", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").notNull().references(() => users.id),
  contentId: integer("content_id").notNull().references(() => contents.id),
  videoId: integer("video_id").notNull().references(() => videos.id),
  partyCode: text("party_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  active: boolean("active").default(true).notNull(),
});

// WatchPartyParticipants Model
export const watchPartyParticipants = pgTable("watch_party_participants", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id").notNull().references(() => watchParties.id),
  userId: integer("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  points: true
});
export const insertContentSchema = createInsertSchema(contents).omit({
  id: true,
  createdAt: true
});
export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true
});
export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true
});
export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  approved: true,
  likes: true,
  dislikes: true,
  createdAt: true
});
export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  approved: true,
  likes: true,
  dislikes: true,
  createdAt: true
});
export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true
});
export const insertPlaylistItemSchema = createInsertSchema(playlistItems).omit({
  id: true,
  addedAt: true
});
export const insertWatchHistorySchema = createInsertSchema(watchHistory).omit({
  id: true,
  watchedAt: true
});
export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  addedAt: true
});
export const insertWatchPartySchema = createInsertSchema(watchParties).omit({
  id: true,
  createdAt: true,
  active: true
});
export const insertWatchPartyParticipantSchema = createInsertSchema(watchPartyParticipants).omit({
  id: true,
  joinedAt: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type InsertPlaylistItem = z.infer<typeof insertPlaylistItemSchema>;
export type InsertWatchHistory = z.infer<typeof insertWatchHistorySchema>;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type InsertWatchParty = z.infer<typeof insertWatchPartySchema>;
export type InsertWatchPartyParticipant = z.infer<typeof insertWatchPartyParticipantSchema>;

export type User = typeof users.$inferSelect;
export type Content = typeof contents.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Playlist = typeof playlists.$inferSelect;
export type PlaylistItem = typeof playlistItems.$inferSelect;
export type WatchHistory = typeof watchHistory.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type WatchParty = typeof watchParties.$inferSelect;
export type WatchPartyParticipant = typeof watchPartyParticipants.$inferSelect;
