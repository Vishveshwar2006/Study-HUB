import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Receipt, IndianRupee, CreditCard, TrendingUp, PlusCircle, 
  Filter, CheckCircle, LogOut, User, Key, Lock, ShieldAlert,
  FileSpreadsheet, ClipboardList, Scan, CheckSquare, Trash2,
  Menu, X
} from "lucide-react";
import { Student, FeeInvoice, FeeManager } from "../types";
import QRCardScanner from "./QRCardScanner";

interface FeeDashboardProps {
  students: Student[];
  fees: FeeInvoice[];
  feeManagers: FeeManager[];
  loggedInFeeManagerId?: string;
  onAddFeeInvoice: (invoice: FeeInvoice) => void;
  onUpdateFeeStatus: (id: string, status: "Paid" | "Unpaid") => void;
  onDeleteFeeInvoice: (id: string) => void;
  onUpdateFeeManagerProfile?: (id: string, name: string, email: string, password?: string) => void;
  activeTab?: "ledger" | "scanner" | "profile";
  setActiveTab?: (tab: "ledger" | "scanner" | "profile") => void;
  hideSidebarOnDesktop?: boolean;
  onLogout?: () => void;
}

export default function FeeDashboard({
  students,
  fees,
  feeManagers,
  loggedInFeeManagerId,
  onAddFeeInvoice,
  onUpdateFeeStatus,
  onDeleteFeeInvoice,
  onUpdateFeeManagerProfile,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  hideSidebarOnDesktop = false,
  onLogout
}: FeeDashboardProps) {
  const [localActiveTab, setLocalActiveTab ] = useState<"ledger" | "scanner" | "profile">("ledger");
  const activeTab = propActiveTab || localActiveTab;
  const setActiveTab = propSetActiveTab || setLocalActiveTab;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Private auth status for scanner compliance
  const [authorizedStudentIdForFee, setAuthorizedStudentIdForFee] = useState<string | null>(null);

  // Form states for issuing raw invoices
  const [feeStudentId, setFeeStudentId] = useState("");
  const [feeTitle, setFeeTitle] = useState("");
  const [feeAmount, setFeeAmount] = useState<number>(450);
  const [feeDueDate, setFeeDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split("T")[0];
  });
  const [feeNotes, setFeeNotes] = useState("");
  const [feeSuccessMsg, setFeeSuccessMsg] = useState("");

  // Filters state
  const [feeFilterStatus, setFeeFilterStatus] = useState<"All" | "Paid" | "Unpaid">("All");
  const [feeSearchQuery, setFeeSearchQuery] = useState("");

  // Find active logged-in fee manager profile details
  const activeManager = feeManagers.find(m => m.id === loggedInFeeManagerId) || feeManagers[0] || {
    id: "fee_manager_1",
    name: "Head of Accounts",
    email: "accounts@coachinghub.edu",
    status: "Active"
  };

  // Profile editing form states
  const [profName, setProfName] = useState(activeManager.name);
  const [profEmail, setProfEmail] = useState(activeManager.email);
  const [profPass, setProfPass] = useState("");
  const [profSuccess, setProfSuccess] = useState(false);

  // Handle manual logout
  const handleSystemLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.setItem("co_is_logged_in", "false");
      localStorage.removeItem("co_user_role");
      localStorage.removeItem("co_user_id");
      localStorage.removeItem("co_user_name");
      window.location.reload();
    }
  };

  return (
    <div id="fee-manager-workspace-container" className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-slate-800 font-sans">
      
      {/* Side Column Container (Standard Left Sidebar layout) */}
      <div className={`${hideSidebarOnDesktop ? "hidden" : "lg:col-span-1"} space-y-4 no-print lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto no-scrollbar`}>
        
        {/* Hamburger Mobile Menu bar */}
        <div className="lg:hidden flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
              Desk Menu: {activeTab}
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/50 text-xs font-bold uppercase text-emerald-600 cursor-pointer hover:bg-black hover:text-white transition-all"
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

        {/* Side Menu with Light background */}
        <div className={`bg-slate-50 p-4 lg:p-6 rounded-2xl border border-slate-250 shadow-sm ${
          isMobileMenuOpen ? "flex flex-col animate-fadeIn" : "hidden lg:flex lg:flex-col"
        } gap-1.5 h-fit shrink-0 text-slate-800`}>
          <div className="px-3 mb-3 text-left">
            <span className="block text-[8px] font-extrabold uppercase tracking-widest text-emerald-650">Accounting Desk</span>
            <h3 className="text-xs font-black text-slate-450 tracking-wider uppercase">
              Fee Control Center
            </h3>
          </div>

          <button
            onClick={() => {
              setActiveTab("ledger");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center justify-between lg:justify-start space-x-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-xs font-extrabold uppercase tracking-widest transition-all duration-200 shrink-0 whitespace-nowrap cursor-pointer border ${
              activeTab === "ledger" 
                ? "bg-emerald-600 border-emerald-600 text-white shadow-xs" 
                : "bg-white border-slate-250 text-slate-850 hover:bg-black hover:border-black hover:text-white"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>Ledger Registry</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("scanner");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center justify-between lg:justify-start space-x-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-xs font-extrabold uppercase tracking-widest transition-all duration-200 shrink-0 whitespace-nowrap cursor-pointer border ${
              activeTab === "scanner" 
                ? "bg-emerald-600 border-emerald-600 text-white shadow-xs" 
                : "bg-white border-slate-250 text-slate-850 hover:bg-black hover:border-black hover:text-white"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Scan className="w-4 h-4 shrink-0" />
              <span>Card Auth Scanner</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("profile");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center justify-between lg:justify-start space-x-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-xs font-extrabold uppercase tracking-widest transition-all duration-200 shrink-0 whitespace-nowrap cursor-pointer border ${
              activeTab === "profile" 
                ? "bg-emerald-600 border-emerald-600 text-white shadow-xs" 
                : "bg-white border-slate-250 text-slate-850 hover:bg-black hover:border-black hover:text-white"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <User className="w-4 h-4 shrink-0" />
              <span>Accounts Profile</span>
            </div>
          </button>

          <div className="border-t border-slate-200 my-2 pt-2" />

          <button
            onClick={handleSystemLogout}
            className="flex items-center justify-between lg:justify-start space-x-2.5 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all duration-150 bg-red-50 hover:bg-red-650 hover:border-red-650 text-red-650 hover:text-white border border-red-200 cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Logout Session</span>
            </div>
          </button>
        </div>

        {/* SECURE BILLING VAULT PANIC MODULE */}
        <div className="bg-red-50 p-4 rounded-2xl border border-red-200 space-y-3 text-left">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-650 animate-pulse shrink-0" />
            <span className="text-[10px] font-mono font-black uppercase text-red-650 tracking-wider">Lobby SOS override</span>
          </div>
          <h5 className="text-[11.5px] font-extrabold text-slate-855 uppercase leading-snug">Fee Desk Panic Alert</h5>
          <p className="text-[10.5px] text-slate-550 leading-normal">
            For cash drawer break-ins, visual card clones, or walk-in payment disputes, trigger an instant signal:
          </p>

          <button
            onClick={() => {
              const location = prompt("Enter precise Fee Desk/Lobby Location:", "Accounts Desk Counter 2");
              if (location === null) return;
              const details = prompt("Specify security issue description (e.g. Unauthorized drawer tampering activity detected):");
              if (!details) return;

              const alertItem = {
                senderName: activeManager.name || "Accounts Head",
                senderRole: "FeeManager",
                senderId: loggedInFeeManagerId || "fee_manager_1",
                severity: "High",
                type: "Security Issue",
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
              alert("DISTRESS OVERRIDE SENT! Academic Superusers notified instantly.");
              window.location.reload();
            }}
            className="w-full py-2 bg-red-650 hover:bg-red-750 text-white text-[10px] uppercase tracking-widest font-black rounded-lg shadow transition cursor-pointer flex items-center justify-center space-x-1"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>DISPATCH SOS BEACON</span>
          </button>
        </div>

        {/* Quick Session Status Card */}
        <div className="bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl shadow-sm text-left">
          <div className="flex items-center space-x-2 px-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="block text-[8px] font-black uppercase tracking-widest text-emerald-400">Desk Active Session</span>
          </div>
          <p className="text-[11px] font-extrabold mt-1 text-slate-100 truncate px-1">{activeManager.name}</p>
          <p className="text-[9px] text-slate-400 font-mono mt-0.5 px-1 uppercase leading-none">ID: {activeManager.id}</p>
        </div>

      </div>

      {/* Main Workspace Display Column */}
      <div className={`${hideSidebarOnDesktop ? "lg:col-span-4" : "lg:col-span-3"} space-y-6`}>
        
        {/* Compliance Header banner details */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl -z-10" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl -z-10" />
          
          <div className="text-left space-y-0.5">
            <span className="text-[8px] uppercase tracking-widest font-black text-emerald-400 font-mono">Academy Accounting Desk</span>
            <h2 className="text-base font-black tracking-tight text-white uppercase flex items-center gap-1.5">
              <Receipt className="w-4.5 h-4.5 text-emerald-400" />
              <span>FEES & REVENUE DESK</span>
            </h2>
          </div>

          <div className="text-[9px] text-slate-350 bg-slate-950/45 px-3 py-1.5 rounded-xl border border-slate-800/40 font-bold uppercase tracking-wider">
            Gate Keeper Session Secure
          </div>
        </div>

        {/* 2. TRANSACTION CHALLENGE BANNER */}
        {authorizedStudentIdForFee ? (
          (() => {
            const authedStudent = students.find(s => s.id === authorizedStudentIdForFee);
            return (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between shadow-xs animate-fadeIn text-left">
              <div className="flex items-center space-x-3 text-left">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <div className="text-xs">
                  <p className="font-extrabold uppercase tracking-widest text-emerald-800 font-mono">💳 Card Authentication Token Confirmed</p>
                  <p className="mt-0.5 text-slate-650">You can instant-settle invoices and override tuition fees ledger lines for <strong>{authedStudent?.name}</strong> ({authedStudent?.rollNo}).</p>
                </div>
              </div>
              <button 
                onClick={() => setAuthorizedStudentIdForFee(null)}
                className="text-[9px] bg-white border border-slate-200 px-3 py-1.5 hover:bg-slate-50 text-slate-600 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer select-none"
              >
                Clear Override Token
              </button>
            </div>
          );
        })()
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-left shadow-xs">
          <div className="text-xs">
            <p className="font-extrabold uppercase tracking-widest text-amber-850 font-mono flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Compliance Guard active</span>
            </p>
            <p className="mt-0.5 text-slate-600">For auditing accuracy, students must scan their physical unique QR ID card at this accounts desk before you check-out/settle their invoices.</p>
          </div>
          <button 
            onClick={() => setActiveTab("scanner")}
            className="text-[9px] bg-slate-900 hover:bg-black text-white hover:text-white font-extrabold tracking-wider py-2 px-3 rounded-xl uppercase leading-none self-start shrink-0 cursor-pointer shadow-xs border border-transparent transition-all"
          >
            Authenticate Student QR Card
          </button>
        </div>
      )}

      {/* 3. COHORT STATS PANELS */}
      {activeTab === "ledger" && (
        (() => {
          const totalCollected = fees.filter(f => f.status === "Paid").reduce((acc, current) => acc + current.amount, 0);
          const totalOutstanding = fees.filter(f => f.status === "Unpaid").reduce((acc, current) => acc + current.amount, 0);
          const totalBilled = totalCollected + totalOutstanding;
          const paymentRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

          return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
              <motion.div 
                whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 text-left cursor-pointer"
              >
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-[8px] font-black text-slate-450 uppercase tracking-widest">Realized Revenue</span>
                  <span className="text-xl font-black text-slate-850 font-mono">₹{totalCollected.toLocaleString()} INR</span>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 text-left cursor-pointer"
              >
                <div className="p-3 bg-rose-50 rounded-xl text-rose-600 shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-[8px] font-black text-slate-455 uppercase tracking-widest">Outstanding Claims</span>
                  <span className="text-xl font-black text-slate-850 font-mono">₹{totalOutstanding.toLocaleString()} INR</span>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 bg-gradient-to-br from-indigo-50/40 to-indigo-100/10 text-left cursor-pointer"
              >
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className="block text-[8px] font-black text-indigo-500 uppercase tracking-widest">Collections Settle Fee Rate</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-base font-black text-indigo-750 font-mono">{paymentRate}%</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${paymentRate}%` }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()
      )}

      {/* 4. DYNAMIC VIEW CARDS */}
      
      {/* LEDGER TAB */}
      {activeTab === "ledger" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Create Invoice Form Column */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 text-left">
              <h5 className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center space-x-1">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Issue Academic Invoice</span>
              </h5>
              <p className="text-[10px] text-slate-450 mt-0.5">Bill an active student for bootcamp packs, study materials, or monthly tuition.</p>
            </div>

            {feeSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] py-2.5 px-3 rounded-xl font-bold flex items-center space-x-1.5 text-left animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feeSuccessMsg}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!feeStudentId) {
                  alert("Please choose a target student first.");
                  return;
                }
                if (!feeTitle.trim()) {
                  alert("Write a valid descriptive billable title.");
                  return;
                }
                if (feeAmount <= 0) {
                  alert("Amount must be a positive number.");
                  return;
                }
                if (!feeDueDate) {
                  alert("Select a valid calendar due date deadline.");
                  return;
                }

                const student = students.find(s => s.id === feeStudentId);
                if (!student) return;

                const invoiceId = "fee_" + Math.random().toString(36).substring(2, 9);
                const newInvoice: FeeInvoice = {
                  id: invoiceId,
                  studentId: student.id,
                  studentName: student.name,
                  studentRollNo: student.rollNo,
                  amount: Number(feeAmount),
                  dueDate: feeDueDate,
                  title: feeTitle.trim(),
                  status: "Unpaid",
                  notes: feeNotes.trim() || undefined
                };

                onAddFeeInvoice(newInvoice);
                setFeeTitle("");
                setFeeNotes("");
                setFeeSuccessMsg(`Billing invoice for ₹${feeAmount} generated for ${student.name}!`);
                setTimeout(() => setFeeSuccessMsg(""), 3500);
              }}
              className="space-y-3 px-0.5 text-left"
            >
              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-widest mb-1">
                  Target Student Cohort
                </label>
                <select
                  required
                  value={feeStudentId}
                  onChange={(e) => setFeeStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-emerald-500 text-slate-800"
                >
                  <option value="">-- Choose student roster --</option>
                  {students.filter(s => s.status === "Active").map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-widest mb-1">
                  Billing Invoice Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. June Term Tuition Balance"
                  value={feeTitle}
                  onChange={(e) => setFeeTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-emerald-500 text-slate-850"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-455 uppercase tracking-widest mb-1">
                  Billable Value (INR ₹)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={500000}
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-emerald-500 text-slate-850"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-455 uppercase tracking-widest mb-1">
                  Calendar Due Date
                </label>
                <input
                  type="date"
                  required
                  value={feeDueDate}
                  onChange={(e) => setFeeDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-emerald-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-455 uppercase tracking-widest mb-1">
                  Audit Notes / Internal Memos
                </label>
                <textarea
                  placeholder="e.g. Scholarship waiver code PJ-90 used, or split payments permitted."
                  value={feeNotes}
                  onChange={(e) => setFeeNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-emerald-500 text-slate-800 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer mt-4"
              >
                <Receipt className="w-4 h-4" />
                <span>Issue & Post Invoice</span>
              </button>
            </form>
          </div>

          {/* Ledger Main List Column */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
              <div className="text-left">
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-600" />
                  <span>Ledger Registry Accounts Table</span>
                </h5>
                <p className="text-[10px] text-slate-450 mt-0.5">Filter, audit, verify ledger lines or delete unneeded invoices.</p>
              </div>

              {/* Status Filters */}
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-150 text-[9px] font-extrabold tracking-wider text-slate-400 uppercase">
                {(["All", "Paid", "Unpaid"] as const).map(fVal => (
                  <button
                    key={fVal}
                    type="button"
                    onClick={() => setFeeFilterStatus(fVal)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      feeFilterStatus === fVal 
                        ? "bg-white text-emerald-700 font-bold shadow-xs" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {fVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Filter Search Query bar */}
            <div className="relative text-xs">
              <input
                type="text"
                placeholder="Search invoices by student name, roll PJ code, or billing title description..."
                value={feeSearchQuery}
                onChange={(e) => setFeeSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-850 font-medium focus:outline-emerald-500"
              />
              <Filter className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              {feeSearchQuery && (
                <button
                  type="button"
                  onClick={() => setFeeSearchQuery("")}
                  className="absolute right-3.5 top-2.5 text-[10px] text-slate-400 hover:text-slate-800 font-bold border rounded px-1.5 bg-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Grid List Elements */}
            {(() => {
              const matchedList = fees.filter(f => {
                const isStatusMatch = feeFilterStatus === "All" || f.status === feeFilterStatus;
                const isSearchMatch = !feeSearchQuery.trim() ||
                  f.studentName.toLowerCase().includes(feeSearchQuery.toLowerCase()) ||
                  f.studentRollNo.toLowerCase().includes(feeSearchQuery.toLowerCase()) ||
                  f.title.toLowerCase().includes(feeSearchQuery.toLowerCase());
                return isStatusMatch && isSearchMatch;
              });

              if (matchedList.length === 0) {
                return (
                  <div className="bg-slate-50 p-12 text-center rounded-2xl border border-slate-150">
                    <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs font-semibold leading-relaxed">No custom tuition fee invoices matches your current query.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {matchedList.map(f => {
                    const studentAvatar = students.find(s => s.id === f.studentId)?.avatar;
                    return (
                      <div 
                        key={f.id}
                        className="bg-slate-50/60 p-4 rounded-xl border border-slate-150 hover:bg-white hover:border-slate-350 transition-all flex flex-col sm:flex-row items-stretch justify-between gap-4 text-left"
                      >
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center font-mono text-xs font-bold uppercase shrink-0">
                            {f.studentName ? f.studentName.substring(0, 2) : "ST"}
                          </div>
                          <div className="space-y-1 select-text">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-slate-800 text-xs leading-none">{f.studentName}</span>
                              <span className="font-mono text-[9px] text-slate-400 uppercase font-black">({f.studentRollNo})</span>
                            </div>
                            <h6 className="font-bold text-slate-700 text-xs leading-relaxed">{f.title}</h6>
                            {f.notes && (
                              <p className="text-[10px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-155 font-sans leading-normal">
                                {f.notes}
                              </p>
                            )}
                            <div className="flex gap-3 text-[9px] text-slate-400 font-mono mt-2 outline-none">
                              <span>Due: <strong className="text-slate-500 font-bold">{f.dueDate}</strong></span>
                              {f.paidDate && (
                                <span className="text-emerald-600 font-extrabold font-mono">Paid Date: {f.paidDate}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-slate-150/60 pt-3 sm:pt-0 shrink-0">
                          <div className="flex items-center space-x-1.5 sm:text-right">
                            <span className="font-mono font-black text-xs text-slate-800">₹{f.amount}</span>
                            <span className={`px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-widest rounded-full border ${
                              f.status === "Paid" 
                                ? "bg-emerald-55 text-emerald-800 border-emerald-200" 
                                : "bg-rose-55 text-rose-800 border-rose-200"
                            }`}>
                              {f.status}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5 mt-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const targetStatus = f.status === "Paid" ? "Unpaid" : "Paid";
                                onUpdateFeeStatus(f.id, targetStatus);
                                setFeeSuccessMsg(`Revenue invoice entry #${f.id} status updated to ${targetStatus}.`);
                                setTimeout(() => setFeeSuccessMsg(""), 3000);
                              }}
                              className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border cursor-pointer select-none transition-colors ${
                                f.status === "Paid"
                                  ? "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                  : "bg-emerald-600 text-white border-emerald-550 hover:bg-emerald-700"
                              }`}
                            >
                              {f.status === "Paid" ? "Mark Unpaid" : "Mark Paid"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`CONFIRM AUDIT VOID: Completely delete student invoice for "${f.title}" (₹${f.amount})?`)) {
                                  onDeleteFeeInvoice(f.id);
                                  setFeeSuccessMsg("Invoice successfully deleted.");
                                  setTimeout(() => setFeeSuccessMsg(""), 3000);
                                }
                              }}
                              className="p-1 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg cursor-pointer"
                              title="Delete invoice"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              );
            })()}

          </div>

        </div>
      )}

      {/* SCANNER TAB - REMOVED */}

      {/* PROFILE TAB */}
      {activeTab === "profile" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm max-w-md mx-auto text-left space-y-6 animate-fadeIn">
          <div className="pb-4 border-b border-slate-100">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <User className="w-5 h-5 text-emerald-600" />
              <span>Accounts Desk Personal Profile</span>
            </h4>
            <p className="text-xs text-slate-500">Edit accountant display name, contact email, or update login password keys.</p>
          </div>

          {profSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-2.5 px-3 rounded-xl font-bold flex items-center space-x-1.5 animate-fadeIn">
              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your profile credential updates successfully saved!</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setProfSuccess(false);
              if (!profName.trim() || !profEmail.trim()) {
                alert("Fields cannot be left blank.");
                return;
              }
              if (onUpdateFeeManagerProfile) {
                onUpdateFeeManagerProfile(activeManager.id, profName.trim(), profEmail.trim(), profPass || undefined);
                setProfSuccess(true);
                setProfPass("");
                setTimeout(() => setProfSuccess(false), 3000);
              } else {
                alert("Backend action not connected. Direct localStorage save modified.");
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1.5">
                Staff Accountant Name
              </label>
              <input
                type="text"
                required
                value={profName}
                onChange={(e) => setProfName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-emerald-500 text-slate-850"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1.5">
                Staff Email Address
              </label>
              <input
                type="email"
                required
                value={profEmail}
                onChange={(e) => setProfEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-emerald-500 text-slate-850"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1.5">
                Update Security Password Key (Optional)
              </label>
              <input
                type="password"
                placeholder="•••••••• (Leave blank to keep current)"
                value={profPass}
                onChange={(e) => setProfPass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono font-semibold focus:outline-emerald-500 text-slate-850"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-slate-900 border border-transparent hover:bg-black hover:text-white text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Save Credentials Change
            </button>
          </form>
        </div>
      )}

      </div>

      {/* Footer Watermark */}
      <div className="col-span-1 lg:col-span-4 mt-12 border-t border-slate-100 pt-6 pb-2 text-center text-xs text-slate-400 font-medium font-sans no-print flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">© 2026 Vishveshwar Foundation Ltd.</span>
        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-bold">Ledger & Audit Portal Active</span>
      </div>
    </div>
  );
}
