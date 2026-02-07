import React, { useState } from 'react';
import { slugify } from '../utils';

export default function CreateBrandView({ onCreateBrand, onCancel }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState('');
  const [defaultCategories, setDefaultCategories] = useState('');
  const [defaultTags, setDefaultTags] = useState('');
  const [errors, setErrors] = useState({});

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!slug) setSlug(slugify(val));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!slug.trim()) errs.slug = 'Slug is required';
    if (!domain.trim()) errs.domain = 'Domain is required';

    const categories = defaultCategories
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    const tags = defaultTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    onCreateBrand({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      domain: domain.trim(),
      default_categories: categories,
      default_tags: tags,
    });
  };

  return (
    <div className="view create-brand-view">
      <header className="view-header">
        <h1>Create Brand</h1>
        <button className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </header>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Brand Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="e.g. Blockchain Ads"
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="slug">URL Slug</label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. ba"
          />
          {errors.slug && <span className="form-error">{errors.slug}</span>}
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
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Create Brand
          </button>
        </div>
      </form>
    </div>
  );
}
