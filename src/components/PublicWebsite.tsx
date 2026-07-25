import { useState, useRef, useEffect } from "react";
import { 
  GraduationCap, Phone, Mail, MapPin, Megaphone, 
  User, Sparkles, BookOpen, Award, CheckCircle2, 
  ArrowRight, Clock, HelpCircle, PhoneCall,
  X, Lock, Key, Users, Check, Copy, ShieldAlert, Eye, EyeOff, ClipboardList,
  MessageSquare, Send, Bot, Loader2, RotateCw, RotateCcw, Brain, Menu, Home, Video
} from "lucide-react";
import { Announcement, ContactLead, PublicBatch, Batch, ChatMessage, Teacher, ComputerDesk, OnlineAnnouncement, CounsellingRequest, CounsellingSlot } from "../types";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";

import { School as SchoolType, Student, Test } from "../types";

interface PublicWebsiteProps {
  announcements: Announcement[];
  onlineAnnouncements?: OnlineAnnouncement[];
  onAddLead: (lead: ContactLead) => void;
  onEnterPortal: () => void;
  publicBatches?: PublicBatch[];
  batches?: Batch[];
  students?: Student[];
  teachers?: Teacher[];
  computerDesks?: ComputerDesk[];
  tests?: Test[];
  schools?: SchoolType[];
  onInbuiltLogin: (role: "student" | "teacher" | "admin" | "feemanager" | "admission" | "principal" | "verifier", identifier: string, password: string) => string | null;
  onRegisterStudent: (data: { name: string; batchId: string; schoolName: string; email: string; mobileNumber: string; isGoogleRegistered?: boolean; googleEmail?: string }) => { rollNo: string; password: string };
  onOnlineFeePortalLogin?: (rollNo: string, dobPassword: string) => string | null;
  themeColor?: "indigo" | "emerald" | "crimson" | "amber" | "violet" | "sky" | "saffron";
  onThemeColorChange?: (color: "indigo" | "emerald" | "crimson" | "amber" | "violet" | "sky" | "saffron") => void;
  counsellingRequests: CounsellingRequest[];
  setCounsellingRequests: React.Dispatch<React.SetStateAction<CounsellingRequest[]>>;
  counsellingSlots?: CounsellingSlot[];
  setCounsellingSlots?: React.Dispatch<React.SetStateAction<CounsellingSlot[]>>;
}

