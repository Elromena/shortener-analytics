import { query } from '../config/database.js';

export const getBrands = async (req, res) => {
  try {
    // Get brands owned by user or brands they're a member of
    const result = await query(
      `SELECT DISTINCT b.*, 
              CASE WHEN b.user_id = $1 THEN true ELSE false END as is_owner
       FROM brands b
       LEFT JOIN brand_members bm ON b.id = bm.brand_id
       WHERE b.user_id = $1 OR bm.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json({ brands: result.rows });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
};

export const createBrand = async (req, res) => {
  try {
    const { 
      name, 
      slug, 
      domain, 
      default_categories = [], 
      default_tags = [],
      default_platforms = [],
      default_content_types = []
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    // Check if slug already exists
    const existing = await query('SELECT id FROM brands WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const result = await query(
      `INSERT INTO brands (user_id, name, slug, domain, default_categories, default_tags, default_platforms, default_content_types)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, name, slug, domain, default_categories, default_tags, default_platforms, default_content_types]
    );

    res.status(201).json({ brand: result.rows[0] });
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({ error: 'Failed to create brand' });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      domain, 
      default_categories = [], 
      default_tags = [],
      default_platforms = [],
      default_content_types = []
    } = req.body;

    // Verify ownership
    const brandResult = await query(
      'SELECT * FROM brands WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (brandResult.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found or access denied' });
    }

    const result = await query(
      `UPDATE brands 
       SET name = $1, domain = $2, default_categories = $3, default_tags = $4,
           default_platforms = $5, default_content_types = $6
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [name, domain, default_categories, default_tags, default_platforms, default_content_types, id, req.user.id]
    );

    res.json({ brand: result.rows[0] });
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({ error: 'Failed to update brand' });
  }
};

export const getBrandStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateRange = 30 } = req.query;

    // Verify ownership
    const brandResult = await query(
      'SELECT * FROM brands WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (brandResult.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    // Get active links count
    const linksResult = await query(
      `SELECT COUNT(*) as count FROM links WHERE brand_id = $1 AND status = 'active'`,
      [id]
    );

    // Get clicks count within date range
    const clicksResult = await query(
      `SELECT COUNT(*) as count FROM clicks c
       INNER JOIN links l ON c.link_id = l.id
       WHERE l.brand_id = $1 AND c.clicked_at >= NOW() - INTERVAL '${parseInt(dateRange)} days'`,
      [id]
    );

    res.json({
      totalClicks: parseInt(clicksResult.rows[0].count),
      activeLinks: parseInt(linksResult.rows[0].count)
    });
  } catch (error) {
    console.error('Get brand stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
