import React, { useState } from "react";
import Markdown from "react-markdown";
import { 
  BookOpen, Plus, Edit3, Trash2, Eye, EyeOff, Lock, Unlock, 
  Video, Megaphone, FileText, MessageSquare, Check, Sparkles, 
  Calendar, Layers, User, Play, ChevronRight, X, ArrowLeft, ClipboardList,
  Award, Download, Database, Loader2, ExternalLink, UserCheck, UserPlus, Key, ShieldCheck
} from "lucide-react";
import { Course, CourseSection, CourseAnnouncement, CourseLiveClass, CourseClassNote, CourseDoubtMessage, Teacher, StoreOrder, Student } from "../types";
import LiveClassStudio from "./LiveClassStudio";
import StudentEnrollManager from "./StudentEnrollManager";
import { playAnnouncementSound } from "../utils/sound";


interface CourseManagerProps {
  courses: Course[];
  teachers: Teacher[];
  onCreateCourse: (course: Course) => void;
  onUpdateCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
  isAdmin: boolean;
  currentUserId?: string;
  currentUserEmail?: string;
  currentUserName?: string;
  currentUserStudent?: any;
  onRecordAttendance?: (courseTitle: string) => void;
  storeOrders?: StoreOrder[];
  setStoreOrders?: React.Dispatch<React.SetStateAction<StoreOrder[]>>;
  students?: Student[];
  setStudents?: React.Dispatch<React.SetStateAction<Student[]>>;
}

