import React, { useState } from 'react';
import { 
  FileText, Download, Eye, Bookmark, Tag, User, 
  Calendar, ArrowRight, Grid, List, Filter, Sparkles, Check
} from 'lucide-react';

export default function StudentPortal({
  materials,
  searchQuery,
  selectedSubject,
  bookmarks,
  onToggleBookmark,
  onOpenDetailModal,
  onDownloadFile
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Filtering & Sorting Logic
  const filtered = materials.filter(item => {
    if (!item.isPublished) return false;
    
    // Subject filter
    if (selectedSubject !== 'All' && item.subject !== selectedSubject) return false;
    
    // Category filter
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubject = item.subject.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchAuthor = item.author.toLowerCase().includes(q);
      const matchTags = item.tags && item.tags.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchSubject || matchDesc || matchAuthor || matchTags;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.dateAdded) - new Date(a.dateAdded);
    if (sortBy === 'popular') return (b.viewsCount || 0) - (a.viewsCount || 0);
    if (sortBy === 'downloads') return (b.downloadsCount || 0) - (a.downloadsCount || 0);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  const getBadgeClass = (category) => {
    switch (category) {
      case 'Formula Sheet': return 'badge-formula';
      case 'Lecture Notes': return 'badge-notes';
      case 'Question Papers': return 'badge-qp';
      case 'Chapter Summary': return 'badge-summary';
      default: return 'badge-pdf';
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      
      {/* Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        background: 'var(--surface-card)',
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--glass-border)'
      }}>
        
        {/* Left Filter Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Filter size={16} />
            <span>Filter:</span>
          </div>

          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'auto' }}
          >
            <option value="All">All Categories</option>
            <option value="Lecture Notes">Lecture Notes</option>
            <option value="Formula Sheet">Formula Sheets</option>
            <option value="Chapter Summary">Chapter Summaries</option>
            <option value="Question Papers">Question Papers</option>
          </select>

          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'auto' }}
          >
            <option value="recent">Sort by Most Recent</option>
            <option value="popular">Sort by Most Viewed</option>
            <option value="downloads">Sort by Downloads</option>
            <option value="title">Sort Alphabetically</option>
          </select>
        </div>

        {/* Right Info & View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filtered.length}</strong> study materials
          </span>

          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-primary)', padding: '0.2rem', borderRadius: 'var(--radius-sm)' }}>
            <button
              onClick={() => setViewMode('grid')}
              className="btn-icon"
              style={{
                padding: '0.35rem',
                background: viewMode === 'grid' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'grid' ? '#ffffff' : 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)'
              }}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="btn-icon"
              style={{
                padding: '0.35rem',
                background: viewMode === 'list' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'list' ? '#ffffff' : 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)'
              }}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', marginTop: '2rem' }}>
          <FileText size={48} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No study materials found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 1.5rem auto', fontSize: '0.925rem' }}>
            We couldn't find any study guides matching your selected filters or search terms. Try clearing search filters or changing categories.
          </p>
          <button 
            onClick={() => { setSelectedCategory('All'); }} 
            className="btn btn-primary"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {filtered.map(item => {
            const isBookmarked = bookmarks.includes(item.id);
            return (
              <div 
                key={item.id} 
                className="glass-card animate-fade-in"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.5rem',
                  position: 'relative',
                  height: '100%'
                }}
              >
                {/* Header Badge & Bookmark */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span className={`badge ${getBadgeClass(item.category)}`}>
                    {item.category}
                  </span>
                  
                  <button
                    onClick={() => onToggleBookmark(item.id)}
                    className="btn-icon"
                    style={{
                      padding: '0.35rem',
                      background: isBookmarked ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                      color: isBookmarked ? 'var(--accent-primary)' : 'var(--text-muted)',
                      borderColor: isBookmarked ? 'var(--accent-primary)' : undefined
                    }}
                    title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Note'}
                  >
                    <Bookmark size={16} fill={isBookmarked ? 'var(--accent-primary)' : 'none'} />
                  </button>
                </div>

                {/* Subject Label */}
                <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                  {item.subject} • {item.gradeLevel}
                </div>

                {/* Title */}
                <h3 
                  onClick={() => onOpenDetailModal(item)}
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    lineHeight: 1.35,
                    marginBottom: '0.75rem',
                    cursor: 'pointer',
                    color: 'var(--text-main)'
                  }}
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  marginBottom: '1.25rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  flex: 1
                }}>
                  {item.description}
                </p>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                    {item.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} style={{
                        fontSize: '0.725rem',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-muted)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--glass-border)'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Footer Info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--glass-border)',
                  fontSize: '0.775rem',
                  color: 'var(--text-subtle)',
                  marginTop: 'auto'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Eye size={13} />
                      {item.viewsCount}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Download size={13} />
                      {item.downloadsCount}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.725rem' }}>{item.fileSize}</span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => onOpenDetailModal(item)}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.825rem', padding: '0.5rem' }}
                  >
                    <Eye size={14} />
                    <span>Read Notes</span>
                  </button>

                  <button
                    onClick={() => onDownloadFile(item)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.825rem', padding: '0.5rem 0.85rem' }}
                    title="Download File"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(item => {
            const isBookmarked = bookmarks.includes(item.id);
            return (
              <div
                key={item.id}
                className="glass-card animate-fade-in"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.5rem',
                  padding: '1.25rem 1.5rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span className={`badge ${getBadgeClass(item.category)}`}>
                      {item.category}
                    </span>
                    <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {item.subject}
                    </span>
                  </div>

                  <h3 
                    onClick={() => onOpenDetailModal(item)}
                    style={{ fontSize: '1.1rem', cursor: 'pointer', marginBottom: '0.35rem' }}
                  >
                    {item.title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div>{item.author}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>{item.fileSize} • {item.viewsCount} views</div>
                  </div>

                  <button
                    onClick={() => onToggleBookmark(item.id)}
                    className="btn-icon"
                    style={{
                      background: isBookmarked ? 'var(--accent-light)' : undefined,
                      color: isBookmarked ? 'var(--accent-primary)' : undefined
                    }}
                  >
                    <Bookmark size={16} fill={isBookmarked ? 'var(--accent-primary)' : 'none'} />
                  </button>

                  <button
                    onClick={() => onOpenDetailModal(item)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.825rem' }}
                  >
                    <Eye size={14} />
                    <span>View</span>
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
            );
          })}
        </div>
      )}

    </div>
  );
}
