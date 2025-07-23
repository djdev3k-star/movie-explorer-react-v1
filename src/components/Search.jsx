import { useEffect, useRef, useState } from "react";
import '../css/Search.css';
import { searchMovies } from '../services/api';

export default function Search(
    {
        searchQuery,
        setSearchQuery,
        setMovies,
    }
) {
      


    // Debounce timer ref
    const debounceRef = useRef();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Debounced live search effect
    useEffect(() => {
        if (!searchQuery.trim()) {
            if (hasSearched) setMovies([]);
            setError(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const searchResults = await searchMovies(searchQuery);
                setMovies(searchResults);
                setError(null);
            } catch (err) {
                setError("Failed to search movies...");
            } finally {
                setLoading(false);
            }
        }, 400);
        return () => clearTimeout(debounceRef.current);
        // eslint-disable-next-line
    }, [searchQuery, setMovies, hasSearched]);

    // For accessibility, still allow form submit
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setLoading(true);
        setHasSearched(true);
        try {
            const searchResults = await searchMovies(searchQuery);
            setMovies(searchResults);
            setError(null);
        } catch (err) {
            setError("Failed to search movies...");
        } finally {
            setLoading(false);
        }
    };

    // Clear error when user starts typing a new query
    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value) {
            setError(null);
        }
        setHasSearched(true);
    };

    return (
        <form onSubmit={handleSearch} className="search-form">
            <input
                type="text"
                placeholder="Search for movies..."
                className="search-input"
                value={searchQuery}
                onChange={handleInputChange}
                aria-label="Search for movies"
            />
            <button type="submit" className="search-button" disabled={loading}>
                {loading ? "Loading..." : "Search"}
            </button>
            {error && <p className="error-message" role="alert">{error}</p>}
        </form>
    );
}
