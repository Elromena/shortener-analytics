import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const query = (text, params) => pool.query(text, params);

export const initDatabase = async () => {
  try {
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Brands table
    await query(`
      CREATE TABLE IF NOT EXISTS brands (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        domain VARCHAR(255) NOT NULL,
        default_categories TEXT[] DEFAULT '{}',
        default_tags TEXT[] DEFAULT '{}',
        default_platforms TEXT[] DEFAULT '{}',
        default_content_types TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add columns if they don't exist (for existing databases)
    await query(`
      ALTER TABLE brands 
      ADD COLUMN IF NOT EXISTS default_platforms TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS default_content_types TEXT[] DEFAULT '{}'
    `);

    // Brand members table (for team collaboration)
    await query(`
      CREATE TABLE IF NOT EXISTS brand_members (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(brand_id, user_id)
      )
    `);

    // Links table
    await query(`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
        short_code VARCHAR(20) UNIQUE NOT NULL,
        original_url TEXT NOT NULL,
        title VARCHAR(500) NOT NULL,
        platform VARCHAR(50),
        category VARCHAR(100),
        content_type VARCHAR(100),
        tags TEXT[] DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Clicks table
    await query(`
      CREATE TABLE IF NOT EXISTS clicks (
        id SERIAL PRIMARY KEY,
        link_id INTEGER REFERENCES links(id) ON DELETE CASCADE,
        ip_address VARCHAR(45),
        user_agent TEXT,
        referrer TEXT,
        clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for performance
    await query(`CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_brand_members_brand_id ON brand_members(brand_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_brand_members_user_id ON brand_members(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_links_brand_id ON links(brand_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_clicks_link_id ON clicks(link_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at)`);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

export default pool;
