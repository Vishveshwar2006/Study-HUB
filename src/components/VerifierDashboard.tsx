import React, { useState } from "react";
import { 
  ShieldCheck, 
  Search, 
  Users, 
  Monitor, 
  User, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Check, 
  Layers, 
  FileText,
  Key,
  Database,
  Lock,
  Clock
} from "lucide-react";
import { Student, ComputerDesk, Batch, Verifier } from "../types";

interface VerifierDashboardProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  computerDesks: ComputerDesk[];
  batches: Batch[];
  onLogout: () => void;
  loggedInVerifierId: string;
  verifiers: Verifier[];
  onUpdateVerifierPassword?: (id: string, newPass: string) => void;
  onVerifyStudentAndAllotDesk?: (studentId: string, deskCode: string | "auto" | undefined) => void;
}

export default function VerifierDashboard({
  students,
  setStudents,
  computerDesks,
  batches,
  onLogout,
  loggedInVerifierId,
  verifiers,
  onUpdateVerifierPassword,
  onVerifyStudentAndAllotDesk
}: VerifierDashboardProps) {
  const [activeTab, setActiveTab] = useState<"students" | "desks" | "profile">("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "unverified">("all");
  
  // Verification Modal State
  const [selectedStudentForVerification, setSelectedStudentForVerification] = useState<Student | null>(null);
  const [aadharNumber, setAadharNumber] = useState("");
  const [rollNumberInput, setRollNumberInput] = useState("");
  const [validationError, setValidationError] = useState("");

  // Profile password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const currentVerifier = verifiers.find(v => v.id === loggedInVerifierId) || verifiers[0] || {
    id: "v_default",
    name: "Govind Kumar (Chief Verifier)",
    username: "verify1",
    employeeCode: "MPDIGI401",
    status: "Active"
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.rollNo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.verifiedRollNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.scholarNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.ssmId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.aadharNumber || "").includes(searchQuery);

    const matchesBatch = selectedBatchId === "all" || s.batchId === selectedBatchId;
    
    let matchesStatus = true;
    if (statusFilter === "verified") matchesStatus = !!s.isVerified;
    if (statusFilter === "unverified") matchesStatus = !s.isVerified;

    return matchesSearch && matchesBatch && matchesStatus;
  });

  const totalStudentsCount = students.length;
  const verifiedStudentsCount = students.filter(s => s.isVerified).length;
  const pendingStudentsCount = totalStudentsCount - verifiedStudentsCount;

  // Open verification modal
  const handleOpenVerification = (student: Student) => {
    setSelectedStudentForVerification(student);
    setAadharNumber(student.aadharNumber || "");
    setRollNumberInput(student.verifiedRollNumber || student.rollNo || "");
    setValidationError("");
  };

  // Submit verification
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    const cleanAadhar = aadharNumber.replace(/\s+/g, "");
    if (!cleanAadhar) {
      setValidationError("Aadhar Number is required.");
      return;
    }

    if (!/^\d{12}$/.test(cleanAadhar)) {
      setValidationError("Aadhar Number must be exactly 12 numeric digits.");
      return;
    }

    if (!rollNumberInput.trim()) {
      setValidationError("Roll Number is required.");
      return;
    }

    // Save changes
    setStudents(prev => prev.map(s => {
      if (s.id === selectedStudentForVerification?.id) {
        return {
          ...s,
          isVerified: true,
          aadharNumber: cleanAadhar,
          verifiedRollNumber: rollNumberInput.trim(),
          rollNo: rollNumberInput.trim(), // sync roll numbers
          verifiedAt: new Date().toISOString()
        };
      }
      return s;
    }));

    alert(`✅ Student "${selectedStudentForVerification?.name}" successfully verified!\nDocuments locked: Aadhar and Roll Number sealed.`);
    setSelectedStudentForVerification(null);
  };

  // Clear verification
  const handleResetVerification = (studentId: string, name: string) => {
    if (window.confirm(`Are you sure you want to RESET verification status for ${name}? This will remove their sealed Aadhar card & verified Roll number.`)) {
      setStudents(prev => prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            isVerified: false,
            aadharNumber: undefined,
            verifiedRollNumber: undefined,
            verifiedAt: undefined
          };
        }
        return s;
      }));
    }
  };

  // Change Password Submit
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    if (onUpdateVerifierPassword) {
      onUpdateVerifierPassword(currentVerifier.id, newPassword);
    } else {
      // Simulate/Fallback update in localStorage
      const savedVerifiers = localStorage.getItem("co_verifiers");
      if (savedVerifiers) {
        const parsed = JSON.parse(savedVerifiers) as Verifier[];
        const updated = parsed.map(v => v.id === currentVerifier.id ? { ...v, password: newPassword } : v);
        localStorage.setItem("co_verifiers", JSON.stringify(updated));
      }
    }

    setPasswordSuccess("Your security access password has been updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[600px] gap-6 text-slate-800 dark:text-slate-100">
      
      {/* 1. LEFT SIDEBAR: NAVIGATION CONTROLS */}
      <div className="w-full lg:w-64 bg-slate-900 text-white rounded-3xl p-5 flex flex-col justify-between shrink-0 shadow-lg border border-slate-850">
        <div className="space-y-6">
          {/* Logo & Role Identifier */}
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">Verifier Desk</h3>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase font-mono">ID Verification</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-2 text-left">
            <button
              onClick={() => setActiveTab("students")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider duration-150 cursor-pointer ${
                activeTab === "students" 
                  ? "bg-blue-600 text-white" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Verify Students</span>
            </button>

            <button
              onClick={() => setActiveTab("desks")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider duration-150 cursor-pointer ${
                activeTab === "desks" 
                  ? "bg-blue-600 text-white" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Desk Build Audit</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider duration-150 cursor-pointer ${
                activeTab === "profile" 
                  ? "bg-blue-600 text-white" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </button>
          </nav>
        </div>

        {/* Bottom User Badge */}
        <div className="pt-6 border-t border-slate-800 mt-8 space-y-4 text-left">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400 uppercase font-mono">
              {currentVerifier.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate text-slate-100">{currentVerifier.name}</p>
              <p className="text-[10px] text-slate-400 truncate font-mono uppercase font-bold">{currentVerifier.employeeCode}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-slate-800 hover:bg-rose-950 hover:text-rose-200 border border-slate-700 text-slate-300 font-bold text-xs py-2 px-3 rounded-xl duration-150 cursor-pointer uppercase tracking-wider flex items-center justify-center space-x-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN COMPONENT WORKSPACE AREA */}
      <div className="flex-1 space-y-6">
        
        {/* TAB 1: STUDENT VERIFICATION */}
        {activeTab === "students" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-left space-y-6 animate-fadeIn">
            {/* Header Banner */}
            <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">Enrollment Identity Verification</h4>
                <p className="text-[11px] text-slate-350 mt-1">
                  Upload Aadhar identity documentation and seal teacher-allotted Roll Numbers to authorize secure exam access.
                </p>
              </div>
              <span className="text-[9px] font-mono bg-blue-950 border border-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg uppercase shrink-0 font-bold tracking-wider">
                Authority Seal Status
              </span>
            </div>

            {/* Verification Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Total Enrolled Pupils</span>
                <p className="text-2xl font-black text-slate-850 dark:text-white mt-1 font-mono">{totalStudentsCount}</p>
              </div>
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/30 p-4 rounded-2xl">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Verified & Sealed</span>
                <p className="text-2xl font-black text-emerald-650 dark:text-emerald-400 mt-1 font-mono">{verifiedStudentsCount}</p>
              </div>
              <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/30 p-4 rounded-2xl">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">Pending Verification</span>
                <p className="text-2xl font-black text-amber-650 dark:text-amber-400 mt-1 font-mono">{pendingStudentsCount}</p>
              </div>
            </div>

            {/* Search and Filters panel */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-50 dark:bg-slate-850/40 p-4 rounded-2xl border border-slate-150 dark:border-slate-800/80">
              {/* Search input */}
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search name, scholar number, roll..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-medium placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                {/* Cohort select */}
                <select
                  value={selectedBatchId}
                  onChange={e => setSelectedBatchId(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden"
                >
                  <option value="all">All Batches</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.subject})</option>
                  ))}
                </select>

                {/* Status select */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden"
                >
                  <option value="all">All Statuses</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Pending Only</option>
                </select>
              </div>
            </div>

            {/* Students Enrollment Table */}
            <div className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
              <div className="bg-slate-50 dark:bg-slate-850 border-b border-slate-150 dark:border-slate-800 p-4">
                <h5 className="text-xs font-black uppercase text-slate-800 dark:text-slate-100 font-sans">
                  Enrollment Roster ({filteredStudents.length} Students Listed)
                </h5>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-850/30 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-bold uppercase tracking-wider text-[9px]">
                      <th className="p-3.5">Pupil Details</th>
                      <th className="p-3.5">Registration Info</th>
                      <th className="p-3.5">Identification Docs</th>
                      <th className="p-3.5">Computer Allotment</th>
                      <th className="p-3.5 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                          No matching student enrollment records located.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(student => {
                        const batch = batches.find(b => b.id === student.batchId);
                        return (
                          <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 duration-100">
                            {/* Pupil Name & Roll */}
                            <td className="p-3.5">
                              <div className="flex items-center space-x-3 text-left">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                                  {student.name.charAt(0)}
                                </div>
                                <div>
                                  <span className="font-extrabold text-slate-850 dark:text-slate-100 text-xs block">{student.name}</span>
                                  {student.rollNo && (
                                    <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded uppercase mt-1 inline-block">
                                      Roll No: {student.rollNo}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Scholar Details & Batch */}
                            <td className="p-3.5">
                              <div className="flex flex-col text-left space-y-1">
                                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                                  Sch No: {student.scholarNumber || "N/A"}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                  Batch: {batch ? batch.name : "Unassigned"}
                                </span>
                              </div>
                            </td>

                            {/* Sealed verification details */}
                            <td className="p-3.5 text-left">
                              {student.isVerified ? (
                                <div className="space-y-1">
                                  <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-black text-[9px] px-2 py-0.5 rounded-md inline-flex items-center space-x-1 uppercase">
                                    <Check className="w-2.5 h-2.5 text-emerald-650" />
                                    <span>Verified & Sealed</span>
                                  </span>
                                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 space-y-0.5">
                                    <p>Aadhar: <span className="font-bold text-slate-850 dark:text-slate-200">XXXX-XXXX-{student.aadharNumber?.slice(-4)}</span></p>
                                    <p>Verified Roll: <span className="font-bold text-slate-850 dark:text-slate-200">{student.verifiedRollNumber}</span></p>
                                  </div>
                                </div>
                              ) : (
                                <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-black text-[9px] px-2 py-0.5 rounded-md inline-flex items-center space-x-1 uppercase">
                                  <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                  <span>Unverified</span>
                                </span>
                              )}
                            </td>

                            {/* Computer Terminal Allotment */}
                            <td className="p-3.5 text-left">
                              {student.isVerified ? (
                                student.assignedComputerDeskCode ? (
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono text-[10px] font-black bg-slate-900 text-white px-2.5 py-1 rounded inline-flex items-center space-x-1">
                                      <span>💻 Terminal {student.assignedComputerDeskCode}</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (onVerifyStudentAndAllotDesk) {
                                          onVerifyStudentAndAllotDesk(student.id, undefined);
                                        }
                                      }}
                                      className="text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 font-extrabold text-[10px] hover:underline cursor-pointer"
                                    >
                                      Release
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-1 sm:space-x-2">
                                    <select
                                      id={`desk_sel_${student.id}`}
                                      className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-[10px] font-bold text-slate-800 dark:text-slate-150 max-w-[110px]"
                                      defaultValue=""
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (!val) return;
                                        if (onVerifyStudentAndAllotDesk) {
                                          onVerifyStudentAndAllotDesk(student.id, val);
                                        }
                                        e.target.value = "";
                                      }}
                                    >
                                      <option value="">-- Choose PC --</option>
                                      {computerDesks.filter(d => d.status === "Available").map(d => (
                                        <option key={d.id} value={d.uniqueCode}>
                                          {d.uniqueCode} ({d.roomNumber})
                                        </option>
                                      ))}
                                    </select>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const available = computerDesks.filter(d => d.status === "Available");
                                        if (available.length === 0) {
                                          alert("⚠️ Error: There are no free computer terminals vacant in the system!");
                                          return;
                                        }
                                        if (onVerifyStudentAndAllotDesk) {
                                          onVerifyStudentAndAllotDesk(student.id, available[0].uniqueCode);
                                        }
                                      }}
                                      className="bg-blue-650 hover:bg-slate-900 text-white font-extrabold text-[9px] uppercase tracking-wider py-1 px-2 rounded-md shadow-xs cursor-pointer duration-150"
                                    >
                                      Auto
                                    </button>
                                  </div>
                                )
                              ) : (
                                <span className="text-rose-600 dark:text-rose-400 font-bold text-[9px] italic bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded">
                                  ⚠️ Verify first to unlock PC
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-3.5 text-right">
                              {student.isVerified ? (
                                <div className="flex justify-end space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenVerification(student)}
                                    className="bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-[9px] uppercase tracking-wider py-1.5 px-3 rounded-lg border border-transparent hover:border-blue-200 cursor-pointer duration-150"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleResetVerification(student.id, student.name)}
                                    className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold text-[9px] uppercase tracking-wider py-1.5 px-3 rounded-lg cursor-pointer duration-150"
                                  >
                                    Reset
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenVerification(student)}
                                  className="bg-blue-600 hover:bg-slate-900 text-white font-extrabold text-[9px] uppercase tracking-widest py-1.5 px-3.5 rounded-lg shadow-sm cursor-pointer duration-150"
                                >
                                  🔐 Verify Student
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DESK BUILD AUDIT */}
        {activeTab === "desks" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-left space-y-6 animate-fadeIn">
            {/* Header Banner */}
            <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">Desk Build & PC Audit Center</h4>
                <p className="text-[11px] text-slate-350 mt-1">
                  Audit and cross-check the computer terminal desks allotted to active candidates for secure exam sessions.
                </p>
              </div>
              <span className="text-[9px] font-mono bg-blue-950 border border-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg uppercase shrink-0 font-bold tracking-wider">
                Lab Environment Audit
              </span>
            </div>

            {/* Terminal Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800 p-3.5 rounded-2xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Registers</span>
                <p className="text-xl font-black text-slate-850 dark:text-white mt-1 font-mono">{computerDesks.length} Nodes</p>
              </div>
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/30 p-3.5 rounded-2xl">
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block">Seated & Active</span>
                <p className="text-xl font-black text-emerald-650 dark:text-emerald-400 mt-1 font-mono">
                  {computerDesks.filter(d => d.status === "Occupied").length} Seated
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800 p-3.5 rounded-2xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Available Terminals</span>
                <p className="text-xl font-black text-slate-850 dark:text-white mt-1 font-mono">
                  {computerDesks.filter(d => d.status === "Available").length} Free
                </p>
              </div>
              <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/30 p-3.5 rounded-2xl">
                <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase block">Security Warnings</span>
                <p className="text-xl font-black text-rose-650 dark:text-rose-400 mt-1 font-mono">
                  {computerDesks.filter(d => {
                    if (d.status !== "Occupied" || !d.currentStudentId) return false;
                    const st = students.find(s => s.id === d.currentStudentId);
                    return !st?.isVerified;
                  }).length} Flags
                </p>
              </div>
            </div>

            {/* Computer Desks Audit List */}
            <div className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
              <div className="bg-slate-50 dark:bg-slate-850 border-b border-slate-150 dark:border-slate-800 p-4 flex justify-between items-center">
                <h5 className="text-xs font-black uppercase text-slate-800 dark:text-slate-100 font-sans">
                  Active Physical Terminal Allocation Directory
                </h5>
                <span className="text-[9px] uppercase font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-extrabold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded">
                  Secure Live Sync
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-850/30 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-bold uppercase tracking-wider text-[9px]">
                      <th className="p-3.5">Terminal ID</th>
                      <th className="p-3.5">IP Address / Lab</th>
                      <th className="p-3.5">Assigned Candidate</th>
                      <th className="p-3.5">Verification Integrity</th>
                      <th className="p-3.5 text-right">Audit Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {computerDesks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                          No computer terminal desks have been registered. Add computer desks in Admin Dashboard.
                        </td>
                      </tr>
                    ) : (
                      computerDesks.map(desk => {
                        const seatedStudent = desk.currentStudentId ? students.find(s => s.id === desk.currentStudentId) : null;
                        const isViolating = seatedStudent && !seatedStudent.isVerified;

                        return (
                          <tr key={desk.id} className={`duration-150 ${
                            isViolating 
                              ? "bg-rose-50/30 dark:bg-rose-950/10 hover:bg-rose-50/50 dark:hover:bg-rose-950/20" 
                              : "hover:bg-slate-50/50 dark:hover:bg-slate-850/20"
                          }`}>
                            {/* Desk Unique Code */}
                            <td className="p-3.5 font-bold">
                              <span className="font-mono text-xs bg-slate-900 text-white px-2 py-1 rounded-md">
                                💻 {desk.uniqueCode}
                              </span>
                            </td>

                            {/* Room and IP */}
                            <td className="p-3.5">
                              <div className="flex flex-col text-left font-mono">
                                <span className="font-bold text-slate-800 dark:text-slate-100 text-[11px]">{desk.roomNumber}</span>
                                <span className="text-[10px] text-slate-400">{desk.ipAddress}</span>
                              </div>
                            </td>

                            {/* Seated student details */}
                            <td className="p-3.5 text-left">
                              {seatedStudent ? (
                                <div>
                                  <span className="font-extrabold text-slate-850 dark:text-slate-100 block text-xs">{seatedStudent.name}</span>
                                  <span className="text-[10px] font-mono text-slate-550 dark:text-slate-400 font-semibold block mt-0.5">
                                    Roll: {seatedStudent.verifiedRollNumber || seatedStudent.rollNo || "No Roll Number Assigned"}
                                  </span>
                                </div>
                              ) : (
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-[9px] px-2 py-0.5 rounded uppercase">
                                  Vacant / Available
                                </span>
                              )}
                            </td>

                            {/* Verification integrity status */}
                            <td className="p-3.5 text-left">
                              {seatedStudent ? (
                                seatedStudent.isVerified ? (
                                  <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-black text-[9px] px-2 py-0.5 rounded-md inline-flex items-center space-x-1 uppercase">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-650" />
                                    <span>Verified Account Integrity OK</span>
                                  </span>
                                ) : (
                                  <span className="bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-400 font-black text-[9px] px-2 py-1 rounded-md inline-flex items-center space-x-1 uppercase animate-pulse">
                                    <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                    <span>⚠️ Security Warning: Unverified Pupil Seated</span>
                                  </span>
                                )
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">No verification check required</span>
                              )}
                            </td>

                            {/* Quick Audit Actions */}
                            <td className="p-3.5 text-right">
                              {isViolating ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenVerification(seatedStudent)}
                                  className="bg-rose-600 hover:bg-slate-900 text-white font-extrabold text-[9px] uppercase tracking-widest py-1.5 px-3 rounded-lg shadow-sm cursor-pointer duration-150 animate-bounce"
                                >
                                  🚨 Urgent Verify
                                </button>
                              ) : seatedStudent ? (
                                <span className="text-emerald-650 dark:text-emerald-400 font-bold text-[10px] font-mono">
                                  ✓ Clear to Exam
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px] italic">
                                  Vacant Standby
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VERIFIER PROFILE AND SECURITY SETTINGS */}
        {activeTab === "profile" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-left space-y-6 animate-fadeIn">
            <h4 className="text-lg font-black text-slate-850 dark:text-white uppercase tracking-tight border-b border-slate-100 dark:border-slate-800 pb-3">
              Verifier Profile & Access Settings
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Profile Details Card */}
              <div className="bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl space-y-4">
                <h5 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                  Verified Official Identity Card
                </h5>

                <div className="flex items-center space-x-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-950/40 border-2 border-blue-500/30 flex items-center justify-center font-black text-xl text-blue-600 dark:text-blue-400 uppercase">
                    {currentVerifier.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-850 dark:text-slate-100 text-base">{currentVerifier.name}</h4>
                    <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider inline-block mt-1">
                      Role: Official Verifier
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs font-medium font-sans">
                  <div className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-slate-800/50">
                    <span className="text-slate-400">Employee Register Code:</span>
                    <strong className="font-mono text-slate-800 dark:text-slate-200">{currentVerifier.employeeCode}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-slate-800/50">
                    <span className="text-slate-400">Unique Login Username:</span>
                    <strong className="font-mono text-slate-800 dark:text-slate-200">{currentVerifier.username}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-slate-800/50">
                    <span className="text-slate-400">Database Account Status:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 uppercase">● {currentVerifier.status}</strong>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Permissions Grade:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 uppercase">Class 1 Verification</strong>
                  </div>
                </div>
              </div>

              {/* Password Change Form */}
              <div className="bg-slate-50 dark:bg-slate-850/50 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl space-y-4">
                <h5 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                  Update Session Security Password
                </h5>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passwordError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs p-3 rounded-xl font-bold flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded-xl font-bold flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  <div className="text-left">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">New Security Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden focus:border-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="text-left">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden focus:border-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white font-extrabold text-[10px] py-3.5 px-4 rounded-xl uppercase tracking-wider transition-all duration-150 cursor-pointer text-center"
                  >
                    🔐 Save New Security Credentials
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* 3. CORE MODAL: PUPIL IDENTITY VERIFICATION POPUP */}
      {selectedStudentForVerification && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeIn text-left">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 p-6 text-white relative">
              <button
                type="button"
                onClick={() => setSelectedStudentForVerification(null)}
                className="absolute top-4 right-4 text-white/75 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="text-[9px] font-black uppercase text-blue-300 tracking-widest block mb-1">
                Official Verification Panel
              </span>
              <h3 className="text-lg font-black text-white">Seal Student Credentials</h3>
              <p className="text-xs text-blue-100/80 mt-1.5">
                Verify identity documents physically and assign a permanent active examination Roll Number.
              </p>
            </div>

            {/* Core Form content */}
            <form onSubmit={handleVerifySubmit} className="p-6 space-y-4">
              {validationError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs p-3 rounded-xl font-bold flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Student read-only block */}
              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 text-xs font-semibold space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Student Name:</span>
                  <span className="text-slate-850 dark:text-slate-100 font-extrabold">{selectedStudentForVerification.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Scholar ID Code:</span>
                  <span className="text-slate-850 dark:text-slate-100 font-mono">{selectedStudentForVerification.scholarNumber || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date of Birth:</span>
                  <span className="text-slate-850 dark:text-slate-100 font-mono">{selectedStudentForVerification.dob || "N/A"}</span>
                </div>
              </div>

              {/* Aadhar Input */}
              <div className="text-left">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Aadhar Number (12 numeric digits)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none font-bold text-xs">
                    🆔
                  </span>
                  <input
                    type="text"
                    maxLength={12}
                    value={aadharNumber}
                    onChange={e => setAadharNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold placeholder-slate-450 focus:outline-hidden focus:border-indigo-500"
                    placeholder="Enter 12 digit Aadhar No"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1 font-medium">This will be sealed into the student's encrypted blockchain record.</p>
              </div>

              {/* Verified Roll No Input */}
              <div className="text-left">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Official Exam Roll Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none font-bold text-xs">
                    📝
                  </span>
                  <input
                    type="text"
                    value={rollNumberInput}
                    onChange={e => setRollNumberInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold placeholder-slate-450 focus:outline-hidden focus:border-indigo-500"
                    placeholder="Enter official Exam Roll Number"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1 font-medium">Roll number provided by the board/teacher for seated exams.</p>
              </div>

              {/* Confirmation Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-slate-900 text-white font-extrabold text-[10px] py-3.5 px-4 rounded-xl uppercase tracking-wider transition-all duration-150 cursor-pointer text-center mt-2 shadow-sm shadow-blue-500/10"
              >
                🔐 Confirm & Seal Verification
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
