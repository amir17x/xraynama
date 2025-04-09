// merged-content-service.ts - سرویس ادغام اطلاعات از TMDB و OMDb

import { TMDBService } from './tmdb-service';
import { omdbPGCacheService } from './omdb-pg-cache-service'; // Updated to use PostgreSQL cache
import { NormalizedOMDbContent } from './omdb-service';

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
}

interface TMDbExternalIds {
  imdb_id?: string;
  tvdb_id?: string;
  facebook_id?: string;
  instagram_id?: string;
  twitter_id?: string;
}

// Define a merged content type that combines data from both APIs
export interface MergedContent {
  // Base content info (available in both APIs)
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
  
  // OMDb specific fields
  rated?: string;
  released?: string;
  runtime?: string;
  director?: string;
  writer?: string;
  actors?: string[];
  plot?: string;
  language?: string;
  country?: string;
  awards?: string;
  imdbRating?: string;
  metascore?: string;
  boxOffice?: string;
  production?: string;
  ratings?: Array<{
    source: string;
    value: string;
  }>;
  
  // Additional fields for UI/UX
  isFavorite?: boolean;
  isInWatchlist?: boolean;
  duration?: number | string;
  description?: string;
}

class MergedContentService {
  /**
   * This method merges movie data from TMDB with enhanced details from OMDb
   */
  async getMergedMovie(tmdbId: number, language: string = 'en-US'): Promise<MergedContent | null> {
    try {
      // Step 1: Fetch movie details from TMDB
      const movieData = await tmdbService.getMovieDetails(tmdbId, language);
      
      if (!movieData) {
        console.log(`[merged-service] Could not find movie with TMDb ID: ${tmdbId}`);
        return null;
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
        imdb_id: undefined // Initialize as undefined
      };
      
      // Check if movie has IMDb ID directly in the response
      let imdbId: string | undefined = undefined;
      if (movieData.imdb_id) {
        imdbId = movieData.imdb_id;
      } else if (movieData.external_ids && movieData.external_ids.imdb_id) {
        imdbId = movieData.external_ids.imdb_id;
      } else {
        // Try to get external IDs if they were not included in the initial response
        try {
          const external = await tmdbService.findByExternalId(
            tmdbId.toString(), 
            'tmdb_id',
            language
          );
          
          if (external && external.movie_results && external.movie_results.length > 0) {
            const externalMovie = external.movie_results[0];
            if (externalMovie.imdb_id) {
              imdbId = externalMovie.imdb_id;
            }
          }
        } catch (extError) {
          console.error(`[merged-service] Error fetching external IDs for movie ${tmdbId}:`, extError);
        }
      }
      
      // Update the movie's IMDb ID
      tmdbMovie.imdb_id = imdbId;
      
      // Step 2: If no IMDb ID found, return TMDB data only
      if (!imdbId) {
        console.log(`[merged-service] Movie with TMDb ID ${tmdbId} has no IMDb ID, returning TMDB data only`);
        return this.transformTMDbMovie(tmdbMovie);
      }
      
      console.log(`[merged-service] Fetching OMDb data for IMDb ID: ${imdbId}`);
      
      // Step 3: Fetch enhanced details from OMDb
      const omdbData = await omdbPGCacheService.getContentByImdbId(imdbId);
      
      // Step 4: Merge the data and return
      return this.mergeMovieData(tmdbMovie, omdbData);
    } catch (error) {
      console.error('[merged-service] Error merging movie data:', error);
      return null;
    }
  }
  
  /**
   * This method merges TV series data from TMDB with enhanced details from OMDb
   */
  async getMergedTVSeries(tmdbId: number, language: string = 'en-US'): Promise<MergedContent | null> {
    try {
      // Step 1: Fetch TV details from TMDB
      // استفاده از findByExternalId با external_source=tmdb_id برای یافتن سریال
      const searchResult = await tmdbService.findByExternalId(
        tmdbId.toString(), 
        'tmdb_id', 
        language
      );
      
      if (!searchResult || !searchResult.tv_results || searchResult.tv_results.length === 0) {
        console.log(`[merged-service] Could not find TV series with TMDb ID: ${tmdbId}`);
        return null;
      }
      
      const tvData = searchResult.tv_results[0];
      
      // Use TMDb API to find external IDs (including IMDb ID)
      const externalData = await tmdbService.findByExternalId(
        tmdbId.toString(),
        "tmdb_id", 
        language
      );
      
      // Extract IMDb ID
      let imdbId: string | undefined = undefined;
      if (externalData && externalData.tv_results && externalData.tv_results.length > 0) {
        // Search if there's any IMDb ID in the response
        for (const source of ["imdb_id", "external_ids"]) {
          if (externalData.tv_results[0][source]) {
            imdbId = externalData.tv_results[0][source];
            break;
          }
        }
      }
      
      // Create a TMDbSeries object from the data
      const tmdbSeries: TMDbSeries = {
        id: tvData.id,
        name: tvData.name,
        original_name: tvData.original_name,
        overview: tvData.overview,
        poster_path: tvData.poster_path,
        backdrop_path: tvData.backdrop_path,
        first_air_date: tvData.first_air_date,
        popularity: tvData.popularity,
        vote_average: tvData.vote_average,
        vote_count: tvData.vote_count,
        original_language: tvData.original_language,
        genres: tvData.genres || [],
        episode_run_time: tvData.episode_run_time || []
      };
      
      // If no IMDb ID, return TMDB data only
      if (!imdbId) {
        console.log(`[merged-service] TV series with TMDb ID ${tmdbId} has no IMDb ID, returning TMDB data only`);
        return this.transformTMDbSeries(tmdbSeries);
      }
      
      console.log(`[merged-service] Fetching OMDb data for IMDb ID: ${imdbId}`);
      
      // Step 3: Fetch enhanced details from OMDb
      const omdbData = await omdbPGCacheService.getContentByImdbId(imdbId);
      
      // Step 4: Merge the data and return
      return this.mergeTVSeriesData(tmdbSeries, omdbData, imdbId);
    } catch (error) {
      console.error('[merged-service] Error merging TV series data:', error);
      return null;
    }
  }
  
