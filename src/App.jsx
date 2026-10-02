import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import StudentPortal from './components/StudentPortal';
import BookmarksView from './components/BookmarksView';
import AdminPortal from './components/AdminPortal';
import NoteDetailModal from './components/NoteDetailModal';
import { storageService } from './services/storageService';
import { ShieldCheck, Heart, Sparkles, Server } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'bookmarks' | 'admin'
  
  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('eduhub_theme') || 'dark';
  });

  // Data State
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('eduhub_admin_auth') === 'true';
  });

  // Modal State
  const [selectedMaterialModal, setSelectedMaterialModal] = useState(null);

  // Load initial data
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('eduhub_theme', theme);
  }, [theme]);

  useEffect(() => {
    const loadedMaterials = storageService.getMaterials();
    const loadedSubjects = storageService.getSubjects();
    const loadedBookmarks = storageService.getBookmarks();
    
    setMaterials(loadedMaterials);
    setSubjects(loadedSubjects);
    setBookmarks(loadedBookmarks);
  }, []);

  // Handlers
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    sessionStorage.setItem('eduhub_admin_auth', 'true');
    setActiveTab('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('eduhub_admin_auth');
    setActiveTab('browse');
  };

  const handleToggleBookmark = (id) => {
    const updated = storageService.toggleBookmark(id);
    setBookmarks([...updated]);
  };

  const handleClearBookmarks = () => {
    localStorage.setItem('eduhub_bookmarks', JSON.stringify([]));
    setBookmarks([]);
  };

  const handleOpenDetailModal = (material) => {
    storageService.incrementView(material.id);
    setMaterials(storageService.getMaterials());
    setSelectedMaterialModal(material);
  };

  const handleDownloadFile = async (material) => {
    await storageService.downloadMaterialFile(material);
    setMaterials(storageService.getMaterials());
  };

  const handleAddMaterial = async (materialData, binaryFile) => {
    const newMaterial = await storageService.addMaterial(materialData, binaryFile);
    setMaterials(storageService.getMaterials());
    return newMaterial;
  };

  const handleDeleteMaterial = async (id) => {
    if (window.confirm('Are you sure you want to delete this study material?')) {
      await storageService.deleteMaterial(id);
      setMaterials(storageService.getMaterials());
    }
  };

  const handleAddSubject = (newSubject) => {
    const updated = storageService.addSubject(newSubject);
    setSubjects([...updated]);
  };

  const handleDeleteSubject = (subjectToDelete) => {
    if (window.confirm(`Are you sure you want to delete the subject "${subjectToDelete}"?`)) {
      const updated = storageService.deleteSubject(subjectToDelete);
      setSubjects([...updated]);
      if (selectedSubject === subjectToDelete) {
        setSelectedSubject('All');
      }
    }
  };

  const handleUpdateMaterial = (id, updatedData) => {
    const updatedList = storageService.updateMaterial(id, updatedData);
    setMaterials([...updatedList]);
    if (selectedMaterialModal && selectedMaterialModal.id === id) {
      setSelectedMaterialModal(prev => ({ ...prev, ...updatedData }));
    }
  };

  const totalDownloads = materials.reduce((acc, curr) => acc + (curr.downloadsCount || 0), 0);

  return (
    <div className="app-container">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogoutAdmin={handleAdminLogout}
        onOpenAdminModal={() => setActiveTab('admin')}
        bookmarksCount={bookmarks.length}
      />

      {/* Main Content Body */}
      <main className="main-content">
        
        {/* STUDENT PORTAL TAB */}
        {activeTab === 'browse' && (
          <>
            <HeroSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              subjects={subjects}
              totalMaterialsCount={materials.length}
              totalDownloadsCount={totalDownloads}
            />

            <StudentPortal
              materials={materials}
              searchQuery={searchQuery}
              selectedSubject={selectedSubject}
              bookmarks={bookmarks}
              onToggleBookmark={handleToggleBookmark}
              onOpenDetailModal={handleOpenDetailModal}
              onDownloadFile={handleDownloadFile}
            />
          </>
        )}

        {/* BOOKMARKS TAB */}
        {activeTab === 'bookmarks' && (
          <BookmarksView
            materials={materials}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onOpenDetailModal={handleOpenDetailModal}
            onDownloadFile={handleDownloadFile}
            onClearBookmarks={handleClearBookmarks}
          />
        )}

        {/* ADMIN PORTAL TAB */}
        {activeTab === 'admin' && (
          <AdminPortal
            materials={materials}
            subjects={subjects}
            onAddMaterial={handleAddMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            onUpdateMaterial={handleUpdateMaterial}
            onAddSubject={handleAddSubject}
            onDeleteSubject={handleDeleteSubject}
            isAdminLoggedIn={isAdminLoggedIn}
            onLoginAdmin={handleAdminLogin}
            onOpenDetailModal={handleOpenDetailModal}
          />
        )}

      </main>

      {/* Material Detail Reader Modal */}
      {selectedMaterialModal && (
        <NoteDetailModal
          material={selectedMaterialModal}
          onClose={() => setSelectedMaterialModal(null)}
          isBookmarked={bookmarks.includes(selectedMaterialModal.id)}
          onToggleBookmark={handleToggleBookmark}
          onDownloadFile={handleDownloadFile}
        />
      )}

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--glass-border)',
        background: 'var(--surface-card)',
        padding: '2rem 1.5rem',
        marginTop: '3rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={16} color="var(--accent-emerald)" />
            <span>Easy 1-Click Deployment (Zero Backend Setup • Browser Local Storage)</span>
          </div>

          <div>
            EduHub © {new Date().getFullYear()} • Built for Students & Educators
          </div>
        </div>
      </footer>

    </div>
  );
}
