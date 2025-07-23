import '../css/MovieCard.css'
import { useNavigate } from 'react-router-dom';
import { useFireproofContext } from '../contexts/FireproofContext';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

export default function MovieCard({ movie, certification }) {
    const navigate = useNavigate();
    const { database } = useFireproofContext();
    const [isFav, setIsFav] = useState(!!movie.favorite);

    // Sync local state with prop
    useEffect(() => {
        setIsFav(!!movie.favorite);
    }, [movie.favorite]);

    // Format release year
    const formatReleaseYear = (releaseDate) => {
        if (!releaseDate) return 'Unknown';
        return new Date(releaseDate).getFullYear();
    };

    // Quality badge
    const getQualityBadge = (voteAverage) => {
        if (voteAverage >= 8) return 'Excellent';
        if (voteAverage >= 7) return 'Great';
        if (voteAverage >= 6) return 'Good';
        return null;
    };
    const qualityBadge = getQualityBadge(movie.vote_average);

    const toggleFavorite = async (e) => {
        e.stopPropagation();
        const newFav = !isFav;
        setIsFav(newFav);
        const docId = movie._id || movie.id?.toString();
        const updatedDoc = { ...movie, _id: docId, favorite: newFav };
        try {
            await database.put(updatedDoc);
        } catch (err) {
            console.error('Error updating favorite in Fireproof:', err);
            // revert local state on error
            setIsFav(!newFav);
        }
    };

    return (
        <div
            className="movie-card"
            onClick={() => navigate(`/movie/${movie.id || movie._id}`)}
            onKeyDown={(e) => {
                if (['Enter', ' '].includes(e.key)) {
                    e.preventDefault();
                    navigate(`/movie/${movie.id || movie._id}`);
                }
            }}
            tabIndex={0}
            role="article"
            aria-label={`Movie: ${movie.title}`}
        >
            <div className="movie-poster">
                {qualityBadge && <div className="quality-badge">{qualityBadge}</div>}
                {certification && <div className="content-badge" title="Content Rating">{certification}</div>}
                <picture>
                    <img
                        src={
                            movie.poster_path
                                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                : '/src/assets/poster_not_available.webp'
                        }
                        alt={movie.title}
                        loading="lazy"
                    />
                </picture>
                <button
                    className={`favorite-btn ${isFav ? 'active' : ''}`}
                    onClick={toggleFavorite}
                    aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                    {isFav ? '❤️' : '🤍'}
                </button>
            </div>
            <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>{formatReleaseYear(movie.release_date)}</p>
                {movie.vote_average > 0 && (
                    <div className="user-rating" title="TMDB Rating">
                        <span className="tmdb-rating-label">TMDB Rating:</span>{' '}
                        {movie.vote_average.toFixed(1)}
                    </div>
                )}
            </div>
        </div>
    );
}

MovieCard.propTypes = {
    movie: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        _id: PropTypes.string,
        title: PropTypes.string.isRequired,
        poster_path: PropTypes.string,
        vote_average: PropTypes.number,
        release_date: PropTypes.string,
        favorite: PropTypes.bool,
    }).isRequired,
    certification: PropTypes.string,
};