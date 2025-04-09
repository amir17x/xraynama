// merged-content-service.ts - سرویس دریافت اطلاعات از TMDB

import { TMDBService } from './tmdb-service';

// کلاس tmdbService را از فایل tmdb-service وارد می‌کنیم
const tmdbService = new TMDBService();

// تعریف interface های لازم برای کار با داده های TMDB
interface TMDbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  original_language: string;
  runtime?: number;
  genres?: Array<{id: number, name: string}>;
  imdb_id?: string;
  credits?: {
    cast?: Array<{
      id: number;
      name: string;
      character: string;
      profile_path?: string;
    }>;
    crew?: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
    }>;
  };
}

interface TMDbSeries {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  first_air_date: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  original_language: string;
  genres?: Array<{id: number, name: string}>;
  episode_run_time?: number[];
  credits?: {
    cast?: Array<{
      id: number;
      name: string;
      character: string;
      profile_path?: string;
    }>;
    crew?: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
    }>;
  };
}

interface TMDbExternalIds {
  imdb_id?: string;
  tvdb_id?: string;
  facebook_id?: string;
  instagram_id?: string;
  twitter_id?: string;
}

// Define a content type based on TMDB data
export interface MergedContent {
  // Base content info 
  id: string;
  imdbId?: string;
  title: string;
  englishTitle: string;
  year: string | number;
  poster?: string;
  backdrop?: string;
  type: string;
  genres: string[];
  
  // TMDB specific fields
  tmdbId?: number;
  popularity?: number;
  voteAverage?: number;
  voteCount?: number;
  overview?: string;
  originalLanguage?: string;
  releaseDate?: string;
  
  // Additional content metadata
  runtime?: string;
  director?: string;
  writer?: string;
  actors?: string[];
  language?: string;
  country?: string;
  imdbRating?: string;
  
  // Additional fields for UI/UX
  isFavorite?: boolean;
  isInWatchlist?: boolean;
  duration?: number | string;
  description?: string;
  subtitleOptions?: string[]; // 'persian', 'english', 'both'
  hasPersianDubbing?: boolean;
  hasPersianSubtitle?: boolean;
}

class MergedContentService {
  /**
   * This method gets movie data from TMDB
   */
  async getMergedMovie(tmdbId: number, language: string = 'en-US'): Promise<MergedContent | null> {
    try {
      // Fetch movie details from TMDB
      const movieData = await tmdbService.getMovieDetails(tmdbId, language);
      
      if (!movieData) {
        console.log(`[merged-service] Could not find movie with TMDb ID: ${tmdbId}`);
        return null;
      }
      
      // Get credits (cast & crew) for the movie if available
      let credits = undefined;
      try {
        credits = await tmdbService.getMovieCredits(tmdbId, language);
      } catch (creditsError) {
        console.error(`[merged-service] Error fetching credits for movie ${tmdbId}:`, creditsError);
      }
      
      // Create TMDbMovie object
      const tmdbMovie: TMDbMovie = {
        id: movieData.id,
        title: movieData.title,
        original_title: movieData.original_title || movieData.title,
        overview: movieData.overview,
        poster_path: movieData.poster_path,
        backdrop_path: movieData.backdrop_path,
        release_date: movieData.release_date,
        popularity: movieData.popularity,
        vote_average: movieData.vote_average,
        vote_count: movieData.vote_count,
        original_language: movieData.original_language || 'en',
        runtime: movieData.runtime,
        genres: movieData.genres || [],
        imdb_id: movieData.imdb_id,
        credits: credits
      };
      
      // Transform and return the data
      return this.transformTMDbMovie(tmdbMovie);
    } catch (error) {
      console.error('[merged-service] Error getting movie data:', error);
      return null;
    }
  }
  
