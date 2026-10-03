import React from 'react';
import { Bookmark, FileText, Download, Eye, Trash2, ArrowRight } from 'lucide-react';

export default function BookmarksView({
  materials,
  bookmarks,
  onToggleBookmark,
  onOpenDetailModal,
  onDownloadFile,
  onClearBookmarks
}) {
  const savedMaterials = materials.filter(m => bookmarks.includes(m.id));

  return (
    <div className="animate-fade-in" style={{ marginTop: '1rem' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-light)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            <Bookmark size={26} fill="var(--accent-primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>My Saved Study Materials</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Quick access to your bookmarked notes, formulas, and chapter summaries.
            </p>
          </div>
        </div>

        {savedMaterials.length > 0 && (
          <button
            onClick={onClearBookmarks}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            <Trash2 size={15} color="var(--accent-rose)" />
            <span>Clear All Saved</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {savedMaterials.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Bookmark size={48} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No saved notes yet</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 1.5rem auto', fontSize: '0.925rem' }}>
            Click the bookmark icon on any note card while browsing to save it here for offline reading or quick review.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
          gap: '1.5rem'
        }}>
          {savedMaterials.map(item => (
            <div 
              key={item.id}
              className="glass-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="badge badge-notes">{item.category}</span>
                <button
                  onClick={() => onToggleBookmark(item.id)}
                  className="btn-icon"
                  style={{ padding: '0.35rem', color: 'var(--accent-rose)' }}
                  title="Remove from saved"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.25rem' }}>
                {item.subject}
              </div>

              <h3 
                onClick={() => onOpenDetailModal(item)}
                style={{ fontSize: '1.1rem', cursor: 'pointer', marginBottom: '0.5rem' }}
              >
                {item.title}
              </h3>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1, marginBottom: '1.25rem' }}>
                {item.description}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => onOpenDetailModal(item)}
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '0.825rem' }}
                >
                  <Eye size={14} />
                  <span>Open Notes</span>
                </button>

                <button
                  onClick={() => onDownloadFile(item)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.825rem' }}
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