export default function PublicWebsite({ 
  announcements, 
  onlineAnnouncements = [],
  onAddLead, 
  onEnterPortal, 
  publicBatches = [],
  batches = [],
  students = [],
  teachers = [],
  computerDesks = [],
  tests = [],
  schools = [],
  onInbuiltLogin,
  onRegisterStudent,
  onOnlineFeePortalLogin,
  themeColor = "indigo",
  onThemeColorChange = () => {},
  counsellingRequests,
  setCounsellingRequests,
  counsellingSlots = [],
  setCounsellingSlots = () => {}
}: PublicWebsiteProps) {
  // Navigation active tab (local scroll anchors)
  const [activeNav, setActiveNav] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [batchTab, setBatchTab] = useState<"programs" | "cohorts">("programs");

  // --- WEBSITE AI CHATBOT STATES ---
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState<ChatMessage[]>(() => {
    const saved = sessionStorage.getItem("mpdigitalschool_website_chat");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: "welcome_msg",
        role: "model",
        content: `Welcome to **Study Hub**! 🎓\n\nI am your **AI Academic Counselor & Support Assistant** powered by Google Gemini Artificial Intelligence.\n\nAsk me anything! For example:\n- What courses do you offer for IIT-JEE/NEET? 📚\n- How can I register for a student account? 📝\n- What is the tuition fee structure? 💳\n- Tell me about the laboratory or study desks. 🖥️\n- Ask me any Physics question you want to solve! 💡`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [chatbotInput, setChatbotInput] = useState("");
  const [isChatbotSending, setIsChatbotSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Sync state to sessionStorage whenever it changes and trigger scrolling
  useEffect(() => {
    sessionStorage.setItem("mpdigitalschool_website_chat", JSON.stringify(chatbotMessages));
    if (isChatbotOpen) {
      setTimeout(() => {
        chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [chatbotMessages, isChatbotOpen]);

  const handleSendWebsiteMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || chatbotInput;
    if (!textToSend.trim() || isChatbotSending) return;

    const userMsg: ChatMessage = {
      id: "usrmsg_" + Date.now(),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatbotMessages(prev => [...prev, userMsg]);
    if (!customText) setChatbotInput("");
    setIsChatbotSending(true);

    const nextThread = [...chatbotMessages, userMsg].slice(-10);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextThread.map(m => ({ role: m.role, content: m.content })),
          lessonTitle: "Study Hub Admissions Hotline & Helpdesk",
          subjectName: "Study Hub Public Portal"
        })
      });

      if (!res.ok) {
        throw new Error("Failed to contact the AI engine");
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: "botmsg_" + Date.now(),
        role: "model",
        content: data.reply || "I apologize, but I could not formulate a response at this time. Please check your network or try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatbotMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: "botmsg_" + Date.now(),
        role: "model",
        content: "⚠️ **Connection Error**: I could not reach my artificial intelligence model right now. Please ensure the server is compiled and active, or try asking again in a moment!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatbotMessages(prev => [...prev, errMsg]);
    } finally {
      setIsChatbotSending(false);
    }
  };

  const handleResetWebsiteChat = () => {
    const defaultWelcome: ChatMessage = {
      id: "welcome_msg_" + Date.now(),
      role: "model",
      content: `Let's start fresh! 🎓\n\nHow can I help you today? Ask me about admissions, course timings, computer desks, or any challenging Physics homework problem!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatbotMessages([defaultWelcome]);
    sessionStorage.removeItem("mpdigitalschool_website_chat");
  };

  // --- INBUILT MODAL STATES ---
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // --- GOOGLE GMAIL REGISTRATION SELECTOR STATES ---
  const [isGooglePickerOpen, setIsGooglePickerOpen] = useState(false);
  const [isLoginGooglePickerOpen, setIsLoginGooglePickerOpen] = useState(false);
  const [isGoogleRegistered, setIsGoogleRegistered] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");

  // --- SECURE STUDENT FEE PORTAL STATES ---
  const [isFeePortalOpen, setIsFeePortalOpen] = useState(false);
  const [feeRoll, setFeeRoll] = useState("");
  const [feeDob, setFeeDob] = useState("");
  const [feeError, setFeeError] = useState("");

  // --- ONLINE STUDENT MARKSHEET PORTAL STATES ---
  const [isMarksheetOpen, setIsMarksheetOpen] = useState(false);
  const [searchRoll, setSearchRoll] = useState("");
  const [marksheetError, setMarksheetError] = useState("");
  const [checkedStudent, setCheckedStudent] = useState<Student | null>(null);

  // Tabs for Login Modal
  const [loginTab, setLoginTab] = useState<"student" | "office">("student");
  const [officeRole, setOfficeRole] = useState<"admin" | "teacher" | "feemanager" | "admission" | "principal" | "verifier">("teacher");

  // Inputs for login
  const [loginId, setLoginId] = useState("");
  const [loginPwd, setLoginPwd] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  // Inputs for registration
  const [regName, setRegName] = useState("");
  const [regBatchId, setRegBatchId] = useState("");
  const [regSchool, setRegSchool] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regSuccessData, setRegSuccessData] = useState<{ rollNo: string; password: string } | null>(null);
  const [registerError, setRegisterError] = useState("");

  // Contact form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    courseInterest: publicBatches.length > 0 ? publicBatches[0].name : "Other / General Query",
    message: ""
  });
  
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Counselling center states
  const [counselName, setCounselName] = useState("");
  const [counselEmail, setCounselEmail] = useState("");
  const [counselPhone, setCounselPhone] = useState("");
  const [counselTopic, setCounselTopic] = useState("Academic Stress");
  const [counselDesc, setCounselDesc] = useState("");
  const [counselDate, setCounselDate] = useState("");
  const [counselSuccess, setCounselSuccess] = useState<CounsellingRequest | null>(null);
  const [counselError, setCounselError] = useState("");

  // Portal session tracking states
  const [trackUsername, setTrackUsername] = useState("");
  const [trackPassword, setTrackPassword] = useState("");
  const [activeCounselSession, setActiveCounselSession] = useState<CounsellingRequest | null>(null);
  const [trackError, setTrackError] = useState("");
  const [counselChatInput, setCounselChatInput] = useState("");

  const handleCounselSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCounselError("");
    setCounselSuccess(null);

    if (!counselName.trim() || !counselEmail.trim() || !counselDesc.trim() || !counselDate) {
      setCounselError("Please complete all required fields including choosing an available counselling slot.");
      return;
    }

    const selectedSlot = counsellingSlots.find(s => s.id === counselDate);
    if (!selectedSlot) {
      setCounselError("Selected slot is invalid or no longer available.");
      return;
    }

    const uniqueId = "CR-" + Date.now().toString().slice(-6);
    const tempUser = counselName.trim().toLowerCase().replace(/\s+/g, "_") + "_" + Math.floor(100 + Math.random() * 900);
    const tempPass = "pwd_" + Math.random().toString(36).substring(2, 7);

    // Format datetime nicely (e.g. 3 Jul 2026 at 10:00 AM)
    const dateObj = new Date(selectedSlot.datetime);
    const formattedDateTime = isNaN(dateObj.getTime()) 
      ? selectedSlot.datetime 
      : `${dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at ${dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

    const newRequest: CounsellingRequest = {
      id: uniqueId,
      studentName: counselName.trim(),
      email: counselEmail.trim(),
      phone: counselPhone.trim() || undefined,
      topic: counselTopic,
      description: counselDesc.trim(),
      status: "Pending",
      tempUsername: tempUser,
      tempPassword: tempPass,
      createdAt: new Date().toISOString(),
      scheduledAt: formattedDateTime,
      notes: ""
    };

    // Mark slot as booked
    setCounsellingSlots(prev => prev.map(s => s.id === selectedSlot.id ? { ...s, isBooked: true, bookedByRequestId: uniqueId } : s));

    setCounsellingRequests(prev => [newRequest, ...prev]);
    setCounselSuccess(newRequest);
    
    // Clear form
    setCounselName("");
    setCounselEmail("");
    setCounselPhone("");
    setCounselDesc("");
    setCounselDate("");
  };

  const handleTrackSession = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError("");
    setActiveCounselSession(null);

    if (!trackUsername.trim() || !trackPassword.trim()) {
      setTrackError("Please enter both temporary username and password.");
      return;
    }

    const found = counsellingRequests.find(
      r => r.tempUsername === trackUsername.trim() && r.tempPassword === trackPassword.trim()
    );

    if (!found) {
      setTrackError("Invalid temporary username or password. Please verify your credentials.");
      return;
    }

    if (found.status === "Closed") {
      setTrackError("This counselling session is CLOSED. Your temporary username and password have expired.");
      return;
    }

    setActiveCounselSession(found);
  };

  const handleSendCounselChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counselChatInput.trim() || !activeCounselSession) return;

    const updatedMessages = [
      ...((activeCounselSession as any).chat || []),
      {
        sender: activeCounselSession.studentName,
        text: counselChatInput.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    const updatedSession = {
      ...activeCounselSession,
      chat: updatedMessages
    };

    setCounsellingRequests(prev => prev.map(r => r.id === activeCounselSession.id ? updatedSession : r));
    setActiveCounselSession(updatedSession);
    setCounselChatInput("");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setSubmitError("Please fill in all primary credential fields.");
      return;
    }

    const newLead: ContactLead = {
      id: "lead_" + Date.now(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      courseInterest: formData.courseInterest,
      message: formData.message.trim() || "No custom query text provided.",
      status: "New",
      date: new Date().toISOString().split("T")[0]
    };

    onAddLead(newLead);
    setSubmitSuccess(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      courseInterest: "IIT-JEE Intensive Focus",
      message: ""
    });
  };

  // Filter public global announcements (batchId === "all" and isPublished is true or undefined)
  const globalAnnouncements = announcements.filter(
    ann => ann.batchId === "all" && ann.isPublished !== false
  );

  const displayAnnouncements = onlineAnnouncements.length > 0
    ? onlineAnnouncements.filter(ann => ann.isPublished !== false)
    : globalAnnouncements;

  const scrollToSection = (id: string) => {
    setActiveNav(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* 1. STICKY BLURRY NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div 
            onClick={() => scrollToSection("home")}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white ring-4 ring-indigo-500/15 group-hover:scale-105 duration-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white uppercase block leading-none">
                Study Hub
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-slate-400">
            <button 
              onClick={() => scrollToSection("home")} 
              className={`hover:text-white transition-colors cursor-pointer ${activeNav === "home" ? "text-indigo-400 font-black" : ""}`}
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection("about")} 
              className={`hover:text-white transition-colors cursor-pointer ${activeNav === "about" ? "text-indigo-400 font-black" : ""}`}
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection("courses")} 
              className={`hover:text-white transition-colors cursor-pointer ${activeNav === "courses" ? "text-indigo-400 font-black" : ""}`}
            >
              Batches
            </button>
            <button 
              onClick={() => scrollToSection("notices")} 
              className={`hover:text-white transition-colors cursor-pointer ${activeNav === "notices" ? "text-indigo-400 font-black" : ""}`}
            >
              Noticeboard
              {globalAnnouncements.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-red-500 text-white rounded-full font-mono font-bold animate-pulse">
                  {globalAnnouncements.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => scrollToSection("counselling")} 
              className={`hover:text-white transition-colors cursor-pointer ${activeNav === "counselling" ? "text-indigo-400 font-black" : ""}`}
            >
              Counselling
            </button>
            <button 
              onClick={() => scrollToSection("contact")} 
              className={`hover:text-white transition-colors cursor-pointer ${activeNav === "contact" ? "text-indigo-400 font-black" : ""}`}
            >
              Contact Us
            </button>
          </nav>

          {/* Unified Login and Registration Buttons */}
          <div className="hidden xl:flex items-center space-x-3">
            <button
              onClick={onEnterPortal}
              className="py-2.5 px-4 bg-amber-600 hover:bg-amber-500 active:scale-95 text-xs font-black uppercase tracking-widest text-white rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer transition-all duration-150 flex items-center space-x-1.5 border border-transparent"
            >
              <ClipboardList className="w-4 h-4 text-amber-100" />
              <span>Admissions Office</span>
            </button>

            <button
              onClick={() => {
                setFeeRoll("");
                setFeeDob("");
                setFeeError("");
                setIsFeePortalOpen(true);
              }}
              id="header-fee-portal-btn"
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-xs font-black uppercase tracking-widest text-white rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer transition-all duration-150 flex items-center space-x-1.5 border border-transparent"
            >
              <span className="font-bold text-xs bg-emerald-850 px-1 py-0.5 rounded text-emerald-100 font-mono">₹</span>
              <span>Online Fee Portal</span>
            </button>

            <button
              onClick={() => {
                setSearchRoll("");
                setMarksheetError("");
                setCheckedStudent(null);
                setIsMarksheetOpen(true);
              }}
              id="header-marksheet-btn"
              className="py-2.5 px-4 bg-pink-600 hover:bg-pink-500 active:scale-95 text-xs font-black uppercase tracking-widest text-white rounded-xl shadow-lg shadow-pink-500/20 cursor-pointer transition-all duration-150 flex items-center space-x-1.5 border border-transparent"
            >
              <Award className="w-4 h-4 text-pink-100" />
              <span>Online Marksheet</span>
            </button>

            <button
              onClick={onEnterPortal}
              id="header-login-btn"
              className="py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-xs font-black uppercase tracking-widest text-white rounded-xl shadow-lg shadow-indigo-600/10 cursor-pointer transition-all duration-150 flex items-center space-x-1.5"
            >
              <span>Login Portal</span>
              <span className="font-mono text-sm">→</span>
            </button>

            <button
              onClick={() => {
                setRegName("");
                setRegSchool("");
                setRegEmail("");
                setRegMobile("");
                setRegBatchId(batches.length > 0 ? batches[0].id : "");
                setRegSuccessData(null);
                setRegisterError("");
                setIsRegisterModalOpen(true);
               }}
              id="header-register-btn"
              className="py-2.5 px-5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 text-xs font-black uppercase tracking-widest rounded-xl transition duration-150 cursor-pointer active:scale-95"
            >
              <span>Register</span>
            </button>
          </div>

          {/* Compact Mobile Hamburger Action bar */}
          <div className="xl:hidden flex items-center space-x-1.5">
            <button
              onClick={() => {
                setFeeRoll("");
                setFeeDob("");
                setFeeError("");
                setIsFeePortalOpen(true);
              }}
              className="py-1.5 px-2 bg-emerald-650 hover:bg-emerald-600 text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-widest rounded-lg transition duration-150 active:scale-95 flex items-center space-x-1 cursor-pointer"
            >
              <span className="font-black bg-emerald-900 border border-emerald-700 px-1 py-0.2 rounded font-mono text-[9px]">₹</span>
              <span className="hidden sm:inline">Fee Portal</span>
            </button>
            <button
              onClick={() => {
                setSearchRoll("");
                setMarksheetError("");
                setCheckedStudent(null);
                setIsMarksheetOpen(true);
              }}
              className="py-1.5 px-2 bg-pink-700 hover:bg-pink-650 text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-widest rounded-lg transition duration-150 active:scale-95 flex items-center space-x-1 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-pink-100" />
              <span className="hidden sm:inline">Marksheet</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 cursor-pointer hover:bg-slate-850 hover:border-slate-750 transition flex items-center space-x-1"
              title="Open Navigation Menu"
              id="header-mobile-hamburger-btn"
            >
              <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-indigo-400 select-none">Menu</span>
              <Menu className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Website Sidebar Navigation Drawer Overlay & Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-[100] cursor-pointer"
            />
            {/* Sidebar Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="fixed top-0 right-0 h-full w-[290px] sm:w-[320px] bg-slate-950 border-l border-slate-850/80 p-5 shadow-2xl z-[101] flex flex-col justify-between overflow-y-auto font-sans"
            >
              <div className="space-y-6">
                {/* Drawer Branding & Exit Header */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold ring-4 ring-indigo-500/10">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-black text-white uppercase tracking-tight leading-none">Study Hub</h4>
                      <p className="text-[8px] text-indigo-450 font-mono tracking-widest uppercase mt-0.5 leading-none">Main Site Sidebar</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-400 hover:text-white cursor-pointer transition active:scale-95"
                    title="Close Sidebar Menu"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Main Anchored Navigation Links */}
                <div className="space-y-1.5 text-left">
                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest pl-2 mb-2">Browse Sections</span>
                  
                  <button
                    onClick={() => {
                      scrollToSection("home");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-3 transition-all cursor-pointer ${
                      activeNav === "home" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15" : "text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent"
                    }`}
                  >
                    <Home className="w-4 h-4 text-indigo-500" />
                    <span>Home Screen</span>
                  </button>

                  <button
                    onClick={() => {
                      scrollToSection("about");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-3 transition-all cursor-pointer ${
                      activeNav === "about" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15" : "text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent"
                    }`}
                  >
                    <User className="w-4 h-4 text-indigo-500" />
                    <span>About Institute</span>
                  </button>

                  <button
                    onClick={() => {
                      scrollToSection("courses");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-3 transition-all cursor-pointer ${
                      activeNav === "courses" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15" : "text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent"
                    }`}
                  >
                    <ClipboardList className="w-4 h-4 text-indigo-500" />
                    <span>Academic Batches</span>
                  </button>

                  <button
                    onClick={() => {
                      scrollToSection("notices");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-3 transition-all cursor-pointer relative ${
                      activeNav === "notices" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15" : "text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent"
                    }`}
                  >
                    <Megaphone className="w-4 h-4 text-indigo-500" />
                    <span>General Noticeboard</span>
                    {globalAnnouncements.length > 0 && (
                      <span className="absolute right-3.5 bg-red-650 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                        {globalAnnouncements.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      scrollToSection("counselling");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-3 transition-all cursor-pointer ${
                      activeNav === "counselling" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15" : "text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Online Counselling</span>
                  </button>

                  <button
                    onClick={() => {
                      scrollToSection("contact");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-3 transition-all cursor-pointer ${
                      activeNav === "contact" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15" : "text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent"
                    }`}
                  >
                    <Phone className="w-4 h-4 text-indigo-500" />
                    <span>Inquiry Admissions</span>
                  </button>
                </div>

                {/* Instant Portal Launchers Section */}
                <div className="space-y-2 pt-4 border-t border-slate-900 text-left">
                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest pl-2 mb-2">Gatekeepers Access</span>
                  
                  <button
                    onClick={() => {
                      onEnterPortal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-3 bg-amber-950/40 text-amber-300 hover:bg-amber-950/60 border border-amber-900/30 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center space-x-3 transition duration-150 cursor-pointer"
                  >
                    <ClipboardList className="w-4 h-4 text-amber-500" />
                    <span>Admissions Office Desk</span>
                  </button>

                  <button
                    onClick={() => {
                      setFeeRoll("");
                      setFeeDob("");
                      setFeeError("");
                      setIsFeePortalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-3 bg-emerald-950/40 text-emerald-450 hover:bg-emerald-950/60 border border-emerald-900/30 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center space-x-3 transition duration-150 cursor-pointer"
                  >
                    <span className="bg-emerald-900 text-emerald-100 font-bold px-1.5 py-0.5 rounded text-[10px] font-mono border border-emerald-700">₹</span>
                    <span>Online Fee Portal</span>
                  </button>

                  <button
                    onClick={() => {
                      onEnterPortal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-3 bg-indigo-950/40 text-indigo-400 hover:bg-indigo-950/60 border border-indigo-900/30 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center space-x-3 transition duration-150 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-indigo-455" />
                    <span>Unified Academics Login</span>
                  </button>

                  <button
                    onClick={() => {
                      setRegName("");
                      setRegSchool("");
                      setRegEmail("");
                      setRegMobile("");
                      setRegBatchId(batches.length > 0 ? batches[0].id : "");
                      setRegSuccessData(null);
                      setRegisterError("");
                      setIsRegisterModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-3 bg-slate-900 text-slate-350 hover:bg-slate-850 hover:text-white border border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center space-x-3 transition duration-150 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Fast Registration</span>
                  </button>
                </div>
              </div>

              {/* Sidebar footer section */}
              <div className="border-t border-slate-900 pt-4 text-center">
                <span className="block text-[8px] font-mono uppercase tracking-widest text-slate-500">🛡️ SECURE SESSION GUARANTEE</span>
                <p className="text-[7.5px] text-slate-600 mt-1 uppercase font-semibold">ALL LOGINS ENFORCED WITH SECURE SSL ENVIRONMENT</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. MAIN HERO BANNER */}
      <section id="home" className="relative py-16 lg:py-24 px-4 lg:px-8 overflow-hidden border-b border-slate-900 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
        {/* Animated Background Orbs */}
        <div className="absolute top-10 right-10 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[130px] -z-10" />
        <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-emerald-600/5 rounded-full blur-[100px] -z-10" />
        
        {/* Academic Marquee Notice bar */}
        <div className="max-w-7xl mx-auto mb-8 bg-indigo-950/40 border border-indigo-500/20 rounded-full px-5 py-2.5 flex items-center justify-between text-xs text-indigo-300">
          <div className="flex items-center space-x-2.5 truncate">
            <span className="bg-indigo-500 text-slate-950 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 select-none">
              Notice
            </span>
            <span className="truncate font-medium">⭐ Admissions Open for Academic Year 2026 - 2027. Fast registration is open for state-board and competitive batches.</span>
          </div>
          <button 
            onClick={() => scrollToSection("notices")} 
            className="text-indigo-400 hover:text-white underline text-[10px] uppercase tracking-wider font-extrabold ml-4 shrink-0"
          >
            Read Bulletins
          </button>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Co-Educational Senior Digital Academy</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight font-display">
              Study Hub <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">
                Where Tradition Meets Modern Technology.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl font-sans">
              Welcome to Study Hub, a premier co-educational secondary school and competitive training academy. Under the aegis of the elite Vishveshwar Foundation, we combine traditional conceptual studies in Physics, Chemistry, and Mathematics alongside our high-speed proctored simulator computer testing laboratories, transparent fee portal management, and instant digital transcripts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start space-x-3 bg-slate-900/60 p-4 border border-slate-800 rounded-2xl shadow-xl hover:border-slate-700/60 transition duration-150">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/25 rounded-xl text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-display">Elite Mentorship Core</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Learn directly from senior school faculty, Ph.D. holders, and dedicated coaching mentors.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-900/60 p-4 border border-slate-800 rounded-2xl shadow-xl hover:border-slate-700/60 transition duration-150">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-display">Certified Digital Transcripts</h4>
                  <p className="text-[11px] text-slate-405 mt-1 leading-relaxed font-sans">Instant semester transcripts, mock ranks, and terminal report card evaluation via our online desk.</p>
                </div>
              </div>
            </div>

            {/* CTA action rows */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <button
                onClick={() => scrollToSection("contact")}
                className="py-3.5 px-8 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs text-white font-black uppercase tracking-widest rounded-xl text-center shadow-lg shadow-indigo-600/20 cursor-pointer duration-150"
              >
                Inquire For Callback
              </button>
              <button
                onClick={onEnterPortal}
                className="py-3.5 px-8 bg-slate-850 hover:bg-slate-800 border border-slate-700 active:scale-95 text-xs rounded-xl text-center cursor-pointer duration-150 group"
              >
                <span className="font-serif italic font-black text-sm text-indigo-400 group-hover:text-indigo-300 tracking-wider">
                  Learn With Fun
                </span>
              </button>
            </div>
          </div>

          {/* Hero Right: Academic Board Bento highlights */}
          <div className="lg:col-span-5 relative">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 rounded-[2rem] shadow-2xl relative space-y-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
              
              <div className="border-b border-slate-800/80 pb-4 text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 font-mono block">INSTITUTE LOG ENTRY</span>
                <h3 className="text-xl font-black text-white mt-1 uppercase font-display">2026 Academic Metrics</h3>
                <p className="text-xs text-slate-400 mt-1">Real-time parameters of curriculum success rates.</p>
              </div>

              {/* Statistical Bento elements */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl text-left hover:border-indigo-500/30 transition-all duration-200">
                  <span className="text-slate-500 text-[10px] uppercase font-mono block">ENROLLED SCHOLARS</span>
                  <span className="text-xl font-black text-white block mt-0.5 font-display">
                    {students.length + 1445}+
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold block mt-1">
                    ↑ {students.length} Live Records
                  </span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl text-left hover:border-indigo-500/30 transition-all duration-200">
                  <span className="text-slate-500 text-[10px] uppercase font-mono block">REPUTED FACULTY</span>
                  <span className="text-xl font-black text-white block mt-0.5 font-display">
                    {teachers.length + 25}+
                  </span>
                  <span className="text-[9px] text-indigo-400 font-bold block mt-1">
                    {teachers.length} Active Staff
                  </span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl text-left hover:border-indigo-500/30 transition-all duration-200">
                  <span className="text-slate-500 text-[10px] uppercase font-mono block">LAB COMPUTER DESKS</span>
                  <span className="text-xl font-black text-white block mt-0.5 font-display">
                    {computerDesks.length + 115}+
                  </span>
                  <span className="text-[9px] text-amber-500 uppercase font-bold block mt-1">
                    {computerDesks.length} Mapped Terminals
                  </span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl text-left hover:border-indigo-500/30 transition-all duration-200">
                  <span className="text-slate-500 text-[10px] uppercase font-mono block">CLASS COHORTS</span>
                  <span className="text-xl font-black text-white block mt-0.5 font-display">
                    {batches.length} Active
                  </span>
                  <span className="text-[9px] text-emerald-405 text-emerald-400 font-bold block mt-1">
                    {tests.length} Live Exams
                  </span>
                </div>
              </div>

              {/* Rapid Information bullet */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-dashed border-slate-800 text-left space-y-1.5">
                <div className="flex items-center space-x-1.5 text-indigo-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[9px] font-black uppercase tracking-wider font-mono">Admission Desk circular update</span>
                </div>
                <p className="text-[10.5px] text-slate-355 leading-relaxed font-sans">
                  Online enrollment is presently integrated with offline verification desks. Fill your online inquiries and clear previous dues on our online Portal.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2.1 DESK OF THE DIRECTOR & PRINCIPAL SIGNATURE */}
      <section className="py-16 bg-slate-900 border-b border-slate-950 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
          
          {/* Principal Visual Silhouette */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative p-2.5 bg-slate-950 border border-slate-800 rounded-[2.5rem] shadow-2xl max-w-xs group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 duration-500" />
              <div className="w-[240px] aspect-[4/5] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2rem] flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden border border-slate-800">
                <div className="w-20 h-20 bg-indigo-650/40 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-300">
                  <GraduationCap className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider font-display">Shri V. Pandey</h4>
                  <p className="text-[10px] text-indigo-350 font-mono tracking-widest uppercase font-bold mt-1">Founder & Managing Director</p>
                  <p className="text-[9px] text-slate-500 italic mt-2">"Structuring character, building excellence."</p>
                </div>
              </div>
            </div>
          </div>

          {/* Director message block */}
          <div className="lg:col-span-8 space-y-5">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-[9px] font-black uppercase tracking-widest font-mono">
              <span>ADMINISTRATION DESK BULLETIN MESSAGE</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-display">
              Welcome to the digital campus core
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              "At Study Hub, we believe educational design must adapt to technical advancements without diluting the core structural morals of traditional academia. Our institute stands at this crucial intersection. Every science aspirant enrolled gains custom-tailored personal support, designated physical and computerized desks, and comprehensive analytics."
            </p>

            <blockquote className="border-l-2 border-indigo-500 pl-4 py-1 italic text-xs text-slate-400 font-sans">
              "Transparency is our highest hallmark. Our Online Fee payment desk allows guardians to pay installments and fetch digital receipts instantly, while our Online Marksheet Portal distributes real-time grades directly to scholars' mobile screens without delays. This guarantees complete peace of mind."
            </blockquote>

            <div className="flex items-center space-x-4 pt-2">
              <div className="border-r border-slate-800 pr-4">
                <span className="text-slate-500 block text-[9px] uppercase font-mono">AUTHORIZED OFFICER</span>
                <span className="text-xs font-black text-white uppercase">Registrar Office</span>
              </div>
              <div>
                <span className="text-slate-550 block text-[9px] uppercase font-mono">INSTITUTE CODE</span>
                <span className="text-xs font-mono font-bold text-indigo-400">STUDY-HUB-2026</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. ABOUT SECTION - CORE FACILITIES BENTO */}
      <section id="about" className="py-20 bg-slate-950 px-4 lg:px-8 border-b border-slate-900">
        <div className="max-w-7xl mx-auto text-left">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold bg-indigo-950/40 border border-indigo-500/10 px-3.5 py-1 rounded-full">School Pillars & Facilities</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-display">Modern Infrastructure Highlights</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              Study Hub operates a top-tier digital ecosystem structured for standard, daily scientific evaluations. Below are the key pillars of our infrastructure:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            
            {/* Card 1 */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl hover:border-slate-700/60 transition duration-150 relative group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 duration-200">
                <BookOpen className="w-5 h-5 text-indigo-400" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider font-display">Secondary & Board Faculty</h4>
              <p className="text-xs text-slate-404 leading-relaxed font-sans">
                We prepare students completely matching the curriculum patterns of school term boards alongside Advanced JEE Mains / NEET structures.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl hover:border-slate-700/60 transition duration-150 relative group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 duration-200">
                <Award className="w-5 h-5 text-indigo-400" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider font-display">Verified Computer Desk Lab</h4>
              <p className="text-xs text-slate-404 leading-relaxed font-sans">
                Secure student proctor desks where identification keys and verified computer logins are mandatory for taking online examinations.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl hover:border-slate-700/60 transition duration-150 relative group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 duration-200">
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider font-display">Dual Parent-Student Portals</h4>
              <p className="text-xs text-slate-404 leading-relaxed font-sans">
                Completely independent portal login dashboards where students run proctored evaluations and administrators control circular alerts.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl hover:border-slate-700/60 transition duration-150 relative group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 duration-200">
                <ShieldAlert className="w-5 h-5 text-indigo-400" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider font-display">Durable Fee Transparency</h4>
              <p className="text-xs text-slate-404 leading-relaxed font-sans">
                Guardians log in securely with students' roll code and date of birth passwords to view remaining balances, process payments, and retrieve receipts.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. STEP-BY-STEP ADMISSIONS PROCEDURAL ROADMAP */}
      <section className="py-20 bg-slate-900 border-b border-slate-950 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto text-left space-y-12">
          
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold bg-indigo-950/40 border border-indigo-500/15 px-3.5 py-1 rounded-full">Seat Procurement Guide</span>
            <h2 className="text-3xl font-black text-white uppercase font-display">How to Secure Admission</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              Our structured step-by-step admissions lifecycle makes student registration straightforward and fully automated:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between space-y-4">
              <div className="absolute top-4 right-4 text-3xl font-black text-indigo-650/30 font-mono">01</div>
              <div className="space-y-2 text-left">
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">Inquiry</span>
                <h4 className="text-sm font-black text-white uppercase tracking-tight font-display">Callback Inquiry</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fill in your primary details in the inquiry lead sheet at the bottom of this website to request an expert calling.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between space-y-4">
              <div className="absolute top-4 right-4 text-3xl font-black text-indigo-650/30 font-mono">02</div>
              <div className="space-y-2 text-left">
                <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">Counseling</span>
                <h4 className="text-sm font-black text-white uppercase tracking-tight font-display">AI Desk Session</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ask our floating Gemini AI chatbot counselor about course structures, board subjects, fees, or custom physics answers.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between space-y-4">
              <div className="absolute top-4 right-4 text-3xl font-black text-indigo-650/30 font-mono">03</div>
              <div className="space-y-2 text-left">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">Registration</span>
                <h4 className="text-sm font-black text-white uppercase tracking-tight font-display">Roll Number setup</h4>
                <p className="text-xs text-slate-405 leading-relaxed">
                  Click 'Register' in the top header. Claim your unique roll code and password immediately on completion.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between space-y-4">
              <div className="absolute top-4 right-4 text-3xl font-black text-indigo-650/30 font-mono">04</div>
              <div className="space-y-2 text-left">
                <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">Settle Dues</span>
                <h4 className="text-sm font-black text-white uppercase tracking-tight font-display">Portal Entrance</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Log in to school desk, settle your terminal fee installments securely online, and check your digital transcripts instantly.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4.1 ACADEMIC BATCH WORKPLACE SHOWCASE */}
      <section id="courses" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto text-left relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
        
        <div className="space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold bg-indigo-950/40 border border-indigo-500/15 px-3.5 py-1 rounded-full inline-block">Active Streams & Batches</span>
          <h2 className="text-3xl font-black text-white uppercase font-display">Our Structured Academic Batches</h2>
          <p className="text-xs text-slate-400 max-w-2xl font-sans">
            Enroll directly in designated academy streams tailored for senior school board tests and competitive JEE/NEET science curriculum matches.
          </p>
        </div>

        {/* DYNAMIC DATA TAB SWITCHER FOR REAL-TIME REFLECTION */}
        <div className="mt-8 flex items-center space-x-2 border-b border-slate-900 pb-2 relative z-10">
          <button
            onClick={() => setBatchTab("programs")}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-extrabold cursor-pointer transition-all border-b-2 duration-150 ${
              batchTab === "programs"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            Admissions Streams & Programs ({publicBatches.filter(b => b.isPublished).length})
          </button>
          <button
            onClick={() => setBatchTab("cohorts")}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-extrabold cursor-pointer transition-all border-b-2 duration-150 ${
              batchTab === "cohorts"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            In-Session Class Cohorts ({batches.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 relative z-10 font-sans">
          {batchTab === "programs" ? (
            <>
              {publicBatches.filter(b => b.isPublished).map((batch, index) => {
                const colors = [
                  { border: "hover:border-indigo-500/40", text: "text-indigo-400", bg: "bg-indigo-500/10" },
                  { border: "hover:border-emerald-500/40", text: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { border: "hover:border-purple-500/40", text: "text-purple-400", bg: "bg-purple-500/10" },
                  { border: "hover:border-amber-500/40", text: "text-amber-500", bg: "bg-amber-500/10" }
                ];
                const color = colors[index % colors.length];
                return (
                  <div 
                    key={batch.id} 
                    className={`bg-slate-900 border border-slate-800 ${color.border} transition-all duration-200 p-6 rounded-3xl flex flex-col justify-between shadow-xl`}
                  >
                    <div className="space-y-4 text-left">
                      <div className="flex justify-between items-start">
                        <span className={`text-[9px] font-black ${color.text} tracking-wider ${color.bg} px-2.5 py-1 rounded-md uppercase font-mono`}>
                          {batch.department}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{batch.duration}</span>
                      </div>
                      <h3 className="text-base font-black text-white font-display uppercase tracking-wider">{batch.name}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {batch.description}
                      </p>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs">
                      <span className="text-[10.5px] text-slate-500">School Faculty: <strong className="text-slate-350 font-sans">Admitted Unit</strong></span>
                      <button 
                        onClick={() => scrollToSection("contact")} 
                        className={`${color.text} font-black uppercase tracking-wider text-[10px] hover:underline flex items-center space-x-1 cursor-pointer font-sans`}
                      >
                        <span>Send Inquiry</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {publicBatches.filter(b => b.isPublished).length === 0 && (
                <div className="col-span-full py-16 text-center bg-slate-900 border border-dashed border-slate-800 rounded-3xl">
                  <BookOpen className="w-10 h-10 text-slate-650 mx-auto mb-3" />
                  <p className="text-sm font-black text-slate-300 uppercase tracking-wider font-display">No streams are publishing lists currently</p>
                  <p className="text-xs text-slate-500 mt-1">Please review details during central registration seasons.</p>
                </div>
              )}
            </>
          ) : (
            <>
              {batches.map((batch, index) => {
                const colors = [
                  { border: "hover:border-indigo-500/40", text: "text-indigo-400", bg: "bg-indigo-500/10" },
                  { border: "hover:border-emerald-500/40", text: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { border: "hover:border-purple-500/40", text: "text-purple-400", bg: "bg-purple-500/10" },
                  { border: "hover:border-amber-500/40", text: "text-amber-500", bg: "bg-amber-500/10" }
                ];
                const color = colors[index % colors.length];
                return (
                  <div 
                    key={batch.id} 
                    className={`bg-slate-900 border border-slate-800 ${color.border} transition-all duration-200 p-6 rounded-3xl flex flex-col justify-between shadow-xl`}
                  >
                    <div className="space-y-4 text-left">
                      <div className="flex justify-between items-start">
                        <span className={`text-[9px] font-black ${color.text} tracking-wider ${color.bg} px-2.5 py-1 rounded-md uppercase font-mono`}>
                          {batch.subject}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{batch.code}</span>
                      </div>
                      <h3 className="text-base font-black text-white font-display uppercase tracking-wider">{batch.name}</h3>
                      <p className="text-xs text-slate-350 leading-relaxed">
                        ⏲️ Timing: {batch.schedule}
                      </p>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs">
                      <span className="text-[10.5px] text-slate-500">Live Census: <strong className="text-indigo-400 font-sans font-extrabold">{batch.studentIds.length} Scholars Enrolled</strong></span>
                      <button 
                        onClick={() => scrollToSection("contact")} 
                        className={`${color.text} font-black uppercase tracking-wider text-[10px] hover:underline flex items-center space-x-1 cursor-pointer font-sans`}
                      >
                        <span>Request Join</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {batches.length === 0 && (
                <div className="col-span-full py-16 text-center bg-slate-900 border border-dashed border-slate-800 rounded-3xl">
                  <BookOpen className="w-10 h-10 text-slate-650 mx-auto mb-3" />
                  <p className="text-sm font-black text-slate-300 uppercase tracking-wider font-display">No classroom sessions logged in database</p>
                  <p className="text-xs text-slate-500 mt-1">Check back once school faculty configures registered cohorts.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 5. NOTICEBOARD / PUBLIC ANNOUNCEMENTS SECTION */}
      <section id="notices" className="py-20 bg-slate-900 px-4 lg:px-8 border-y border-slate-950">
        <div className="max-w-7xl mx-auto text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pb-8 border-b border-slate-800">
            <div className="space-y-2 font-sans">
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold bg-indigo-950/40 border border-indigo-500/10 px-3.5 py-1 rounded-full">School Bulletins</span>
              <h2 className="text-3xl font-black text-white uppercase font-display">Official Institute Announcements</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl font-sans">
                Real-time official notices and circular updates issued directly from the Principal Desk and Administration office.
              </p>
            </div>
            
            <div className="bg-indigo-500/10 border border-indigo-500/25 rounded-2xl p-3 px-4 text-xs text-indigo-300 font-bold flex items-center space-x-2 shrink-0">
              <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Real-time Live Notice Sync</span>
            </div>
          </div>

          {displayAnnouncements.length === 0 ? (
            <div className="mt-12 text-center py-16 bg-slate-950 border border-dashed border-slate-850 rounded-[2rem] max-w-3xl mx-auto space-y-3">
              <Megaphone className="w-10 h-10 text-indigo-500/60 mx-auto animate-bounce" />
              <p className="text-xs font-black text-slate-350 uppercase tracking-widest font-mono">Daily bulletin registers are clear</p>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans max-w-sm mx-auto">There are no urgent global announcements published today. All secondary and competitive schedules are normal.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 animate-fadeIn">
              {displayAnnouncements.map(ann => (
                <div 
                  key={ann.id} 
                  className="bg-slate-950 border border-slate-800 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between hover:border-indigo-650/45 transition-all shadow-xl group"
                >
                  <div className="absolute top-0 right-0 w-1 bg-gradient-to-b from-indigo-500 to-transparent h-full group-hover:scale-y-110 duration-200" />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="px-2 py-0.5 bg-indigo-900/40 text-indigo-400 rounded font-mono uppercase tracking-wider font-extrabold">
                        {((ann as any).senderRole || "ADMIN")} CIRCULAR
                      </span>
                      <span className="text-slate-400 font-mono flex items-center space-x-1 font-bold">
                        <Clock className="w-3 h-3" />
                        <span>{ann.date}</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-indigo-455 duration-155 font-display">
                      {ann.title}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed font-semibold font-sans">
                      {ann.content}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-550">
                    <span>Authorized by: <strong className="text-slate-350">{((ann as any).senderName || "System Administrator")}</strong></span>
                    <span className="text-slate-600 uppercase tracking-widest text-[9px] font-mono">Circular Verified</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5.1 COLLAPSIBLE INTERACTIVE FAQ WORKPLACE */}
      <section className="py-20 bg-slate-950 px-4 lg:px-8 border-b border-slate-900">
        <div className="max-w-4xl mx-auto text-left space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold bg-indigo-950/40 border border-indigo-500/15 px-3.5 py-1 rounded-full inline-block">Support Desk FAQ</span>
            <h2 className="text-3xl font-black text-white uppercase font-display">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-md mx-auto">
              Extract instant explanations regarding school dues, marksheets transcripts, and workstation login parameters below:
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How can I log in to the Online Fee Portal and check dues?",
                a: "Guardians and students can click the 'Online Fee Portal' button in the top menu. Enter your registered Roll Number (e.g. CO-2026-001) and your custom Date of Birth password (e.g. 15-08-2010 format) to check pending balances, process transactions securely, and retrieve instant invoice receipts."
              },
              {
                q: "What is the procedure to download my Academic Marksheet?",
                a: "Go to the 'Online Marksheet' launcher in the main navigation. Simply enter your specific Roll Number code to fetch your dynamic semester grades, total percentages, status indicator, and a button to review detailed class metrics instantly."
              },
              {
                q: "What is a 'Verification Desk Key' and is it mandatory for examinations?",
                a: "Yes. For security during proctored academic tests, teachers generate specialized exam keys. Furthermore, if the test is assigned to physical labs, students are required to verify their registration at the faculty desk first to claim their allotted Computer Desk desk number before initiating the testing screen."
              },
              {
                q: "How can I contact the School Admissions Counselor for custom science questions?",
                a: "Our virtual support desk is powered by Google Gemini AI. Click the round chat button in the bottom right corner of this page to launch our AI Academic Support Counselor. Ask about admission structures, fees, or even enter Calculus and Physics questions directly to receive instant solved derivations!"
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-205"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4.5 text-left flex justify-between items-center hover:bg-slate-850/40 duration-150 cursor-pointer text-xs uppercase"
                  >
                    <span className="font-extrabold text-white tracking-wider font-display pr-4">{faq.q}</span>
                    <span className="text-indigo-400 font-mono font-bold text-sm shrink-0">
                      {isOpen ? "[-]" : "[+]"}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden border-t border-slate-850 bg-slate-950/40"
                      >
                        <p className="p-6 text-xs text-slate-350 leading-relaxed font-sans whitespace-pre-line">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ONLINE COUNSELLING CENTER */}
      <section id="counselling" className="py-22 px-4 lg:px-8 max-w-7xl mx-auto text-left relative border-t border-slate-900">
        <div className="absolute -top-10 right-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-[100px] -z-10" />
        
        <div className="space-y-4 mb-12 text-center lg:text-left">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-full">
            Real-Time Digital Counselling
          </span>
          <h2 className="text-3.5xl font-black text-white uppercase tracking-tight leading-none">
            Online Counselling Portal & Help Desk
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Get instant academic guidance, personal mental wellbeing counselling, and prep advice. Submit a request to receive temporary secure credentials, then track and chat with your assigned counsellor in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Column 1: Submit New Counselling Request / Session Ticket */}
          <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 lg:p-8 space-y-6 backdrop-blur-sm">
            <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Request a Counselling Session</span>
            </h3>

            {counselSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-950 border border-emerald-500/30 p-6 rounded-xl space-y-5 text-left"
              >
                <div className="flex items-center space-x-3 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-sm font-black uppercase tracking-wider">Counselling Ticket Created Successfully!</span>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your request has been successfully queued. Please save the temporary credentials below. These credentials will allow you to access the Live Counselling Portal in the next panel.
                </p>

                <div className="space-y-3 bg-slate-900 p-4 rounded-lg border border-slate-800 font-mono text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">REQUEST ID:</span>
                    <span className="text-indigo-400 font-bold">{counselSuccess.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">TEMP USERNAME:</span>
                    <span className="text-white font-bold select-all bg-slate-950 px-2 py-0.5 rounded">{counselSuccess.tempUsername}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">TEMP PASSWORD:</span>
                    <span className="text-amber-400 font-bold select-all bg-slate-950 px-2 py-0.5 rounded">{counselSuccess.tempPassword}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">SCHEDULED TIME:</span>
                    <span className="text-slate-300">{new Date(counselSuccess.scheduledAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => {
                      setTrackUsername(counselSuccess.tempUsername);
                      setTrackPassword(counselSuccess.tempPassword);
                      // Instantly activate tracking
                      const found = counsellingRequests.find(r => r.id === counselSuccess.id) || counselSuccess;
                      setActiveCounselSession(found);
                      scrollToSection("counselling");
                    }}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider text-center cursor-pointer transition-all duration-150"
                  >
                    Enter Live Counselling Portal
                  </button>
                  <button
                    onClick={() => setCounselSuccess(null)}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider text-center cursor-pointer transition-all duration-150"
                  >
                    Request Another
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleCounselSubmit} className="space-y-4">
                {counselError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center space-x-2 font-medium">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{counselError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Full Name *</label>
                    <input 
                      type="text" 
                      value={counselName}
                      onChange={(e) => setCounselName(e.target.value)}
                      placeholder="Rohit Verma"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                      required
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Email Address *</label>
                    <input 
                      type="email" 
                      value={counselEmail}
                      onChange={(e) => setCounselEmail(e.target.value)}
                      placeholder="rohit@gmail.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Phone Number (Optional)</label>
                    <input 
                      type="tel" 
                      value={counselPhone}
                      onChange={(e) => setCounselPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Counselling Topic *</label>
                    <select 
                      value={counselTopic}
                      onChange={(e) => setCounselTopic(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none transition-all cursor-pointer"
                    >
                      <option value="Academic Stress">Academic Stress / Pressure</option>
                      <option value="Career Guidance">Career Path Guidance</option>
                      <option value="Exam Anxiety">Exam Anxiety Coping</option>
                      <option value="Time Management">Time Management Advice</option>
                      <option value="Batch / Course Selection">Batch / Course Selection</option>
                      <option value="Other Personal Counselling">Other Personal Counselling</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Select Available Counselling Slot *</label>
                  <select 
                    value={counselDate}
                    onChange={(e) => setCounselDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none transition-all cursor-pointer text-slate-300"
                    required
                  >
                    <option value="">-- Choose an Available Slot Published by Admin --</option>
                    {counsellingSlots.filter(s => !s.isBooked).map(s => {
                      const dObj = new Date(s.datetime);
                      const displayStr = isNaN(dObj.getTime())
                        ? s.datetime
                        : `${dObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} at ${dObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
                      return (
                        <option key={s.id} value={s.id} className="bg-slate-950 text-white">
                          {displayStr}
                        </option>
                      );
                    })}
                  </select>
                  {counsellingSlots.filter(s => !s.isBooked).length === 0 && (
                    <p className="text-[10px] text-rose-450 mt-1 font-mono animate-pulse">
                      ⚠️ No available slots currently published. Please contact the administration.
                    </p>
                  )}
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Describe your Concern or Topic *</label>
                  <textarea 
                    rows={4}
                    value={counselDesc}
                    onChange={(e) => setCounselDesc(e.target.value)}
                    placeholder="Briefly share what you would like to discuss with the academic or psychological counselor..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 leading-relaxed resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-500 hover:to-purple-550 active:scale-98 text-xs font-black uppercase tracking-widest text-white rounded-xl shadow-lg transition-all duration-150 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4 text-indigo-200" />
                  <span>Submit Request & Get Tickets</span>
                </button>
              </form>
            )}
          </div>

          {/* Column 2: Track & Live Chat Portal with Temporary Credentials */}
          <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 lg:p-8 space-y-6 backdrop-blur-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
                <Lock className="w-5 h-5 text-amber-500" />
                <span>Live Counselling Session Room</span>
              </h3>

              {!activeCounselSession ? (
                <div className="space-y-5 py-6">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Have you already submitted a request? Enter your <b>Temporary Username</b> and <b>Temporary Password</b> below to access your real-time secure counselling terminal.
                  </p>

                  <form onSubmit={handleTrackSession} className="space-y-4">
                    {trackError && (
                      <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center space-x-2">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>{trackError}</span>
                      </div>
                    )}

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Temporary Username</label>
                      <input 
                        type="text" 
                        value={trackUsername}
                        onChange={(e) => setTrackUsername(e.target.value)}
                        placeholder="e.g. rohit_verma_385"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
                        required
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Temporary Password</label>
                      <input 
                        type="password" 
                        value={trackPassword}
                        onChange={(e) => setTrackPassword(e.target.value)}
                        placeholder="e.g. pwd_x83fc"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-slate-850 hover:bg-slate-800 text-xs font-black uppercase tracking-widest text-white rounded-xl shadow-md border border-slate-700 transition-all cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Key className="w-4 h-4 text-slate-400" />
                      <span>Authenticate & Enter Session</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  {/* Active Session Header details */}
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 block">PATIENT / STUDENT SESSION</span>
                        <h4 className="text-sm font-black text-white">{activeCounselSession.studentName}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-slate-400 font-mono">{activeCounselSession.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          activeCounselSession.status === "Pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse" :
                          activeCounselSession.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {activeCounselSession.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-slate-900 text-slate-400">
                      <div>
                        <span className="block text-slate-500 text-[8.5px]">TOPIC:</span>
                        <span className="text-slate-300 font-bold">{activeCounselSession.topic}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[8.5px]">SCHEDULED FOR:</span>
                        <span className="text-slate-300 font-bold">{new Date(activeCounselSession.scheduledAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {activeCounselSession.meetingLink && (
                      <div className="mt-3 pt-3 border-t border-slate-900">
                        <a 
                          href={activeCounselSession.meetingLink}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold uppercase text-[10px] py-2 rounded-lg cursor-pointer tracking-wider transition-all"
                        >
                          <Video className="w-3.5 h-3.5 text-white" />
                          <span>Join Virtual Conference Room</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Counselor Feedback Notes */}
                  {activeCounselSession.notes && (
                    <div className="p-3 bg-slate-900/80 border border-indigo-900/30 rounded-lg text-left">
                      <span className="text-[8.5px] font-black text-indigo-400 tracking-wider block uppercase mb-1">Counsellor Action Plan & Notes</span>
                      <p className="text-xs text-slate-300 font-sans italic leading-relaxed">
                        "{activeCounselSession.notes}"
                      </p>
                    </div>
                  )}

                  {/* Chat logs terminal */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block text-left">Live Chat Transmission</span>
                    <div className="h-44 overflow-y-auto bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3 font-sans text-xs text-left scrollbar-thin">
                      {((activeCounselSession as any).chat && (activeCounselSession as any).chat.length > 0) ? (
                        (activeCounselSession as any).chat.map((msg: any, idx: number) => (
                          <div 
                            key={idx}
                            className={`flex flex-col space-y-1 max-w-[85%] ${
                              msg.sender === activeCounselSession.studentName ? "ml-auto items-end" : "mr-auto items-start"
                            }`}
                          >
                            <span className="text-[8.5px] font-mono text-slate-500">
                              {msg.sender} • {msg.timestamp}
                            </span>
                            <div className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                              msg.sender === activeCounselSession.studentName 
                                ? "bg-indigo-600 text-white rounded-tr-none" 
                                : "bg-slate-850 text-slate-200 rounded-tl-none border border-slate-800"
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 py-8">
                          <MessageSquare className="w-8 h-8 text-slate-850" />
                          <p className="text-[10px] font-mono uppercase tracking-wider text-center">
                            No live chat transmissions recorded.<br/>Type below to begin secure session.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {activeCounselSession && (
              <form onSubmit={handleSendCounselChat} className="flex gap-2 mt-4 pt-3 border-t border-slate-850">
                <input 
                  type="text" 
                  value={counselChatInput}
                  onChange={(e) => setCounselChatInput(e.target.value)}
                  placeholder="Type secure response..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center shrink-0 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCounselSession(null);
                    setTrackUsername("");
                    setTrackPassword("");
                  }}
                  className="bg-slate-850 hover:bg-slate-800 text-slate-300 px-3 py-3 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-center shrink-0 transition-all"
                  title="Disconnect Session"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* 6. CONTACT US LEAD COLLECTOR FORM */}
      <section id="contact" className="py-22 px-4 lg:px-8 max-w-7xl mx-auto text-left relative">
        <div className="absolute -top-10 left-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-[90px] -z-10" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Contact Guides */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">Admissions Help Desk</span>
            <h2 className="text-3.5xl font-black text-white uppercase tracking-tight leading-tight">
              Get an Expert Call. <br />
              Map Your Learning Direction.
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete the admissions lead query sheet. Our academic coordinators will evaluate your previous curriculum performance metrics and chart the perfect batch schedule for IIT-JEE/NEET preparations.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-slate-905 border border-slate-800 flex items-center justify-center text-indigo-455">
                  <Phone className="w-4.5 h-4.5 text-indigo-400" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-450 block uppercase font-mono">Call Us Directly</span>
                  <a href="tel:+916263100601" className="text-xs font-bold text-white hover:underline">6263100601</a>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-slate-905 border border-slate-800 flex items-center justify-center text-emerald-455">
                  <Mail className="w-4.5 h-4.5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-450 block uppercase font-mono">Authorized Email Address</span>
                  <a href="mailto:vishveshwarfoundation@gmail.com" className="text-xs font-bold text-white hover:underline">vishveshwarfoundation@gmail.com</a>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-slate-905 border border-slate-800 flex items-center justify-center text-purple-455">
                  <MapPin className="w-4.5 h-4.5 text-purple-400" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-450 block uppercase font-mono">Academic Campus Desk</span>
                  <span className="text-xs font-bold text-white">Main Street Campus, Varanasi, UP, India</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-slate-905 border border-slate-800 flex items-center justify-center text-indigo-455">
                  <GraduationCap className="w-4.5 h-4.5 text-indigo-400" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-450 block uppercase font-mono">Official LMS Portal</span>
                  <span className="text-xs font-bold text-white">LMS Active Console</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Lead collector form */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative">
              
              {submitSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto text-2xl animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wide">Consultation Saved!</h3>
                    <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                      Thank you for submitting your profile request code. Our senior academic director will review your curriculum interests and get back to your contact keys shortly.
                    </p>
                  </div>
                  <button 
                    onClick={() => setSubmitSuccess(false)}
                    className="py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-5 text-left">
                  <div className="border-b border-slate-800 pb-4">
                    <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                      <span>Registration / Callback Inquiry Form</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Ready to scale your scores? Complete inputs below.</p>
                  </div>

                  {submitError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl">
                      {submitError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1.5">Your Full Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Rahul Mishra"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1.5">Contact Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder="e.g. rahul@gmail.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1.5">Phone Call Number</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="e.g. +91 91234 56789"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1.5">Preferred Study Batch</label>
                      <select 
                        required
                        value={formData.courseInterest}
                        onChange={e => setFormData({...formData, courseInterest: e.target.value})}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 animate-fadeIn"
                      >
                        {publicBatches.filter(b => b.isPublished).map(b => (
                          <option key={b.id} value={b.name}>{b.name} ({b.department})</option>
                        ))}
                        <option value="Other / General Query">Other Custom Batch Query</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1.5">Message / learning Constraints (Optional)</label>
                    <textarea 
                      rows={3}
                      placeholder="Mention any custom schedule questions, boarding parameters or subject focuses..."
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 text-xs font-black uppercase tracking-wider text-slate-950 bg-indigo-400 hover:bg-indigo-350 duration-200 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-400/10 cursor-pointer"
                  >
                    <PhoneCall className="w-4.5 h-4.5" />
                    <span>Submit consultation Request</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 7. FOOTER SECTION */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-900 py-10 px-4 lg:px-8 text-slate-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-xs text-slate-400">
          <div className="flex flex-col items-center md:items-start space-y-1.5 justify-center md:justify-start">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">
                <GraduationCap className="w-4.5 h-4.5" />
              </div>
              <span className="font-bold text-slate-350">Study Hub</span>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <p className="font-semibold text-slate-300">
              &copy; 2026. All Rights Reserved by Vishveshwar Foundation Ltd.
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              For Any Support Email Us: <strong className="text-indigo-400">vishveshwarfoundation@gmail.com</strong> <br />
              Office Mobile Number: <strong className="text-emerald-400">6263100601</strong>
            </p>
          </div>

          <div className="flex space-x-4 justify-center md:justify-end">
            <button onClick={() => scrollToSection("home")} className="hover:text-slate-350">Home</button>
            <button onClick={() => scrollToSection("about")} className="hover:text-slate-350">About</button>
            <button onClick={() => scrollToSection("courses")} className="hover:text-slate-350">Batches</button>
            <button onClick={() => scrollToSection("notices")} className="hover:text-slate-350">Noticeboard</button>
          </div>
        </div>
      </footer>

      {/* 8. INBUILT POPUP LOGIN MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer animate-fadeIn"
            onClick={() => {
              setIsLoginModalOpen(false);
              setIsLoginGooglePickerOpen(false);
              setLoginErr("");
            }}
          />

          {/* Modal Container */}
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative z-10 animate-fadeIn duration-200 overflow-hidden text-left">
            <button
              onClick={() => {
                setIsLoginModalOpen(false);
                setIsLoginGooglePickerOpen(false);
                setLoginErr("");
              }}
              className="absolute top-4 right-4 text-slate-450 hover:text-white p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Heading Header */}
            <div className="text-center space-y-1.5 mb-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black uppercase tracking-wider text-white">Academy Login Hub</h3>
              <p className="text-[10px] text-slate-450 uppercase tracking-widest font-mono">Access your dashboard seamlessly</p>
            </div>

            {isLoginGooglePickerOpen ? (
              <div className="space-y-6 py-2 animate-fadeIn text-left">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-1 font-bold tracking-tighter text-2xl font-sans my-2 select-none">
                    <span className="text-blue-500 font-extrabold">G</span>
                    <span className="text-red-500 font-extrabold">o</span>
                    <span className="text-yellow-500 font-extrabold">o</span>
                    <span className="text-blue-500 font-extrabold">g</span>
                    <span className="text-green-500 font-extrabold">l</span>
                    <span className="text-red-500 font-extrabold">e</span>
                  </div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Choose a Gmail account</h3>
                  <p className="text-[10px] text-slate-400 capitalize tracking-wide">
                    to authenticate directly with your registered Google profile
                  </p>
                </div>

                {loginErr && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs space-y-1 flex items-start space-x-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="font-semibold leading-relaxed">{loginErr}</span>
                  </div>
                )}

                {/* Accounts List */}
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {/* User email from metadata */}
                  <button
                    type="button"
                    onClick={() => {
                      setLoginErr("");
                      const err = onInbuiltLogin("student", "vishveshwarpand@gmail.com", "BYPASS_GOOGLE_SIGN_IN");
                      if (err) {
                        setLoginErr(err);
                      } else {
                        setIsLoginGooglePickerOpen(false);
                        setIsLoginModalOpen(false);
                      }
                    }}
                    className="w-full bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl hover:bg-slate-900 border-indigo-500/35 hover:border-indigo-500 flex items-center justify-between text-left transition-all duration-150 group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] font-black text-white uppercase">
                        VP
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-white block truncate leading-tight">
                          Vishveshwar Pandey
                        </span>
                        <span className="text-[10px] text-slate-500 group-hover:text-indigo-405 block truncate font-mono">
                          vishveshwarpand@gmail.com
                        </span>
                      </div>
                    </div>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded uppercase font-black font-mono shrink-0">
                      Active
                    </span>
                  </button>

                  {/* Mock Account 2 */}
                  <button
                    type="button"
                    onClick={() => {
                      setLoginErr("");
                      const err = onInbuiltLogin("student", "amit.sharma99@gmail.com", "BYPASS_GOOGLE_SIGN_IN");
                      if (err) {
                        setLoginErr(err);
                      } else {
                        setIsLoginGooglePickerOpen(false);
                        setIsLoginModalOpen(false);
                      }
                    }}
                    className="w-full bg-slate-950/40 border border-slate-855 p-3.5 rounded-2xl hover:bg-slate-900 hover:border-indigo-500/50 flex items-center justify-between text-left transition-all duration-150 group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-[11px] font-black text-white uppercase">
                        AS
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-400 group-hover:text-white block truncate leading-tight">
                          Amit Sharma
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate font-mono">
                          amit.sharma99@gmail.com
                        </span>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="border-t border-slate-850 pt-4 space-y-3">
                  <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block">Use a different Google Account</span>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setLoginErr("");
                      const emailIn = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value.trim();
                      if (!emailIn) {
                        alert("Please provide your Gmail address.");
                        return;
                      }
                      if (!emailIn.toLowerCase().endsWith("@gmail.com")) {
                        alert("Only Google Gmail (@gmail.com) profiles are supported.");
                        return;
                      }
                      
                      const err = onInbuiltLogin("student", emailIn.toLowerCase(), "BYPASS_GOOGLE_SIGN_IN");
                      if (err) {
                        setLoginErr(err);
                      } else {
                        setIsLoginGooglePickerOpen(false);
                        setIsLoginModalOpen(false);
                      }
                    }}
                    className="space-y-2.5"
                  >
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="username@gmail.com"
                      className="w-full bg-slate-950/65 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-red-500 placeholder-slate-750 font-mono"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-red-650 hover:bg-red-600 active:scale-95 text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-150 cursor-pointer shadow-md shadow-red-955/20"
                    >
                      Sign In with Custom Gmail
                    </button>
                  </form>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1.5 font-mono">
                  <span>Secured with Gmail OAuth</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginErr("");
                      setIsLoginGooglePickerOpen(false);
                    }}
                    className="text-indigo-400 hover:underline cursor-pointer font-bold uppercase tracking-wide text-[9px]"
                  >
                    ← Use password login
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Tab Swappers */}
                <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginTab("student");
                      setLoginErr("");
                    }}
                    className={`py-2 text-[11px] font-black uppercase tracking-wider transition rounded-lg cursor-pointer ${
                      loginTab === "student"
                        ? "bg-indigo-650 text-white shadow-md shadow-indigo-600/10"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Student Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginTab("office");
                      setLoginErr("");
                    }}
                    className={`py-2 text-[11px] font-black uppercase tracking-wider transition rounded-lg cursor-pointer ${
                      loginTab === "office"
                        ? "bg-indigo-650 text-white shadow-md shadow-indigo-600/10"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Office Login
                  </button>
                </div>

                {/* ERROR DISPLAY */}
                {loginErr && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs space-y-1 mb-4 flex items-start space-x-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="font-semibold leading-relaxed">{loginErr}</span>
                  </div>
                )}

                {/* Gmail Quick Sign-In Option for Students */}
                {loginTab === "student" && (
                  <div className="mb-4 text-center space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginErr("");
                        setIsLoginGooglePickerOpen(true);
                      }}
                      className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2.5 cursor-pointer hover:border-slate-700 hover:shadow-lg shadow-indigo-600/5 hover:-translate-y-0.5 duration-200"
                    >
                      <div className="flex items-center justify-center gap-0.5 font-sans text-sm tracking-tighter select-none font-bold">
                        <span className="text-blue-500 font-extrabold">G</span>
                        <span className="text-red-500 font-extrabold">o</span>
                        <span className="text-yellow-500 font-extrabold">o</span>
                        <span className="text-blue-500 font-extrabold">g</span>
                        <span className="text-green-500 font-extrabold">l</span>
                        <span className="text-red-500 font-extrabold">e</span>
                      </div>
                      <span className="text-slate-200">Sign in with Google / Gmail</span>
                    </button>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-850"></div>
                      <span className="flex-shrink mx-3 text-[9px] text-slate-500 font-mono font-black uppercase tracking-wider">Or Use Password Login</span>
                      <div className="flex-grow border-t border-slate-850"></div>
                    </div>
                  </div>
                )}

                {/* FORM */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setLoginErr("");
                    const finalRole = loginTab === "student" ? "student" : officeRole;
                    const err = onInbuiltLogin(finalRole, loginId, loginPwd);
                    if (err) {
                      setLoginErr(err);
                    } else {
                      setIsLoginModalOpen(false);
                    }
                  }}
                  className="space-y-4"
                >
                  {/* If Office Login is selected, show the Office role selector */}
                  {loginTab === "office" && (
                    <div className="space-y-2">
                      <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Select Office Staff Segment</label>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                        {(["teacher", "admin", "feemanager", "admission", "verifier", "principal"] as const).map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              setOfficeRole(role);
                              setLoginErr("");
                            }}
                            className={`py-2 text-[10px] font-black uppercase text-center rounded-lg border transition cursor-pointer ${
                              officeRole === role
                                ? "bg-indigo-600/15 border-indigo-500 text-indigo-400"
                                : "bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-750 hover:text-slate-300"
                            }`}
                          >
                            {role === "teacher" ? "Faculty" : role === "admin" ? "Admin" : role === "feemanager" ? "Fee Mgr" : role === "admission" ? "Admissions" : role === "verifier" ? "Verifier" : "Principal"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Login Identifier */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">
                      {loginTab === "student" ? "Student Email or Roll Number Code" : `${officeRole.toUpperCase()} EMAIL ADDRESS`}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        placeholder={loginTab === "student" ? "e.g. RJ20264024 or email" : "e.g. admin@coachinghub.edu"}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPwd ? "text" : "password"}
                        required
                        value={loginPwd}
                        onChange={(e) => setLoginPwd(e.target.value)}
                        placeholder="Enter security access password"
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit triggers login */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition duration-150 active:scale-95 shadow-lg shadow-indigo-650/15 cursor-pointer mt-2"
                  >
                    Authenticate Access Now
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ONLINE STUDENT FEE PORTAL LOGIN MODAL */}
      {isFeePortalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-md cursor-pointer animate-fadeIn"
            onClick={() => setIsFeePortalOpen(false)}
          />

          {/* Modal Container */}
          <div className="bg-slate-900 border border-emerald-500/30 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative z-10 animate-fadeIn duration-200 overflow-hidden text-left ring-2 ring-emerald-500/10">
            <button
              type="button"
              onClick={() => setIsFeePortalOpen(false)}
              className="absolute top-4 right-4 text-slate-450 hover:text-white p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Heading Header */}
            <div className="text-center space-y-1.5 mb-6">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/50">
                <span className="font-extrabold text-lg">₹</span>
              </div>
              <h3 className="text-base font-black uppercase tracking-wider text-white">Online Fee Access Desk</h3>
              <p className="text-[10px] text-slate-450 uppercase tracking-widest font-mono">Secure Rupee Billing & Portal Login</p>
            </div>

            {/* Alert / Info Box */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-[10px] space-y-1 mb-4 flex items-start space-x-2">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[8px] font-black shrink-0 mt-0.5">SECURED</span>
              <span>Enforced security: authenticate with your registered Roll Number and Password (which is your Date of Birth) as setup by the academic registrar.</span>
            </div>

            {/* ERROR DISPLAY */}
            {feeError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs space-y-1 mb-4 flex items-start space-x-2 animate-pulse">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{feeError}</span>
              </div>
            )}

            {/* FORM */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFeeError("");
                
                if (!feeRoll.trim() || !feeDob.trim()) {
                  setFeeError("Please enter your registered Roll number and Date of Birth password.");
                  return;
                }
                
                if (onOnlineFeePortalLogin) {
                  const err = onOnlineFeePortalLogin(feeRoll.trim(), feeDob.trim());
                  if (err) {
                    setFeeError(err);
                  } else {
                    setIsFeePortalOpen(false);
                  }
                } else {
                  setFeeError("Fee Portal connection failed. Please try again later.");
                }
              }}
              className="space-y-4 font-sans"
            >
              {/* Roll Number */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Academic Roll Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={feeRoll}
                    onChange={(e) => setFeeRoll(e.target.value)}
                    placeholder="e.g. CO-2026-004"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-550 placeholder-slate-600 font-mono font-bold"
                  />
                </div>
              </div>

              {/* DOB Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Password (Date of Birth)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={feeDob}
                    onChange={(e) => setFeeDob(e.target.value)}
                    placeholder="Enter Date of Birth (e.g. DD-MM-YYYY)"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-550 placeholder-slate-600 font-mono"
                  />
                </div>
              </div>

              {/* Submit triggers login */}
              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition duration-150 active:scale-95 shadow-lg shadow-emerald-650/15 cursor-pointer mt-2"
              >
                Access Online Fee Desk
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ONLINE STUDENT MARKSHEET / RESULT LOOKUP MODAL */}
      {isMarksheetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md cursor-pointer animate-fadeIn"
            onClick={() => setIsMarksheetOpen(false)}
          />

          {/* Modal Container */}
          <div className="bg-slate-900 border border-pink-500/30 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative z-10 animate-fadeIn duration-200 overflow-hidden text-left ring-2 ring-pink-500/10 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsMarksheetOpen(false)}
              className="absolute top-4 right-4 text-slate-450 hover:text-white p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Check Results Section */}
            {!checkedStudent ? (
              <div className="space-y-4">
                <div className="text-center space-y-1.5 mb-6">
                  <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-pink-500/50">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black uppercase tracking-wider text-white">Academic Results Desk</h3>
                  <p className="text-[10px] text-slate-450 uppercase tracking-widest font-mono">Real-time Terminal Marksheet & Grades</p>
                </div>

                <div className="bg-pink-500/10 border border-pink-500/20 text-pink-400 p-3.5 rounded-xl text-[11px] leading-relaxed flex items-start space-x-2">
                  <span className="px-1.5 py-0.5 rounded bg-pink-500 text-slate-950 text-[8px] font-black shrink-0">DIGITAL</span>
                  <span>Input your school-assigned unique Roll Number to fetch your serial-wise performance grade sheet and cumulative transcript logs.</span>
                </div>

                {marksheetError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs flex items-center space-x-2 animate-pulse font-semibold">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{marksheetError}</span>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setMarksheetError("");
                    
                    if (!searchRoll.trim()) {
                      setMarksheetError("Please enter your academic Roll Number.");
                      return;
                    }

                    const targetRoll = searchRoll.trim().toUpperCase();
                    const match = students.find(s => s.rollNo.toUpperCase().trim() === targetRoll);
                    if (match) {
                      setCheckedStudent(match);
                    } else {
                      setMarksheetError(`No student was discovered matching roll code: "${searchRoll}". Please verify with your specific school principal.`);
                    }
                  }}
                  className="space-y-4 font-sans"
                >
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Enter Roll Number
                    </label>
                    <input
                      type="text"
                      required
                      value={searchRoll}
                      onChange={(e) => setSearchRoll(e.target.value)}
                      placeholder="e.g. CO-2026-102 or GREENWOOD-S-12"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white uppercase font-mono font-bold focus:border-pink-550"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition cursor-pointer mt-2"
                  >
                    Generate Academic Marksheet
                  </button>
                </form>
              </div>
            ) : (
              // Display Report Card Result Sheets
              <div className="space-y-6 font-sans">
                {/* Header of Report Card */}
                <div className="border-b border-slate-850 pb-5 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="bg-pink-600 text-white font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                        Digital Transcript System
                      </span>
                      <h4 className="text-xl font-extrabold text-white mt-1">
                        {checkedStudent.schoolName || (checkedStudent.schoolId && schools.find(s => s.id === checkedStudent.schoolId)?.name) || "LMS Global Institute"}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">Verified Online Graded Marksheet</p>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-center min-w-[120px]">
                      <span className="block text-[8px] text-slate-450 uppercase font-black">Roll Number</span>
                      <span className="text-sm font-mono font-black text-pink-400">{checkedStudent.rollNo}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-850 text-xs">
                    <div className="space-y-1">
                      <p className="text-slate-450 uppercase text-[9px] font-black">Candidate Name</p>
                      <p className="font-extrabold text-slate-200 text-sm">{checkedStudent.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-450 uppercase text-[9px] font-black">Registered Email</p>
                      <p className="font-mono text-slate-350">{checkedStudent.email}</p>
                    </div>
                  </div>
                </div>

                {/* Performance Evaluation Listing */}
                <div>
                  <h5 className="text-xs font-black text-slate-350 uppercase tracking-widest mb-3 flex items-center space-x-2">
                    <Award className="w-4 h-4 text-pink-500" />
                    <span>Graded Test Assessments (Serial Wise)</span>
                  </h5>

                  {(() => {
                    const studentTests = (tests || []).filter(t => t.scores && t.scores[checkedStudent.id] !== undefined);
                    if (studentTests.length === 0) {
                      return (
                        <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-850">
                          <p className="text-xs text-slate-400 font-bold">No examination results published yet.</p>
                          <p className="text-[10px] text-slate-600 mt-1 uppercase font-mono">Grades are being evaluated by subject instructors.</p>
                        </div>
                      );
                    }

                    // Calculation aggregates
                    let cumObtained = 0;
                    let cumTotal = 0;
                    studentTests.forEach(t => {
                      cumObtained += t.scores[checkedStudent.id];
                      cumTotal += t.maxMarks;
                    });
                    const globalPct = cumTotal > 0 ? ((cumObtained / cumTotal) * 100) : 0;

                    // Excel formatting csv dowmload
                    const handleDownloadExcel = () => {
                      const csvRows = [
                        ["Serial No", "Assessment Title", "Subject Category", "Date Conducted", "Scored Result", "Max Marks", "Percentage", "Letter Grade"]
                      ];

                      studentTests.forEach((t, i) => {
                        const obtained = t.scores[checkedStudent.id];
                        const pct = ((obtained / t.maxMarks) * 100).toFixed(1);
                        const ratio = obtained / t.maxMarks;
                        const gr = ratio >= 0.9 ? "O (Outstanding)" : ratio >= 0.8 ? "A (Excellent)" : ratio >= 0.7 ? "B (Good)" : ratio >= 0.6 ? "C (Average)" : ratio >= 0.5 ? "D (Sufficient)" : "F (Failed)";
                        csvRows.push([
                          (i + 1).toString(),
                          t.title,
                          t.subject || "General Courses",
                          t.date || "N/A",
                          obtained.toString(),
                          t.maxMarks.toString(),
                          `${pct}%`,
                          gr
                        ]);
                      });

                      // Append totals as the final row for Excel
                      csvRows.push([]);
                      csvRows.push(["TOTALS", "", "", "", cumObtained.toString(), cumTotal.toString(), `${globalPct.toFixed(1)}%`]);

                      let csvContent = "data:text/csv;charset=utf-8,";
                      csvRows.forEach(row => {
                        csvContent += row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",") + "\r\n";
                      });

                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `${checkedStudent.name.replace(/\s+/g, "_")}_Academic_Marksheet.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      alert("Excel-Compatible Serial Marks sheet compiled and downloaded successfully!");
                    };

                    return (
                      <div className="space-y-4">
                        <div className="overflow-x-auto border border-slate-850 rounded-2xl bg-slate-950/50">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-950 text-slate-450 uppercase text-[9px] font-black tracking-widest border-b border-slate-850">
                                <th className="px-4 py-3">S.No.</th>
                                <th className="px-4 py-3">Subject</th>
                                <th className="px-4 py-3">Test Title</th>
                                <th className="px-4 py-3 text-center">Marks Scored</th>
                                <th className="px-4 py-3 text-center">Out Of</th>
                                <th className="px-4 py-3 text-center">Percentage</th>
                                <th className="px-4 py-3 text-center">Grade</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850">
                              {studentTests.map((t, idx) => {
                                const score = t.scores[checkedStudent.id];
                                const max = t.maxMarks;
                                const pct = ((score / max) * 100).toFixed(1);
                                const ratio = score / max;
                                const grade = ratio >= 0.9 ? "O" : ratio >= 0.8 ? "A" : ratio >= 0.7 ? "B" : ratio >= 0.6 ? "C" : ratio >= 0.5 ? "D" : "F";
                                const isPassed = ratio >= 0.5;

                                return (
                                  <tr key={t.id} className="hover:bg-slate-900/50">
                                    <td className="px-4 py-3 font-mono font-bold text-slate-500">{idx + 1}</td>
                                    <td className="px-4 py-3"><span className="bg-slate-900 px-2 py-0.5 border border-slate-800 text-slate-300 font-extrabold rounded-md text-[10px]">{t.subject || "General"}</span></td>
                                    <td className="px-4 py-3 font-semibold text-slate-100">{t.title}</td>
                                    <td className="px-4 py-3 text-center font-black text-pink-400 font-mono">{score}</td>
                                    <td className="px-4 py-3 text-center font-mono text-slate-450">{max}</td>
                                    <td className="px-4 py-3 text-center font-mono font-bold text-white">{pct}%</td>
                                    <td className="px-4 py-3 text-center">
                                      <span className={`px-2 py-0.5 text-[9px] rounded font-black font-mono ${
                                        isPassed ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                      }`}>
                                        {grade}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Totals Summary */}
                        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-sm font-semibold">
                            <span className="text-slate-400">Total Aggregate Calculation:</span>
                            <span className="text-white font-mono font-extrabold block text-lg mt-0.5">
                              {cumObtained} / {cumTotal} Scored Marks
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="bg-pink-650/10 border border-pink-500/20 rounded-xl px-4 py-2 text-center">
                              <span className="block text-[8px] text-pink-400 font-black uppercase">Percentage</span>
                              <span className="text-base font-mono font-black text-pink-500">{globalPct.toFixed(1)}%</span>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 text-center">
                              <span className="block text-[8px] text-emerald-450 font-black uppercase">Passing Verdict</span>
                              <span className={`text-sm font-extrabold uppercase ${globalPct >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
                                {globalPct >= 50 ? "PASSED" : "REMEDIAL REQUIRED"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons: Excel Download & Print */}
                        <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-4 border-t border-slate-850">
                          <button
                            onClick={() => {
                              setSearchRoll("");
                              setCheckedStudent(null);
                            }}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer text-center"
                          >
                            Lookup Another Roll
                          </button>
                          
                          <button
                            onClick={handleDownloadExcel}
                            className="px-4 py-2.5 bg-pink-700 hover:bg-pink-600 text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer text-center flex items-center justify-center space-x-1.5"
                          >
                            <span>Download Excel Sheet</span>
                          </button>

                          <button
                            onClick={() => window.print()}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer text-center"
                          >
                            Print Report Card
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. INBUILT POPUP REGISTRATION MODAL */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer"
            onClick={() => {
              if (!regSuccessData) {
                setIsRegisterModalOpen(false);
                setIsGooglePickerOpen(false);
                setIsGoogleRegistered(false);
                setGoogleEmail("");
              }
            }}
          />

          {/* Modal Container */}
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative z-10 animate-fadeIn duration-200 overflow-hidden max-h-[90vh] overflow-y-auto text-left">
            {!regSuccessData && (
              <button
                onClick={() => {
                  setIsRegisterModalOpen(false);
                  setIsGooglePickerOpen(false);
                  setIsGoogleRegistered(false);
                  setGoogleEmail("");
                }}
                className="absolute top-4 right-4 text-slate-450 hover:text-white p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* STEP 1: Registration Form */}
            {!regSuccessData ? (
              isGooglePickerOpen ? (
                <div className="space-y-6 py-2 animate-fadeIn text-left">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-1 font-bold tracking-tighter text-2xl font-sans my-2 select-none">
                      <span className="text-blue-500 font-extrabold">G</span>
                      <span className="text-red-500 font-extrabold">o</span>
                      <span className="text-yellow-500 font-extrabold">o</span>
                      <span className="text-blue-500 font-extrabold">g</span>
                      <span className="text-green-500 font-extrabold">l</span>
                      <span className="text-red-500 font-extrabold">e</span>
                    </div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Choose a Gmail account</h3>
                    <p className="text-[10px] text-slate-400 capitalize tracking-wide">
                      to register and auto-secure your academic access
                    </p>
                  </div>

                  {/* Accounts List */}
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {/* User email from metadata */}
                    <button
                      type="button"
                      onClick={() => {
                        setRegName("Vishveshwar Pandey");
                        setRegEmail("vishveshwarpand@gmail.com");
                        setIsGoogleRegistered(true);
                        setGoogleEmail("vishveshwarpand@gmail.com");
                        setIsGooglePickerOpen(false);
                      }}
                      className="w-full bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl hover:bg-slate-900 border-indigo-500/35 hover:border-indigo-500 flex items-center justify-between text-left transition-all duration-150 group cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] font-black text-white uppercase">
                          VP
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white block truncate leading-tight">
                            Vishveshwar Pandey
                          </span>
                          <span className="text-[10px] text-slate-500 group-hover:text-indigo-405 block truncate font-mono">
                            vishveshwarpand@gmail.com
                          </span>
                        </div>
                      </div>
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded uppercase font-black font-mono shrink-0">
                        Active
                      </span>
                    </button>

                    {/* Mock Account 2 */}
                    <button
                      type="button"
                      onClick={() => {
                        setRegName("Amit Sharma");
                        setRegEmail("amit.sharma99@gmail.com");
                        setIsGoogleRegistered(true);
                        setGoogleEmail("amit.sharma99@gmail.com");
                        setIsGooglePickerOpen(false);
                      }}
                      className="w-full bg-slate-950/40 border border-slate-850 p-3.5 rounded-2xl hover:bg-slate-900 hover:border-indigo-500/50 flex items-center justify-between text-left transition-all duration-150 group cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-[11px] font-black text-white uppercase">
                          AS
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-slate-400 group-hover:text-white block truncate leading-tight">
                            Amit Sharma
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate font-mono">
                            amit.sharma99@gmail.com
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="border-t border-slate-850 pt-4 space-y-3">
                    <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block">Use a different Google Account</span>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const nameIn = (e.currentTarget.elements.namedItem("name") as HTMLInputElement).value.trim();
                        const emailIn = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value.trim();
                        if (!nameIn || !emailIn) {
                          alert("Please fill name and Gmail fields.");
                          return;
                        }
                        if (!emailIn.toLowerCase().endsWith("@gmail.com")) {
                          alert("Only Google Gmail (@gmail.com) addresses can be registered here.");
                          return;
                        }
                        setRegName(nameIn);
                        setRegEmail(emailIn.toLowerCase());
                        setIsGoogleRegistered(true);
                        setGoogleEmail(emailIn.toLowerCase());
                        setIsGooglePickerOpen(false);
                      }}
                      className="space-y-2.5"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="Your Full Name"
                          className="bg-slate-950/65 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 placeholder-slate-700 font-semibold"
                        />
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="username@gmail.com"
                          className="bg-slate-950/65 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 placeholder-slate-750 font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-red-650 hover:bg-red-600 active:scale-95 text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-150 cursor-pointer shadow-md shadow-red-950/20"
                      >
                        Authenticate Custom Gmail
                      </button>
                    </form>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1.5 font-mono">
                    <span>Secured with Gmail OAuth</span>
                    <button
                      type="button"
                      onClick={() => setIsGooglePickerOpen(false)}
                      className="text-indigo-400 hover:underline cursor-pointer font-bold uppercase tracking-wide text-[9px]"
                    >
                      ← Back to form
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center space-y-1.5">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/20">
                      <ClipboardList className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-black uppercase tracking-wider text-white">Student Registration</h3>
                    <p className="text-[10px] text-slate-450 uppercase tracking-widest font-mono">Create an academic login credentials set</p>
                  </div>

                  {registerError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-start space-[#2] space-x-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{registerError}</span>
                    </div>
                  )}

                  {/* Gmail Quick Register Button */}
                  {!isGoogleRegistered && (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => {
                          setRegisterError("");
                          setIsGooglePickerOpen(true);
                        }}
                        className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2.5 cursor-pointer hover:border-slate-700 hover:shadow-lg shadow-indigo-600/5 hover:-translate-y-0.5 duration-200"
                      >
                        <div className="flex items-center justify-center gap-0.5 font-sans text-sm tracking-tighter select-none font-bold">
                          <span className="text-blue-500 font-extrabold">G</span>
                          <span className="text-red-500 font-extrabold">o</span>
                          <span className="text-yellow-500 font-extrabold">o</span>
                          <span className="text-blue-500 font-extrabold">g</span>
                          <span className="text-green-500 font-extrabold">l</span>
                          <span className="text-red-500 font-extrabold">e</span>
                        </div>
                        <span className="text-slate-200">Register with Gmail Account</span>
                      </button>

                      <div className="relative flex py-1.5 items-center">
                        <div className="flex-grow border-t border-slate-850"></div>
                        <span className="flex-shrink mx-3 text-[9px] text-slate-500 font-mono font-black uppercase tracking-wider">Or Register Manually</span>
                        <div className="flex-grow border-t border-slate-850"></div>
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setRegisterError("");

                      if (!regName.trim() || !regSchool.trim() || !regEmail.trim() || !regMobile.trim() || !regBatchId) {
                        setRegisterError("Please fill in all registration fields to submit.");
                        return;
                      }

                      try {
                        const creds = onRegisterStudent({
                          name: regName.trim(),
                          schoolName: regSchool.trim(),
                          email: regEmail.trim(),
                          mobileNumber: regMobile.trim(),
                          batchId: regBatchId,
                          isGoogleRegistered: isGoogleRegistered,
                          googleEmail: googleEmail
                        });
                        setRegSuccessData(creds);
                      } catch (err: any) {
                        setRegisterError(err.message || "Signup submission failed.");
                      }
                    }}
                    className="space-y-4"
                  >
                    {/* Name field */}
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-450 font-bold uppercase tracking-widest leading-none">Student Name :-</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter student first and last name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-700"
                      />
                    </div>

                    {/* Batch Select dropdown list */}
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-455 font-bold uppercase tracking-widest leading-none">Batch Select :-</label>
                      <select
                        required
                        value={regBatchId}
                        onChange={(e) => setRegBatchId(e.target.value)}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-0 focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="" disabled>-- Select target batch program --</option>
                        {batches.map((b) => (
                          <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                            {b.name} ({b.subject})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* School Name */}
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-450 font-bold uppercase tracking-widest leading-none">School Name :-</label>
                      <input
                        type="text"
                        required
                        placeholder="High School or Junior College"
                        value={regSchool}
                        onChange={(e) => setRegSchool(e.target.value)}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-700"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] text-slate-450 font-bold uppercase tracking-widest leading-none">Email ID :-</label>
                        {isGoogleRegistered && (
                          <span className="text-[8px] bg-red-950/60 text-red-400 border border-red-900/40 px-2 py-0.5 rounded-full uppercase font-black font-mono tracking-wider flex items-center gap-1 shrink-0 scale-90">
                            <span className="w-1 h-1 rounded-full bg-red-500 inline-block animate-pulse" />
                            Gmail Verified
                          </span>
                        )}
                      </div>
                      <input
                        type="email"
                        required
                        readOnly={isGoogleRegistered}
                        placeholder="e.g. candidate@domain.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition-all placeholder-slate-700 ${
                          isGoogleRegistered
                            ? "bg-slate-900/60 border-red-900/45 text-slate-350 cursor-not-allowed select-none"
                            : "bg-slate-950/60 border-slate-800 focus:border-indigo-500"
                        }`}
                      />
                      {isGoogleRegistered && (
                        <p className="text-[9.5px] text-slate-455 mt-1 leading-normal">
                          Linked with Google Gmail account <span className="font-mono text-red-400 font-bold">{googleEmail}</span>.
                          <button
                            type="button"
                            onClick={() => {
                              setIsGoogleRegistered(false);
                              setGoogleEmail("");
                              setRegEmail("");
                            }}
                            className="text-indigo-400 hover:text-indigo-300 hover:underline ml-1 font-bold cursor-pointer"
                          >
                            Unlink
                          </button>
                        </p>
                      )}
                    </div>

                    {/* Mobile Mobile Number */}
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-450 font-bold uppercase tracking-widest leading-none">Mobile Number :-</label>
                      <input
                        type="tel"
                        required
                        placeholder="10 digit contact cell number"
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value)}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-700"
                      />
                    </div>

                    {/* Submit registration details */}
                    <button
                      type="submit"
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-widest rounded-xl transition duration-150 active:scale-95 shadow-lg shadow-indigo-650/15 cursor-pointer mt-3"
                    >
                      Register and Generate Account
                    </button>
                  </form>
                </div>
              )
            ) : (
              /* STEP 2: Credentials success reveal screen */
              <div className="space-y-6 text-center animate-fadeIn py-2">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 scale-105">
                  <Check className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black uppercase text-emerald-400">Account Created Successfully!</h3>
                  <p className="text-xs text-slate-400">Please record the following access details now.</p>
                </div>

                {/* Generated Login Credentials card box */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-left space-y-3 font-mono">
                  <div className="pb-2 border-b border-slate-850 flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Security Credentials</span>
                    <span className="text-[9px] bg-indigo-950 text-indigo-450 border border-indigo-900 px-2 py-0.5 rounded uppercase font-black font-mono">Allotted</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-black font-sans leading-none">Roll Number ID:</span>
                    <div className="text-[15px] text-emerald-400 font-extrabold flex items-center justify-between">
                      <span>{regSuccessData.rollNo}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(regSuccessData.rollNo);
                          alert("Roll Number copied!");
                        }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-sans font-bold cursor-pointer underline flex items-center space-x-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-black font-sans leading-none">Password:</span>
                    <div className="text-[15px] text-white font-extrabold flex items-center justify-between">
                      <span>{regSuccessData.password}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(regSuccessData.password);
                          alert("Password copied!");
                        }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-sans font-bold cursor-pointer underline flex items-center space-x-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* CRITICAL WARNINGS */}
                <div className="bg-amber-500/10 border border-amber-500/25 p-4 rounded-xl text-left text-xs text-amber-300 space-y-2 leading-relaxed font-sans">
                  <div className="flex items-center space-x-2 font-black uppercase text-amber-405 text-[10px] tracking-wider leading-none">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Take a Screenshot / Save Details!</span>
                  </div>
                  <p className="font-extrabold text-[11px] leading-relaxed text-amber-200">
                    📸 Description: Take a Screenshot or Note down the Login Details immediately.
                  </p>
                  <p className="text-[10.5px] leading-normal text-slate-300">
                    <strong>Notice:</strong> Your login authentication will start after <strong>24 Hours</strong> when our administrative coordinators verify your registered details.
                  </p>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterModalOpen(false);
                    setIsGooglePickerOpen(false);
                    setIsGoogleRegistered(false);
                    setGoogleEmail("");
                  }}
                  className="w-full py-4 bg-indigo-650 hover:bg-indigo-600 text-white font-black uppercase text-xs tracking-widest rounded-xl transition duration-150 cursor-pointer active:scale-95"
                >
                  Close and Go Back
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