  /**
   * Ultra simple search that only uses OMDb - best for performance
   */
  async searchContent(query: string, language: string = 'en-US'): Promise<MergedContent[]> {
    try {
      // Just search in OMDb - it's the most reliable and fastest
      try {
        const omdbResult = await omdbPGCacheService.searchByTitle(query);
        if (omdbResult) {
          console.log(`[merged-service] Found content in OMDb for query: ${query}`);
          return [this.transformOMDbContent(omdbResult)];
        }
      } catch (omdbError) {
        console.error('[merged-service] Error in OMDb search:', omdbError);
      }
      
      // If we reach here, we couldn't find anything in OMDb
      return [];
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
    
    return {
      id: `tmdb-movie-${movie.id}`,
      tmdbId: movie.id,
      imdbId: movie.imdb_id,
      title: movie.title,
      englishTitle: movie.original_title || movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown',
      poster: movie.poster_path || undefined,
      backdrop: movie.backdrop_path || undefined,
      type: 'movie',
      genres: genreNames,
      popularity: movie.popularity,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      overview: movie.overview,
      originalLanguage: movie.original_language,
      releaseDate: movie.release_date,
      duration: movie.runtime,
      description: movie.overview
    };
  }
  
  /**
   * Transform TMDB TV series data to our unified format
   */
  private transformTMDbSeries(series: TMDbSeries): MergedContent {
    const genreNames = series.genres ? series.genres.map(g => g.name) : [];
    
    return {
      id: `tmdb-tv-${series.id}`,
      tmdbId: series.id,
      title: series.name,
      englishTitle: series.original_name || series.name,
      year: series.first_air_date ? new Date(series.first_air_date).getFullYear() : 'Unknown',
      poster: series.poster_path || undefined,
      backdrop: series.backdrop_path || undefined,
      type: 'series',
      genres: genreNames,
      popularity: series.popularity,
      voteAverage: series.vote_average,
      voteCount: series.vote_count,
      overview: series.overview,
      originalLanguage: series.original_language,
      releaseDate: series.first_air_date,
      duration: series.episode_run_time && series.episode_run_time.length > 0 ? series.episode_run_time[0] : 0,
      description: series.overview
    };
  }
  
  /**
   * Transform OMDb content to our unified format
   */
  private transformOMDbContent(content: NormalizedOMDbContent): MergedContent {
    return {
      id: `omdb-${content.imdbID}`,
      imdbId: content.imdbID,
      title: content.title,
      englishTitle: content.englishTitle,
      year: content.year,
      poster: content.poster,
      type: content.type,
      genres: content.genre,
      rated: content.language,
      released: content.released,
      runtime: content.runtime,
      director: content.director,
      writer: content.writer,
      actors: content.actors,
      plot: content.plot,
      language: content.language,
      country: content.country,
      awards: content.awards,
      imdbRating: content.imdbRating,
      boxOffice: content.boxOffice,
      production: content.production,
      duration: content.runtime,
      description: content.plot
    };
  }
  
  /**
   * Merge TMDB movie data with OMDb data
   */
  private mergeMovieData(tmdbMovie: TMDbMovie, omdbData: NormalizedOMDbContent | null): MergedContent {
    // First get the base TMDB transformation
    const baseContent = this.transformTMDbMovie(tmdbMovie);
    
    // If no OMDb data, return TMDB data only
    if (!omdbData) {
      return baseContent;
    }
    
    // Merge with OMDb data, giving priority to TMDB for overlapping fields
    return {
      ...baseContent,
      // Add OMDb-specific fields
      rated: omdbData.language,
      released: omdbData.released, 
      runtime: omdbData.runtime,
      director: omdbData.director,
      writer: omdbData.writer,
      actors: omdbData.actors,
      plot: omdbData.plot,
      language: omdbData.language,
      country: omdbData.country,
      awards: omdbData.awards,
      imdbRating: omdbData.imdbRating,
      boxOffice: omdbData.boxOffice,
      production: omdbData.production,
      // For description, prefer OMDb's plot as it's often more detailed
      description: omdbData.plot || baseContent.description
    };
  }
  
  /**
   * Merge TMDB TV series data with OMDb data
   */
  private mergeTVSeriesData(tmdbSeries: TMDbSeries, omdbData: NormalizedOMDbContent | null, imdbId: string): MergedContent {
    // First get the base TMDB transformation
    const baseContent = this.transformTMDbSeries(tmdbSeries);
    
    // Add the IMDb ID which comes from external IDs
    baseContent.imdbId = imdbId;
    
    // If no OMDb data, return TMDB data only
    if (!omdbData) {
      return baseContent;
    }
    
    // Merge with OMDb data, giving priority to TMDB for overlapping fields
    return {
      ...baseContent,
      // Add OMDb-specific fields
      rated: omdbData.language,
      released: omdbData.released,
      runtime: omdbData.runtime,
      director: omdbData.director,
      writer: omdbData.writer,
      actors: omdbData.actors,
      plot: omdbData.plot,
      language: omdbData.language,
      country: omdbData.country,
      awards: omdbData.awards,
      imdbRating: omdbData.imdbRating,
      // For description, prefer OMDb's plot as it's often more detailed
      description: omdbData.plot || baseContent.description
    };
  }
}

// Create and export a singleton instance
export const mergedContentService = new MergedContentService();