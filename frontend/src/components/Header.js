import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useTranslation from '../i18n/useTranslation';

function Header({ siteTitle = 'Melody Txt' }) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

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
          <Link to="/setlists" className="nav-link" onClick={closeMenu}>{t('nav.setlists')}</Link>
          <Link to="/compose" className="nav-link" onClick={closeMenu}>{isAuthenticated && user ? user.username : t('nav.compose')}</Link>
          {isAuthenticated ? (
            <>
              <Link to="/my-melodies" className="nav-link" onClick={closeMenu}>{t('nav.myMelodies')}</Link>
              <Link to="/my-setlists" className="nav-link" onClick={closeMenu}>{t('nav.mySetlists')}</Link>
              <button className="nav-link nav-button" onClick={handleLogout}>
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <Link to="/auth" className="nav-link" onClick={closeMenu}>{t('nav.login')}</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
