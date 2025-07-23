import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getMovieDetails, getMovieCredits, getMovieVideos, getMovieCertification } from '../services/api';
import { useFireproofContext } from '../contexts/FireproofContext';
import '../css/MovieDetails.css';

// Helper function for safe property access
const formatReleaseYear = (releaseDate) => {
    if (!releaseDate) return 'Unknown';
    try {
        return new Date(releaseDate).getFullYear();
    } catch {
        return 'Unknown';
    }
};

const formatReleaseDate = (releaseDate) => {
    if (!releaseDate) return 'Unknown';
    try {
        return new Date(releaseDate).toLocaleDateString('en-US');
    } catch {
        return 'Unknown';
    }
};

const MovieDetails = ({ movieId }) => {
    const [movie, setMovie] = useState(null);
    const [certification, setCertification] = useState(null);
    const [cast, setCast] = useState([]);
    const [groupedVideos, setGroupedVideos] = useState({});
    const [userRating, setUserRating] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { database, useLiveQuery } = useFireproofContext();

    // Get user data from Fireproof
    const { docs: userMovies } = useLiveQuery("_id", { descending: true });
    const userMovieData = userMovies.find(m => m._id === movieId?.toString());

    // Navigation state for scrollable sections
    const [castScrollPosition, setCastScrollPosition] = useState(0);
    const [videoScrollPositions, setVideoScrollPositions] = useState({});

    // Update local state when Fireproof data changes
    useEffect(() => {
        if (userMovieData) {
            setUserRating(userMovieData.userRating || 0);
            setIsFavorite(!!userMovieData.favorite);
        }
    }, [userMovieData]);

    // Add to Favorites Handler
    const handleAddToFavorites = async (movie) => {
        if (!movie) return;
        
        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState);
        
        const docId = movieId?.toString();
        const updatedDoc = { 
            ...movie, 
            ...userMovieData,
            _id: docId, 
            favorite: newFavoriteState 
        };
        
        try {
            await database.put(updatedDoc);
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
            setIsFavorite(!newFavoriteState); // revert on error
        }
    };

    // Star Rating Handler
    const handleRating = async (rating) => {
        setUserRating(rating);
        
        const docId = movieId?.toString();
        const updatedDoc = { 
            ...movie, 
            ...userMovieData,
            _id: docId, 
            userRating: rating 
        };
        
        try {
            await database.put(updatedDoc);
            console.log(`Rated ${movie?.title || 'Unknown Movie'}: ${rating} stars`);
        } catch (err) {
            console.error('Failed to save rating:', err);
            setUserRating(userMovieData?.userRating || 0); // revert on error
        }
    };

    // Navigation functions for cast section
    const scrollCast = (direction) => {
        const container = document.querySelector('.cast-list');
        if (container) {
            const scrollAmount = 300;
            const newPosition = direction === 'left' 
                ? Math.max(0, castScrollPosition - scrollAmount)
                : castScrollPosition + scrollAmount;
            
            container.scrollTo({ left: newPosition, behavior: 'smooth' });
            setCastScrollPosition(newPosition);
        }
    };

    // Navigation functions for video sections
    const scrollVideos = (direction, videoType) => {
        const container = document.querySelector(`.video-row-${videoType}`);
        if (container) {
            const scrollAmount = 300;
            const currentPosition = videoScrollPositions[videoType] || 0;
            const newPosition = direction === 'left' 
                ? Math.max(0, currentPosition - scrollAmount)
                : currentPosition + scrollAmount;
            
            container.scrollTo({ left: newPosition, behavior: 'smooth' });
            setVideoScrollPositions(prev => ({
                ...prev,
                [videoType]: newPosition
            }));
        }
    };

    useEffect(() => {
        const fetchMovieData = async () => {
            if (!movieId) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const [movieData, creditsData, videosData, cert] = await Promise.all([
                    getMovieDetails(movieId),
                    getMovieCredits(movieId),
                    getMovieVideos(movieId),
                    getMovieCertification(movieId)
                ]);
                
                if (!movieData) {
                    throw new Error('Movie not found');
                }

                // Set movie details
                setMovie(movieData);
                setCertification(cert);

                // Set cast information
                if (creditsData?.cast) {
                    setCast(creditsData.cast.slice(0, 20)); // Limit to top 20 cast members
                }

                // Group and sort videos by type
                if (videosData?.results) {
                    const grouped = videosData.results.reduce((acc, video) => {
                        if (!acc[video.type]) acc[video.type] = [];
                        acc[video.type].push(video);
                        return acc;
                    }, {});

                    // Sort videos by publish date
                    Object.keys(grouped).forEach((type) => {
                        grouped[type].sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
                    });

                    setGroupedVideos(grouped);
                }
            } catch (error) {
                console.error('Failed to fetch movie details:', error);
                setError('Failed to load movie details');
            } finally {
                setLoading(false);
            }
        };

        fetchMovieData();
    }, [movieId]);

    if (loading) {
        return (
            <div className="movie-details">
                <div className="loading-container">
                    <div className="loading"></div>
                    <p className="loading-text">Loading movie details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="movie-details">
                <div className="error-container">
                    <h2 className="error-title">Oops! Something went wrong</h2>
                    <p className="error-message">{error}</p>
                </div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="movie-details">
                <div className="error-container">
                    <h2 className="error-title">Movie Not Found</h2>
                    <p className="error-message">The requested movie could not be found.</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="movie-details"
            style={{
                backgroundImage: movie.poster_path 
                    ? `url(https://image.tmdb.org/t/p/original${movie.poster_path})`
                    : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#333',
            }}
        >
            <article className="movie-header">
                <h1 style={{position: 'relative'}}>
                    {movie.title || 'Unknown Title'}
                    <span className="release"> ({formatReleaseYear(movie.release_date)})</span>
                    {certification && (
                        <span className="certification-badge" style={{position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: '4px', padding: '2px 8px', fontWeight: 'bold', fontSize: '0.95em', marginLeft: '8px'}} title="Content Rating">
                            {certification}
                        </span>
                    )}
                    <span className="popularity">{movie.vote_average || 0}/10</span>
                    <button className="favorites-button" onClick={() => handleAddToFavorites(movie)}>
                        {isFavorite ? '❤️' : '🤍'}
                    </button>
                </h1>
                <div className="stat star-rating">
                    <span><small>Your Rating:</small></span>
                    {[...Array(5)].map((_, i) => (
                        <span
                            key={i}
                            className={`star ${i < userRating ? 'filled' : ''}`}
                            onClick={() => handleRating(i + 1)}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <p>
                    <span className="releaseDate">Released: {formatReleaseDate(movie.release_date)}</span>
                    <span className="genres"> | {movie.genres?.map((genre) => genre.name).join(', ') || 'Unknown'}</span>
                    <span className="runtime"> | {movie.runtime || 0} min.</span>
                </p>
                <div className="overview">
                    <h2 className="overview-heading">Overview</h2>
                    <p>{movie.overview || 'No overview available.'}</p>
                </div>
            </article>

            {/* Cast Section */}
            {cast.length > 0 && (
                <div className="cast-section">
                    <div className="section-header">
                        <h2 className='row-title'>Cast</h2>
                        <div className="navigation-arrows">
                            <button 
                                className="nav-arrow nav-arrow-left" 
                                onClick={() => scrollCast('left')}
                                aria-label="Scroll cast left"
                            >
                                ‹
                            </button>
                            <button 
                                className="nav-arrow nav-arrow-right" 
                                onClick={() => scrollCast('right')}
                                aria-label="Scroll cast right"
                            >
                                ›
                            </button>
                        </div>
                    </div>
                    <div className="cast-list">
                        {cast.map((actor) => (
                            <div key={actor.id} className="cast-card">
                                <img
                                    src={
                                        actor.profile_path
                                            ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                                            : 'https://via.placeholder.com/200x300?text=No+Image'
                                    }
                                    alt={actor.name || 'Unknown Actor'}
                                />
                                <p className="cast-name">{actor.name || 'Unknown Actor'}</p>
                                <p className="cast-character">as {actor.character || 'Unknown Character'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Videos Section */}
            {Object.keys(groupedVideos).length > 0 && (
                <div className="videos-section">
                    <h2 className="row-title">Videos</h2>
                    <div className="videos-container">
                        {Object.entries(groupedVideos).map(([type, videos]) => (
                            <div key={type} className="video-group">
                                <div className="section-header">
                                    <h3>{type}</h3>
                                    <div className="navigation-arrows">
                                        <button 
                                            className="nav-arrow nav-arrow-left" 
                                            onClick={() => scrollVideos('left', type)}
                                            aria-label={`Scroll ${type} videos left`}
                                        >
                                            ‹
                                        </button>
                                        <button 
                                            className="nav-arrow nav-arrow-right" 
                                            onClick={() => scrollVideos('right', type)}
                                            aria-label={`Scroll ${type} videos right`}
                                        >
                                            ›
                                        </button>
                                    </div>
                                </div>
                                <div className={`video-row video-row-${type}`}>
                                    {videos.map((video) => (
                                        <div key={video.id} className="video-card">
                                            <a
                                                href={`https://www.youtube.com/watch?v=${video.key}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <img
                                                    src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                                                    alt={video.name || 'Video thumbnail'}
                                                    className="video-thumbnail"
                                                />
                                            </a>
                                            <p className="video-name">{video.name || 'Untitled Video'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

MovieDetails.propTypes = {
    movieId: PropTypes.string.isRequired
};

export default MovieDetails;