import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const contentTypeEnum = pgEnum('content_type', ['movie', 'series', 'animation', 'documentary']);
export const qualityEnum = pgEnum('quality', ['480p', '720p', '1080p']);

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Content Table
export const content = pgTable("content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  englishTitle: text("english_title").notNull(),
  type: contentTypeEnum("type").notNull(),
  description: text("description").notNull(),
  year: integer("year").notNull(),
  duration: integer("duration").notNull(), // in minutes
  poster: text("poster").notNull(),
  backdrop: text("backdrop"),
  imdbRating: text("imdb_rating"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Seasons Table (for series)
export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => content.id),
  seasonNumber: integer("season_number").notNull(),
  title: text("title").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Episodes Table
export const episodes = pgTable("episodes", {
  id: serial("id").primaryKey(),
  seasonId: integer("season_id").notNull().references(() => seasons.id),
  episodeNumber: integer("episode_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  thumbnail: text("thumbnail"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Videos Table (for streaming and downloads)
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").references(() => content.id),
  episodeId: integer("episode_id").references(() => episodes.id),
  quality: qualityEnum("quality").notNull(),
  streamUrl: text("stream_url").notNull(),
  downloadUrl: text("download_url").notNull(),
  size: integer("size"), // in MB
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Genres Table
export const genres = pgTable("genres", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Content Genres (Junction Table)
export const contentGenres = pgTable("content_genres", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => content.id),
  genreId: integer("genre_id").notNull().references(() => genres.id),
});

// Tags Table
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Content Tags (Junction Table)
export const contentTags = pgTable("content_tags", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => content.id),
  tagId: integer("tag_id").notNull().references(() => tags.id),
});

// Ratings Table
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contentId: integer("content_id").notNull().references(() => content.id),
  score: integer("score").notNull(), // 1-10
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reviews Table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contentId: integer("content_id").notNull().references(() => content.id),
  text: text("text").notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Comments Table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contentId: integer("content_id").notNull().references(() => content.id),
  text: text("text").notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Watchlist Table
export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contentId: integer("content_id").notNull().references(() => content.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Favorites Table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contentId: integer("content_id").notNull().references(() => content.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Watch History Table
export const watchHistory = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contentId: integer("content_id").references(() => content.id),
  episodeId: integer("episode_id").references(() => episodes.id),
  position: integer("position").default(0).notNull(), // seconds into video
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Playlists Table
export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Playlist Items Table
export const playlistItems = pgTable("playlist_items", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull().references(() => playlists.id),
  contentId: integer("content_id").notNull().references(() => content.id),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
});

export const insertContentSchema = createInsertSchema(content);
export const insertSeasonSchema = createInsertSchema(seasons);
export const insertEpisodeSchema = createInsertSchema(episodes);
export const insertVideoSchema = createInsertSchema(videos);
export const insertGenreSchema = createInsertSchema(genres);
export const insertTagSchema = createInsertSchema(tags);
export const insertRatingSchema = createInsertSchema(ratings);
export const insertReviewSchema = createInsertSchema(reviews);
export const insertCommentSchema = createInsertSchema(comments);
export const insertWatchlistSchema = createInsertSchema(watchlist);
export const insertFavoriteSchema = createInsertSchema(favorites);
export const insertPlaylistSchema = createInsertSchema(playlists);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Content = typeof content.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;

export type Season = typeof seasons.$inferSelect;
export type InsertSeason = z.infer<typeof insertSeasonSchema>;

export type Episode = typeof episodes.$inferSelect;
export type InsertEpisode = z.infer<typeof insertEpisodeSchema>;

export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

export type Genre = typeof genres.$inferSelect;
export type InsertGenre = z.infer<typeof insertGenreSchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Watchlist = typeof watchlist.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