export default function CourseManager({
  courses,
  teachers,
  onCreateCourse,
  onUpdateCourse,
  onDeleteCourse,
  isAdmin,
  currentUserId = "admin_1",
  currentUserEmail,
  currentUserName = "Administrator",
  currentUserStudent,
  onRecordAttendance,
  storeOrders = [],
  setStoreOrders,
  students = [],
  setStudents
}: CourseManagerProps) {
  // Main Tab when viewing course manager (Catalog vs Student Enroll Management)
  const [activeMainTab, setActiveMainTab] = useState<"catalog" | "enrollments">("catalog");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeStudioLiveClass, setActiveStudioLiveClass] = useState<CourseLiveClass | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mentorName, setMentorName] = useState("");
  const [duration, setDuration] = useState("6 Months");
  const [price, setPrice] = useState(0);
  const [demoVideoUrl, setDemoVideoUrl] = useState("");

  // Sub-feature tab inside course workspace
  const [workspaceTab, setWorkspaceTab] = useState<"overview" | "sections" | "live" | "tests" | "announcements" | "notes" | "doubts" | "enrollments">("overview");

  // Section form with attachments
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionDesc, setNewSectionDesc] = useState("");
  const [newSectionAttachmentType, setNewSectionAttachmentType] = useState<"none" | "pdf" | "video" | "online">("none");
  const [newSectionAttachmentUrl, setNewSectionAttachmentUrl] = useState("");
  const [newSectionAttachmentTitle, setNewSectionAttachmentTitle] = useState("");
  const [studentDoubtMsg, setStudentDoubtMsg] = useState("");


  const handleOpenCourse = (course: Course) => {
    setSelectedCourse(course);
    setWorkspaceTab("overview");
    if (onRecordAttendance) {
      onRecordAttendance(course.title);
    }
  };

  // Live class form
  const [liveTitle, setLiveTitle] = useState("");
  const [liveDateTime, setLiveDateTime] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [liveTeacherId, setLiveTeacherId] = useState("");

  // Announcement form
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");

  // Class note form
  const [noteTitle, setNoteTitle] = useState("");
  const [noteUrl, setNoteUrl] = useState("");

  // Doubt reply state
  const [replyText, setReplyText] = useState("");
  const [activeDoubtId, setActiveDoubtId] = useState<string | null>(null);
  const [solvingDoubtId, setSolvingDoubtId] = useState<string | null>(null);

  const handleCreateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !mentorName) return;

    const newCourse: Course = {
      id: "course_" + Date.now(),
      title,
      description,
      mentorName,
      duration,
      price: 0,
      isPublished: true,
      isBlocked: false,
      demoVideoUrl: "",
      createdAt: new Date().toISOString().split("T")[0],
      sections: [],
      announcements: [],
      liveClasses: [],
      classNotes: [],
      doubts: []
    };

    onCreateCourse(newCourse);
    setIsCreateModalOpen(false);
    resetCourseForm();
  };

  const handleEditCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const updated: Course = {
      ...editingCourse,
      title,
      description,
      mentorName,
      duration,
      price: 0,
      demoVideoUrl: ""
    };

    onUpdateCourse(updated);
    setEditingCourse(null);
    if (selectedCourse?.id === updated.id) {
      setSelectedCourse(updated);
    }
  };

  const resetCourseForm = () => {
    setTitle("");
    setDescription("");
    setMentorName("");
    setDuration("6 Months");
    setPrice(0);
    setDemoVideoUrl("");
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setTitle(course.title);
    setDescription(course.description);
    setMentorName(course.mentorName);
    setDuration(course.duration);
    setPrice(0);
    setDemoVideoUrl("");
  };

  // Section additions
  const handleAddSection = () => {
    if (!selectedCourse || !newSectionTitle.trim()) return;
    const newSection: CourseSection = {
      id: "sec_" + Date.now(),
      title: newSectionTitle.trim(),
      description: newSectionDesc.trim(),
      order: selectedCourse.sections.length + 1,
      attachmentType: newSectionAttachmentType,
      attachmentUrl: newSectionAttachmentUrl.trim() || undefined,
      attachmentTitle: newSectionAttachmentTitle.trim() || undefined
    };
    const updated = {
      ...selectedCourse,
      sections: [...selectedCourse.sections, newSection]
    };
    onUpdateCourse(updated);
    setSelectedCourse(updated);
    setNewSectionTitle("");
    setNewSectionDesc("");
    setNewSectionAttachmentType("none");
    setNewSectionAttachmentUrl("");
    setNewSectionAttachmentTitle("");
  };

  const handleSolveDoubtWithAI = async (doubtId: string, questionMsg: string) => {
    if (!selectedCourse) return;
    setSolvingDoubtId(doubtId);
    try {
      const res = await fetch("/api/ai/solve-doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionMsg,
          subject: selectedCourse.title || "Academic Doubt",
          courseTitle: selectedCourse.title,
          studentName: currentUserName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to solve doubt");

      const updatedDoubts = (selectedCourse.doubts || []).map((d) => {
        if (d.id === doubtId) {
          return {
            ...d,
            reply: data.solution,
            repliedBy: "Study HUB AI Tutor (Verified Sources)",
          };
        }
        return d;
      });

      const updated = {
        ...selectedCourse,
        doubts: updatedDoubts,
      };
      onUpdateCourse(updated);
      setSelectedCourse(updated);
    } catch (err: any) {
      console.error("AI Doubt Solver Error:", err);
      alert("AI Study Tutor: " + (err.message || "Failed to solve doubt."));
    } finally {
      setSolvingDoubtId(null);
    }
  };

  const handleAskStudentDoubt = async (autoSolve: boolean = false) => {
    if (!selectedCourse || !studentDoubtMsg.trim()) return;
    const msg = studentDoubtMsg.trim();
    const newDoubtId = "cdm_" + Date.now();
    const newDoubt: CourseDoubtMessage = {
      id: newDoubtId,
      studentId: currentUserId,
      studentName: currentUserName,
      message: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = {
      ...selectedCourse,
      doubts: [newDoubt, ...(selectedCourse.doubts || [])]
    };
    onUpdateCourse(updated);
    setSelectedCourse(updated);
    setStudentDoubtMsg("");

    if (autoSolve) {
      await handleSolveDoubtWithAI(newDoubtId, msg);
    }
  };

  const handleDeleteSection = (secId: string) => {
    if (!selectedCourse) return;
    const updated = {
      ...selectedCourse,
      sections: selectedCourse.sections.filter(s => s.id !== secId)
    };
    onUpdateCourse(updated);
    setSelectedCourse(updated);
  };

  // Live Class additions
  const handleAddLiveClass = () => {
    if (!selectedCourse || !liveTitle.trim()) return;
    const assignedTeacher = teachers.find(t => t.id === liveTeacherId);
    const newLive: CourseLiveClass = {
      id: "clc_" + Date.now(),
      title: liveTitle.trim(),
      scheduledAt: liveDateTime || new Date().toLocaleString(),
      meetingOrVideoUrl: liveUrl.trim() || "https://meet.google.com/study-hub-live",
      isLive: true,
      instructorName: assignedTeacher ? assignedTeacher.name : (selectedCourse.mentorName || currentUserName),
      instructorId: assignedTeacher?.id,
      courseTitle: selectedCourse.title,
      courseId: selectedCourse.id
    };
    const updated = {
      ...selectedCourse,
      liveClasses: [newLive, ...selectedCourse.liveClasses]
    };
    onUpdateCourse(updated);
    setSelectedCourse(updated);
    setLiveTitle("");
    setLiveDateTime("");
    setLiveUrl("");
    setLiveTeacherId("");
  };

  // Announcement additions
  const handleAddCourseAnnouncement = () => {
    if (!selectedCourse || !annTitle.trim()) return;
    const newAnn: CourseAnnouncement = {
      id: "ca_" + Date.now(),
      title: annTitle.trim(),
      content: annContent.trim(),
      createdAt: new Date().toLocaleDateString()
    };
    const updated = {
      ...selectedCourse,
      announcements: [newAnn, ...selectedCourse.announcements]
    };
    onUpdateCourse(updated);
    setSelectedCourse(updated);
    setAnnTitle("");
    setAnnContent("");
    playAnnouncementSound();
  };

  // Class Notes additions
  const handleAddClassNote = () => {
    if (!selectedCourse || !noteTitle.trim()) return;
    const newNote: CourseClassNote = {
      id: "ccn_" + Date.now(),
      title: noteTitle.trim(),
      fileUrlOrContent: noteUrl.trim() || "https://studyhub.edu/notes/handout.pdf",
      uploadedAt: new Date().toLocaleDateString()
    };
    const updated = {
      ...selectedCourse,
      classNotes: [newNote, ...selectedCourse.classNotes]
    };
    onUpdateCourse(updated);
    setSelectedCourse(updated);
    setNoteTitle("");
    setNoteUrl("");
  };

  // Reply to doubt
  const handleReplyDoubt = (doubtId: string) => {
    if (!selectedCourse || !replyText.trim()) return;
    const updatedDoubts = (selectedCourse.doubts || []).map(d => {
      if (d.id === doubtId) {
        return {
          ...d,
          reply: replyText.trim(),
          repliedBy: currentUserName
        };
      }
      return d;
    });
    const updated = {
      ...selectedCourse,
      doubts: updatedDoubts
    };
    onUpdateCourse(updated);
    setSelectedCourse(updated);
    setReplyText("");
    setActiveDoubtId(null);
  };

  // Determine courses to display (For students: automatically display once order is confirmed by admin or student is enrolled)
  const isCoursePurchased = (course: Course) => {
    if (isAdmin) return true;

    // 1. Direct enrollment check via enrolledStudentIds
    if (currentUserId && course.enrolledStudentIds?.includes(currentUserId)) return true;
    if (currentUserStudent?.id && course.enrolledStudentIds?.includes(currentUserStudent.id)) return true;
    if (currentUserStudent?.rollNo && course.enrolledStudentIds?.includes(currentUserStudent.rollNo)) return true;
    if (currentUserStudent?.username && course.enrolledStudentIds?.includes(currentUserStudent.username)) return true;
    if (currentUserEmail && course.enrolledStudentIds?.includes(currentUserEmail)) return true;
    if (currentUserName && course.enrolledStudentIds?.includes(currentUserName)) return true;

    // 2. Filter orders belonging to this student
    const studentOrders = (storeOrders || []).filter(o => {
      if (o.status === "Cancelled") return false;

      const idMatch = currentUserId && o.studentId && (
        o.studentId === currentUserId ||
        (currentUserId === "s1" && (o.studentId === "s_guest" || o.studentId === "s1"))
      );
      const emailMatch = (currentUserEmail && o.studentEmail && o.studentEmail.toLowerCase().trim() === currentUserEmail.toLowerCase().trim()) ||
                         (currentUserId && o.studentEmail && o.studentEmail.toLowerCase().trim() === currentUserId.toLowerCase().trim());
      const nameMatch = currentUserName && o.studentName && o.studentName.toLowerCase().trim() === currentUserName.toLowerCase().trim();
      const mobileMatch = currentUserStudent?.mobileNumber && o.studentMobile && o.studentMobile.trim() === currentUserStudent.mobileNumber.trim();
      const rollMatch = currentUserStudent?.rollNo && (o.studentId === currentUserStudent.rollNo || (o.studentName && o.studentName.includes(currentUserStudent.rollNo)));

      return idMatch || emailMatch || nameMatch || mobileMatch || rollMatch;
    });

    if (studentOrders.length > 0) {
      return studentOrders.some(order => {
        // Any confirmed status by admin
        const isConfirmed = order.status === "Confirmed" || 
                            order.status === "Payment Confirmed / Active" || 
                            order.status === "Verified & Approved" || 
                            order.status === "Active" ||
                            order.status === "Delivered" ||
                            order.status === "Completed";
        if (!isConfirmed) return false;

        return (order.items || []).some(item => 
          item.courseId === course.id || 
          item.itemId === course.id || 
          (item.itemName && item.itemName.toLowerCase().trim() === course.title.toLowerCase().trim()) ||
          (item.itemName && item.itemName.toLowerCase().includes(course.title.toLowerCase())) ||
          (course.title && item.itemName && course.title.toLowerCase().includes(item.itemName.toLowerCase()))
        );
      });
    }
    return false;
  };

  // Find if student has any pending course orders waiting for admin confirmation
  const pendingCourseOrders = !isAdmin ? (storeOrders || []).filter(o => {
    if (o.status === "Cancelled") return false;
    const isPending = o.status === "Pending Confirmation" || 
                      o.status === "Pending Admin Verification" || 
                      o.status === "Pending Payment at Center" || 
                      o.status === "Placed" || 
                      o.status === "Pending";
    if (!isPending) return false;

    const idMatch = currentUserId && o.studentId && (o.studentId === currentUserId || (currentUserId === "s1" && (o.studentId === "s_guest" || o.studentId === "s1")));
    const emailMatch = (currentUserEmail && o.studentEmail && o.studentEmail.toLowerCase().trim() === currentUserEmail.toLowerCase().trim()) ||
                       (currentUserId && o.studentEmail && o.studentEmail.toLowerCase().trim() === currentUserId.toLowerCase().trim());
    const nameMatch = currentUserName && o.studentName && o.studentName.toLowerCase().trim() === currentUserName.toLowerCase().trim();

    return (idMatch || emailMatch || nameMatch) && (o.items || []).some(i => i.itemType === "course" || i.courseId);
  }) : [];

  const displayedCourses = courses.filter(isCoursePurchased);

  // Count of pending course orders from Store waiting for admin confirmation
  const pendingStoreCourseOrdersCount = (storeOrders || []).filter(o => {
    if (o.status === "Cancelled") return false;
    const isPending = o.status === "Pending Confirmation" || 
                      o.status === "Pending Admin Verification" || 
                      o.status === "Pending Payment at Center" || 
                      o.status === "Placed" || 
                      o.status === "Pending";
    if (!isPending) return false;
    return (o.items || []).some(i => 
      i.itemType === "course" || 
      i.courseId || 
      courses.some(c => c.id === i.itemId || (i.itemName && c.title.toLowerCase().includes(i.itemName.toLowerCase())))
    );
  }).length;

  if (selectedCourse) {
    return (
      <div className="space-y-6 animate-fadeIn font-sans text-left">
        {/* Course Dashboard Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-indigo-900/40 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedCourse(null)}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/15 transition-all shadow-sm flex items-center justify-center shrink-0 cursor-pointer group"
              title="Return to All Courses"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Course Dashboard</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{selectedCourse.title}</h2>
              <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
                <span>Mentor: <strong className="text-white">{selectedCourse.mentorName}</strong></span>
                <span>•</span>
                <span>Duration: <strong className="text-indigo-300">{selectedCourse.duration}</strong></span>
                <span>•</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Enrolled & Active</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setSelectedCourse(null)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-2xl border border-white/20 transition-all flex items-center space-x-2 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to All Courses</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  if (confirm(`Delete course "${selectedCourse.title}"?`)) {
                    onDeleteCourse(selectedCourse.id);
                    setSelectedCourse(null);
                  }
                }}
                className="px-3.5 py-2.5 bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/30 rounded-2xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Dashboard Layout: Sidebar Menu + Sub-Section View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* SIDEBAR MENU */}
          <div className="lg:col-span-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-left">
            {/* Top Return Arrow Button inside Sidebar Menu */}
            <button
              onClick={() => setSelectedCourse(null)}
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs uppercase tracking-wider p-3 rounded-2xl border border-indigo-200 transition-all flex items-center justify-between cursor-pointer group shadow-xs"
            >
              <span className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4 text-indigo-600 group-hover:-translate-x-1 transition-transform" />
                <span>Return to All Courses</span>
              </span>
              <ChevronRight className="w-4 h-4 text-indigo-400 rotate-180" />
            </button>

            <div className="px-1 border-b border-slate-100 pb-2">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Course Sidebar Navigation
              </h4>
            </div>

            {/* Sidebar Buttons */}
            <div className="space-y-1.5">
              <button
                onClick={() => setWorkspaceTab("overview")}
                className={`w-full text-left p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  workspaceTab === "overview"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Overview & Syllabus</span>
                </span>
                <ChevronRight className={`w-3.5 h-3.5 ${workspaceTab === "overview" ? "text-indigo-200" : "text-slate-400"}`} />
              </button>

              <button
                onClick={() => setWorkspaceTab("sections")}
                className={`w-full text-left p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  workspaceTab === "sections"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Sections & Modules</span>
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  workspaceTab === "sections" ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-700"
                }`}>
                  {selectedCourse.sections?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setWorkspaceTab("announcements")}
                className={`w-full text-left p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  workspaceTab === "announcements"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <Megaphone className="w-4 h-4 text-amber-500" />
                  <span>Announcements & Notice</span>
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  workspaceTab === "announcements" ? "bg-white/20 text-white" : "bg-amber-50 text-amber-700"
                }`}>
                  {selectedCourse.announcements?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setWorkspaceTab("notes")}
                className={`w-full text-left p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  workspaceTab === "notes"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Class Notes & Downloads</span>
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  workspaceTab === "notes" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"
                }`}>
                  {selectedCourse.classNotes?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setWorkspaceTab("doubts")}
                className={`w-full text-left p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  workspaceTab === "doubts"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <MessageSquare className="w-4 h-4 text-sky-500" />
                  <span>Ask Mentor & Doubt Chat</span>
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  workspaceTab === "doubts" ? "bg-white/20 text-white" : "bg-sky-50 text-sky-700"
                }`}>
                  {selectedCourse.doubts?.length || 0}
                </span>
              </button>

              {/* Student Enroll Management Tab (Admin only) */}
              {isAdmin && (
                <button
                  onClick={() => setWorkspaceTab("enrollments")}
                  className={`w-full text-left p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    workspaceTab === "enrollments"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                      : "bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-900 border-emerald-200"
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <UserCheck className={`w-4 h-4 ${workspaceTab === "enrollments" ? "text-white" : "text-emerald-600"}`} />
                    <span>Student Enrollments</span>
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    workspaceTab === "enrollments" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {selectedCourse.enrolledStudentIds?.length || 0}
                  </span>
                </button>
              )}
            </div>

            {/* Mentor Info Widget */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Course Faculty Profile</span>
              <div className="flex items-center space-x-2.5 pt-1">
                <div className="p-2 bg-indigo-100 rounded-xl text-indigo-700">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-800">{selectedCourse.mentorName}</p>
                  <p className="text-[10px] text-slate-500">Master Subject Faculty</p>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN WORKSPACE CONTENT AREA */}
          <div className="lg:col-span-9 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-left">
            {/* Header bar for selected section */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                  title="Back to All Courses"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                    {workspaceTab.toUpperCase()} SECTION
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {workspaceTab === "overview" && "Course Overview & Learning Syllabus"}
                    {workspaceTab === "sections" && "Course Modules & Section Contents"}
                    {workspaceTab === "live" && "Interactive Studio Live Streaming Sessions"}
                    {workspaceTab === "tests" && "Question Bank & Practice Mock Examinations"}
                    {workspaceTab === "announcements" && "Official Course Broadcasts & Noticeboard"}
                    {workspaceTab === "notes" && "Downloadable Class Handouts & PDFs"}
                    {workspaceTab === "doubts" && "Ask Mentor & One-on-One Doubts Resolver"}
                    {workspaceTab === "enrollments" && "Course Student Enrollment & Access Control"}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedCourse(null)}
                className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-3.5 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Courses</span>
              </button>
            </div>

            {/* TAB 0: OVERVIEW */}
            {workspaceTab === "overview" && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">About This Course</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{selectedCourse.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-black uppercase text-slate-400">Total Modules</span>
                      <p className="text-lg font-black text-indigo-600 mt-1">{selectedCourse.sections?.length || 0} Sections</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-black uppercase text-slate-400">Live Classes</span>
                      <p className="text-lg font-black text-rose-600 mt-1">{selectedCourse.liveClasses?.length || 0} Sessions</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-black uppercase text-slate-400">Study Handouts</span>
                      <p className="text-lg font-black text-emerald-600 mt-1">{selectedCourse.classNotes?.length || 0} Documents</p>
                    </div>
                  </div>
                </div>

                {/* Demo Video if available */}
                {selectedCourse.demoVideoUrl && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Course Introductory / Demo Class Video</h4>
                    <div className="aspect-video w-full max-h-80 bg-black rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                      <iframe
                        src={selectedCourse.demoVideoUrl}
                        title="Demo Class Video"
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 1: SECTIONS */}
            {workspaceTab === "sections" && (
              <div className="space-y-4">
                {isAdmin && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-700">Add New Section / Module</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Section Title (e.g. Section 1: Vectors & Kinematics)"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="Short Description..."
                        value={newSectionDesc}
                        onChange={(e) => setNewSectionDesc(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium"
                      />
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                      <label className="block text-[11px] font-bold text-slate-700">Attach Content to Module (PDF View, Video, Online Link)</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <select
                          value={newSectionAttachmentType}
                          onChange={(e) => setNewSectionAttachmentType(e.target.value as any)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                        >
                          <option value="none">No Attachment</option>
                          <option value="pdf">📄 PDF Document View</option>
                          <option value="video">🎥 Video Lecture (YouTube/MP4)</option>
                          <option value="online">🔗 Online Meeting / Stream Link</option>
                        </select>

                        {newSectionAttachmentType !== "none" && (
                          <>
                            <input
                              type="text"
                              placeholder="Attachment Title (e.g. Chapter 1 PDF Notes)"
                              value={newSectionAttachmentTitle}
                              onChange={(e) => setNewSectionAttachmentTitle(e.target.value)}
                              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                            />
                            <input
                              type="text"
                              placeholder="Attachment URL (PDF link / Video embed / Meeting URL)"
                              value={newSectionAttachmentUrl}
                              onChange={(e) => setNewSectionAttachmentUrl(e.target.value)}
                              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                            />
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleAddSection}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      + Add Module
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {selectedCourse.sections?.map((sec, idx) => (
                    <div key={sec.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                            Module #{idx + 1}
                          </span>
                          <h5 className="font-extrabold text-slate-800 text-sm mt-1">{sec.title}</h5>
                          {sec.description && <p className="text-xs text-slate-500 mt-0.5">{sec.description}</p>}
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteSection(sec.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                            title="Delete Module"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {sec.attachmentType && sec.attachmentType !== "none" && (
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 flex items-center gap-1">
                              {sec.attachmentType === "pdf" && <FileText className="w-3 h-3 text-red-600" />}
                              {sec.attachmentType === "video" && <Video className="w-3 h-3 text-indigo-600" />}
                              {sec.attachmentType === "online" && <Sparkles className="w-3 h-3 text-amber-600" />}
                              <span>{sec.attachmentType.toUpperCase()} ATTACHMENT</span>
                            </span>
                            {sec.attachmentTitle && (
                              <span className="text-xs font-bold text-slate-700">{sec.attachmentTitle}</span>
                            )}
                          </div>

                          {sec.attachmentType === "pdf" && (
                            <div className="space-y-2">
                              {sec.attachmentUrl && (
                                <div className="aspect-4/3 w-full max-h-72 bg-slate-900 rounded-xl overflow-hidden border">
                                  <iframe
                                    src={sec.attachmentUrl}
                                    title={sec.attachmentTitle || "PDF View"}
                                    className="w-full h-full border-0"
                                  />
                                </div>
                              )}
                              <a
                                href={sec.attachmentUrl || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Open PDF Document</span>
                              </a>
                            </div>
                          )}

                          {sec.attachmentType === "video" && (
                            <div className="space-y-2">
                              {sec.attachmentUrl && (
                                <div className="aspect-video w-full max-h-72 bg-black rounded-xl overflow-hidden border">
                                  {sec.attachmentUrl.includes("youtube") || sec.attachmentUrl.includes("embed") ? (
                                    <iframe
                                      src={sec.attachmentUrl}
                                      title={sec.attachmentTitle || "Video Lecture"}
                                      className="w-full h-full border-0"
                                      allowFullScreen
                                    />
                                  ) : (
                                    <video
                                      src={sec.attachmentUrl}
                                      controls
                                      className="w-full h-full object-contain"
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {sec.attachmentType === "online" && (
                            <div className="pt-1">
                              <a
                                href={sec.attachmentUrl || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Join Online Class / Meeting</span>
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {(!selectedCourse.sections || selectedCourse.sections.length === 0) && (
                    <p className="text-xs text-slate-400 italic text-center py-6">No sections or modules added yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: LIVE CLASSES */}
            {workspaceTab === "live" && (
              <div className="space-y-4">
                {isAdmin && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-700">Schedule Live Stream / Class Session</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Live Stream Topic Title"
                        value={liveTitle}
                        onChange={(e) => setLiveTitle(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold"
                      />
                      <select
                        value={liveTeacherId}
                        onChange={(e) => setLiveTeacherId(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                      >
                        <option value="">-- Assign Teacher / Faculty --</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.specialization || t.subject || "Faculty"})</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Date & Time (e.g. 2026-07-28 17:00)"
                        value={liveDateTime}
                        onChange={(e) => setLiveDateTime(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium"
                      />
                      <input
                        type="text"
                        placeholder="Google Meet / Video Link"
                        value={liveUrl}
                        onChange={(e) => setLiveUrl(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium"
                      />
                    </div>
                    <button
                      onClick={handleAddLiveClass}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      + Publish Live Session
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {selectedCourse.liveClasses?.map((lc) => (
                    <div key={lc.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          <span className="text-xs font-bold text-rose-600 uppercase">Interactive Studio Live Stream</span>
                        </div>
                        <h5 className="font-extrabold text-slate-800 text-sm">{lc.title}</h5>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>Scheduled: {lc.scheduledAt}</span>
                          <span className="text-[11px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                            Faculty: {lc.instructorName || selectedCourse.mentorName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setActiveStudioLiveClass({
                              ...lc,
                              courseTitle: selectedCourse.title,
                              instructorName: lc.instructorName || selectedCourse.mentorName
                            })
                          }
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Launch Live Studio 🎥</span>
                        </button>

                        {lc.meetingOrVideoUrl && lc.meetingOrVideoUrl !== "#" && (
                          <a
                            href={lc.meetingOrVideoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1"
                            title="External Link"
                          >
                            <span>External</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!selectedCourse.liveClasses || selectedCourse.liveClasses.length === 0) && (
                    <p className="text-xs text-slate-400 italic text-center py-6">No scheduled live classes.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: QUESTION BANK & TESTS */}
            {workspaceTab === "tests" && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-black text-indigo-900">Course Question Bank & Online Mock Examinations</h4>
                    <p className="text-xs text-indigo-700 mt-0.5">Chapter-wise mock practice tests and solved question bank.</p>
                  </div>
                  <span className="text-xs font-extrabold uppercase bg-indigo-600 text-white px-3 py-1 rounded-xl shadow-xs">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded">Practice Set #01</span>
                      <span className="text-[10px] font-bold text-slate-400">30 Questions • 45 Mins</span>
                    </div>
                    <h5 className="font-extrabold text-slate-800 text-sm">{selectedCourse.title} - Foundation Quiz</h5>
                    <p className="text-xs text-slate-500">Interactive timed practice test with immediate score evaluation and answer explanations.</p>
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer">
                      Start Practice Quiz
                    </button>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase bg-purple-50 text-purple-700 px-2.5 py-1 rounded">Grand Mock Exam</span>
                      <span className="text-[10px] font-bold text-slate-400">50 Questions • 90 Mins</span>
                    </div>
                    <h5 className="font-extrabold text-slate-800 text-sm">{selectedCourse.title} - Mid-Term Assessment</h5>
                    <p className="text-xs text-slate-500">Comprehensive syllabus assessment covering all completed modules and live topics.</p>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer">
                      Attempt Mock Exam
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ANNOUNCEMENTS */}
            {workspaceTab === "announcements" && (
              <div className="space-y-4">
                {isAdmin && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-700">Publish Course Announcement</h4>
                    <input
                      type="text"
                      placeholder="Announcement Heading"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold"
                    />
                    <textarea
                      rows={2}
                      placeholder="Announcement body..."
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium"
                    />
                    <button
                      onClick={handleAddCourseAnnouncement}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      + Broadcast Announcement
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {selectedCourse.announcements?.map((a) => (
                    <div key={a.id} className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-extrabold text-amber-900 text-sm">{a.title}</h5>
                        <span className="text-[10px] font-bold text-amber-600">{a.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{a.content}</p>
                    </div>
                  ))}
                  {(!selectedCourse.announcements || selectedCourse.announcements.length === 0) && (
                    <p className="text-xs text-slate-400 italic text-center py-6">No course announcements yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: CLASS NOTES */}
            {workspaceTab === "notes" && (
              <div className="space-y-4">
                {isAdmin && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-700">Upload / Add Study Notes & Handouts</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Document / Notes Title"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="PDF Link or Document Content URL"
                        value={noteUrl}
                        onChange={(e) => setNoteUrl(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium"
                      />
                    </div>
                    <button
                      onClick={handleAddClassNote}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      + Publish Class Note
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {selectedCourse.classNotes?.map((cn) => (
                    <div key={cn.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                      <div>
                        <h5 className="font-extrabold text-slate-800 text-sm">{cn.title}</h5>
                        <span className="text-[10px] text-slate-400">Uploaded: {cn.uploadedAt}</span>
                      </div>
                      <a
                        href={cn.fileUrlOrContent}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </a>
                    </div>
                  ))}
                  {(!selectedCourse.classNotes || selectedCourse.classNotes.length === 0) && (
                    <p className="text-xs text-slate-400 italic text-center py-6">No class notes uploaded yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: CHAT WITH MENTOR FOR DOUBTS */}
            {workspaceTab === "doubts" && (
              <div className="space-y-4">
                {!isAdmin && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                        Ask Your Academic Doubt
                      </h4>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Instant AI Solver with Sources Available
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        placeholder="Type your question or syllabus doubt (e.g. physics problem, chemical equation)..."
                        value={studentDoubtMsg}
                        onChange={(e) => setStudentDoubtMsg(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-indigo-600"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAskStudentDoubt(false)}
                          disabled={!studentDoubtMsg.trim() || !!solvingDoubtId}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Post Doubt
                        </button>
                        <button
                          onClick={() => handleAskStudentDoubt(true)}
                          disabled={!studentDoubtMsg.trim() || !!solvingDoubtId}
                          className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 disabled:opacity-50 text-white font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                          Instant AI Solve
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {selectedCourse.doubts?.map((d) => (
                    <div key={d.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-indigo-600" />
                          {d.studentName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{d.timestamp}</span>
                      </div>

                      <p className="text-xs text-slate-800 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                        "{d.message}"
                      </p>

                      {d.reply ? (
                        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${
                              d.repliedBy?.includes("AI") ? "text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full" : "text-indigo-700"
                            }`}>
                              {d.repliedBy?.includes("AI") ? <Sparkles className="w-3 h-3 text-amber-600" /> : null}
                              Response ({d.repliedBy || "Mentor"}):
                            </span>
                          </div>
                          <div className="prose prose-xs max-w-none text-slate-800 break-words leading-relaxed">
                            <Markdown
                              components={{
                                a: ({ href, children }) => (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-800 underline font-semibold break-all inline-flex items-center gap-0.5"
                                  >
                                    {children}
                                    <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
                                  </a>
                                ),
                                h1: ({ children }) => <h1 className="text-sm font-black text-slate-900 mt-2 mb-1">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-xs font-black text-indigo-700 mt-2 mb-1">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-xs font-bold text-amber-700 mt-1.5 mb-0.5">{children}</h3>,
                                ul: ({ children }) => <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-700">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-4 space-y-0.5 text-xs text-slate-700">{children}</ol>,
                                li: ({ children }) => <li className="text-xs text-slate-700 leading-snug">{children}</li>,
                                code: ({ children }) => <code className="bg-slate-200/80 text-amber-800 px-1 py-0.5 rounded text-[11px] font-mono">{children}</code>,
                              }}
                            >
                              {d.reply}
                            </Markdown>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 pt-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleSolveDoubtWithAI(d.id, d.message)}
                              disabled={solvingDoubtId === d.id}
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-amber-600 hover:to-indigo-700 cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                            >
                              {solvingDoubtId === d.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Solving with Sources...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                                  <span>Solve with AI Tutor (with Sources)</span>
                                </>
                              )}
                            </button>

                            {isAdmin && activeDoubtId !== d.id && (
                              <button
                                onClick={() => setActiveDoubtId(d.id)}
                                className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                              >
                                + Manual Mentor Reply
                              </button>
                            )}
                          </div>

                          {isAdmin && activeDoubtId === d.id && (
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="text"
                                placeholder="Type your mentor reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-indigo-600"
                              />
                              <button
                                onClick={() => handleReplyDoubt(d.id)}
                                className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 cursor-pointer"
                              >
                                Send Reply
                              </button>
                              <button
                                onClick={() => setActiveDoubtId(null)}
                                className="px-2 py-1.5 text-slate-400 hover:text-slate-600 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {(!selectedCourse.doubts || selectedCourse.doubts.length === 0) && (
                    <p className="text-xs text-slate-400 italic text-center py-6">No doubt threads recorded yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB: ENROLLMENTS & ACCESS CONTROL */}
            {workspaceTab === "enrollments" && isAdmin && (
              <StudentEnrollManager
                courses={courses}
                onUpdateCourse={onUpdateCourse}
                students={students || []}
                setStudents={setStudents}
                storeOrders={storeOrders || []}
                setStoreOrders={setStoreOrders}
                preselectedCourseId={selectedCourse.id}
              />
            )}
          </div>
        </div>

        {/* LIVE CLASSROOM STUDIO MODAL */}
        {activeStudioLiveClass && (
          <LiveClassStudio
            liveClass={activeStudioLiveClass}
            userRole={isAdmin ? "admin" : "teacher"}
            currentUser={{ id: currentUserId, name: currentUserName }}
            onClose={() => setActiveStudioLiveClass(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sticky Header with Main Tab Switcher for Admin */}
      {isAdmin && (
        <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md pt-1 pb-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* Main Tabs */}
            <div className="flex items-center space-x-1.5 bg-slate-200/80 p-1 rounded-2xl">
              <button
                onClick={() => setActiveMainTab("catalog")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === "catalog"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Courses Catalog ({courses.length})</span>
              </button>

              <button
                onClick={() => setActiveMainTab("enrollments")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === "enrollments"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Student Enroll Management</span>
                {pendingStoreCourseOrdersCount > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-black animate-pulse">
                    {pendingStoreCourseOrdersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Create New Course Button (Shown in catalog mode) */}
            {activeMainTab === "catalog" && (
              <button
                onClick={() => {
                  resetCourseForm();
                  setIsCreateModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 flex items-center space-x-2 shrink-0 cursor-pointer transition-all ml-1"
                title="Create New Course"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Course</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* RENDER ACTIVE MAIN TAB FOR ADMIN */}
      {isAdmin && activeMainTab === "enrollments" ? (
        <StudentEnrollManager
          courses={courses}
          onUpdateCourse={onUpdateCourse}
          students={students || []}
          setStudents={setStudents}
          storeOrders={storeOrders || []}
          setStoreOrders={setStoreOrders}
        />
      ) : (
        <>
          {/* Pending Course Order Notice for Students */}
      {!isAdmin && pendingCourseOrders.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl flex items-start space-x-3 text-left animate-fadeIn">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-amber-900 text-xs uppercase tracking-wider">
              Course Order Awaiting Admin Confirmation ({pendingCourseOrders.length})
            </h4>
            <p className="text-xs text-amber-800">
              Your course order has been placed successfully. As soon as the Administrator confirms your order, your course will automatically unlock and appear right here!
            </p>
          </div>
        </div>
      )}

      {/* Main Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedCourses.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm space-y-4">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-800">No Purchased Courses Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {pendingCourseOrders.length > 0 
                ? "Your course order is currently pending Admin confirmation. Once confirmed by admin, your course will automatically appear here."
                : "You have not enrolled in any courses yet. Browse the Store to enroll in courses. Once confirmed by Admin, courses will automatically appear in your dashboard."}
            </p>
          </div>
        ) : (
          displayedCourses.map((course) => (
          <div 
            key={course.id} 
            className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
              course.isBlocked 
                ? "border-rose-200 bg-rose-50/20 opacity-80" 
                : course.isPublished 
                  ? "border-slate-200 hover:border-indigo-400 shadow-sm hover:shadow-md" 
                  : "border-amber-200 bg-amber-50/10"
            }`}
          >
            <div className="p-5 space-y-3">
              {/* Status Badges */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {course.duration}
                </span>

                <div className="flex items-center space-x-1.5">
                  {course.isBlocked ? (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Blocked
                    </span>
                  ) : course.isPublished ? (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Live
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Draft
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="font-extrabold text-slate-850 text-base leading-snug line-clamp-2">
                {course.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {course.description}
              </p>

              {/* Mentor & Stats */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Mentor:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    {course.mentorName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Fee:</span>
                  <span className="font-black text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    FREE (₹0)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Sections:</span>
                  <span className="font-semibold text-slate-700">{course.sections?.length || 0} Modules</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
              <button
                onClick={() => handleOpenCourse(course)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{isAdmin ? "Manage Course Content" : "Study Course Content"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {isAdmin && (
                <div className="flex items-center justify-between gap-1 pt-1">
                  {/* Toggle Live / Publish */}
                  <button
                    onClick={() => onUpdateCourse({ ...course, isPublished: !course.isPublished })}
                    className={`flex-1 text-[10px] font-bold uppercase py-1.5 px-2 rounded-lg border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      course.isPublished 
                        ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" 
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    {course.isPublished ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{course.isPublished ? "Unpublish" : "Publish Live"}</span>
                  </button>

                  {/* Toggle Block */}
                  <button
                    onClick={() => onUpdateCourse({ ...course, isBlocked: !course.isBlocked })}
                    className={`flex-1 text-[10px] font-bold uppercase py-1.5 px-2 rounded-lg border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      course.isBlocked 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                        : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                    }`}
                  >
                    {course.isBlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    <span>{course.isBlocked ? "Unblock" : "Block"}</span>
                  </button>

                  {/* Manage Enrollments Quick Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCourse(course);
                      setWorkspaceTab("enrollments");
                    }}
                    className="p-1.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer flex items-center gap-1 text-[11px] font-bold transition-colors"
                    title="Manage Enrolled Students"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{course.enrolledStudentIds?.length || 0}</span>
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(course)}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg cursor-pointer"
                    title="Edit Course Meta"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (confirm(`Delete course "${course.title}"?`)) {
                        onDeleteCourse(course.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 rounded-lg cursor-pointer"
                    title="Delete Course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )))}
      </div>
      </>
      )}

      {/* CREATE COURSE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">Create New Study HUB Course</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourseSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Class 12th Physics Mastery Batch 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-semibold text-slate-800 text-xs sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Course overview, highlights, and syllabus details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-medium text-slate-800 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Mentor Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Prof. Rajesh Sharma"
                    value={mentorName}
                    onChange={(e) => setMentorName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-semibold text-slate-800 text-xs sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 6 Months / 1 Year"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-semibold text-slate-800 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 cursor-pointer text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/30 cursor-pointer text-xs sm:text-sm"
                >
                  Create & Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COURSE META MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">Edit Course Details</h3>
              <button 
                onClick={() => setEditingCourse(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCourseSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-semibold text-slate-800 text-xs sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-medium text-slate-800 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mentor Name</label>
                  <input
                    type="text"
                    value={mentorName}
                    onChange={(e) => setMentorName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-semibold text-slate-800 text-xs sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-indigo-600 font-semibold text-slate-800 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 cursor-pointer text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/30 cursor-pointer text-xs sm:text-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SELECTED COURSE WORKSPACE DRAWER / MODAL REMOVED */}
      {false && selectedCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full my-6 p-6 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded-md">
                  Course Content Hub
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">{selectedCourse.title}</h2>
                <p className="text-xs text-slate-500">Mentor: <strong className="text-slate-800">{selectedCourse.mentorName}</strong> | Duration: {selectedCourse.duration}</p>
              </div>

              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete course "${selectedCourse.title}"?`)) {
                        onDeleteCourse(selectedCourse.id);
                        setSelectedCourse(null);
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Course</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-tabs inside Course Workspace */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3 shrink-0">
              <button
                onClick={() => setWorkspaceTab("sections")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  workspaceTab === "sections" 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Sections ({selectedCourse.sections?.length || 0})</span>
              </button>

              <button
                onClick={() => setWorkspaceTab("live")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  workspaceTab === "live" 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Video className="w-3.5 h-3.5 text-rose-500" />
                <span>Live Classes ({selectedCourse.liveClasses?.length || 0})</span>
              </button>

              <button
                onClick={() => setWorkspaceTab("announcements")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  workspaceTab === "announcements" 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Megaphone className="w-3.5 h-3.5 text-amber-500" />
                <span>Announcements ({selectedCourse.announcements?.length || 0})</span>
              </button>

              <button
                onClick={() => setWorkspaceTab("notes")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  workspaceTab === "notes" 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>Class Notes ({selectedCourse.classNotes?.length || 0})</span>
              </button>

              <button
                onClick={() => setWorkspaceTab("doubts")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  workspaceTab === "doubts" 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                <span>Chat Doubts ({selectedCourse.doubts?.length || 0})</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* TAB 1: SECTIONS */}
              {workspaceTab === "sections" && (
                <div className="space-y-4">
                  {isAdmin && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-black uppercase text-slate-700">Add New Section / Module</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Section Title (e.g. Section 1: Vectors & Kinematics)"
                          value={newSectionTitle}
                          onChange={(e) => setNewSectionTitle(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold"
                        />
                        <input
                          type="text"
                          placeholder="Short Description..."
                          value={newSectionDesc}
                          onChange={(e) => setNewSectionDesc(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium"
                        />
                      </div>

                      {/* Attachment Section */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                        <label className="block text-[11px] font-bold text-slate-700">Attach Content to Module (PDF View, Video, Online Link)</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <select
                            value={newSectionAttachmentType}
                            onChange={(e) => setNewSectionAttachmentType(e.target.value as any)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                          >
                            <option value="none">No Attachment</option>
                            <option value="pdf">📄 PDF Document View</option>
                            <option value="video">🎥 Video Lecture (YouTube/MP4)</option>
                            <option value="online">🔗 Online Meeting / Stream Link</option>
                          </select>

                          {newSectionAttachmentType !== "none" && (
                            <>
                              <input
                                type="text"
                                placeholder="Attachment Title (e.g. Chapter 1 PDF Notes)"
                                value={newSectionAttachmentTitle}
                                onChange={(e) => setNewSectionAttachmentTitle(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                              />
                              <input
                                type="text"
                                placeholder="Attachment URL (PDF link / Video embed / Meeting URL)"
                                value={newSectionAttachmentUrl}
                                onChange={(e) => setNewSectionAttachmentUrl(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                              />
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={handleAddSection}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        + Add Module
                      </button>
                    </div>
                  )}

                  <div className="space-y-3">
                    {selectedCourse.sections?.map((sec, idx) => (
                      <div key={sec.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                              Module #{idx + 1}
                            </span>
                            <h5 className="font-extrabold text-slate-800 text-sm mt-1">{sec.title}</h5>
                            {sec.description && <p className="text-xs text-slate-500 mt-0.5">{sec.description}</p>}
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteSection(sec.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                              title="Delete Module"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Attachment View Renderer */}
                        {sec.attachmentType && sec.attachmentType !== "none" && (
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 flex items-center gap-1">
                                {sec.attachmentType === "pdf" && <FileText className="w-3 h-3 text-red-600" />}
                                {sec.attachmentType === "video" && <Video className="w-3 h-3 text-indigo-600" />}
                                {sec.attachmentType === "online" && <Sparkles className="w-3 h-3 text-amber-600" />}
                                <span>{sec.attachmentType.toUpperCase()} ATTACHMENT</span>
                              </span>
                              {sec.attachmentTitle && (
                                <span className="text-xs font-bold text-slate-700">{sec.attachmentTitle}</span>
                              )}
                            </div>

                            {/* PDF View */}
                            {sec.attachmentType === "pdf" && (
                              <div className="space-y-2">
                                {sec.attachmentUrl && (
                                  <div className="aspect-4/3 w-full max-h-72 bg-slate-900 rounded-xl overflow-hidden border">
                                    <iframe
                                      src={sec.attachmentUrl}
                                      title={sec.attachmentTitle || "PDF View"}
                                      className="w-full h-full border-0"
                                    />
                                  </div>
                                )}
                                <a
                                  href={sec.attachmentUrl || "#"}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Open PDF Document</span>
                                </a>
                              </div>
                            )}

                            {/* Video View */}
                            {sec.attachmentType === "video" && (
                              <div className="space-y-2">
                                {sec.attachmentUrl && (
                                  <div className="aspect-video w-full max-h-72 bg-black rounded-xl overflow-hidden border">
                                    {sec.attachmentUrl.includes("youtube") || sec.attachmentUrl.includes("embed") ? (
                                      <iframe
                                        src={sec.attachmentUrl}
                                        title={sec.attachmentTitle || "Video Lecture"}
                                        className="w-full h-full border-0"
                                        allowFullScreen
                                      />
                                    ) : (
                                      <video
                                        src={sec.attachmentUrl}
                                        controls
                                        className="w-full h-full object-contain"
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Online Link View */}
                            {sec.attachmentType === "online" && (
                              <div className="pt-1">
                                <a
                                  href={sec.attachmentUrl || "#"}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  <span>Join Online Class / Meeting</span>
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {(!selectedCourse.sections || selectedCourse.sections.length === 0) && (
                      <p className="text-xs text-slate-400 italic text-center py-6">No sections or modules added yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE CLASSES */}
              {workspaceTab === "live" && (
                <div className="space-y-4">
                  {isAdmin && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-black uppercase text-slate-700">Schedule Live Stream / Class Session</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <input
                          type="text"
                          placeholder="Live Stream Topic Title"
                          value={liveTitle}
                          onChange={(e) => setLiveTitle(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold"
                        />
                        <select
                          value={liveTeacherId}
                          onChange={(e) => setLiveTeacherId(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                        >
                          <option value="">-- Assign Teacher / Faculty --</option>
                          {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.specialization || t.subject || "Faculty"})</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Date & Time (e.g. 2026-07-28 17:00)"
                          value={liveDateTime}
                          onChange={(e) => setLiveDateTime(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium"
                        />
                        <input
                          type="text"
                          placeholder="Google Meet / Video Link"
                          value={liveUrl}
                          onChange={(e) => setLiveUrl(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium"
                        />
                      </div>
                      <button
                        onClick={handleAddLiveClass}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        + Publish Live Session
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    {selectedCourse.liveClasses?.map((lc) => (
                      <div key={lc.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                            <span className="text-xs font-bold text-rose-600 uppercase">Interactive Studio Live Stream</span>
                          </div>
                          <h5 className="font-extrabold text-slate-800 text-sm">{lc.title}</h5>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>Scheduled: {lc.scheduledAt}</span>
                            <span className="text-[11px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                              Faculty: {lc.instructorName || selectedCourse.mentorName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              setActiveStudioLiveClass({
                                ...lc,
                                courseTitle: selectedCourse.title,
                                instructorName: lc.instructorName || selectedCourse.mentorName
                              })
                            }
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Launch Live Studio 🎥</span>
                          </button>

                          {lc.meetingOrVideoUrl && lc.meetingOrVideoUrl !== "#" && (
                            <a
                              href={lc.meetingOrVideoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1"
                              title="External Link"
                            >
                              <span>External</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!selectedCourse.liveClasses || selectedCourse.liveClasses.length === 0) && (
                      <p className="text-xs text-slate-400 italic text-center py-6">No scheduled live classes.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: ANNOUNCEMENTS */}
              {workspaceTab === "announcements" && (
                <div className="space-y-4">
                  {isAdmin && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-black uppercase text-slate-700">Publish Course Announcement</h4>
                      <input
                        type="text"
                        placeholder="Announcement Heading"
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold"
                      />
                      <textarea
                        rows={2}
                        placeholder="Announcement body..."
                        value={annContent}
                        onChange={(e) => setAnnContent(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium"
                      />
                      <button
                        onClick={handleAddCourseAnnouncement}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        + Broadcast Announcement
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    {selectedCourse.announcements?.map((a) => (
                      <div key={a.id} className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-amber-900 text-sm">{a.title}</h5>
                          <span className="text-[10px] font-bold text-amber-600">{a.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{a.content}</p>
                      </div>
                    ))}
                    {(!selectedCourse.announcements || selectedCourse.announcements.length === 0) && (
                      <p className="text-xs text-slate-400 italic text-center py-6">No course announcements yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: CLASS NOTES */}
              {workspaceTab === "notes" && (
                <div className="space-y-4">
                  {isAdmin && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-black uppercase text-slate-700">Upload / Add Study Notes & Handouts</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Document / Notes Title"
                          value={noteTitle}
                          onChange={(e) => setNoteTitle(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold"
                        />
                        <input
                          type="text"
                          placeholder="PDF Link or Document Content URL"
                          value={noteUrl}
                          onChange={(e) => setNoteUrl(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium"
                        />
                      </div>
                      <button
                        onClick={handleAddClassNote}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        + Publish Class Note
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    {selectedCourse.classNotes?.map((cn) => (
                      <div key={cn.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                        <div>
                          <h5 className="font-extrabold text-slate-800 text-sm">{cn.title}</h5>
                          <span className="text-[10px] text-slate-400">Uploaded: {cn.uploadedAt}</span>
                        </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={cn.fileUrlOrContent}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Document</span>
                        </a>
                      </div>
                      </div>
                    ))}
                    {(!selectedCourse.classNotes || selectedCourse.classNotes.length === 0) && (
                      <p className="text-xs text-slate-400 italic text-center py-6">No class notes uploaded yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: CHAT WITH MENTOR FOR DOUBTS */}
              {workspaceTab === "doubts" && (
                <div className="space-y-4">
                  {!isAdmin && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                          Ask Your Academic Doubt
                        </h4>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Instant AI Solver with Sources Available
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type your question or syllabus doubt (e.g. physics problem, chemical equation)..."
                          value={studentDoubtMsg}
                          onChange={(e) => setStudentDoubtMsg(e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-indigo-600"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleAskStudentDoubt(false)}
                            disabled={!studentDoubtMsg.trim() || !!solvingDoubtId}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer"
                          >
                            Post Doubt
                          </button>
                          <button
                            onClick={() => handleAskStudentDoubt(true)}
                            disabled={!studentDoubtMsg.trim() || !!solvingDoubtId}
                            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 disabled:opacity-50 text-white font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                            Instant AI Solve
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {selectedCourse.doubts?.map((d) => (
                      <div key={d.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-indigo-600" />
                            {d.studentName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{d.timestamp}</span>
                        </div>

                        <p className="text-xs text-slate-800 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                          "{d.message}"
                        </p>

                        {d.reply ? (
                          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${
                                d.repliedBy?.includes("AI") ? "text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full" : "text-indigo-700"
                              }`}>
                                {d.repliedBy?.includes("AI") ? <Sparkles className="w-3 h-3 text-amber-600" /> : null}
                                Response ({d.repliedBy || "Mentor"}):
                              </span>
                            </div>
                            <div className="prose prose-xs max-w-none text-slate-800 break-words leading-relaxed">
                              <Markdown
                                components={{
                                  a: ({ href, children }) => (
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-indigo-600 hover:text-indigo-800 underline font-semibold break-all inline-flex items-center gap-0.5"
                                    >
                                      {children}
                                      <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
                                    </a>
                                  ),
                                  h1: ({ children }) => <h1 className="text-sm font-black text-slate-900 mt-2 mb-1">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-xs font-black text-indigo-700 mt-2 mb-1">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-xs font-bold text-amber-700 mt-1.5 mb-0.5">{children}</h3>,
                                  ul: ({ children }) => <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-700">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal pl-4 space-y-0.5 text-xs text-slate-700">{children}</ol>,
                                  li: ({ children }) => <li className="text-xs text-slate-700 leading-snug">{children}</li>,
                                  code: ({ children }) => <code className="bg-slate-200/80 text-amber-800 px-1 py-0.5 rounded text-[11px] font-mono">{children}</code>,
                                }}
                              >
                                {d.reply}
                              </Markdown>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => handleSolveDoubtWithAI(d.id, d.message)}
                                disabled={solvingDoubtId === d.id}
                                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-amber-600 hover:to-indigo-700 cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                              >
                                {solvingDoubtId === d.id ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Solving with Sources...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                                    <span>Solve with AI Tutor (with Sources)</span>
                                  </>
                                )}
                              </button>

                              {isAdmin && activeDoubtId !== d.id && (
                                <button
                                  onClick={() => setActiveDoubtId(d.id)}
                                  className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                                >
                                  + Manual Mentor Reply
                                </button>
                              )}
                            </div>

                            {isAdmin && activeDoubtId === d.id && (
                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  type="text"
                                  placeholder="Type your mentor reply..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-indigo-600"
                                />
                                <button
                                  onClick={() => handleReplyDoubt(d.id)}
                                  className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 cursor-pointer"
                                >
                                  Send Reply
                                </button>
                                <button
                                  onClick={() => setActiveDoubtId(null)}
                                  className="px-2 py-1.5 text-slate-400 hover:text-slate-600 text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {(!selectedCourse.doubts || selectedCourse.doubts.length === 0) && (
                      <p className="text-xs text-slate-400 italic text-center py-6">No doubt threads recorded yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* LIVE CLASSROOM STUDIO MODAL */}
      {activeStudioLiveClass && (
        <LiveClassStudio
          liveClass={activeStudioLiveClass}
          userRole={isAdmin ? "admin" : "teacher"}
          currentUser={{ id: currentUserId, name: currentUserName }}
          onClose={() => setActiveStudioLiveClass(null)}
        />
      )}
    </div>
  );
}
