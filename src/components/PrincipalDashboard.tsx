import { useState } from "react";
import { motion } from "motion/react";
import { 
  Users, BookOpen, UserCheck, Plus, Trash2, Mail, Lock, Sparkles, LogOut, School, ShieldAlert, Award,
  Menu, X
} from "lucide-react";
import { School as SchoolType, Teacher, Student, Batch, AdmissionOfficer } from "../types";

export function getRandomAvatarUrl(name: string): string {
  const images = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150"
  ];
  if (!name) return images[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h << 5) - h + name.charCodeAt(i);
    h |= 0;
  }
  return images[Math.abs(h) % images.length];
}

interface PrincipalDashboardProps {
  school: SchoolType;
  teachers: Teacher[];
  students: Student[];
  batches: Batch[];
  onCreateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onCreateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onCreateBatch: (batch: Batch) => void;
  onDeleteBatch: (id: string) => void;
  onLogout: () => void;
  activeTab?: "overview" | "teachers" | "students" | "batches" | "admissions";
  setActiveTab?: (tab: "overview" | "teachers" | "students" | "batches" | "admissions") => void;
  hideSidebarOnDesktop?: boolean;
  admissionOfficers?: AdmissionOfficer[];
  onCreateAdmissionOfficer?: (ao: AdmissionOfficer) => void;
  onDeleteAdmissionOfficer?: (id: string) => void;
  onUpdateAdmissionOfficerStatus?: (id: string, status: "Active" | "Inactive") => void;
  onUpdateTeacherStatus?: (id: string, status: "Active" | "On Leave") => void;
  onUpdateStudentStatus?: (id: string, status: "Active" | "Inactive") => void;
  onUpdateTeacherPassword?: (id: string, password: string) => void;
  onUpdateStudentPassword?: (id: string, password: string) => void;
}

