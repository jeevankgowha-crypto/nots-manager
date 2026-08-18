"use client";

import React, { useState, useEffect } from "react";
import { Award, BookOpen, Shield, Upload, Trash2, Settings, BarChart2, PlusCircle, CheckCircle, RefreshCw, FileText, Lock, Eye, EyeOff, LayoutGrid } from "lucide-react";
import * as XLSX from "xlsx";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Form states for active manager tab
  const [activeManager, setActiveManager] = useState<"overview" | "exams" | "mocktests" | "branding" | "importer" | "chaptercontent">("overview");

  // Dynamic Syllabus Lists
  const [examsList, setExamsList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [chaptersList, setChaptersList] = useState<any[]>([]);
  const [mockTestsList, setMockTestsList] = useState<any[]>([]);

  // Selected hierarchy ids for management forms
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

  // New Exam Form State
  const [examName, setExamName] = useState("");
  const [examDesc, setExamDesc] = useState("");
  const [examIcon, setExamIcon] = useState("BookOpen");

  // New Subject Form State
  const [subjectName, setSubjectName] = useState("");
  const [subjectDesc, setSubjectDesc] = useState("");

  // New Chapter Form State
  const [chapterName, setChapterName] = useState("");
  const [chapterDesc, setChapterDesc] = useState("");

  // New Mock Test Form State
  const [mockTestTitle, setMockTestTitle] = useState("");
  const [mockTestDesc, setMockTestDesc] = useState("");
  const [mockTestDuration, setMockTestDuration] = useState(180);
  const [mockTestMarks, setMockTestMarks] = useState(300);
  const [mockTestNegMark, setMockTestNegMark] = useState(0.25);
  const [mockTestIsPremium, setMockTestIsPremium] = useState(false);
  const [mockTestExamId, setMockTestExamId] = useState("");

  // Branding Settings Form State
  const [websiteName, setWebsiteName] = useState("EduPremium");
  const [newWebsiteName, setNewWebsiteName] = useState("");
  const [brandingSuccess, setBrandingSuccess] = useState(false);

  // Bulk MCQ Importer state
  const [bulkCsvText, setBulkCsvText] = useState("");
  const [importResult, setImportResult] = useState<any>(null);
  const [importLoading, setImportLoading] = useState(false);

  // Chapter Content Manager States
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [chapterTopic, setChapterTopic] = useState<any>(null);
  const [chapterNotes, setChapterNotes] = useState<any[]>([]);
  const [chapterQuestions, setChapterQuestions] = useState<any[]>([]);

  // Video links
  const [chapterVideoUrl, setChapterVideoUrl] = useState("");
  const [chapterVideoDuration, setChapterVideoDuration] = useState("");
  const [saveVideoSuccess, setSaveVideoSuccess] = useState(false);

  // New Note
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNotePdfUrl, setNewNotePdfUrl] = useState("");
  const [newNoteIsPremium, setNewNoteIsPremium] = useState(false);
  const [newNoteReadTime, setNewNoteReadTime] = useState(10);
  const [noteSuccess, setNoteSuccess] = useState(false);

  // New Question
  const [newQuestText, setNewQuestText] = useState("");
  const [newQuestOptions, setNewQuestOptions] = useState<string[]>(["", "", "", ""]);
  const [newQuestCorrect, setNewQuestCorrect] = useState<number>(0);
  const [newQuestExplanation, setNewQuestExplanation] = useState("");
  const [newQuestIsPYQ, setNewQuestIsPYQ] = useState(false);
  const [newQuestPYQYear, setNewQuestPYQYear] = useState<number>(new Date().getFullYear());
  const [newQuestDifficulty, setNewQuestDifficulty] = useState("MEDIUM");
  const [questSuccess, setQuestSuccess] = useState(false);

  // Overview Tab: Questions Explorer States
  const [allOverviewQuestions, setAllOverviewQuestions] = useState<any[]>([]);
  const [overviewYearFilter, setOverviewYearFilter] = useState<string>("ALL");

  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        
        if (!storedToken || !storedUser) {
          window.location.href = "/";
          return;
        }
        
        try {
          const res = await fetch("http://localhost:4000/auth/me", {
            headers: { "Authorization": `Bearer ${storedToken}` }
          });
          
          if (!res.ok) throw new Error("Invalid token");
          
          const userData = await res.json();
          if (userData.role !== "ADMIN" && userData.role !== "SUPERADMIN") {
            alert("Access Denied: Admin authorization required.");
            window.location.href = "/dashboard";
            return;
          }
          
          setIsAuthorized(true);
          setToken(storedToken);
        } catch (error) {
          alert("Access Denied: Invalid or expired session.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/";
        }
      }
    };
    verifyAdmin();
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchAnalytics();
    fetchExams();
    fetchBranding();
    fetchMockTests();
    fetchAllQuestions();
  }, [token]);

  // Dynamic subject list auto-load on selection
  useEffect(() => {
    if (selectedExamId) {
      fetchSubjects(selectedExamId);
      setSubjectsList([]);
      setChaptersList([]);
      setSelectedSubjectId("");
    }
  }, [selectedExamId]);

  // Dynamic chapter list auto-load on selection
  useEffect(() => {
    if (selectedSubjectId) {
      fetchChapters(selectedSubjectId);
    } else {
      setChaptersList([]);
    }
  }, [selectedSubjectId]);

  // Load chapter topics when selectedChapterId changes
  useEffect(() => {
    if (selectedChapterId) {
      const selectedChapObj = chaptersList.find(c => c.id === selectedChapterId);
      if (selectedChapObj) {
        setChapterVideoUrl(selectedChapObj.videoUrl || "");
        setChapterVideoDuration(selectedChapObj.videoDuration || "");
      }
      fetchChapterTopicsAndResources(selectedChapterId);
    } else {
      setChapterTopic(null);
      setChapterNotes([]);
      setChapterQuestions([]);
      setChapterVideoUrl("");
      setChapterVideoDuration("");
    }
  }, [selectedChapterId, chaptersList]);

  const fetchChapterTopicsAndResources = async (chapterId: string) => {
    try {
      // 1. Fetch Topics
      const res = await fetch(`http://localhost:4000/exams/chapters/${chapterId}/topics`);
      const topics = await res.json();
      
      if (Array.isArray(topics) && topics.length > 0) {
        const defaultTopic = topics[0];
        setChapterTopic(defaultTopic);
        
        // 2. Fetch Notes for this topic
        fetchNotesForTopic(defaultTopic.id);
        
        // 3. Fetch Questions for this topic
        fetchQuestionsForTopic(defaultTopic.id);
      } else {
        setChapterTopic(null);
        setChapterNotes([]);
        setChapterQuestions([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotesForTopic = async (topicId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/notes?topicId=${topicId}`);
      const notes = await res.json();
      if (Array.isArray(notes)) setChapterNotes(notes);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestionsForTopic = async (topicId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/questions?topicId=${topicId}`);
      const questions = await res.json();
      if (Array.isArray(questions)) setChapterQuestions(questions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapterId) return;
    setSaveVideoSuccess(false);

    try {
      const res = await fetch(`http://localhost:4000/exams/chapters/${selectedChapterId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          videoUrl: chapterVideoUrl || null,
          videoDuration: chapterVideoDuration || null
        })
      });

      if (!res.ok) throw new Error("Failed to update video link");
      
      await fetchChapters(selectedSubjectId); // Refresh chapter settings locally
      
      setSaveVideoSuccess(true);
      setTimeout(() => setSaveVideoSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Error saving video link");
    }
  };

  const handleAddChapterNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTopic) return alert("No active topic resolved for this chapter.");
    setNoteSuccess(false);

    try {
      const res = await fetch("http://localhost:4000/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newNoteTitle,
          content: newNoteContent,
          pdfUrl: newNotePdfUrl || null,
          isPremium: newNoteIsPremium,
          estimatedReadTime: Number(newNoteReadTime),
          topicId: chapterTopic.id
        })
      });

      if (!res.ok) throw new Error("Failed to add note");

      setNewNoteTitle("");
      setNewNoteContent("");
      setNewNotePdfUrl("");
      setNewNoteIsPremium(false);
      
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 3000);

      fetchNotesForTopic(chapterTopic.id);
    } catch (err: any) {
      alert(err.message || "Error adding note");
    }
  };

  const handleDeleteChapterNote = async (noteId: string) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      const res = await fetch(`http://localhost:4000/notes/${noteId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete note");
      fetchNotesForTopic(chapterTopic.id);
    } catch (err: any) {
      alert(err.message || "Error deleting note");
    }
  };

  const handleAddChapterQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTopic) return alert("No active topic resolved for this chapter.");
    setQuestSuccess(false);

    try {
      const res = await fetch("http://localhost:4000/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          text: newQuestText,
          options: newQuestOptions,
          correctOption: Number(newQuestCorrect),
          explanation: newQuestExplanation,
          topicId: chapterTopic.id,
          isPYQ: newQuestIsPYQ,
          pyqYear: newQuestIsPYQ ? Number(newQuestPYQYear) : null,
          difficulty: newQuestDifficulty
        })
      });

      if (!res.ok) throw new Error("Failed to add question");

      setNewQuestText("");
      setNewQuestOptions(["", "", "", ""]);
      setNewQuestExplanation("");
      setNewQuestIsPYQ(false);
      
      setQuestSuccess(true);
      setTimeout(() => setQuestSuccess(false), 3000);

      fetchQuestionsForTopic(chapterTopic.id);
      fetchAllQuestions();
    } catch (err: any) {
      alert(err.message || "Error adding question");
    }
  };

  const handleDeleteChapterQuestion = async (questId: string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`http://localhost:4000/questions/${questId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete question");
      fetchQuestionsForTopic(chapterTopic.id);
      fetchAllQuestions();
    } catch (err: any) {
      alert(err.message || "Error deleting question");
    }
  };

  const handleDownloadCSVTemplate = () => {
    const headers = [
      "text",
      "optionA",
      "optionB",
      "optionC",
      "optionD",
      "correctOptionIndex_0_to_3",
      "difficulty_EASY_MEDIUM_HARD",
      "explanation",
      "isPYQ_true_or_false",
      "pyqYear"
    ];
    const sampleRow = [
      "What is the value of 2 + 2?",
      "3",
      "4",
      "5",
      "6",
      "1",
      "EASY",
      "Basic arithmetic: 2 + 2 = 4.",
      "false",
      ""
    ];
    const csvRows = [
      headers.join(","),
      sampleRow.map(val => `"${val.replace(/"/g, '""')}"`).join(",")
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "questions_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!chapterTopic) {
      alert("Please select a topic or chapter first.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvText = event.target?.result as string;
        if (!csvText) return;

        const parseCSV = (text: string): string[][] => {
          const result: string[][] = [];
          let row: string[] = [];
          let curr = "";
          let inQuotes = false;
          
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];
            
            if (char === '"') {
              if (inQuotes && nextChar === '"') {
                curr += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === "," && !inQuotes) {
              row.push(curr);
              curr = "";
            } else if ((char === "\r" || char === "\n") && !inQuotes) {
              if (char === "\r" && nextChar === "\n") {
                i++;
              }
              row.push(curr);
              if (row.some(val => val !== "")) {
                result.push(row);
              }
              row = [];
              curr = "";
            } else {
              curr += char;
            }
          }
          if (curr || row.length > 0) {
            row.push(curr);
            if (row.some(val => val !== "")) {
              result.push(row);
            }
          }
          return result;
        };

        const rows = parseCSV(csvText);
        if (rows.length < 2) {
          alert("CSV is empty or missing data rows.");
          return;
        }

        const headers = rows[0].map(h => h.trim().toLowerCase());
        const rawDataRows = rows.slice(1);

        const formattedQuestions = rawDataRows.map((row) => {
          const getVal = (headerName: string) => {
            const idx = headers.indexOf(headerName.toLowerCase());
            return idx !== -1 ? row[idx] : "";
          };

          const text = getVal("text");
          const optionA = getVal("optiona");
          const optionB = getVal("optionb");
          const optionC = getVal("optionc");
          const optionD = getVal("optiond");
          const correctOption = Number(getVal("correctoptionindex_0_to_3"));
          const difficulty = getVal("difficulty_easy_medium_hard").toUpperCase() || "MEDIUM";
          const explanation = getVal("explanation");
          const isPYQ = getVal("ispyq_true_or_false").toLowerCase() === "true";
          const pyqYear = getVal("pyqyear") ? Number(getVal("pyqyear")) : null;

          return {
            text,
            options: [optionA, optionB, optionC, optionD],
            correctOption,
            explanation,
            difficulty: ["EASY", "MEDIUM", "HARD"].includes(difficulty) ? difficulty : "MEDIUM",
            topicId: chapterTopic.id,
            isPYQ,
            pyqYear
          };
        });

        const invalidRows = formattedQuestions.filter(q => !q.text || q.options.some(o => !o) || isNaN(q.correctOption));
        if (invalidRows.length > 0) {
          alert(`Validation failed: ${invalidRows.length} questions have missing/empty text or options, or incorrect option index. Please fix the CSV file.`);
          return;
        }

        if (!window.confirm(`Found ${formattedQuestions.length} questions in CSV. Upload them now under ${chapterTopic.name}?`)) {
          return;
        }

        const res = await fetch("http://localhost:4000/questions/import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ questions: formattedQuestions })
        });

        if (!res.ok) throw new Error("Server rejected import request.");
        const resData = await res.json();
        alert(`Import successful! ${resData.count} questions added.`);

        fetchQuestionsForTopic(chapterTopic.id);
        fetchAllQuestions();
      } catch (err: any) {
        alert(err.message || "Error reading/parsing CSV file.");
      }
    };

    reader.readAsText(file);
  };

  const fetchAnalytics = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/admin/analytics", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("Session expired. Please log in again.");
        window.location.href = "/";
        return;
      }
      if (!res.ok) throw new Error("Failed to load admin analytics");
      const data = await res.json();
      if (data && data.overview) {
        setAnalytics(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllQuestions = async () => {
    try {
      const res = await fetch("http://localhost:4000/questions");
      const data = await res.json();
      if (Array.isArray(data)) {
        setAllOverviewQuestions(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await fetch("http://localhost:4000/exams");
      const data = await res.json();
      if (Array.isArray(data)) setExamsList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async (examId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/exams/${examId}/subjects`);
      const data = await res.json();
      if (Array.isArray(data)) setSubjectsList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChapters = async (subjectId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/exams/subjects/${subjectId}/chapters`);
      const data = await res.json();
      if (Array.isArray(data)) setChaptersList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBranding = async () => {
    try {
      const res = await fetch("http://localhost:4000/exams/settings/website-name");
      const data = await res.json();
      if (data && data.value) {
        setWebsiteName(data.value);
        setNewWebsiteName(data.value);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMockTests = async () => {
    try {
      // Fetching mock tests (defaults to JEE Mains tests or loads overall mock tests catalog)
      const res = await fetch("http://localhost:4000/tests");
      const data = await res.json();
      if (Array.isArray(data)) setMockTestsList(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Create & Delete handlers for Exam Goals
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: examName, description: examDesc, icon: examIcon })
      });
      if (!res.ok) throw new Error("Failed to create exam");

      alert("Exam goal added successfully!");
      setExamName("");
      setExamDesc("");
      fetchExams();
      fetchAnalytics();
    } catch (err: any) {
      alert(err.message || "Failed to add exam goal");
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm("Are you sure you want to delete this exam? This will delete all associated subjects and chapters!")) return;
    try {
      const res = await fetch(`http://localhost:4000/exams/${examId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete exam");
      alert("Exam deleted successfully!");
      fetchExams();
      setSelectedExamId("");
      fetchAnalytics();
    } catch (err: any) {
      alert(err.message || "Error deleting exam");
    }
  };

  // Create & Delete handlers for Subjects
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) return alert("Please select an exam first.");
    try {
      const res = await fetch("http://localhost:4000/exams/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: subjectName, description: subjectDesc, examId: selectedExamId })
      });
      if (!res.ok) throw new Error("Failed to create subject");

      alert("Subject added successfully!");
      setSubjectName("");
      setSubjectDesc("");
      fetchSubjects(selectedExamId);
      fetchAnalytics();
    } catch (err: any) {
      alert(err.message || "Error adding subject");
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!window.confirm("Delete this subject and all its chapters?")) return;
    try {
      const res = await fetch(`http://localhost:4000/exams/subjects/${subjectId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete subject");
      alert("Subject deleted successfully!");
      fetchSubjects(selectedExamId);
      setSelectedSubjectId("");
      fetchAnalytics();
    } catch (err: any) {
      alert(err.message || "Error deleting subject");
    }
  };

  // Create & Delete handlers for Chapters
  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return alert("Please select a subject first.");
    try {
      const res = await fetch("http://localhost:4000/exams/chapters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: chapterName, description: chapterDesc, subjectId: selectedSubjectId })
      });
      if (!res.ok) throw new Error("Failed to create chapter");

      alert("Chapter added successfully!");
      setChapterName("");
      setChapterDesc("");
      fetchChapters(selectedSubjectId);
      fetchAnalytics();
    } catch (err: any) {
      alert(err.message || "Error adding chapter");
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!window.confirm("Delete this chapter?")) return;
    try {
      const res = await fetch(`http://localhost:4000/exams/chapters/${chapterId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete chapter");
      alert("Chapter deleted successfully!");
      fetchChapters(selectedSubjectId);
      fetchAnalytics();
    } catch (err: any) {
      alert(err.message || "Error deleting chapter");
    }
  };

  // Create & Delete handlers for Mock Exams
  const handleCreateMockTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockTestExamId) return alert("Please select a target Exam.");
    try {
      const res = await fetch("http://localhost:4000/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: mockTestTitle,
          description: mockTestDesc,
          durationMinutes: Number(mockTestDuration),
          totalMarks: Number(mockTestMarks),
          negativeMarking: Number(mockTestNegMark),
          isPremium: mockTestIsPremium,
          examId: mockTestExamId
        })
      });
      if (!res.ok) throw new Error("Failed to create mock test");

      alert("Mock Exam created successfully!");
      setMockTestTitle("");
      setMockTestDesc("");
      setMockTestIsPremium(false);
      fetchMockTests();
      fetchAnalytics();
    } catch (err: any) {
      alert(err.message || "Error adding mock test");
    }
  };

  const handleDeleteMockTest = async (testId: string) => {
    if (!window.confirm("Delete this mock test? This will remove all student attempts!")) return;
    try {
      const res = await fetch(`http://localhost:4000/tests/${testId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete mock test");
      alert("Mock test deleted successfully!");
      fetchMockTests();
      fetchAnalytics();
    } catch (err: any) {
      alert(err.message || "Error deleting mock test");
    }
  };

  // Branding configuration updater
  const handleUpdateBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setBrandingSuccess(false);
    try {
      const res = await fetch("http://localhost:4000/exams/settings/website-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ value: newWebsiteName })
      });
      if (!res.ok) throw new Error("Failed to update branding settings");
      setWebsiteName(newWebsiteName);
      setBrandingSuccess(true);
      setTimeout(() => setBrandingSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Error updating branding settings");
    }
  };

  // MCQ bulk CSV importer
  const handleBulkImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportLoading(true);
    setImportResult(null);

    try {
      const lines = bulkCsvText.split("\n").filter((l) => l.trim().length > 0);
      const parsedQuestions: any[] = [];

      for (const line of lines) {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length < 7) continue;

        parsedQuestions.push({
          text: parts[0],
          options: [parts[1], parts[2], parts[3], parts[4]],
          correctOption: parseInt(parts[5]),
          explanation: "Imported via bulk CSV utility.",
          topicId: parts[6],
          difficulty: "MEDIUM",
          language: "English"
        });
      }

      const res = await fetch("http://localhost:4000/questions/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ questions: parsedQuestions })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Import failed");

      setImportResult({ success: true, count: data.count });
      setBulkCsvText("");
      fetchAnalytics();
    } catch (err: any) {
      setImportResult({ success: false, error: err.message || "Invalid CSV layout formatting." });
    } finally {
      setImportLoading(false);
    }
  };

  // Sort and filter all overview questions
  const filteredQuestions = allOverviewQuestions
    .filter((q) => {
      if (overviewYearFilter === "ALL") return true;
      if (overviewYearFilter === "PRACTICE") return !q.isPYQ;
      return q.isPYQ && q.pyqYear?.toString() === overviewYearFilter;
    })
    .sort((a, b) => {
      const yearA = a.pyqYear || 0;
      const yearB = b.pyqYear || 0;
      return yearB - yearA; // newest year on top
    });

  if (!isAuthorized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900/60 backdrop-blur border-r border-slate-800 p-6 flex flex-col justify-between sticky top-0 h-screen z-30">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight block uppercase text-white">{websiteName}</span>
              <span className="text-[9px] font-bold text-blue-400 tracking-wider">ADMIN PLATFORM</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveManager("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all ${
                activeManager === "overview" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/10" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <BarChart2 className="h-4.5 w-4.5" /> Dashboard Overview
            </button>
            <button
              onClick={() => setActiveManager("exams")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all ${
                activeManager === "exams" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/10" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <BookOpen className="h-4.5 w-4.5" /> Syllabus Curation
            </button>
            <button
              onClick={() => setActiveManager("chaptercontent")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all ${
                activeManager === "chaptercontent" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/10" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <LayoutGrid className="h-4.5 w-4.5" /> Chapter Resources
            </button>
            <button
              onClick={() => setActiveManager("mocktests")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all ${
                activeManager === "mocktests" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/10" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FileText className="h-4.5 w-4.5" /> Mock Exams
            </button>
            <button
              onClick={() => setActiveManager("branding")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all ${
                activeManager === "branding" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/10" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Settings className="h-4.5 w-4.5" /> Brand Settings
            </button>
            <button
              onClick={() => setActiveManager("importer")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all ${
                activeManager === "importer" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/10" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Upload className="h-4.5 w-4.5" /> CSV Importer
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-6">
          <a href="/dashboard" className="text-[10px] font-black tracking-wider text-slate-500 hover:text-blue-400 uppercase flex items-center gap-1.5 transition">
            ← Return to Student Portal
          </a>
        </div>
      </aside>

      {/* Admin Central Area */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-center pb-4 border-b border-slate-850">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">{websiteName} Admin Console</h1>
            <p className="text-xs text-slate-400 font-bold mt-0.5">Premium SaaS syllabus controller and monitoring analytics.</p>
          </div>
          <button onClick={fetchAnalytics} className="p-2.5 border border-slate-800 bg-slate-900 rounded-xl hover:bg-slate-800 transition">
            <RefreshCw className="h-4.5 w-4.5 text-slate-300" />
          </button>
        </div>

        {/* OVERVIEW PANEL */}
        {activeManager === "overview" && analytics && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl text-center backdrop-blur shadow-inner">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled Students</p>
                <p className="text-3xl font-black text-white mt-2">{analytics?.overview?.studentCount || 0}</p>
              </div>
              <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl text-center backdrop-blur shadow-inner">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mock Exam Items</p>
                <p className="text-3xl font-black text-blue-500 mt-2">{analytics?.overview?.mockTestsCount || 0}</p>
              </div>
              <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl text-center backdrop-blur shadow-inner">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Questions</p>
                <p className="text-3xl font-black text-teal-400 mt-2">{analytics?.overview?.questionsCount || 0}</p>
              </div>
              <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl text-center backdrop-blur shadow-inner">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cumulative Revenue</p>
                <p className="text-3xl font-black text-amber-500 mt-2">₹{(analytics?.overview?.totalRevenue || 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm backdrop-blur">
                <h3 className="font-extrabold text-sm uppercase text-slate-200 tracking-wider">Popular Mock Exams Attempted</h3>
                <div className="space-y-3">
                  {(analytics?.popularTests || []).map((test: any) => (
                    <div key={test.name} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300">{test.name}</span>
                      <span className="text-[10px] font-black bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-slate-400 uppercase">
                        {test.count} attempts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm backdrop-blur">
                <h3 className="font-extrabold text-sm uppercase text-slate-200 tracking-wider">Recent Test Attempts Logs</h3>
                <div className="divide-y divide-slate-800">
                  {(analytics?.recentAttempts || []).map((attempt: any) => (
                    <div key={attempt.id} className="py-2.5 flex justify-between items-center text-[10px] font-bold">
                      <div>
                        <p className="text-slate-200 font-extrabold">{attempt.user.name}</p>
                        <p className="text-slate-500 font-semibold mt-0.5">{attempt.mockTest.title}</p>
                      </div>
                      <span className="font-extrabold text-blue-500">Score: {attempt.score} Marks</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SYLLABUS CURRICULUM MANAGEMENT PANEL */}
        {activeManager === "exams" && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Column 1: Manage Exams */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 backdrop-blur">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-black text-xs text-white uppercase tracking-wider">1. Manage Exams</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Create or delete entrance examinations</p>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {examsList.map((exam) => (
                    <div key={exam.id} className="flex justify-between items-center p-3 border border-slate-800 bg-slate-950/40 rounded-xl hover:bg-slate-900/40 transition-all text-xs font-bold">
                      <span className="text-slate-300">{exam.name}</span>
                      <button onClick={() => handleDeleteExam(exam.id)} className="p-1.5 hover:bg-red-950/40 text-red-500 rounded-lg transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleCreateExam} className="space-y-3 pt-3 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="Exam Goal Name (e.g. JEE)"
                    required
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none focus:border-blue-600 text-white font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Short Description..."
                    required
                    value={examDesc}
                    onChange={(e) => setExamDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none focus:border-blue-600 text-white font-bold"
                  />
                  <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-extrabold rounded-xl text-xs shadow-md transition">
                    + Add Exam Goal
                  </button>
                </form>
              </div>

              {/* Column 2: Manage Subjects */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 backdrop-blur">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-black text-xs text-white uppercase tracking-wider">2. Manage Subjects</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Manage subjects inside selected exam</p>
                </div>

                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-slate-300 font-bold"
                >
                  <option value="">-- Choose Exam Goal --</option>
                  {examsList.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {subjectsList.map((subject) => (
                    <div key={subject.id} className="flex justify-between items-center p-3 border border-slate-800 bg-slate-950/40 rounded-xl hover:bg-slate-900/40 transition-all text-xs font-bold">
                      <span className="text-slate-300">{subject.name}</span>
                      <button onClick={() => handleDeleteSubject(subject.id)} className="p-1.5 hover:bg-red-950/40 text-red-500 rounded-lg transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {selectedExamId && subjectsList.length === 0 && (
                    <p className="text-[10px] text-slate-400 text-center py-4">No subjects configured for this exam.</p>
                  )}
                </div>

                <form onSubmit={handleCreateSubject} className="space-y-3 pt-3 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="Subject Name (e.g. Mathematics)"
                    required
                    disabled={!selectedExamId}
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none focus:border-blue-600 text-white font-bold disabled:opacity-30"
                  />
                  <input
                    type="text"
                    placeholder="Description..."
                    required
                    disabled={!selectedExamId}
                    value={subjectDesc}
                    onChange={(e) => setSubjectDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none focus:border-blue-600 text-white font-bold disabled:opacity-30"
                  />
                  <button type="submit" disabled={!selectedExamId} className="w-full py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-extrabold rounded-xl text-xs shadow-md transition disabled:opacity-30">
                    + Add Subject
                  </button>
                </form>
              </div>

              {/* Column 3: Manage Chapters */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 backdrop-blur">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-black text-xs text-white uppercase tracking-wider">3. Manage Chapters</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Manage chapters inside selected subject</p>
                </div>

                <div className="space-y-2">
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-slate-300 font-bold"
                  >
                    <option value="">-- Choose Exam Goal --</option>
                    {examsList.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    disabled={!selectedExamId}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-slate-300 font-bold disabled:opacity-30"
                  >
                    <option value="">-- Choose Subject --</option>
                    {subjectsList.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {chaptersList.map((chapter) => (
                    <div key={chapter.id} className="flex justify-between items-center p-3 border border-slate-800 bg-slate-950/40 rounded-xl hover:bg-slate-900/40 transition-all text-xs font-bold">
                      <span className="text-slate-300">{chapter.name}</span>
                      <button onClick={() => handleDeleteChapter(chapter.id)} className="p-1.5 hover:bg-red-950/40 text-red-500 rounded-lg transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {selectedSubjectId && chaptersList.length === 0 && (
                    <p className="text-[10px] text-slate-400 text-center py-4">No chapters configured for this subject.</p>
                  )}
                </div>

                <form onSubmit={handleCreateChapter} className="space-y-3 pt-3 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="Chapter Name (e.g. Trigonometry)"
                    required
                    disabled={!selectedSubjectId}
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none focus:border-blue-600 text-white font-bold disabled:opacity-30"
                  />
                  <input
                    type="text"
                    placeholder="Description..."
                    required
                    disabled={!selectedSubjectId}
                    value={chapterDesc}
                    onChange={(e) => setChapterDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none focus:border-blue-600 text-white font-bold disabled:opacity-30"
                  />
                  <button type="submit" disabled={!selectedSubjectId} className="w-full py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-extrabold rounded-xl text-xs shadow-md transition disabled:opacity-30">
                    + Add Chapter
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* MOCK EXAMS MANAGER PANEL */}
        {activeManager === "mocktests" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Left 3 Columns: Active Exams list */}
            <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6 backdrop-blur">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm uppercase text-slate-200 tracking-wider">Active Mock Exams Catalog</h3>
                <p className="text-[10px] text-slate-400 font-bold">List of mock exams students can currently attempt</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1">
                {mockTestsList.map((test) => {
                  const examName = examsList.find(e => e.id === test.examId)?.name || "JEE/NEET";
                  return (
                    <div key={test.id} className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                            🏆 {test.title}
                          </h4>
                          {test.isPremium && (
                            <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black tracking-widest">PRO</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{test.description}</p>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-850 pt-3 mt-3 font-extrabold">
                        <span>🏷️ {examName}</span>
                        <span>⏱️ {test.durationMinutes}m</span>
                        <span>💯 {test.totalMarks} M</span>
                        <button onClick={() => handleDeleteMockTest(test.id)} className="p-1 hover:bg-red-950/30 text-red-500 rounded-lg transition ml-2">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {mockTestsList.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-10 col-span-2">No mock tests configured yet.</p>
                )}
              </div>
            </div>

            {/* Right 2 Columns: Add new Mock Test Form */}
            <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6 backdrop-blur">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm uppercase text-slate-200 tracking-wider">Create Mock Exam</h3>
                <p className="text-[10px] text-slate-400 font-bold">Configure details for a new mock test container</p>
              </div>

              <form onSubmit={handleCreateMockTest} className="space-y-4 text-xs font-bold text-slate-400">
                <div className="space-y-1">
                  <label className="text-[10px] tracking-wider uppercase text-slate-500">Target Exam Goal</label>
                  <select
                    value={mockTestExamId}
                    onChange={(e) => setMockTestExamId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none text-slate-300 focus:border-blue-600"
                  >
                    <option value="">-- Choose Exam Goal --</option>
                    {examsList.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] tracking-wider uppercase text-slate-500">Test Title</label>
                  <input
                    type="text"
                    placeholder="e.g. JEE Mains Mini Mock Test 1"
                    required
                    value={mockTestTitle}
                    onChange={(e) => setMockTestTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none text-white focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] tracking-wider uppercase text-slate-500">Description</label>
                  <textarea
                    placeholder="e.g. 30 high yield MCQs covering algebra, limits and electrostatics..."
                    required
                    value={mockTestDesc}
                    onChange={(e) => setMockTestDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none text-white focus:border-blue-600 h-16 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-wider uppercase text-slate-500">Duration (Mins)</label>
                    <input
                      type="number"
                      required
                      value={mockTestDuration}
                      onChange={(e) => setMockTestDuration(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none text-white focus:border-blue-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-wider uppercase text-slate-500">Total Marks</label>
                    <input
                      type="number"
                      required
                      value={mockTestMarks}
                      onChange={(e) => setMockTestMarks(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none text-white focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="space-y-1">
                    <label className="text-[10px] tracking-wider uppercase text-slate-500">Negative Marking</label>
                    <select
                      value={mockTestNegMark}
                      onChange={(e) => setMockTestNegMark(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none text-slate-300 focus:border-blue-600"
                    >
                      <option value={0}>0 (No Penalty)</option>
                      <option value={0.25}>0.25 (1/4th Marks)</option>
                      <option value={0.33}>0.33 (1/3rd Marks)</option>
                      <option value={0.5}>0.5 (1/2 Marks)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="premium-test"
                      checked={mockTestIsPremium}
                      onChange={(e) => setMockTestIsPremium(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500 h-4.5 w-4.5 cursor-pointer"
                    />
                    <label htmlFor="premium-test" className="text-[10px] text-slate-300 cursor-pointer select-none">
                      🔒 Require PRO Plan
                    </label>
                  </div>
                </div>

                <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl shadow-lg transition uppercase tracking-wider text-[10px] pt-3.5 mt-2">
                  Create Mock Exam Goal
                </button>
              </form>
            </div>

          </div>
        )}

        {/* BRAND SETTINGS PANEL */}
        {activeManager === "branding" && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 max-w-xl mx-auto shadow-md space-y-6 backdrop-blur">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm uppercase text-slate-200 tracking-wider">Branding Configuration</h3>
              <p className="text-[10px] text-slate-400 font-bold">Configure global portal brand name parameters</p>
            </div>

            <form onSubmit={handleUpdateBranding} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">WEBSITE BRANDING NAME</label>
                <input
                  type="text"
                  placeholder="e.g. EduPremium"
                  required
                  value={newWebsiteName}
                  onChange={(e) => setNewWebsiteName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-blue-600 text-white font-extrabold text-xs"
                />
              </div>

              {brandingSuccess && (
                <div className="p-3 bg-teal-950/40 border border-teal-800/40 text-teal-400 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="h-4.5 w-4.5 text-teal-400" /> Portal branding name saved successfully!
                </div>
              )}

              <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-750 text-white font-extrabold rounded-xl shadow-lg transition text-xs">
                Save Branding Settings
              </button>
            </form>
          </div>
        )}

        {/* BULK CSV IMPORTER */}
        {activeManager === "importer" && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 max-w-2xl mx-auto shadow-md space-y-6 backdrop-blur">
            <h3 className="font-extrabold text-sm uppercase text-slate-200 tracking-wider">Bulk MCQs Import Facility</h3>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
              Paste question rows in CSV formatting. Columns must match precisely:<br />
              <span className="font-mono bg-slate-950 border border-slate-850 px-2 py-1 rounded text-blue-400 block mt-2">
                Question, OptionA, OptionB, OptionC, OptionD, CorrectIndex (0-3), TopicId
              </span>
            </p>

            <form onSubmit={handleBulkImportSubmit} className="space-y-4 text-sm">
              <textarea
                placeholder="What is 2+2?, 2, 3, 4, 5, 2, <topic-uuid>&#10;Which city is Gujarat's port?, Harappa, Kalibangan, Lothal, Mohenjo, 2, <topic-uuid>"
                required
                value={bulkCsvText}
                onChange={(e) => setBulkCsvText(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none font-mono text-[10px] h-40 resize-none text-slate-300"
              />

              {importResult && (
                <div className={`p-4 rounded-xl text-xs font-semibold ${
                  importResult.success ? "bg-teal-950/40 border border-teal-850/40 text-teal-400" : "bg-red-950/40 border border-red-850/40 text-red-400"
                }`}>
                  {importResult.success 
                    ? `Successfully imported ${importResult.count} practice MCQs!`
                    : `Import failed: ${importResult.error}`
                  }
                </div>
              )}

              <button
                type="submit"
                disabled={importLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-750 text-white font-extrabold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {importLoading ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : "Run Bulk Question Parser"}
              </button>
            </form>
          </div>
        )}

        {/* CHAPTER CONTENT RESOURCES MANAGEMENT PANEL */}
        {activeManager === "chaptercontent" && (
          <div className="space-y-8">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 backdrop-blur">
              <h3 className="font-extrabold text-sm uppercase text-slate-200 tracking-wider">Select Chapter Target</h3>
              <p className="text-[10px] text-slate-400 font-bold">Choose the chapter context to configure revision notes, video masterclasses, or practice MCQs.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={selectedExamId}
                  onChange={(e) => {
                    setSelectedExamId(e.target.value);
                    setSelectedChapterId("");
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-slate-300 font-bold"
                >
                  <option value="">-- Choose Exam Goal --</option>
                  {examsList.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>

                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedChapterId("");
                  }}
                  disabled={!selectedExamId}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-slate-300 font-bold disabled:opacity-30"
                >
                  <option value="">-- Choose Subject --</option>
                  {subjectsList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  disabled={!selectedSubjectId}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-slate-300 font-bold disabled:opacity-30"
                >
                  <option value="">-- Choose Chapter --</option>
                  {chaptersList.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedChapterId && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: YouTube Video link AND Notes list */}
                <div className="lg:col-span-5 space-y-8">
                  
                  {/* YouTube video card */}
                  <form onSubmit={handleSaveVideo} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 backdrop-blur">
                    <div className="border-b border-slate-800 pb-3">
                      <h4 className="font-extrabold text-xs uppercase text-slate-200 tracking-wider">🎥 One Shot Video link</h4>
                      <p className="text-[9px] text-slate-500 font-bold mt-0.5">Attach a complete revision video class for this chapter</p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-slate-500">YouTube URL / Embed Link</label>
                        <input
                          type="text"
                          placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                          value={chapterVideoUrl}
                          onChange={(e) => setChapterVideoUrl(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-white font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-slate-500">Duration (e.g. 1h 45m)</label>
                        <input
                          type="text"
                          placeholder="e.g. 1h 45m"
                          value={chapterVideoDuration}
                          onChange={(e) => setChapterVideoDuration(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-white font-semibold"
                        />
                      </div>
                    </div>

                    {saveVideoSuccess && (
                      <div className="text-[10px] text-teal-400 font-bold">
                        ✓ YouTube link configuration saved!
                      </div>
                    )}

                    <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-750 text-white font-extrabold rounded-xl text-xs shadow-md transition">
                      Save Video link
                    </button>
                  </form>

                  {/* Notes PDF list card */}
                  <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 backdrop-blur">
                    <div className="border-b border-slate-800 pb-3">
                      <h4 className="font-extrabold text-xs uppercase text-slate-200 tracking-wider">📄 Revision Notes & PDFs</h4>
                      <p className="text-[9px] text-slate-500 font-bold mt-0.5">Manage study text and downloadable PDFs</p>
                    </div>

                    <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
                      {chapterNotes.map((note) => (
                        <div key={note.id} className="p-3 border border-slate-800 bg-slate-950/40 rounded-xl text-xs font-bold flex justify-between items-center hover:bg-slate-900/30 transition">
                          <div>
                            <p className="text-slate-200">{note.title}</p>
                            <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
                              {note.estimatedReadTime}m read {note.pdfUrl ? "• 📥 Has PDF" : ""} {note.isPremium ? "• 🔒 Premium" : ""}
                            </p>
                          </div>
                          <button onClick={() => handleDeleteChapterNote(note.id)} className="p-1 hover:bg-red-950/30 text-red-500 rounded-lg transition ml-2">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      {chapterNotes.length === 0 && (
                        <p className="text-[10px] text-slate-400 text-center py-6">No study notes added yet.</p>
                      )}
                    </div>

                    <form onSubmit={handleAddChapterNote} className="space-y-3 pt-3 border-t border-slate-800 text-[10px] font-bold text-slate-400">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500">Note Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Chapter Formula Summary"
                          required
                          value={newNoteTitle}
                          onChange={(e) => setNewNoteTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500">Guide PDF Link (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. https://example.com/notes.pdf"
                          value={newNotePdfUrl}
                          onChange={(e) => setNewNotePdfUrl(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500">Est. Read Time (Mins)</label>
                          <input
                            type="number"
                            required
                            value={newNoteReadTime}
                            onChange={(e) => setNewNoteReadTime(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-white"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-4">
                          <input
                            type="checkbox"
                            id="premium-note"
                            checked={newNoteIsPremium}
                            onChange={(e) => setNewNoteIsPremium(e.target.checked)}
                            className="rounded border-slate-800 bg-slate-950 text-blue-600 h-4.5 w-4.5 cursor-pointer"
                          />
                          <label htmlFor="premium-note" className="text-[9px] text-slate-300 cursor-pointer select-none">Require PRO Plan</label>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500">Markdown Content</label>
                        <textarea
                          placeholder="Write revision formulas and notes text here..."
                          required
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-white h-24 resize-none font-semibold leading-relaxed"
                        />
                      </div>

                      {noteSuccess && (
                        <div className="text-[9px] text-teal-400 font-bold">
                          ✓ Revision guide successfully added!
                        </div>
                      )}

                      <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-750 text-white font-extrabold rounded-xl text-xs shadow-md transition">
                        + Add Revision Note
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right Column: MCQ / PYQ lists AND Add form */}
                <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 backdrop-blur">
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-xs uppercase text-slate-200 tracking-wider">📝 Practice Questions & PYQs</h4>
                      <p className="text-[9px] text-slate-500 font-bold mt-0.5">Configure MCQs, PYQs, correct answers, and step-by-step solutions</p>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {chapterQuestions.map((q) => (
                      <div key={q.id} className="p-3 border border-slate-800 bg-slate-950/40 rounded-xl text-xs font-bold flex justify-between items-start hover:bg-slate-900/30 transition">
                        <div className="space-y-1.5 flex-1 pr-3">
                          <p className="text-slate-200 leading-normal">{q.text}</p>
                          <div className="flex gap-3 text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                            <span>Difficulty: {q.difficulty}</span>
                            {q.isPYQ ? (
                              <span className="text-amber-500 font-black">🏆 PYQ ({q.pyqYear})</span>
                            ) : (
                              <span className="text-blue-400">📝 Practice</span>
                            )}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteChapterQuestion(q.id)} className="p-1 hover:bg-red-950/30 text-red-500 rounded-lg transition ml-2">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {chapterQuestions.length === 0 && (
                      <p className="text-[10px] text-slate-400 text-center py-6">No questions added yet.</p>
                    )}
                  </div>

                  <form onSubmit={handleAddChapterQuestion} className="space-y-4 pt-4 border-t border-slate-800 text-[10px] font-bold text-slate-400">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500">Question Content / Prompt</label>
                      <textarea
                        placeholder="e.g. Find the general solution for the differential equation..."
                        required
                        value={newQuestText}
                        onChange={(e) => setNewQuestText(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-white h-16 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {newQuestOptions.map((opt, oIdx) => (
                        <div key={oIdx} className="space-y-1">
                          <label className="text-[9px] text-slate-500">Option {String.fromCharCode(65 + oIdx)}</label>
                          <input
                            type="text"
                            placeholder={`e.g. Option ${String.fromCharCode(65 + oIdx)} content`}
                            required
                            value={opt}
                            onChange={(e) => {
                              const copy = [...newQuestOptions];
                              copy[oIdx] = e.target.value;
                              setNewQuestOptions(copy);
                            }}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-white"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500">Correct Option Index</label>
                        <select
                          value={newQuestCorrect}
                          onChange={(e) => setNewQuestCorrect(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-slate-300 font-bold"
                        >
                          <option value={0}>Option A</option>
                          <option value={1}>Option B</option>
                          <option value={2}>Option C</option>
                          <option value={3}>Option D</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500">Difficulty Grade</label>
                        <select
                          value={newQuestDifficulty}
                          onChange={(e) => setNewQuestDifficulty(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-slate-300 font-bold"
                        >
                          <option value="EASY">Easy</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HARD">Hard</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-500 font-black flex items-center gap-1.5 pt-4">
                          <input
                            type="checkbox"
                            checked={newQuestIsPYQ}
                            onChange={(e) => setNewQuestIsPYQ(e.target.checked)}
                            className="rounded border-slate-800 bg-slate-950 text-blue-600 h-4 w-4 cursor-pointer"
                          />
                          Is it a PYQ?
                        </label>
                      </div>
                    </div>

                    {newQuestIsPYQ && (
                      <div className="space-y-1 w-1/3">
                        <label className="text-[9px] text-slate-500">PYQ Year (e.g. 2023)</label>
                        <input
                          type="number"
                          required
                          value={newQuestPYQYear}
                          onChange={(e) => setNewQuestPYQYear(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-white"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500">Solution Step-by-Step Explanation</label>
                      <textarea
                        placeholder="Provide detailed explanation and numerical derivation..."
                        required
                        value={newQuestExplanation}
                        onChange={(e) => setNewQuestExplanation(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-white h-20 resize-none font-semibold leading-relaxed"
                      />
                    </div>

                    {questSuccess && (
                      <div className="text-[9px] text-teal-400 font-bold">
                        ✓ MCQ practice item successfully added!
                      </div>
                    )}

                    <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-750 text-white font-extrabold rounded-xl text-xs shadow-md transition">
                      + Add Question
                    </button>
                  </form>

                  {/* Bulk Import Questions Divider */}
                  <div className="border-t border-slate-800 pt-4 mt-6 space-y-4">
                    <div>
                      <h4 className="font-extrabold text-[11px] uppercase text-slate-200 tracking-wider">📤 Bulk Import via CSV</h4>
                      <p className="text-[9px] text-slate-500 font-bold mt-0.5">Upload hundreds of questions instantly using a CSV spreadsheet file.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      <button
                        type="button"
                        onClick={handleDownloadCSVTemplate}
                        className="px-3.5 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 font-extrabold rounded-xl text-[10px] transition flex items-center gap-1.5"
                      >
                        📥 Download CSV Template
                      </button>
                      
                      <div className="flex-1 w-full relative">
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleCSVBulkUpload}
                          className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-blue-600/10 file:text-blue-400 hover:file:bg-blue-600/20 file:cursor-pointer cursor-pointer bg-slate-950 border border-slate-800 rounded-xl p-1.5 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
