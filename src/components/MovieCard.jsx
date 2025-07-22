import '../css/MovieCard.css'
import { useNavigate } from 'react-router-dom';
import { useMovieContext } from '../contexts/MovieContext';
import PropTypes from 'prop-types';

/**
 * MovieCard Component
 * 
 * Displays a movie card with poster, title, release year, rating, and favorite toggle.
 * Provides interaction for navigation to movie details and adding/removing from favorites.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.movie - Movie data object
 * @param {number} props.movie.id - Unique identifier of the movie
 * @param {string} props.movie.title - Title of the movie
 * @param {string} [props.movie.poster_path] - Path to movie poster image
 * @param {number} [props.movie.vote_average] - Average rating of the movie
 * @param {string} [props.movie.release_date] - Release date of the movie
 * @returns {JSX.Element} A card displaying movie information
 */
export default function MovieCard({movie}) {
    const navigate = useNavigate();
    const { addToFavorites, removeFromFavorites, isFavorite } = useMovieContext();

    // Format the release date
    const formatReleaseYear = (releaseDate) => {
        if (!releaseDate) return 'Unknown';
        const date = new Date(releaseDate);
        return date.getFullYear();
    }

    function onFavoriteClick(e){
        e.stopPropagation(); // Prevent navigation when clicking favorite button
        
        if (isFavorite(movie.id)) {
            removeFromFavorites(movie.id);
        } else {
            addToFavorites(movie);
        }
    }

    // Get quality badge based on vote average
    const getQualityBadge = (voteAverage) => {
        if (voteAverage >= 8) return 'Excellent';
        if (voteAverage >= 7) return 'Great';
        if (voteAverage >= 6) return 'Good';
        return null;
    };

    return (
        <div 
            className="movie-card"
            onClick={() => navigate(`/movie/${movie.id}`)}
            role="article"
            aria-label={`Movie: ${movie.title}`}
        >
            <div className="movie-poster">
                {getQualityBadge(movie.vote_average) && (
                    <div className="quality-badge" role="status">
                        {getQualityBadge(movie.vote_average)}
                    </div>
                )}
                <picture>
                    <img 
                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/src/assets/poster_not_available.webp"} 
                        alt={movie.title}
                        loading="lazy"
                    />
                </picture>
                <div className="movie-overlay">
                    <button 
                        className={`favorite-btn ${isFavorite(movie.id) ? 'active' : ''}`} 
                        onClick={onFavoriteClick}
                        aria-label={isFavorite(movie.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        {isFavorite(movie.id) ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
            <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>{formatReleaseYear(movie.release_date)}</p>
                {movie.vote_average > 0 && (
                    <div className="user-rating">
                        {movie.vote_average.toFixed(1)}
                    </div>
                )}
            </div>
        </div>
    )
}