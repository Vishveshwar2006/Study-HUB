import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { 
  BookOpen, BrainCircuit, Sparkles, Send, 
  Award, Calendar, Megaphone, HelpCircle, 
  CheckCircle2, User, Loader2, ArrowRight,
  Save, Mail, Link, Lock, Shield, Receipt, MessageSquare, Camera, Upload,
  Menu, X, QrCode, Compass, Monitor, Check, FileText, Printer
} from "lucide-react";
import { Batch, Teacher, Student, Lesson, Test, Announcement, ChatMessage, FeeInvoice, SupportMessage, ComputerDesk, TestSubmission, AttendanceRecord } from "../types";
import ReactMarkdown from "react-markdown";
import StudentQRCard from "./StudentQRCard";

interface StudentDashboardProps {
  batches: Batch[];
  teachers: Teacher[];
  students: Student[];
  lessons: Lesson[];
  tests: Test[];
  announcements: Announcement[];
  fees: FeeInvoice[];
  supportMessages?: SupportMessage[];
  subjects?: string[];
  onSendSupportMessage?: (content: string, studentId: string) => void;
  loggedInStudentId?: string;
  onUpdateStudentProfile?: (id: string, name: string, email: string, avatar: string) => void;
  onUpdateStudentFormDetails?: (id: string, details: any) => void;
  computerDesks?: ComputerDesk[];
  testSubmissions?: TestSubmission[];
  onAddTestSubmission?: (submission: TestSubmission) => void;
  isNoticeboardAdminOnly?: boolean;
  attendanceRecords?: AttendanceRecord[];
  initialTab?: "syllabus" | "report-card" | "announcements" | "profile" | "fees" | "support" | "card" | "explore" | "attendance" | "apaar-form" | "online-tests";
  onUpdateFeeStatus?: (id: string, status: "Paid" | "Unpaid") => void;
  activeTab?: "syllabus" | "report-card" | "announcements" | "profile" | "fees" | "support" | "card" | "explore" | "attendance" | "apaar-form" | "online-tests";
  setActiveTab?: (tab: "syllabus" | "report-card" | "announcements" | "profile" | "fees" | "support" | "card" | "explore" | "attendance" | "apaar-form" | "online-tests") => void;
  hideSidebarOnDesktop?: boolean;
}

