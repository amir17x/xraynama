import { pgTable, text, serial, integer, boolean, timestamp, json, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  points: integer("points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  badges: text("badges").array(),
});

// Content Table (For movies, series, animations, documentaries)
export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  englishTitle: text("english_title").notNull(),
  type: text("type").notNull(), // movie, series, animation, documentary
  poster: text("poster").notNull(),
  year: integer("year").notNull(),
  duration: integer("duration"), // in minutes
  imdbRating: text("imdb_rating"),
  synopsis: text("synopsis"),
  englishSynopsis: text("english_synopsis"),
  director: text("director"),
  actors: text("actors"),
  tags: text("tags").array(),
  genres: text("genres").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Episodes Table (For series and TV shows)
export const episodes = pgTable("episodes", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contents.id),
  season: integer("season").notNull(),
  episode: integer("episode").notNull(),
  title: text("title").notNull(),
  duration: integer("duration"), // in minutes
  synopsis: text("synopsis"),
  thumbnail: text("thumbnail"),
});

// Quality Sources Table
export const qualitySources = pgTable("quality_sources", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").references(() => contents.id),
  episodeId: integer("episode_id").references(() => episodes.id),
  quality: text("quality").notNull(), // 480p, 720p, 1080p
  sourceUrl: text("source_url").notNull(),
  type: text("type").notNull(), // stream, download
});

// Ratings Table
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contentId: integer("content_id").notNull().references(() => contents.id),
  rating: integer("rating").notNull(), // 1-10
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews Table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contentId: integer("content_id").notNull().references(() => contents.id),
  text: text("text").notNull(),
  approved: boolean("approved").default(false),
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments Table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contentId: integer("content_id").notNull().references(() => contents.id),
  text: text("text").notNull(),
  approved: boolean("approved").default(false),
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Watch History Table
export const watchHistory = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contentId: integer("content_id").notNull().references(() => contents.id),
  episodeId: integer("episode_id").references(() => episodes.id),
  progress: integer("progress").default(0), // in seconds
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Favorites Table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contentId: integer("content_id").notNull().references(() => contents.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Playlists Table
export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Playlist Items Table
export const playlistItems = pgTable("playlist_items", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull().references(() => playlists.id),
  contentId: integer("content_id").notNull().references(() => contents.id),
  order: integer("order").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

// Watch Parties Table
export const watchParties = pgTable("watch_parties", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  contentId: integer("content_id").notNull().references(() => contents.id),
  episodeId: integer("episode_id").references(() => episodes.id),
  partyCode: text("party_code").notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Watch Party Members Table
export const watchPartyMembers = pgTable("watch_party_members", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id").notNull().references(() => watchParties.id),
  userId: integer("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Watch Party Chat Messages Table
export const watchPartyChatMessages = pgTable("watch_party_chat_messages", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id").notNull().references(() => watchParties.id),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true,
  points: true,
  badges: true
});

export const insertContentSchema = createInsertSchema(contents).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true
});

export const insertEpisodeSchema = createInsertSchema(episodes).omit({ 
  id: true
});

export const insertQualitySourceSchema = createInsertSchema(qualitySources).omit({ 
  id: true
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

export const insertWatchHistorySchema = createInsertSchema(watchHistory).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({ 
  id: true, 
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

export const insertWatchPartySchema = createInsertSchema(watchParties).omit({ 
  id: true, 
  isActive: true,
  createdAt: true 
});

export const insertWatchPartyMemberSchema = createInsertSchema(watchPartyMembers).omit({ 
  id: true, 
  joinedAt: true 
});

export const insertWatchPartyChatMessageSchema = createInsertSchema(watchPartyChatMessages).omit({ 
  id: true, 
  createdAt: true 
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Content = typeof contents.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;

export type Episode = typeof episodes.$inferSelect;
export type InsertEpisode = z.infer<typeof insertEpisodeSchema>;

export type QualitySource = typeof qualitySources.$inferSelect;
export type InsertQualitySource = z.infer<typeof insertQualitySourceSchema>;

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type WatchHistory = typeof watchHistory.$inferSelect;
export type InsertWatchHistory = z.infer<typeof insertWatchHistorySchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;

export type PlaylistItem = typeof playlistItems.$inferSelect;
export type InsertPlaylistItem = z.infer<typeof insertPlaylistItemSchema>;

export type WatchParty = typeof watchParties.$inferSelect;
export type InsertWatchParty = z.infer<typeof insertWatchPartySchema>;

export type WatchPartyMember = typeof watchPartyMembers.$inferSelect;
export type InsertWatchPartyMember = z.infer<typeof insertWatchPartyMemberSchema>;

export type WatchPartyChatMessage = typeof watchPartyChatMessages.$inferSelect;
export type InsertWatchPartyChatMessage = z.infer<typeof insertWatchPartyChatMessageSchema>;
