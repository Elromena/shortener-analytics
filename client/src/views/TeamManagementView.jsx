import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function TeamManagementView({ brand, onBack }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadMembers();
  }, [brand.id]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const { members: data } = await api.getBrandMembers(brand.id);
      setMembers(data);
    } catch (error) {
      setError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      await api.addBrandMember(brand.id, email.trim(), role);
      setSuccess(`Successfully added ${email} to the team!`);
      setEmail('');
      setRole('member');
      loadMembers();
    } catch (error) {
      setError(error.message || 'Failed to add member. Make sure they have an account.');
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!confirm(`Remove ${memberName} from this brand?`)) {
      return;
    }

    try {
      await api.removeBrandMember(brand.id, memberId);
      setSuccess(`Successfully removed ${memberName}`);
      loadMembers();
    } catch (error) {
      setError(error.message || 'Failed to remove member');
    }
  };

  const isOwner = brand.is_owner !== false; // Default to true if not specified

  return (
    <div className="view team-management-view">
      <header className="view-header">
        <div>
          <h1>Team Management — {brand.name}</h1>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage who has access to this brand's links and analytics
          </p>
        </div>
        <button className="btn btn-ghost" onClick={onBack}>
          Back to Dashboard
        </button>
      </header>

      {error && (
        <div className="auth-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="success-message" style={{ marginBottom: '1.5rem' }}>
          {success}
        </div>
      )}

      {isOwner && (
        <section className="add-member-section">
          <h2>Add Team Member</h2>
          <form className="add-member-form" onSubmit={handleAddMember}>
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teammate@example.com"
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  They must already have an account
                </small>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">
                  Add Member
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      <section className="members-section">
        <h2>Team Members ({members.length})</h2>
        
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading members...</p>
        ) : members.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No team members yet. Add someone to get started!</p>
        ) : (
          <div className="members-list">
            {members.map((member) => (
              <div key={member.id} className="member-card">
                <div className="member-info">
                  <div className="member-name">
                    {member.name}
                    {member.is_owner && (
                      <span className="owner-badge">Owner</span>
                    )}
                  </div>
                  <div className="member-email">{member.email}</div>
                  <div className="member-meta">
                    Role: <strong>{member.role}</strong> • Added {new Date(member.added_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="member-actions">
                  {isOwner && !member.is_owner && (
                    <button
                      className="btn btn-sm btn-ghost"
                      style={{ color: 'var(--error)' }}
                      onClick={() => handleRemoveMember(member.id, member.name)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
