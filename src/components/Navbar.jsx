import React from 'react';
import { BookOpen, Bookmark, ShieldCheck, Sun, Moon, LogIn, LogOut, Search, Sparkles } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  isAdminLoggedIn, 
  onLogoutAdmin,
  onOpenAdminModal,
  bookmarksCount
}) {
  return (
    <header className="navbar-header" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--surface-card)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--glass-border)',
      boxShadow: 'var(--glass-shadow)',
      padding: '0.75rem 1.5rem'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('browse')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.03em' }}>
                My Study<span style={{ color: 'var(--accent-primary)' }}> Zone</span>
              </span>
              <span className="badge badge-notes" style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem' }}>PRO</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '-3px' }}>
              Study Material & Notes Portal
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${activeTab === 'browse' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('browse')}
            style={{ fontSize: '0.875rem' }}
          >
            <BookOpen size={16} />
            <span>Browse Notes</span>
          </button>

          <button 
            className={`btn ${activeTab === 'bookmarks' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('bookmarks')}
            style={{ fontSize: '0.875rem', position: 'relative' }}
          >
            <Bookmark size={16} />
            <span>Saved Notes</span>
            {bookmarksCount > 0 && (
              <span style={{
                background: 'var(--accent-rose)',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 700,
                borderRadius: '999px',
                padding: '0.1rem 0.45rem',
                marginLeft: '0.25rem'
              }}>
                {bookmarksCount}
              </span>
            )}
          </button>

          <button 
            className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              if (isAdminLoggedIn) {
                setActiveTab('admin');
              } else {
                onOpenAdminModal();
              }
            }}
            style={{ 
              fontSize: '0.875rem',
              borderColor: isAdminLoggedIn ? 'var(--accent-emerald)' : undefined
            }}
          >
            <ShieldCheck size={16} color={isAdminLoggedIn ? '#10b981' : undefined} />
            <span>{isAdminLoggedIn ? 'Admin Dashboard' : 'Admin Page'}</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="btn-icon"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          </button>

          {/* Admin Quick Status / Action */}
          {isAdminLoggedIn ? (
            <button 
              onClick={onLogoutAdmin}
              className="btn btn-danger"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
              title="Logout from Admin"
            >
              <LogOut size={14} />
              <span>Exit Admin</span>
            </button>
          ) : (
            <button 
              onClick={onOpenAdminModal}
              className="btn btn-outline"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
            >
              <LogIn size={14} />
              <span>Admin Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
