"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Award, Flame, Trophy, Star, ChevronRight, Search, Bookmark, Clock, RefreshCw, BarChart2, Plus, LogOut, CheckCircle, HelpCircle, Check, AlertCircle, Compass, List, Play, Lock, Settings, ChevronDown, Download, Eye, EyeOff } from "lucide-react";

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [trialStatus, setTrialStatus] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any>({ questions: [], notes: [] });
  
  // Navigation states: "dashboard" | "mocktests" | "analytics" | "settings" | "textbook"
  const [activeMenu, setActiveMenu] = useState<"dashboard" | "mocktests" | "analytics" | "settings" | "textbook">("dashboard");

  // Selected Exam goal state
  const [selectedExamGoal, setSelectedExamGoal] = useState("JEE MAINS");
  const [showExamDropdown, setShowExamDropdown] = useState(false);

  // App content data loaded from DB
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Notes/Questions view states
  const [activeTopic, setActiveTopic] = useState<any>(null);
  const [topicNotes, setTopicNotes] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [topicQuestions, setTopicQuestions] = useState<any[]>([]);
  const [activeTextbookMode, setActiveTextbookMode] = useState<"none" | "notes" | "practice" | "practice_overview" | "pyq" | "oneshot">("none");
  const [activeTextbookChapter, setActiveTextbookChapter] = useState<any>(null);
  
  // MCQ Practice State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [checkedAnswer, setCheckedAnswer] = useState<any>(null);
  const [timedSeconds, setTimedSeconds] = useState(0);
  const [practiceMode, setPracticeMode] = useState<"practice" | "pyq">("practice");
  const [practiceSessionStates, setPracticeSessionStates] = useState<Record<number, "correct" | "wrong" | "seen" | "unseen">>({});
  
  // Mock Test State
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [activeMockTest, setActiveMockTest] = useState<any>(null);
  const [mockAnswers, setMockAnswers] = useState<Record<string, number>>({});
  const [mockTestTimer, setMockTestTimer] = useState(0);
  const [mockTestResult, setMockTestResult] = useState<any>(null);

  const [fontSize, setFontSize] = useState(16);
  const [studentPyqYearFilter, setStudentPyqYearFilter] = useState<string>("ALL");
  const [websiteName, setWebsiteName] = useState("EduPremium");
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);

  useEffect(() => {
    fetch("http://localhost:4000/exams/settings/website-name")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.value) setWebsiteName(data.value);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const initialStates: Record<number, "correct" | "wrong" | "seen" | "unseen"> = {};
    topicQuestions.forEach((_, idx) => {
      initialStates[idx] = idx === 0 ? "seen" : "unseen";
    });
    setPracticeSessionStates(initialStates);
  }, [topicQuestions]);

  useEffect(() => {
    setPracticeSessionStates((prev) => {
      if (prev[currentQuestionIdx] === "unseen") {
        return {
          ...prev,
          [currentQuestionIdx]: "seen"
        };
      }
      return prev;
    });
  }, [currentQuestionIdx]);

  useEffect(() => {
    // Check authentication
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (!token || !storedUser) {
        window.location.href = "/";
        return;
      }
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");

    // Fetch Trial Status
    fetch("http://localhost:4000/subscriptions/trial", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setTrialStatus(data))
      .catch(console.error);

    // Fetch Leaderboard
    fetch("http://localhost:4000/gamification/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLeaderboard(data);
      })
      .catch(console.error);

    // Fetch Test History
    fetch("http://localhost:4000/tests/history", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
      })
      .catch(console.error);

    // Fetch Bookmarks
    fetch("http://localhost:4000/questions/bookmarks", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((questions) => {
        fetch("http://localhost:4000/notes/bookmarks", {
          headers: { "Authorization": `Bearer ${token}` }
        })
          .then((res) => res.json())
          .then((notes) => {
            setBookmarks({
              questions: Array.isArray(questions) ? questions : [],
              notes: Array.isArray(notes) ? notes : []
            });
          });
      })
      .catch(console.error);

    // Fetch Exams Catalog
    fetch("http://localhost:4000/exams")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setExams(data);
          // Auto select UPSC as backend reference if JEE MAINS matches UPSC seeded data
          const selected = data.find((e) => e.name.toLowerCase().includes("jee")) || data[0];
          setSelectedExam(selected || null);
          if (selected) {
            setSelectedExamGoal(selected.name.toUpperCase());
          }
        }
      })
      .catch(console.error);
  }, [user]);

  // Load Subject chapters when Exam is selected
  useEffect(() => {
    if (!selectedExam) return;
    fetch(`http://localhost:4000/exams/${selectedExam.id}/subjects`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSubjects(data);
          setChapters([]);
          setTopics([]);
        }
      })
      .catch(console.error);

    fetch(`http://localhost:4000/tests?examId=${selectedExam.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMockTests(data);
      })
      .catch(console.error);
  }, [selectedExam]);

  // Practice session timer
  useEffect(() => {
    let interval: any;
    if (activeTopic && !checkedAnswer && (activeMenu === "textbook" || activeMenu === "dashboard")) {
      interval = setInterval(() => {
        setTimedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTopic, checkedAnswer, activeMenu]);

  // Mock Test Countdown Timer
  useEffect(() => {
    let interval: any;
    if (activeMockTest && mockTestTimer > 0) {
      interval = setInterval(() => {
        setMockTestTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleMockTestSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeMockTest, mockTestTimer]);

  const handleStreakCheckin = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:4000/gamification/streak/checkin", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(`Streak Check-in Successful! Streak: ${data.streakCount} days (+${data.xpBonus} XP, +${data.coinsBonus} Coins)`);
      if (user) {
        const updated = { ...user, streakCount: data.streakCount, xpPoints: data.xpPoints, coins: data.coins };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      }
    } catch (err: any) {
      alert(err.message || "Failed streak update");
    }
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.trim().length < 2) {
      setSearchResults(null);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/search?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubjectSelect = async (subjectId: string) => {
    setTopics([]);
    try {
      const res = await fetch(`http://localhost:4000/exams/subjects/${subjectId}/chapters`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setChapters(data);
        setActiveTextbookMode("none");
        setActiveTextbookChapter(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChapterSelect = async (chapterId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/exams/chapters/${chapterId}/topics`);
      const data = await res.json();
      if (Array.isArray(data)) setTopics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChapterAction = async (chapter: any, mode: "notes" | "practice" | "practice_overview" | "pyq" | "oneshot") => {
    setActiveTextbookChapter(chapter);
    setActiveTextbookMode(mode);
    setCheckedAnswer(null);
    setSelectedOptionIdx(null);
    setCurrentQuestionIdx(0);
    setTimedSeconds(0);
    setSelectedNote(null);
    setStudentPyqYearFilter("ALL");

    try {
      const topicRes = await fetch(`http://localhost:4000/exams/chapters/${chapter.id}/topics`);
      const topicsData = await topicRes.json();
      if (Array.isArray(topicsData) && topicsData.length > 0) {
        const topic = topicsData[0];
        setActiveTopic(topic);

        if (mode === "notes") {
          const notesRes = await fetch(`http://localhost:4000/notes?topicId=${topic.id}`);
          const notesData = await notesRes.json();
          if (Array.isArray(notesData) && notesData.length > 0) {
            handleLoadNoteDetails(notesData[0].id);
          } else {
            setSelectedNote({
              title: `${chapter.name} Revision Notes`,
              content: `This is a comprehensive, chapter-wise revision note set for ${chapter.name}. It covers all critical formulas, NCERT key definitions, derivation shortcuts, and board level scoring strategies to maximize mock preparation performance metrics.`,
              isLocked: false
            });
          }
        } else if (mode === "practice" || mode === "practice_overview" || mode === "pyq") {
          const qRes = await fetch(`http://localhost:4000/questions?topicId=${topic.id}`);
          const qData = await qRes.json();
          if (Array.isArray(qData) && qData.length > 0) {
            setTopicQuestions(mode === "pyq" ? qData.filter(q => q.isPYQ) : qData);
          } else {
            const mockQs = [
              {
                id: "mock1",
                text: `Which of the following represents the core analytical derivation formula associated with ${chapter.name}?`,
                options: JSON.stringify(['Option A: Standard NCERT dimensional formula', 'Option B: Derivative rate equations', 'Option C: Scalar potential coordinates', 'Option D: All of the above']),
                correctOption: 3,
                explanation: `Under ${chapter.name}, standard conceptual formulas require calculating boundary limits across all parameters, confirming Option D.`
              }
            ];
            setTopicQuestions(mockQs);
          }
        }
      } else {
        if (mode === "notes") {
          setSelectedNote({
            title: `${chapter.name} Revision Notes`,
            content: `This is a comprehensive, chapter-wise revision note set for ${chapter.name}. It covers all critical formulas, NCERT key definitions, derivation shortcuts, and board level scoring strategies to maximize mock preparation performance metrics.`,
            isLocked: false
          });
        } else if (mode === "practice" || mode === "practice_overview" || mode === "pyq") {
          setTopicQuestions([
            {
              id: "mock1",
              text: `Which of the following represents the core analytical derivation formula associated with ${chapter.name}?`,
              options: JSON.stringify(['Option A: Standard NCERT dimensional formula', 'Option B: Derivative rate equations', 'Option C: Scalar potential coordinates', 'Option D: All of the above']),
              correctOption: 3,
              explanation: `Under ${chapter.name}, standard conceptual formulas require calculating boundary limits across all parameters, confirming Option D.`
            }
          ]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTopicSelect = async (topic: any) => {
    setActiveTopic(topic);
    setSelectedNote(null);
    setCheckedAnswer(null);
    setSelectedOptionIdx(null);
    setCurrentQuestionIdx(0);
    setTimedSeconds(0);

    fetch(`http://localhost:4000/notes?topicId=${topic.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTopicNotes(data);
      });

    fetch(`http://localhost:4000/questions?topicId=${topic.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTopicQuestions(data);
      });
  };

  const handleLoadNoteDetails = async (noteId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:4000/notes/${noteId}?userId=${user?.id || ""}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setSelectedNote(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = async (type: "QUESTION" | "NOTE", targetId: string) => {
    const token = localStorage.getItem("token");
    const endpoint = type === "QUESTION" 
      ? `http://localhost:4000/questions/${targetId}/bookmark`
      : `http://localhost:4000/notes/${targetId}/bookmark`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();

      fetch(`http://localhost:4000/${type === "QUESTION" ? "questions" : "notes"}/bookmarks`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((items) => {
          setBookmarks((prev: any) => ({
            ...prev,
            [type === "QUESTION" ? "questions" : "notes"]: items
          }));
        });
        
      alert(data.bookmarked ? "Bookmarked!" : "Bookmark removed.");
    } catch (err) {
      console.error(err);
    }
  };

  const handlePracticeAnswerSubmit = async () => {
    if (selectedOptionIdx === null) return;
    const currentQ = topicQuestions[currentQuestionIdx];
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:4000/questions/${currentQ.id}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ selectedOption: selectedOptionIdx })
      });
      const data = await res.json();
      setCheckedAnswer(data);

      setPracticeSessionStates((prev) => ({
        ...prev,
        [currentQuestionIdx]: data.isCorrect ? "correct" : "wrong"
      }));

      if (data.isCorrect && user) {
        setUser((prev: any) => ({
          ...prev,
          xpPoints: prev.xpPoints + 10,
          coins: prev.coins + 2
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartMockTest = async (testId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:4000/tests/${testId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Test Locked.");
      }
      const data = await res.json();
      
      setActiveMockTest(data);
      setMockAnswers(JSON.parse(localStorage.getItem(`mock_test_answers_${testId}`) || "{}"));
      setMockTestTimer(data.durationMinutes * 60);
      setMockTestResult(null);
    } catch (err: any) {
      alert(err.message || "Locked. Purchase subscription to attempt mock tests.");
    }
  };

  const handleMockTestSubmit = async () => {
    if (!activeMockTest) return;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:4000/tests/${activeMockTest.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          answers: mockAnswers,
          timeTakenSeconds: activeMockTest.durationMinutes * 60 - mockTestTimer
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMockTestResult(data);
      localStorage.removeItem(`mock_test_answers_${activeMockTest.id}`);
      
      fetch("http://localhost:4000/tests/history", {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setHistory(data);
        });
    } catch (err: any) {
      alert(err.message || "Failed to submit");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // Switch Goal Trigger
  const handleExamGoalChange = (exam: any) => {
    setSelectedExam(exam);
    setSelectedExamGoal(exam.name.toUpperCase());
    setShowExamDropdown(false);
  };

  // Generate GitHub style grids activity values
  const activityDays = Array.from({ length: 52 * 7 }, (_, i) => {
    const val = Math.sin(i / 15) * Math.cos(i / 30);
    if (val > 0.6) return 4;
    if (val > 0.2) return 2;
    if (val > -0.2) return 1;
    return 0;
  });

  // Sort and filter all student PYQs for the selected chapter's topic
  const filteredStudentPyqs = topicQuestions
    .filter((q) => {
      if (studentPyqYearFilter === "ALL") return true;
      return q.isPYQ && q.pyqYear?.toString() === studentPyqYearFilter;
    })
    .sort((a, b) => {
      const yearA = a.pyqYear || 0;
      const yearB = b.pyqYear || 0;
      return yearB - yearA; // newest year on top
    });

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans">
      
      {/* SIDEBAR: Styled matching screenshot 1 */}
      <aside className="w-64 bg-white flex flex-col justify-between hidden md:flex border-r border-slate-100 p-6 sticky top-0 h-screen">
        <div className="space-y-8">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2.5 rounded-2xl shadow-md">
              <Award className="h-6 w-6 text-white" />
            </div>
             <div>
              <p className="font-extrabold text-sm text-slate-900 leading-tight">{websiteName}</p>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider">LIFELONG LEARNING</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveMenu("dashboard"); setActiveMockTest(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeMenu === "dashboard" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Trophy className="h-4.5 w-4.5" /> Dashboard
            </button>
            <button
              onClick={() => { setActiveMenu("mocktests"); setActiveMockTest(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeMenu === "mocktests" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <List className="h-4.5 w-4.5" /> Mock Tests
            </button>
            <button
              onClick={() => { setActiveMenu("analytics"); setActiveMockTest(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeMenu === "analytics" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <BarChart2 className="h-4.5 w-4.5" /> Analytics
            </button>
            <button
              onClick={() => { setActiveMenu("settings"); setActiveMockTest(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeMenu === "settings" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Settings className="h-4.5 w-4.5" /> Settings
            </button>
            <button
              onClick={() => { setActiveMenu("textbook"); setActiveMockTest(null); if (subjects.length > 0) handleSubjectSelect(subjects[0].id); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeMenu === "textbook" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <BookOpen className="h-4.5 w-4.5" /> Textbook
            </button>
          </nav>
        </div>

        {/* Sidebar promotion & Upgrade block */}
        <div className="space-y-6 pt-6 border-t border-slate-100">
          <div className="p-4 bg-blue-600 text-white rounded-2xl text-xs font-semibold text-center space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full blur-xl"></div>
            <p className="text-white leading-snug">Unlock 100+ expert courses</p>
            <button
              onClick={() => alert("Simulated razorpay checkout. Please checkout on landing page pricing.")}
              className="w-full py-2.5 bg-white text-blue-600 font-extrabold rounded-xl text-center block shadow"
            >
              Upgrade to Premium
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* CENTRAL AREA */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        
        {/* HEADER BAR: Styled matching screenshot 1 */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-800">{websiteName}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
          </div>

          {/* Center search bar (only visible in Analytics) */}
          {activeMenu === "analytics" && (
            <div className="relative w-64 md:w-96 hidden md:block">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search analytics..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
              />
            </div>
          )}

          <div className="flex items-center gap-5">
            {/* Exam selector dropdown capsule */}
            <div className="relative">
              <button
                onClick={() => setShowExamDropdown(!showExamDropdown)}
                className="px-4 py-2 bg-blue-50/65 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-sm transition"
              >
                <span>Selected Exam</span>
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[9px]">{selectedExamGoal}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showExamDropdown && (
                <div className="absolute right-0 top-12 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-50">
                  {exams.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => handleExamGoalChange(ex)}
                      className="w-full text-left p-2.5 hover:bg-slate-50 text-xs font-bold rounded-xl transition truncate"
                    >
                      🎓 {ex.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Simulated theme circle */}
            <button className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50">
              🌓
            </button>

            {/* Profile pic avatar */}
            {user && (
              <button
                onClick={() => setShowProfileSidebar(true)}
                className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer hover:scale-110"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name || "Avatar"}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-blue-600 font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                )}
              </button>
            )}
          </div>
        </header>

        {/* PROFILE SIDEBAR OVERLAY */}
        {showProfileSidebar && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity"
              onClick={() => setShowProfileSidebar(false)}
            />
            {/* Sidebar Panel */}
            <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
              {/* Close button */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">My Profile</h3>
                <button
                  onClick={() => setShowProfileSidebar(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-black transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Profile Info */}
              <div className="p-6 flex flex-col items-center space-y-3 border-b border-slate-100">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-3 border-blue-200 shadow-lg">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name || "Avatar"}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-blue-600 font-black text-2xl">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-base font-extrabold text-slate-900">{user?.name || "Student"}</p>
                  <p className="text-xs text-slate-400 font-semibold">{user?.email || ""}</p>
                  <p className="text-[10px] text-blue-600 font-bold mt-1 bg-blue-50 rounded-full px-3 py-0.5 inline-block">{user?.role || "STUDENT"}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="p-5 grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-3.5 text-center border border-amber-200/50">
                  <p className="text-lg font-black text-amber-600">{user?.xpPoints || 0}</p>
                  <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">XP Points</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-3.5 text-center border border-orange-200/50">
                  <p className="text-lg font-black text-orange-600">{user?.streakCount || 0}</p>
                  <p className="text-[9px] font-bold text-orange-500 uppercase tracking-wider">Day Streak</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-2xl p-3.5 text-center border border-yellow-200/50">
                  <p className="text-lg font-black text-yellow-600">{user?.coins || 0}</p>
                  <p className="text-[9px] font-bold text-yellow-500 uppercase tracking-wider">Coins</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-3.5 text-center border border-blue-200/50">
                  <p className="text-xs font-black text-blue-600 break-all">{user?.referralCode || "—"}</p>
                  <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">Referral Code</p>
                </div>
              </div>

              {/* Trial Status */}
              {trialStatus && (
                <div className="px-5 pb-3">
                  <div className={`rounded-2xl p-3.5 text-center text-xs font-bold ${trialStatus.isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                    {trialStatus.isActive ? "✅ Trial Active" : "⏰ Trial Expired"}
                    {trialStatus.daysRemaining !== undefined && trialStatus.isActive && (
                      <span className="ml-1">• {trialStatus.daysRemaining} days left</span>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="mt-auto p-5 space-y-2.5 border-t border-slate-100">
                <button
                  onClick={() => { setActiveMenu("settings"); setShowProfileSidebar(false); }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Settings className="h-4 w-4" /> Account Settings
                </button>
                <button
                  onClick={() => { handleLogout(); setShowProfileSidebar(false); }}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          </>
        )}

        {/* CONTAINER CONTENT */}
        <div className="p-8 max-w-6xl mx-auto w-full flex-grow space-y-8">
          
          {/* TAB 1: DASHBOARD VIEW (Matching screenshot 1 exactly) */}
          {activeMenu === "dashboard" && !activeMockTest && (
            <div className="space-y-10">
              
              {/* Welcome text */}
              <div className="space-y-1">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Welcome back, {user ? user.name : "Alex"}!
                </h1>
                <p className="text-sm font-semibold text-slate-500">
                  You're 12% closer to your monthly goal. Keep it up!
                </p>
              </div>

              {/* Your Subjects */}
              <div className="space-y-5">
                <h3 className="font-extrabold text-lg tracking-tight text-slate-900">Your Subjects</h3>

                {/* 4 Colored Cards matching grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {subjects.map((sub, idx) => {
                    let icon = "📚";
                    let bgClass = "bg-blue-50/70";
                    let textClass = "text-blue-600";
                    let borderClass = "border-blue-100";
                    let barColor = "bg-blue-600";
                    
                    const name = sub.name.toLowerCase();
                    if (name.includes("math")) {
                      icon = "Σ";
                      bgClass = "bg-blue-50/70";
                      textClass = "text-blue-600";
                      borderClass = "border-blue-100";
                      barColor = "bg-blue-600";
                    } else if (name.includes("phys")) {
                      icon = "⚙️";
                      bgClass = "bg-teal-50/70";
                      textClass = "text-teal-600";
                      borderClass = "border-teal-100";
                      barColor = "bg-teal-600";
                    } else if (name.includes("kannada")) {
                      icon = "文";
                      bgClass = "bg-amber-50/70";
                      textClass = "text-amber-800";
                      borderClass = "border-amber-100";
                      barColor = "bg-amber-800";
                    } else if (name.includes("chem")) {
                      icon = "🔬";
                      bgClass = "bg-purple-50/70";
                      textClass = "text-purple-600";
                      borderClass = "border-purple-100";
                      barColor = "bg-purple-600";
                    } else if (name.includes("bio")) {
                      icon = "🌱";
                      bgClass = "bg-emerald-50/70";
                      textClass = "text-emerald-600";
                      borderClass = "border-emerald-100";
                      barColor = "bg-emerald-600";
                    } else if (name.includes("eng")) {
                      icon = "📝";
                      bgClass = "bg-indigo-50/70";
                      textClass = "text-indigo-600";
                      borderClass = "border-indigo-100";
                      barColor = "bg-indigo-600";
                    }

                    const mockProgress = [45, 62, 28, 81, 50, 70][idx % 6];

                    return (
                      <div
                        key={sub.id}
                        className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between hover:scale-[1.02] transition-transform relative group"
                      >
                        <div className="flex justify-between items-center">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${bgClass} ${textClass}`}>
                            {icon}
                          </div>
                          <ChevronRight className="h-4.5 w-4.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{sub.name}</p>
                            <p className="text-[10px] font-bold text-slate-400">{mockProgress}% Complete</p>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${mockProgress}%` }}></div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveMenu("textbook");
                            handleSubjectSelect(sub.id);
                          }}
                          className={`w-full py-2.5 border rounded-2xl text-xs font-bold bg-white text-center transition ${borderClass} ${textClass} hover:bg-slate-50/40`}
                        >
                          Continue
                        </button>
                      </div>
                    );
                  })}
                  {subjects.length === 0 && (
                    <p className="text-xs text-slate-400 py-6">No subjects loaded for this exam.</p>
                  )}
                </div>

              </div>

              {/* Large motivational quotation quote banner */}
              <div className="py-16 text-left border-y border-slate-100">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-blue-600 tracking-tight leading-tight max-w-4xl">
                  "The more you sweat in training, the less you bleed in battle"
                </h2>
              </div>
            </div>
          )}

          {/* TAB 2: PERFORMANCE ANALYTICS VIEW (Matching screenshot 2 exactly) */}
          {activeMenu === "analytics" && !activeMockTest && (
            <div className="space-y-8">
              
              {/* Analytics Header bar filter */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Performance Analytics</h2>
                  <p className="text-xs text-slate-500 font-bold">Detailed insights into your academic journey and learning trends.</p>
                </div>
                
                <div className="flex gap-3">
                  <button className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 bg-white text-slate-600">
                    📅 Last 7 Days <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
                    <Download className="h-4 w-4" /> Export PDF
                  </button>
                </div>
              </div>

              {/* Row 1: Overall Accuracy & Study Time split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Radial stroke-dasharray dial (Overall accuracy) */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col justify-between items-center text-center space-y-6">
                  <h4 className="text-[10px] font-black tracking-wider text-slate-400 uppercase w-full text-left">Overall Accuracy</h4>
                  
                  {/* SVG circle */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r="54" stroke="#F1F5F9" strokeWidth="12" fill="transparent" />
                      <circle cx="72" cy="72" r="54" stroke="#2563EB" strokeWidth="12" fill="transparent" strokeDasharray="339" strokeDashoffset="61" />
                    </svg>
                    <div className="absolute text-center">
                      <p className="text-3xl font-black text-slate-900">82%</p>
                      <p className="text-[10px] text-teal-600 font-extrabold bg-teal-50 px-2 py-0.5 rounded mt-1">📈 +3%</p>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-500 max-w-xs leading-relaxed">
                    "You're performing better than 88% of peers."
                  </p>
                </div>

                {/* Area Gradient chart (Study time) */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Study Time (Hours)</h4>
                      <p className="text-2xl font-black text-slate-900 mt-2">24.5 hrs <span className="text-xs text-slate-400 font-normal">this week</span></p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
                      <span>This Week</span>
                    </div>
                  </div>

                  {/* SVG smooth area line curve */}
                  <div className="h-44 w-full">
                    <svg className="w-full h-full" viewBox="0 0 500 150">
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25"/>
                          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0"/>
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0" y1="120" x2="500" y2="120" stroke="#F1F5F9" strokeWidth="1" />
                      <line x1="0" y1="70" x2="500" y2="70" stroke="#F1F5F9" strokeWidth="1" />
                      
                      {/* Area filled */}
                      <path d="M 0 90 Q 70 80 120 110 T 250 50 T 380 130 T 500 40 L 500 150 L 0 150 Z" fill="url(#areaGrad)" />
                      {/* Stroke path */}
                      <path d="M 0 90 Q 70 80 120 110 T 250 50 T 380 130 T 500 40" fill="transparent" stroke="#2563EB" strokeWidth="3" />
                      
                      {/* Data Dots */}
                      <circle cx="120" cy="110" r="4.5" fill="#2563EB" />
                      <circle cx="250" cy="50" r="4.5" fill="#2563EB" />
                      <circle cx="380" cy="130" r="4.5" fill="#2563EB" />
                      <circle cx="500" cy="40" r="4.5" fill="#2563EB" />
                    </svg>
                  </div>
                  
                  {/* Days labels */}
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 px-2">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Radar radar subject proficiency and topic lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Radar spider chart */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6 flex flex-col justify-between">
                  <h4 className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Proficiency By Subject</h4>
                  
                  {/* SVG radar */}
                  <div className="h-60 flex items-center justify-center relative">
                    <svg className="w-60 h-60" viewBox="0 0 200 200">
                      {/* Backing pentagons */}
                      <polygon points="100,20 176,75 147,165 53,165 24,75" fill="none" stroke="#F1F5F9" strokeWidth="1" />
                      <polygon points="100,50 151,88 131,149 69,149 49,88" fill="none" stroke="#F1F5F9" strokeWidth="1" />
                      <polygon points="100,75 125,94 115,125 85,125 75,94" fill="none" stroke="#F1F5F9" strokeWidth="1" />

                      {/* Connecting lines */}
                      <line x1="100" y1="100" x2="100" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                      <line x1="100" y1="100" x2="176" y2="75" stroke="#F1F5F9" strokeWidth="1" />
                      <line x1="100" y1="100" x2="147" y2="165" stroke="#F1F5F9" strokeWidth="1" />
                      <line x1="100" y1="100" x2="53" y2="165" stroke="#F1F5F9" strokeWidth="1" />
                      <line x1="100" y1="100" x2="24" y2="75" stroke="#F1F5F9" strokeWidth="1" />

                      {/* Profiency Polygon filled */}
                      <polygon points="100,50 160,80 135,130 65,150 40,80" fill="#2563EB" fillOpacity="0.15" stroke="#2563EB" strokeWidth="2" />
                      
                      {/* Labels coordinates */}
                      <text x="100" y="14" textAnchor="middle" className="text-[9px] font-bold fill-slate-500">Quant</text>
                      <text x="184" y="78" textAnchor="start" className="text-[9px] font-bold fill-slate-500">Verbal</text>
                      <text x="155" y="178" textAnchor="start" className="text-[9px] font-bold fill-slate-500">Logic</text>
                      <text x="45" y="178" textAnchor="end" className="text-[9px] font-bold fill-slate-500">Data</text>
                      <text x="16" y="78" textAnchor="end" className="text-[9px] font-bold fill-slate-500">GK</text>
                    </svg>
                  </div>
                </div>

                {/* Topic Performance list matching screenshot 2 right */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Topic Performance</h4>
                    <div className="flex gap-1.5">
                      <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md uppercase">Strong</span>
                      <span className="text-[9px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md uppercase">Weak</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Item 1: Data Interpretation */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                          📊
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Data Interpretation</p>
                          <p className="text-[10px] text-slate-400 font-bold">94% Accuracy • 12 Tests</p>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-teal-600">A+</span>
                    </div>

                    {/* Item 2: Sentence Correction */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                          ✍️
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Sentence Correction</p>
                          <p className="text-[10px] text-slate-400 font-bold">88% Accuracy • 8 Tests</p>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-teal-600">A</span>
                    </div>

                    {/* Item 3: Permutations */}
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                          📉
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Permutations & Comb.</p>
                          <p className="text-[10px] text-slate-400 font-bold">42% Accuracy • 15 Tests</p>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-red-500">C-</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Consistency grid heat map (Screenshot 2 bottom) */}
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Learning Consistency</h4>
                    <p className="text-sm font-bold text-slate-700 mt-1">365 day streak of curiosity.</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                    <span>Less</span>
                    <span className="w-2.5 h-2.5 bg-slate-100 rounded-sm"></span>
                    <span className="w-2.5 h-2.5 bg-blue-100 rounded-sm"></span>
                    <span className="w-2.5 h-2.5 bg-blue-300 rounded-sm"></span>
                    <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></span>
                    <span>More</span>
                  </div>
                </div>

                {/* Git activity chart cells */}
                <div className="overflow-x-auto">
                  <div className="flex gap-[3px] min-w-[700px]">
                    {Array.from({ length: 52 }).map((_, weekIdx) => (
                      <div key={weekIdx} className="flex flex-col gap-[3px]">
                        {Array.from({ length: 7 }).map((_, dayIdx) => {
                          const level = activityDays[weekIdx * 7 + dayIdx];
                          let color = "bg-slate-100";
                          if (level === 1) color = "bg-blue-100";
                          if (level === 2) color = "bg-blue-300";
                          if (level === 4) color = "bg-blue-600";
                          return (
                            <div key={dayIdx} className={`w-2.5 h-2.5 rounded-sm ${color}`}></div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Month headers */}
                <div className="flex justify-between text-[9px] font-bold text-slate-400 pt-2 px-1">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MOCK TESTS CATALOG & solver (SaaS portal) */}
          {activeMenu === "mocktests" && (
            <div className="space-y-6">
              {!activeMockTest ? (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">Mock Exams Catalog</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockTests.map((test) => (
                      <div key={test.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h3 className="font-bold text-base flex items-center gap-2">
                            🏆 {test.title}
                            {test.isPremium && (
                              <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-extrabold">PRO ONLY</span>
                            )}
                          </h3>
                          <p className="text-xs text-slate-500">{test.description}</p>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 border-t border-slate-100 pt-4">
                          <span>⏱️ {test.durationMinutes} Mins</span>
                          <span>💯 {test.totalMarks} Marks</span>
                          <button
                            onClick={() => handleStartMockTest(test.id)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow text-xs font-bold"
                          >
                            Attempt Exam
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Split screen exam panel */
                <div className="space-y-6">
                  {!mockTestResult ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                      <div className="lg:col-span-3 bg-white border border-slate-100 rounded-3xl p-8 shadow-md space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                          <h3 className="font-bold text-base">{activeMockTest.title}</h3>
                          <span className="text-xs font-bold bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full animate-pulse">
                            ⏱️ {Math.floor(mockTestTimer / 60)}:{(mockTestTimer % 60).toString().padStart(2, "0")} left
                          </span>
                        </div>

                        <div className="space-y-6">
                          {activeMockTest.questions.map((mq: any, idx: number) => (
                            <div key={mq.question.id} className="space-y-4 pb-6 border-b border-slate-100">
                              <p className="text-sm font-bold text-slate-800">
                                {idx + 1}. {mq.question.text}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {JSON.parse(mq.question.options).map((opt: string, optIdx: number) => (
                                  <button
                                    key={optIdx}
                                    onClick={() => {
                                      setMockAnswers((prev) => ({
                                        ...prev,
                                        [mq.question.id]: optIdx
                                      }));
                                    }}
                                    className={`text-left p-3.5 border rounded-xl text-xs font-semibold transition ${
                                      mockAnswers[mq.question.id] === optIdx
                                        ? "border-blue-600 bg-blue-50/50"
                                        : "border-slate-200 hover:bg-slate-50"
                                    }`}
                                  >
                                    {String.fromCharCode(65 + optIdx)}. {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end pt-4">
                          <button
                            onClick={handleMockTestSubmit}
                            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition"
                          >
                            Submit Mock Test
                          </button>
                        </div>
                      </div>

                      {/* Summary Palette */}
                      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 h-fit">
                        <h4 className="font-bold text-sm">Response Summary</h4>
                        <div className="flex flex-wrap gap-2">
                          {activeMockTest.questions.map((mq: any, idx: number) => {
                            const attempted = mockAnswers[mq.question.id] !== undefined;
                            return (
                              <div
                                key={mq.question.id}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                  attempted ? "bg-teal-600 text-white shadow" : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {idx + 1}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Scorecard Analytics Dashboard */
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-lg space-y-8 max-w-3xl mx-auto">
                      <div className="text-center space-y-2 pb-6 border-b border-slate-100">
                        <Trophy className="h-10 w-10 text-amber-500 mx-auto" />
                        <h2 className="text-2xl font-bold tracking-tight">Test Report Card</h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
                        <div className="p-4 bg-slate-50 border rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Final Marks</p>
                          <p className="text-2xl font-black mt-2 text-blue-600">{mockTestResult.score} / {mockTestResult.totalMarks}</p>
                        </div>
                        <div className="p-4 bg-slate-50 border rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Accuracy Count</p>
                          <p className="text-2xl font-black text-teal-600 mt-2">✔️ {mockTestResult.correctCount} | ❌ {mockTestResult.incorrectCount}</p>
                        </div>
                        <div className="p-4 bg-slate-50 border rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Estimated Rank</p>
                          <p className="text-2xl font-black text-indigo-600 mt-2">#{mockTestResult.rank} / {mockTestResult.totalAttempts}</p>
                        </div>
                        <div className="p-4 bg-slate-50 border rounded-2xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Percentile Rank</p>
                          <p className="text-2xl font-black text-orange-500 mt-2">{mockTestResult.percentile}%</p>
                        </div>
                      </div>

                      <div className="flex justify-center border-t border-slate-100 pt-6">
                        <button
                          onClick={() => {
                            setActiveMockTest(null);
                            setMockTestResult(null);
                            setActiveMenu("dashboard");
                          }}
                          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg"
                        >
                          Return to Dashboard
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
               {/* TAB 4: TEXTBOOK & notes view */}
          {activeMenu === "textbook" && (
            <div className="space-y-8">
              {activeTextbookMode === "none" ? (
                /* Chapters Grid Layout: 3 in a row */
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {subjects.find(s => s.id === activeTopic?.subjectId)?.name || "Subject"} Chapters
                      </h2>
                      <p className="text-xs text-slate-500 font-bold">Select any chapter resource to start studying immediately.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {chapters.map((ch, idx) => (
                      <div
                        key={ch.id}
                        className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5 hover:scale-[1.01] hover:border-slate-200 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chapter {idx + 1}</span>
                          <h3 className="font-extrabold text-lg text-slate-900 mt-1 leading-snug">{ch.name}</h3>
                          <p className="text-xs text-slate-500 font-semibold mt-1">Study syllabus topic, practice MCQs and review PYQs.</p>
                        </div>

                        {/* Action buttons list */}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <button
                            onClick={() => handleChapterAction(ch, "oneshot")}
                            className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5"
                          >
                            <Play className="h-3.5 w-3.5 fill-current" /> One Shot
                          </button>
                          <button
                            onClick={() => handleChapterAction(ch, "notes")}
                            className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5"
                          >
                            <BookOpen className="h-3.5 w-3.5" /> Notes
                          </button>
                          <button
                            onClick={() => handleChapterAction(ch, "pyq")}
                            className="py-2.5 px-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5"
                          >
                            <Award className="h-3.5 w-3.5" /> PYQs
                          </button>
                          <button
                            onClick={() => handleChapterAction(ch, "practice_overview")}
                            className="py-2.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5"
                          >
                            <HelpCircle className="h-3.5 w-3.5" /> Practice
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {chapters.length === 0 && (
                    <p className="text-slate-400 text-center py-10 bg-white border rounded-3xl">No chapters loaded. Select another exam goal or subject.</p>
                  )}
                </div>
              ) : (
                /* Fullscreen Study Workspace */
                <div className={`space-y-6 mx-auto w-full ${(activeTextbookMode === "pyq" || activeTextbookMode === "practice_overview") ? "max-w-none" : "max-w-4xl"}`}>
                  {/* Back Navigation header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <button
                      onClick={() => setActiveTextbookMode("none")}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition flex items-center gap-2"
                    >
                      ← Back to Chapters
                    </button>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{activeTextbookChapter?.name}</span>
                  </div>

                  {activeTextbookMode === "oneshot" && activeTextbookChapter && (
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="font-extrabold text-lg text-slate-800">One Shot Masterclass</h3>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">{activeTextbookChapter.name}</p>
                        </div>
                        <span className="text-[9px] bg-red-50 text-red-600 font-bold px-2.5 py-1 rounded-full uppercase">Video lecture</span>
                      </div>
                      
                      {/* Video Player Box: check for actual youtube link */}
                      {activeTextbookChapter.videoUrl ? (
                        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
                          <iframe
                            src={
                              activeTextbookChapter.videoUrl.includes("youtube.com") || activeTextbookChapter.videoUrl.includes("youtu.be")
                                ? `https://www.youtube.com/embed/${
                                    activeTextbookChapter.videoUrl.includes("v=") 
                                      ? activeTextbookChapter.videoUrl.split("v=")[1]?.split("&")[0] 
                                      : activeTextbookChapter.videoUrl.split("youtu.be/")[1]?.split("?")[0]
                                  }`
                                : activeTextbookChapter.videoUrl
                            }
                            title="YouTube video player"
                            className="absolute inset-0 w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>

                          {/* Subscription modal blur trigger */}
                          {(!trialStatus || new Date() > new Date(trialStatus.trialEndDate)) && !user?.subscriptions?.length && (
                            <div className="absolute inset-0 bg-slate-900/95 z-30 flex flex-col items-center justify-center p-6 text-center space-y-4">
                              <Lock className="h-10 w-10 text-amber-500" />
                              <h4 className="text-white font-bold text-sm">Upgrade to Premium to Watch</h4>
                              <p className="text-xs text-slate-400 max-w-xs">One Shot video lectures require an active paid membership subscription plan.</p>
                              <button onClick={() => alert("Please upgrade using pricing plan in side banner.")} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-xl text-xs shadow-md">
                                Unlock Full Syllabus
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative aspect-video bg-slate-950 rounded-3xl overflow-hidden flex items-center justify-center group shadow-inner">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 flex flex-col justify-end p-6 text-left">
                            <p className="text-sm text-white font-extrabold">{activeTextbookChapter.name} | Complete Chapter Revision</p>
                            <p className="text-xs text-slate-300 mt-1">Duration: {activeTextbookChapter.videoDuration || "1h 42m"} • Verified NCERT syllabus</p>
                          </div>
                          
                          <div className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 shadow-xl flex items-center justify-center cursor-pointer group-hover:scale-110 transition z-20">
                            <Play className="h-6 w-6 text-white fill-white ml-1" />
                          </div>

                          <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600')` }}></div>

                          {/* Subscription modal blur trigger */}
                          {(!trialStatus || new Date() > new Date(trialStatus.trialEndDate)) && !user?.subscriptions?.length && (
                            <div className="absolute inset-0 bg-slate-900/90 z-30 flex flex-col items-center justify-center p-6 text-center space-y-4">
                              <Lock className="h-10 w-10 text-amber-500" />
                              <h4 className="text-white font-bold text-sm">Upgrade to Premium to Watch</h4>
                              <p className="text-xs text-slate-400 max-w-xs">One Shot video lectures require an active paid membership subscription plan.</p>
                              <button onClick={() => alert("Please upgrade using pricing plan in side banner.")} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-xl text-xs shadow-md">
                                Unlock Full Syllabus
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-3">
                        <h4 className="font-bold text-sm text-slate-700">Course Syllabus Covered:</h4>
                        <ul className="text-xs text-slate-500 space-y-1.5 list-disc pl-4">
                          <li>Introduction & Core Formulas derivation</li>
                          <li>Step-by-step NCERT textbook numericals</li>
                          <li>JEE/NEET level previous year question shortcut tricks</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTextbookMode === "notes" && (
                    !selectedNote ? (
                      <div className="flex justify-center items-center py-20 bg-white border rounded-3xl">
                        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-100 rounded-3xl p-8 space-y-6 shadow-md relative">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                          <div>
                            <h2 className="text-lg font-extrabold text-slate-800">{selectedNote.title}</h2>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{selectedNote.estimatedReadTime || 5} mins read • Class Notes</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {selectedNote.pdfUrl && (
                              <a
                                href={selectedNote.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[10px] font-black transition flex items-center gap-1.5 border border-red-200"
                              >
                                📥 Download Notes PDF
                              </a>
                            )}
                            <button onClick={() => setFontSize(prev => Math.min(prev + 1, 24))} className="p-1.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50">A+</button>
                            <button onClick={() => setFontSize(prev => Math.max(prev - 1, 12))} className="p-1.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50">A-</button>
                          </div>
                        </div>
                        
                        <div style={{ fontSize: `${fontSize}px` }} className={`prose max-w-none text-slate-600 leading-relaxed whitespace-pre-line ${selectedNote.isLocked ? "blur-overlay" : ""}`}>
                          {selectedNote.content}
                        </div>

                        {selectedNote.isLocked && (
                          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-3xl">
                            <Lock className="h-10 w-10 text-amber-500" />
                            <h3 className="font-bold text-base">Premium Study Notes Locked</h3>
                            <p className="text-xs text-slate-500 max-w-sm">Upgrade to a premium subscription or wait for trial to read full guides.</p>
                          </div>
                        )}
                      </div>
                    )
                  )}

                  {/* PRACTICE MODULE: 1-by-1 quiz style */}
                  {activeTextbookMode === "practice" && (
                    topicQuestions.length > 0 && topicQuestions.length > currentQuestionIdx ? (
                      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
                        {/* Main Interactive Question Panel */}
                        <div className="flex-1 bg-white border border-slate-100 rounded-3xl p-8 shadow-md space-y-6 w-full">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-400 border-b border-slate-100 pb-4">
                            <span className="uppercase tracking-wide font-extrabold text-blue-600">📝 Practice Session</span>
                            <div className="flex items-center gap-4">
                              <span>QUESTION {currentQuestionIdx + 1} OF {topicQuestions.length}</span>
                              <span>⏱️ {timedSeconds}s</span>
                            </div>
                          </div>

                          <p className="text-sm font-bold text-slate-800 leading-relaxed">{topicQuestions[currentQuestionIdx].text}</p>

                          <div className="space-y-3">
                            {JSON.parse(topicQuestions[currentQuestionIdx].options).map((opt: string, idx: number) => {
                              let style = "border-slate-200 hover:border-slate-450";
                              if (selectedOptionIdx === idx) style = "border-blue-600 bg-blue-50/50";
                              if (checkedAnswer) {
                                  if (idx === checkedAnswer.correctOption) style = "border-teal-650 bg-teal-50 text-teal-800";
                                  else if (selectedOptionIdx === idx) style = "border-red-650 bg-red-50 text-red-800";
                              }
                              return (
                                <button
                                  key={idx}
                                  disabled={!!checkedAnswer}
                                  onClick={() => setSelectedOptionIdx(idx)}
                                  className={`w-full text-left p-3.5 border rounded-2xl text-xs font-semibold transition ${style}`}
                                >
                                  {String.fromCharCode(65 + idx)}. {opt}
                                </button>
                              );
                            })}
                          </div>

                          {checkedAnswer && (
                            <p className="text-xs text-slate-500 bg-slate-50 p-4 border rounded-xl leading-relaxed whitespace-pre-line">
                              <span className="font-bold">EXPLANATION:</span> {checkedAnswer.explanation}
                            </p>
                          )}

                          <div className="flex justify-between border-t border-slate-100 pt-4">
                            <button disabled={currentQuestionIdx === 0} onClick={() => { setCurrentQuestionIdx(currentQuestionIdx - 1); setCheckedAnswer(null); setSelectedOptionIdx(null); setTimedSeconds(0); }} className="px-4 py-2 border rounded-xl text-xs font-bold hover:bg-slate-50 transition">
                              Previous
                            </button>
                            {!checkedAnswer ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setCurrentQuestionIdx(currentQuestionIdx + 1);
                                    setCheckedAnswer(null);
                                    setSelectedOptionIdx(null);
                                    setTimedSeconds(0);
                                  }}
                                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-655 rounded-xl text-xs font-bold transition"
                                >
                                  Skip
                                </button>
                                <button onClick={handlePracticeAnswerSubmit} disabled={selectedOptionIdx === null} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition">
                                  Check
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => { setCurrentQuestionIdx(currentQuestionIdx + 1); setCheckedAnswer(null); setSelectedOptionIdx(null); setTimedSeconds(0); }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition">
                                Next
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Navigation Side Panel */}
                        <div className="w-full lg:w-72 bg-white border border-slate-100 rounded-3xl p-6 shadow-md space-y-5 shrink-0">
                          <div>
                            <h3 className="font-black text-xs text-slate-700 uppercase tracking-wider">🎯 Question Status</h3>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Quickly select or view solved question progress details.</p>
                          </div>

                          <div className="grid grid-cols-5 gap-2">
                            {topicQuestions.map((_, idx) => {
                              const qState = practiceSessionStates[idx] || "unseen";
                              let style = "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"; // default: seen but unanswered (gray)

                              if (currentQuestionIdx === idx) {
                                style = "bg-yellow-400 border-yellow-500 text-yellow-950 font-black ring-2 ring-yellow-250";
                              } else if (qState === "correct") {
                                style = "bg-emerald-500 border-emerald-600 text-white font-bold";
                              } else if (qState === "wrong") {
                                style = "bg-rose-500 border-rose-600 text-white font-bold";
                              } else if (qState === "unseen") {
                                style = "bg-blue-500 border-blue-600 text-white font-bold";
                              }

                              return (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setCurrentQuestionIdx(idx);
                                    setCheckedAnswer(null);
                                    setSelectedOptionIdx(null);
                                    setTimedSeconds(0);
                                  }}
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition border cursor-pointer ${style}`}
                                >
                                  {idx + 1}
                                </button>
                              );
                            })}
                          </div>

                          <div className="border-t border-slate-100 pt-4 space-y-2 text-[10px] font-bold text-slate-500">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-yellow-400 border border-yellow-500"></span> Current</span>
                              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-500 border border-blue-600"></span> Unseen</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500 border border-emerald-600"></span> Correct</span>
                              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500 border border-rose-600"></span> Incorrect</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200"></span> Seen (Unsolved)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 space-y-3 shadow-sm h-fit">
                        <CheckCircle className="h-12 w-12 text-teal-500 mx-auto" />
                        <h3 className="font-bold text-sm text-slate-700">Practice Completed!</h3>
                        <p className="text-xs max-w-xs mx-auto">Awesome job! You have completed all the practice questions for this chapter.</p>
                      </div>
                    )
                  )}

                  {/* PYQ MODULE: Overview list sorted year-wise with dropdown filters */}
                  {activeTextbookMode === "pyq" && (
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-md space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <span className="uppercase tracking-wide font-black text-xs text-orange-605">🏆 PYQ Board Archive</span>
                          <h2 className="text-lg font-extrabold text-slate-800 mt-0.5">{activeTextbookChapter?.name} Solved PYQs</h2>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Filter by Year:</label>
                          <select
                            value={studentPyqYearFilter}
                            onChange={(e) => setStudentPyqYearFilter(e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none text-slate-655 font-bold"
                          >
                            <option value="ALL">All PYQ Years</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                            <option value="2022">2022</option>
                            <option value="2021">2021</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-6 divide-y divide-slate-100">
                        {filteredStudentPyqs.map((q, idx) => {
                          const handleSelectQuestion = () => {
                            const qIdx = topicQuestions.findIndex(t => t.id === q.id);
                            if (qIdx !== -1) {
                              setCurrentQuestionIdx(qIdx);
                              setActiveTextbookMode("practice");
                              setCheckedAnswer(null);
                              setSelectedOptionIdx(null);
                              setTimedSeconds(0);
                            }
                          };

                          return (
                            <div
                              key={q.id}
                              onClick={handleSelectQuestion}
                              className="pt-6 first:pt-0 flex flex-col space-y-3 text-xs text-slate-700 cursor-pointer group hover:bg-blue-50/20 p-3.5 rounded-2xl transition border border-transparent hover:border-blue-100/50"
                            >
                              <div className="flex justify-between items-start gap-4 font-bold">
                                <div className="space-y-1 flex-1">
                                  <span className="text-orange-600 text-[10px] uppercase font-black tracking-wider block group-hover:text-blue-600 transition">
                                    Question #{idx + 1} • 🏆 PYQ ({q.pyqYear || "Board"}) • ⚡ Click to Solve
                                  </span>
                                  <p className="text-slate-800 leading-relaxed font-bold text-sm group-hover:text-slate-900 transition">{q.text}</p>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 font-bold text-[9px] uppercase tracking-wider group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-100 transition">
                                  {q.difficulty}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {filteredStudentPyqs.length === 0 && (
                          <p className="text-center text-slate-400 text-xs font-semibold py-12">No past year questions found for {activeTextbookChapter?.name} in {studentPyqYearFilter}.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PRACTICE OVERVIEW MODULE: List of all practice questions, arranged one below the other, clickable to solve */}
                  {activeTextbookMode === "practice_overview" && (
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-md space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <span className="uppercase tracking-wide font-black text-xs text-teal-605">📝 Practice Question Bank</span>
                          <h2 className="text-lg font-extrabold text-slate-800 mt-0.5">{activeTextbookChapter?.name} Practice List</h2>
                        </div>
                      </div>

                      <div className="space-y-6 divide-y divide-slate-100">
                        {topicQuestions.map((q, idx) => {
                          const handleSelectQuestion = () => {
                            setCurrentQuestionIdx(idx);
                            setActiveTextbookMode("practice");
                            setCheckedAnswer(null);
                            setSelectedOptionIdx(null);
                            setTimedSeconds(0);
                          };

                          return (
                            <div
                              key={q.id}
                              onClick={handleSelectQuestion}
                              className="pt-6 first:pt-0 flex flex-col space-y-3 text-xs text-slate-700 cursor-pointer group hover:bg-blue-50/20 p-3.5 rounded-2xl transition border border-transparent hover:border-blue-100/50"
                            >
                              <div className="flex justify-between items-start gap-4 font-bold">
                                <div className="space-y-1 flex-1">
                                  <span className="text-teal-600 text-[10px] uppercase font-black tracking-wider block group-hover:text-blue-600 transition">
                                    Question #{idx + 1} • {q.isPYQ ? `🏆 PYQ (${q.pyqYear})` : "📝 Practice"} • ⚡ Click to Solve
                                  </span>
                                  <p className="text-slate-800 leading-relaxed font-bold text-sm group-hover:text-slate-900 transition">{q.text}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-100 transition ${
                                  q.difficulty === 'HARD' ? 'bg-red-50 text-red-700 border border-red-100' :
                                  q.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                  'bg-teal-50 text-teal-700 border border-teal-100'
                                }`}>
                                  {q.difficulty}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {topicQuestions.length === 0 && (
                          <p className="text-center text-slate-400 text-xs font-semibold py-12">No practice questions found for {activeTextbookChapter?.name}.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeMenu === "settings" && user && (
            <div className="bg-white border border-slate-100 rounded-3xl p-8 max-w-xl mx-auto shadow-md space-y-6">
              <h2 className="text-xl font-bold">Account Profile Settings</h2>
              
              <div className="space-y-4 text-xs font-semibold text-slate-600">
                <div className="p-4 bg-slate-50 border rounded-2xl space-y-2">
                  <p><span className="text-slate-400">Student Name:</span> {user.name}</p>
                  <p><span className="text-slate-400">Registered Email:</span> {user.email || "N/A"}</p>
                  <p><span className="text-slate-400">Phone Number:</span> {user.phone}</p>
                  <p><span className="text-slate-400">Referral Code:</span> {user.referralCode}</p>
                </div>
                
                <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl flex items-center gap-3 text-orange-700">
                  <Flame className="h-5 w-5 fill-orange-500 text-orange-500" />
                  <div>
                    <p className="font-extrabold">Streak Rewards Activated</p>
                    <p className="text-[10px] text-orange-600">Check in daily inside dashboard page header tabs.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
