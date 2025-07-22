const BASE_FUNCTION_URL = import.meta.env.DEV 
  ? "http://localhost:8888/.netlify/functions/tmdb-proxy"
  : "/.netlify/functions/tmdb-proxy";

/**
 * Makes a request to the TMDB API proxy
 * @param {string} endpoint - The TMDB endpoint to call
 * @param {Object} params - Additional query parameters
 * @returns {Promise<Object>} The response data
 * @throws {Error} If the request fails
 */
async function makeProxyRequest(endpoint, params = {}) {
  const url = new URL(BASE_FUNCTION_URL);
  url.searchParams.append('endpoint', endpoint);
  
  // Add additional parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.details || 'Failed to fetch data from TMDB');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Search for movies by query string
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of movie results
 */
export async function searchMovies(query) {
  const data = await makeProxyRequest('search/movie', { query });
  return data.results || [];
}

/**
 * Get popular movies
 * @returns {Promise<Array>} Array of popular movies
 */
export async function getPopularMovies() {
  const data = await makeProxyRequest('movie/popular');
  return data.results || [];
}

/**
 * Get detailed information about a specific movie
 * @param {number|string} movieId - The movie ID
 * @returns {Promise<Object>} Movie details
 */
export async function getMovieDetails(movieId) {
  if (!movieId) throw new Error('Movie ID is required');
  return await makeProxyRequest(`movie/${movieId}`);
}

/**
 * Get credits (cast and crew) for a specific movie
 * @param {number|string} movieId - The movie ID
 * @returns {Promise<Object>} Movie credits
 */
export async function getMovieCredits(movieId) {
  if (!movieId) throw new Error('Movie ID is required');
  return await makeProxyRequest(`movie/${movieId}/credits`);
}
