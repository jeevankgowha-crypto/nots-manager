import React from 'react';
import { Search, Sparkles, FileText, Download, GraduationCap, BookOpen, Layers } from 'lucide-react';

export default function HeroSection({ 
  searchQuery, 
  setSearchQuery, 
  selectedSubject, 
  setSelectedSubject,
  subjects,
  totalMaterialsCount,
  totalDownloadsCount
}) {
  return (
    <section className="glass-card animate-fade-in" style={{
      position: 'relative',
      padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)',
      marginBottom: '2rem',
      overflow: 'hidden',
      textAlign: 'center',
      borderColor: 'rgba(99, 102, 241, 0.2)'
    }}>
      <div className="hero-glow" />
      
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.25rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '1.5rem'
        }}>
          Ace Your Exams with <span style={{
            background: 'var(--gradient-brand)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Verified Notes</span> & Resources
        </h1>

        {/* Live Search Bar */}
        <div style={{
          position: 'relative',
          maxWidth: '620px',
          margin: '0 auto 1.75rem auto'
        }}>
          <Search style={{
            position: 'absolute',
            left: '1.25rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-subtle)'
          }} size={20} />
          
          <input 
            type="text"
            className="form-input"
            placeholder="Search notes by subject, title, chapter, or tags (e.g. 'Calculus', 'DSA', 'Physics')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: '3.25rem',
              paddingRight: searchQuery ? '3rem' : '1.25rem',
              paddingTop: '1rem',
              paddingBottom: '1rem',
              fontSize: '1rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '1.25rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Subject Category Chips */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setSelectedSubject('All')}
            className={`btn ${selectedSubject === 'All' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '0.4rem 1rem',
              fontSize: '0.825rem'
            }}
          >
            All Subjects
          </button>
          {subjects.map(subj => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`btn ${selectedSubject === subj ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.4rem 1rem',
                fontSize: '0.825rem'
              }}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(1rem, 3vw, 2.5rem)',
          marginTop: '2rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--glass-border)',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={22} color="var(--accent-primary)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{totalMaterialsCount}</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Available Notes</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Layers size={22} color="var(--accent-cyan)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{subjects.length}</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Active Subjects</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Download size={22} color="var(--accent-emerald)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{totalDownloadsCount}+</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Student Downloads</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
