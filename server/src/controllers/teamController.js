import { query } from '../config/database.js';

export const getBrandMembers = async (req, res) => {
  try {
    const { brandId } = req.params;

    // Verify user has access to this brand
    const accessCheck = await query(
      `SELECT b.id FROM brands b
       LEFT JOIN brand_members bm ON b.id = bm.brand_id AND bm.user_id = $2
       WHERE b.id = $1 AND (b.user_id = $2 OR bm.user_id IS NOT NULL)`,
      [brandId, req.user.id]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all members
    const result = await query(
      `SELECT u.id, u.name, u.email, bm.role, bm.added_at,
              CASE WHEN b.user_id = u.id THEN true ELSE false END as is_owner
       FROM brand_members bm
       INNER JOIN users u ON bm.user_id = u.id
       INNER JOIN brands b ON bm.brand_id = b.id
       WHERE bm.brand_id = $1
       UNION
       SELECT u.id, u.name, u.email, 'owner' as role, b.created_at as added_at, true as is_owner
       FROM brands b
       INNER JOIN users u ON b.user_id = u.id
       WHERE b.id = $1
       ORDER BY added_at`,
      [brandId]
    );

    res.json({ members: result.rows });
  } catch (error) {
    console.error('Get brand members error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
};

export const addBrandMember = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { email, role = 'member' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Verify user is brand owner
    const brandCheck = await query(
      'SELECT user_id FROM brands WHERE id = $1',
      [brandId]
    );

    if (brandCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    if (brandCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only brand owner can add members' });
    }

    // Find user by email
    const userResult = await query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found with that email' });
    }

    const newMember = userResult.rows[0];

    // Check if already a member
    const existingMember = await query(
      'SELECT id FROM brand_members WHERE brand_id = $1 AND user_id = $2',
      [brandId, newMember.id]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Add member
    await query(
      'INSERT INTO brand_members (brand_id, user_id, role) VALUES ($1, $2, $3)',
      [brandId, newMember.id, role]
    );

    res.status(201).json({
      message: 'Member added successfully',
      member: { ...newMember, role, is_owner: false }
    });
  } catch (error) {
    console.error('Add brand member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
};

export const removeBrandMember = async (req, res) => {
  try {
    const { brandId, memberId } = req.params;

    // Verify user is brand owner
    const brandCheck = await query(
      'SELECT user_id FROM brands WHERE id = $1',
      [brandId]
    );

    if (brandCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    if (brandCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only brand owner can remove members' });
    }

    // Remove member
    const result = await query(
      'DELETE FROM brand_members WHERE brand_id = $1 AND user_id = $2',
      [brandId, memberId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove brand member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};
