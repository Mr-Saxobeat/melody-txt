import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="header-logo">
          Melody Txt
        </Link>
        <nav className="header-nav">
          <Link to="/setlists" className="nav-link">Setlists</Link>
          <Link to="/compose" className="nav-link">{isAuthenticated && user ? user.username : 'Compose'}</Link>
          {isAuthenticated ? (
            <>
              <Link to="/my-melodies" className="nav-link">My Melodies</Link>
              <Link to="/my-setlists" className="nav-link">My Setlists</Link>
              <button className="nav-link nav-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="nav-link">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
