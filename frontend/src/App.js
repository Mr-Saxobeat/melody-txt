import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import useSiteSettings from './hooks/useSiteSettings';
import HomePage from './pages/HomePage';
import ComposerPage from './pages/ComposerPage';
import AuthPage from './pages/AuthPage';
import MyMelodiesPage from './pages/MyMelodiesPage';
import SharedMelodyPage from './pages/SharedMelodyPage';
import SetlistsPage from './pages/SetlistsPage';
import SetlistDetailPage from './pages/SetlistDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import './App.css';

function AppContent() {
  const { siteTitle, tabTitle, primaryColor, headerBg, logoColor, mainBgColor, logoFontFamily, logoFontSize, headerGradient } = useSiteSettings();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--header-bg', headerGradient || headerBg);
    root.style.setProperty('--logo-color', logoColor);
    root.style.setProperty('--main-bg-color', mainBgColor);
    root.style.setProperty('--logo-font-size', logoFontSize);
    if (logoFontFamily) {
      root.style.setProperty('--logo-font-family', logoFontFamily);
    }
    document.title = tabTitle;
  }, [primaryColor, headerBg, logoColor, mainBgColor, logoFontFamily, logoFontSize, headerGradient, tabTitle]);

  return (
    <div className="App">
      <Header siteTitle={siteTitle} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/compose" element={<ProtectedRoute><ComposerPage /></ProtectedRoute>} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/my-melodies"
              element={
                <ProtectedRoute>
                  <MyMelodiesPage />
                </ProtectedRoute>
              }
            />
            <Route path="/setlists" element={<SetlistsPage mode="public" />} />
            <Route
              path="/my-setlists"
              element={
                <ProtectedRoute>
                  <SetlistsPage mode="mine" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/setlists/:id"
              element={
                <ProtectedRoute>
                  <SetlistDetailPage />
                </ProtectedRoute>
              }
            />
            <Route path="/shared/:shareId" element={<SharedMelodyPage />} />
            <Route path="/shared-setlist/:shareId" element={<SetlistDetailPage readOnly />} />
          </Routes>
        </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
