# 🔗 Multi-Brand Link Shortener & Analytics (Full-Stack)

A production-ready link management and analytics platform with PostgreSQL, Express backend, React frontend, and team collaboration.

## ✨ Features

### Team Collaboration
- **User Authentication** — Secure JWT-based auth with email/password
- **Team Access** — All team members see the same brands, links, and analytics
- **Real-time Analytics** — Track actual clicks with IP, user agent, and referrer

### Core Features
- **Multi-Brand Management** — Unlimited brands with unique slugs and domains
- **Link Creation** — Auto-generated or custom short codes with metadata
- **Flexible Analytics** — Google Search Console-style chart with toggleable metrics
- **Click Tracking** — Public redirect endpoints that track and redirect
- **Search & Filtering** — Full-text search, platform/category filters, sorting, pagination
- **CSV Export** — Export all link data with click counts

## 🏗️ Tech Stack

### Backend
- **Node.js + Express** — RESTful API
- **PostgreSQL** — Relational database
- **JWT** — Authentication
- **bcryptjs** — Password hashing

### Frontend
- **React 18** — UI framework
- **Vite** — Build tool
- **Recharts** — Analytics charts

## 📦 Project Structure

```
link-shortener/
├── server/               # Express backend
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth middleware
│   │   ├── routes/       # API routes
│   │   └── server.js     # Entry point
│   └── package.json
├── client/               # React frontend
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # Auth context
│   │   ├── views/        # Page components
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── package.json          # Root scripts
```

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/Elromena/shortener-analytics.git
   cd shortener-analytics
   npm run install:all
   ```

2. **Set up PostgreSQL**
   ```bash
   createdb link_shortener
   ```

3. **Configure environment variables**
   
   **server/.env**
   ```env
   PORT=3001
   NODE_ENV=development
   DATABASE_URL=postgresql://username:password@localhost:5432/link_shortener
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
   CLIENT_URL=http://localhost:5173
   ```

   **client/.env**
   ```env
   VITE_API_URL=http://localhost:3001
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   npm run dev:server

   # Terminal 2 - Frontend
   npm run dev:client
   ```

5. **Open** http://localhost:5173

## 🌐 Deploy to Railway

### Prerequisites
- GitHub account
- Railway account (railway.app)

### Steps

1. **Push to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Full-stack link shortener"
   git push
   ```

2. **Create PostgreSQL database in Railway**
   - Go to Railway dashboard
   - Click "New Project"
   - Click "Provision PostgreSQL"
   - Copy the `DATABASE_URL` from the database settings

3. **Deploy the application**
   - Click "New" → "GitHub Repo"
   - Select `shortener-analytics`
   - Railway will auto-detect the Nixpacks config

4. **Set environment variables**
   
   In the Railway project settings, add:
   ```
   NODE_ENV=production
   DATABASE_URL=(copied from PostgreSQL service)
   JWT_SECRET=(generate a secure random string)
   CLIENT_URL=(will be your Railway app URL, e.g. https://your-app.up.railway.app)
   ```

5. **Deploy!**
   - Railway will build and deploy automatically
   - Your app will be live at `https://your-app.up.railway.app`

## 🔗 How Link Redirects Work

### Short URL Format
```
https://yourdomain.com/r/{brand_slug}/{short_code}
```

### Example
```
Brand: Blockchain Ads (slug: ba, domain: blockchain-ads.com)
Link: abc123

Short URL: https://yourdomain.com/r/ba/abc123
↓
Tracks click (IP, user agent, referrer)
↓
Redirects to original URL
```

### Custom Domain Setup (Optional)
1. Point your custom domain to Railway
2. Update `brand.domain` in the app to match
3. Short URLs will show your custom domain in the UI

## 📊 Database Schema

```sql
users (id, email, password_hash, name, role, created_at)
brands (id, user_id, name, slug, domain, default_categories, default_tags, created_at)
links (id, brand_id, short_code, original_url, title, platform, category, content_type, tags, status, created_at)
clicks (id, link_id, ip_address, user_agent, referrer, clicked_at)
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Brands
- `GET /api/brands` — Get user's brands
- `POST /api/brands` — Create brand
- `GET /api/brands/:id/stats` — Get brand stats

### Links
- `GET /api/links/brand/:brandId` — Get links with filters
- `POST /api/links` — Create link
- `POST /api/links/archive` — Archive links
- `GET /api/links/brand/:brandId/top-performers` — Top links
- `GET /api/links/brand/:brandId/performance` — Analytics data

### Clicks
- `POST /api/clicks/track` — Test click (authenticated)
- `GET /api/clicks/export/:brandId` — Export CSV

### Public Redirect
- `GET /r/:slug/:code` — Redirect and track (no auth required)

## 🤝 Team Collaboration

### Adding Team Members
1. They create an account (register)
2. They log in and can create their own brands
3. OR you can implement team invites (future enhancement)

### Sharing Data
- All links and analytics are stored in PostgreSQL
- Any team member can log in and see their brands
- Real-time updates reflected across all sessions

## 🆚 localStorage vs PostgreSQL

| Feature | localStorage (Old) | PostgreSQL (New) |
|---------|-------------------|------------------|
| Team access | ❌ Browser only | ✅ All team members |
| Data persistence | ❌ Clears with cache | ✅ Permanent |
| Real redirects | ❌ Not possible | ✅ Public endpoints |
| Analytics | ❌ Fake data | ✅ Real click tracking |
| User accounts | ❌ None | ✅ JWT auth |
| Production ready | ❌ No | ✅ Yes |

## 📝 License

MIT

---

**Built with ❤️ for real-world link management**
