import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MovieProvider } from '../contexts/MovieContext';
import MovieCard from './MovieCard';

// Mock movie data for testing
const mockMovie = {
    id: 1,
    title: "Test Movie",
    poster_path: "/test-poster.jpg",
    vote_average: 8.5,
    release_date: "2025-07-22"
};

// Wrapper component to provide necessary context and routing
const MovieCardWrapper = ({ children }) => (
    <BrowserRouter>
        <MovieProvider>
            {children}
        </MovieProvider>
    </BrowserRouter>
);

describe('MovieCard Component', () => {
    it('renders movie information correctly', () => {
        render(<MovieCard movie={mockMovie} />, { wrapper: MovieCardWrapper });
        
        // Check if title is rendered
        expect(screen.getByText('Test Movie')).toBeInTheDocument();
        
        // Check if year is rendered
        expect(screen.getByText('2025')).toBeInTheDocument();
        
        // Check if rating is rendered
        expect(screen.getByText('8.5')).toBeInTheDocument();
        
        // Check if quality badge is rendered for high rating
        expect(screen.getByText('Excellent')).toBeInTheDocument();
    });

    it('handles missing movie data gracefully', () => {
        const incompleteMovie = {
            id: 2,
            title: "Incomplete Movie"
            // Missing poster_path, vote_average, and release_date
        };

        render(<MovieCard movie={incompleteMovie} />, { wrapper: MovieCardWrapper });
        
        // Title should still be rendered
        expect(screen.getByText('Incomplete Movie')).toBeInTheDocument();
        
        // Should show 'Unknown' for missing release date
        expect(screen.getByText('Unknown')).toBeInTheDocument();
        
        // Quality badge should not be rendered
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('toggles favorite status when clicking favorite button', () => {
        render(<MovieCard movie={mockMovie} />, { wrapper: MovieCardWrapper });
        
        // Find and click the favorite button
        const favoriteButton = screen.getByLabelText('Add to favorites');
        fireEvent.click(favoriteButton);
        
        // Button should now show "Remove from favorites"
        expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument();
        
        // Click again to remove from favorites
        fireEvent.click(favoriteButton);
        
        // Button should show "Add to favorites" again
        expect(screen.getByLabelText('Add to favorites')).toBeInTheDocument();
    });

    it('navigates to movie details when clicking the card', () => {
        render(<MovieCard movie={mockMovie} />, { wrapper: MovieCardWrapper });
        
        const movieCard = screen.getByRole('article');
        fireEvent.click(movieCard);
        
        // Should navigate to /movie/1
        expect(window.location.pathname).toBe('/movie/1');
    });
});
