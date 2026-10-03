import React, { useState, useEffect } from 'react';
import Auth from './Auth';
import { adminAccessService } from '../services/adminAccessService';
import { 
  UploadCloud, Plus, Trash2, Edit3, ShieldCheck, FileText, 
  Eye, Download, Lock, CheckCircle, AlertCircle, Layers, Sparkles, X, PlusCircle, Save, FolderPlus, UserCheck, ShieldAlert, LogOut
} from 'lucide-react';

export default function AdminPortal({
  materials,
  subjects,
  onAddMaterial,
  onDeleteMaterial,
  onUpdateMaterial,
  onAddSubject,
  onDeleteSubject,
  isAdminLoggedIn,
  onLoginAdmin,
  onLogoutAdmin,
  currentUser,
  onOpenDetailModal
}) {
  // Admin Authorization State
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminEmails, setAdminEmails] = useState([]);
  const [showAdminManagementModal, setShowAdminManagementModal] = useState(false);
  const [newAdminEmailInput, setNewAdminEmailInput] = useState('');

  // Upload Form state
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Check admin authorization when user changes or logs in
  useEffect(() => {
    async function checkAdminStatus() {
      setCheckingAuth(true);
      if (currentUser?.email) {
        const authorized = await adminAccessService.isUserAdmin(currentUser.email);
        setIsAuthorized(authorized);
      } else {
        setIsAuthorized(false);
      }
      const emails = await adminAccessService.getAdminEmails();
      setAdminEmails(emails);
      setCheckingAuth(false);
    }
    checkAdminStatus();
  }, [currentUser, isAdminLoggedIn]);

  const handleGrantAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmailInput.trim()) return;
    const updated = await adminAccessService.grantAdminAccess(newAdminEmailInput.trim());
    setAdminEmails(updated);
    setNewAdminEmailInput('');
  };

  const handleRevokeAdmin = async (emailToRevoke) => {
    if (window.confirm(`Are you sure you want to revoke Admin access for ${emailToRevoke}?`)) {
      const updated = await adminAccessService.revokeAdminAccess(emailToRevoke);
      setAdminEmails(updated);
    }
  };

  // Form Fields (New Material)
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(subjects[0] || 'Computer Science');
  const [category, setCategory] = useState('Lecture Notes');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('Admin Educator');
  const [gradeLevel, setGradeLevel] = useState('Undergraduate');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Subject Manager Modal State
  const [newSubInput, setNewSubInput] = useState('');
  const [showSubModal, setShowSubModal] = useState(false);

  // Flashcards state for New Material
  const [flashcardList, setFlashcardList] = useState([
    { q: '', a: '' }
  ]);

  // Edit Material State
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editGradeLevel, setEditGradeLevel] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTagsInput, setEditTagsInput] = useState('');
  const [editFlashcards, setEditFlashcards] = useState([]);

  // Category Options
  const STANDARD_CATEGORIES = [
    'Lecture Notes',
    'Formula Sheet',
    'Chapter Summary',
    'Question Papers',
    'Video Lesson',
    'Audio Guide',
    'Lab Manual'
  ];

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === 'admin123' || passwordInput.trim() !== '') {
      onLoginAdmin();
      setLoginError('');
    } else {
      setLoginError('Invalid Admin Password. Default is admin123');
    }
  };

  const handleDemoQuickLogin = () => {
    onLoginAdmin();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Flashcards helpers for new material
  const handleAddFlashcardRow = () => {
    setFlashcardList([...flashcardList, { q: '', a: '' }]);
  };

  const handleFlashcardChange = (index, field, value) => {
    const updated = [...flashcardList];
    updated[index][field] = value;
    setFlashcardList(updated);
  };

  const handleRemoveFlashcardRow = (index) => {
    setFlashcardList(flashcardList.filter((_, i) => i !== index));
  };

  // Flashcards helpers for editing material
  const handleAddEditFlashcardRow = () => {
    setEditFlashcards([...editFlashcards, { q: '', a: '' }]);
  };

  const handleEditFlashcardChange = (index, field, value) => {
    const updated = [...editFlashcards];
    updated[index][field] = value;
    setEditFlashcards(updated);
  };

  const handleRemoveEditFlashcardRow = (index) => {
    setEditFlashcards(editFlashcards.filter((_, i) => i !== index));
  };

  const handlePreFillTemplate = (type) => {
    if (type === 'formula') {
      setTitle('Physics & Math Quick Formulas');
      setCategory('Formula Sheet');
      setDescription('Essential math and physics equations for quick revision before exams.');
      setContent(`# Physics & Mathematics Quick Formula Guide\n\n## 1. Kinematics\n- Velocity: $v = u + at$\n- Displacement: $s = ut + \\frac{1}{2}at^2$\n\n## 2. Calculus Derivatives\n- $\\frac{d}{dx}(x^n) = n x^{n-1}$\n- $\\frac{d}{dx}(e^x) = e^x$\n`);
      setTagsInput('Formulas, Exam Prep, Quick Review');
      setFlashcardList([
        { q: 'What is the derivative of e^x?', a: 'e^x' },
        { q: 'State the second equation of motion.', a: 's = ut + (1/2)at^2' }
      ]);
    } else if (type === 'summary') {
      setTitle('Chapter 5 Summary & Important Points');
      setCategory('Chapter Summary');
      setDescription('Key bullet points, theorems, and definitions covered in Chapter 5.');
      setContent(`# Chapter Summary & Key Concepts\n\n## Overview\nThis chapter covers the fundamental principles of data storage, indexing, and query optimization.\n\n## Key Takeaways\n1. Indexing improves lookup time from O(n) to O(log n).\n2. B-Trees are heavily used in modern database systems.\n`);
      setTagsInput('Summary, Chapter 5, Revision');
    }
  };

  const handleSubmitNewMaterial = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Please enter a note title.');

    setIsUploading(true);
    const validFlashcards = flashcardList.filter(f => f.q.trim() && f.a.trim());
    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    await onAddMaterial({
      title,
      subject,
      category,
      description,
      author,
      gradeLevel,
      content,
      tags: tagsArray.length > 0 ? tagsArray : ['Study Guide'],
      flashcards: validFlashcards
    }, selectedFile);

    setIsUploading(false);
    setShowUploadForm(false);
    // Reset form
    setTitle('');
    setDescription('');
    setContent('');
    setSelectedFile(null);
    setTagsInput('');
    setFlashcardList([{ q: '', a: '' }]);
  };

  const handleCreateSubject = (e) => {
    e.preventDefault();
    if (newSubInput.trim()) {
      onAddSubject(newSubInput.trim());
      setSubject(newSubInput.trim());
      setNewSubInput('');
    }
  };

  // Open Edit Modal for a Material
  const handleStartEdit = (item) => {
    setEditingMaterial(item);
    setEditTitle(item.title || '');
    setEditSubject(item.subject || subjects[0] || 'General');
    setEditCategory(item.category || 'Lecture Notes');
    setEditDescription(item.description || '');
    setEditAuthor(item.author || '');
    setEditGradeLevel(item.gradeLevel || '');
    setEditContent(item.content || '');
    setEditTagsInput(item.tags ? item.tags.join(', ') : '');
    setEditFlashcards(item.flashcards && item.flashcards.length > 0 ? item.flashcards : [{ q: '', a: '' }]);
  };

  // Save Edit Changes
  const handleSaveEditSubmit = (e) => {
    e.preventDefault();
    if (!editingMaterial) return;
    if (!editTitle.trim()) return alert('Please enter a note title.');

    const validFlashcards = editFlashcards.filter(f => f.q.trim() && f.a.trim());
    const tagsArray = editTagsInput.split(',').map(t => t.trim()).filter(Boolean);

    onUpdateMaterial(editingMaterial.id, {
      title: editTitle,
      subject: editSubject,
      category: editCategory,
      description: editDescription,
      author: editAuthor,
      gradeLevel: editGradeLevel,
      content: editContent,
      tags: tagsArray.length > 0 ? tagsArray : ['Study Guide'],
      flashcards: validFlashcards
    });

    setEditingMaterial(null);
  };

  // IF NOT LOGGED IN -> SHOW AUTH
  if (!isAdminLoggedIn || !currentUser) {
    return <Auth onLoginSuccess={onLoginAdmin} />;
  }

  // IF STILL CHECKING PERMISSIONS
  if (checkingAuth) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Verifying admin permissions...</p>
      </div>
    );
  }

  // IF LOGGED IN BUT NOT GRANTED ADMIN ACCESS
  if (!isAuthorized) {
    return (
      <div style={{ maxWidth: '520px', margin: '3rem auto' }}>
        <div className="glass-card animate-fade-in" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(244, 63, 94, 0.1)',
            color: 'var(--accent-rose)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            border: '1px solid rgba(244, 63, 94, 0.3)'
          }}>
            <ShieldAlert size={30} />
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--accent-rose)' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Logged in as <strong>{currentUser.email}</strong>
          </p>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.75rem',
            border: '1px solid var(--glass-border)',
            textAlign: 'left'
          }}>
            This account has not been granted Admin access. An existing administrator must grant access to <strong>{currentUser.email}</strong> through the Admin Users Management panel.
          </div>

          <button onClick={onLogoutAdmin} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            <LogOut size={16} />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    );
  }

  // ADMIN IS LOGGED IN & AUTHORIZED -> DASHBOARD
  return (
    <div className="animate-fade-in" style={{ marginTop: '1rem' }}>
      
      {/* Top Banner Stats */}
      <div className="glass-card" style={{
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-brand)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Admin Control Center</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Logged in as <strong>{currentUser?.email}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowAdminManagementModal(true)}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            <UserCheck size={16} color="var(--accent-amber)" />
            <span>Grant Admin Access ({adminEmails.length})</span>
          </button>

          <button
            onClick={() => setShowSubModal(true)}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            <FolderPlus size={16} />
            <span>Manage Subjects ({subjects.length})</span>
          </button>

          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            {showUploadForm ? <X size={16} /> : <Plus size={16} />}
            <span>{showUploadForm ? 'Close Creator' : 'Upload / Create Notes'}</span>
          </button>
        </div>
      </div>

      {/* MODAL / OVERLAY TO MANAGE ADMIN USERS (ROLE-BASED ACCESS) */}
      {showAdminManagementModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '540px', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={22} color="var(--accent-amber)" />
                <span>Admin User Access Manager</span>
              </h3>
              <button onClick={() => setShowAdminManagementModal(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Only accounts listed below have permission to view and edit the Admin Portal.
            </p>

            {/* List of Authorized Admins */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Authorized Admin Accounts ({adminEmails.length})</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', padding: '0.5rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                {adminEmails.map(email => (
                  <div key={email} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-tertiary)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <UserCheck size={14} color="var(--accent-emerald)" />
                      <span>{email}</span>
                      {currentUser?.email?.toLowerCase() === email.toLowerCase() && (
                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--accent-light)', color: 'var(--accent-primary)' }}>You</span>
                      )}
                    </div>
                    {adminEmails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRevokeAdmin(email)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--accent-rose)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          fontSize: '0.75rem'
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Revoke</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form to Grant Admin Access */}
            <form onSubmit={handleGrantAdmin} style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Grant Admin Access to Account Email</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="colleague@gmail.com"
                    value={newAdminEmailInput}
                    onChange={(e) => setNewAdminEmailInput(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                    <Plus size={16} />
                    <span>Grant Access</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAdminManagementModal(false)} className="btn btn-secondary">
                  Done
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL / OVERLAY TO MANAGE & DELETE SUBJECTS */}
      {showSubModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '520px', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FolderPlus size={20} color="var(--accent-primary)" />
                <span>Subject Manager</span>
              </h3>
              <button onClick={() => setShowSubModal(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            {/* List of Existing Subjects with Delete Buttons */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Active Subjects ({subjects.length})</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', padding: '0.5rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                {subjects.map(s => (
                  <div key={s} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'var(--bg-tertiary)',
                    padding: '0.3rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteSubject(s)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-rose)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 2px'
                      }}
                      title={`Delete subject "${s}"`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Form to Add New Subject */}
            <form onSubmit={handleCreateSubject} style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Add New Subject</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Artificial Intelligence, Microeconomics"
                    value={newSubInput}
                    onChange={(e) => setNewSubInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                    <Plus size={16} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowSubModal(false)} className="btn btn-secondary">
                  Done
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDY MATERIAL & CATEGORY MODAL */}
      {editingMaterial && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          overflowY: 'auto'
        }}>
          <div className="glass-card animate-fade-in" style={{
            padding: '2rem',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'var(--bg-secondary)',
            borderColor: 'var(--accent-primary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={22} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.25rem' }}>Edit Material & Category</h3>
              </div>
              <button onClick={() => setEditingMaterial(null)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                
                {/* Title */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Note Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Subject */}
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-select" value={editSubject} onChange={(e) => setEditSubject(e.target.value)}>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Category Selection / Edit */}
                <div className="form-group">
                  <label className="form-label">Category (Media / Note Type)</label>
                  <select className="form-select" value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                    {STANDARD_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {!STANDARD_CATEGORIES.includes(editCategory) && editCategory && (
                      <option value={editCategory}>{editCategory} (Custom)</option>
                    )}
                  </select>
                </div>

                {/* Author */}
                <div className="form-group">
                  <label className="form-label">Author / Educator</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                  />
                </div>

                {/* Target Grade Level */}
                <div className="form-group">
                  <label className="form-label">Target Level / Grade</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editGradeLevel}
                    onChange={(e) => setEditGradeLevel(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Short Description</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>

                {/* Detailed Content */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Markdown / Text Content</label>
                  <textarea
                    className="form-textarea"
                    rows={5}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                </div>

                {/* Search Tags */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Search Tags (Comma Separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editTagsInput}
                    onChange={(e) => setEditTagsInput(e.target.value)}
                  />
                </div>

                {/* Interactive Flashcards */}
                <div className="form-group" style={{ gridColumn: '1 / -1', background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Sparkles size={16} color="var(--accent-amber)" />
                      <span>Revision Flashcards ({editFlashcards.length})</span>
                    </label>
                    <button type="button" onClick={handleAddEditFlashcardRow} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                      + Add Card
                    </button>
                  </div>

                  {editFlashcards.map((fc, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`Question #${index + 1}`}
                        value={fc.q}
                        onChange={(e) => handleEditFlashcardChange(index, 'q', e.target.value)}
                        style={{ flex: 1, fontSize: '0.85rem' }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Answer"
                        value={fc.a}
                        onChange={(e) => handleEditFlashcardChange(index, 'a', e.target.value)}
                        style={{ flex: 1, fontSize: '0.85rem' }}
                      />
                      <button type="button" onClick={() => handleRemoveEditFlashcardRow(index)} className="btn-icon" style={{ color: 'var(--accent-rose)' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

              </div>

              {/* Edit Form Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setEditingMaterial(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD & RICH NOTE CREATOR FORM */}
      {showUploadForm && (
        <div className="glass-card animate-fade-in" style={{ padding: '2rem', marginBottom: '2.5rem', borderColor: 'var(--accent-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UploadCloud size={22} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.25rem' }}>Upload Study Material & Create Notes</h3>
            </div>

            {/* Quick Templates */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Auto-fill Template:</span>
              <button onClick={() => handlePreFillTemplate('formula')} type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                Formula Sheet
              </button>
              <button onClick={() => handlePreFillTemplate('summary')} type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                Summary
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmitNewMaterial}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              
              {/* Title */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Note / Material Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Chapter 4: Thermodynamics & Heat Transfer Summary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Subject */}
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select className="form-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Material Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {STANDARD_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Author / Teacher */}
              <div className="form-group">
                <label className="form-label">Teacher / Author Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Prof. H.C. Verma"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              {/* Grade Level */}
              <div className="form-group">
                <label className="form-label">Target Grade / Level</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. High School / JEE / College"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                />
              </div>

              {/* File Attachment Dropzone */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Upload PDF / Document File (Optional)</label>
                <div style={{
                  border: '2px dashed var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: 'var(--bg-primary)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="admin-file-input"
                  />
                  <label htmlFor="admin-file-input" style={{ cursor: 'pointer', display: 'block' }}>
                    <UploadCloud size={36} color="var(--accent-primary)" style={{ marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {selectedFile ? `Selected: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)` : 'Click to Browse File (PDF, DOCX, Images)'}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      Students will be able to download this file directly from the main website.
                    </div>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Short Description</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Brief overview of what students will learn from this study material..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Rich Content / Markdown */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Detailed Notes / Text Content (Supports Markdown & Equations)</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  placeholder="Type or paste full study notes, key formulas, code snippets, or definitions here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              {/* Tags */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Search Tags (Comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Physics, Thermodynamics, Formulas, Exam2026"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>

              {/* Interactive Flashcards Creator */}
              <div className="form-group" style={{ gridColumn: '1 / -1', background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={16} color="var(--accent-amber)" />
                    <span>Interactive Revision Flashcards (Optional)</span>
                  </label>
                  <button type="button" onClick={handleAddFlashcardRow} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                    + Add Question
                  </button>
                </div>

                {flashcardList.map((fc, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={`Question #${index + 1}`}
                      value={fc.q}
                      onChange={(e) => handleFlashcardChange(index, 'q', e.target.value)}
                      style={{ flex: 1, fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Answer / Solution"
                      value={fc.a}
                      onChange={(e) => handleFlashcardChange(index, 'a', e.target.value)}
                      style={{ flex: 1, fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
                    />
                    {flashcardList.length > 1 && (
                      <button type="button" onClick={() => handleRemoveFlashcardRow(index)} className="btn-icon" style={{ color: 'var(--accent-rose)' }}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

            </div>

            {/* Submit Actions */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
              <button type="button" onClick={() => setShowUploadForm(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isUploading}>
                <CheckCircle size={18} />
                <span>{isUploading ? 'Publishing...' : 'Publish Study Material'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MANAGE MATERIALS TABLE */}
      <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Uploaded Study Materials ({materials.length})</h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Title & Subject</th>
              <th style={{ padding: '0.75rem 1rem' }}>Category</th>
              <th style={{ padding: '0.75rem 1rem' }}>Author</th>
              <th style={{ padding: '0.75rem 1rem' }}>Views / Downloads</th>
              <th style={{ padding: '0.75rem 1rem' }}>Date Added</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                
                {/* Title & Subject */}
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>{item.subject} • {item.fileName}</div>
                </td>

                {/* Category */}
                <td style={{ padding: '1rem' }}>
                  <span className="badge badge-notes">{item.category}</span>
                </td>

                {/* Author */}
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                  {item.author}
                </td>

                {/* Views & Downloads */}
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                  <div>{item.viewsCount || 0} views</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>{item.downloadsCount || 0} downloads</div>
                </td>

                {/* Date */}
                <td style={{ padding: '1rem', color: 'var(--text-subtle)' }}>
                  {item.dateAdded}
                </td>

                {/* Actions */}
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => onOpenDetailModal(item)}
                      className="btn-icon"
                      title="Preview Note"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => handleStartEdit(item)}
                      className="btn-icon"
                      style={{ color: 'var(--accent-primary)' }}
                      title="Edit Material & Category"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      onClick={() => onDeleteMaterial(item.id)}
                      className="btn-icon"
                      style={{ color: 'var(--accent-rose)' }}
                      title="Delete Material"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
