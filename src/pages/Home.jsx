import MovieCard from "../components/MovieCard"
import Search from "../components/Search";
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"; // For navigation
import { searchMovies, getPopularMovies, getMovieCertification } from "../services/api"
import { useFireproofContext } from "../contexts/FireproofContext";
import '../css/Home.css'

export default function Home () {
    const [searchQuery, setSearchQuery] = useState("")
    const [movies, setMovies] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true)
    const [errorType, setErrorType] = useState(null); // 'load' or 'search'

    const { useLiveQuery } = useFireproofContext();
    const { docs: userMovies } = useLiveQuery("_id", { descending: true });

    const navigate = useNavigate(); // Hook to handle navigation

    useEffect(() => {
        const loadPopularMovies = async () => {
            try {
                const popularMovies = await getPopularMovies();
                // Fetch certifications in parallel
                const moviesWithCerts = await Promise.all(popularMovies.map(async (movie) => {
                    const certification = await getMovieCertification(movie.id);
                    return { ...movie, certification };
                }));
                setMovies(moviesWithCerts)
            } catch (err) {
                setError("Failed to load popular movies. Please try again later.");
                setErrorType('load');
            }
            finally {
                setLoading(false)
            }
        }
        loadPopularMovies()
    }, [])

    const handleSearch = async (e) => {
        e.preventDefault()
       if (!searchQuery.trim()) return
       if (loading) return

       setLoading(true) 
        try {
            const searchResults = await searchMovies(searchQuery)
            // Fetch certifications in parallel
            const moviesWithCerts = await Promise.all(searchResults.map(async (movie) => {
                const certification = await getMovieCertification(movie.id);
                return { ...movie, certification };
            }));
            setMovies(moviesWithCerts)
            setError(null)
            setErrorType(null);
        }            
            catch (err) {
            console.log(err)
            setError("Failed to search movies. Please check your query or try again later.")
            setErrorType('search');
        }
            finally { 
                setLoading(false) 
        }
    };

     const handleMovieClick = (movieId) => {
        navigate(`/movie/${movieId}`); // Navigate to the movie details page
    };

    if (loading) {
        return (
            <div className="home">
                <div className="loading-container">
                    <div className="loading"></div>
                    <p className="loading-text">Loading amazing movies...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="home">
                <div className="error-container">
                    <h2 className="error-title">{errorType === 'search' ? 'Search Error' : 'Loading Error'}</h2>
                    <p className="error-message">{error}</p>
                </div>
            </div>
        );
    }

    // Merge TMDB movies with Fireproof userDocs (for favorites, flags, review, rating)
    const mergedMovies = movies.map(tmdb => {
        const userDoc = userMovies.find(u => u._id === tmdb.id.toString());
        return userDoc
            ? { ...tmdb, ...userDoc }
            : tmdb;
    });
    // Include user-only docs (movies without TMDB id)
    const userOnly = userMovies.filter(u => !u.id);
    const allMovies = [...mergedMovies, ...userOnly];

    return (        
        <div className="home">
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Movie Trek</h1>
                    <p className="hero-subtitle">
                        Discover amazing movies, create your favorites collection, and explore the world of cinema
                    </p>
                </div>
            </div>

            <Search
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                setMovies={setMovies}
            />

            <div className="section-header">
                <h2 className="section-title">
                    {searchQuery ? `Search Results for "${searchQuery}"` : 'Popular Movies'}
                </h2>
                <p className="section-subtitle">
                    {searchQuery ? `Found ${allMovies.length} movies` : 'Trending movies everyone is watching'}
                </p>
            </div>

            {allMovies.length === 0 ? (
                <div className="empty-state">
                    <h3>No movies found</h3>
                    <p>Try searching for something else or check back later for more movies.</p>
                </div>
            ) : (
                <div className="movies-grid">
                    {allMovies.map((movie) => (
                        <div
                            key={movie._id || movie.id}
                            className="movie-card-container"
                            onClick={() => handleMovieClick(movie.id || movie._id)}
                        >
                            <MovieCard movie={movie} certification={movie.certification} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}