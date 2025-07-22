import { createContext, useState, useContext, useEffect } from "react";
import PropTypes from 'prop-types';

/**
 * Context for managing movie-related state across the application
 * @type {React.Context}
 */
const MovieContext = createContext();

/**
 * Custom hook to easily access the MovieContext
 * @returns {Object} Movie context value containing favorites and related functions
 * @property {Array} favorites - List of favorite movies
 * @property {Function} addToFavorites - Function to add a movie to favorites
 * @property {Function} removeFromFavorites - Function to remove a movie from favorites
 * @property {Function} isFavorite - Function to check if a movie is in favorites
 */
export const useMovieContext = () => useContext(MovieContext);

/**
 * Provider component to wrap the application and provide movie-related context values
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to the context
 * @returns {JSX.Element} Provider component that wraps children with movie context
 */
export const MovieProvider = ({ children }) => {
    // State to hold the list of favorite movies
    const [favorites, setFavorites] = useState([]);

    // Effect to load favorites from localStorage when the component mounts
    useEffect(() => {
        const storedFavs = localStorage.getItem("favorites"); // Fetch stored favorites
        if (storedFavs) setFavorites(JSON.parse(storedFavs)); // Parse and set favorites if found
    }, []); // Runs once when the component mounts

    // Effect to update localStorage whenever the favorites list changes
    useEffect(() => {
        localStorage.setItem("favorites", JSON.stringify(favorites)); // Save favorites to localStorage
    }, [favorites]); // Dependency: runs whenever `favorites` changes

    // Function to add a movie to the favorites list
    const addToFavorites = (movie) => {
        setFavorites((prev) => [...prev, movie]); // Add the new movie while keeping existing ones
    };

    // Function to remove a movie from the favorites list by its ID
    const removeFromFavorites = (movieId) => {
        setFavorites((prev) => prev.filter((movie) => movie.id !== movieId)); // Filter out the movie by ID
    };

    // Function to check if a movie is in the favorites list
    const isFavorite = (movieId) => {
        return favorites.some((movie) => movie.id === movieId); // Returns true if the movie exists in favorites
    };

    // Context value to provide the state and functions to children
    const value = {
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
    };

    // Return the provider to wrap children and pass down the context value
    return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};

MovieProvider.propTypes = {
    children: PropTypes.node.isRequired
};
