const getBaseUrl = () => {
  if (import.meta.env.DEV) {
    return "http://localhost:8888/.netlify/functions/tmdb-proxy";
  }
  // In production, use the full URL
  return `${window.location.origin}/.netlify/functions/tmdb-proxy`;
};

/**
 * Makes a request to the TMDB API proxy
 * @param {string} endpoint - The TMDB endpoint to call
 * @param {Object} params - Additional query parameters
 * @returns {Promise<Object>} The response data
 * @throws {Error} If the request fails
 */
async function makeProxyRequest(endpoint, params = {}) {
  if (!endpoint) {
    throw new Error('Endpoint is required');
  }

  try {
    const url = new URL(getBaseUrl());
    url.searchParams.append('endpoint', endpoint);
    
    // Add additional parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });

    console.log(`Making request to endpoint: ${endpoint}`);
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.details || errorData.error || `HTTP error! status: ${response.status}`;
      console.error(`API Error for ${endpoint}:`, errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    if (error.message.includes('API key')) {
      throw new Error('Authentication error. Please check API configuration.');
    }
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
