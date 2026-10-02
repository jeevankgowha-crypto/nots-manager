import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, Download, Bookmark, Eye, Calendar, User, FileText, 
  Sparkles, CheckCircle2, Copy, BookOpen, Layers, HelpCircle, Share2, ZoomIn, ZoomOut, Play, ChevronLeft, ChevronRight, RotateCw
} from 'lucide-react';

export default function NoteDetailModal({ 
  material, 
  onClose, 
  isBookmarked, 
  onToggleBookmark, 
  onDownloadFile 
}) {
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'flashcards'
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [flippedCards, setFlippedCards] = useState({});

  // Practice Mode State
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCurrentCardFlipped, setIsCurrentCardFlipped] = useState(false);

  // Keyboard navigation for Practice Mode
  const handleKeyDown = useCallback((e) => {
    if (!isPracticeMode) return;
    
    if (e.key === 'Escape') {
      setIsPracticeMode(false);
    } else if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault(); // Prevent page scroll on Space
      if (!isCurrentCardFlipped) {
        setIsCurrentCardFlipped(true); // Flip first if not flipped
      } else {
        // Go to next card if already flipped
        if (currentCardIndex < material.flashcards.length - 1) {
          setCurrentCardIndex(prev => prev + 1);
          setIsCurrentCardFlipped(false);
        }
      }
    } else if (e.key === 'ArrowLeft') {
      if (currentCardIndex > 0) {
        setCurrentCardIndex(prev => prev - 1);
        setIsCurrentCardFlipped(false);
      }
    } else if (e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
       e.preventDefault();
       setIsCurrentCardFlipped(prev => !prev);
    }
  }, [isPracticeMode, currentCardIndex, isCurrentCardFlipped, material]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!material) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCardFlip = (index) => {
    setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const startPracticeMode = () => {
    setCurrentCardIndex(0);
    setIsCurrentCardFlipped(false);
    setIsPracticeMode(true);
  };

  const nextCard = () => {
    if (currentCardIndex < material.flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsCurrentCardFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsCurrentCardFlipped(false);
    }
  };

  return (
    <>
      {/* MAIN DETAIL MODAL */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        background: 'rgba(5, 8, 16, 0.82)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        visibility: isPracticeMode ? 'hidden' : 'visible' // Hide when in practice mode
      }}>
        <div 
          className="glass-card animate-fade-in"
          style={{
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          
          {/* Modal Header */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            background: 'var(--surface-card)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-notes">{material.subject}</span>
                <span className="badge badge-formula">{material.category}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>• Added on {material.dateAdded}</span>
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.3 }}>
                {material.title}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="btn-icon"
              style={{ borderRadius: 'var(--radius-full)', padding: '0.5rem' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Secondary Navigation Bar */}
          <div style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setActiveTab('notes')}
                className={`btn ${activeTab === 'notes' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.825rem', padding: '0.4rem 0.9rem' }}
              >
                <BookOpen size={15} />
                <span>Full Notes</span>
              </button>

              {material.flashcards && material.flashcards.length > 0 && (
                <button
                  onClick={() => setActiveTab('flashcards')}
                  className={`btn ${activeTab === 'flashcards' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.825rem', padding: '0.4rem 0.9rem' }}
                >
                  <Sparkles size={15} />
                  <span>Study Flashcards ({material.flashcards.length})</span>
                </button>
              )}
            </div>

            {/* Right Action Tools */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {activeTab === 'notes' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginRight: '0.5rem' }}>
                  <button 
                    onClick={() => setFontSize(prev => Math.max(prev - 2, 12))}
                    className="btn-icon"
                    style={{ padding: '0.25rem' }}
                    title="Decrease Font Size"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '2.5rem', textAlign: 'center' }}>
                    {fontSize}px
                  </span>
                  <button 
                    onClick={() => setFontSize(prev => Math.min(prev + 2, 24))}
                    className="btn-icon"
                    style={{ padding: '0.25rem' }}
                    title="Increase Font Size"
                  >
                    <ZoomIn size={14} />
                  </button>
                </div>
              )}

              <button
                onClick={() => onToggleBookmark(material.id)}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
              >
                <Bookmark size={14} fill={isBookmarked ? 'var(--accent-primary)' : 'none'} />
                <span>{isBookmarked ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
              >
                {copied ? <CheckCircle2 size={14} color="#10b981" /> : <Share2 size={14} />}
                <span>{copied ? 'Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={() => onDownloadFile(material)}
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
              >
                <Download size={14} />
                <span>Download ({material.fileSize})</span>
              </button>
            </div>
          </div>

          {/* Modal Body Scroll Area */}
          <div style={{
            padding: '1.75rem',
            overflowY: 'auto',
            flex: 1,
            fontSize: `${fontSize}px`,
            lineHeight: 1.7,
            color: 'var(--text-main)'
          }}>

            {/* Download File Notification Box */}
            <div style={{
              background: 'var(--accent-light)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={24} color="var(--accent-primary)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{material.fileName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Uploaded by {material.author} • {material.downloadsCount} total downloads
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDownloadFile(material)}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                <Download size={15} />
                <span>Get Download File</span>
              </button>
            </div>

            {/* TAB 1: NOTES CONTENT */}
            {activeTab === 'notes' && (
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                  Description
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  {material.description}
                </p>

                <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '1.5rem 0' }} />

                <div className="note-body-content" style={{ fontFamily: 'inherit' }}>
                  {material.content}
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE FLASHCARDS */}
            {activeTab === 'flashcards' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>Interactive Key Concept Flashcards</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Click on any card to flip and reveal the answer.</p>
                  </div>
                  
                  <button 
                    onClick={startPracticeMode}
                    className="btn btn-primary" 
                    style={{ fontSize: '0.95rem', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)' }}
                  >
                    <Play size={16} fill="currentColor" />
                    <span>Start Practice Mode</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {material.flashcards.map((card, idx) => {
                    const isFlipped = flippedCards[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleCardFlip(idx)}
                        className="glass-card"
                        style={{
                          padding: '1.5rem',
                          minHeight: '160px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          textAlign: 'center',
                          cursor: 'pointer',
                          background: isFlipped ? 'var(--accent-light)' : 'var(--surface-card)',
                          borderColor: isFlipped ? 'var(--accent-primary)' : 'var(--glass-border)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                          {isFlipped ? 'ANSWER' : `QUESTION #${idx + 1}`}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.975rem', color: isFlipped ? 'var(--text-main)' : 'var(--text-main)' }}>
                          {isFlipped ? card.a : card.q}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '0.75rem' }}>
                          (Click to {isFlipped ? 'see question' : 'reveal answer'})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* FULL SCREEN PRACTICE MODE OVERLAY */}
      {isPracticeMode && material.flashcards && material.flashcards.length > 0 && (
        <div className="animate-fade-in" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2000,
          background: 'var(--bg-primary)', // Solid background to minimize distractions
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Practice Mode Header */}
          <div style={{
            padding: '1.25rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--glass-border)',
            background: 'var(--surface-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                onClick={() => setIsPracticeMode(false)}
                className="btn-icon"
                title="Exit Practice Mode (Esc)"
              >
                <X size={20} />
              </button>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Practice Mode</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{material.title}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Question {currentCardIndex + 1} of {material.flashcards.length}
               </div>
               {/* Progress Bar */}
               <div style={{ width: '150px', height: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                 <div style={{ 
                   height: '100%', 
                   background: 'var(--gradient-brand)', 
                   width: `${((currentCardIndex + 1) / material.flashcards.length) * 100}%`,
                   transition: 'width 0.3s ease'
                 }} />
               </div>
            </div>
          </div>

          {/* Practice Mode Content */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative'
          }}>
            {/* The Flashcard */}
            <div 
              className="glass-card"
              onClick={() => setIsCurrentCardFlipped(prev => !prev)}
              style={{
                width: '100%',
                maxWidth: '700px',
                minHeight: '400px',
                padding: '3rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                background: isCurrentCardFlipped ? 'var(--accent-light)' : 'var(--surface-card)',
                borderColor: isCurrentCardFlipped ? 'var(--accent-primary)' : 'var(--glass-border)',
                transition: 'all 0.3s ease',
                boxShadow: isCurrentCardFlipped ? '0 10px 40px rgba(99, 102, 241, 0.2)' : 'var(--glass-shadow)',
                transform: isCurrentCardFlipped ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <div style={{ 
                fontSize: '1rem', 
                fontWeight: 700, 
                color: isCurrentCardFlipped ? 'var(--accent-primary)' : 'var(--accent-cyan)', 
                marginBottom: '1.5rem',
                letterSpacing: '0.1em'
              }}>
                {isCurrentCardFlipped ? 'ANSWER' : 'QUESTION'}
              </div>
              <div style={{ 
                fontWeight: 600, 
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', 
                color: 'var(--text-main)',
                lineHeight: 1.4
              }}>
                {isCurrentCardFlipped 
                  ? material.flashcards[currentCardIndex].a 
                  : material.flashcards[currentCardIndex].q
                }
              </div>
              
              <div style={{ 
                marginTop: '3rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: 'var(--text-subtle)', 
                fontSize: '0.9rem' 
              }}>
                <RotateCw size={16} />
                <span>Click or press <kbd style={{ background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>Space</kbd> / <kbd style={{ background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>Enter</kbd> to flip</span>
              </div>
            </div>

            {/* Navigation Controls Overlay */}
            <button 
               onClick={prevCard}
               disabled={currentCardIndex === 0}
               className="btn-icon"
               style={{
                 position: 'absolute',
                 left: '2rem',
                 top: '50%',
                 transform: 'translateY(-50%)',
                 padding: '1rem',
                 borderRadius: '50%',
                 opacity: currentCardIndex === 0 ? 0.3 : 1,
                 cursor: currentCardIndex === 0 ? 'not-allowed' : 'pointer'
               }}
               title="Previous Card (Left Arrow)"
            >
              <ChevronLeft size={32} />
            </button>

            <button 
               onClick={() => {
                 if (!isCurrentCardFlipped) {
                   setIsCurrentCardFlipped(true);
                 } else {
                   nextCard();
                 }
               }}
               disabled={currentCardIndex === material.flashcards.length - 1 && isCurrentCardFlipped}
               className="btn-icon"
               style={{
                 position: 'absolute',
                 right: '2rem',
                 top: '50%',
                 transform: 'translateY(-50%)',
                 padding: '1rem',
                 borderRadius: '50%',
                 opacity: (currentCardIndex === material.flashcards.length - 1 && isCurrentCardFlipped) ? 0.3 : 1,
                 cursor: (currentCardIndex === material.flashcards.length - 1 && isCurrentCardFlipped) ? 'not-allowed' : 'pointer'
               }}
               title={!isCurrentCardFlipped ? "Reveal Answer (Right Arrow / Space)" : "Next Card (Right Arrow / Space)"}
            >
              <ChevronRight size={32} />
            </button>
          </div>

          {/* Practice Mode Footer */}
          <div style={{
            padding: '1.5rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            borderTop: '1px solid var(--glass-border)'
          }}>
            Keyboard shortcuts: 
            <span style={{ margin: '0 0.5rem' }}><kbd>Space</kbd> Flip / Next</span> • 
            <span style={{ margin: '0 0.5rem' }}><kbd>←</kbd> Previous</span> • 
            <span style={{ margin: '0 0.5rem' }}><kbd>→</kbd> Next</span> • 
            <span style={{ margin: '0 0.5rem' }}><kbd>Esc</kbd> Exit</span>
          </div>
        </div>
      )}
    </>
  );
}
