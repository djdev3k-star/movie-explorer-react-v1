import { useState } from "react";
import '../css/Search.css';
import { searchMovies } from '../services/api';

export default function Search(
    {
        searchQuery,
        setSearchQuery,
        loading,
        setLoading,
        setMovies,
        setError,
    }
) {
      


    // Search Event Handler
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        if (loading) return;

        setLoading(true);
        try {
            const searchResults = await searchMovies(searchQuery);
            setMovies(searchResults);
            setError(null);
        } catch (err) {
            if (err && err.message && err.message.toLowerCase().includes('network')) {
                setError("Network error. Please check your connection.");
            } else {
                setError("Failed to search movies...");
            }
        } finally {
            setLoading(false);
        }
    };

    // Clear error when user starts typing a new query
    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value && typeof setError === 'function') {
            setError(null);
        }
    };

    return (
        <form onSubmit={handleSearch} className="search-form">
            <input
                type="text"
                placeholder="Search for movies..."
                className="search-input"
                value={searchQuery}
                onChange={handleInputChange}
            />
            <button type="submit" className="search-button" disabled={loading}>
                {loading ? "Loading..." : "Search"}
            </button>
            {error && <p className="error-message">{error}</p>}
        </form>
    );
}
