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
export default function MovieCard({movie, certification}) {
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

    const qualityBadge = getQualityBadge(movie.vote_average);

    return (
        <div 
            className="movie-card"
            onClick={() => navigate(`/movie/${movie.id}`)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/movie/${movie.id}`);
                }
            }}
            tabIndex={0}
            role="article"
            aria-label={`Movie: ${movie.title}`}
        >
            <div className="movie-poster">
                {/* Certification badge in top right corner */}
                {certification && (
                    <div className="certification-badge" style={{position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: '4px', padding: '2px 8px', fontWeight: 'bold', fontSize: '0.95em', zIndex: 2}} title="Content Rating">
                        {certification}
                    </div>
                )}
                {qualityBadge && (
                    <div className="quality-badge" role="status">
                        {qualityBadge}
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
                        style={{position: 'absolute', top: 40, right: 8, zIndex: 2, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer'}}
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
                    <div className="user-rating" title="TMDB Rating">
                        <span className="tmdb-rating-label">TMDB Rating:</span> {movie.vote_average.toFixed(1)}
                    </div>
                )}
            </div>
        </div>
    )
}