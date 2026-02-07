import React from 'react';
import { formatDate } from '../utils';

export default function BrandsView({ brands, getBrandStats, onSelectBrand, onCreateBrand }) {
  return (
    <div className="view brands-view">
      <header className="view-header">
        <h1>Your Brands</h1>
        <button className="btn btn-primary" onClick={onCreateBrand}>
          + Create Brand
        </button>
      </header>
      <div className="brands-grid">
        {brands.map((brand) => {
          const stats = getBrandStats(brand.id);
          return (
            <article key={brand.id} className="brand-card">
              <div className="brand-card-header">
                <h2>{brand.name}</h2>
                <span className="brand-slug">{brand.slug}</span>
              </div>
              <p className="brand-domain">{brand.domain}</p>
              <div className="brand-stats">
                <span>{stats.totalClicks} clicks</span>
                <span>{stats.activeLinks} active links</span>
              </div>
              <p className="brand-created">Created {formatDate(brand.created_at)}</p>
              <div className="brand-card-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => onSelectBrand(brand)}
                >
                  View Dashboard
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
