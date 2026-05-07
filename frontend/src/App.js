import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
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
      </Router>
    </AuthProvider>
  );
}

export default App;
