import React, { useState } from 'react';

const PLATFORM_SUGGESTIONS = ['Twitter', 'LinkedIn', 'Facebook', 'Instagram', 'TikTok', 'YouTube', 'Reddit', 'Pinterest'];
const CONTENT_TYPE_SUGGESTIONS = ['Blog Post', 'Video', 'Infographic', 'Landing Page', 'Podcast', 'Webinar', 'eBook', 'Case Study'];

export default function CreateLinkView({ brand, onCreateLink, onCancel }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('');
  const [category, setCategory] = useState(brand?.default_categories?.[0] || '');
  const [contentType, setContentType] = useState('');
  const [tagsInput, setTagsInput] = useState(brand?.default_tags?.join(', ') || '');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!originalUrl.trim()) errs.originalUrl = 'URL is required';
    else {
      try {
        new URL(originalUrl.trim());
      } catch {
        errs.originalUrl = 'Enter a valid URL';
      }
    }
    if (!title.trim()) errs.title = 'Title is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onCreateLink({
      brand_id: brand.id,
      original_url: originalUrl.trim(),
      title: title.trim(),
      platform: platform.trim() || 'Other',
      category: category || categories[0],
      content_type: contentType.trim() || 'Other',
      tags,
    });
  };

  const categories = brand?.default_categories?.length
    ? brand.default_categories
    : ['Gaming', 'Fintech', 'Advertising', 'Mobile Apps'];

  return (
    <div className="view create-link-view">
      <header className="view-header">
        <h1>Create Link — {brand?.name}</h1>
        <button className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </header>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="originalUrl">Destination URL</label>
          <input
            id="originalUrl"
            type="url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://example.com/article"
          />
          {errors.originalUrl && <span className="form-error">{errors.originalUrl}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="title">Title / Description</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q1 Campaign Launch"
          />
          {errors.title && <span className="form-error">{errors.title}</span>}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="platform">Platform</label>
            <input
              id="platform"
              type="text"
              list="platform-suggestions"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="e.g. Twitter, LinkedIn, or type your own"
            />
            <datalist id="platform-suggestions">
              {PLATFORM_SUGGESTIONS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="contentType">Content Type</label>
          <input
            id="contentType"
            type="text"
            list="content-type-suggestions"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            placeholder="e.g. Blog Post, Video, or type your own"
          />
          <datalist id="content-type-suggestions">
            {CONTENT_TYPE_SUGGESTIONS.map((ct) => (
              <option key={ct} value={ct} />
            ))}
          </datalist>
        </div>
        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            id="tags"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="campaign, social, promo"
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Create Link
          </button>
        </div>
      </form>
    </div>
  );
}
