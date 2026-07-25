import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, UserCheck, Phone, Mail, PlusCircle, Search, Filter, 
  CheckCircle, Trash2, Calendar, FileText, ClipboardList, 
  TrendingUp, Activity, Library, LogOut, CheckSquare, XCircle, AlertCircle, Sparkles, Cpu, Lock, Settings,
  Menu, X, CreditCard, Bus
} from "lucide-react";
import { Student, Batch, ContactLead, School } from "../types";

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

interface AdmissionOfficeDashboardProps {
  leads: ContactLead[];
  onUpdateLead: (id: string, updatedFields: Partial<ContactLead>) => void;
  onDeleteLead: (id: string) => void;
  onAddLead: (lead: ContactLead) => void;
  onCreateStudent: (student: Student) => void;
  batches: Batch[];
  students: Student[];
  activeTab?: "leads" | "newInquiry" | "batchesCatalog" | "analytics" | "customFeatures" | "studentAdd" | "idPrint" | "busDesk";
  setActiveTab?: (tab: "leads" | "newInquiry" | "batchesCatalog" | "analytics" | "customFeatures" | "studentAdd" | "idPrint" | "busDesk") => void;
  hideSidebarOnDesktop?: boolean;
  schools?: School[];
  onDeleteStudent?: (id: string) => void;
}

