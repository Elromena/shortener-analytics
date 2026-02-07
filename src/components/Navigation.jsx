import React from 'react';

export default function Navigation({ currentView, selectedBrand, onNavigate }) {
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
    </nav>
  );
}
