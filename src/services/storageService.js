// ==========================================================================
// MY STUDY ZONE STORAGE & INDEXEDDB SERVICE
// Provides persistent client-side data management for study materials,
// PDF binary uploads, pre-loaded sample notes, and student bookmarks.
// ==========================================================================

const DB_NAME = 'MyStudyZoneDB';
const DB_VERSION = 1;
const STORE_MATERIALS = 'materials';
const STORE_FILES = 'uploadedFiles';

const STORAGE_KEY_NOTES = 'eduhub_notes_meta';
const STORAGE_KEY_BOOKMARKS = 'eduhub_bookmarks';
const STORAGE_KEY_SUBJECTS = 'eduhub_subjects';

// Pre-seeded study materials with real, rich notes & formula guides
const SEED_MATERIALS = [
  {
    id: 'note-cs-101',
    title: 'Data Structures & Algorithms Cheat Sheet',
    subject: 'Computer Science',
    category: 'Formula Sheet',
    description: 'Comprehensive overview of array operations, binary search trees, graph algorithms, big-O time complexities, and hash map collision resolutions.',
    author: 'Prof. Alan Turing',
    gradeLevel: 'Undergraduate',
    dateAdded: '2026-09-28',
    viewsCount: 1420,
    downloadsCount: 512,
    isPublished: true,
    fileType: 'pdf',
    fileName: 'DSA_Comprehensive_Guide_2026.pdf',
    fileSize: '2.4 MB',
    tags: ['Algorithms', 'Data Structures', 'Trees', 'Graphs', 'Big-O'],
    content: `
# Data Structures & Algorithms Comprehensive Cheat Sheet

## 1. Big-O Time Complexity Quick Reference
- **Array Access**: $O(1)$
- **Binary Search**: $O(\log n)$
- **Quick Sort (Average)**: $O(n \log n)$
- **Hash Table Lookup**: $O(1)$ average, $O(n)$ worst case

## 2. Binary Search Implementation (JavaScript / C++)
\`\`\`javascript
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
\`\`\`

## 3. Key Concepts to Remember for Exams
1. **Recursion Stack**: Always check for base conditions to avoid StackOverflow.
2. **Dijkstra vs BFS**: Use BFS for unweighted graphs; use Dijkstra for weighted non-negative graphs.
3. **Dynamic Programming**: Identify sub-problems and overlapping state equations.
    `,
    flashcards: [
      { q: "What is the average time complexity of QuickSort?", a: "O(n log n)" },
      { q: "Which data structure is used for Breadth-First Search (BFS)?", a: "Queue (FIFO)" },
      { q: "What is a Hash Collision?", a: "When two distinct keys yield the exact same index in a hash table." }
    ]
  },
  {
    id: 'note-phy-201',
    title: 'Physics: Classical Mechanics & Electromagnetism',
    subject: 'Physics',
    category: 'Lecture Notes',
    description: 'Detailed derivations of Newton laws, rotational kinematics, Maxwell equations, magnetic flux, and capacitor charge equations.',
    author: 'Dr. Richard Feynman',
    gradeLevel: 'High School / JEE Prep',
    dateAdded: '2026-09-25',
    viewsCount: 980,
    downloadsCount: 389,
    isPublished: true,
    fileType: 'pdf',
    fileName: 'Physics_Mechanics_Electro_2026.pdf',
    fileSize: '4.1 MB',
    tags: ['Physics', 'Kinematics', 'Electromagnetism', 'Newton Laws'],
    content: `
# Physics: Mechanics & Electromagnetism

## 1. Fundamental Equations of Motion
1. $v = u + at$
2. $s = ut + \frac{1}{2}at^2$
3. $v^2 = u^2 + 2as$

## 2. Maxwell Equations Summary
- **Gauss' Law for Electricity**: $\oint \vec{E} \cdot d\vec{A} = \frac{Q_{encl}}{\epsilon_0}$
- **Gauss' Law for Magnetism**: $\oint \vec{B} \cdot d\vec{A} = 0$
- **Faraday's Law of Induction**: $\mathcal{E} = -\frac{d\Phi_B}{dt}$

## 3. Exam Tip
Always state SI units clearly in multi-step Numerical Problems. Double check vector directions using the Right-Hand Rule!
    `,
    flashcards: [
      { q: "What is Faraday's Law of Induction?", a: "An induced electromotive force (EMF) is proportional to the negative rate of change of magnetic flux." },
      { q: "What is the SI unit of Magnetic Flux?", a: "Weber (Wb)" }
    ]
  },
  {
    id: 'note-math-301',
    title: 'Calculus III & Differential Equations',
    subject: 'Mathematics',
    category: 'Formula Sheet',
    description: 'Quick reference handbook covering partial derivatives, double & triple integrals, Taylor series expansions, and Laplace transforms.',
    author: 'Prof. Katherine Johnson',
    gradeLevel: 'College Level',
    dateAdded: '2026-09-29',
    viewsCount: 2150,
    downloadsCount: 890,
    isPublished: true,
    fileType: 'notes',
    fileName: 'Calculus_Laplace_Guide.pdf',
    fileSize: '1.8 MB',
    tags: ['Calculus', 'Differential Equations', 'Integrals', 'Laplace'],
    content: `
# Calculus & Differential Equations Handbook

## 1. Important Derivatives & Integrals
- $\frac{d}{dx}(\sin x) = \cos x$
- $\int \frac{1}{x} dx = \ln|x| + C$
- Integration by Parts: $\int u \, dv = uv - \int v \, du$

## 2. Common Laplace Transforms
- $\mathcal{L}\{1\} = \frac{1}{s}$
- $\mathcal{L}\{e^{at}\} = \frac{1}{s - a}$
- $\mathcal{L}\{\sin(\omega t)\} = \frac{\omega}{s^2 + \omega^2}$

## 3. High-Frequency Exam Problems
- Solving second-order linear differential equations with constant coefficients ($a y'' + b y' + c y = 0$).
    `,
    flashcards: [
      { q: "What is the derivative of ln(x)?", a: "1/x" },
      { q: "What is the Laplace transform of e^(at)?", a: "1 / (s - a)" }
    ]
  },
  {
    id: 'note-chem-102',
    title: 'Organic Chemistry Reactions & Mechanisms',
    subject: 'Chemistry',
    category: 'Chapter Summary',
    description: 'Step-by-step mechanisms for SN1, SN2, E1, E2 reactions, aromatic substitution, and functional group tests.',
    author: 'Dr. Marie Curie',
    gradeLevel: 'High School / AP Chemistry',
    dateAdded: '2026-09-20',
    viewsCount: 750,
    downloadsCount: 230,
    isPublished: true,
    fileType: 'notes',
    fileName: 'Organic_Chem_Reactions.pdf',
    fileSize: '3.2 MB',
    tags: ['Chemistry', 'Organic Chemistry', 'SN1 SN2', 'Reactions'],
    content: `
# Organic Chemistry Reactions Guide

## 1. SN1 vs SN2 Comparison
- **SN2**: Single step (concerted), inversion of configuration (Walden Inversion), favored by primary alkyl halides and polar aprotic solvents.
- **SN1**: Two-step mechanism via carbocation intermediate, racemization, favored by tertiary alkyl halides and polar protic solvents.

## 2. Electrophilic Aromatic Substitution (EAS)
1. Nitration: $HNO_3 + H_2SO_4 \rightarrow NO_2^+$
2. Halogenation: $X_2 + FeX_3 \rightarrow X^+$
    `,
    flashcards: [
      { q: "Does SN2 involve a carbocation intermediate?", a: "No, SN2 is a single-step concerted mechanism with a transition state." },
      { q: "Which solvent favors SN1 reactions?", a: "Polar protic solvents (e.g., Water, Ethanol)." }
    ]
  }
];

