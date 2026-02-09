import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Navigation({ currentView, selectedBrand, onNavigate }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="nav">
      <div className="nav-brand">
        <span className="nav-logo">🔗</span>
        <span className="nav-title">Link Shortener</span>
      </div>
      <div className="nav-links">
        <button
          className={`nav-link ${currentView === 'brands' ? 'active' : ''}`}
          onClick={() => onNavigate('brands')}
        >
          Brands
        </button>
        {selectedBrand && (
          <>
            <button
              className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => onNavigate('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`nav-link ${currentView === 'create-link' ? 'active' : ''}`}
              onClick={() => onNavigate('create-link')}
            >
              Create Link
            </button>
          </>
        )}
      </div>
      <div className="nav-user">
        <button 
          className="btn btn-ghost btn-sm theme-toggle" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <span className="nav-user-name">{user?.name}</span>
        <button className="btn btn-ghost btn-sm" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
