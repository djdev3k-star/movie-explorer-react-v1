import { Link } from "react-router-dom";
import { useState } from "react";
import '../css/NavBar.css'

export default function NavBar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    <span className="logo">🎬</span> 
                    Movie Explorer
                </Link>
            </div>

            <button 
                className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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