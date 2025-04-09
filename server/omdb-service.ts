// omdb-service.ts - سرویس دریافت اطلاعات فیلم و سریال از OMDb API

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Use the API key from environment variables
const OMDB_API_KEY = 'd269c56e'; // Fixed API key

// Define interface for OMDB API response
export interface OMDbResponse {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
  Error?: string;
}

// Define a normalized response type to use in our application
export interface NormalizedOMDbContent {
  title: string;
  englishTitle: string;
  year: string;
  released: string;
  runtime: string;
  genre: string[];
  director: string;
  writer: string;
  actors: string[];
  plot: string;
  language: string;
  country: string;
  awards: string;
  poster: string;
  imdbRating: string;
  imdbID: string;
  type: string;
  boxOffice?: string;
  production?: string;
}

class OMDbService {
  private readonly baseUrl = 'http://www.omdbapi.com/';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = OMDB_API_KEY;
    console.log('[OMDb] Service initialized');
  }

  /**
   * Fetch movie details by IMDb ID
   */
  async getContentByImdbId(imdbId: string): Promise<NormalizedOMDbContent | null> {
    try {
      console.log(`[OMDb] Fetching content with IMDb ID: ${imdbId}`);
      
      const response = await axios.get<OMDbResponse>(`${this.baseUrl}?i=${imdbId}&apikey=${this.apiKey}`);
      
      if (response.data.Response === 'False') {
        console.log(`[OMDb] Error fetching content: ${response.data.Error}`);
        return null;
      }
      
      console.log(`[OMDb] Successfully fetched content: ${response.data.Title}`);
      
      // Normalize the response
      return this.normalizeOMDbResponse(response.data);
    } catch (error) {
      console.error('[OMDb] Error fetching content by IMDb ID:', error);
      return null;
    }
  }

  /**
   * Search for movies/shows by title
   */
  async searchByTitle(title: string): Promise<NormalizedOMDbContent | null> {
    try {
      console.log(`[OMDb] Searching content with title: ${title}`);
      
      const response = await axios.get<OMDbResponse>(`${this.baseUrl}?t=${encodeURIComponent(title)}&apikey=${this.apiKey}`);
      
      if (response.data.Response === 'False') {
        console.log(`[OMDb] Error searching content: ${response.data.Error}`);
        return null;
      }
      
      console.log(`[OMDb] Successfully found content: ${response.data.Title}`);
      
      // Normalize the response
      return this.normalizeOMDbResponse(response.data);
    } catch (error) {
      console.error('[OMDb] Error searching content by title:', error);
      return null;
    }
  }

  /**
   * Normalize the OMDb API response to our application format
   */
  private normalizeOMDbResponse(data: OMDbResponse): NormalizedOMDbContent {
    return {
      title: data.Title,
      englishTitle: data.Title, // OMDb doesn't provide translated titles
      year: data.Year,
      released: data.Released,
      runtime: data.Runtime,
      genre: data.Genre.split(', '),
      director: data.Director,
      writer: data.Writer,
      actors: data.Actors.split(', '),
      plot: data.Plot,
      language: data.Language,
      country: data.Country,
      awards: data.Awards,
      poster: data.Poster,
      imdbRating: data.imdbRating,
      imdbID: data.imdbID,
      type: data.Type === 'movie' ? 'movie' : 
            data.Type === 'series' ? 'series' :
            data.Type === 'episode' ? 'episode' : 'unknown',
      boxOffice: data.BoxOffice,
      production: data.Production
    };
  }
}

// Create and export a singleton instance
export const omdbService = new OMDbService();