export default function PrincipalDashboard({
  school,
  teachers,
  students,
  batches,
  onCreateTeacher,
  onDeleteTeacher,
  onCreateStudent,
  onDeleteStudent,
  onCreateBatch,
  onDeleteBatch,
  onLogout,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  hideSidebarOnDesktop = false,
  admissionOfficers = [],
  onCreateAdmissionOfficer,
  onDeleteAdmissionOfficer,
  onUpdateAdmissionOfficerStatus,
  onUpdateTeacherStatus,
  onUpdateStudentStatus,
  onUpdateTeacherPassword,
  onUpdateStudentPassword
}: PrincipalDashboardProps) {
  const [localActiveTab, setLocalActiveTab] = useState<"overview" | "teachers" | "students" | "batches" | "admissions">("overview");
  const activeTab = propActiveTab || localActiveTab;
  const setActiveTab = propSetActiveTab || setLocalActiveTab;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Specific filtered lists
  const schoolTeachers = teachers.filter(t => t.schoolId === school.id);
  const schoolStudents = students.filter(s => s.schoolId === school.id);
  const schoolBatches = batches.filter(b => {
    // If batch teacher is affiliated with this school, the batch is under this school
    const teacher = teachers.find(t => t.id === b.teacherId);
    return teacher ? teacher.schoolId === school.id : false;
  });

  // State managers
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [newTeacherSpecs, setNewTeacherSpecs] = useState("");
  const [newTeacherPassword, setNewTeacherPassword] = useState("");

  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentRoll, setNewStudentRoll] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("");
  const [newStudentDob, setNewStudentDob] = useState("");

  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchSubject, setNewBatchSubject] = useState("");
  const [newBatchTeacherId, setNewBatchTeacherId] = useState("");
  const [newBatchSchedule, setNewBatchSchedule] = useState("");

  // Admissions form states
  const [newAdmissionName, setNewAdmissionName] = useState("");
  const [newAdmissionEmail, setNewAdmissionEmail] = useState("");
  const [newAdmissionPassword, setNewAdmissionPassword] = useState("");

  const handleCreateAdmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmissionName || !newAdmissionEmail) return;

    if (!onCreateAdmissionOfficer) {
      alert("Admissions actions are not wired up.");
      return;
    }

    const finalPassword = newAdmissionPassword.trim() || "admission" + Math.floor(100 + Math.random() * 900);
    const newOfficer: AdmissionOfficer = {
      id: "admission_" + Date.now(),
      name: newAdmissionName,
      email: newAdmissionEmail,
      status: "Active",
      password: finalPassword,
      avatar: getRandomAvatarUrl(newAdmissionName)
    };

    onCreateAdmissionOfficer(newOfficer);
    setNewAdmissionName("");
    setNewAdmissionEmail("");
    setNewAdmissionPassword("");
    alert(`Admissions Desk Staff registered successfully! Credentials: Email: ${newAdmissionEmail}, Password Code: ${finalPassword}`);
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName || !newTeacherEmail) return;

    const finalPassword = newTeacherPassword.trim() || "teach_" + Math.floor(100 + Math.random() * 900);
    onCreateTeacher({
      id: "t_" + Date.now(),
      name: newTeacherName,
      email: newTeacherEmail,
      specialization: newTeacherSpecs || "Core Curriculum",
      avatar: getRandomAvatarUrl(newTeacherName),
      status: "Active",
      password: finalPassword,
      schoolId: school.id
    });

    setNewTeacherName("");
    setNewTeacherEmail("");
    setNewTeacherSpecs("");
    setNewTeacherPassword("");
    alert(`Teacher Registered Successfully under ${school.name}!\nEmail: ${newTeacherEmail}\nLogin Code: ${finalPassword}`);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentEmail) return;
    if (!newStudentPassword.trim()) {
      alert("Registered Mobile Number is mandatory to create a student's login account.");
      return;
    }

    const finalRoll = newStudentRoll || `${school.code}-S-${Math.floor(100 + Math.random() * 900)}`;
    const finalMobile = newStudentPassword.trim();
    const finalDob = newStudentDob.trim() || "12-11-2006";

    onCreateStudent({
      id: "s_" + Date.now(),
      name: newStudentName,
      email: newStudentEmail,
      rollNo: finalRoll,
      avatar: getRandomAvatarUrl(newStudentName),
      status: "Active",
      password: finalMobile,
      mobileNumber: finalMobile,
      dob: finalDob,
      schoolId: school.id,
      schoolName: school.name
    });

    setNewStudentName("");
    setNewStudentEmail("");
    setNewStudentRoll("");
    setNewStudentPassword("");
    setNewStudentDob("");
    alert(`Scholar Registered Successfully under ${school.name}!\nRoll Number: ${finalRoll}\nRegistered Mobile Number: ${finalMobile}\nDOB Password: ${finalDob}`);
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName || !newBatchSubject || !newBatchTeacherId) return;

    onCreateBatch({
      id: "b_" + Date.now(),
      name: newBatchName,
      subject: newBatchSubject,
      schedule: newBatchSchedule || "Mon, Wed, Fri 10:00 AM",
      teacherId: newBatchTeacherId,
      studentIds: [],
      code: `${school.code}-CL-${Math.floor(100 + Math.random() * 900)}`
    });

    setNewBatchName("");
    setNewBatchSubject("");
    setNewBatchTeacherId("");
    setNewBatchSchedule("");
    alert("Course Class Batch created successfully!");
  };

  const getTabStyle = (tab: "overview" | "teachers" | "students" | "batches" | "admissions") => {
    const isActive = activeTab === tab;
    return `flex items-center justify-between lg:justify-start space-x-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-xs font-extrabold uppercase tracking-widest transition-all duration-200 shrink-0 whitespace-nowrap cursor-pointer border ${
      isActive 
        ? "bg-red-600 border-red-600 text-white shadow-xs hover:bg-black hover:border-black hover:text-white" 
        : "bg-white border-slate-200 text-slate-800 hover:bg-black hover:border-black hover:text-white"
    }`;
  };

  return (
    <div className="space-y-6">
      {/* Principal Header Bar */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-650/10 rounded-full blur-3xl animate-pulse" />
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-red-600/10 border border-red-500/30 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
            <School className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-red-650 text-white font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                School Principal Dashboard
              </span>
              <span className="bg-slate-800 text-slate-300 font-mono text-[9px] px-2 py-0.5 rounded-md font-bold uppercase">
                CODE: {school.code}
              </span>
              <span className="bg-pink-600 text-white font-mono text-[9px] px-2 py-0.5 rounded-md font-bold uppercase">
                EMP CODE: {school.principalEmployeeCode || "MPDIGI100"}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-50 tracking-tight mt-1">{school.name}</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Welcome Back, <span className="text-slate-200 font-bold">{school.principalName}</span> • Academic Principal & Administrator
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs bg-slate-850 border border-slate-800 px-3.5 py-1.5 rounded-xl font-semibold text-slate-300">
            📍 {school.address}
          </span>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 bg-red-650/20 border border-red-500/30 text-red-400 hover:bg-red-650 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Grid containing Standard Left Sidebar and Main Display Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar Menu */}
        <div className={`${hideSidebarOnDesktop ? "hidden" : "lg:col-span-1"} space-y-4 no-print lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto no-scrollbar`}>
          
          {/* Hamburger Mobile Menu bar */}
          <div className="lg:hidden flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
            <div className="flex items-center space-x-2">
              <School className="w-4 h-4 text-red-600 animate-pulse" />
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                Menu: {activeTab}
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-red-50 border border-slate-200/50 text-xs font-bold uppercase text-red-600 cursor-pointer hover:bg-black hover:text-white transition-all"
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

          {/* Sidebar Menu items */}
          <div className={`bg-slate-50 p-4 lg:p-6 rounded-2xl border border-slate-250 shadow-sm ${
            isMobileMenuOpen ? "flex flex-col animate-fadeIn" : "hidden lg:flex lg:flex-col"
          } gap-1.5 h-fit shrink-0 text-slate-800`}>
            <div className="px-3 mb-3 text-left">
              <span className="block text-[8px] font-extrabold uppercase tracking-widest text-red-650">Principal Office</span>
              <h3 className="text-xs font-black text-slate-450 tracking-wider uppercase">
                Academic Console
              </h3>
            </div>

            <button 
              onClick={() => {
                setActiveTab("overview");
                setIsMobileMenuOpen(false);
              }} 
              className={getTabStyle("overview")}
            >
              <div className="flex items-center space-x-2.5">
                <Award className="w-4 h-4 shrink-0" />
                <span>Home Overview</span>
              </div>
            </button>

            <button 
              onClick={() => {
                setActiveTab("teachers");
                setIsMobileMenuOpen(false);
              }} 
              className={getTabStyle("teachers")}
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4 shrink-0" />
                <span>Teachers ({schoolTeachers.length})</span>
              </div>
            </button>

            <button 
              onClick={() => {
                setActiveTab("students");
                setIsMobileMenuOpen(false);
              }} 
              className={getTabStyle("students")}
            >
              <div className="flex items-center space-x-2.5">
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>Scholars ({schoolStudents.length})</span>
              </div>
            </button>

            <button 
              onClick={() => {
                setActiveTab("batches");
                setIsMobileMenuOpen(false);
              }} 
              className={getTabStyle("batches")}
            >
              <div className="flex items-center space-x-2.5">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Batches ({schoolBatches.length})</span>
              </div>
            </button>

            <button 
              onClick={() => {
                setActiveTab("admissions");
                setIsMobileMenuOpen(false);
              }} 
              className={getTabStyle("admissions")}
              id="tab-principal-admissions"
            >
              <div className="flex items-center space-x-2.5">
                <UserCheck className="w-4 h-4 shrink-0 text-red-500" />
                <span>Admissions Desk ({admissionOfficers.length})</span>
              </div>
            </button>
          </div>

          {/* Quick HUD Card for Principal */}
          <div className={`bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl shadow-sm text-left ${
            isMobileMenuOpen ? "block animate-fadeIn" : "hidden lg:block"
          }`}>
            <div className="flex items-center space-x-2 px-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="block text-[8px] font-black uppercase tracking-widest text-red-400">Security Access Authorized</span>
            </div>
            <p className="text-[11px] font-extrabold mt-1 text-slate-100 truncate px-1">{school.principalName}</p>
            <p className="text-[9px] text-slate-400 font-mono mt-0.5 px-1 uppercase leading-none">ROLE: SCHOOL PRINCIPAL</p>
          </div>

        </div>

        {/* Main Display Area */}
        <div className={`${hideSidebarOnDesktop ? "lg:col-span-4" : "lg:col-span-3"} space-y-6`}>

      {/* OVERVIEW CONTENT */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <motion.div 
              whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Recruited Faculty</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{schoolTeachers.length} Academic Staff</p>
              </div>
              <div className="w-12 h-12 bg-red-50 text-red-650 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Allocated Scholars</p>
                <p className="text-2xl font-black text-slate-850 mt-1">{schoolStudents.length} Students</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Class Batches</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{schoolBatches.length} Underway</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
            </motion.div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Quick Start Operations Directive</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              As the certified Principal of <span className="text-red-650 font-black">{school.name}</span>, you are granted complete autonomy over your school branch workspace. Monitor your school's faculty, view scholars, and coordinate educational batches.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <motion.button 
                whileHover={{ scale: 1.02, y: -2, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => setActiveTab("teachers")}
                className="bg-slate-50 hover:bg-red-50/40 p-4 rounded-xl border border-slate-200 text-left transition-all cursor-pointer group"
              >
                <span className="block text-xs font-black text-red-650 uppercase">1. View Faculty Instructors</span>
                <span className="block text-[11px] text-slate-400 mt-1 group-hover:text-slate-600 font-semibold">
                  Monitor active teachers directly under your branch. Logins and workspaces are authorized by the Super Admin.
                </span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02, y: -2, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => setActiveTab("students")}
                className="bg-slate-50 hover:bg-indigo-50/40 p-4 rounded-xl border border-slate-200 text-left transition-all cursor-pointer group"
              >
                <span className="block text-xs font-black text-indigo-650 uppercase">2. View Scholar Directory</span>
                <span className="block text-[11px] text-slate-400 mt-1 group-hover:text-slate-600 font-semibold">
                  Inspect student profiles and academic statuses. Student registration is handled exclusively by the Super Admin.
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* TEACHERS TAB */}
      {activeTab === "teachers" && (
        <div className="space-y-6">
          {/* Informational banner */}
          <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-xl text-xs font-semibold text-indigo-800">
            ℹ️ Faculty registration and workspace allocations are managed exclusively by the Administrator. New instructors cannot be registered from the Principal menu.
          </div>

          {/* Teachers list */}
          <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-150 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wide">Recruited Academic Faculty</span>
              <span className="text-xs px-2.5 py-1 bg-red-50 text-red-650 font-black rounded-full">
                {schoolTeachers.length} Academic Instructors
              </span>
            </div>
            {schoolTeachers.length === 0 ? (
              <div className="p-8 text-center bg-slate-10 shadow-inner">
                <p className="text-xs text-slate-500 font-bold">No instructors have been registered yet.</p>
                <p className="text-[10px] text-slate-400 mt-1">Please register your faculty staff above to authorize their portal access keys.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {schoolTeachers.map((t) => (
                  <div key={t.id} className="p-6 flex items-center justify-between hover:bg-slate-50/20 transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-mono text-sm font-bold uppercase shrink-0">
                        {t.name ? t.name.substring(0, 2) : "TR"}
                      </div>
                      <div>
                        <h5 className="font-extrabold text-slate-800 text-sm leading-snug">{t.name}</h5>
                        <p className="text-xs text-red-650 font-bold">{t.specialization}</p>
                        <div className="flex items-center space-x-3 mt-1.5 text-xs text-slate-400 font-semibold">
                          <span className="flex items-center space-x-1.5 font-mono">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{t.email}</span>
                          </span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 font-mono">
                            Code: {t.employeeCode || "MPDIGI101"}
                          </span>
                          <span className="bg-slate-150 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700 font-mono">
                            Passkey: {t.password || "green123"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          if (onUpdateTeacherStatus) {
                            const newStatus = t.status === "Active" ? "On Leave" : "Active";
                            onUpdateTeacherStatus(t.id, newStatus);
                          } else {
                            alert("Action not wired up yet.");
                          }
                        }}
                        className={`text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl transition-all cursor-pointer border ${
                          t.status === "Active"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                        }`}
                        title="Toggle faculty login access"
                      >
                        {t.status === "Active" ? "✓ Authorized (Active)" : "🚫 Suspended (On Leave)"}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to dismiss Mrs./Mr. "${t.name}"? This halts their course management logins.`)) {
                            onDeleteTeacher(t.id);
                          }
                        }}
                        className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="Dismiss Faculty"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STUDENTS TAB */}
      {activeTab === "students" && (
        <div className="space-y-6">
          {/* Informational banner */}
          <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-xl text-xs font-semibold text-indigo-800">
            ℹ️ Student registration and matriculations are managed exclusively by the Administrator. New scholars cannot be registered from the Principal menu.
          </div>

          {/* Students list */}
          <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-150 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wide">Authorized Student Scholars</span>
              <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 font-extrabold rounded-full">
                {schoolStudents.length} Active Scholars
              </span>
            </div>
            {schoolStudents.length === 0 ? (
              <div className="p-8 text-center bg-slate-10 shadow-inner">
                <p className="text-xs text-slate-500 font-bold">No students registered under your school branch.</p>
                <p className="text-[10px] text-slate-400 mt-1">Enroll your board students above so they can lookup their digital transcripts.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                      <th className="px-6 py-4">Student Profile</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Roll Number</th>
                      <th className="px-6 py-4">Registered Mobile</th>
                      <th className="px-6 py-4">DOB Pass key</th>
                      <th className="px-6 py-4">Portal Access Control</th>
                      <th className="px-6 py-4 text-right">Dismiss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schoolStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-mono text-[10px] font-bold uppercase shrink-0">
                            {s.name ? s.name.substring(0, 2) : "ST"}
                          </div>
                          <span className="font-bold text-slate-800 block text-xs">{s.name}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-semibold">{s.email}</td>
                        <td className="px-6 py-4 font-mono text-xs font-extrabold text-indigo-650">{s.rollNo}</td>
                        <td className="px-6 py-4">
                          <span className="font-mono bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg font-bold">
                            {s.mobileNumber || s.password || "9876500001"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono bg-emerald-50 text-emerald-805 px-2.5 py-0.5 rounded-lg font-extrabold border border-emerald-100">
                            {s.dob || "12-11-2006"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              if (onUpdateStudentStatus) {
                                const newStatus = s.status === "Active" ? "Inactive" : "Active";
                                onUpdateStudentStatus(s.id, newStatus);
                              } else {
                                alert("Action is not wired up yet.");
                              }
                            }}
                            className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                              s.status === "Active"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                            }`}
                          >
                            {s.status === "Active" ? "✓ Authorized" : "🚫 Suspended"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Dismiss student scholar "${s.name}" from your active registers?`)) {
                                onDeleteStudent(s.id);
                              }
                            }}
                            className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all cursor-pointer inline-block"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BATCHES TAB */}
      {activeTab === "batches" && (
        <div className="space-y-6">
          {/* Add Batch form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Establish New Academic Batch Class (under {school.name})
            </h3>
            <form onSubmit={handleCreateBatch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-black text-slate-500">Batch Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JEE Main Chemistry 2026"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-red-650"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-black text-slate-500">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chemistry"
                  value={newBatchSubject}
                  onChange={(e) => setNewBatchSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-red-650"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-black text-slate-500">Assigned Instructor *</label>
                <select
                  required
                  value={newBatchTeacherId}
                  onChange={(e) => setNewBatchTeacherId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-red-650 font-bold"
                >
                  <option value="">Select School Faculty...</option>
                  {schoolTeachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.specialization})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-black text-slate-500">Schedule Timings</label>
                <input
                  type="text"
                  placeholder="e.g. Mon, Wed, Fri • 4:00 PM"
                  value={newBatchSchedule}
                  onChange={(e) => setNewBatchSchedule(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-red-650"
                />
              </div>
              <div className="md:col-span-4 pt-1">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-black text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Initialize School Batch Section
                </button>
              </div>
            </form>
          </div>

          {/* Batches list */}
          <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-155 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wide">Academics Class Batches Directory</span>
              <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold rounded-full">
                {schoolBatches.length} Classes Underway
              </span>
            </div>
            {schoolBatches.length === 0 ? (
              <div className="p-8 text-center bg-slate-10 shadow-inner">
                <p className="text-xs text-slate-500 font-bold">No course batches established under your school branch.</p>
                <p className="text-[10px] text-slate-400 mt-1">Recruit teachers and initialize course classrooms above.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {schoolBatches.map((b) => {
                  const trainer = schoolTeachers.find(t => t.id === b.teacherId);
                  return (
                    <div key={b.id} className="p-6 flex items-center justify-between hover:bg-slate-50/10 transition-all">
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg border border-emerald-100 font-mono">
                            {b.code}
                          </span>
                          <h6 className="text-xs font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            Subject: {b.subject}
                          </h6>
                        </div>
                        <h5 className="font-extrabold text-slate-800 text-sm">{b.name}</h5>
                        <p className="text-[11px] text-slate-400 font-bold">
                          🕒 Schedule: <span className="text-slate-600 font-mono">{b.schedule}</span> • Assigned Teacher: <span className="text-red-500 font-extrabold uppercase">{trainer ? trainer.name : "N/A"}</span>
                        </p>
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            if (confirm(`Remove custom course batch class "${b.name}"?`)) {
                              onDeleteBatch(b.id);
                            }
                          }}
                          className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                          title="Halt Class"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMISSIONS OFFICER LOGINS (For Principal creation and control) */}
      {activeTab === "admissions" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left animate-fadeIn">
            <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase mb-4 flex items-center space-x-1.5">
              <UserCheck className="w-5 h-5 text-red-600" />
              <span>Register Admissions Desk Staff under {school.name}</span>
            </h4>
            <p className="text-xs text-slate-500 mb-4 leading-normal">
              As the principal of this branch, you can provision dynamic credentials for local desk staff to log in and manage registrations, identity cards, bus passes, and on-desk queries.
            </p>
            <form onSubmit={handleCreateAdmissionSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Officer Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Anand Kumar Verma"
                    value={newAdmissionName} 
                    onChange={e => setNewAdmissionName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-red-650"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Despatch Email Address</label>
                  <input 
                    type="email" 
                    placeholder="e.g. local_admission@mpdigitalschool.com"
                    value={newAdmissionEmail} 
                    onChange={e => setNewAdmissionEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-red-650"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-red-600 uppercase mb-2">Verification Code / Password</label>
                  <input 
                    type="text" 
                    placeholder="Leave blank to auto-generate code"
                    value={newAdmissionPassword} 
                    onChange={e => setNewAdmissionPassword(e.target.value)}
                    className="w-full bg-red-50/50 border border-red-200 rounded-xl px-4 py-2.5 text-sm focus:outline-red-650 text-red-955 font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  className="bg-red-600 hover:bg-black text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Authorize Admissions Partner Login</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Admissions Officers */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-left bg-gradient-to-br from-white to-slate-50/20 animate-fadeIn">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <span className="text-xs font-bold text-slate-500 uppercase">Principal Registered Desk Officers</span>
              <span className="text-xs px-2.5 py-1 bg-red-50 text-red-855 font-bold rounded-full">{admissionOfficers.length} Desk Officer(s)</span>
            </div>
            <div className="divide-y divide-slate-100">
              {admissionOfficers.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                  No active Admissions Desk Officers found. Establish one using the creation console above.
                </div>
              ) : (
                admissionOfficers.map(o => (
                  <div key={o.id} className="p-6 flex items-center justify-between hover:bg-slate-50/40 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-11 h-11 rounded-full bg-red-100 text-red-900 flex items-center justify-center font-mono font-black text-lg select-none">
                        {o.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm leading-snug">{o.name} {o.id === "admission_desk_1" && <span className="text-[10px] text-slate-400">(Fallback Default)</span>}</h5>
                        <div className="flex flex-wrap items-center text-[11px] text-slate-400 mt-1 gap-x-3 gap-y-1">
                          <span className="flex items-center space-x-1 shrink-0">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{o.email}</span>
                          </span>
                          <span className="bg-red-50 text-red-800 px-2 py-0.5 rounded text-[10px] font-bold border border-red-100 font-mono">
                            Login Code: {o.password || "admission12112006"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (onUpdateAdmissionOfficerStatus) {
                            const nextStatus = o.status === "Active" ? "Inactive" : "Active";
                            onUpdateAdmissionOfficerStatus(o.id, nextStatus);
                          }
                        }}
                        className={`text-[9px] uppercase font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors border ${
                          o.status === "Active" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100" 
                            : "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100"
                        }`}
                      >
                        {o.status}
                      </button>
                      {o.id !== "admission_desk_1" && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Revoke login rights and delete Admissions Officer "${o.name}"?`)) {
                              if (onDeleteAdmissionOfficer) {
                                onDeleteAdmissionOfficer(o.id);
                              }
                            }
                          }}
                          className="text-slate-300 hover:text-red-500 p-2 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      </div> {/* Close Main Display Area */}
      </div> {/* Close Grid Layout */}

      {/* Footer Watermark */}
      <div className="mt-12 border-t border-slate-100 pt-6 pb-2 text-center text-xs text-slate-400 font-medium font-sans no-print flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">© 2026 Vishveshwar Foundation Ltd.</span>
        <span className="text-[10px] bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-bold">Principal Academic Intelligence Console</span>
      </div>
    </div>
  );
}
