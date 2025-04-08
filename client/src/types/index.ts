export interface ContentType {
  id: string | number;
  title: string;
  englishTitle: string;
  type: 'movie' | 'series' | 'animation' | 'documentary';
  description: string;
  year: number;
  duration: number;
  poster: string;
  backdrop?: string;
  imdbRating?: string;
  hasPersianDubbing?: boolean;
  hasPersianSubtitle?: boolean;
  createdAt: string;
  updatedAt: string;
  
  // فیلدهای اضافی برای نمایش جزئیات بیشتر
  director?: string;
  actors?: string[] | string;
  genres?: string[] | string;
  language?: string;
  country?: string;
  awards?: string;
  genre?: string[] | string;
  trailer?: string;
  fullDescription?: string;
  tags?: string[] | string;
  
  // فیلدهای اضافی برای صفحات جدید با استایل گلاسمورفیسم
  viewCount?: number;
  rating?: number;
  network?: string;
}

export interface ContentWithDetails extends ContentType {
  genres: GenreType[];
  tags: TagType[];
  videos: VideoType[];
  seasons?: SeasonWithEpisodes[];
  ratings: {
    count: number;
    averageScore: number;
    userRating: RatingType | null;
  };
  isInWatchlist: boolean;
  isInFavorites: boolean;
}

export interface SeasonType {
  id: number;
  contentId: number;
  seasonNumber: number;
  title: string;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface SeasonWithEpisodes extends SeasonType {
  episodes: EpisodeWithVideos[];
}

export interface EpisodeType {
  id: number;
  seasonId: number;
  episodeNumber: number;
  title: string;
  description?: string;
  duration: number;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EpisodeWithVideos extends EpisodeType {
  videos: VideoType[];
}

export interface VideoType {
  id: number;
  contentId?: number;
  episodeId?: number;
  quality: '480p' | '720p' | '1080p';
  streamUrl: string;
  downloadUrl: string;
  size?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenreType {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface TagType {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface RatingType {
  id: number;
  userId: number;
  contentId: number;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewType {
  id: number;
  userId: number;
  contentId: number;
  text: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    name?: string;
    avatar?: string;
  };
}

export interface CommentType {
  id: number;
  userId: number;
  contentId: number;
  text: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    name?: string;
    avatar?: string;
  };
}

export interface WatchHistoryType {
  id: number;
  userId: number;
  contentId: number;
  episodeId?: number;
  position: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  content?: ContentType;
  episode?: EpisodeType;
}

export interface PlaylistType {
  id: number;
  userId: number;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  items?: ContentType[];
}

export interface SearchFilters {
  type?: 'movie' | 'series' | 'animation' | 'documentary';
  year_from?: number;
  year_to?: number;
  min_rating?: number;
  genre?: string;
  tag?: string;
}