export default function StudentDashboard({
  batches,
  teachers,
  students,
  lessons,
  tests,
  announcements,
  fees,
  supportMessages = [],
  subjects = [],
  onSendSupportMessage,
  loggedInStudentId,
  onUpdateStudentProfile,
  onUpdateStudentFormDetails,
  computerDesks = [],
  testSubmissions = [],
  onAddTestSubmission,
  isNoticeboardAdminOnly = false,
  attendanceRecords = [],
  initialTab,
  onUpdateFeeStatus,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  hideSidebarOnDesktop = false
}: StudentDashboardProps) {
  // Active student state for the demo
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    loggedInStudentId || students[0]?.id || "s_1"
  );

  useEffect(() => {
    if (loggedInStudentId) {
      setSelectedStudentId(loggedInStudentId);
    }
  }, [loggedInStudentId]);

  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [localActiveTab, setLocalActiveTab] = useState<"syllabus" | "report-card" | "announcements" | "profile" | "fees" | "support" | "card" | "explore" | "attendance" | "apaar-form" | "online-tests">((initialTab as any) || "syllabus");
  const activeTab = propActiveTab || localActiveTab;
  const setActiveTab = propSetActiveTab || (setLocalActiveTab as any);

  useEffect(() => {
    if (isNoticeboardAdminOnly && activeTab === "announcements") {
      setActiveTab("syllabus");
    }
  }, [isNoticeboardAdminOnly, activeTab]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [printingInvoice, setPrintingInvoice] = useState<FeeInvoice | null>(null);

  // Fee Online Payment States
  const [isPayingOnline, setIsPayingOnline] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "netbanking" | "card">("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [selectedViewSubmissionId, setSelectedViewSubmissionId] = useState<string | null>(null);

  // Profile Form States
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // APAAR Card Form states
  const [apaarSerial, setApaarSerial] = useState("");
  const [apaarId, setApaarId] = useState("");
  const [apaarPen, setApaarPen] = useState("");
  const [apaarName, setApaarName] = useState("");
  const [apaarFatherName, setApaarFatherName] = useState("");
  const [apaarMotherName, setApaarMotherName] = useState("");
  const [apaarDob, setApaarDob] = useState("");
  const [apaarScholar, setApaarScholar] = useState("");
  const [apaarSsm, setApaarSsm] = useState("");
  const [apaarSuccessMsg, setApaarSuccessMsg] = useState("");
  const [ledgerSearch, setLedgerSearch ] = useState("");

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Online Quiz taking states
  const [activeQuizToTake, setActiveQuizToTake] = useState<Test | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: string }>({});
  const [dismissedLiveAlerts, setDismissedLiveAlerts] = useState<{ [testId: string]: boolean }>({});
  const [unlockingTestId, setUnlockingTestId] = useState<string | null>(null);
  const [examKeyInput, setExamKeyInput] = useState("");

  const handleSubmitQuiz = () => {
    if (!activeQuizToTake) return;
    
    let calculatedScore = 0;
    const questionsList = activeQuizToTake.questions || [];
    
    questionsList.forEach(q => {
      const studentAns = (quizAnswers[q.id] || "").trim().toLowerCase();
      const correctAns = (q.correctAnswer || "").trim().toLowerCase();
      
      if (q.type === "MCQ" || q.type === "True/False") {
        if (studentAns === correctAns) {
          calculatedScore += q.markWeight || 0;
        }
      } else {
        // Written short answer: give points if there's partial keyword match
        if (correctAns) {
          const keywords = correctAns.split(/\s+/).filter(kw => kw.length > 2);
          const hasKeyword = keywords.length > 0 
            ? keywords.some(kw => studentAns.includes(kw))
            : true;
          if (hasKeyword || studentAns === correctAns) {
            calculatedScore += q.markWeight || 0;
          }
        } else {
          if (studentAns.length > 0) {
            calculatedScore += q.markWeight || 0;
          }
        }
      }
    });

    if (onAddTestSubmission) {
      const submission: TestSubmission = {
        id: "sub_" + Date.now(),
        testId: activeQuizToTake.id,
        studentId: activeStudent.id,
        answers: quizAnswers,
        score: calculatedScore,
        submittedAt: new Date().toISOString()
      };
      onAddTestSubmission(submission);
    }

    alert(`🎉 Exam paper submitted successfully!\n\nYou scored ${calculatedScore} / ${activeQuizToTake.maxMarks} on the instant check.\nYour digital response sheet has been safely logged with your batch supervisor.`);
    setActiveQuizToTake(null);
    setQuizAnswers({});
  };

  const activeStudent = students.find(s => s.id === selectedStudentId) || students[0];

  useEffect(() => {
    if (activeStudent) {
      setProfileName(activeStudent.name || "");
      setProfileEmail(activeStudent.email || "");
      setProfileAvatar(activeStudent.avatar || "");
      setProfileSuccessMsg("");
      setApaarSerial(activeStudent.serialNumber || "");
      setApaarId(activeStudent.apparId || "");
      setApaarPen(activeStudent.penNumber || "");
      setApaarName(activeStudent.name || "");
      setApaarFatherName(activeStudent.fatherName || "");
      setApaarMotherName(activeStudent.motherName || "");
      setApaarDob(activeStudent.dob || "");
      setApaarScholar(activeStudent.scholarNumber || "");
      setApaarSsm(activeStudent.ssmId || "");
      setApaarSuccessMsg("");
    }
  }, [selectedStudentId, activeStudent]);
  const studentBatches = batches.filter(b => b.studentIds.includes(activeStudent.id));

  // Current selected batch
  const currentBatchId = selectedBatchId || studentBatches[0]?.id || "";
  const currentBatch = studentBatches.find(b => b.id === currentBatchId);

  // Lessons list filtered for current batch that are Published or Completed
  const currentBatchLessons = lessons.filter(l => 
    l.batchId === currentBatchId && (l.status === "Published" || l.status === "Completed")
  );

  // Lesson body focus
  const activeLessonId = selectedLessonId || currentBatchLessons[0]?.id || "";
  const activeLesson = currentBatchLessons.find(l => l.id === activeLessonId);

  // Tests score list
  const studentTests = tests.filter(t => t.batchId === currentBatchId && t.isAdminApproved === true);

  // Active unsubmitted secure exam waiting to be taken by student
  const activeUnsubmittedLiveTest = studentTests.find(t => 
    t.isLive && 
    t.questions && 
    t.questions.length > 0 && 
    !dismissedLiveAlerts[t.id] &&
    !(testSubmissions || []).some(sub => sub.testId === t.id && sub.studentId === activeStudent.id)
  );

  // Announcements list (Global Admin notices + specific Batch notices)
  const studentAnnouncements = announcements.filter(a => 
    a.batchId === "all" || studentBatches.some(b => b.id === a.batchId)
  );

  // Reset lesson and chat selections whenever the student profile or batch changes
  useEffect(() => {
    if (currentBatchLessons[0]) {
      setSelectedLessonId(currentBatchLessons[0].id);
    } else {
      setSelectedLessonId("");
    }
    setChatMessages([
      {
        id: "msg_init",
        role: "model",
        content: `Hi ${activeStudent.name}! I am your AI Master Coach today. Ask me any questions you have about our lesson concepts!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [selectedStudentId, currentBatchId]);

  // Scroll to bottom of chat
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Call Back-end AI Chat Tutor
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isSendingMessage || !activeLesson) return;

    const userMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      role: "user",
      content: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setUserInput("");
    setIsSendingMessage(true);

    // Provide context to prompt
    const nextThread = [...chatMessages, userMsg].slice(-8); // send last 8 messages for context

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextThread.map(m => ({ role: m.role, content: m.content })),
          lessonTitle: activeLesson.title,
          subjectName: currentBatch?.subject || "general syllabus"
        })
      });

      const data = await res.json();
      if (res.ok) {
        setChatMessages(prev => [...prev, {
          id: "msg_reply_" + Date.now(),
          role: "model",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        setChatMessages(prev => [...prev, {
          id: "msg_err_" + Date.now(),
          role: "model",
          content: "Sorry, I lost connection to the server. Could you please ask that again?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, {
        id: "msg_err_sys_" + Date.now(),
        role: "model",
        content: "API proxy timeout, please check your network connection.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const getMenuBtnStyle = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all duration-200 shrink-0 whitespace-nowrap cursor-pointer border ${
      isActive
        ? "bg-red-600 border-red-600 text-white shadow-xs hover:bg-black hover:border-black hover:text-white"
        : "bg-white border-slate-200 text-slate-800 hover:bg-black hover:border-black hover:text-white"
    }`;
  };

  return (
    <div className="space-y-6">
      
      {/* Student Profile Switcher header for Demo Interaction */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-indigo-400 border border-slate-705 flex items-center justify-center font-mono text-sm font-extrabold uppercase shrink-0">
            {activeStudent.name ? activeStudent.name.substring(0, 2) : "ST"}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.2 py-0.5 bg-indigo-500 text-gold font-bold rounded uppercase">
                Student Portal
              </span>
              <h4 className="font-bold text-sm">{activeStudent.name}</h4>
            </div>
            <p className="text-xs text-indigo-300 mt-1">Roll No: {activeStudent.rollNo}</p>
          </div>
        </div>

        {!loggedInStudentId ? (
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <span className="text-xs text-slate-400 shrink-0">Switch Student View:</span>
            <select
              value={selectedStudentId}
              onChange={e => {
                setSelectedStudentId(e.target.value);
                // reset selected batch for the new student
                const nextStudentBatches = batches.filter(b => b.studentIds.includes(e.target.value));
                setSelectedBatchId(nextStudentBatches[0]?.id || "");
              }}
              className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-400 text-slate-100 w-full sm:w-auto"
              id="student-profile-switch"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-xs text-emerald-400 font-bold bg-emerald-950/50 px-3.5 py-1.5 rounded-xl border border-emerald-900/40">
            ✓ Logged In Secure Session
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Hamburger Mobile Menu bar */}
        <div className={`${hideSidebarOnDesktop ? "hidden" : "lg:hidden col-span-1"} flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-xs no-print`}>
          <div className="flex items-center space-x-2">
            <Menu className="w-4 h-4 text-indigo-505 text-indigo-500" />
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider animate-fadeIn">
              Section: {activeTab}
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/50 text-xs font-bold uppercase text-indigo-600 cursor-pointer hover:bg-black hover:text-white transition-all animate-fadeIn"
          >
            {isMobileMenuOpen ? (
              <>
                <X className="w-3.5 h-3.5 text-rose-500" />
                <span>Close</span>
              </>
            ) : (
              <>
                <span className="inline-block text-[11px] leading-none mb-0.5 font-bold animate-pulse">☰</span>
                <span>Menu</span>
              </>
            )}
          </button>
        </div>

        {/* Section: Batch selector and Sub navigation (Standard Left Sidebar layout) */}
        <div className={`${hideSidebarOnDesktop ? "hidden" : "lg:col-span-3"} space-y-4 no-print lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto no-scrollbar`}>
          {studentBatches.length > 0 ? (
            <div className={`bg-slate-50 p-4 lg:p-5 rounded-2xl border border-slate-250 shadow-sm ${
              isMobileMenuOpen ? "block" : "hidden lg:block"
            }`}>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                Your Academic Batches ({studentBatches.length})
              </label>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-1 lg:pb-0">
                {studentBatches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBatchId(b.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-left p-3 lg:p-4 rounded-xl border transition-all shrink-0 w-52 lg:w-full cursor-pointer font-bold uppercase tracking-wider ${
                      currentBatchId === b.id 
                        ? "bg-red-600 border-red-600 text-white shadow-xs hover:bg-black hover:border-black hover:text-white" 
                        : "bg-white border-slate-200 text-slate-800 hover:bg-black hover:border-black hover:text-white"
                    }`}
                  >
                    <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded transition-all ${
                      currentBatchId === b.id ? "bg-white text-red-650" : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {b.code}
                    </span>
                    <h5 className="font-extrabold text-slate-850 text-sm mt-1.5 truncate">{b.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{b.subject}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={`bg-slate-50 p-4 rounded-2xl border border-slate-250 shadow-sm text-center ${
              isMobileMenuOpen ? "block" : "hidden lg:block"
            }`}>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Not enrolled in any live batches yet.</p>
            </div>
          )}

          <div className={`bg-slate-50 p-3 lg:p-4 rounded-2xl border border-slate-250 shadow-sm ${
            isMobileMenuOpen ? "flex flex-col animate-fadeIn" : "hidden lg:flex lg:flex-col"
          } gap-1.5`}>
            <button
              onClick={() => {
                setActiveTab("syllabus");
                setIsMobileMenuOpen(false);
              }}
              className={getMenuBtnStyle("syllabus")}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lessons & AI Help</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("report-card");
                setIsMobileMenuOpen(false);
              }}
              className={getMenuBtnStyle("report-card")}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Marks & Performance</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("online-tests" as any);
                setIsMobileMenuOpen(false);
              }}
              className={getMenuBtnStyle("online-tests")}
              id="student-tab-online-tests"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Online Exams & Tests</span>
            </button>
            {!isNoticeboardAdminOnly && (
              <button
                onClick={() => {
                  setActiveTab("announcements");
                  setIsMobileMenuOpen(false);
                }}
                className={getMenuBtnStyle("announcements")}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Notice Bulletin ({studentAnnouncements.length})</span>
              </button>
            )}
          </div>

          {/* NEW Portal Side Section */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-4 font-sans relative overflow-hidden">
            {/* Subtle decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl" />
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span>Scholar Portal Hud</span>
              </span>
              <span className="text-[9px] bg-indigo-900/50 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded-md">
                Online
              </span>
            </div>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400">Roll Registry:</span>
                <span className="font-bold text-slate-200">{activeStudent.rollNo}</span>
              </div>
              
              <span className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400">AI Tutor Stream:</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-400 font-bold text-[9px] uppercase flex items-center space-x-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  <span>Ready</span>
                </span>
              </span>

              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-400">Class Batch:</span>
                <span className="font-mono text-[10px] text-indigo-300 font-bold truncate max-w-[100px]">
                  {currentBatch?.code || "Unenrolled"}
                </span>
              </div>
            </div>

            <div className="pt-1.5">
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                ⚡ View homework practice modules, test performance metrics sheets, and consult our live AI tutor desk instantly.
              </p>
            </div>
          </div>

          {/* STUDENT CO-SECURITY SOS BEACON BUTTON */}
          <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-left space-y-3">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="block text-[8px] font-mono tracking-widest font-black uppercase text-red-650">Student SOS Overrides</span>
            </div>

            <h5 className="text-[11px] font-extrabold text-slate-800 uppercase font-sans">Classroom Safety Panic</h5>
            <p className="text-[9.5px] text-slate-500 leading-normal font-sans">
              For immediate physical medical emergencies, lab hazards, or safety distress concerns during live lectures, notify administrators instantly:
            </p>

            <button
              onClick={() => {
                const location = prompt("Specify your current seat / room location:", "Computer Lab Seat 14");
                if (location === null) return;
                const details = prompt("Describe the emergency (e.g., sudden medical discomfort or electrical sparking near desk):");
                if (!details) return;

                const alertItem = {
                  senderName: activeStudent.name,
                  senderRole: "Student",
                  senderId: selectedStudentId,
                  severity: "High",
                  type: "Medical Emergency",
                  location: location,
                  details: details
                };

                const savedAlerts = localStorage.getItem("co_security_alerts");
                const currentList = savedAlerts ? JSON.parse(savedAlerts) : [];
                const nextItem = {
                  ...alertItem,
                  id: "sec_alert_" + Date.now(),
                  timestamp: new Date().toISOString(),
                  resolved: false
                };
                localStorage.setItem("co_security_alerts", JSON.stringify([nextItem, ...currentList]));
                window.dispatchEvent(new Event("storage"));

                alert("SAFETY distress beacon broadcasted immediately! Campus response desk alerted.");
                window.location.reload();
              }}
              className="w-full py-2 bg-red-650 hover:bg-red-750 text-white text-[9.5px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition-all shadow"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>TRANSMIT PANIC ALARM</span>
            </button>
          </div>

        </div>

        {/* Section: Main display area */}
        <div className={`${hideSidebarOnDesktop ? "lg:col-span-12" : "lg:col-span-9"} space-y-6`}>

          {activeTab !== "profile" && activeTab !== "fees" && activeTab !== "support" && studentBatches.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h4 className="font-bold text-slate-700">No Enrolled Classes</h4>
              <p className="text-xs text-slate-400 mt-1">Please contact Registrar to enroll {activeStudent.name} into active academic course sections.</p>
            </div>
          ) : (
            <>
            
            {/* 1. SYLLABUS LESSONS DISPLAY */}
            {activeTab === "syllabus" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Lessons navigation list */}
                <div className="md:col-span-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Published Syllabus</h4>
                  {currentBatchLessons.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No notes released yet for this batch.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {currentBatchLessons.map(lesson => (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLessonId(lesson.id)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-colors flex flex-col justify-start ${
                            activeLessonId === lesson.id 
                              ? "bg-slate-900 text-white border-slate-900" 
                              : "bg-slate-50 hover:bg-slate-100 border-slate-100"
                          }`}
                        >
                          <span className="font-bold line-clamp-1">{lesson.title}</span>
                          <span className={`text-[9px] mt-1 uppercase font-bold tracking-wider ${
                            activeLessonId === lesson.id ? "text-indigo-300" : "text-indigo-600"
                          }`}>
                            {lesson.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Focus Lesson Content & Chat side */}
                <div className="md:col-span-8 space-y-6">
                  {!activeLesson ? (
                    <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center">
                      <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 font-medium">Please select a lesson on the sidebar.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      
                      {/* Markdown Lesson Content Cards */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Lesson Resource Note</span>
                            <h3 className="font-bold text-slate-800 text-base mt-1">{activeLesson.title}</h3>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">{activeLesson.date}</span>
                        </div>

                        <div className="markdown-body prose max-w-none text-slate-600 text-xs leading-relaxed space-y-3 max-h-96 overflow-y-auto pr-2">
                          <ReactMarkdown>{activeLesson.content}</ReactMarkdown>
                        </div>
                      </div>

                      {/* AI Master Coach Tutor chatbot integration */}
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden h-[420px]">
                        
                        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <BrainCircuit className="text-indigo-400 w-4 h-4 animate-pulse" />
                            <div>
                              <h4 className="text-xs font-bold tracking-wide">Interactive AI Coach Guidance</h4>
                              <p className="text-[9px] text-indigo-300">Topic context: {activeLesson.title}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold tracking-widest bg-indigo-600 text-white px-2 py-0.5 rounded font-mono uppercase">
                            ONLINE
                          </span>
                        </div>

                        {/* Message threads display */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-3 scroll-smooth bg-slate-50/50">
                          {chatMessages.map((msg) => (
                            <div 
                              key={msg.id} 
                              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div className={`max-w-[85%] rounded-2xl p-3 shadow-xs space-y-1 ${
                                msg.role === "user" 
                                  ? "bg-indigo-600 text-white rounded-tr-none" 
                                  : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                              }`}>
                                <div className="text-xs leading-relaxed break-words whitespace-pre-wrap markdown-body">
                                  {msg.role === "model" ? (
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                  ) : (
                                    <span>{msg.content}</span>
                                  )}
                                </div>
                                <span className={`text-[8px] block text-right ${
                                  msg.role === "user" ? "text-indigo-200" : "text-slate-400"
                                }`}>
                                  {msg.timestamp}
                                </span>
                              </div>
                            </div>
                          ))}
                          {isSendingMessage && (
                            <div className="flex justify-start">
                              <div className="bg-white border border-slate-150 p-3 rounded-2xl rounded-tl-none text-slate-500 text-xs flex items-center space-x-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                                <span className="font-semibold text-[10px]">Tutor is writing explanations...</span>
                              </div>
                            </div>
                          )}
                          <div ref={scrollRef} />
                        </div>

                        {/* Input submit bar */}
                        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex items-center space-x-2 bg-white">
                          <input 
                            type="text" 
                            placeholder={`Ask AI Study Assistant about academic core courses, calculus, logic proofs...`}
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            disabled={isSendingMessage}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-400 text-slate-800"
                          />
                          <button
                            type="submit"
                            disabled={isSendingMessage || !userInput.trim()}
                            className="bg-indigo-600 inline-flex items-center justify-center text-white w-9 h-9 rounded-xl hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors shrink-0"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </form>
                      </div>

                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ONLINE EXAMS AND TESTS TAB */}
            {activeTab === "online-tests" && (
              <div className="space-y-6">
                <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-red-600 rounded-xl">
                      <Shield className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-red-400">Secure Examination & Evaluation Terminal</h4>
                      <p className="text-[11px] text-zinc-300 mt-0.5">Please check your allotted workstation, listen for teacher announcements, and keep your exam keys ready.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentTests.filter(t => t.questions && t.questions.length > 0).length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xs text-center col-span-2">
                       <p className="text-xs text-slate-400 italic">No online mock tests or interactive board examinations allotted for your batch at this moment.</p>
                    </div>
                  ) : (
                    studentTests.filter(t => t.questions && t.questions.length > 0).map(testObj => {
                      const previousSubmission = (testSubmissions || []).find(sub => sub.testId === testObj.id && sub.studentId === activeStudent.id);
                      const isUnlockingThis = unlockingTestId === testObj.id;
                      
                      return (
                        <div key={testObj.id} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 text-left">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[9px] bg-indigo-50 text-indigo-750 font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                                {testObj.subject || "General"}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">{testObj.questions?.length || 0} Questions</span>
                            </div>

                            <h5 className="font-extrabold text-slate-900 text-xs leading-snug">{testObj.title}</h5>
                            <div className="flex flex-col gap-1 mt-1 text-[10px] text-slate-400 font-medium">
                              <span>Date Allotted: {testObj.date}</span>
                              <span>Total Score Credit: {testObj.maxMarks} Marks</span>
                            </div>

                            {/* Show lock status */}
                            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 font-bold">Exam Lock Verification:</span>
                              {testObj.examKey ? (
                                <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[9px] inline-flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5 text-rose-500" /> Key Protected
                                </span>
                              ) : (
                                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[9px]">
                                  Public Access
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100">
                            {previousSubmission ? (
                              <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-3 text-emerald-800 text-xs space-y-1">
                                <div className="flex justify-between font-extrabold">
                                  <span>✓ Completed and Logged</span>
                                  {previousSubmission.score !== undefined && testObj.isResultsPublished ? (
                                    <span>Score: {previousSubmission.score} / {testObj.maxMarks}</span>
                                  ) : (
                                    <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[9px] uppercase">Under Evaluation</span>
                                  )}
                                </div>
                                <p className="text-[10px] text-emerald-600/90 font-mono">Logged: {new Date(previousSubmission.submittedAt).toLocaleDateString()} {new Date(previousSubmission.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                              </div>
                            ) : isUnlockingThis ? (
                              <div className="bg-indigo-50/50 border border-indigo-150 p-4 rounded-xl space-y-3.5">
                                <p className="text-[10px] font-bold text-slate-600 leading-relaxed">
                                  🔑 Enter the <strong>SECRET EXAM KEY</strong> provided by your teacher to unlock this secure exam paper.
                                </p>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="e.g. EXAM-CHEM-101"
                                    value={examKeyInput}
                                    onChange={e => setExamKeyInput(e.target.value)}
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono uppercase text-slate-805 focus:outline-indigo-500 font-extrabold"
                                  />
                                  <button
                                    onClick={() => {
                                      const entered = examKeyInput.trim();
                                      const actual = (testObj.examKey || "").trim();
                                      if (entered.toLowerCase() === actual.toLowerCase()) {
                                        // Key match! Check secure seat allotment
                                        if (testObj.requireLabAllotment && !activeStudent.assignedComputerDeskCode) {
                                          alert(`🔒 COMPUTER LAB ALLOTMENT REQUIRED:\n\nThis exam is configured as a SECURE COMPUTER LAB exam.\n\nTo unlock your terminal:\n1. Report to your Batch Instructor/Supervisor to verify your identity.\n2. State your Name (${activeStudent.name}) and Roll Number (${activeStudent.rollNo}).\n3. Once verified, the teacher will allot your Lab Computer seat.\n4. After seat commitment, you can instantly start the exam.`);
                                          return;
                                        }
                                        setActiveQuizToTake(testObj);
                                        setQuizAnswers({});
                                        setUnlockingTestId(null);
                                        setExamKeyInput("");
                                      } else {
                                        alert("❌ INCORRECT EXAM KEY!\nPlease check with your class teacher/invigilator for the correct code.");
                                      }
                                    }}
                                    className="bg-indigo-600 hover:bg-black text-white px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase duration-150 cursor-pointer"
                                  >
                                    Verify
                                  </button>
                                </div>
                                <button
                                  onClick={() => {
                                    setUnlockingTestId(null);
                                    setExamKeyInput("");
                                  }}
                                  className="text-[10px] text-slate-500 font-bold underline hover:text-slate-800"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  // Check if test has an exam key
                                  if (testObj.examKey) {
                                    setUnlockingTestId(testObj.id);
                                    setExamKeyInput("");
                                  } else {
                                    // Start quiz immediately if no examKey required (public / practice)
                                    if (testObj.requireLabAllotment && !activeStudent.assignedComputerDeskCode) {
                                      alert(`🔒 COMPUTER LAB ALLOTMENT REQUIRED:\n\nThis exam is configured as a SECURE COMPUTER LAB exam.\n\nTo unlock your terminal:\n1. Report to your Batch Instructor/Supervisor to verify your identity.\n2. State your Name (${activeStudent.name}) and Roll Number (${activeStudent.rollNo}).\n3. Once verified, the teacher will allot your Lab Computer seat.\n4. After seat commitment, you can instantly start the exam.`);
                                      return;
                                    }
                                    setActiveQuizToTake(testObj);
                                    setQuizAnswers({});
                                  }
                                }}
                                className="w-full bg-red-650 hover:bg-black text-white font-extrabold font-mono text-[10px] uppercase tracking-widest py-2.5 rounded-xl duration-200 cursor-pointer text-center inline-flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <span>✍ Start Online Test</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* 2. REPORT DETAILS CARDS */}
            {activeTab === "report-card" && (
              <div className="space-y-6">

                {/* Secure Exams & Quizzes launcher dashboard card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left">
                  <div className="flex items-center space-x-2.5 mb-4 border-b border-slate-100 pb-3">
                    <Monitor className="w-5 h-5 text-indigo-600 animate-pulse" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Active Computer Lab Examinations</h4>
                      <p className="text-[10px] text-slate-400">Live invigilated examinations requiring identity verification & locked supervisor seat codes.</p>
                    </div>
                  </div>

                  {studentTests.filter(t => t.questions && t.questions.length > 0).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No interactive secure examinations compiled for this academic cohort yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studentTests.filter(t => t.questions && t.questions.length > 0).map(quizObj => {
                        const previousSubmission = (testSubmissions || []).find(sub => sub.testId === quizObj.id && sub.studentId === activeStudent.id);
                        const isSecure = quizObj.isLive;
                        
                        return (
                          <div key={quizObj.id} className="border border-slate-150 rounded-xl p-4.5 bg-slate-50/50 flex flex-col justify-between space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                {isSecure ? (
                                  <span className="bg-rose-100 text-rose-800 text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono inline-flex items-center space-x-1">
                                    <Shield className="w-2.5 h-2.5 text-rose-600" />
                                    <span>Secure Seat Locked</span>
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-700 text-[9px] font-bold uppercase px-2 py-0.5 rounded font-mono">
                                    Practice Quiz
                                  </span>
                                )}
                                <span className="font-mono text-[10px] text-slate-400">{quizObj.questions?.length} Questions</span>
                              </div>
                              <h5 className="font-extrabold text-slate-800 text-xs">{quizObj.title}</h5>
                              <p className="text-[10px] text-slate-400 mt-1">Weight: {quizObj.maxMarks} Marks</p>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              {previousSubmission ? (
                                <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg font-extrabold text-[10px] inline-flex items-center space-x-1 font-mono w-full justify-between">
                                  <span>✓ Answered Score:</span>
                                  <span>{previousSubmission.score} / {quizObj.maxMarks} Marks</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isSecure && !activeStudent.assignedComputerDeskCode) {
                                      alert(`🔒 SECURITY ENFORCEMENT SHIELD:\n\nThis exam is configured as a SECURE LIVE desk-bound exam.\n\nTo unlock your terminal browser:\n1. Report to your Batch Teacher/Supervisor at the entrance.\n2. State your Name (${activeStudent.name}) and Roll Number (${activeStudent.rollNo}).\n3. The supervisor will check your identity card and click "Verify & Allot Desk".\n4. Once alloted, your supervisor code will unlock this form automatically.`);
                                      return;
                                    }
                                    // Start taking quiz
                                    setActiveQuizToTake(quizObj);
                                    setQuizAnswers({});
                                  }}
                                  className="w-full bg-indigo-650 hover:bg-slate-900 text-white font-extrabold font-mono text-[10px] uppercase tracking-wider py-2 rounded-lg duration-200 cursor-pointer text-center"
                                >
                                  ✍ Start Laboratory Exam
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-4">Academic Results Diagnostic Card</h4>
                  
                  {studentTests.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No assessments records matching your active batch found.</p>
                  ) : (
                    <div className="space-y-4">
                      {studentTests.map(testObj => {
                        const score = testObj.scores[activeStudent.id];
                        const percentage = score !== undefined ? ((score / testObj.maxMarks) * 100).toFixed(0) : null;
                        const isHigh = score !== undefined && (score / testObj.maxMarks) >= 0.8;
                        const isMid = score !== undefined && (score / testObj.maxMarks) >= 0.5 && (score / testObj.maxMarks) < 0.8;

                        // Check if they have a real submission and if it is published
                        const submissionObj = (testSubmissions || []).find(sub => sub.testId === testObj.id && sub.studentId === activeStudent.id);
                        const isPublishedSub = submissionObj && submissionObj.isPublished;

                        return (
                          <div key={testObj.id} className="border border-slate-100 rounded-xl p-5 hover:bg-slate-50/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="text-left">
                              <div className="flex items-center space-x-2">
                                <h5 className="font-bold text-slate-800 text-sm">{testObj.title}</h5>
                                {testObj.subject && (
                                  <span className="text-[9px] bg-red-100 text-red-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                                    {testObj.subject}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono block tracking-wider mt-1">{testObj.date}</span>
                              
                              {/* Display review button if evaluation is published */}
                              {isPublishedSub && (
                                <button
                                  onClick={() => setSelectedViewSubmissionId(submissionObj.id)}
                                  className="mt-3 bg-red-605 hover:bg-black text-white hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest cursor-pointer transition-all border border-red-605 hover:border-black inline-flex items-center space-x-1"
                                >
                                  <span>👁 Check Verified Result</span>
                                </button>
                              )}
                            </div>

                            <div className="flex items-center space-x-6 shrink-0 w-full md:w-auto justify-between md:justify-end">
                              <div className="text-right">
                                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold block">Obtained Status</span>
                                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded mt-1 inline-block ${
                                  isHigh ? "bg-emerald-50 text-emerald-700" : isMid ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                                }`}>
                                  {isHigh ? "Mastered" : isMid ? "Progressing" : "Requires Attention"}
                                </span>
                              </div>
                              <div className="text-right bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/50">
                                <p className="text-lg font-black text-slate-900 font-mono">
                                  {score !== undefined ? `${score}` : "N/A"} 
                                  <span className="text-xs text-slate-400 font-normal"> / {testObj.maxMarks}</span>
                                </p>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">{percentage || 0}% Score</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* MODAL / PANEL FOR REVIEWING TEST ANSWERS & COMMENTS */}
                {selectedViewSubmissionId && (() => {
                  const subObj = (testSubmissions || []).find(s => s.id === selectedViewSubmissionId);
                  const relatedTestObj = studentTests.find(t => t.id === subObj?.testId);
                  if (!subObj || !relatedTestObj) return null;

                  return (
                    <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl space-y-5 text-left animate-fadeIn">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-805">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest font-black text-red-400">Verified Academic Score Sheet</span>
                          <h5 className="text-sm font-extrabold text-slate-100 truncate mt-0.5">{relatedTestObj.title}</h5>
                          {relatedTestObj.subject && (
                            <span className="mt-1 inline-block text-[9px] bg-red-950 border border-red-500/20 text-red-300 font-extrabold px-2 py-0.5 rounded-full uppercase">
                              {relatedTestObj.subject}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedViewSubmissionId(null)}
                          className="text-xs bg-slate-800 hover:bg-black text-slate-300 hover:text-white font-extrabold px-3 py-1.5 rounded-lg border border-slate-700 transition-all duration-200 cursor-pointer"
                        >
                          Close Score Sheet
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="bg-slate-955 p-3 rounded-xl border border-slate-850">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total Marks Score</span>
                          <p className="text-lg font-black font-mono text-rose-455 mt-1">
                            {subObj.score} / {relatedTestObj.maxMarks} Marks
                          </p>
                        </div>
                        <div className="bg-slate-955 p-3 rounded-xl border border-slate-850">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Submitted Date</span>
                          <p className="text-xs font-bold font-mono text-slate-200 mt-2">
                            {new Date(subObj.submittedAt).toLocaleDateString()} at {new Date(subObj.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>

                      {/* Instructor feedback advisory summary */}
                      {subObj.feedback ? (
                        <div className="bg-gradient-to-tr from-slate-950 to-red-950/20 p-4 rounded-xl border border-red-900/10">
                          <span className="text-[9px] text-red-405 font-black uppercase tracking-widest block font-mono">Supervisor Review Notes</span>
                          <p className="text-xs text-slate-200 mt-2 leading-relaxed italic">
                            "{subObj.feedback}"
                          </p>
                        </div>
                      ) : null}

                      {/* Questions breakdown */}
                      <div className="space-y-3.5">
                        <h6 className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Graded Answers Response Log</h6>
                        {relatedTestObj.questions?.map((q, qIdx) => {
                          const studAns = subObj.answers[q.id] || "(Unanswered)";
                          const isMCQ = q.type === "MCQ" || q.type === "True/False";
                          const isCorrectVal = isMCQ && studAns === q.correctAnswer;

                          return (
                            <div key={q.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2.5">
                              <div className="flex justify-between items-start gap-4">
                                <span className="text-xs font-mono text-slate-500">Q{qIdx + 1}.</span>
                                <div className="flex-1 text-xs">
                                  <p className="text-slate-200 font-bold leading-relaxed">{q.questionText}</p>
                                  {q.options && (
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                      {q.options.map(opt => (
                                        <div key={opt} className={`px-2.5 py-1 rounded text-[10px] font-sans border ${
                                          opt === studAns 
                                            ? "bg-red-950/40 border-red-500 text-rose-300 font-bold" 
                                            : "bg-slate-900 border-transparent text-slate-550"
                                        }`}>
                                          {opt}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {isMCQ && q.correctAnswer && (
                                    <p className="text-[10px] mt-2 font-bold text-emerald-450">
                                      Correct Answer is: {q.correctAnswer}
                                    </p>
                                  )}
                                </div>
                                <span className="shrink-0 text-[10px] font-bold font-mono bg-slate-900 border border-slate-800 text-slate-350 px-2.5 py-1 rounded">
                                  {isMCQ ? (isCorrectVal ? q.markWeight : 0) : "Subjective"} / {q.markWeight} Marks
                                </span>
                              </div>

                              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block font-sans">Your Submitted Answer</span>
                                <p className={`text-xs font-bold mt-1 leading-relaxed ${
                                  isMCQ 
                                    ? (isCorrectVal ? "text-emerald-450" : "text-rose-450") 
                                    : "text-slate-150"
                                }`}>
                                  {studAns}
                                  {isMCQ && (isCorrectVal ? " ✓" : " ✗")}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}          </div>

                {/* Dynamic Notice: To unlock Gemini dynamic report, ask teachers to generate in their panel */}
                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">Unlock Customized AI Remedial Reports</h5>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Faculty members have the power to formulate an academic evaluation map for your scores. Head to the **Faculty / Teacher View** at the top panel, choose **AI Diagnostic Reports**, and click generate to populate diagnostic remedial steps immediately!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. NOTICE bulletin TAB */}
            {activeTab === "announcements" && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase px-1">Notice board circular announcements ({studentAnnouncements.length})</h4>
                {studentAnnouncements.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No active circular directives in the bulletin.</p>
                ) : (
                  <div className="space-y-4">
                    {studentAnnouncements.map(ann => {
                      const isGlobal = ann.batchId === "all";
                      return (
                        <div key={ann.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3 hover:shadow-md duration-200">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded ${
                                isGlobal ? "bg-red-50 text-red-700 border border-red-150" : "bg-indigo-50 text-indigo-700 border border-indigo-150"
                              }`}>
                                {isGlobal ? "Global Broadcast" : "Cohort Notice"}
                              </span>
                              <span className="text-xs text-slate-400 font-semibold">• Posted by {ann.senderName} ({ann.senderRole})</span>
                            </div>
                            <span className="text-xs text-slate-400 font-mono">{ann.date}</span>
                          </div>

                          <h5 className="font-bold text-slate-800 text-sm leading-snug">{ann.title}</h5>
                          <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            </>
          )}

        </div>

        {/* STUDENT DAY BY DAY ATTENDANCE CALENDAR FORM */}
        {activeTab === "attendance" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6" id="student-attendance-calendar font-sans text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3 text-left animate-fadeIn">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 font-bold">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Attendance Calendar Log</h4>
                  <p className="text-xs text-slate-400">Track your daily presence records and cohort attendance rates below in the interactive calendar grid.</p>
                </div>
              </div>

              {/* Status indicator badges */}
              <div className="flex space-x-3 text-[10px] font-black uppercase tracking-wider">
                <span className="flex items-center space-x-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Present</span>
                </span>
                <span className="flex items-center space-x-1.5 text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  <span>Absent</span>
                </span>
                <span className="flex items-center space-x-1.5 text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                  <span>Unrecorded</span>
                </span>
              </div>
            </div>

            {/* Attendance Analytics Metrics Row */}
            {(() => {
              const myId = selectedStudentId;
              const myRecords = attendanceRecords.filter(r => r.studentId === myId);
              const presentCount = myRecords.filter(r => r.status === "Present").length;
              const absentCount = myRecords.filter(r => r.status === "Absent").length;
              const totalDays = myRecords.length;
              const rate = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 100;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-scaleUp text-left">
                  <motion.div 
                    whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left cursor-pointer"
                  >
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Attendance Rate</span>
                    <p className="text-xl font-black text-indigo-650 mt-1">{rate}%</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left cursor-pointer"
                  >
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Days Logged</span>
                    <p className="text-xl font-black text-slate-800 mt-1">{totalDays} Sessions</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-emerald-50/55 p-4 rounded-xl border border-emerald-100 text-left cursor-pointer"
                  >
                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Days Present</span>
                    <p className="text-xl font-black text-emerald-700 mt-1">{presentCount} Days</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-rose-50/55 p-4 rounded-xl border border-rose-100 text-left cursor-pointer"
                  >
                    <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">Days Absent</span>
                    <p className="text-xl font-black text-rose-700 mt-1">{absentCount} Days</p>
                  </motion.div>
                </div>
              );
            })()}

            {/* Dynamic Calendar Grid and details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {/* Left Column: Calendar form display */}
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h5 className="text-xs font-black text-slate-700 uppercase tracking-widest">Session Grid: June 2026</h5>
                  <span className="text-[10px] font-mono text-slate-500">Auto-Refreshed Terminal</span>
                </div>

                {/* Days Grid headings */}
                <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-black uppercase text-slate-450 tracking-wider mb-2 font-sans">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

                {/* Days Grid elements */}
                <div className="grid grid-cols-7 gap-1.5 text-center font-mono">
                  {/* Calendar fillers before June 1, 2026 (June 1 is a Monday, so 0 filler blocks required) */}
                  {Array.from({ length: 30 }).map((_, idx) => {
                    const dayNo = idx + 1;
                    const dateStr = `2026-06-${dayNo.toString().padStart(2, "0")}`;
                    
                    // Lookup attendance
                    const record = attendanceRecords.find(
                      r => r.studentId === selectedStudentId && r.date === dateStr
                    );

                    let bgClass = "bg-white border-slate-200/60 text-slate-650 hover:bg-slate-100/50";
                    let dotColor = "bg-slate-200";
                    if (record?.status === "Present") {
                      bgClass = "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold hover:bg-emerald-100/80";
                      dotColor = "bg-emerald-500 animate-pulse";
                    } else if (record?.status === "Absent") {
                      bgClass = "bg-rose-50 border-rose-200 text-rose-800 font-bold hover:bg-rose-100/80";
                      dotColor = "bg-rose-500 animate-pulse";
                    }

                    return (
                      <div
                        key={dayNo}
                        className={`aspect-square p-2 rounded-xl border flex flex-col justify-between transition-colors shadow-3xs relative group cursor-pointer ${bgClass}`}
                        title={record ? `${dateStr}: ${record.status}` : `${dateStr}: No Lecture`}
                      >
                        <span className="text-[11px] text-left font-black">{dayNo}</span>
                        <div className="flex justify-center">
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Day-by-Day chronological log list */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-150 text-left space-y-4">
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                  <span>Chronological Logs</span>
                </h5>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {(() => {
                    const myRecords = attendanceRecords
                      .filter(r => r.studentId === selectedStudentId)
                      .sort((a, b) => b.date.localeCompare(a.date));

                    if (myRecords.length === 0) {
                      return (
                        <div className="py-12 text-center text-slate-400 text-xs italic font-sans">
                          No active daily check-in histories registered yet.
                        </div>
                      );
                    }

                    return myRecords.map(item => (
                      <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs transition-colors hover:border-indigo-400">
                        <div className="space-y-0.5">
                          <p className="font-mono font-bold text-slate-700">{item.date}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                            Cohort ID: {batches.find(b => b.id === item.batchId)?.code || item.batchId}
                          </p>
                        </div>

                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                          item.status === "Present"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                            : "bg-rose-50 text-rose-800 border border-rose-100"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PERSONAL QR ATTENDANCE PASS CARD TAB */}
        {activeTab === "card" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6" id="student-qr-attendance-pass">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 font-bold">
                  <QrCode className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">My Attendance QR Code Ticket</h4>
                  <p className="text-xs text-slate-400">Scan this pass at classroom entries or present to instructors to verify attendance and obligations.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto py-4">
              <div className="space-y-4">
                <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50 space-y-3.5 text-left">
                  <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-widest flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>How to use your Attendance Pass?</span>
                  </h5>
                  <ul className="space-y-2.5 text-xs text-slate-700 font-sans leading-relaxed list-disc list-inside">
                    <li>Show your digital QR code to your instructor's terminal container camera on arrival.</li>
                    <li>Alternatively, click <strong>"Export Digital Attendance Card"</strong> to save the card pass as a JSON key card.</li>
                    <li>Upload the saved key file to automate authentication secure login bypasses on the login screen.</li>
                    <li>Instructors can scan your card to instantly register your daily lecture check-in or process fee deposits safely.</li>
                  </ul>
                </div>

                <div className="bg-amber-50/45 p-4 rounded-xl border border-amber-200/50 text-xs text-amber-800 text-left">
                  <strong>💳 Instructor security protocol:</strong> For security compliance, teachers must scan this student identity card prior to executing payment ledgers/tuition fee markings.
                </div>
              </div>

              <div className="flex justify-center">
                <StudentQRCard student={activeStudent} />
              </div>
            </div>
          </div>
        )}

        {/* 4. STUDENT PROFILE VIEW AND EDIT PANEL */}
        {activeTab === "profile" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6" id="student-profile-editor">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 font-bold">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Bio Profile & Educational Identity</h4>
              <p className="text-xs text-slate-400">View your authenticated enrollment codes and modify your digital display settings.</p>
            </div>
          </div>

          {profileSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs py-3 px-4 rounded-xl font-bold flex items-center space-x-2 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Simple Profile Logo and Readonly Identity details */}
            <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center text-center justify-center">
              <div className="w-20 h-20 rounded-full bg-indigo-100 border border-indigo-250 text-indigo-700 font-mono text-xl font-bold flex items-center justify-center uppercase shadow-sm">
                {profileName ? profileName.substring(0, 2) : "ST"}
              </div>

              <div>
                <h5 className="font-bold text-slate-800 text-sm">{profileName || "Unknown Student"}</h5>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full mt-1.5 inline-block border border-indigo-100">
                  {activeStudent.status} Student
                </span>
              </div>

              <div className="w-full space-y-2 pt-3 border-t border-slate-200/50 text-left text-xs">
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Academic Roll Code</span>
                  <span className="font-mono font-bold text-slate-700">{activeStudent.rollNo}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Bound Exam Terminal PC</span>
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px] inline-block mt-0.5 border border-indigo-100">
                    {activeStudent.assignedComputerDeskCode ? `💻 PC: ${activeStudent.assignedComputerDeskCode}` : "❌ No Assigned PC (Awaiting Allotment)"}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Identity Verification</span>
                  {activeStudent.isVerified ? (
                    <div className="mt-0.5 space-y-1">
                      <span className="text-emerald-700 font-extrabold text-[10px] flex items-center space-x-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg inline-block">
                        <span>✓ Verified Student</span>
                      </span>
                      {activeStudent.aadharNumber && (
                        <span className="block text-[9px] font-mono text-slate-500">Aadhar: {activeStudent.aadharNumber}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-amber-700 font-extrabold text-[10px] flex items-center space-x-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg inline-block mt-0.5">
                      <span>⚠️ Unverified / Awaiting Verifier</span>
                    </span>
                  )}
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest font-sans">Enrollment Status</span>
                  <span className="text-slate-600 font-semibold flex items-center space-x-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                    <span>Active Member</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Edit inputs */}
            <div className="md:col-span-2 space-y-4">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!profileName.trim() || !profileEmail.trim()) {
                    alert("Name and email are required parameters.");
                    return;
                  }
                  onUpdateStudentProfile?.(activeStudent.id, profileName.trim(), profileEmail.trim(), profileAvatar.trim());
                  setProfileSuccessMsg("Bio profile successfully synchronized on local storage hub layers!");
                  setTimeout(() => setProfileSuccessMsg(""), 4000);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Student Display Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-indigo-600 font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-indigo-600 font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Avatar Profile Image URL
                  </label>
                  <div className="relative">
                    <Link className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      required
                      value={profileAvatar}
                      onChange={(e) => setProfileAvatar(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-indigo-400 font-mono text-slate-600"
                    />
                  </div>
                </div>

                {/* Password Field (DISABLED and notice shown) */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center space-x-1 text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Account Access Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      disabled
                      value="••••••••••••••"
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-450 cursor-not-allowed font-mono"
                    />
                  </div>
                  <div className="mt-2 text-[10px] text-amber-700 leading-relaxed bg-amber-50 rounded-xl p-3 border border-amber-200/45 flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Admin-Managed Passwords:</strong> For rigorous scholastic security, passwords and keys are exclusively controlled by system administrators. Please reach out to administrative support at <strong className="underline text-indigo-700 font-mono">vishveshwarfoundation@gmail.com</strong> if you need credentials changed.
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 transition-all text-white font-bold text-[10px] uppercase tracking-wider py-3.5 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-xs cursor-pointer h-fit font-sans"
                >
                  <Save className="w-4 h-4" />
                  <span>Synchronize Profile</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ACADEMIC APAAR DETAIL FORM & PRINT CARD TAB */}
      {activeTab === "apaar-form" && (
        <div className="space-y-6 text-left animate-fadeIn">
          {/* Print specific style block to ensure clean, high-contrast visual outputs */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden;
              }
              #apaar-card-printable, #apaar-card-printable * {
                visibility: visible;
              }
              #apaar-card-printable {
                position: fixed;
                left: 5%;
                top: 5%;
                width: 90%;
                height: auto;
                margin: 0;
                padding: 30px;
                background: white !important;
                border: 2px solid #1e293b !important;
                border-radius: 16px !important;
                box-shadow: none !important;
                color: black !important;
                display: block !important;
                z-index: 9999999 !important;
              }
              .apaar-print-badge {
                color: #1e3a8a !important;
                border-color: #1e3a8a !important;
              }
            }
          `}} />

          {/* Header Description Banner */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-indigo-400 uppercase tracking-wider">APAAR / PEN Academic Identity Registry Form</h4>
                <p className="text-xs text-slate-300 mt-1">One Nation One Student ID: Maintain your standardized National Student Registry Profile and generate compliant PDFs.</p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] uppercase font-bold tracking-widest px-4 py-2.5 rounded-xl border border-indigo-500/40 cursor-pointer flex items-center gap-1.5 shadow duration-150 transition-all shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF Document</span>
            </button>
          </div>

          {apaarSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs py-3 px-4 rounded-xl font-bold flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{apaarSuccessMsg}</span>
            </div>
          )}

          {/* Live Layout Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* COLUMN 1 & 2: Edit Form */}
            <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">Configure National Student Data Fields</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">Maintain legal alignment with CBSE, SSM, and National Academic Depository registries.</p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  onUpdateStudentFormDetails?.(activeStudent.id, {
                    serialNumber: apaarSerial.trim(),
                    apparId: apaarId.trim(),
                    penNumber: apaarPen.trim(),
                    name: apaarName.trim(),
                    fatherName: apaarFatherName.trim(),
                    motherName: apaarMotherName.trim(),
                    dob: apaarDob.trim(),
                    scholarNumber: apaarScholar.trim(),
                    ssmId: apaarSsm.trim()
                  });
                  setApaarSuccessMsg("APAAR National Academic Registry record has been updated successfully on the workspace servers.");
                  setTimeout(() => setApaarSuccessMsg(""), 4500);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Student Name */}
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Student Name (as per ID)
                    </label>
                    <input
                      type="text"
                      required
                      value={apaarName}
                      onChange={(e) => setApaarName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-indigo-500 focus:bg-white"
                    />
                  </div>

                  {/* DOB */}
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Date of Birth (DOB)
                    </label>
                    <input
                      type="text"
                      required
                      value={apaarDob}
                      onChange={(e) => setApaarDob(e.target.value)}
                      placeholder="e.g. 15-08-2008"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 font-bold focus:outline-indigo-500 focus:bg-white"
                    />
                  </div>

                  {/* APAAR ID */}
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      APAAR ID (12-Digit Registration Number)
                    </label>
                    <input
                      type="text"
                      required
                      value={apaarId}
                      onChange={(e) => setApaarId(e.target.value)}
                      placeholder="e.g. 1234-5678-9012"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 font-bold focus:outline-indigo-500 focus:bg-white"
                    />
                  </div>

                  {/* PEN Number */}
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Student PEN Number (Permanent Education Number)
                    </label>
                    <input
                      type="text"
                      required
                      value={apaarPen}
                      onChange={(e) => setApaarPen(e.target.value)}
                      placeholder="e.g. PEN20268594"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 font-bold focus:outline-indigo-500 focus:bg-white"
                    />
                  </div>

                  {/* Father's Name */}
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Father's Name
                    </label>
                    <input
                      type="text"
                      required
                      value={apaarFatherName}
                      onChange={(e) => setApaarFatherName(e.target.value)}
                      placeholder="e.g. Shri Prakash Sharma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-indigo-500 focus:bg-white"
                    />
                  </div>

                  {/* Mother's Name */}
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Mother's Name
                    </label>
                    <input
                      type="text"
                      required
                      value={apaarMotherName}
                      onChange={(e) => setApaarMotherName(e.target.value)}
                      placeholder="e.g. Smt. Sunita Devi"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-indigo-500 focus:bg-white"
                    />
                  </div>

                  {/* Scholar Number */}
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Scholar Enrollment Number
                    </label>
                    <input
                      type="text"
                      required
                      value={apaarScholar}
                      onChange={(e) => setApaarScholar(e.target.value)}
                      placeholder="e.g. SCH-4091-2026"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-indigo-500 focus:bg-white font-mono"
                    />
                  </div>

                  {/* SSM ID */}
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      SSM ID (Samagra Student Member ID)
                    </label>
                    <input
                      type="text"
                      required
                      value={apaarSsm}
                      onChange={(e) => setApaarSsm(e.target.value)}
                      placeholder="e.g. SSM902410851"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-indigo-500 focus:bg-white font-mono"
                    />
                  </div>

                  {/* Serial Number */}
                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      National Data Serial Registry Number
                    </label>
                    <input
                      type="text"
                      required
                      value={apaarSerial}
                      onChange={(e) => setApaarSerial(e.target.value)}
                      placeholder="e.g. BD-902415-AP/2026"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-indigo-500 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 transition-all text-white font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-xs cursor-pointer duration-150 active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save & Update APAAR Registry</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="bg-slate-100 hover:bg-slate-200 transition-all text-slate-700 font-bold text-xs uppercase tracking-widest py-3 px-5 rounded-xl flex items-center justify-center space-x-2 cursor-pointer duration-150"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print PDF Card</span>
                  </button>
                </div>
              </form>
            </div>

            {/* COLUMN 3: Live Card Preview / National Identity Card */}
            <div>
              <div className="sticky top-6 space-y-6">
                
                {/* Official APAAR Card Preview */}
                <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 block mb-2 font-mono">Academic ID Preview (Front)</span>
                  
                  {/* Card Container */}
                  <div 
                    id="apaar-card-printable"
                    className="w-full max-w-[420px] mx-auto bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-indigo-700 relative overflow-hidden"
                  >
                    {/* Background graphic */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

                    {/* Card Header */}
                    <div className="flex items-start justify-between border-b border-indigo-550 pb-2 mb-3.5 relative">
                      <div className="text-left">
                        <span className="block text-[7px] text-indigo-200 uppercase font-bold tracking-widest leading-none">Government of India</span>
                        <h4 className="text-[11px] font-black tracking-wider text-white uppercase leading-tight font-sans mt-0.5">APAAR Registry Authority</h4>
                        <span className="text-[6px] text-indigo-300 block font-mono mt-0.5">ONE NATION • ONE STUDENT CARD</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[6px] bg-indigo-500/30 text-indigo-250 border border-indigo-400/20 px-1 py-0.5 rounded font-bold font-mono">
                          ACADEMIC CARD
                        </span>
                      </div>
                    </div>

                    {/* Card Content Grid */}
                    <div className="grid grid-cols-3 gap-3 text-left relative z-10">
                      {/* Left: Avatar */}
                      <div className="col-span-1 flex flex-col items-center justify-start space-y-1">
                        <div className="w-16 h-20 rounded-lg border border-indigo-550 bg-indigo-900 flex flex-col items-center justify-center p-1 shadow-sm shrink-0">
                          <User className="w-8 h-8 text-indigo-200" />
                          <span className="text-[9px] font-mono font-extrabold text-white mt-1">
                            {activeStudent.name ? activeStudent.name.substring(0, 2) : "ST"}
                          </span>
                        </div>
                        <span className="text-[6px] font-mono font-black text-indigo-300 tracking-wider block overflow-hidden w-full text-center truncate">
                          {activeStudent.rollNo}
                        </span>
                      </div>

                      {/* Middle & Right: Details */}
                      <div className="col-span-2 space-y-1.5 font-sans">
                        <div>
                          <span className="block text-[6px] text-indigo-305 uppercase font-medium leading-none">Student Name</span>
                          <span className="text-[11px] font-extrabold text-white leading-normal tracking-wide block truncate">{apaarName || "-"}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <span className="block text-[5.5px] text-indigo-305 uppercase font-medium leading-none">DOB</span>
                            <span className="text-[8px] font-bold text-slate-100 block">{apaarDob || "-"}</span>
                          </div>
                          <div>
                            <span className="block text-[5.5px] text-indigo-305 uppercase font-medium leading-none">PEN Number</span>
                            <span className="text-[8px] font-bold text-slate-100 block font-mono">{apaarPen || "-"}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <span className="block text-[5.5px] text-indigo-305 uppercase font-medium leading-none">Father's Name</span>
                            <span className="text-[7.5px] font-semibold text-slate-200 block truncate">{apaarFatherName || "-"}</span>
                          </div>
                          <div>
                            <span className="block text-[5.5px] text-indigo-305 uppercase font-medium leading-none">Mother's Name</span>
                            <span className="text-[7.5px] font-semibold text-slate-200 block truncate">{apaarMotherName || "-"}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 pt-0.5 border-t border-indigo-800/40">
                          <div>
                            <span className="block text-[5.5px] text-indigo-305 uppercase font-medium leading-none">Scholar No</span>
                            <span className="text-[7.5px] font-mono text-slate-200 block truncate">{apaarScholar || "-"}</span>
                          </div>
                          <div>
                            <span className="block text-[5.5px] text-indigo-305 uppercase font-medium leading-none">SSM ID</span>
                            <span className="text-[7.5px] font-mono text-slate-200 block truncate">{apaarSsm || "-"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom barcode block */}
                    <div className="mt-3.5 pt-2 border-t border-indigo-800/60 flex items-center justify-between text-left relative">
                      <div>
                        <span className="block text-[5px] text-indigo-350 uppercase tracking-widest font-mono">APAAR ID NUMBER</span>
                        <span className="text-[9.5px] font-extrabold font-mono text-indigo-300 tracking-wider">
                          {apaarId ? apaarId.replace(/(\d{4})(?=\d)/g, '$1 - ') : "---- - ---- - ----"}
                        </span>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[5px] font-mono text-indigo-400 block uppercase leading-none">SERIAL NO</span>
                        <span className="text-[7px] font-mono text-slate-300 font-bold block">{apaarSerial || "N/A"}</span>
                      </div>
                    </div>

                    {/* Stamp and signature placeholder */}
                    <div className="absolute top-2.5 right-24 border border-indigo-400/20 bg-indigo-500/10 rounded-full w-7 h-7 flex items-center justify-center text-[5px] font-mono uppercase tracking-widest text-indigo-300 border-dashed animate-spin-slow pointer-events-none">
                      Gov. India
                    </div>
                  </div>
                </div>

                {/* Information Card */}
                <div className="bg-indigo-50/45 p-5 rounded-2xl border border-indigo-150 space-y-3.5 text-slate-800 text-xs">
                  <h5 className="font-bold text-indigo-950 uppercase tracking-wider flex items-center space-x-1.5 leading-none">
                    <span className="w-2 h-2 rounded-full bg-indigo-650" />
                    <span>Why APAAR Registry is essential?</span>
                  </h5>
                  <p className="leading-relaxed">
                    National Education Policy mandates <strong>APAAR (Automated Permanent Academic Account Registry)</strong> to serve as a lifelong virtual ID card for absolute academic validation. It aggregates your credentials, grades, attendance passes, and exam gradebooks seamlessly on secure cloud nodes.
                  </p>
                  <p className="leading-relaxed">
                    Your assigned school counselors and batch instructors have direct authenticated clearance to sign, review, edit, and print this academic document for your cohort submissions.
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* Master Academic Registry Ledger (All Student Data in One Place - Serial Wise with Excel Download) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 mt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h5 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>National APAAR Academic Ledger (Active Registry)</span>
                </h5>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  View complete cohort logs sorted in Serial Wise sequence and download master Excel spreadsheets.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Inputs */}
                <input
                  type="text"
                  placeholder="Search ledger by name or code..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-indigo-500 w-48"
                  id="student-ledger-search-box"
                />
                
                {/* Excel Export Button */}
                <button
                  type="button"
                  onClick={() => {
                    const csvHeaders = [
                      "Serial Number",
                      "Student Name",
                      "Roll Number",
                      "APAAR Card ID",
                      "Student PEN",
                      "Date of Birth (DOB)",
                      "Father's Name",
                      "Mother's Name",
                      "Scholar Number",
                      "Samagra SSM ID"
                    ];
                    const csvRows = students.map((std, idx) => [
                      std.serialNumber || `SN-${idx + 101}`,
                      std.name || "",
                      std.rollNo || "",
                      std.apparId || "",
                      std.penNumber || "",
                      std.dob || "",
                      std.fatherName || "",
                      std.motherName || "",
                      std.scholarNumber || "",
                      std.ssmId || ""
                    ]);

                    const csvContent = [
                      csvHeaders.join(","),
                      ...csvRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
                    ].join("\n");

                    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("download", `Master_Academic_APAAR_Registry_Ledger.csv`);
                    link.style.visibility = "hidden";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.01] duration-155 transition-all text-white text-[10px] uppercase font-bold tracking-wider px-4 py-2.5 rounded-xl border border-emerald-500/20 cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>Download Excel CSV</span>
                </button>
              </div>
            </div>

            {/* Table wrapper */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3 px-4 text-center">S.No</th>
                    <th className="py-3 px-4">Serial Registry No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Roll/Enroll Code</th>
                    <th className="py-3 px-4">APAAR ID</th>
                    <th className="py-3 px-4">Student PEN</th>
                    <th className="py-3 px-4">DOB</th>
                    <th className="py-3 px-4">Father Name</th>
                    <th className="py-3 px-4 font-normal">Mother Name</th>
                    <th className="py-3 px-4">Scholar No</th>
                    <th className="py-3 px-4">Samagra SSM ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                  {students
                    .filter(std => {
                      const matchStr = ledgerSearch.toLowerCase();
                      return (
                        std.name?.toLowerCase().includes(matchStr) ||
                        std.rollNo?.toLowerCase().includes(matchStr) ||
                        std.apparId?.toLowerCase().includes(matchStr) ||
                        std.penNumber?.toLowerCase().includes(matchStr) ||
                        std.serialNumber?.toLowerCase().includes(matchStr)
                      );
                    })
                    .map((std, index) => (
                      <tr 
                        key={std.id}
                        className={`hover:bg-slate-50/55 transition-all ${
                          std.id === loggedInStudentId ? "bg-indigo-50/35" : ""
                        }`}
                      >
                        <td className="py-3 px-4 text-center font-bold text-slate-400">{index + 1}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-600">{std.serialNumber || `SN-${index + 101}`}</td>
                        <td className="py-3 px-4 font-bold text-slate-800 flex items-center space-x-2">
                          <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center font-mono text-[9px] font-extrabold shrink-0">
                            {std.name ? std.name.substring(0, 2) : "ST"}
                          </div>
                          <span>{std.name}</span>
                          {std.id === loggedInStudentId && (
                            <span className="text-[8px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-extrabold uppercase ml-1">You</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-550">{std.rollNo || "N/A"}</td>
                        <td className="py-3 px-4 font-mono text-indigo-650 font-bold">{std.apparId || "Pending"}</td>
                        <td className="py-3 px-4 font-mono text-slate-805 font-bold">{std.penNumber || "Pending"}</td>
                        <td className="py-3 px-4 text-slate-650 font-medium">{std.dob || "N/A"}</td>
                        <td className="py-3 px-4 text-slate-650 font-medium">{std.fatherName || "N/A"}</td>
                        <td className="py-3 px-4 text-slate-650 font-medium">{std.motherName || "N/A"}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{std.scholarNumber || "N/A"}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{std.ssmId || "N/A"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* EXPLORE BATCHES & COURSES TAB */}
      {activeTab === "explore" && (
        <div className="space-y-6 text-left animate-fadeIn">
          {/* Header Block */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5 text-left">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 font-bold border border-indigo-500/20">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-black uppercase tracking-widest font-sans text-indigo-400">
                  Academic Courses & Electives Hub
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Discover outstanding batches, explore high-fidelity course content structures and view lesson materials.
                </p>
              </div>
            </div>
            <div className="text-[10px] font-mono bg-indigo-900/30 text-indigo-300 border border-indigo-500/20 rounded-md px-3 py-1.5 font-bold uppercase shrink-0">
              Box Type Template use
            </div>
          </div>

          {/* Batches Grid with Box template */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {batches.map(b => {
              const teacher = teachers.find(t => t.id === b.teacherId);
              const isEnrolled = b.studentIds?.includes(activeStudent.id);
              const batchLessons = lessons.filter(l => l.batchId === b.id);
              return (
                <motion.div 
                  key={b.id} 
                  whileHover={{ scale: 1.02, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`bg-white dark:bg-slate-900 border-2 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative cursor-pointer ${
                    isEnrolled ? "border-indigo-550 border-indigo-500" : "border-slate-200 dark:border-slate-855"
                  }`}
                  style={{ contentVisibility: "auto" }}
                >
                  {/* Top identifier ribbon */}
                  <div className={`h-1.5 w-full ${isEnrolled ? "bg-indigo-600" : "bg-slate-450 bg-slate-300"}`} />
                  
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start gap-1.5">
                        <span className="text-[9px] font-mono leading-none tracking-wider uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 font-black">
                          Code: {b.code}
                        </span>
                        {isEnrolled ? (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded border border-emerald-200">
                            ✓ Currently Enrolled
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500 px-2.5 py-1 rounded">
                            Non-Member Scope
                          </span>
                        )}
                      </div>

                      <h5 className="font-extrabold text-slate-850 dark:text-white text-base mt-3 leading-snug uppercase tracking-tight">
                        {b.name}
                      </h5>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold block mt-0.5 uppercase tracking-wide">
                        Field: {b.subject}
                      </span>

                      {/* Time matrix indicators */}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="bg-slate-50 dark:bg-slate-855 p-2 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center space-x-2 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-650 dark:text-slate-300 truncate">{b.schedule}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-855 p-2 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center space-x-2 text-xs">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-bold text-slate-650 dark:text-slate-350">{batchLessons.length} syllabus modules</span>
                        </div>
                      </div>
                    </div>

                    {/* Course syllabus explore box */}
                    <div className="bg-slate-50 dark:bg-slate-855 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 space-y-2">
                      <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">
                        Published Lesson Modules ({batchLessons.length})
                      </span>
                      {batchLessons.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">No course modules registered for this batch yet.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 no-scrollbar">
                          {batchLessons.map((lesson, idx) => (
                            <div 
                              key={lesson.id} 
                              className="flex items-start space-x-2 text-[11px] text-slate-705 dark:text-slate-300"
                            >
                              <span className="text-indigo-500 font-bold font-mono">{idx + 1}.</span>
                              <div className="flex-1">
                                <span className="font-semibold block leading-tight">{lesson.title}</span>
                                <span className="text-[9px] text-slate-400 block line-clamp-1">{lesson.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Associated Instructor */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-855 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-mono text-[9px] font-extrabold uppercase shrink-0">
                          {teacher?.name ? teacher.name.substring(0, 2) : "TR"}
                        </div>
                        <div className="text-left">
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-bold block">{teacher?.name}</span>
                          <span className="text-[9px] text-slate-450 dark:text-slate-500 block">{teacher?.specialization}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedBatchId(b.id);
                          setActiveTab("syllabus");
                        }}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          isEnrolled 
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs" 
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        <span>Study Lesson</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. STUDENT FEES LEDGER TAB */}
      {activeTab === "fees" && (
        <div className="space-y-6 text-left" id="student-fees-ledger">
          {/* Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-left">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider font-sans">
                  My Fee Invoices & Accounts Ledger
                </h4>
                <p className="text-xs text-slate-500 font-sans">
                  Review your active billing receipts, outstanding tuitions, and historic transaction proofs issued by instruction faculty.
                </p>
              </div>
            </div>
            <div className="text-xs bg-slate-100 font-mono text-slate-600 font-semibold px-3 py-1.5 rounded-lg border border-slate-200">
              Student ID: {activeStudent.id}
            </div>
          </div>

          {/* Quick Stats Grid */}
          {(() => {
            const studentInvoices = fees.filter(f => f.studentId === activeStudent.id);
            const unpaidTotal = studentInvoices.filter(f => f.status === "Unpaid").reduce((acc, curr) => acc + curr.amount, 0);
            const paidTotal = studentInvoices.filter(f => f.status === "Paid").reduce((acc, curr) => acc + curr.amount, 0);

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                {/* Pending Fees Box */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Outstanding Fees</span>
                    <span className="text-2xl font-black text-rose-600 font-mono">₹{unpaidTotal.toLocaleString()}</span>
                  </div>
                  <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-wider rounded-lg border ${
                    unpaidTotal > 0 ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-emerald-50 text-emerald-700 border-emerald-110"
                  }`}>
                    {unpaidTotal > 0 ? "Pending Dues" : "All Settled"}
                  </span>
                </div>

                {/* Paid Fees Box */}
                <div className="bg-white p-5 rounded-xl border border-slate-101 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest font-sans">Receipts Cleared</span>
                    <span className="text-2xl font-black text-emerald-600 font-mono">₹{paidTotal.toLocaleString()}</span>
                  </div>
                  <span className="px-2.5 py-1 text-[8px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider rounded-lg font-sans">
                    Good Standing
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Invoices registry */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 font-sans">
              Billing Ledger Logs
            </h5>

            {(() => {
              const studentInvoices = fees.filter(f => f.studentId === activeStudent.id);

              if (studentInvoices.length === 0) {
                return (
                  <div className="bg-slate-50/50 p-12 text-center rounded-2xl border border-slate-100">
                    <p className="text-slate-400 text-xs font-sans">No fees or invoices have been billed to your student account yet.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3.5">
                  {studentInvoices.map(f => (
                    <div 
                      key={f.id}
                      className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-stretch justify-between gap-4 text-left"
                    >
                      <div className="space-y-1.5 flex-1 select-text">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-widest rounded-full border ${
                            f.status === "Paid" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                              : "bg-rose-50 text-rose-700 border-rose-100"
                          }`}>
                            {f.status}
                          </span>
                          <span className="font-mono text-[9px] text-slate-450 font-bold shrink-0">Inv ID: #{f.id}</span>
                        </div>
                        <h6 className="font-bold text-slate-800 text-xs">{f.title}</h6>
                        {f.notes && (
                          <p className="text-[10px] text-slate-450 italic bg-white p-2.5 rounded-lg border border-slate-100 font-sans">
                            {f.notes}
                          </p>
                        )}
                        <div className="flex items-center space-x-3 text-[9px] text-slate-400 font-sans mt-2 pt-1 border-t border-slate-100 font-medium">
                          <span>Deadline Due: <strong className="font-mono font-bold text-slate-500">{f.dueDate}</strong></span>
                          {f.paidDate && (
                            <span className="text-emerald-650">Settled Date: <strong className="font-mono font-bold">{f.paidDate}</strong></span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-slate-100/50 pt-2 sm:pt-0 shrink-0 font-sans">
                        <span className="font-mono font-black text-base text-slate-800">₹{f.amount}</span>
                        <div className="text-[9px] text-slate-400 font-sans">
                          {f.status === "Unpaid" ? (
                            <span className="text-amber-600 font-semibold">Payment pending</span>
                          ) : (
                            <span className="text-emerald-650 font-semibold text-emerald-700">Transaction complete</span>
                          ) /* comment */}
                        </div>
                        <button
                          onClick={() => setPrintingInvoice(f)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-50/60 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-700 hover:text-white dark:text-indigo-400 dark:hover:text-white transition-all cursor-pointer border border-slate-200/50 mt-1 hover:bg-indigo-600"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>View & Pay Invoice</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Note on payments support */}
            <div className="mt-4 text-[10px] text-slate-550 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-200/40 flex items-start space-x-2 text-left">
              <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Billing Assistance:</strong> To fulfill payments, submit physical check vouchers, or report payment errors/concessions, please visit the central registrar desk or direct details to our support email <strong className="underline text-indigo-700 font-semibold font-mono">vishveshwarfoundation@gmail.com</strong>.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 6. SUPPORT DEPT HELP TICKETS */}
      {activeTab === "support" && (
        <div className="space-y-6 text-left animate-fadeIn">
          {/* Header info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-left">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 font-bold">
                <MessageSquare className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider font-sans">
                  Support Assistance Ticket Desk
                </h4>
                <p className="text-xs text-slate-500 font-sans">
                  Direct academic doubts, tuition payments, or system errors to College Registrar Admins and Faculty.
                </p>
              </div>
            </div>
            <div className="text-xs bg-slate-100 font-mono text-slate-600 font-semibold px-3 py-1.5 rounded-lg border border-slate-200">
              Active Session: {activeStudent.name} ({activeStudent.rollNo})
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Conversations Board */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                  Academic Help & Support Chat History
                </h5>
                <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  System Online
                </span>
              </div>

              {/* Chat flow list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                {(() => {
                  const currentStudentMsgs = supportMessages.filter(m => m.studentId === activeStudent.id);
                  if (currentStudentMsgs.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                        <MessageSquare className="w-10 h-10 text-slate-350 animate-bounce" />
                        <h6 className="font-bold text-slate-700 text-xs">No Messages Yet</h6>
                        <p className="text-[10px] text-slate-400 max-w-sm">No ticket questions have been posted yet. Type your doubt below to connect with a Teacher or Administrator.</p>
                      </div>
                    );
                  }

                  return currentStudentMsgs.map(msg => {
                    const isSelf = msg.senderId === activeStudent.id;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} space-y-1`}>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] font-extrabold text-slate-400 font-sans">
                            {msg.senderName} ({msg.senderRole.toUpperCase()})
                          </span>
                          <span className="text-[8px] text-slate-350 font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={`p-3.5 rounded-2xl text-xs max-w-md ${
                          isSelf 
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs' 
                            : 'bg-white text-slate-850 rounded-tl-none border border-slate-100 shadow-xs'
                        }`}>
                          <p className="leading-relaxed whitespace-pre-line font-medium font-sans break-words">{msg.content}</p>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Message Composer Footer */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const input = form.elements.namedItem("support_content") as HTMLInputElement;
                  if (!input || !input.value.trim() || !onSendSupportMessage) return;
                  onSendSupportMessage(input.value.trim(), activeStudent.id);
                  input.value = "";
                }} 
                className="p-4 border-t border-slate-100 bg-white flex items-center gap-3"
              >
                <input 
                  name="support_content"
                  type="text"
                  placeholder="Post new query regarding batch tuitions, course contents, or support issues..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                  required
                />
                <button 
                  type="submit" 
                  className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-slate-900 transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Support info card */}
            <div className="bg-indigo-950 text-white rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center min-h-[140px]">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl -z-5" />
              <div className="flex items-start space-x-3.5 relative z-10 text-left">
                <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h6 className="text-xs font-black uppercase tracking-wider text-indigo-200">
                    Scholastic Guarantee Registry
                  </h6>
                  <p className="text-[11px] text-indigo-100 leading-relaxed max-w-3xl">
                    Every message submitted in the support desk goes directly to the dashboard queues of verified Teachers and active Administrators. Support questions are monitored and responded to within a standard 2-hour learning window. All communication channels are documented for curriculum verification purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2.6 IMMERSIVE SECURE EXAM SANDBOX KIOSK TERMINAL OVERLAY */}
      {activeQuizToTake && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 overflow-y-auto font-sans flex flex-col justify-between">
          
          {/* Strict Security Header bar */}
          <div className="bg-slate-950 border-b border-rose-500/30 px-6 py-4 flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-9 h-9 bg-rose-600 rounded-lg flex items-center justify-center text-white shrink-0 animate-pulse">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-rose-500 tracking-wider block">
                  Secure Locker Assessment Kiosk
                </span>
                <h3 className="text-sm font-black text-white">{activeQuizToTake.title}</h3>
              </div>
            </div>

            {/* Desktop Terminal IP and seat allotment display */}
            <div className="bg-slate-900 border-2 border-rose-500/50 px-4 py-2 rounded-xl text-right block animate-pulse">
              <span className="text-[8px] font-mono text-rose-400 block uppercase tracking-widest font-black">
                PHYSICAL TERMINAL ALLOTMENT
              </span>
              <span className="text-sm font-mono font-black text-rose-400 block">
                💻 PC-{activeStudent.assignedComputerDeskCode || "AWAITING-ALLOTMENT"}
              </span>
              <span className="text-[8px] font-mono text-slate-400 block uppercase mt-1">
                ROLL: {activeStudent.rollNo}
              </span>
            </div>
          </div>

          {/* Student details sub-banner */}
          <div className="bg-slate-950 text-slate-300 px-6 py-3 border-b border-slate-900 text-xs flex flex-wrap justify-between gap-3 text-left">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-slate-400">Candidate Name:</span> <strong className="text-white font-extrabold uppercase">{activeStudent.name}</strong> 
              </div>
              <div>
                <span className="text-slate-400">Roll Number:</span> <strong className="text-indigo-400 font-mono font-black text-sm">{activeStudent.rollNo}</strong>
              </div>
              <div>
                <span className="text-slate-400">Assigned PC Number:</span> <strong className="text-emerald-400 font-mono font-black text-sm">{activeStudent.assignedComputerDeskCode || "LOCAL-SANDBOX-TEST"}</strong>
              </div>
            </div>
            <div className="text-rose-400 font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              <span>Supervisor Lock Engaged</span>
            </div>
          </div>

          {/* Core quiz content layout */}
          <div className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
            
            {/* Subject Section Headers indicator */}
            <div className="bg-slate-850 p-4 rounded-xl text-left border border-slate-800">
              <p className="text-[11px] text-zinc-300 leading-relaxed font-bold">
                ⚠️ <strong>Exam Hall Protocol:</strong> Do not exit this applet or open alternate browser tabs. Your answers are registered locally and evaluated by the batch supervisor automatically upon submit.
              </p>
            </div>

            {/* Render questions list nested by subject sections */}
            <div className="space-y-6">
              {(activeQuizToTake.questions || []).map((q, idx) => {
                const answerValue = quizAnswers[q.id] || "";
                
                return (
                  <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left space-y-4 shadow-lg">
                    {/* Identification labels */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="bg-rose-600 text-white font-mono text-[9px] font-black px-2.5 py-0.5 rounded uppercase">
                          Question {idx + 1}
                        </span>
                        <span className="bg-slate-800 text-slate-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          {q.sectionName || "General Section"}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400">
                        ({q.markWeight} Marks Weight)
                      </span>
                    </div>

                    {/* Question text */}
                    <h4 className="text-sm font-bold text-slate-100">{q.questionText}</h4>

                    {/* Responses Interactive Inputs based on type */}
                    <div className="pt-2">
                      {q.type === "MCQ" && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options.map((opt, optIdx) => {
                            const optionLetter = ["A", "B", "C", "D"][optIdx];
                            const selected = answerValue === optionLetter;
                            
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => {
                                  setQuizAnswers({ ...quizAnswers, [q.id]: optionLetter });
                                }}
                                className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center space-x-3 cursor-pointer ${
                                  selected 
                                    ? "bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-950/20" 
                                    : "bg-slate-850 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                                }`}
                              >
                                <span className={`w-6 h-6 rounded-lg font-mono font-black text-[10px] flex items-center justify-center ${
                                  selected ? "bg-rose-800 text-white" : "bg-slate-900 text-slate-400"
                                }`}>
                                  {optionLetter}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {q.type === "True/False" && (
                        <div className="flex items-center space-x-3">
                          {["True", "False"].map((val) => {
                            const selected = answerValue === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => {
                                  setQuizAnswers({ ...quizAnswers, [q.id]: val });
                                }}
                                className={`flex-1 p-3.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                                  selected 
                                    ? "bg-rose-600 border-rose-500 text-white" 
                                    : "bg-slate-850 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                                }`}
                              >
                                {val === "True" ? "✓ True" : "✗ False"}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {q.type === "Written" && (
                        <textarea
                          rows={3}
                          value={answerValue}
                          onChange={(e) => {
                            setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value });
                          }}
                          className="w-full bg-slate-850 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-rose-500 focus:bg-slate-900"
                          placeholder="Type your subjective core answer description here... (system auto grades based on core learning keywords)"
                        />
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* Secure kiosk submit actions footer panel */}
          <div className="bg-slate-950 border-t border-slate-850 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (confirm("⚠️ WARNING: Are you sure you want to abandon and close this secure testing kiosk?\n\nYour entered test responses will be discarded.")) {
                  setActiveQuizToTake(null);
                  setQuizAnswers({});
                }
              }}
              className="text-slate-400 hover:text-rose-400 text-xs font-bold bg-transparent border-0 cursor-pointer"
            >
              ← Terminate Sandbox Exit
            </button>

            <button
              type="button"
              onClick={handleSubmitQuiz}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs tracking-widest px-8 py-3.5 rounded-xl shadow-md cursor-pointer duration-150 inline-flex items-center justify-center space-x-1.5"
            >
              <span>Submit Active Exam Paper</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {printingInvoice && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-150 dark:border-slate-800 shadow-2xl space-y-6 text-slate-900 dark:text-white font-sans text-left relative max-h-[90vh] overflow-y-auto">
            
            {/* Stamp Badge */}
            <div className={`absolute top-6 right-6 border-4 border-dashed ${
              printingInvoice.status === "Paid" || paymentSuccess
                ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400" 
                : "border-rose-500/40 text-rose-600 dark:text-rose-400"
            } text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rotate-12 rounded-lg`}>
              {printingInvoice.status === "Paid" || paymentSuccess ? "PAID SECURELY" : "FEES UNPAID"}
            </div>

            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shrink-0 font-extrabold text-lg select-none">
                ₹
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">SECURE ONLINE FEE DESK</h4>
                <p className="text-[10px] text-slate-440 font-semibold font-mono">Invoice Reference ID: #{printingInvoice.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Candidate / Scholar:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeStudent.name}</span>
                <span className="block text-[10px] text-slate-500">Roll Registry: {activeStudent.rollNo}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Date of Billing:</span>
                <span className="font-mono font-semibold text-slate-805 dark:text-slate-200">{printingInvoice.dueDate}</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-1">Item Description:</span>
              <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs">{printingInvoice.title}</h5>
              {printingInvoice.notes && <p className="text-[10px] text-slate-500 italic mt-1.5">{printingInvoice.notes}</p>}
            </div>

            <div className="flex justify-between items-center pt-2 pb-2 border-t border-slate-100 dark:border-slate-800 font-mono">
              <span className="text-xs text-slate-500 font-bold">Aggregate Tuition Fee:</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">₹{printingInvoice.amount}.00</span>
            </div>

            {/* If Paid, show clean confirmation stamp */}
            {(printingInvoice.status === "Paid" || paymentSuccess) ? (
              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-805 dark:text-emerald-300 text-xs text-center space-y-1">
                <div className="font-black uppercase tracking-wider text-[11px] flex items-center justify-center space-x-1">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600 font-extrabold" />
                  <span>Verified Settlement Complete</span>
                </div>
                <p className="text-[10px] text-slate-500 font-sans mt-1">
                  The amount of <strong>₹{printingInvoice.amount}</strong> was fully processed and settled via safe banking integrations. Clear academic transcripts of this transaction are securely saved in the database.
                </p>
                {(printingInvoice.paidDate || paymentSuccess) && (
                  <p className="text-[9px] font-mono text-slate-400 font-bold mt-1.5">
                    Receipt Settled On: {printingInvoice.paidDate || new Date().toISOString().split('T')[0]}
                  </p>
                )}
              </div>
            ) : (
              /* If Unpaid, offer secure checkout widget */
              <div className="p-5 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-2xl border border-indigo-105 dark:border-indigo-900/40 space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-100/50 dark:border-indigo-900/30 pb-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-indigo-700 dark:text-indigo-400">Secured Rupee Gateway</span>
                  <span className="text-[8px] bg-indigo-650 text-white font-mono px-2 py-0.5 rounded uppercase font-extrabold tracking-wider animate-pulse">SSL Secure</span>
                </div>

                {isPayingOnline ? (
                  <div className="py-8 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-8 h-8 text-indigo-650 animate-spin" />
                    <span className="text-xs font-black uppercase text-indigo-805 dark:text-indigo-300 tracking-wider font-mono">Authorizing Secure Transaction...</span>
                    <span className="text-[10px] text-slate-455 font-sans">Verifying bank parameters and ledger balance. Please do not close this modal.</span>
                  </div>
                ) : (
                  <div className="space-y-4 font-sans text-xs">
                    {/* Choose method */}
                    <div className="grid grid-cols-3 gap-2">
                      {(["upi", "card", "netbanking"] as const).map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`py-2 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            paymentMethod === m 
                              ? "bg-indigo-600 border-indigo-500 text-white shadow-sm font-black" 
                              : "bg-white dark:bg-slate-800 border-slate-205 dark:border-slate-705 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-755"
                          }`}
                        >
                          {m === "upi" ? "UPI (GPay)" : m === "card" ? "Debit/Credit" : "Net Banking"}
                        </button>
                      ))}
                    </div>

                    {/* Dynamic checkout inputs */}
                    {paymentMethod === "upi" && (
                      <div className="space-y-1.5 text-left">
                        <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-widest">Your Payee Virtual ID (UPI ID)</label>
                        <input
                          type="text"
                          required
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. rollnumber@okaxis"
                          className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-805 dark:text-white font-mono font-medium focus:outline-indigo-500 font-bold"
                        />
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div className="space-y-3 text-left">
                        <div className="space-y-1.5">
                          <label className="block text-[9px] font-bold text-slate-455 uppercase tracking-widest">Indian Credit/Debit Card Number</label>
                          <input
                            type="text"
                            required
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="e.g. 4321 0987 6543 2109"
                            className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-805 dark:text-white font-mono font-medium focus:outline-indigo-500 font-bold"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="block text-[9px] font-bold text-slate-455 uppercase tracking-widest">Expiration</label>
                            <input
                              type="text"
                              required
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-805 dark:text-white font-mono font-medium text-center focus:outline-indigo-500"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[9px] font-bold text-slate-455 uppercase tracking-widest">CVV Shield</label>
                            <input
                              type="password"
                              required
                              maxLength={3}
                              value={cardCVV}
                              onChange={(e) => setCardCVV(e.target.value)}
                              placeholder="***"
                              className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-855 dark:text-white font-mono font-medium text-center focus:outline-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "netbanking" && (
                      <div className="space-y-1.5 text-left">
                        <label className="block text-[9px] font-bold text-slate-455 uppercase tracking-widest">Selected Clearing House / Bank</label>
                        <select className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-805 dark:text-white font-medium focus:outline-indigo-500">
                          <option>State Bank of India (SBI)</option>
                          <option>HDFC Bank</option>
                          <option>ICICI Bank</option>
                          <option>Punjab National Bank (PNB)</option>
                          <option>Axis Bank</option>
                        </select>
                      </div>
                    )}

                    {/* Pay trigger */}
                    <button
                      type="button"
                      onClick={() => {
                        if (paymentMethod === "upi" && !upiId.trim()) {
                          alert("Please enter a valid UPI payee identifier.");
                          return;
                        }
                        if (paymentMethod === "card" && (!cardNumber.trim() || !cardExpiry.trim() || !cardCVV.trim())) {
                          alert("Please supply complete credit card details.");
                          return;
                        }

                        setIsPayingOnline(true);
                        setTimeout(() => {
                          setIsPayingOnline(false);
                          setPaymentSuccess(true);
                          if (onUpdateFeeStatus) {
                            onUpdateFeeStatus(printingInvoice.id, "Paid");
                          }
                        }, 1200);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest py-3 rounded-xl transition duration-150 active:scale-95 shadow-md shadow-emerald-600/10 cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <span>Authorize Payment of ₹{printingInvoice.amount}.00</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setPrintingInvoice(null);
                  setPaymentSuccess(false);
                  setUpiId("");
                  setCardNumber("");
                  setCardExpiry("");
                  setCardCVV("");
                }}
                className="px-5 py-2.5 bg-slate-150 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-250 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Close Desk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2.7 REAL-TIME SECURE TEST POPUP ALERT */}
      {activeUnsubmittedLiveTest && !activeQuizToTake && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-45 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-left animate-fadeIn">
            
            {/* Header with pulsating badge */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                <span className="w-2.5 h-2.5 bg-rose-600 rounded-full absolute" />
                <h4 className="text-xs font-black uppercase text-rose-600 tracking-wider font-mono">
                  🔥 Secure Exam Commenced
                </h4>
              </div>
              <span className="text-[8px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">
                PROCTOR SHIELD
              </span>
            </div>

            {/* Content Details */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-slate-850 dark:text-white">
                {activeUnsubmittedLiveTest.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                A secure examination has been initiated by your Academic Department. This exam runs under secure supervisor locking policy constraints.
              </p>

              <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
                <div>
                  <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">QUESTIONS</span>
                  <span className="font-extrabold text-slate-850 dark:text-white font-mono">
                    {activeUnsubmittedLiveTest.questions?.length || 0} Items
                  </span>
                </div>
                <div>
                  <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">WEIGHT</span>
                  <span className="font-extrabold text-indigo-650 dark:text-indigo-400 font-mono">
                    {activeUnsubmittedLiveTest.maxMarks} Marks
                  </span>
                </div>
              </div>
            </div>

            {/* Compliance Seat Holder Verification Section */}
            <div className="bg-slate-550/5 dark:bg-slate-850 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider block">
                Workstation Seat Check
              </span>
              
              {activeStudent.assignedComputerDeskCode ? (
                <div className="flex items-center space-x-2 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-2 rounded-xl border border-emerald-500/20">
                  <span>🔒</span>
                  <span>Verified: Desk Station <strong>{activeStudent.assignedComputerDeskCode}</strong> (Allotted)</span>
                </div>
              ) : (
                <div className="space-y-1.5 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  <p className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400">
                    ⚠️ Desk Station Verification Required
                  </p>
                  <p className="text-[9px] text-slate-600 dark:text-slate-400 leading-normal">
                    You have not been assigned a computer desk. Please seek verification from your supervisor with:
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded font-mono font-bold">
                      Name: {activeStudent.name}
                    </span>
                    <span className="text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded font-mono font-bold">
                      Roll No: {activeStudent.rollNo}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!activeStudent.assignedComputerDeskCode) {
                    alert(`🔒 COMPLIANCE VERIFICATION DENIED:\n\nThis is a SECURE desk-bound test. You have no registered seat.\n\nPlease ask your Batch supervisor to click 'Verify & Allot Desk' for Name: ${activeStudent.name}, Roll: ${activeStudent.rollNo}. Once alloted, this exam will unlock instantly.`);
                    return;
                  }
                  setActiveQuizToTake(activeUnsubmittedLiveTest);
                  setQuizAnswers({});
                }}
                className="flex-1 bg-indigo-650 hover:bg-slate-900 text-white font-extrabold font-mono text-[10px] uppercase tracking-wider py-3 px-4 rounded-xl transition-all cursor-pointer text-center"
              >
                ✍ Start Laboratory Test
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setDismissedLiveAlerts(prev => ({ ...prev, [activeUnsubmittedLiveTest.id]: true }));
                }}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-250 font-bold px-4 py-3 rounded-xl text-[10px] uppercase transition-all cursor-pointer font-mono"
              >
                Dismiss
              </button>
            </div>

          </div>
        </div>
      )}

      </div>

      {/* Footer Watermark */}
      <div className="mt-12 border-t border-slate-100 pt-6 pb-2 text-center text-xs text-slate-400 font-medium font-sans no-print flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">© 2026 Vishveshwar Foundation Ltd.</span>
        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold">Scholar Terminal Workspace</span>
      </div>
    </div>
  );
}
