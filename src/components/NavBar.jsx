import { Link } from "react-router-dom";
import { useState } from "react";
import '../css/NavBar.css'
import logo from '../assets/logo.svg'; // Assuming you have a logo image

export default function NavBar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    
                    <span className="brand-name"><img src={logo} alt="Movie Trek" className="nav-logo" /></span>
                </Link>
            </div>

            <button 
                className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/favorites" className="nav-link">Favorites</Link>
            </div>
        </nav>
    )
}