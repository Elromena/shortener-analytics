# Multi-Brand Link Shortener & Analytics

A comprehensive link management and analytics platform for managing multiple brands with flexible performance tracking.

## Features

- **Multi-Brand Management** — Manage unlimited brands with unique slugs and domains
- **Link Creation & Management** — Create shortened links with platform, category, and tags
- **Flexible Analytics** — One performance chart with toggleable metrics (Total Clicks, By Platform, By Category)
- **Search & Filtering** — Full-text search, platform/category filters, sorting, pagination
- **Top Performers** — Top 5 links by click count
- **Bulk Operations** — Archive multiple links with confirmation
- **CSV Export** — Export all link data and click counts

## Deployment

This app is configured for Railway deployment:

1. Push to GitHub: `git push`
2. Connect repo in Railway dashboard
3. Railway will auto-deploy using the configuration in `nixpacks.toml`

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

- React 18
- Vite
- Recharts
- localStorage (data persistence)

## Data Model

- **Brand** — id, name, slug, domain, default_categories, default_tags
- **Link** — id, brand_id, short_code, original_url, title, platform, category, content_type, tags, status
- **Click** — id, link_id, clicked_at

Short URL format: `https://{domain}/{brand_slug}/{short_code}`

## Demo Data

On first load, the app creates demo data: 1 brand, 5 sample links, and ~750 sample clicks distributed across 30 days.