export default function AdmissionOfficeDashboard({
  leads,
  onUpdateLead,
  onDeleteLead,
  onAddLead,
  onCreateStudent,
  batches,
  students,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  hideSidebarOnDesktop = false,
  schools = [],
  onDeleteStudent
}: AdmissionOfficeDashboardProps) {
  // Navigation Tabs
  const [localActiveTab, setLocalActiveTab] = useState<"leads" | "newInquiry" | "batchesCatalog" | "analytics" | "customFeatures" | "studentAdd" | "idPrint" | "busDesk">("leads");
  const activeTab = propActiveTab || localActiveTab;
  const setActiveTab = propSetActiveTab || setLocalActiveTab;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filters and search logic
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [courseFilter, setCourseFilter] = useState<string>("All");

  // Form states for adding a walk-in inquiry lead
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadCourse, setNewLeadCourse] = useState(() => {
    return batches && batches.length > 0 ? batches[0].name : "JEE Advanced Prep";
  });
  const [newLeadMessage, setNewLeadMessage] = useState("");
  const [newLeadNotes, setNewLeadNotes] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  // --- CUSTOM DYNAMIC FEATURES STATES ---
  const [proposedFeatures, setProposedFeatures] = useState<{
    id: string;
    name: string;
    description: string;
    category: string;
    status: "Draft - Pending Activation" | "🟢 Deployed & Active";
    requestedAt: string;
  }[]>(() => {
    const saved = localStorage.getItem("co_admissions_proposed_features");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "feat_1",
        name: "SMS Automated Follow-up OTP",
        description: "Send automated secure text confirmation notifications to walk-in guardians upon initial desk log.",
        category: "Safety & Communication",
        status: "Draft - Pending Activation",
        requestedAt: "2026-06-10"
      },
      {
        id: "feat_2",
        name: "WhatsApp Integrated Syllabus Pusher",
        description: "Instantly transmit digital PDF syllabus guidelines to student number via unified webhook integration.",
        category: "Academic Delivery",
        status: "Draft - Pending Activation",
        requestedAt: "2026-06-11"
      }
    ];
  });

  // State sync for proposedFeatures
  useEffect(() => {
    localStorage.setItem("co_admissions_proposed_features", JSON.stringify(proposedFeatures));
  }, [proposedFeatures]);

  const [featName, setFeatName] = useState("");
  const [featDesc, setFeatDesc] = useState("");
  const [featCategory, setFeatCategory] = useState("Automation");
  const [adminCodeInput, setAdminCodeInput] = useState("");
  const [featureError, setFeatureError] = useState("");
  const [featureSuccess, setFeatureSuccess] = useState("");
  const [activeSimulationLog, setActiveSimulationLog] = useState<string>("");

  // Convert/enroll lead modal states
  const [enrollModalLead, setEnrollModalLead] = useState<ContactLead | null>(null);
  const [enrollRollNo, setEnrollRollNo] = useState("");
  const [enrollDob, setEnrollDob] = useState("12-11-2006");
  const [enrollBatchId, setEnrollBatchId] = useState("");
  const [enrollPassword, setEnrollPassword] = useState("alex123");
  const [enrollSuccessMessage, setEnrollSuccessMessage] = useState("");
  const [enrollErrorMessage, setEnrollErrorMessage] = useState("");

  // --- DIRECT ADMISSION ADD STUDENT FORM STATE ---
  const [directStudentName, setDirectStudentName] = useState("");
  const [directStudentEmail, setDirectStudentEmail] = useState("");
  const [directStudentPassword, setDirectStudentPassword] = useState("");
  const [directStudentRollNo, setDirectStudentRollNo] = useState("");
  const [directStudentDob, setDirectStudentDob] = useState("12-11-2006");
  const [directStudentFather, setDirectStudentFather] = useState("");
  const [directStudentMother, setDirectStudentMother] = useState("");
  const [directStudentMobile, setDirectStudentMobile] = useState("");
  const [directStudentBatchId, setDirectStudentBatchId] = useState("");
  const [directStudentSchoolId, setDirectStudentSchoolId] = useState("");

  // --- ID CARD PRINT SELECT STATE ---
  const [selectedPrintStudentId, setSelectedPrintStudentId] = useState("");

  // --- BUS PASS STATES & PERSISTENCE ---
  const [busPasses, setBusPasses] = useState<{
    id: string;
    studentRollNo: string;
    studentName: string;
    allottedSchoolName: string;
    route: string;
    validity: string;
    feeStatus: "Paid" | "Unpaid";
    serialNo: string;
  }[]>(() => {
    const saved = localStorage.getItem("co_admissions_bus_passes");
    return saved ? JSON.parse(saved) : [
      {
        id: "pass_1",
        studentRollNo: "PJ-2026-X01",
        studentName: "Ashish Shrivastava",
        allottedSchoolName: "Study Hub Academy High School",
        route: "Route 4B - Gwalior Main Bypass Hub",
        validity: "30-Apr-2027",
        feeStatus: "Paid",
        serialNo: "BP-M-2026-904"
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("co_admissions_bus_passes", JSON.stringify(busPasses));
  }, [busPasses]);

  const [newBusRoll, setNewBusRoll] = useState("");
  const [newBusRoute, setNewBusRoute] = useState("Route 1A - North Metro Feeders");
  const [newBusValidity, setNewBusValidity] = useState("30-Apr-2027");
  const [newBusFeeStatus, setNewBusFeeStatus] = useState<"Paid" | "Unpaid">("Paid");

  const [selectedBusPassPrintId, setSelectedBusPassPrintId] = useState("");

  // Notes update states per lead
  const [editNotesId, setEditNotesId] = useState<string | null>(null);
  const [editNotesText, setEditNotesText] = useState("");

  // --- DIRECT ADMISSIONS REGISTER SCHOLAR & BUS HELPERS ---
  const handleDirectStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directStudentName.trim() || !directStudentEmail.trim()) {
      alert("Name and email are required metrics.");
      return;
    }

    const roll = directStudentRollNo.trim() || "PJ-2026-AR" + Math.floor(100 + Math.random() * 900);
    
    // Check if roll exists
    const rollExists = students.some(s => s.rollNo.toUpperCase() === roll.toUpperCase());
    if (rollExists) {
      alert("Registration Error: This Roll Identifier is already assigned to a student.");
      return;
    }

    // Dynamic school allot name
    const selectedSchObj = schools.find(s => s.id === directStudentSchoolId) || schools[0];
    const schoolNameStr = selectedSchObj ? selectedSchObj.name : "Central Academy Board";

    const customStudent: Student = {
      id: "s_dir_" + Date.now(),
      name: directStudentName.trim(),
      email: directStudentEmail.trim(),
      rollNo: roll.toUpperCase(),
      avatar: getRandomAvatarUrl(directStudentName),
      status: "Active",
      password: directStudentPassword.trim() || "scholar" + Math.floor(100 + Math.random() * 900),
      dob: directStudentDob.trim() || "12-11-2006",
      schoolName: schoolNameStr,
      schoolId: selectedSchObj ? selectedSchObj.id : undefined,
      fatherName: directStudentFather.trim() || "Verification Pending",
      motherName: directStudentMother.trim() || "Verification Pending",
      mobileNumber: directStudentMobile.trim() || "+91 99887 76655",
      batchId: directStudentBatchId || undefined,
      isSelfRegistered: false,
      registeredAt: new Date().toISOString()
    };

    onCreateStudent(customStudent);
    alert(`Successfully registered Scholar ${customStudent.name}!\nAllotted Alliances: ${customStudent.schoolName}\nRoll Number: ${customStudent.rollNo}\nTemporary Password Code: ${customStudent.password}`);

    // Clear Form Fields
    setDirectStudentName("");
    setDirectStudentEmail("");
    setDirectStudentPassword("");
    setDirectStudentRollNo("");
    setDirectStudentDob("12-11-2006");
    setDirectStudentFather("");
    setDirectStudentMother("");
    setDirectStudentMobile("");
    setDirectStudentBatchId("");
    setDirectStudentSchoolId("");
  };

  const handleAddNewBusPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusRoll.trim()) return;

    // Find student to construct details
    const studentObj = students.find(s => s.rollNo.toUpperCase() === newBusRoll.trim().toUpperCase());
    if (!studentObj) {
      alert(`Error Error: Student Roll Identifier "${newBusRoll}" does not exist in active files. Please register/enrol first.`);
      return;
    }

    const serialNum = "BP-M-" + Math.floor(10000 + Math.random() * 90000);
    const newPass = {
      id: "pass_" + Date.now(),
      studentRollNo: studentObj.rollNo,
      studentName: studentObj.name,
      allottedSchoolName: studentObj.schoolName || "Central High Academy",
      route: newBusRoute,
      validity: newBusValidity,
      feeStatus: newBusFeeStatus,
      serialNo: serialNum
    };

    setBusPasses([newPass, ...busPasses]);
    setNewBusRoll("");
    alert(`Dynamic Transport Pass issued successfully! Serial Code: ${serialNum}`);
  };

  // Handler for adding dynamic lead
  const handleAddNewLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrMsg("");

    if (!newLeadName.trim() || !newLeadPhone.trim()) {
      setErrMsg("Candidate Name and Mobile Number are required field metrics.");
      return;
    }

    const leadId = "lead_" + Date.now();
    const createdLead: ContactLead = {
      id: leadId,
      name: newLeadName.trim(),
      email: newLeadEmail.trim() || "walkin_customer@mpdigitalschool.com",
      phone: newLeadPhone.trim(),
      courseInterest: newLeadCourse,
      message: newLeadMessage.trim() || "Walk-In counter lead logged directly by Admission Desk.",
      status: "New",
      date: new Date().toISOString().split("T")[0],
      notes: newLeadNotes.trim()
    };

    onAddLead(createdLead);
    setSuccessMsg(`Successfully registered walk-in lead reference code: ${leadId}`);
    
    // Clear fields
    setNewLeadName("");
    setNewLeadEmail("");
    setNewLeadPhone("");
    setNewLeadMessage("");
    setNewLeadNotes("");

    // Open listing tab
    setTimeout(() => {
      setActiveTab("leads");
      setSuccessMsg("");
    }, 1500);
  };

  // Promote a walk-in lead to a real student profile
  const handleFinalizePromotion = (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollSuccessMessage("");
    setEnrollErrorMessage("");

    if (!enrollModalLead) return;
    if (!enrollRollNo.trim()) {
      setEnrollErrorMessage("Please allot a unique candidate roll identifier.");
      return;
    }

    // Verify roll number is unique in current student array
    const rollExists = students.some(s => s.rollNo.toUpperCase() === enrollRollNo.trim().toUpperCase());
    if (rollExists) {
      setEnrollErrorMessage("Critical: This Roll Identifier is already allotted to an active student.");
      return;
    }

    // Register Student Account
    const studentId = "s_promoted_" + Date.now();
    const newStudent: Student = {
      id: studentId,
      name: enrollModalLead.name,
      email: enrollModalLead.email || `${enrollModalLead.name.toLowerCase().replace(/\s+/g, "")}@student.com`,
      rollNo: enrollRollNo.trim().toUpperCase(),
      avatar: getRandomAvatarUrl(enrollModalLead.name),
      status: "Active",
      password: enrollPassword || "alex123",
      dob: enrollDob || "12-11-2006",
      schoolName: "Enrolled via Admissions Office",
      mobileNumber: enrollModalLead.phone,
      batchId: enrollBatchId || undefined,
      isSelfRegistered: false,
      registeredAt: new Date().toISOString()
    };

    onCreateStudent(newStudent);

    // Update original lead status to Enrolled
    onUpdateLead(enrollModalLead.id, { 
      status: "Enrolled",
      notes: `${enrollModalLead.notes || ""}\n[System Auto-Enroll]: Promoted successfully with Roll: ${newStudent.rollNo} directly to Batch: ${enrollBatchId || "None"}.`.trim()
    });

    setEnrollSuccessMessage(`Candidate Successfully Promoted! Logged Student login parameters as active.`);
    
    setTimeout(() => {
      setEnrollModalLead(null);
      setEnrollSuccessMessage("");
      setEnrollBatchId("");
      setEnrollRollNo("");
    }, 1800);
  };

  // Fast auto-allot Roll Number
  const triggerAutoAllotRoll = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setEnrollRollNo(`PJ-2026-${randomSuffix}`);
  };

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      lead.id.includes(searchQuery);

    const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
    const matchesCourse = courseFilter === "All" || lead.courseInterest === courseFilter;

    return matchesSearch && matchesStatus && matchesCourse;
  });

  // Calculate high-level metrics
  const totalLeadsCount = leads.length;
  const newLeadsCount = leads.filter(l => l.status === "New").length;
  const contactedLeadsCount = leads.filter(l => l.status === "Contacted" || l.status === "In Progress").length;
  const enrolledLeadsCount = leads.filter(l => l.status === "Enrolled").length;
  const conversionRate = totalLeadsCount > 0 ? ((enrolledLeadsCount / totalLeadsCount) * 100).toFixed(1) : "0.0";

  return (
    <div id="admission-office-workspace-panel" className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-slate-800 font-sans">
      
      {/* 1. LEFT SIDEBAR MENU PANEL */}
      <div className={`${hideSidebarOnDesktop ? "hidden" : "lg:col-span-1"} space-y-4 no-print lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto no-scrollbar`}>
        
        {/* Hamburger Mobile Menu bar */}
        <div className="lg:hidden flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
              Desk Menu: {activeTab}
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-slate-205/50 text-xs font-bold uppercase text-indigo-600 cursor-pointer hover:bg-black hover:text-white transition-all"
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

        {/* Navigation Selector UI with white background */}
        <div className={`bg-white p-4 lg:p-6 rounded-2xl border border-slate-200/90 shadow-sm ${
          isMobileMenuOpen ? "flex flex-col animate-fadeIn" : "hidden lg:flex lg:flex-col"
        } gap-1.5 text-left`}>
          <div className="px-3 mb-3">
            <span className="block text-[8px] font-extrabold uppercase tracking-widest text-indigo-700">Office Desk Workspace</span>
            <h3 className="text-xs font-black text-slate-805 tracking-wider uppercase">Admissions Controller</h3>
          </div>

          <button
            onClick={() => {
              setActiveTab("leads");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 border ${
              activeTab === "leads" 
                ? "bg-indigo-650 border-indigo-650 text-white shadow-sm" 
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-black hover:border-black hover:text-white cursor-pointer"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Manage Inquiry Leads</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("newInquiry");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 border ${
              activeTab === "newInquiry" 
                ? "bg-indigo-650 border-indigo-650 text-white shadow-sm" 
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-black hover:border-black hover:text-white cursor-pointer"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Walk-In / Phone Inquiry</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("batchesCatalog");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 border ${
              activeTab === "batchesCatalog" 
                ? "bg-indigo-650 border-indigo-650 text-white shadow-sm" 
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-black hover:border-black hover:text-white cursor-pointer"
            }`}
          >
            <Library className="w-4 h-4" />
            <span>Active Program Catalog</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("analytics");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 border ${
              activeTab === "analytics" 
                ? "bg-indigo-650 border-indigo-650 text-white shadow-sm" 
                : "bg-slate-50 border-slate-205 text-slate-705 hover:bg-black hover:border-black hover:text-white cursor-pointer"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Conversion Analytics</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("customFeatures");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 border ${
              activeTab === "customFeatures" 
                ? "bg-amber-600 border-amber-600 text-white shadow-sm" 
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-black hover:border-black hover:text-white cursor-pointer"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Feature Customizer</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("studentAdd");
              setIsMobileMenuOpen(false);
            }}
            id="tab-desk-student-add"
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 border ${
              activeTab === "studentAdd" 
                ? "bg-red-600 border-red-600 text-white shadow-sm" 
                : "bg-slate-50 border-slate-205 text-slate-705 hover:bg-black hover:border-black hover:text-white cursor-pointer"
            }`}
          >
            <Users className="w-4 h-4 text-red-500" />
            <span>Student Add</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("idPrint");
              setIsMobileMenuOpen(false);
            }}
            id="tab-desk-id-print"
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 border ${
              activeTab === "idPrint" 
                ? "bg-red-650 border-red-650 text-white shadow-sm" 
                : "bg-slate-50 border-slate-205 text-slate-705 hover:bg-black hover:border-black hover:text-white cursor-pointer"
            }`}
          >
            <CreditCard className="w-4 h-4 text-indigo-500" />
            <span>Identity Card Print</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("busDesk");
              setIsMobileMenuOpen(false);
            }}
            id="tab-desk-bus-pass"
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 border ${
              activeTab === "busDesk" 
                ? "bg-amber-600 border-amber-600 text-white shadow-sm" 
                : "bg-slate-50 border-slate-205 text-slate-705 hover:bg-black hover:border-black hover:text-white cursor-pointer"
            }`}
          >
            <Bus className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Bus & Bus Card</span>
          </button>
        </div>

        {/* SECURE ADMISSION DESK DISTRESS MODULE */}
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-xs text-left">
          <div className="flex items-center space-x-1 px-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="block text-[8px] font-mono uppercase tracking-widest text-red-650 font-black">Admissions Safety Console</span>
          </div>

          <h5 className="text-[11.5px] font-extrabold text-slate-800 uppercase mt-2.5 font-sans">Distress Override Button</h5>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-normal font-sans">
            For critical crowd control incidents, walk-in candidate security alarms, or emergency distress signals, dispatch immediate logs:
          </p>

          <button
            onClick={() => {
              const location = prompt("Specify Walk-In Counselling Area/Desk No:", "Admissions Counter 1");
              if (location === null) return;
              const details = prompt("Provide incident summary (e.g. Inbound queue congestion creating physical safety concern):");
              if (!details) return;

              const alertItem = {
                senderName: "Admissions Desk Officer",
                senderRole: "Admission",
                senderId: "admission_desk_1",
                severity: "High",
                type: "SOS",
                location: location,
                details: details
              };

              // Write to log dynamically
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
              
              alert("Admissions Desk Distress Alarm Dispatched! Central dashboard alerted.");
              window.location.reload();
            }}
            className="w-full mt-3 py-2 bg-red-650 hover:bg-red-750 text-white text-[10px] uppercase font-black tracking-widest rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm transition-all"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>TRIGGER DISTRESS ALARM</span>
          </button>
        </div>

        {/* Dynamic Overview Stats Card */}
        <div className={`bg-slate-900 border border-slate-800 text-white p-4 rounded-xl text-left shadow-sm ${
          isMobileMenuOpen ? "block animate-fadeIn" : "hidden lg:block"
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="block text-[8px] font-mono uppercase tracking-widest text-indigo-400">Desk Status Dashboard</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-755">
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider font-sans">Enrolled</span>
              <span className="block text-lg font-black text-white font-mono mt-0.5">{enrolledLeadsCount}</span>
            </div>
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-755">
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider font-sans">Conversion</span>
              <span className="block text-lg font-black text-rose-455 font-mono mt-0.5">{conversionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CORE DISPLAY ROW */}
      <div className={`${hideSidebarOnDesktop ? "lg:col-span-4" : "lg:col-span-3"} space-y-6`}>
        
        {/* Statistics KPIs Cards Group */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <motion.div 
            whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-xs text-left cursor-pointer"
          >
            <div>
              <span className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest leading-none">Registered Leads</span>
              <span className="block text-2xl font-black text-indigo-950 font-mono mt-2">{totalLeadsCount}</span>
              <span className="block text-[8px] text-slate-400 font-sans mt-1">Total inbound inquiries</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-650 shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-xs text-left cursor-pointer"
          >
            <div>
              <span className="block text-[9px] font-extrabold text-slate-505 uppercase tracking-widest leading-none">New Inquiries</span>
              <span className="block text-2xl font-black text-emerald-650 font-mono mt-2">{newLeadsCount}</span>
              <span className="block text-[8px] text-slate-400 font-sans mt-1">Awaiting coordinator response</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-650 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-xs text-left cursor-pointer"
          >
            <div>
              <span className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-widest leading-none">In Process Calls</span>
              <span className="block text-2xl font-black text-amber-650 font-mono mt-2">{contactedLeadsCount}</span>
              <span className="block text-[8px] text-slate-400 font-sans mt-1">Currently engaged followup</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-650 shrink-0">
              <Phone className="w-5 h-5 animate-bounce" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-xs text-left cursor-pointer"
          >
            <div>
              <span className="block text-[9px] font-extrabold text-slate-505 uppercase tracking-widest leading-none">Paid Admissions</span>
              <span className="block text-2xl font-black text-rose-650 font-mono mt-2">{enrolledLeadsCount}</span>
              <span className="block text-[8px] text-slate-400 font-sans mt-1">Successfully promoted</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-650 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
          </motion.div>
        </div>

        {/* ==================== TAB 1: LEADS DIRECTORY ==================== */}
        {activeTab === "leads" && (
          <div className="bg-white border border-slate-200/95 rounded-3xl p-6 shadow-sm space-y-6 text-left">
            
            {/* Header + Search/Filters toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight">Admissions Leads Registry</h3>
                <p className="text-xs text-slate-500 mt-1">Monitor, log followup notes, evaluate metrics, and promote qualified candidates.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-black px-2.5 py-1 rounded font-mono uppercase">
                  System: Online sync
                </span>
              </div>
            </div>

            {/* Filter controls panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-105-dense">
              <div className="space-y-1">
                <span className="block text-[9px] font-black uppercase text-slate-550 pl-1">Search Keywords</span>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search candidate name, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="block text-[9px] font-black uppercase text-slate-550 pl-1">Lifecycle Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="All">All Inquiries</option>
                  <option value="New">🟢 New (Awaiting Contact)</option>
                  <option value="Contacted">🟡 Contacted</option>
                  <option value="In Progress">🟠 In Progress</option>
                  <option value="Enrolled">⭐ Enrolled (Promoted)</option>
                  <option value="Closed">🔴 Closed (Rejected/No-Show)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="block text-[9px] font-black uppercase text-slate-550 pl-1">Target Program</span>
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="All">All Batches</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Leads Table lists */}
            {filteredLeads.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-405 uppercase">No inquiry leads matched your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLeads.map(lead => (
                  <div key={lead.id} className="border border-slate-200 hover:border-slate-300 rounded-2xl p-5 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    
                    {/* Candidate Identity Brief info */}
                    <div className="space-y-2 text-left shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-black">
                          {lead.id}
                        </span>
                        <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                          {lead.name}
                        </h4>
                        
                        {/* Status chip */}
                        <span className={`text-[8px] font-extrabold uppercase tracking-widest rounded-full px-2.5 py-0.5 font-sans ${
                          lead.status === "New" ? "bg-emerald-100 text-emerald-800" :
                          lead.status === "Contacted" ? "bg-blue-100 text-blue-800" :
                          lead.status === "In Progress" ? "bg-amber-100 text-amber-805" :
                          lead.status === "Enrolled" ? "bg-rose-100 text-rose-800" :
                          "bg-slate-100 text-slate-800"
                        }`}>
                          {lead.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-medium text-slate-600">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span><strong>{lead.phone}</strong></span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{lead.email}</span>
                        </span>
                        <span className="flex items-center gap-1 sm:col-span-2">
                          <Library className="w-3.5 h-3.5 text-slate-400" />
                          <span>Course: <strong className="text-slate-800 font-extrabold">{lead.courseInterest}</strong></span>
                        </span>
                      </div>

                      {/* Display Inquiry Message request snippet */}
                      <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-650 leading-normal max-w-xl">
                        <span className="block text-[8px] font-extrabold uppercase tracking-widest text-slate-400 mb-0.5 font-sans">Student Inquiry Message Request:</span>
                        {lead.message}
                      </div>

                      {/* Coordinator / Followup Notes section */}
                      <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/50 text-xs text-amber-950 leading-normal max-w-xl">
                        <div className="flex justify-between items-center mb-1">
                          <span className="block text-[8px] font-extrabold uppercase tracking-widest text-amber-800 font-sans">follow-up tracker notes:</span>
                          <button
                            onClick={() => {
                              setEditNotesId(lead.id);
                              setEditNotesText(lead.notes || "");
                            }}
                            className="text-[9px] hover:underline font-black text-indigo-700 uppercase cursor-pointer"
                          >
                            Update Log
                          </button>
                        </div>
                        {editNotesId === lead.id ? (
                          <div className="space-y-1.5 mt-1.5">
                            <textarea
                              rows={2}
                              value={editNotesText}
                              onChange={(e) => setEditNotesText(e.target.value)}
                              className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs focus:outline-none placeholder-amber-700/50"
                              placeholder="Write updated coordinator log notes..."
                            />
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => setEditNotesId(null)}
                                className="px-2 py-1 bg-slate-200 rounded text-[10px] font-bold text-slate-600 uppercase cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  onUpdateLead(lead.id, { notes: editNotesText });
                                  setEditNotesId(null);
                                }}
                                className="px-2 py-1 bg-amber-600 text-white rounded text-[10px] font-bold uppercase cursor-pointer"
                              >
                                Save Log
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="font-mono text-[10.5px] whitespace-pre-wrap">{lead.notes || "No log entry found. Click Update Log to register feedback metrics."}</p>
                        )}
                      </div>
                    </div>

                    {/* Operational controls */}
                    <div className="flex flex-row md:flex-col justify-end items-center gap-1.5 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      
                      <div className="flex gap-1 items-center">
                        <span className="text-[9px] font-bold uppercase text-slate-400 mr-1.5">Set Status:</span>
                        <button
                          onClick={() => onUpdateLead(lead.id, { status: "Contacted" })}
                          className={`px-2 py-1 text-[9px] font-black uppercase rounded border ${
                            lead.status === "Contacted" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 hover:bg-slate-100 cursor-pointer text-slate-600"
                          }`}
                          title="Mark status Contacted"
                        >
                          Called
                        </button>
                        <button
                          onClick={() => onUpdateLead(lead.id, { status: "In Progress" })}
                          className={`px-2 py-1 text-[9px] font-black uppercase rounded border ${
                            lead.status === "In Progress" ? "bg-amber-50 border-amber-200 text-amber-805" : "bg-white border-slate-200 hover:bg-slate-100 cursor-pointer text-slate-600"
                          }`}
                          title="Mark status In Progress"
                        >
                          Engaged
                        </button>
                      </div>

                      <div className="flex gap-2 items-center w-full md:w-auto mt-2 md:mt-2.5">
                        {lead.status !== "Enrolled" ? (
                          <button
                            onClick={() => {
                              alert("Institutional Protocol: Student registration, enrollment and portal logins are strictly restricted to school Principals & Central Admins only. Please contact the Principal to process this applicant.");
                            }}
                            className="bg-slate-350 hover:bg-slate-450 font-extrabold text-[10px] tracking-widest text-white uppercase px-3 py-2 rounded-xl flex items-center gap-1 cursor-not-allowed w-full md:w-auto"
                            title="Enrollment restricted to Principal / Admin"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Enroll Student</span>
                          </button>
                        ) : (
                          <div className="text-[10px] text-emerald-600 font-black flex items-center gap-1 tracking-wider uppercase bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-150 font-sans">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Enrolled Profile</span>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to permanently delete lead ${lead.name}?`)) {
                              onDeleteLead(lead.id);
                            }
                          }}
                          className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-650 cursor-pointer shrink-0 transition"
                          title="Delete Lead Registry Log Info"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: REGISTER NEW INQUIRY ==================== */}
        {activeTab === "newInquiry" && (
          <div className="bg-white border border-slate-200/95 rounded-3xl p-6 shadow-sm space-y-6 text-left">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight">Register Walk-In / Phone Enquiry</h3>
              <p className="text-xs text-slate-500 mt-1">Register candidates who call our admissions line or visit our physical classrooms desk setup.</p>
            </div>

            <form onSubmit={handleAddNewLeadSubmit} className="space-y-4 max-w-2xl">
              {successMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-800 text-xs py-3 px-4 rounded-xl font-bold flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errMsg && (
                <div className="bg-rose-500/10 border border-rose-500/35 text-rose-800 text-xs py-3 px-4 rounded-xl font-bold flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>{errMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Candidate Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar Patel"
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-650 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Primary Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 99887 76655"
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-650 focus:bg-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh.patel@gmail.com"
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-650 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Interested Batch Program *</label>
                  <select
                    value={newLeadCourse}
                    onChange={(e) => setNewLeadCourse(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-650 focus:bg-white"
                  >
                    {batches.map(b => (
                      <option key={b.id} value={b.name}>{b.name} ({b.code})</option>
                    ))}
                    {batches.length === 0 && (
                      <option value="JEE Advanced Prep">JEE Advanced Prep</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Detailed Message / Walk-In Reason</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Visited center with father. Student is currently weak in trigonometry. Wants 2 mock demo classes."
                  value={newLeadMessage}
                  onChange={(e) => setNewLeadMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-indigo-650 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Administrative Desk Notes (Flags / Callback alarms)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Call scheduled on Wednesday 4 PM for fee discussion."
                  value={newLeadNotes}
                  onChange={(e) => setNewLeadNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-indigo-650 focus:bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-indigo-650 hover:bg-indigo-700 font-extrabold text-xs text-white uppercase tracking-wider px-6 py-3 rounded-xl transition duration-150 cursor-pointer flex items-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register inquiry lead</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==================== TAB 3: ACTIVE BATCHES CATALOG ==================== */}
        {activeTab === "batchesCatalog" && (
          <div className="bg-white border border-slate-200/95 rounded-3xl p-6 shadow-sm space-y-6 text-left">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight">Coaching Batches Programs Catalog</h3>
              <p className="text-xs text-slate-500 mt-1">Review active batch structures, timings, and teachers to answer walk-in parents enquiries accurately.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {batches.map(batch => (
                <div key={batch.id} className="border border-slate-250 p-4 rounded-2xl space-y-3 bg-slate-50/40 hover:bg-slate-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono bg-indigo-50 border border-indigo-150 text-indigo-750 px-1.5 py-0.5 rounded font-black uppercase">
                        {batch.code}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase mt-1 leading-none">
                        {batch.name}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-650">
                    <p className="flex items-center gap-1.5 mt-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Schedule: <strong className="text-slate-800 font-bold">{batch.schedule}</strong></span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Allotted Enrolled Candidates: <strong>{batch.studentIds.length} students</strong></span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: CONVERSION ANALYTICS ==================== */}
        {activeTab === "analytics" && (
          <div className="bg-white border border-slate-200/95 rounded-3xl p-6 shadow-sm space-y-6 text-left animate-fadeIn">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight">Inquiry Funnel Performance Metrics</h3>
              <p className="text-xs text-slate-500 mt-1">Breakdown conversion outcomes of leads submitted via the public portal or walk-in help desk.</p>
            </div>

            {/* Simulated Funnel charts using dynamic CSS meters */}
            <div className="space-y-4 max-w-xl">
              <div>
                <div className="flex justify-between text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 pl-1">
                  <span>🟢 Direct New Leads (Unprocessed)</span>
                  <span>{newLeadsCount} / {totalLeadsCount} leads</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${totalLeadsCount > 0 ? (newLeadsCount / totalLeadsCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 pl-1 font-sans">
                  <span>🔵 follow-up / calls in progress</span>
                  <span>{contactedLeadsCount} / {totalLeadsCount} leads</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full transition-all duration-500"
                    style={{ width: `${totalLeadsCount > 0 ? (contactedLeadsCount / totalLeadsCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 pl-1 font-sans">
                  <span>⭐ Enrolled Student Accounts conversion</span>
                  <span>{enrolledLeadsCount} / {totalLeadsCount} promoted (Conversion: {conversionRate}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full transition-all duration-500 font-sans"
                    style={{ width: `${totalLeadsCount > 0 ? (enrolledLeadsCount / totalLeadsCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Helpful instructions for desk staff */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-start space-x-3 text-left">
              <div className="w-8 h-8 rounded-xl bg-indigo-150 flex items-center justify-center text-indigo-700 shrink-0">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div className="text-xs text-slate-650 leading-relaxed">
                <p className="font-extrabold text-indigo-800 uppercase tracking-wider">Helpful Desk Advice:</p>
                <p className="mt-1">Aim to call "New" leads within 15 minutes of dynamic submission on the Public Website. Always log student preferences, academic difficulties, target courses, board exams schedules within followup notes tracker for secure session continuity.</p>
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 5: FEATURE CUSTOMIZER DESK ==================== */}
        {activeTab === "customFeatures" && (
          <div className="bg-white border border-slate-200/95 rounded-3xl p-6 shadow-sm space-y-6 text-left animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight flex items-center gap-1.5 font-sans">
                  <Cpu className="w-5 h-5 text-amber-500" />
                  <span>Admissions Operational Feature Lab</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-sans">Design and draft custom workflow features on-the-fly, then secure Administrative override code activation to deploy them live.</p>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg">
                Desk Auth Mode
              </span>
            </div>

            {/* Feature drafting and Activation container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
              
              {/* Draft custom tools */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-amber-505" />
                  <span>1. Design New Custom Desk Tool</span>
                </h4>
                
                {featureSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-[11px] font-semibold p-3 rounded-xl border-dashed">
                    {featureSuccess}
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase">Tool Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Sibling Scholarship Eligibility"
                      value={featName}
                      onChange={(e) => setFeatName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase">Description / Purpose *</label>
                    <textarea
                      rows={2}
                      placeholder="Explain how it automates or helps the admissions counter walk-ins process..."
                      value={featDesc}
                      onChange={(e) => setFeatDesc(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase">Functional Category</label>
                    <select
                      value={featCategory}
                      onChange={(e) => setFeatCategory(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value="Automation">Service Automation</option>
                      <option value="Financial Promo">Admissions Fees Benefit / Scholarship</option>
                      <option value="Internal Compliance">Identity Proctored Validation</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      if (!featName.trim() || !featDesc.trim()) {
                        setFeatureError("Please input both Name and Description keys.");
                        return;
                      }
                      setFeatureError("");
                      setFeatureSuccess("");
                      
                      const newFeat = {
                        id: "feat_" + Date.now(),
                        name: featName.trim(),
                        description: featDesc.trim(),
                        category: featCategory,
                        status: "Draft - Pending Activation" as const,
                        requestedAt: new Date().toISOString().split("T")[0]
                      };

                      setProposedFeatures(prev => [...prev, newFeat]);
                      setFeatName("");
                      setFeatDesc("");
                      setFeatureSuccess(`Successfully logged feature draft: "${newFeat.name}". Complete the Admin Passcode authentication to activate it!`);
                    }}
                    className="w-full py-2.5 bg-indigo-650 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Draft Proposed Feature to Desk
                  </button>
                </div>
              </div>

              {/* Admin code override section */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>2. Admin Enforcer Code Activation</span>
                  </h4>
                  
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    Under executive board guidelines, Admissions desk modifications require a secure Registrar override code to compile and deploy custom interactive features.
                  </p>
                  
                  {featureError && (
                    <div className="bg-rose-500/10 border border-rose-500/35 text-rose-800 text-[11px] font-bold p-3 rounded-xl">
                      {featureError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-550 pl-0.5 uppercase tracking-wider">Registrar Admin Code</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        placeholder="Enter Admin Password (e.g. 12112006)"
                        value={adminCodeInput}
                        onChange={(e) => setAdminCodeInput(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs font-mono font-bold"
                      />
                    </div>
                    <span className="block text-[9px] text-slate-400 italic pl-0.5 mt-0.5">Use "12112006" or "SUPERADMIN2026" to compile and activate desk features.</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      const trimmed = adminCodeInput.trim();
                      if (trimmed === "12112006" || trimmed === "SUPERADMIN2026") {
                        setFeatureError("");
                        setFeatureSuccess("");
                        
                        setProposedFeatures(prev => prev.map(f => ({
                          ...f,
                          status: "🟢 Deployed & Active" as const
                        })));
                        
                        setFeatureSuccess("🏆 Success! ADMIN CODE CONFIRMED. All proposed custom desk features have been compiled and fully enabled inside the live workspace!");
                        setAdminCodeInput("");
                      } else {
                        setFeatureError("Invalid Admin Code access password. Unauthorized action blocked.");
                      }
                    }}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer shadow-md shadow-amber-600/10 transition-all flex items-center justify-center space-x-1"
                  >
                    <span>Deploy & Enable Dynamic Features</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Proposed features listing catalog */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-black text-slate-805 uppercase tracking-wider font-mono">Dynamic Desk Customizations Log</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                {proposedFeatures.map(item => (
                  <div key={item.id} className="bg-white border border-slate-250/85 rounded-2xl p-5 shadow-xs space-y-3 text-left">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-150 px-1.5 py-0.5 rounded">
                          {item.id} · {item.category}
                        </span>
                        <h5 className="text-sm font-black text-slate-900 mt-1 uppercase tracking-tight">{item.name}</h5>
                      </div>
                      
                      <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        item.status.includes("Deployed") 
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-normal">{item.description}</p>
                    
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>Proposed: {item.requestedAt}</span>
                      
                      {item.status.includes("Deployed") ? (
                        <button
                          onClick={() => {
                            setActiveSimulationLog(`[Simulation ${item.id} Trigger] Running proctor sandbox check...\nConnecting server webhooks with real-time payload...\nSuccess! Sandbox return: HTTP 202 ACCEPTED.\nAction executed: "${item.name}" tested successfully in sandbox simulation mode! ✅`);
                          }}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-850 font-black uppercase text-[9px] tracking-wider rounded-lg cursor-pointer transition-all"
                        >
                          Run Simulated Sandbox Check
                        </button>
                      ) : (
                        <span className="text-[10px] text-rose-600 font-extrabold uppercase">Awaiting Admin Unlock</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sandbox terminal log simulation feedback */}
            {activeSimulationLog && (
              <div className="bg-slate-950 text-emerald-450 p-4 rounded-2xl border border-slate-800/80 font-mono text-[11px] leading-relaxed relative animate-fadeIn">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-500 mx-0.5 pb-2 border-b border-slate-900/80 mb-2">
                  <span>Sandbox Terminal Monitor</span>
                  <button 
                    onClick={() => setActiveSimulationLog("")} 
                    className="text-slate-400 hover:text-white"
                  >
                    Clear Log
                  </button>
                </div>
                <div className="whitespace-pre-line text-left">
                  {activeSimulationLog}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ==================== TAB 6: STUDENT DIRECT ADD ==================== */}
        {activeTab === "studentAdd" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Direct registration form (RESTRICTED) */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-inner text-center max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shrink-0 shadow-xs">
                <Lock className="w-8 h-8 text-rose-600 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-rose-900 uppercase tracking-widest leading-tight">Registration Restricted</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
                  Direct student registration, portal credentials, and batch assignments are highly confidential master-administrative features.
                  Write access to the student enroll database is restricted to the **School Principal** and **Central Admin** only.
                </p>
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200/60 max-w-sm mx-auto text-left font-mono text-[10px] text-slate-400 space-y-0.5">
                <div>🔒 SYSTEM STATUS: VAULT_ACCESS_LEVEL_2</div>
                <div>👤 CURRENT SESSION: Admission Desk (READ_ONLY)</div>
                <div>🔴 WRITE PRIVILEGE: BLOCKED</div>
              </div>
            </div>

            {/* List View of All Registered Scholars */}
            <div className="bg-white rounded-2xl border border-slate-150 shadow-xs overflow-hidden text-left animate-fadeIn">
              <div className="px-6 py-4 border-b border-slate-150 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <span className="text-xs font-black text-slate-500 uppercase">Primary Admissions Students Directory</span>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Academic profiles on-file across registered branch options</p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-red-50 text-red-800 font-black border border-red-100 rounded-full">
                  {students.length} Authorized Scholars
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {students.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                    No active students enrolled in system. Execute registration parameters above.
                  </div>
                ) : (
                  students.map(std => {
                    const classBatch = batches.find(b => b.id === std.batchId);
                    return (
                      <div key={std.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-red-100 text-red-900 border border-red-200 flex items-center justify-center font-bold text-sm">
                            {std.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h5 className="font-extrabold text-slate-905 uppercase text-xs">{std.name}</h5>
                              <span className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-[9px] px-2 py-0.5 rounded font-mono font-black border border-slate-200">
                                ROLL: {std.rollNo}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center mt-1 text-[11px] text-slate-400 gap-x-3 gap-y-0.5 font-sans font-semibold">
                              <span className="text-red-650 font-bold uppercase tracking-wide">📍 {std.schoolName || "Central High Alliance"}</span>
                              <span>•</span>
                              <span>🧑‍🍼 Father: {std.fatherName || "N/A"}</span>
                              <span>•</span>
                              <span>🕒 DOB: {std.dob || "12-11-2006"}</span>
                              <span>•</span>
                              <span className="bg-amber-50 text-amber-900 px-1.5 py-0.2 rounded font-mono text-[9.5px]">Passcode: {std.password || "alex123"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="bg-red-50 px-2.5 py-1 text-red-700 border border-red-100 text-[9px] uppercase font-black rounded-lg">
                            {classBatch ? classBatch.name : "Unassigned Batch"}
                          </span>
                          {onDeleteStudent && (
                            <button
                              onClick={() => {
                                if (confirm(`Revoke admission and delete profile registry for student ${std.name}?`)) {
                                  onDeleteStudent(std.id);
                                }
                              }}
                              className="text-slate-350 hover:text-red-500 p-2.5 hover:bg-red-50 rounded-xl transition cursor-pointer"
                              title="Delete Student Registry File"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 7: IDENTITY CARD PRINT==================== */}
        {activeTab === "idPrint" && (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight">Identity Card Print Console</h3>
                  <p className="text-xs text-slate-500 mt-1">Generate official high fidelity student identity cards with specific dynamic allotted branch names and photo physical sticking placement lines.</p>
                </div>
              </div>

              {/* Selector */}
              <div className="max-w-md bg-slate-50 p-4 rounded-xl border border-slate-100 text-left space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 pl-1">Select Student for Card Preview</label>
                <select
                  value={selectedPrintStudentId}
                  onChange={(e) => setSelectedPrintStudentId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-extrabold focus:outline-none focus:border-indigo-650"
                >
                  <option value="">-- Choose Enrolled Scholar --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Roll: {s.rollNo} • Branch: {s.schoolName || "Central"})
                    </option>
                  ))}
                </select>
              </div>

              {/* ID Card Display */}
              {selectedPrintStudentId ? (() => {
                const std = students.find(s => s.id === selectedPrintStudentId);
                if (!std) return null;
                const batchObj = batches.find(b => b.id === std.batchId);

                return (
                  <div className="mt-6 space-y-6">
                    {/* Visual Card Wrapper */}
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-100 rounded-3xl border border-slate-200">
                      
                      {/* --- BEGIN PRINTABLE ID CARD CONTAINER --- */}
                      <div 
                        id="printable-id-card-area" 
                        className="w-[350px] min-h-[480px] bg-white border-4 border-slate-900 rounded-3xl shadow-xl overflow-hidden text-left flex flex-col justify-between relative bg-[linear-gradient(to_bottom,rgb(248,250,252)_35%,white_35%)] select-none no-print border-double"
                      >
                        
                        {/* ID Head Block */}
                        <div className="bg-slate-900 text-white p-4 text-center space-y-1 border-b-2 border-slate-800">
                          <span className="bg-red-650 text-white text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded font-mono border border-red-500/20">
                            Academic Branch Branch Card
                          </span>
                          <h4 className="text-xs font-black uppercase tracking-tight mt-1 line-clamp-2 leading-tight">
                            {std.schoolName || "Study Hub Higher Academy"}
                          </h4>
                          <p className="text-[7.5px] text-slate-300 font-mono tracking-widest uppercase">Certified Affiliation Branch</p>
                        </div>

                        {/* ID Card Body */}
                        <div className="p-5 flex-1 flex flex-col items-center space-y-4">
                          
                          {/* STICK PHOTO ZONE (Strict layout rule from principle) */}
                          <div className="w-[100px] h-[120px] bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-2 rounded-xl scale-102 hover:border-slate-400 transition">
                            <span className="block text-[8px] font-black uppercase text-slate-500 leading-none">STICK PHOTO</span>
                            <span className="block text-[8px] font-bold text-slate-450 mt-1 pl-0.5">PASTE</span>
                            <span className="block text-[7px] text-slate-400 mt-1 capitalize leading-relaxed font-mono">1x1 Inch Color Photo Here Only</span>
                          </div>

                          {/* Student Metadata */}
                          <div className="w-full text-center">
                            <h3 className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">
                              {std.name}
                            </h3>
                            <span className="inline-block bg-indigo-50 text-indigo-700 font-mono font-black text-[9.5px] px-2.5 py-0.5 rounded border border-indigo-100 mt-1.5">
                              ROLL NO: {std.rollNo}
                            </span>
                          </div>

                          {/* Informational Grid */}
                          <div className="w-full text-xs font-semibold text-slate-800 space-y-2 pt-2 border-t border-slate-100 font-sans pl-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400 text-[9px] uppercase font-black">Enrolled Class:</span>
                              <span className="text-slate-900 font-black uppercase text-[10px]">{batchObj ? batchObj.name : "Core Foundation Batch"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 text-[9px] uppercase font-black">Father:</span>
                              <span className="text-slate-900 uppercase text-[10.5px]">{std.fatherName || "Shri Kamal Verma"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 text-[9px] uppercase font-black">Contact Mob:</span>
                              <span className="text-slate-900 font-mono font-bold text-[10.5px]">{std.mobileNumber || "+91 62612 11200"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 text-[9px] uppercase font-black">D.O.B:</span>
                              <span className="text-slate-900 font-mono font-bold text-[11px]">{std.dob || "12-11-2006"}</span>
                            </div>
                          </div>

                        </div>

                        {/* Card footer block */}
                        <div className="bg-slate-50 p-2.5 border-t border-slate-100 flex items-center justify-between px-4 text-left">
                          <div className="space-y-0.5">
                            <span className="block text-[6.5px] text-slate-400 leading-none font-black uppercase font-mono">AUTHORIZED REGISTRAR</span>
                            <span className="block text-[7.5px] text-red-650 font-black">ONLINE SYNC ADMISSION DESK</span>
                          </div>
                          
                          {/* Signature square */}
                          <div className="w-14 h-6 border border-slate-200 rounded flex items-center justify-center bg-white shadow-inner font-mono text-[7px] text-slate-400 font-black uppercase">
                            Seal / Sign
                          </div>
                        </div>

                      </div>
                      {/* --- END PRINTABLE ID CARD CONTAINER --- */}

                      {/* Cardinal action trigger */}
                      <div className="mt-5 flex gap-2 w-full max-w-xs">
                        <button
                          onClick={() => {
                            // Friendly mock-print instructions
                            alert("Preparing Student Physical Card Layout...\nClick standard browser print to compile with high resolution colors!\nNote: Cut along card outer line border.");
                            const printableStyle = document.createElement("style");
                            printableStyle.innerHTML = `
                              @media print {
                                body * { visibility: hidden !important; }
                                #printable-id-card-area, #printable-id-card-area * { visibility: visible !important; }
                                #printable-id-card-area {
                                  position: absolute !important;
                                  left: 50% !important;
                                  top: 10% !important;
                                  transform: translateX(-50%) !important;
                                  border: 4px solid black !important;
                                  width: 350px !important;
                                  min-height: 480px !important;
                                }
                              }
                            `;
                            document.head.appendChild(printableStyle);
                            window.print();
                            setTimeout(() => {
                              document.head.removeChild(printableStyle);
                            }, 500);
                          }}
                          className="flex-1 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Print ID Card</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })() : (
                <div className="p-12 text-center text-slate-400 text-xs font-bold leading-normal uppercase">
                  Please select an active student profile from the selector drop down box to render the physical Photo Paste card.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 8: BUS PASS & TRANSPORT DESK ==================== */}
        {activeTab === "busDesk" && (
          <div className="space-y-6 animate-fadeIn text-left">
            
            {/* Pass issue form */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Bus className="w-5.5 h-5.5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight">School Bus Transport Desk</h3>
                  <p className="text-xs text-slate-500 mt-1">Issue official bus pass coupons, track collection, and print physical sector routing cards with student Photo pasting borders.</p>
                </div>
              </div>

              <form onSubmit={handleAddNewBusPass} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  {/* Select scholar */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Student Roll Identification Number *</label>
                    <select
                      value={newBusRoll}
                      onChange={(e) => setNewBusRoll(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold"
                      required
                    >
                      <option value="">-- Choose Enrolled Card Holder --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.rollNo}>
                          {s.name} ({s.rollNo} • {s.schoolName || "Central"})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Route */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Bus Transport Route Sector *</label>
                    <select
                      value={newBusRoute}
                      onChange={(e) => setNewBusRoute(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold"
                    >
                      <option value="Route 1A - North Metro Feeders">Route 1A - North Metro Feeders</option>
                      <option value="Route 2B - East Gwalior Bypass Link">Route 2B - East Gwalior Bypass Link</option>
                      <option value="Route 3C - West Town Hub Loop">Route 3C - West Town Hub Loop</option>
                      <option value="Route 4B - South Cantt Sectors">Route 4B - South Cantt Sectors</option>
                      <option value="Route 5A - Central Express Corridor">Route 5A - Central Express Corridor</option>
                    </select>
                  </div>

                  {/* Transport fee */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Fees Status Tracker</label>
                    <select
                      value={newBusFeeStatus}
                      onChange={(e) => setNewBusFeeStatus(e.target.value as "Paid" | "Unpaid")}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800"
                    >
                      <option value="Paid">🟢 Fee Paid (Authorized)</option>
                      <option value="Unpaid">🔴 Pending Collection</option>
                    </select>
                  </div>

                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-1">Validity Parameter</label>
                    <input
                      type="text"
                      value={newBusValidity}
                      onChange={e => setNewBusValidity(e.target.value)}
                      className="bg-slate-50 px-3 py-1.5 border border-slate-150 rounded-lg text-xs font-mono font-black"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-black text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-lg transition duration-150 cursor-pointer flex items-center space-x-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Issue Transport Sector Pass</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Issued passes log list directory */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Passenger Log list left side */}
              <div className="md:col-span-2 bg-white rounded-2xl border border-slate-150 shadow-xs overflow-hidden h-fit">
                <div className="px-5 py-3 border-b border-slate-150 bg-slate-50 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-500 uppercase font-mono">Transport Passenger Board Directory</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-slate-700 font-mono">
                    {busPasses.length} Active Passenger(s)
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {busPasses.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-bold">
                      No travel bus passes issued today. Use the generator panel.
                    </div>
                  ) : (
                    busPasses.map(p => (
                      <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-100 text-[9px] px-1.5 py-0.2 rounded font-mono font-black uppercase">
                              {p.serialNo}
                            </span>
                            <h5 className="font-extrabold text-slate-900 text-xs uppercase">{p.studentName}</h5>
                          </div>
                          <div className="flex flex-wrap items-center mt-1 text-[11.5px] text-slate-400 gap-x-2">
                            <span className="font-mono text-slate-700 font-semibold">{p.studentRollNo}</span>
                            <span>•</span>
                            <span className="font-black text-indigo-700 uppercase text-[10px]">{p.route}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium font-sans mt-0.5">📍 Branch allotment: <span className="font-extrabold text-slate-550 uppercase">{p.allottedSchoolName}</span></p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedBusPassPrintId(p.id)}
                            className="bg-indigo-50 border border-indigo-150 text-indigo-700 text-[9px] hover:bg-indigo-100 uppercase px-2.5 py-1 rounded cursor-pointer leading-none font-black"
                          >
                            Preview Card
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Revoke transport permit and invalid Bus Pass serial ${p.serialNo}?`)) {
                                setBusPasses(busPasses.filter(item => item.id !== p.id));
                              }
                            }}
                            className="text-slate-300 hover:text-red-500 p-1.5 rounded hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Transit Pass Card Preview Panel right side */}
              <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-sm text-left flex flex-col items-center">
                <span className="block text-[8.5px] font-black uppercase tracking-widest text-slate-400 pl-1 mb-3 self-start">Bus Travel Card Preview Panel</span>
                
                {selectedBusPassPrintId ? (() => {
                  const targetPass = busPasses.find(p => p.id === selectedBusPassPrintId);
                  if (!targetPass) return null;

                  return (
                    <div className="w-full flex flex-col items-center">
                      <div 
                        id="printable-bus-card"
                        className="w-[280px] min-h-[390px] bg-slate-900 text-white rounded-3xl border-4 border-amber-500 shadow-xl overflow-hidden flex flex-col justify-between relative bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 p-4 font-mono select-none"
                      >
                        {/* Transit Header */}
                        <div className="text-center space-y-1 pb-2 border-b border-slate-800">
                          <span className="bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded leading-none uppercase">
                            TRANSPORTATION PERMIT CARD
                          </span>
                          <h4 className="text-[10.5px] font-black tracking-tight text-white uppercase mt-1 leading-snug truncate">
                            {targetPass.allottedSchoolName}
                          </h4>
                          <span className="block text-[6px] text-slate-500 font-sans tracking-wide uppercase">DYNAMIC BRANCH NETWORK PASS</span>
                        </div>

                        {/* Mid section containing photo box & route */}
                        <div className="py-4 flex flex-col items-center space-y-3">
                          
                          {/* STAMP PHOTO PLACE */}
                          <div className="w-[85px] h-[95px] bg-slate-950/80 border border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center p-1.5 text-center">
                            <span className="text-[6.5px] text-slate-400 font-black leading-none uppercase">PASTE</span>
                            <span className="text-[6px] text-slate-550 lowercase mt-0.5 font-sans leading-none">Photo Here</span>
                          </div>

                          <div className="text-center">
                            <h3 className="text-xs font-black text-amber-400 uppercase leading-none truncate w-[240px]">
                              {targetPass.studentName}
                            </h3>
                            <span className="text-[8.5px] text-slate-400 mt-1 uppercase">ROLL: {targetPass.studentRollNo}</span>
                          </div>

                          {/* Transit route specifics */}
                          <div className="w-full bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 text-[8.5px] leading-relaxed text-slate-300">
                            <div><strong className="text-amber-500 uppercase text-[7.5px]">Bus route Sector:</strong></div>
                            <div className="text-white font-extrabold text-[9px] uppercase mt-0.5 truncate">{targetPass.route}</div>
                            
                            <div className="grid grid-cols-2 gap-2 mt-2 border-t border-slate-800 pt-1.5">
                              <div>
                                <span className="block text-[7px] text-slate-500 uppercase">Valid Untill</span>
                                <span className="text-white font-bold">{targetPass.validity}</span>
                              </div>
                              <div>
                                <span className="block text-[7px] text-slate-500 uppercase">Serial Code</span>
                                <span className="text-amber-400 font-bold">{targetPass.serialNo}</span>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Card ticket stub footer */}
                        <div className="border-t border-dashed border-slate-800 pt-2 flex justify-between items-center px-1">
                          <div className="flex flex-col">
                            <span className="block text-[5.5px] uppercase tracking-wider text-slate-500 leading-none">Status</span>
                            <span className="text-[8.5px] text-emerald-400 font-black font-sans uppercase">✓ FEE PAID</span>
                          </div>
                          
                          {/* barcode mock */}
                          <div className="text-[12px] font-serif leading-none tracking-widest text-slate-450 border border-slate-800 bg-slate-950 px-1.5 py-1">
                            ||||| | |||
                          </div>
                        </div>

                      </div>

                      {/* Print transit pass button */}
                      <button
                        onClick={() => {
                          alert(`Compiling physical Bus Sector Card serial ${targetPass.serialNo}...\nReady to print in standard browser setup!`);
                          const printableBusStyle = document.createElement("style");
                          printableBusStyle.innerHTML = `
                            @media print {
                              body * { visibility: hidden !important; }
                              #printable-bus-card, #printable-bus-card * { visibility: visible !important; }
                              #printable-bus-card {
                                position: absolute !important;
                                left: 50% !important;
                                top: 15% !important;
                                transform: translateX(-50%) !important;
                                border: 4px solid #f59e0b !important;
                                width: 280px !important;
                                min-height: 390px !important;
                              }
                            }
                          `;
                          document.head.appendChild(printableBusStyle);
                          window.print();
                          setTimeout(() => {
                            document.head.removeChild(printableBusStyle);
                          }, 500);
                        }}
                        className="w-full mt-4 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider py-2 rounded-xl text-center cursor-pointer shadow-xs flex items-center justify-center space-x-1"
                      >
                        <Bus className="w-3.5 h-3.5 text-amber-500" />
                        <span>Print travel card</span>
                      </button>
                    </div>
                  );
                })() : (
                  <div className="py-12 px-4 border border-dashed text-slate-450 border-slate-200 text-xs text-center font-bold uppercase rounded-xl">
                    Select a passenger from the travel boards directory list on the left to preview the travel pass badge.
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </div>

      {/* ==================== 3. ENROLL & PROMOTE MODAL ==================== */}
      {enrollModalLead && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center z-[200] p-4 text-left font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative animate-fadeIn">
            
            {/* Close modal */}
            <button
              onClick={() => setEnrollModalLead(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer text-slate-400 hover:text-slate-800 transition"
              title="Close Promotion modal"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <span className="block text-[8px] font-black uppercase text-indigo-700 tracking-widest font-sans">Admission promotion desk info</span>
                <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase mt-1">
                  Promote: {enrollModalLead.name}
                </h3>
                <p className="text-xs text-slate-450 mt-1">Configure study parameters. Promoted leads are assigned active Student login coordinates.</p>
              </div>

              {enrollSuccessMessage && (
                <div className="bg-emerald-100 border border-emerald-350 text-emerald-805 text-xs py-2.5 px-4 rounded-xl font-bold">
                  {enrollSuccessMessage}
                </div>
              )}

              {enrollErrorMessage && (
                <div className="bg-rose-100 border border-rose-350 text-rose-805 text-xs py-2.5 px-4 rounded-xl font-bold flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{enrollErrorMessage}</span>
                </div>
              )}

              <form onSubmit={handleFinalizePromotion} className="space-y-4">
                
                {/* Roll code */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Enrollment Roll No *</label>
                    <button
                      type="button"
                      onClick={triggerAutoAllotRoll}
                      className="text-[9px] font-black text-indigo-700 uppercase hover:underline cursor-pointer"
                    >
                      🎲 Auto-Allot Roll
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PJ-2026-641"
                    value={enrollRollNo}
                    onChange={(e) => setEnrollRollNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-650 font-mono"
                  />
                </div>

                {/* DOB used as portal password */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Date of Birth (Fee Portal DOB Pass) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DD-MM-YYYY (e.g. 12-11-2006)"
                    value={enrollDob}
                    onChange={(e) => setEnrollDob(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-650 font-mono"
                  />
                  <p className="text-[9px] text-slate-400 mt-0.5">Used as Online Fee Portal Password by candidate.</p>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Portal study Password *</label>
                  <input
                    type="text"
                    required
                    value={enrollPassword}
                    onChange={(e) => setEnrollPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-650 font-mono"
                  />
                  <p className="text-[9px] text-slate-400 mt-0.5">Standard workspace études key password.</p>
                </div>

                {/* Batch allotment */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-black text-slate-505 uppercase tracking-widest">Assign Active study Batch *</label>
                  <select
                    value={enrollBatchId}
                    onChange={(e) => setEnrollBatchId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold"
                  >
                    <option value="">No Batch Assigned</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Cta */}
                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setEnrollModalLead(null)}
                    className="px-4 py-2.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-650 rounded-xl font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-650 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-wider cursor-pointer shadow-xs"
                  >
                    Confirm Enrollment
                  </button>
                </div>

              </form>

            </div>

          </div>
        </div>
      )}

      {/* Footer Watermark */}
      <div className="col-span-1 lg:col-span-4 mt-12 border-t border-slate-100 pt-6 pb-2 text-center text-xs text-slate-400 font-medium font-sans no-print flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">© 2026 Vishveshwar Foundation Ltd.</span>
        <span className="text-[10px] bg-indigo-50 text-indigo-650 px-2.5 py-1 rounded-full font-bold">Admission Desk Terminal</span>
      </div>
    </div>
  );
}