const DEFAULT_SUBJECTS = ['Computer Science', 'Physics', 'Mathematics', 'Chemistry', 'Biology', 'General Knowledge'];

// Initialize IndexedDB
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES, { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

export const storageService = {
  // Get all study materials
  getMaterials: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_NOTES);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(SEED_MATERIALS));
        return SEED_MATERIALS;
      }
      return JSON.parse(stored);
    } catch (err) {
      console.error('Error fetching materials:', err);
      return SEED_MATERIALS;
    }
  },

  // Save/Update material list
  saveMaterials: (materials) => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(materials));
    } catch (err) {
      console.error('Error saving materials:', err);
    }
  },

  // Add new material
  addMaterial: async (materialData, binaryFile = null) => {
    const materials = storageService.getMaterials();
    const newId = 'note-' + Date.now();
    
    let fileSizeStr = '0.5 MB';
    let fileNameStr = materialData.fileName || 'Study_Material.pdf';

    if (binaryFile) {
      fileSizeStr = (binaryFile.size / (1024 * 1024)).toFixed(1) + ' MB';
      fileNameStr = binaryFile.name;
      // Store in IndexedDB
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_FILES, 'readwrite');
        const store = tx.objectStore(STORE_FILES);
        await store.put({ id: newId, fileData: binaryFile, name: binaryFile.name, type: binaryFile.type });
      } catch (err) {
        console.warn('Could not store file in IndexedDB:', err);
      }
    }

    const newMaterial = {
      id: newId,
      title: materialData.title,
      subject: materialData.subject || 'General',
      category: materialData.category || 'Lecture Notes',
      description: materialData.description || '',
      author: materialData.author || 'Admin Educator',
      gradeLevel: materialData.gradeLevel || 'General',
      dateAdded: new Date().toISOString().split('T')[0],
      viewsCount: 1,
      downloadsCount: 0,
      isPublished: true,
      fileType: binaryFile ? (binaryFile.type.includes('pdf') ? 'pdf' : 'doc') : 'notes',
      fileName: fileNameStr,
      fileSize: fileSizeStr,
      tags: materialData.tags || ['Study Guide'],
      content: materialData.content || 'No detailed preview available.',
      flashcards: materialData.flashcards || []
    };

    materials.unshift(newMaterial);
    storageService.saveMaterials(materials);
    return newMaterial;
  },

  // Delete material
  deleteMaterial: async (id) => {
    let materials = storageService.getMaterials();
    materials = materials.filter(m => m.id !== id);
    storageService.saveMaterials(materials);

    // Also remove from IndexedDB if stored
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_FILES, 'readwrite');
      await tx.objectStore(STORE_FILES).delete(id);
    } catch (e) {
      // ignore
    }

    // Remove from bookmarks if present
    const bookmarks = storageService.getBookmarks().filter(bId => bId !== id);
    localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarks));
  },

  // Update material
  updateMaterial: (id, updatedData) => {
    const materials = storageService.getMaterials();
    const index = materials.findIndex(m => m.id === id);
    if (index !== -1) {
      materials[index] = { ...materials[index], ...updatedData };
      storageService.saveMaterials(materials);
    }
    return materials;
  },

  // Increment view count
  incrementView: (id) => {
    const materials = storageService.getMaterials();
    const item = materials.find(m => m.id === id);
    if (item) {
      item.viewsCount = (item.viewsCount || 0) + 1;
      storageService.saveMaterials(materials);
    }
  },

  // Increment download count & download file content
  downloadMaterialFile: async (material) => {
    const materials = storageService.getMaterials();
    const item = materials.find(m => m.id === material.id);
    if (item) {
      item.downloadsCount = (item.downloadsCount || 0) + 1;
      storageService.saveMaterials(materials);
    }

    // Check IndexedDB first
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_FILES, 'readonly');
      const req = tx.objectStore(STORE_FILES).get(material.id);
      
      return new Promise((resolve) => {
        req.onsuccess = () => {
          if (req.result && req.result.fileData) {
            const blobUrl = URL.createObjectURL(req.result.fileData);
            triggerBlobDownload(blobUrl, material.fileName);
            resolve(true);
          } else {
            // Fallback generated text file/PDF download
            generateTextDownload(material);
            resolve(true);
          }
        };
        req.onerror = () => {
          generateTextDownload(material);
          resolve(true);
        };
      });
    } catch (err) {
      generateTextDownload(material);
    }
  },

  // Bookmarks handlers
  getBookmarks: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  toggleBookmark: (id) => {
    let bookmarks = storageService.getBookmarks();
    if (bookmarks.includes(id)) {
      bookmarks = bookmarks.filter(bId => bId !== id);
    } else {
      bookmarks.push(id);
    }
    localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarks));
    return bookmarks;
  },

  // Subjects handlers
  getSubjects: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SUBJECTS);
      return stored ? JSON.parse(stored) : DEFAULT_SUBJECTS;
    } catch (e) {
      return DEFAULT_SUBJECTS;
    }
  },

  addSubject: (newSub) => {
    const subjects = storageService.getSubjects();
    if (!subjects.includes(newSub)) {
      subjects.push(newSub);
      localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(subjects));
    }
    return subjects;
  },
  
  deleteSubject: (subjectToDelete) => {
    let subjects = storageService.getSubjects();
    subjects = subjects.filter(s => s !== subjectToDelete);
    localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(subjects));
    return subjects;
  }
};

// Helper download triggers
function triggerBlobDownload(blobUrl, fileName) {
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function generateTextDownload(material) {
  const fileText = `MY STUDY ZONE STUDY MATERIAL
------------------------------------------------
Title: ${material.title}
Subject: ${material.subject}
Category: ${material.category}
Author: ${material.author}
Date: ${material.dateAdded}
------------------------------------------------

DESCRIPTION:
${material.description}

CONTENT / NOTES:
${material.content}

------------------------------------------------
Downloaded from My Study Zone Portal
`;

  const blob = new Blob([fileText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerBlobDownload(url, material.fileName.replace(/\.pdf$/i, '.txt'));
}
