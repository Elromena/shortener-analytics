import { query } from '../config/database.js';

export const trackClick = async (req, res) => {
  try {
    const { linkId } = req.body;

    if (!linkId) {
      return res.status(400).json({ error: 'Link ID required' });
    }

    // Verify link exists and belongs to user
    const linkResult = await query(
      `SELECT l.* FROM links l
       INNER JOIN brands b ON l.brand_id = b.id
       WHERE l.id = $1 AND b.user_id = $2`,
      [linkId, req.user.id]
    );

    if (linkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    await query(
      'INSERT INTO clicks (link_id) VALUES ($1)',
      [linkId]
    );

    res.json({ message: 'Click tracked' });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
};

export const redirectAndTrack = async (req, res) => {
  try {
    const { slug, code } = req.params;

    // Find link by brand slug and short code
    const result = await query(
      `SELECT l.id, l.original_url, l.status
       FROM links l
       INNER JOIN brands b ON l.brand_id = b.id
       WHERE b.slug = $1 AND l.short_code = $2`,
      [slug, code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const link = result.rows[0];

    if (link.status !== 'active') {
      return res.status(410).json({ error: 'Link archived or inactive' });
    }

    // Track click with metadata
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const referrer = req.headers['referer'] || req.headers['referrer'];

    await query(
      'INSERT INTO clicks (link_id, ip_address, user_agent, referrer) VALUES ($1, $2, $3, $4)',
      [link.id, ipAddress, userAgent, referrer]
    );

    // Redirect to original URL
    res.redirect(link.original_url);
  } catch (error) {
    console.error('Redirect and track error:', error);
    res.status(500).json({ error: 'Redirect failed' });
  }
};

export const exportCSV = async (req, res) => {
  try {
    const { brandId } = req.params;

    // Verify brand ownership
    const brandResult = await query(
      'SELECT * FROM brands WHERE id = $1 AND user_id = $2',
      [brandId, req.user.id]
    );

    if (brandResult.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    // Get links with click counts
    const result = await query(
      `SELECT l.*, COUNT(c.id) as click_count
       FROM links l
       LEFT JOIN clicks c ON l.id = c.link_id
       WHERE l.brand_id = $1
       GROUP BY l.id
       ORDER BY l.created_at DESC`,
      [brandId]
    );

    // Generate CSV
    const headers = ['Title', 'Short Code', 'Original URL', 'Platform', 'Category', 'Content Type', 'Tags', 'Status', 'Clicks', 'Created At'];
    const rows = result.rows.map(link => [
      link.title,
      link.short_code,
      link.original_url,
      link.platform,
      link.category,
      link.content_type,
      (link.tags || []).join('; '),
      link.status,
      link.click_count,
      link.created_at
    ]);

    const csv = [headers, ...rows].map(row => 
      row.map(cell => {
        const str = String(cell || '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${brandResult.rows[0].slug}-links.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
};
