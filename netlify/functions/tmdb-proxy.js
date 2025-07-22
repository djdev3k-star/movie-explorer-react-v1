const ALLOWED_ENDPOINTS = [
  'movie/popular',
  'search/movie',
  'movie',
  'genre/movie/list'
];

/**
 * Validates and sanitizes the endpoint parameter
 * @param {string} endpoint - The requested TMDB endpoint
 * @returns {string|null} - Sanitized endpoint or null if invalid
 */
function validateEndpoint(endpoint) {
  if (!endpoint) return null;
  
  // Remove any leading/trailing slashes and normalize
  const normalizedEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
  
  // Check if it's an allowed endpoint or starts with an allowed pattern
  return ALLOWED_ENDPOINTS.some(allowed => 
    normalizedEndpoint === allowed || 
    normalizedEndpoint.startsWith(`${allowed}/`)
  ) ? normalizedEndpoint : null;
}

/**
 * Constructs the TMDB API URL with proper query parameters
 * @param {string} endpoint - The validated endpoint
 * @param {Object} queryParams - Additional query parameters
 * @param {string} apiKey - TMDB API key
 * @returns {string} - Constructed URL
 */
function constructTmdbUrl(endpoint, queryParams, apiKey) {
  if (!apiKey) {
    console.error('API Key is missing');
    throw new Error('API key is required');
  }

  const url = new URL(`https://api.themoviedb.org/3/${endpoint}`);
  
  // Add API key
  url.searchParams.append('api_key', apiKey);
  
  // Add additional query parameters
  for (const [key, value] of Object.entries(queryParams)) {
    if (key !== 'endpoint' && value) {
      url.searchParams.append(key, value);
    }
  }
  
  // Log the URL without the API key for debugging
  const debugUrl = url.toString().replace(apiKey, 'REDACTED');
  console.log('Making request to:', debugUrl);
  
  return url.toString();
}

/**
 * Netlify Function handler for TMDB API proxy
 */
export async function handler(event) {
  // Enable CORS for development
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Get API key from environment
  const apiKey = process.env.TMDB_API_KEY;
  
  // Verify API key is available
  if (!apiKey) {
    console.error('TMDB_API_KEY is not set in environment variables');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server configuration error',
        details: 'API key not configured'
      })
    };
  }

  // Handle OPTIONS requests for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Log incoming request details
  console.log('Request query parameters:', event.queryStringParameters);
  console.log('Request HTTP method:', event.httpMethod);

  try {
    const { endpoint, ...queryParams } = event.queryStringParameters || {};
    const apiKey = process.env.TMDB_API_KEY;

    // Validate required parameters
    if (!apiKey) {
      console.error('TMDB_API_KEY not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Server configuration error',
          details: 'API key not configured'
        })
      };
    }

    const validatedEndpoint = validateEndpoint(endpoint);
    if (!validatedEndpoint) {
      console.error('Invalid endpoint requested:', endpoint);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid endpoint',
          details: 'The requested endpoint is not supported'
        })
      };
    }

    // Construct and log the TMDB URL (without API key)
    const tmdbUrl = constructTmdbUrl(validatedEndpoint, queryParams, apiKey);
    console.log('Requesting TMDB URL:', tmdbUrl.replace(apiKey, '[REDACTED]'));

    // Make the request to TMDB
    const response = await fetch(tmdbUrl);
    const data = await response.json();

    // Check if TMDB returned an error
    if (!response.ok) {
      console.error('TMDB API error:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: 'TMDB API error',
          details: data.status_message || 'Unknown error occurred'
        })
      };
    }

    // Return successful response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    // Log the full error for debugging
    console.error('Function error:', error);
    console.error('Error stack:', error.stack);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message
      })
    };
  }
}