  /**
   * Get TV series data from TMDB
   */
  async getMergedTVSeries(tmdbId: number, language: string = 'en-US'): Promise<MergedContent | null> {
    try {
      // Fetch TV details from TMDB
      const tvData = await tmdbService.getTVSeriesDetails(tmdbId, language);
      
      if (!tvData) {
        console.log(`[merged-service] Could not find TV series with TMDb ID: ${tmdbId}`);
        return null;
      }
      
      // Get credits for the TV series if available
      let credits = undefined;
      try {
        credits = await tmdbService.getTVSeriesCredits(tmdbId, language);
      } catch (creditsError) {
        console.error(`[merged-service] Error fetching credits for TV series ${tmdbId}:`, creditsError);
      }
      
      // Get external IDs for the TV series
      let externalIds: TMDbExternalIds | undefined = undefined;
      try {
        externalIds = await tmdbService.getTVSeriesExternalIds(tmdbId, language);
      } catch (externalError) {
        console.error(`[merged-service] Error fetching external IDs for TV series ${tmdbId}:`, externalError);
      }
      
      // Create TMDbSeries object
      const tmdbSeries: TMDbSeries = {
        id: tvData.id,
        name: tvData.name,
        original_name: tvData.original_name || tvData.name,
        overview: tvData.overview,
        poster_path: tvData.poster_path,
        backdrop_path: tvData.backdrop_path,
        first_air_date: tvData.first_air_date,
        popularity: tvData.popularity,
        vote_average: tvData.vote_average,
        vote_count: tvData.vote_count,
        original_language: tvData.original_language || 'en',
        genres: tvData.genres || [],
        episode_run_time: tvData.episode_run_time || [],
        credits: credits
      };
      
      // Transform and return the data
      const content = this.transformTMDbSeries(tmdbSeries);
      
      // Add IMDb ID if available
      if (externalIds && externalIds.imdb_id) {
        content.imdbId = externalIds.imdb_id;
      }
      
      return content;
    } catch (error) {
      console.error('[merged-service] Error getting TV series data:', error);
      return null;
    }
  }
  
