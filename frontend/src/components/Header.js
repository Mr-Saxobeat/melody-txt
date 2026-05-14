import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Header({ siteTitle = 'Melody Txt' }) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="header-logo" onClick={closeMenu}>
          {siteTitle}
        </Link>
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-icon ${menuOpen ? 'open' : ''}`} />
        </button>
        <nav className={`header-nav ${menuOpen ? 'nav-open' : ''}`}>
          <Link to="/setlists" className="nav-link" onClick={closeMenu}>Setlists</Link>
          <Link to="/compose" className="nav-link" onClick={closeMenu}>{isAuthenticated && user ? user.username : 'Compose'}</Link>
          {isAuthenticated ? (
            <>
              <Link to="/my-melodies" className="nav-link" onClick={closeMenu}>My Melodies</Link>
              <Link to="/my-setlists" className="nav-link" onClick={closeMenu}>My Setlists</Link>
              <button className="nav-link nav-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="nav-link" onClick={closeMenu}>Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
