import React, { useState } from 'react';
import { Lock, Mail, User, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../api/client';

export default function AuthScreen({ onAuthSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('INTERVIEWER');
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let user;
      if (isRegistering) {
        if (!name.trim() || !email.trim() || !password.trim()) {
          throw new Error('Please fill in all required fields.');
        }
        user = await api.register(name, email, password, role);
      } else {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please enter your email address and password.');
        }
        user = await api.login(email, password);
      }

      // Save user to localStorage
      localStorage.setItem('evalsheet_user', JSON.stringify(user));
      onAuthSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      padding: '1.5rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-floating)',
        overflow: 'hidden'
      }}>
        {/* Brand Header */}
        <div style={{
          backgroundColor: 'var(--c-primary)',
          color: '#ffffff',
          padding: '1.75rem 1.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--c-accent)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '1rem',
            marginBottom: '0.75rem'
          }}>
            EVAL
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            EvalSheet
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--c-subtle-text)', marginTop: '0.25rem' }}>
            Universal Multi-Interviewer Evaluation Platform
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-subtle)'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setError(null); }}
            style={{
              padding: '0.75rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: !isRegistering ? 'var(--bg-surface)' : 'transparent',
              color: !isRegistering ? 'var(--c-primary)' : 'var(--c-muted)',
              border: 'none',
              borderBottom: !isRegistering ? '2px solid var(--c-accent)' : 'none',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setError(null); }}
            style={{
              padding: '0.75rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: isRegistering ? 'var(--bg-surface)' : 'transparent',
              color: isRegistering ? 'var(--c-primary)' : 'var(--c-muted)',
              border: 'none',
              borderBottom: isRegistering ? '2px solid var(--c-accent)' : 'none',
              cursor: 'pointer'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#9f1239',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <AlertCircle size={15} flexShrink={0} />
              <span>{error}</span>
            </div>
          )}

          {isRegistering && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.775rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--c-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <div className="search-input-wrap" style={{ maxWidth: '100%' }}>
                <User size={15} color="var(--c-muted)" />
                <input
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.775rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--c-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <div className="search-input-wrap" style={{ maxWidth: '100%' }}>
              <Mail size={15} color="var(--c-muted)" />
              <input
                type="email"
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.775rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--c-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Password
            </label>
            <div className="search-input-wrap" style={{ maxWidth: '100%' }}>
              <Lock size={15} color="var(--c-muted)" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {isRegistering && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.775rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--c-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Interviewer Role
              </label>
              <select
                className="filter-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="INTERVIEWER">Standard Interviewer / Panelist</option>
                <option value="ADMIN">System Administrator / Lead</option>
              </select>
              <div style={{ fontSize: '0.725rem', color: 'var(--c-muted)', marginTop: '0.25rem' }}>
                * The first account created automatically receives Admin privileges.
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.65rem' }}
          >
            <span>{loading ? 'Authenticating...' : (isRegistering ? 'Create Account' : 'Sign In to Workspace')}</span>
            <ArrowRight size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