  /**
   * Search for content in TMDB
   */
  async searchContent(query: string, language: string = 'en-US'): Promise<MergedContent[]> {
    try {
      // Search in TMDB
      const searchResults = await tmdbService.searchMulti(query, language);
      
      if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
        console.log(`[merged-service] No results found in TMDB for query: ${query}`);
        return [];
      }
      
      console.log(`[merged-service] Found ${searchResults.results.length} results in TMDB for query: ${query}`);
      
      // Transform results
      const transformedResults: MergedContent[] = [];
      
      for (const result of searchResults.results) {
        if (result.media_type === 'movie') {
          transformedResults.push({
            id: `tmdb-movie-${result.id}`,
            tmdbId: result.id,
            title: result.title,
            englishTitle: result.original_title || result.title,
            year: result.release_date ? new Date(result.release_date).getFullYear() : 'Unknown',
            poster: result.poster_path || undefined,
            backdrop: result.backdrop_path || undefined,
            type: 'movie',
            genres: [],
            popularity: result.popularity,
            voteAverage: result.vote_average,
            voteCount: result.vote_count,
            overview: result.overview,
            description: result.overview
          });
        } else if (result.media_type === 'tv') {
          transformedResults.push({
            id: `tmdb-tv-${result.id}`,
            tmdbId: result.id,
            title: result.name,
            englishTitle: result.original_name || result.name,
            year: result.first_air_date ? new Date(result.first_air_date).getFullYear() : 'Unknown',
            poster: result.poster_path || undefined,
            backdrop: result.backdrop_path || undefined,
            type: 'series',
            genres: [],
            popularity: result.popularity,
            voteAverage: result.vote_average,
            voteCount: result.vote_count,
            overview: result.overview,
            description: result.overview
          });
        }
      }
      
      return transformedResults;
      
    } catch (error) {
      console.error('[merged-service] Error searching content:', error);
      return [];
    }
  }
  
  /**
   * Transform TMDB movie data to our unified format
   */
  private transformTMDbMovie(movie: TMDbMovie): MergedContent {
    const genreNames = movie.genres ? movie.genres.map(g => g.name) : [];
    
    // Extract directors, writers, and actors from credits if available
    let directors: string[] = [];
    let writers: string[] = [];
    let actors: string[] = [];
    
    if (movie.credits) {
      if (movie.credits.crew) {
        directors = movie.credits.crew
          .filter(crew => crew.job === 'Director')
          .map(director => director.name);
          
        writers = movie.credits.crew
          .filter(crew => ['Writer', 'Screenplay', 'Story'].includes(crew.job))
          .map(writer => writer.name);
      }
      
      if (movie.credits.cast) {
        actors = movie.credits.cast
          .slice(0, 10) // Limit to top 10 actors
          .map(actor => actor.name);
      }
    }
    
    return {
      id: `tmdb-movie-${movie.id}`,
      tmdbId: movie.id,
      imdbId: movie.imdb_id,
      title: movie.title,
      englishTitle: movie.original_title || movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown',
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
      backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : undefined,
      type: 'movie',
      genres: genreNames,
      popularity: movie.popularity,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      overview: movie.overview,
      originalLanguage: movie.original_language,
      releaseDate: movie.release_date,
      duration: movie.runtime,
      description: movie.overview,
      director: directors.join(', '),
      writer: writers.join(', '),
      actors: actors,
      imdbRating: movie.vote_average ? (movie.vote_average / 2).toFixed(1) : undefined, // Convert to scale of 10
      runtime: movie.runtime ? `${movie.runtime} دقیقه` : undefined,
      subtitleOptions: [], // Will be set by admin
      hasPersianDubbing: false, // Will be set by admin
      hasPersianSubtitle: false, // Will be set by admin
    };
  }
  
  /**
   * Transform TMDB TV series data to our unified format
   */
  private transformTMDbSeries(series: TMDbSeries): MergedContent {
    const genreNames = series.genres ? series.genres.map(g => g.name) : [];
    
    // Extract creators, writers, and actors from credits if available
    let directors: string[] = [];
    let writers: string[] = [];
    let actors: string[] = [];
    
    if (series.credits) {
      if (series.credits.crew) {
        directors = series.credits.crew
          .filter(crew => ['Director', 'Executive Producer', 'Creator'].includes(crew.job))
          .map(director => director.name);
          
        writers = series.credits.crew
          .filter(crew => ['Writer', 'Story Editor', 'Creator'].includes(crew.job))
          .map(writer => writer.name);
      }
      
      if (series.credits.cast) {
        actors = series.credits.cast
          .slice(0, 10) // Limit to top 10 actors
          .map(actor => actor.name);
      }
    }
    
    return {
      id: `tmdb-tv-${series.id}`,
      tmdbId: series.id,
      title: series.name,
      englishTitle: series.original_name || series.name,
      year: series.first_air_date ? new Date(series.first_air_date).getFullYear() : 'Unknown',
      poster: series.poster_path ? `https://image.tmdb.org/t/p/w500${series.poster_path}` : undefined,
      backdrop: series.backdrop_path ? `https://image.tmdb.org/t/p/original${series.backdrop_path}` : undefined,
      type: 'series',
      genres: genreNames,
      popularity: series.popularity,
      voteAverage: series.vote_average,
      voteCount: series.vote_count,
      overview: series.overview,
      originalLanguage: series.original_language,
      releaseDate: series.first_air_date,
      duration: series.episode_run_time && series.episode_run_time.length > 0 ? series.episode_run_time[0] : 0,
      description: series.overview,
      director: directors.join(', '),
      writer: writers.join(', '),
      actors: actors,
      imdbRating: series.vote_average ? (series.vote_average / 2).toFixed(1) : undefined, // Convert to scale of 10
      runtime: series.episode_run_time && series.episode_run_time.length > 0 ? `${series.episode_run_time[0]} دقیقه` : undefined,
      subtitleOptions: [], // Will be set by admin
      hasPersianDubbing: false, // Will be set by admin
      hasPersianSubtitle: false, // Will be set by admin
    };
  }
}

// Create and export a singleton instance
export const mergedContentService = new MergedContentService();