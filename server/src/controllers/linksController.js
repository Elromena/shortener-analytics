import { query } from '../config/database.js';

const generateShortCode = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export const getLinks = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { search, platform, category, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    // Verify brand ownership
    const brandResult = await query(
      'SELECT id FROM brands WHERE id = $1 AND user_id = $2',
      [brandId, req.user.id]
    );

    if (brandResult.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    // Build query
    let whereConditions = ['brand_id = $1'];
    let params = [brandId];
    let paramCount = 1;

    if (search) {
      paramCount++;
      whereConditions.push(`(title ILIKE $${paramCount} OR short_code ILIKE $${paramCount})`);
      params.push(`%${search}%`);
    }

    if (platform) {
      paramCount++;
      whereConditions.push(`platform = $${paramCount}`);
      params.push(platform);
    }

    if (category) {
      paramCount++;
      whereConditions.push(`category = $${paramCount}`);
      params.push(category);
    }

    const validSortFields = ['created_at', 'title', 'platform'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const linksQuery = `
      SELECT l.*, COUNT(c.id) as click_count
      FROM links l
      LEFT JOIN clicks c ON l.id = c.link_id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY l.id
      ORDER BY ${sortField} ${order}
    `;

    const result = await query(linksQuery, params);
    res.json({ links: result.rows });
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
};

export const createLink = async (req, res) => {
  try {
    const { brand_id, original_url, title, platform, category, content_type, tags = [] } = req.body;

    if (!brand_id || !original_url || !title) {
      return res.status(400).json({ error: 'Brand ID, URL, and title are required' });
    }

    // Verify brand ownership
    const brandResult = await query(
      'SELECT id FROM brands WHERE id = $1 AND user_id = $2',
      [brand_id, req.user.id]
    );

    if (brandResult.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    // Generate unique short code
    let shortCode;
    let attempts = 0;
    while (attempts < 10) {
      shortCode = generateShortCode();
      const existing = await query('SELECT id FROM links WHERE short_code = $1', [shortCode]);
      if (existing.rows.length === 0) break;
      attempts++;
    }

    if (attempts === 10) {
      return res.status(500).json({ error: 'Failed to generate unique short code' });
    }

    const result = await query(
      `INSERT INTO links (brand_id, short_code, original_url, title, platform, category, content_type, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [brand_id, shortCode, original_url, title, platform, category, content_type, tags]
    );

    res.status(201).json({ link: result.rows[0] });
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({ error: 'Failed to create link' });
  }
};

export const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify link belongs to user's brand
    const verifyResult = await query(
      `SELECT l.id FROM links l
       INNER JOIN brands b ON l.brand_id = b.id
       WHERE l.id = $1 AND b.user_id = $2`,
      [id, req.user.id]
    );

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Delete clicks first, then the link
    await query('DELETE FROM clicks WHERE link_id = $1', [id]);
    await query('DELETE FROM links WHERE id = $1', [id]);

    res.json({ message: 'Link deleted' });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
};

export const archiveLinks = async (req, res) => {
  try {
    const { linkIds } = req.body;

    if (!Array.isArray(linkIds) || linkIds.length === 0) {
      return res.status(400).json({ error: 'Link IDs array required' });
    }

    // Verify all links belong to user's brands
    const verifyResult = await query(
      `SELECT l.id FROM links l
       INNER JOIN brands b ON l.brand_id = b.id
       WHERE l.id = ANY($1) AND b.user_id = $2`,
      [linkIds, req.user.id]
    );

    if (verifyResult.rows.length !== linkIds.length) {
      return res.status(403).json({ error: 'Unauthorized to archive some links' });
    }

    await query(
      `UPDATE links SET status = 'archived' WHERE id = ANY($1)`,
      [linkIds]
    );

    res.json({ message: `${linkIds.length} link(s) archived` });
  } catch (error) {
    console.error('Archive links error:', error);
    res.status(500).json({ error: 'Failed to archive links' });
  }
};

export const getTopPerformers = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { limit = 5, dateRange = 30 } = req.query;

    // Verify brand ownership
    const brandResult = await query(
      'SELECT id FROM brands WHERE id = $1 AND user_id = $2',
      [brandId, req.user.id]
    );

    if (brandResult.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const result = await query(
      `SELECT l.*, COUNT(c.id) as click_count
       FROM links l
       LEFT JOIN clicks c ON l.id = c.link_id AND c.clicked_at >= NOW() - INTERVAL '${parseInt(dateRange)} days'
       WHERE l.brand_id = $1 AND l.status = 'active'
       GROUP BY l.id
       ORDER BY click_count DESC
       LIMIT $2`,
      [brandId, parseInt(limit)]
    );

    res.json({ links: result.rows });
  } catch (error) {
    console.error('Get top performers error:', error);
    res.status(500).json({ error: 'Failed to fetch top performers' });
  }
};

export const getPerformanceData = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { dateRange = 30, metrics } = req.query;

    // Verify brand ownership
    const brandResult = await query(
      'SELECT * FROM brands WHERE id = $1 AND user_id = $2',
      [brandId, req.user.id]
    );

    if (brandResult.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const brand = brandResult.rows[0];
    const metricsObj = metrics ? JSON.parse(metrics) : { total: true };

    // Get clicks data
    const clicksResult = await query(
      `SELECT c.clicked_at, l.platform, l.category
       FROM clicks c
       INNER JOIN links l ON c.link_id = l.id
       WHERE l.brand_id = $1 AND c.clicked_at >= NOW() - INTERVAL '${parseInt(dateRange)} days'
       ORDER BY c.clicked_at`,
      [brandId]
    );

    // Build timeline
    const timeline = [];
    const now = new Date();
    
    for (let i = parseInt(dateRange) - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const point = { date: label, dateKey };
      if (metricsObj.total) point.total = 0;
      if (metricsObj.byPlatform) {
        ['Twitter', 'LinkedIn', 'Facebook', 'Instagram'].forEach(p => point[p] = 0);
      }
      if (metricsObj.byCategory) {
        (brand.default_categories || ['Gaming', 'Fintech', 'Advertising', 'Mobile Apps']).forEach(c => point[c] = 0);
      }
      timeline.push(point);
    }

    // Fill with click data
    const dateIndex = Object.fromEntries(timeline.map((t, i) => [t.dateKey, i]));
    
    clicksResult.rows.forEach(click => {
      const clickDate = new Date(click.clicked_at).toISOString().slice(0, 10);
      const idx = dateIndex[clickDate];
      if (idx !== undefined) {
        const point = timeline[idx];
        if (metricsObj.total) point.total++;
        if (metricsObj.byPlatform && point[click.platform] !== undefined) {
          point[click.platform]++;
        }
        if (metricsObj.byCategory && point[click.category] !== undefined) {
          point[click.category]++;
        }
      }
    });

    res.json({ data: timeline });
  } catch (error) {
    console.error('Get performance data error:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
};
