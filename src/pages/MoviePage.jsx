import React, { useState } from 'react';
import MovieDetails from '../components/MovieDetails';
import { useParams } from 'react-router-dom';  // Import useParams to get movieId from URL

const MoviePage = () => {
    const [selectedMovieId, setSelectedMovieId] = useState(null);

    // Example: Clicking a movie card sets the selected movie ID
    const handleMovieClick = (movieId) => {
        setSelectedMovieId(movieId);
    };

    // Get movieId from URL params
  const { movieId } = useParams();

  return (
    <div>
      {/* Conditionally render MovieDetails component based on movieId */}
      <MovieDetails movieId={movieId} />
    </div>
  );
};

export default MoviePage;
