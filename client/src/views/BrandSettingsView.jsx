import React, { useState } from 'react';

export default function BrandSettingsView({ brand, onUpdateBrand, onBack }) {
  const [name, setName] = useState(brand.name);
  const [domain, setDomain] = useState(brand.domain);
  const [defaultCategories, setDefaultCategories] = useState(
    (brand.default_categories || []).join(', ')
  );
  const [defaultTags, setDefaultTags] = useState(
    (brand.default_tags || []).join(', ')
  );
  const [defaultPlatforms, setDefaultPlatforms] = useState(
    (brand.default_platforms || []).join(', ')
  );
  const [defaultContentTypes, setDefaultContentTypes] = useState(
    (brand.default_content_types || []).join(', ')
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!domain.trim()) errs.domain = 'Domain is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setSaving(false);
      return;
    }

    const categories = defaultCategories
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    const tags = defaultTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const platforms = defaultPlatforms
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    const contentTypes = defaultContentTypes
      .split(',')
      .map((ct) => ct.trim())
      .filter(Boolean);

    const success = await onUpdateBrand(brand.id, {
      name: name.trim(),
      domain: domain.trim(),
      default_categories: categories,
      default_tags: tags,
      default_platforms: platforms,
      default_content_types: contentTypes,
    });

    setSaving(false);
    if (success) {
      onBack();
    }
  };

  return (
    <div className="view brand-settings-view">
      <header className="view-header">
        <div>
          <h1>Brand Settings</h1>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Update {brand.name} configuration
          </p>
        </div>
        <button className="btn btn-ghost" onClick={onBack}>
          Cancel
        </button>
      </header>

      <form className="form" onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div className="form-group">
          <label htmlFor="name">Brand Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Blockchain Ads"
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="slug">URL Slug</label>
          <input
            id="slug"
            type="text"
            value={brand.slug}
            disabled
            style={{ opacity: 0.6, cursor: 'not-allowed' }}
          />
          <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Slug cannot be changed (used in short URLs)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="domain">Domain</label>
          <input
            id="domain"
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="e.g. blockchain-ads.com"
          />
          {errors.domain && <span className="form-error">{errors.domain}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="categories">Default Categories (comma-separated)</label>
          <input
            id="categories"
            type="text"
            value={defaultCategories}
            onChange={(e) => setDefaultCategories(e.target.value)}
            placeholder="Gaming, Fintech, Advertising, Mobile Apps"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Default Tags (comma-separated)</label>
          <input
            id="tags"
            type="text"
            value={defaultTags}
            onChange={(e) => setDefaultTags(e.target.value)}
            placeholder="campaign, social, promo"
          />
        </div>

        <div className="form-group">
          <label htmlFor="platforms">Default Platforms (comma-separated)</label>
          <input
            id="platforms"
            type="text"
            value={defaultPlatforms}
            onChange={(e) => setDefaultPlatforms(e.target.value)}
            placeholder="Twitter, LinkedIn, Facebook, Instagram, TikTok"
          />
          <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            These will appear as dropdown options when creating links
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="contentTypes">Default Content Types (comma-separated)</label>
          <input
            id="contentTypes"
            type="text"
            value={defaultContentTypes}
            onChange={(e) => setDefaultContentTypes(e.target.value)}
            placeholder="Blog Post, Video, Infographic, Landing Page"
          />
          <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            These will appear as dropdown options when creating links
          </small>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
