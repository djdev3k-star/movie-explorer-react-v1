const BASE_FUNCTION_URL = "netlify/functions/tmdb-proxy";

export async function searchMovies(query) {
  const res = await fetch(`${BASE_FUNCTION_URL}?endpoint=search/movie&query=${encodeURIComponent(query)}`);
  return await res.json();
}

export async function getPopularMovies() {
  const res = await fetch(`${BASE_FUNCTION_URL}?endpoint=movie/popular`);
  return await res.json();
}

export async function getMovieDetails(movieId) {
  const res = await fetch(`${BASE_FUNCTION_URL}?endpoint=movie/${movieId}`);
  return await res.json();
}

export async function getMovieCredits(movieId) {
  const res = await fetch(`${BASE_FUNCTION_URL}?endpoint=movie/${movieId}/credits`);
  return await res.json();
}
