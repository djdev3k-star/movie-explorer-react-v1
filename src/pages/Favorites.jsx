
import { useMovieContext } from '../contexts/MovieContext';
import MovieCard from '../components/MovieCard';
import { useNavigate, Link } from 'react-router-dom';
import '../css/Favorites.css';
import { useState } from 'react';


export default function Favorite() {
    const { favorites } = useMovieContext();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    // Handle clicking on a movie card
    const handleMovieClick = (movieId) => {
        try {
            navigate(`/movie/${movieId}`);
        } catch (err) {
            setError('Failed to navigate to movie details.');
        }
    };

    let content;
    try {
        if (!Array.isArray(favorites)) {
            throw new Error('Favorites data is unavailable.');
        }

        if (favorites.length === 0) {
            content = (
                <div className="favorites">
                    <div className="favorites-header">
                        <h1 className="favorites-title">My Favorites</h1>
                        <p className="favorites-subtitle">Your personal movie collection</p>
                    </div>
                    <div className="favorites-empty">
                        <div className="empty-icon">🎬</div>
                        <h2>No Favorites Yet!</h2>
                        <p>Start building your personal movie collection by adding movies you love. Click the heart icon on any movie to add it to your favorites.</p>
                        <Link to="/" className="cta-button">
                            Discover Movies
                        </Link>
                    </div>
                </div>
            );
        } else {
            content = (
                <div className="favorites">
                    <div className="favorites-header">
                        <h1 className="favorites-title">My Favorites</h1>
                        <div className="favorites-count">
                            {favorites.length} {favorites.length === 1 ? 'Movie' : 'Movies'}
                        </div>
                        <p className="favorites-subtitle">Your handpicked collection of amazing movies</p>
                    </div>

                    <div className="favorites-stats">
                        <div className="stat-item">
                            <span className="stat-number">{favorites.length}</span>
                            <span className="stat-label">Total Movies</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {Math.round(favorites.reduce((acc, movie) => acc + (movie.vote_average || 0), 0) / favorites.length * 10) / 10 || 0}
                            </span>
                            <span className="stat-label">Avg Rating</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {new Set(favorites.flatMap(movie => movie.genre_ids || [])).size}
                            </span>
                            <span className="stat-label">Genres</span>
                        </div>
                    </div>

                    <div className="movies-grid">
                        {favorites.map((movie) => (
                            <div
                                key={movie.id}
                                className="movie-card-container"
                                onClick={() => handleMovieClick(movie.id)}
                            >
                                <MovieCard movie={movie} />
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
    } catch (err) {
        content = (
            <div className="favorites-error">
                <h2>Something went wrong</h2>
                <p>{err.message}</p>
                <Link to="/" className="cta-button">Back to Home</Link>
            </div>
        );
    }

    return (
        <>
            {error && (
                <div className="favorites-error">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => setError(null)}>Dismiss</button>
                </div>
            )}
            {content}
        </>
    );
}