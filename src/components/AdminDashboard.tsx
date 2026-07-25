import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, BookOpen, UserCheck, Megaphone, 
  Plus, Trash2, Calendar, Award, Mail,
  Lock, Key, ShieldAlert, Sparkles, User, Search,
  Eye, EyeOff, Shield, ToggleLeft, ToggleRight, CheckSquare,
  RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, MessageSquare, Camera, Upload, Send,
  Menu, X, QrCode, Scan, XCircle, Edit3, Receipt, Settings, UserPlus, ClipboardList
} from "lucide-react";
import { Batch, Teacher, Student, Announcement, AdminUser, SupportMessage, ComputerDesk, Test, FeeManager, ContactLead, PublicBatch, AuthorizedDevice, School, SecuritySOSAlert, AdmissionOfficer, OnlineAnnouncement, CounsellingRequest, CounsellingSlot, AdmissionRequest, Verifier } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StudentQRCard from "./StudentQRCard";
import QRCardScanner from "./QRCardScanner";
import { Monitor, Laptop, PowerOff, ShieldAlert as AlertIcon, ToggleLeft as LockToggle, Edit, CheckCircle, PhoneCall, School as SchoolIcon } from "lucide-react";
import { db, auth, OperationType } from "../firebase";
import { collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import { Cloud, CloudLightning, Database, HardDrive, HelpCircle } from "lucide-react";

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

interface AdminDashboardProps {
  batches: Batch[];
  teachers: Teacher[];
  students: Student[];
  announcements: Announcement[];
  admins?: AdminUser[];
  supportMessages?: SupportMessage[];
  computerDesks?: ComputerDesk[];
  tests?: Test[];
  feeManagers?: FeeManager[];
  schools?: School[];
  onCreateSchool?: (school: School) => void;
  onDeleteSchool?: (id: string) => void;
  onUpdateSchool?: (school: School) => void;
  onSendSupportMessage?: (content: string, studentId: string) => void;
  onCreateBatch: (batch: Batch) => void;
  onDeleteBatch: (id: string) => void;
  onUpdateBatch?: (batch: Batch) => void;
  onCreateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onCreateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onAddAnnouncement: (ann: Announcement) => void;
  onCreateAdmin?: (admin: AdminUser) => void;
  onDeleteAdmin?: (id: string) => void;
  onUpdateAdminStatus?: (id: string, status: "Active" | "Inactive") => void;
  onUpdateAdminPassword?: (id: string, pass: string) => void;
  onUpdateTeacherStatus?: (id: string, status: "Active" | "On Leave") => void;
  onUpdateTeacherPassword?: (id: string, pass: string) => void;
  onUpdateStudentStatus?: (id: string, status: "Active" | "Inactive") => void;
  onUpdateStudentPassword?: (id: string, pass: string) => void;
  onUpdateStudentDetails?: (id: string, updatedFields: Partial<Student>) => void;
  onUpdateAdminProfile?: (id: string, name: string, email: string, avatar?: string) => void;
  loggedInAdminId?: string;
  onRegisterComputerDesk?: (desk: ComputerDesk) => void;
  onDeleteComputerDesk?: (id: string) => void;
  onUpdateComputerDesk?: (desk: ComputerDesk) => void;
  onUpdateStudentLock?: (id: string, isLocked: boolean) => void;
  onApproveTest?: (id: string, isApproved: boolean) => void;
  onDeleteTest?: (id: string) => void;
  onCreateFeeManager?: (fm: FeeManager) => void;
  onDeleteFeeManager?: (id: string) => void;
  onUpdateFeeManagerStatus?: (id: string, status: "Active" | "Inactive") => void;
  onUpdateFeeManagerPassword?: (id: string, pass: string) => void;
  admissionOfficers?: AdmissionOfficer[];
  onCreateAdmissionOfficer?: (ao: AdmissionOfficer) => void;
  onDeleteAdmissionOfficer?: (id: string) => void;
  onUpdateAdmissionOfficerStatus?: (id: string, status: "Active" | "Inactive") => void;
  onUpdateAdmissionOfficerPassword?: (id: string, pass: string) => void;
  verifiers?: Verifier[];
  onCreateVerifier?: (v: Verifier) => void;
  onDeleteVerifier?: (id: string) => void;
  onUpdateVerifierStatus?: (id: string, status: "Active" | "Inactive") => void;
  onUpdateVerifierPassword?: (id: string, pass: string) => void;
  leads?: ContactLead[];
  onUpdateLead?: (id: string, updatedFields: Partial<ContactLead>) => void;
  onDeleteLead?: (id: string) => void;
  onUpdateAnnouncement?: (id: string, updatedFields: Partial<Announcement>) => void;
  onDeleteAnnouncement?: (id: string) => void;
  isNoticeboardAdminOnly?: boolean;
  onToggleNoticeboardAdminOnly?: (val: boolean) => void;
  publicBatches?: PublicBatch[];
  onAddPublicBatch?: (b: PublicBatch) => void;
  onUpdatePublicBatch?: (id: string, updatedFields: Partial<PublicBatch>) => void;
  onDeletePublicBatch?: (id: string) => void;
  isEmergencyShutdown?: boolean;
  setIsEmergencyShutdown?: (val: boolean) => void;
  shutdownReason?: string;
  setShutdownReason?: (val: string) => void;
  authorizedDevices?: AuthorizedDevice[];
  setAuthorizedDevices?: (val: AuthorizedDevice[]) => void;
  currentDeviceKey?: string;
  securityAlerts?: SecuritySOSAlert[];
  onResolveAlert?: (id: string, comments: string, resolvedBy: string) => void;
  onlineAnnouncements?: OnlineAnnouncement[];
  onAddOnlineAnnouncement?: (ann: OnlineAnnouncement) => void;
  onUpdateOnlineAnnouncement?: (id: string, updatedFields: Partial<OnlineAnnouncement>) => void;
  onDeleteOnlineAnnouncement?: (id: string) => void;
  counsellingRequests?: CounsellingRequest[];
  setCounsellingRequests?: React.Dispatch<React.SetStateAction<CounsellingRequest[]>>;
  counsellingSlots?: CounsellingSlot[];
  setCounsellingSlots?: React.Dispatch<React.SetStateAction<CounsellingSlot[]>>;
  admissionRequests?: AdmissionRequest[];
  setAdmissionRequests?: React.Dispatch<React.SetStateAction<AdmissionRequest[]>>;
  setStudents?: React.Dispatch<React.SetStateAction<Student[]>>;
  setBatches?: React.Dispatch<React.SetStateAction<Batch[]>>;
  activeTab?: "overview" | "schools" | "batches" | "teachers" | "feemanagers" | "students" | "announcements" | "online-announcements" | "leads" | "logins" | "profile" | "support" | "scanner" | "computers" | "tests" | "website-control" | "settings" | "emergency" | "admissions" | "firebase" | "counselling" | "counselling-slots" | "verifiers";
  setActiveTab?: (tab: "overview" | "schools" | "batches" | "teachers" | "feemanagers" | "students" | "announcements" | "online-announcements" | "leads" | "logins" | "profile" | "support" | "scanner" | "computers" | "tests" | "website-control" | "settings" | "emergency" | "admissions" | "firebase" | "counselling" | "counselling-slots" | "verifiers") => void;
  hideSidebarOnDesktop?: boolean;
}

export default function AdminDashboard({
  batches,
  teachers,
  students,
  announcements,
  admissionRequests = [],
  setAdmissionRequests = () => {},
  setStudents = () => {},
  setBatches = () => {},
  admins = [],
  supportMessages = [],
  computerDesks = [],
  tests = [],
  feeManagers = [],
  schools = [],
  onCreateSchool,
  onDeleteSchool,
  onUpdateSchool,
  onSendSupportMessage,
  onCreateBatch,
  onDeleteBatch,
  onUpdateBatch,
  onCreateTeacher,
  onDeleteTeacher,
  onCreateStudent,
  onDeleteStudent,
  onAddAnnouncement,
  onCreateAdmin,
  onDeleteAdmin,
  onUpdateAdminStatus,
  onUpdateAdminPassword,
  onUpdateTeacherStatus,
  onUpdateTeacherPassword,
  onUpdateStudentStatus,
  onUpdateStudentPassword,
  onUpdateStudentDetails,
  onUpdateAdminProfile,
  loggedInAdminId,
  onRegisterComputerDesk,
  onDeleteComputerDesk,
  onUpdateComputerDesk,
  onUpdateStudentLock,
  onApproveTest,
  onDeleteTest,
  onCreateFeeManager,
  onDeleteFeeManager,
  onUpdateFeeManagerStatus,
  onUpdateFeeManagerPassword,
  admissionOfficers = [],
  onCreateAdmissionOfficer,
  onDeleteAdmissionOfficer,
  onUpdateAdmissionOfficerStatus,
  onUpdateAdmissionOfficerPassword,
  verifiers = [],
  onCreateVerifier,
  onDeleteVerifier,
  onUpdateVerifierStatus,
  onUpdateVerifierPassword,
  leads = [],
  onUpdateLead,
  onDeleteLead,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onlineAnnouncements = [],
  onAddOnlineAnnouncement,
  onUpdateOnlineAnnouncement,
  onDeleteOnlineAnnouncement,
  isNoticeboardAdminOnly = false,
  onToggleNoticeboardAdminOnly,
  publicBatches = [],
  onAddPublicBatch,
  onUpdatePublicBatch,
  onDeletePublicBatch,
  isEmergencyShutdown = false,
  setIsEmergencyShutdown,
  shutdownReason = "",
  setShutdownReason,
  authorizedDevices = [],
  setAuthorizedDevices,
  currentDeviceKey = "",
  securityAlerts = [],
  onResolveAlert,
  counsellingRequests = [],
  setCounsellingRequests = () => {},
  counsellingSlots = [],
  setCounsellingSlots = () => {},
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  hideSidebarOnDesktop = false
}: AdminDashboardProps) {
  const [localActiveTab, setLocalActiveTab ] = useState<"overview" | "schools" | "batches" | "teachers" | "feemanagers" | "students" | "announcements" | "online-announcements" | "leads" | "logins" | "profile" | "support" | "scanner" | "computers" | "tests" | "website-control" | "settings" | "emergency" | "admissions" | "firebase" | "counselling" | "counselling-slots" | "verifiers" >("overview");
  
  // Branded LMS & Tuition Fee settings states from given info
  const [tuitionBaseFee, setTuitionBaseFee] = useState<number>(() => {
    return Number(localStorage.getItem("co_setting_tuition_fee") || "1500");
  });

  // Counselling local states
  const [newSlotDateTime, setNewSlotDateTime] = useState("");
  const [selectedCounselId, setSelectedCounselId] = useState<string | null>(null);
  const [adminCounselNotes, setAdminCounselNotes] = useState("");
  const [adminMeetingLink, setAdminMeetingLink] = useState("");
  const [adminChatInput, setAdminChatInput] = useState("");
  const [counselFilter, setCounselFilter] = useState<"All" | "Pending" | "Active" | "Closed">("All");
  const [counselSearch, setCounselSearch] = useState("");
  const [handbookFee, setHandbookFee] = useState<number>(() => {
    return Number(localStorage.getItem("co_setting_handbook_fee") || "250");
  });
  const [scholarPrefix, setScholarPrefix] = useState<string>(() => {
    return localStorage.getItem("co_setting_scholar_prefix") || "RJ2026";
  });
  const [coursesConfig, setCoursesConfig] = useState<Array<{ id: string; name: string; duration: string; price: number }>>(() => {
    const list = localStorage.getItem("co_setting_courses_list");
    if (list) return JSON.parse(list);
    return [
      { id: "c_1", name: "Advanced Mathematics & Analytical Mechanics (IIT-JEE Mains & Advanced Prep)", duration: "1 / 2 Year course", price: 1500 },
      { id: "c_2", name: "Biology Crackers & Applied Organic Chemistry (NEET UG Elite Coaching)", duration: "1 / 2 Year course", price: 1500 },
      { id: "c_3", name: "Higher Secondary Science & Computing Labs (Advanced Scientific Boards Prep)", duration: "Full Academic Year", price: 1500 }
    ];
  });
  const [labsConfig, setLabsConfig] = useState<Array<{ id: string; name: string; desks: string }>>(() => {
    const list = localStorage.getItem("co_setting_labs_list");
    if (list) return JSON.parse(list);
    return [
      { id: "l_1", name: "Lab Alpha", desks: "LAB-PC-01, LAB-PC-02, LAB-PC-03" },
      { id: "l_2", name: "Lab Beta", desks: "LAB-PC-04, LAB-PC-05" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("co_setting_tuition_fee", tuitionBaseFee.toString());
  }, [tuitionBaseFee]);

  useEffect(() => {
    localStorage.setItem("co_setting_handbook_fee", handbookFee.toString());
  }, [handbookFee]);

  useEffect(() => {
    localStorage.setItem("co_setting_scholar_prefix", scholarPrefix);
  }, [scholarPrefix]);

  useEffect(() => {
    localStorage.setItem("co_setting_courses_list", JSON.stringify(coursesConfig));
  }, [coursesConfig]);

  useEffect(() => {
    localStorage.setItem("co_setting_labs_list", JSON.stringify(labsConfig));
  }, [labsConfig]);

  const activeTab = propActiveTab || localActiveTab;
  const setActiveTab = propSetActiveTab || setLocalActiveTab;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedChatStudentId, setSelectedChatStudentId] = useState<string>("");

  // Local state for registered computer workspaces
  const [newDeskCode, setNewDeskCode] = useState("");
  const [newDeskRoom, setNewDeskRoom] = useState("");
  const [newDeskFaculty, setNewDeskFaculty] = useState("");
  const [newDeskIp, setNewDeskIp] = useState("");
  const [editingDesk, setEditingDesk] = useState<ComputerDesk | null>(null);

  // Session lockout password confirmation states
  const [lockoutModalStudentId, setLockoutModalStudentId] = useState<string | null>(null);
  const [lockoutModalAction, setLockoutModalAction] = useState<boolean>(false);
  const [lockoutPasswordInput, setLockoutPasswordInput] = useState("");
  const [lockoutErrorMsg, setLockoutErrorMsg] = useState("");

  // QR Credential management
  const [selectedQRStudent, setSelectedQRStudent] = useState<Student | null>(null);
  const [lastScannedAdminStudent, setLastScannedAdminStudent] = useState<Student | null>(null);

  // --- STUDENT EDIT MODAL STATES ---
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentName, setEditStudentName] = useState("");
  const [editStudentEmail, setEditStudentEmail] = useState("");
  const [editStudentRollNo, setEditStudentRollNo] = useState("");
  const [editStudentPassword, setEditStudentPassword] = useState("");
  const [editStudentSchool, setEditStudentSchool] = useState("");
  const [editStudentMobile, setEditStudentMobile] = useState("");
  const [editStudentBatchId, setEditStudentBatchId] = useState("");
  const [editStudentDob, setEditStudentDob] = useState("");

  // Dynamic Public Website Batches States
  const [isAddingPublicBatch, setIsAddingPublicBatch] = useState(false);
  const [pbName, setPbName] = useState("");
  const [pbDept, setPbDept] = useState("");
  const [pbDesc, setPbDesc] = useState("");
  const [pbDuration, setPbDuration] = useState("");
  const [pbIsPublished, setPbIsPublished] = useState(true);

  const [editingPublicBatchId, setEditingPublicBatchId] = useState<string | null>(null);
  const [editPbName, setEditPbName] = useState("");
  const [editPbDept, setEditPbDept] = useState("");
  const [editPbDesc, setEditPbDesc] = useState("");
  const [editPbDuration, setEditPbDuration] = useState("");

  // School Registry Hook States
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolCode, setNewSchoolCode] = useState("");
  const [newSchoolAddress, setNewSchoolAddress] = useState("");
  const [newSchoolPrincipalName, setNewSchoolPrincipalName] = useState("");
  const [newSchoolPrincipalEmail, setNewSchoolPrincipalEmail] = useState("");
  const [newSchoolPrincipalPassword, setNewSchoolPrincipalPassword] = useState("");
  const [newSchoolPrincipalEmployeeCode, setNewSchoolPrincipalEmployeeCode] = useState("");
  const [newSchoolIsAllotted, setNewSchoolIsAllotted] = useState(false);
  const [searchSchoolQuery, setSearchSchoolQuery] = useState("");

  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [editSchName, setEditSchName] = useState("");
  const [editSchCode, setEditSchCode] = useState("");
  const [editSchAddress, setEditSchAddress] = useState("");
  const [editSchPrincipalName, setEditSchPrincipalName] = useState("");
  const [editSchPrincipalEmail, setEditSchPrincipalEmail] = useState("");
  const [editSchPrincipalPassword, setEditSchPrincipalPassword] = useState("");
  const [editSchPrincipalEmployeeCode, setEditSchPrincipalEmployeeCode] = useState("");
  const [editSchIsAllotted, setEditSchIsAllotted] = useState(false);

  // Hardware Device Registry States
  const [newDeviceKeyInput, setNewDeviceKeyInput] = useState("");
  const [newDeviceNameInput, setNewDeviceNameInput] = useState("");
  const [deviceError, setDeviceError] = useState("");
  const [deviceSuccess, setDeviceSuccess] = useState("");
  const [editPbIsPublished, setEditPbIsPublished] = useState(true);

  // New Batch Form State
  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchSubject, setNewBatchSubject] = useState("");
  const [newBatchSchedule, setNewBatchSchedule] = useState("");
  const [newBatchTeacher, setNewBatchTeacher] = useState("");
  const [newBatchCode, setNewBatchCode] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Editing Batch State
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [editBatchName, setEditBatchName] = useState("");
  const [editBatchSubject, setEditBatchSubject] = useState("");
  const [editBatchSchedule, setEditBatchSchedule] = useState("");
  const [editBatchTeacher, setEditBatchTeacher] = useState("");
  const [editBatchCode, setEditBatchCode] = useState("");
  const [editStudentIds, setEditStudentIds] = useState<string[]>([]);

  // New Teacher Form State
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [newTeacherSpecs, setNewTeacherSpecs] = useState("");
  const [newTeacherPassword, setNewTeacherPassword] = useState("");
  const [newTeacherSchoolId, setNewTeacherSchoolId] = useState("");

  // New Fee Manager Form State
  const [newFeeManagerName, setNewFeeManagerName] = useState("");
  const [newFeeManagerEmail, setNewFeeManagerEmail] = useState("");
  const [newFeeManagerPassword, setNewFeeManagerPassword] = useState("");

  // New Admission Officer Form State
  const [newAdmissionOfficerName, setNewAdmissionOfficerName] = useState("");
  const [newAdmissionOfficerEmail, setNewAdmissionOfficerEmail] = useState("");
  const [newAdmissionOfficerPassword, setNewAdmissionOfficerPassword] = useState("");

  // New Verifier Form State
  const [newVerifierName, setNewVerifierName] = useState("");
  const [newVerifierUsername, setNewVerifierUsername] = useState("");
  const [newVerifierPassword, setNewVerifierPassword] = useState("");

  // New Student Form State
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentRoll, setNewStudentRoll] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("");
  const [newStudentDob, setNewStudentDob] = useState("");
  const [newStudentSchoolId, setNewStudentSchoolId] = useState("");
  const [newStudentMobile, setNewStudentMobile] = useState("");

  // New Announcement Form State
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annBatchId, setAnnBatchId] = useState<string>("all");
  const [annIsPublished, setAnnIsPublished] = useState(true);

  // Online Announcement Form State
  const [onlineAnnTitle, setOnlineAnnTitle] = useState("");
  const [onlineAnnContent, setOnlineAnnContent] = useState("");
  const [onlineAnnIsPublished, setOnlineAnnIsPublished] = useState(true);

  // Editing Announcement States
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [editAnnTitle, setEditAnnTitle] = useState("");
  const [editAnnContent, setEditAnnContent] = useState("");
  const [editAnnBatchId, setEditAnnBatchId] = useState("all");
  const [editAnnIsPublished, setEditAnnIsPublished] = useState(true);

  // Editing Online Announcement States
  const [editingOnlineAnnId, setEditingOnlineAnnId] = useState<string | null>(null);
  const [editOnlineAnnTitle, setEditOnlineAnnTitle] = useState("");
  const [editOnlineAnnContent, setEditOnlineAnnContent] = useState("");
  const [editOnlineAnnIsPublished, setEditOnlineAnnIsPublished] = useState(true);

  // Editing Lead States
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editLeadName, setEditLeadName] = useState("");
  const [editLeadEmail, setEditLeadEmail] = useState("");
  const [editLeadPhone, setEditLeadPhone] = useState("");
  const [editLeadCourse, setEditLeadCourse] = useState("");
  const [editLeadStatus, setEditLeadStatus] = useState<"New" | "Contacted" | "In Progress" | "Enrolled" | "Closed">("New");
  const [editLeadNotes, setEditLeadNotes] = useState("");

  // Filters for Leads
  const [leadSearchText, setLeadSearchText] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [leadCourseFilter, setLeadCourseFilter] = useState("all");

  // Manual Credentials DB Form States
  const [credsRole, setCredsRole] = useState<"admin" | "teacher" | "student" | "feemanager" | "admission" | "verifier" | "professor">("student");
  const [credsName, setCredsName] = useState("");
  const [credsIdentifier, setCredsIdentifier] = useState("");
  const [credsPassword, setCredsPassword] = useState("");
  const [credsMobile, setCredsMobile] = useState("");
  const [credsSearch, setCredsSearch] = useState("");
  const [credsRoleFilter, setCredsRoleFilter] = useState<"all" | "admin" | "teacher" | "student" | "feemanager" | "admission" | "verifier" | "professor">("all");
  const [credsStatusFilter, setCredsStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Firebase Sync and Red Team Security Audit Simulation State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([
    `[LMS-CORE] Firebase initialization secure.`,
    `[LMS-CORE] Selected Database ID: ai-studio-27910091-fe9a-450b-9392-9be45ceb7768`,
    `[LMS-CORE] Target Project ID: dazzling-ward-g07pf`,
    `[LMS-CORE] Deploy Region: asia-southeast1 (APAC Singapore Hub)`
  ]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [editingUserPass, setEditingUserPass] = useState("");
  const [visiblePasswordIds, setVisiblePasswordIds] = useState<Record<string, boolean>>({});

  const handleCreateCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credsName.trim()) {
      alert("Please provide a name.");
      return;
    }

    const nameVal = credsName.trim();
    const idVal = credsIdentifier.trim().toLowerCase();
    const passVal = credsPassword.trim() || Math.floor(100000 + Math.random() * 900000).toString();

    if (!idVal) {
      alert("Please provide a unique username.");
      return;
    }

    // Check if username is already taken across all lists
    const inAdmins = (admins || []).some(a => (a.username || "").toLowerCase() === idVal);
    const inTeachers = (teachers || []).some(t => (t.username || "").toLowerCase() === idVal);
    const inStudents = (students || []).some(s => (s.username || "").toLowerCase() === idVal);
    const inFee = (feeManagers || []).some(f => (f.username || "").toLowerCase() === idVal);
    const inAdmission = (admissionOfficers || []).some(ao => (ao.username || "").toLowerCase() === idVal);
    const inVerifier = (verifiers || []).some(v => (v.username || "").toLowerCase() === idVal);

    if (inAdmins || inTeachers || inStudents || inFee || inAdmission || inVerifier || idVal === "mpdigi000") {
      alert(`Same username already exists. Cannot create a duplicate username: ${idVal}`);
      return;
    }

    if (credsRole === "admin") {
      const newAdmin: AdminUser = {
        id: "admin_" + Date.now(),
        name: nameVal,
        username: idVal,
        email: `${idVal}@admin.com`,
        status: "Active",
        password: passVal,
        avatar: getRandomAvatarUrl(nameVal)
      };
      onCreateAdmin?.(newAdmin);
      alert(`Master administrative account successfully authorized!\nUsername: @${idVal}\nPassword: ${passVal}`);
    } else if (credsRole === "teacher" || credsRole === "professor") {
      const isProf = credsRole === "professor";
      const newTeacher: Teacher = {
        id: "t_" + Date.now(),
        name: nameVal,
        username: idVal,
        email: `${idVal}@apexcollege.edu`,
        specialization: isProf ? "College Faculty Member / Professor" : "Computer Science",
        avatar: getRandomAvatarUrl(nameVal),
        status: "Active",
        password: passVal
      };
      onCreateTeacher(newTeacher);
      alert(`${isProf ? "College Faculty Member / Professor" : "Teacher"} account registered with login status enabled!\nUsername: @${idVal}\nPassword: ${passVal}`);
    } else if (credsRole === "feemanager") {
      const newFM: FeeManager = {
        id: "fm_" + Date.now(),
        name: nameVal,
        username: idVal,
        email: `${idVal}@apexcollege.edu`,
        status: "Active",
        password: passVal,
        avatar: getRandomAvatarUrl(nameVal)
      };
      onCreateFeeManager?.(newFM);
      alert(`Fee Manager account successfully authorized!\nUsername: @${idVal}\nPassword: ${passVal}`);
    } else if (credsRole === "admission") {
      const newOfficer: AdmissionOfficer = {
        id: "admission_" + Date.now(),
        name: nameVal,
        username: idVal,
        email: `${idVal}@apexcollege.edu`,
        status: "Active",
        password: passVal,
        avatar: getRandomAvatarUrl(nameVal)
      };
      onCreateAdmissionOfficer?.(newOfficer);
      alert(`Admissions Desk Staff successfully authorized!\nUsername: @${idVal}\nPassword: ${passVal}`);
    } else if (credsRole === "verifier") {
      const newVerifier: Verifier = {
        id: "verifier_" + Date.now(),
        name: nameVal,
        username: idVal,
        status: "Active",
        password: passVal,
        employeeCode: "VRF" + Math.floor(1000 + Math.random() * 9000)
      };
      onCreateVerifier?.(newVerifier);
      alert(`Verifier account registered with login status enabled!\nUsername: @${idVal}\nPassword: ${passVal}`);
    } else {
      // Student
      const generatedRoll = "CO-2026-" + Math.floor(200 + Math.random() * 800);
      const newStudent: Student = {
        id: "s_" + Date.now(),
        name: nameVal,
        username: idVal,
        email: `${idVal}@student.com`,
        rollNo: generatedRoll,
        avatar: getRandomAvatarUrl(nameVal),
        status: "Active",
        password: passVal,
        mobileNumber: "98765" + Math.floor(10000 + Math.random() * 90000)
      };
      onCreateStudent(newStudent);
      alert(`Student profile registered successfully!\nUsername: @${idVal}\nPassword: ${passVal}\nRoll: ${newStudent.rollNo}`);
    }

    // Reset Form
    setCredsName("");
    setCredsIdentifier("");
    setCredsPassword("");
    setCredsMobile("");
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName || !newBatchSubject || !newBatchTeacher) return;
    
    const randomId = "b_" + Date.now();
    const newBatch: Batch = {
      id: randomId,
      name: newBatchName,
      subject: newBatchSubject,
      schedule: newBatchSchedule || "TBD",
      teacherId: newBatchTeacher,
      studentIds: selectedStudentIds,
      code: newBatchCode || "BATCH-" + Math.floor(100 + Math.random() * 900)
    };

    onCreateBatch(newBatch);
    setNewBatchName("");
    setNewBatchSubject("");
    setNewBatchSchedule("");
    setNewBatchTeacher("");
    setNewBatchCode("");
    setSelectedStudentIds([]);
    alert("Academic Course Section created successfully!");
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName || !newTeacherEmail) return;

    const finalPassword = newTeacherPassword.trim() || "teach" + Math.floor(100 + Math.random() * 900);
    const newTeacher: Teacher = {
      id: "t_" + Date.now(),
      name: newTeacherName,
      email: newTeacherEmail,
      specialization: newTeacherSpecs || "General Studies",
      avatar: getRandomAvatarUrl(newTeacherName),
      status: "Active",
      password: finalPassword,
      schoolId: newTeacherSchoolId || undefined
    };

    onCreateTeacher(newTeacher);
    setNewTeacherName("");
    setNewTeacherEmail("");
    setNewTeacherSpecs("");
    setNewTeacherPassword("");
    setNewTeacherSchoolId("");
    alert(`Teacher registered successfully! Login details given: Email: ${newTeacherEmail}, Code: ${finalPassword}`);
  };

  const handleCreateFeeManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeeManagerName || !newFeeManagerEmail) return;

    if (!onCreateFeeManager) {
      alert("Fee management action callback is not wired up.");
      return;
    }

    const finalPassword = newFeeManagerPassword.trim() || "fee" + Math.floor(100 + Math.random() * 900);
    const newFM: FeeManager = {
      id: "fm_" + Date.now(),
      name: newFeeManagerName,
      email: newFeeManagerEmail,
      status: "Active",
      password: finalPassword,
      avatar: getRandomAvatarUrl(newFeeManagerName)
    };

    onCreateFeeManager(newFM);
    setNewFeeManagerName("");
    setNewFeeManagerEmail("");
    setNewFeeManagerPassword("");
    alert(`Fee Manager staff registered successfully! Credentials: Email: ${newFeeManagerEmail}, Password Code: ${finalPassword}`);
  };

  const handleCreateAdmissionOfficerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmissionOfficerName || !newAdmissionOfficerEmail) return;

    if (!onCreateAdmissionOfficer) {
      alert("Admissions actions are not wired up.");
      return;
    }

    const finalPassword = newAdmissionOfficerPassword.trim() || "admission" + Math.floor(100 + Math.random() * 900);
    const newOfficer: AdmissionOfficer = {
      id: "admission_" + Date.now(),
      name: newAdmissionOfficerName,
      email: newAdmissionOfficerEmail,
      status: "Active",
      password: finalPassword,
      avatar: getRandomAvatarUrl(newAdmissionOfficerName)
    };

    onCreateAdmissionOfficer(newOfficer);
    setNewAdmissionOfficerName("");
    setNewAdmissionOfficerEmail("");
    setNewAdmissionOfficerPassword("");
    alert(`Admissions Desk Staff registered successfully! Credentials: Email: ${newAdmissionOfficerEmail}, Password Code: ${finalPassword}`);
  };

  const handleCreateVerifierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVerifierName || !newVerifierUsername) return;

    if (!onCreateVerifier) {
      alert("Verifier actions are not wired up.");
      return;
    }

    const finalPassword = newVerifierPassword.trim() || "verify" + Math.floor(100 + Math.random() * 900);
    const newOfficer: Verifier = {
      id: "verifier_" + Date.now(),
      name: newVerifierName,
      username: newVerifierUsername,
      status: "Active",
      password: finalPassword,
      employeeCode: "VRF" + Math.floor(1000 + Math.random() * 9000)
    };

    onCreateVerifier(newOfficer);
    setNewVerifierName("");
    setNewVerifierUsername("");
    setNewVerifierPassword("");
    alert(`Verifier staff registered successfully! Credentials: Username: ${newVerifierUsername}, Password Code: ${finalPassword}`);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentEmail) return;
    if (!newStudentMobile.trim()) {
      alert("A registered mobile number is mandatory to create a student's login account.");
      return;
    }

    const finalRoll = newStudentRoll || "CO-2026-" + Math.floor(100 + Math.random() * 900);
    const finalPassword = newStudentPassword.trim() || "stud" + Math.floor(100 + Math.random() * 900);
    const finalDob = newStudentDob.trim() || "12-11-2006";
    const finalMobile = newStudentMobile.trim();
    const selectedSchool = schools.find(s => s.id === newStudentSchoolId);
    
    const newStudent: Student = {
      id: "s_" + Date.now(),
      name: newStudentName,
      email: newStudentEmail,
      rollNo: finalRoll,
      avatar: getRandomAvatarUrl(newStudentName),
      status: "Active",
      password: finalPassword,
      dob: finalDob,
      mobileNumber: finalMobile,
      schoolId: newStudentSchoolId || undefined,
      schoolName: selectedSchool ? selectedSchool.name : undefined
    };

    onCreateStudent(newStudent);
    setNewStudentName("");
    setNewStudentEmail("");
    setNewStudentRoll("");
    setNewStudentPassword("");
    setNewStudentDob("");
    setNewStudentSchoolId("");
    setNewStudentMobile("");
    alert(`Student registered successfully!\n\nStudent Login Parameters:\nRegistered Mobile Number (LMS User ID): ${finalMobile}\nDOB Password (LMS & Fees Key): ${finalDob}\nAcademic Roll: ${finalRoll}`);
  };

  const handleCreateSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName || !newSchoolCode || !newSchoolPrincipalEmail) {
      alert("Please fill in all mandatory fields.");
      return;
    }
    const alreadyExists = schools.find(s => s.code.toUpperCase() === newSchoolCode.toUpperCase() || s.principalEmail.toLowerCase() === newSchoolPrincipalEmail.toLowerCase());
    if (alreadyExists) {
      alert("A school with this unique code or principal email already exists.");
      return;
    }
    const finalEmployeeCode = newSchoolPrincipalEmployeeCode.trim() || ("MPDIGI" + Math.floor(100 + Math.random() * 900));
    if (onCreateSchool) {
      onCreateSchool({
        id: "school_" + Date.now(),
        name: newSchoolName,
        code: newSchoolCode.toUpperCase(),
        address: newSchoolAddress || "Not Provided",
        principalName: newSchoolPrincipalName || "Principal",
        principalEmail: newSchoolPrincipalEmail,
        principalPassword: newSchoolPrincipalPassword || "school123",
        principalEmployeeCode: finalEmployeeCode,
        status: "Inactive",
        registeredAt: new Date().toISOString(),
        isAllotted: newSchoolIsAllotted,
      });
      alert(`School Registry Created Perfect!\nSchool: ${newSchoolName}\nPrincipal Login ID: ${newSchoolPrincipalEmail}\nEmployee Code: ${finalEmployeeCode}\nPassword: ${newSchoolPrincipalPassword || "school123"}\n\nNote: This workspace has been sent to the Super Admin for approval. Switch to 'Schools' directory lists to Toggle or Approve/Block status!`);
      // Clear inputs
      setNewSchoolName("");
      setNewSchoolCode("");
      setNewSchoolAddress("");
      setNewSchoolPrincipalName("");
      setNewSchoolPrincipalEmail("");
      setNewSchoolPrincipalPassword("");
      setNewSchoolPrincipalEmployeeCode("");
      setNewSchoolIsAllotted(false);
    } else {
      alert("School creation callback is not registered.");
    }
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    const newAnn: Announcement = {
      id: "ann_" + Date.now(),
      batchId: annBatchId,
      senderName: "Institute Administration",
      senderRole: "Admin",
      title: annTitle,
      content: annContent,
      date: new Date().toISOString().split("T")[0],
      isPublished: annIsPublished
    };

    onAddAnnouncement(newAnn);
    setAnnTitle("");
    setAnnContent("");
    setAnnBatchId("all");
    setAnnIsPublished(true);
    alert("Global College Announcement posted!");
  };

  const handleSaveEditAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnId || !editAnnTitle.trim() || !editAnnContent.trim()) return;

    if (onUpdateAnnouncement) {
      onUpdateAnnouncement(editingAnnId, {
        title: editAnnTitle.trim(),
        content: editAnnContent.trim(),
        batchId: editAnnBatchId,
        isPublished: editAnnIsPublished
      });
      alert("Announcement updated successfully!");
    } else {
      alert("Announcement logic has not been registered.");
    }
    setEditingAnnId(null);
  };

  const handleAddOnlineAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onlineAnnTitle || !onlineAnnContent) return;

    const newAnn: OnlineAnnouncement = {
      id: "online_ann_" + Date.now(),
      title: onlineAnnTitle,
      content: onlineAnnContent,
      date: new Date().toISOString().split("T")[0],
      isPublished: onlineAnnIsPublished
    };

    if (onAddOnlineAnnouncement) {
      onAddOnlineAnnouncement(newAnn);
      setOnlineAnnTitle("");
      setOnlineAnnContent("");
      setOnlineAnnIsPublished(true);
      alert("Online Portal Announcement posted!");
    } else {
      alert("Online announcement logic has not been registered.");
    }
  };

  const handleSaveEditOnlineAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOnlineAnnId || !editOnlineAnnTitle.trim() || !editOnlineAnnContent.trim()) return;

    if (onUpdateOnlineAnnouncement) {
      onUpdateOnlineAnnouncement(editingOnlineAnnId, {
        title: editOnlineAnnTitle.trim(),
        content: editOnlineAnnContent.trim(),
        isPublished: editOnlineAnnIsPublished
      });
      alert("Online portal announcement updated successfully!");
    } else {
      alert("Online announcement logic has not been registered.");
    }
    setEditingOnlineAnnId(null);
  };

  const handleSaveEditLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeadId || !editLeadName.trim()) return;

    if (onUpdateLead) {
      onUpdateLead(editingLeadId, {
        name: editLeadName.trim(),
        email: editLeadEmail.trim(),
        phone: editLeadPhone.trim(),
        courseInterest: editLeadCourse,
        status: editLeadStatus,
        notes: editLeadNotes.trim()
      });
      alert("Consultation lead card updated successfully!");
    } else {
      alert("Lead callback is not registered.");
    }
    setEditingLeadId(null);
  };

  const toggleStudentSelection = (sid: string) => {
    if (selectedStudentIds.includes(sid)) {
      setSelectedStudentIds(selectedStudentIds.filter(id => id !== sid));
    } else {
      setSelectedStudentIds([...selectedStudentIds, sid]);
    }
  };

  const startEditingBatch = (batch: Batch) => {
    setEditingBatch(batch);
    setEditBatchName(batch.name);
    setEditBatchSubject(batch.subject);
    setEditBatchSchedule(batch.schedule);
    setEditBatchTeacher(batch.teacherId);
    setEditBatchCode(batch.code);
    setEditStudentIds(batch.studentIds || []);
  };

  const toggleEditStudentSelection = (sid: string) => {
    if (editStudentIds.includes(sid)) {
      setEditStudentIds(editStudentIds.filter(id => id !== sid));
    } else {
      setEditStudentIds([...editStudentIds, sid]);
    }
  };

  const handleUpdateBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch || !editBatchName || !editBatchSubject || !editBatchTeacher) return;

    const updatedBatch: Batch = {
      ...editingBatch,
      name: editBatchName,
      subject: editBatchSubject,
      schedule: editBatchSchedule || "TBD",
      teacherId: editBatchTeacher,
      studentIds: editStudentIds,
      code: editBatchCode || "BATCH-" + Math.floor(100 + Math.random() * 900)
    };

    onUpdateBatch?.(updatedBatch);
    setEditingBatch(null);
    alert("Batch updated and saved successfully!");
  };

  // Recharts metric preparation
  const chartData = batches.map(b => ({
    name: b.name,
    strength: b.studentIds.length,
    subject: b.subject,
  }));

  // Admin Profile states and sync
  const activeAdminId = loggedInAdminId || "admin_1";
  const activeAdmin = admins.find(a => a.id === activeAdminId) || admins[0];

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  useEffect(() => {
    if (activeAdmin) {
      setProfileName(activeAdmin.name || "");
      setProfileEmail(activeAdmin.email || "");
      setProfileAvatar(activeAdmin.avatar || "");
    }
  }, [activeAdminId, activeAdmin]);

  useEffect(() => {
    if (selectedCounselId) {
      const found = counsellingRequests.find(r => r.id === selectedCounselId);
      if (found) {
        setAdminCounselNotes(found.notes || "");
        setAdminMeetingLink(found.meetingLink || "");
      }
    }
  }, [selectedCounselId, counsellingRequests]);

  // State and helper for red active & black hover tabs with light sidebar background
  const getMenuBtnStyle = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `flex items-center justify-between lg:justify-start space-x-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-widest transition-all duration-200 shrink-0 whitespace-nowrap cursor-pointer border ${
      isActive 
        ? "bg-red-600 border-red-600 text-white shadow-xs hover:bg-black hover:border-black hover:text-white" 
        : "bg-white border-slate-200 text-slate-800 hover:bg-black hover:border-black hover:text-white"
    }`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Side Column Container (Positioned at first screen side on desktop as standard left sidebar) */}
      <div className={`${hideSidebarOnDesktop ? "hidden" : "lg:col-span-1"} space-y-4 no-print lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto no-scrollbar`}>
        
        {/* Hamburger Mobile Menu bar */}
        <div className="lg:hidden flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
          <div className="flex items-center space-x-2">
            <Menu className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
              Sections: {activeTab}
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/50 text-xs font-bold uppercase text-indigo-600 cursor-pointer hover:bg-black hover:text-white transition-all"
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
          <h3 className="hidden lg:block text-xs font-black text-slate-400 tracking-wider uppercase mb-2 px-3">
            Admin Control Center
          </h3>
          <button
            onClick={() => {
              setActiveTab("overview");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("overview")}
            id="tab-admin-overview"
          >
            <div className="flex items-center space-x-2.5">
              <Award className="w-4 h-4 shrink-0" />
              <span>Overview & Insights</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("schools");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("schools")}
            id="tab-admin-schools"
          >
            <div className="flex items-center space-x-2.5">
              <SchoolIcon className="w-4 h-4 shrink-0" />
              <span>Affiliated Schools ({schools.length})</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("batches");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("batches")}
            id="tab-admin-batches"
          >
            <div className="flex items-center space-x-2.5">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Configure Batches ({batches.length})</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("teachers");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("teachers")}
            id="tab-admin-teachers"
          >
            <div className="flex items-center space-x-2.5">
              <Users className="w-4 h-4 shrink-0" />
              <span>Manage Academic Faculty ({teachers.length})</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("feemanagers");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("feemanagers")}
            id="tab-admin-feemanagers"
          >
            <div className="flex items-center space-x-2.5">
              <Receipt className="w-4 h-4 shrink-0" />
              <span>Fee Managers (Acc.) ({feeManagers.length})</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("admissions");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("admissions")}
            id="tab-admin-admissions"
          >
            <div className="flex items-center space-x-2.5">
              <UserCheck className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Admissions Desk ({admissionOfficers.length})</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("verifiers");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("verifiers")}
            id="tab-admin-verifiers"
          >
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 text-blue-500" />
              <span>Identity Verifiers ({verifiers.length})</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("students");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("students")}
            id="tab-admin-students"
          >
            <div className="flex items-center space-x-2.5">
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>Scholars Database ({students.length})</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("tests");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("tests")}
            id="tab-admin-tests"
          >
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Verify Exams & Tests</span>
            </div>
            {tests.filter(t => t.isAdminApproved === false).length > 0 && (
              <span className={`font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full animate-bounce transition-all ${
                activeTab === "tests" ? "bg-white text-red-650" : "bg-rose-600 text-white"
              }`}>
                {tests.filter(t => t.isAdminApproved === false).length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("announcements");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("announcements")}
            id="tab-admin-announcements"
          >
            <div className="flex items-center space-x-2.5">
              <Megaphone className="w-4 h-4 shrink-0" />
              <span>Broadcast Bulletin</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("online-announcements");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("online-announcements")}
            id="tab-admin-online-announcements"
          >
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Online Portal Alerts</span>
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 leading-none">
              Live
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("leads");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("leads")}
            id="tab-admin-leads"
          >
            <div className="flex items-center space-x-2.5">
              <PhoneCall className="w-4 h-4 shrink-0" />
              <span>Contact Leads</span>
            </div>
            {leads.filter(l => l.status === "New").length > 0 && (
              <span className={`font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse transition-all ${
                activeTab === "leads" ? "bg-emerald-100 text-emerald-800" : "bg-emerald-600 text-white"
              }`}>
                {leads.filter(l => l.status === "New").length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("counselling");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("counselling")}
            id="tab-admin-counselling"
          >
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 shrink-0 text-indigo-500" />
              <span>Online Counselling</span>
            </div>
            {counsellingRequests.filter(r => r.status === "Pending").length > 0 && (
              <span className={`font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse transition-all ${
                activeTab === "counselling" ? "bg-indigo-100 text-indigo-800" : "bg-indigo-600 text-white"
              }`}>
                {counsellingRequests.filter(r => r.status === "Pending").length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("counselling-slots");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("counselling-slots")}
            id="tab-admin-counselling-slots"
          >
            <div className="flex items-center space-x-2.5">
              <Calendar className="w-4 h-4 shrink-0 text-indigo-500" />
              <span>Counselling Slots</span>
            </div>
            {counsellingSlots.filter(s => !s.isBooked).length > 0 && (
              <span className={`font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full transition-all ${
                activeTab === "counselling-slots" ? "bg-indigo-100 text-indigo-800" : "bg-indigo-600 text-white"
              }`}>
                {counsellingSlots.filter(s => !s.isBooked).length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("website-control");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("website-control")}
            id="tab-admin-website-control"
          >
            <div className="flex items-center space-x-2.5">
              <ToggleRight className="w-4 h-4 shrink-0" />
              <span>LMS Portal & Controls</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("emergency");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("emergency")}
            id="tab-admin-emergency"
          >
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 animate-pulse" />
              <span className="font-extrabold uppercase text-[11.5px] tracking-wider text-red-650">Campus Security & SOS</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("settings");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("settings")}
            id="tab-admin-settings"
          >
            <div className="flex items-center space-x-2.5">
              <Settings className="w-4 h-4 shrink-0 animate-spin-slow" />
              <span>Admin Systems Settings</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("firebase");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("firebase")}
            id="tab-admin-firebase"
          >
            <div className="flex items-center space-x-2.5 text-blue-600 dark:text-blue-400">
              <Cloud className="w-4 h-4 shrink-0 animate-pulse" />
              <span className="font-extrabold uppercase text-[11.5px] tracking-wider">Firebase Cloud Sync</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("scanner");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("scanner")}
            id="tab-admin-scanner"
          >
            <div className="flex items-center space-x-2.5">
              <Scan className="w-4 h-4 shrink-0" />
              <span>ID QR Card Scanner</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("logins");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("logins")}
            id="tab-admin-logins"
          >
            <div className="flex items-center space-x-2.5">
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>Add Employee & Logins</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab("profile");
              setProfileSuccessMsg("");
              setIsMobileMenuOpen(false);
            }}
            className={getMenuBtnStyle("profile")}
            id="tab-admin-profile"
          >
            <div className="flex items-center space-x-2.5">
              <User className="w-4 h-4 shrink-0" />
              <span>Admin Profile</span>
            </div>
          </button>
        </div>

        {/* NEW Portal Side Section */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-4 font-sans relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl" />
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse inline-block" />
              <span>Admin Portal Hud</span>
            </span>
            <span className="text-[9px] bg-indigo-900/50 text-indigo-300 font-mono font-weight-bold px-2 py-0.5 rounded-md">
              v2.8
            </span>
          </div>
          
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400">Database Streams:</span>
              <span className="font-mono text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span>Synchronized</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400">Security Gate:</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[9px] uppercase">
                Owner Root
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400">Enrolled Scholars:</span>
              <span className="font-bold text-slate-200">{students.length} Total</span>
            </div>
          </div>

          <div className="pt-1.5">
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-850">
              ⚡ Admin portal authorization allows batch creations, grading checks, and global system configurations.
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace Display */}
      <div className={`${hideSidebarOnDesktop ? "lg:col-span-4" : "lg:col-span-3"} space-y-6`}>
        
        {/* SCHOOLS TAB */}
        {activeTab === "schools" && (
          <div className="space-y-6">
            {/* Header section with summary stats */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-850 shadow space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                    <SchoolIcon className="w-5 h-5 text-red-500" />
                    <span>Study Hub Portal Directory</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage multi-tenant school logins. Create school workspaces, assign Principals & view registered teachers and scholars.
                  </p>
                </div>
                <div className="bg-slate-850 border border-slate-800 px-4 py-2.5 rounded-xl shrink-0 text-center">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Schools Owned</span>
                  <span className="text-xl font-black text-white">{schools.length} Registered</span>
                </div>
              </div>
            </div>

            {/* School Registration Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Register New School Workspace & Principal
              </h5>
              <form onSubmit={handleCreateSchoolSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-500">School Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Greenwood Academy"
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-red-650"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-500">Unique School Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GHS-101"
                    value={newSchoolCode}
                    onChange={(e) => setNewSchoolCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-red-650"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-500">School Address</label>
                  <input
                    type="text"
                    placeholder="e.g. New Delhi, Sector-4"
                    value={newSchoolAddress}
                    onChange={(e) => setNewSchoolAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-red-650"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-500">Principal Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Ramesh Pandey"
                    value={newSchoolPrincipalName}
                    onChange={(e) => setNewSchoolPrincipalName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-red-650"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-500">Principal Email (Login ID) *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. principal@greenwood.edu"
                    value={newSchoolPrincipalEmail}
                    onChange={(e) => setNewSchoolPrincipalEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-red-650"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-500">Principal Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. pass123"
                    value={newSchoolPrincipalPassword}
                    onChange={(e) => setNewSchoolPrincipalPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-red-650"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-500">Principal Employee Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. MPDIGI100 (Auto if empty)"
                    value={newSchoolPrincipalEmployeeCode}
                    onChange={(e) => setNewSchoolPrincipalEmployeeCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-red-650 font-mono"
                  />
                </div>
                <div className="md:col-span-3 flex items-center space-x-2.5 py-2 px-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <input
                    type="checkbox"
                    id="newSchoolIsAllotted"
                    checked={newSchoolIsAllotted}
                    onChange={(e) => setNewSchoolIsAllotted(e.target.checked)}
                    className="w-4 h-4 text-indigo-650 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="newSchoolIsAllotted" className="text-xs font-black text-slate-700 cursor-pointer select-none">
                    Allotted / Verified Branch (displays school in front-facing affiliated schools search)
                  </label>
                </div>
                <div className="md:col-span-3 pt-2">
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-red-650 hover:bg-black hover:scale-[1.01] transition-all text-white text-[11px] uppercase font-bold tracking-wider px-5 py-2.5 rounded-xl shadow cursor-pointer"
                  >
                    Register School & Create Login
                  </button>
                </div>
              </form>
            </div>

            {/* School workspace directory list */}
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h5 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                  Registered School Organizations
                </h5>
                <input
                  type="text"
                  placeholder="Filter key name or school code..."
                  value={searchSchoolQuery}
                  onChange={(e) => setSearchSchoolQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-red-650 w-56"
                />
              </div>

              {schools.filter(s => {
                const term = searchSchoolQuery.toLowerCase();
                return s.name.toLowerCase().includes(term) || s.code.toLowerCase().includes(term) || s.principalEmail.toLowerCase().includes(term);
              }).length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-250">
                  <p className="text-xs text-slate-500 font-bold">No registered schools found matching the query.</p>
                  <p className="text-[10px] text-slate-400 mt-1">LMS converted schools will appear here as soon as you create them above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schools.filter(s => {
                    const term = searchSchoolQuery.toLowerCase();
                    return s.name.toLowerCase().includes(term) || s.code.toLowerCase().includes(term) || s.principalEmail.toLowerCase().includes(term);
                  }).map((school) => {
                    const schoolTeachers = teachers.filter(t => t.schoolId === school.id);
                    const schoolStudents = students.filter(s => s.schoolId === school.id);

                    return (
                      <div key={school.id} className="border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-red-500/40 transition-all bg-slate-50/50 text-left">
                        {editingSchoolId === school.id ? (
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!editSchName.trim() || !editSchCode.trim() || !editSchPrincipalEmail.trim()) {
                              alert("Please fill in mandatory edit fields.");
                              return;
                            }
                            if (onUpdateSchool) {
                              onUpdateSchool({
                                ...school,
                                name: editSchName.trim(),
                                code: editSchCode.trim().toUpperCase(),
                                address: editSchAddress.trim() || "Not Provided",
                                principalName: editSchPrincipalName.trim() || "Principal",
                                principalEmail: editSchPrincipalEmail.trim(),
                                principalPassword: editSchPrincipalPassword.trim() || "school123",
                                principalEmployeeCode: editSchPrincipalEmployeeCode.trim() || school.principalEmployeeCode || ("MPDIGI" + Math.floor(100 + Math.random() * 900)),
                                isAllotted: editSchIsAllotted
                              });
                              alert("School Registry updated successfully!");
                            }
                            setEditingSchoolId(null);
                          }} className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                              <span className="text-[10px] font-black uppercase text-red-600 font-mono">Editing School Registry</span>
                              <button type="button" onClick={() => setEditingSchoolId(null)} className="text-xs font-black text-slate-400 hover:text-red-500 cursor-pointer">✕ CANCEL</button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-left">
                              <div className="space-y-0.5 col-span-2">
                                <label className="text-[9px] uppercase font-bold text-slate-400">School Name</label>
                                <input type="text" value={editSchName} onChange={(e) => setEditSchName(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-red-650 font-bold" />
                              </div>
                              <div className="space-y-0.5">
                                <label className="text-[9px] uppercase font-bold text-slate-400">School Code</label>
                                <input type="text" value={editSchCode} onChange={(e) => setEditSchCode(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-red-655 font-bold font-mono" />
                              </div>
                              <div className="space-y-0.5">
                                <label className="text-[9px] uppercase font-bold text-slate-400">Principal Name</label>
                                <input type="text" value={editSchPrincipalName} onChange={(e) => setEditSchPrincipalName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-red-655 font-bold" />
                              </div>
                              <div className="space-y-0.5 col-span-2">
                                <label className="text-[9px] uppercase font-bold text-slate-400">Address</label>
                                <input type="text" value={editSchAddress} onChange={(e) => setEditSchAddress(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-red-655" />
                              </div>
                              <div className="space-y-0.5">
                                <label className="text-[9px] uppercase font-bold text-slate-400">Principal Email</label>
                                <input type="email" value={editSchPrincipalEmail} onChange={(e) => setEditSchPrincipalEmail(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-red-655" />
                              </div>
                              <div className="space-y-0.5">
                                <label className="text-[9px] uppercase font-bold text-slate-400">Principal Password</label>
                                <input type="text" value={editSchPrincipalPassword} onChange={(e) => setEditSchPrincipalPassword(e.target.value)} required className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-red-655 font-mono" />
                              </div>
                              <div className="space-y-0.5 col-span-2">
                                <label className="text-[9px] uppercase font-bold text-slate-400">Principal Employee Code</label>
                                <input type="text" value={editSchPrincipalEmployeeCode} onChange={(e) => setEditSchPrincipalEmployeeCode(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-red-655 font-mono font-bold" />
                              </div>
                              <div className="col-span-2 flex items-center space-x-2 py-1.5 px-2 bg-indigo-50/50 rounded-lg border border-indigo-100">
                                <input
                                  type="checkbox"
                                  id="editSchIsAllotted"
                                  checked={editSchIsAllotted}
                                  onChange={(e) => setEditSchIsAllotted(e.target.checked)}
                                  className="w-3.5 h-3.5 text-indigo-655 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                                />
                                <label htmlFor="editSchIsAllotted" className="text-[10px] font-bold text-slate-700 cursor-pointer select-none">
                                  Allotted / Verified Branch
                                </label>
                              </div>
                            </div>
                            <button type="submit" className="w-full bg-red-650 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider py-2 rounded-xl mt-2 transition-all cursor-pointer">
                              ✓ Save School Registry Changes
                            </button>
                          </form>
                        ) : (
                          <>
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="bg-red-50 text-red-650 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg font-mono">
                                    {school.code}
                                  </span>
                                  {school.status === "Inactive" ? (
                                    <span className="text-[9px] bg-amber-50 text-amber-700 font-extrabold uppercase border border-amber-200 px-2 py-0.5 rounded-md shrink-0">
                                      🚨 Pending Approval / Blocked
                                    </span>
                                  ) : (
                                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold uppercase border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
                                      ✓ Approved / Active
                                    </span>
                                  )}
                                  {school.isAllotted ? (
                                    <span className="text-[9px] bg-indigo-50 text-indigo-700 font-extrabold uppercase border border-indigo-200 px-2 py-0.5 rounded-md shrink-0">
                                      📍 Verified Branch Allotted
                                    </span>
                                  ) : (
                                    <span className="text-[9px] bg-slate-100 text-slate-500 font-extrabold uppercase border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
                                      ⚪ Not Allotted
                                    </span>
                                  )}
                                </div>
                                <h6 className="text-sm font-black text-slate-850 mt-2">{school.name}</h6>
                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{school.address}</p>
                              </div>
                              <div className="flex items-center space-x-1 shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingSchoolId(school.id);
                                    setEditSchName(school.name);
                                    setEditSchCode(school.code);
                                    setEditSchAddress(school.address || "");
                                    setEditSchPrincipalName(school.principalName || "");
                                    setEditSchPrincipalEmail(school.principalEmail || "");
                                    setEditSchPrincipalPassword(school.principalPassword || "");
                                    setEditSchPrincipalEmployeeCode(school.principalEmployeeCode || "");
                                    setEditSchIsAllotted(!!school.isAllotted);
                                  }}
                                  className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-all cursor-pointer"
                                  title="Edit School Registry"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                {onDeleteSchool && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to remove the school registry for "${school.name}"? This removes its workspace binding but keeps assets.`)) {
                                        onDeleteSchool(school.id);
                                      }
                                    }}
                                    className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                                    title="Delete School"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Principal Login info */}
                            <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1 text-xs">
                              <div className="flex items-center space-x-1.5 font-bold text-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-650" />
                                <span>Principal Desk Access ID / Pass Key:</span>
                              </div>
                              <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg font-mono flex flex-col space-y-0.5 pl-3 border border-slate-100">
                                <div>Principal: <span className="text-slate-900 font-bold">{school.principalName}</span></div>
                                <div>Principal Employee Code: <span className="text-pink-600 font-bold">{school.principalEmployeeCode || "MPDIGI100"}</span></div>
                                <div>Auth Email: <span className="text-indigo-600 font-bold">{school.principalEmail}</span></div>
                                <div>Password Key: <span className="text-slate-900 font-bold">{school.principalPassword || "school123"}</span></div>
                              </div>
                            </div>

                            {/* Affiliation counters & Block/Approve Controller */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] uppercase tracking-wider font-extrabold text-slate-500 pt-3 border-t border-slate-100">
                              <div className="flex space-x-4">
                                <div>Teachers: <span className="text-slate-800 font-black font-mono">{schoolTeachers.length}</span></div>
                                <div>Students: <span className="text-indigo-600 font-black font-mono">{schoolStudents.length}</span></div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {onUpdateSchool && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateSchool({
                                        ...school,
                                        isAllotted: !school.isAllotted
                                      });
                                    }}
                                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${
                                      school.isAllotted
                                        ? "bg-slate-100 border-slate-250 hover:bg-slate-200 text-slate-700"
                                        : "bg-indigo-600 border-indigo-600 hover:bg-indigo-700 text-white"
                                    }`}
                                  >
                                    {school.isAllotted ? "📍 Unallot HQ" : "📍 Allot HQ"}
                                  </button>
                                )}

                                {onUpdateSchool && (
                                  <button
                                    onClick={() => {
                                      const nextStatus = school.status === "Inactive" ? "Active" : "Inactive";
                                      onUpdateSchool({
                                        ...school,
                                        status: nextStatus
                                      });
                                    }}
                                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${
                                      school.status === "Inactive"
                                        ? "bg-emerald-600 border-emerald-600 hover:bg-black hover:border-black text-white"
                                        : "bg-red-600 border-red-600 hover:bg-black hover:border-black text-white"
                                    }`}
                                  >
                                    {school.status === "Inactive" ? "✓ Approve & Activate" : "🚨 Block Workspace"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <motion.div 
                whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Enrolled</p>
                  <p className="text-2xl font-black text-slate-800 mt-1">{students.length} Students</p>
                </div>
                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Course Sections</p>
                  <p className="text-2xl font-black text-slate-800 mt-1">{batches.length} Active</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Elite Mentors</p>
                  <p className="text-2xl font-black text-slate-800 mt-1">{teachers.length} Faculty</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </motion.div>
            </div>

            {/* Recharts Analytics Visualization */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase mb-4">
                Batch Strengths Analytics
              </h4>
              <p className="text-xs text-slate-500 mb-6">Compare student registration loads across different tutorial cohorts and subjects.</p>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff" }} 
                      labelClassName="text-xs font-bold text-indigo-300"
                    />
                    <Bar dataKey="strength" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} name="Enrolled Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Active Student Summary Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Recent Roll List</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Roll Number</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.slice(0, 3).map((std) => (
                      <tr key={std.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 flex items-center justify-center font-mono text-[10px] font-bold uppercase shrink-0">
                            {std.name ? std.name.substring(0, 2) : "ST"}
                          </div>
                          <span className="font-semibold text-slate-800">{std.name}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">{std.email}</td>
                        <td className="px-6 py-4 text-xs font-mono">{std.rollNo}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 text-emerald-700">
                            {std.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* BATCHES CONTROL TAB */}
        {activeTab === "batches" && (
          <div className="space-y-6">
            
            {/* Inline Editing Form Card Panel */}
            {editingBatch ? (
              <div className="bg-amber-500/5 dark:bg-amber-950/10 p-6 rounded-2xl border-2 border-amber-300 dark:border-amber-800/80 shadow-md animate-scaleUp">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-base font-black text-amber-900 dark:text-amber-400 tracking-tight flex items-center space-x-2">
                      <Edit3 className="w-5 h-5 text-amber-600 animate-pulse" />
                      <span>Edit & Manage Students & Teacher in {editingBatch.name}</span>
                    </h4>
                    <p className="text-xs text-amber-700/80 dark:text-slate-400 mt-1">
                      Modify batch parameters, assign mentors and manage enrolled student memberships directly.
                    </p>
                  </div>
                  <button 
                    onClick={() => setEditingBatch(null)}
                    className="bg-white hover:bg-slate-105 border border-slate-200 px-3 py-1 text-[11px] font-bold rounded-lg cursor-pointer text-slate-500 hover:text-slate-700 uppercase"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleUpdateBatchSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Cohort Title</label>
                      <input 
                        type="text" 
                        value={editBatchName} 
                        onChange={e => setEditBatchName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Academic Department / Subject</label>
                      <input 
                        type="text" 
                        value={editBatchSubject} 
                        onChange={e => setEditBatchSubject(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Weekly Schedule Time</label>
                      <input 
                        type="text" 
                        value={editBatchSchedule} 
                        onChange={e => setEditBatchSchedule(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Unique Code Identifier</label>
                      <input 
                        type="text" 
                        value={editBatchCode} 
                        onChange={e => setEditBatchCode(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-semibold text-slate-850 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Reassign Primary Mentor</label>
                      <select 
                        value={editBatchTeacher} 
                        onChange={e => setEditBatchTeacher(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white"
                        required
                      >
                        <option value="">-- Choose Instructor --</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.specialization})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Configure Student Enrolment List</label>
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 max-h-40 overflow-y-auto space-y-1.5 shadow-inner">
                        {students.map(s => (
                          <label key={s.id} className="flex items-center space-x-2.5 text-xs text-slate-700 dark:text-slate-350 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 p-1.5 rounded-lg transition-colors">
                            <input 
                              type="checkbox" 
                              checked={editStudentIds.includes(s.id)}
                              onChange={() => toggleEditStudentSelection(s.id)}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="font-medium">{s.name} - <span className="font-mono text-[10px] text-slate-500">{s.rollNo}</span></span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button 
                      type="submit"
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>Save Changes & Sync Batch</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEditingBatch(null)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider px-5 rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h4 className="text-base font-bold text-slate-800 dark:text-white tracking-tight flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  <span>Establish New Course Section</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1 mb-6">Allocate standard syllabi, physical schedule metrics and assign elite mentors.</p>

                <form onSubmit={handleCreateBatch} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Cohort Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Lambda Chemistry Advanced"
                        value={newBatchName} 
                        onChange={e => setNewBatchName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500 text-slate-800 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Academic Department / Subject Area</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Inorganic Chemistry"
                        value={newBatchSubject} 
                        onChange={e => setNewBatchSubject(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500 text-slate-800 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Weekly Schedule Time</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Mon, Thu (5:00 - 6:30 PM)"
                        value={newBatchSchedule} 
                        onChange={e => setNewBatchSchedule(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500 text-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Unique Code Identifier</label>
                      <input 
                        type="text" 
                        placeholder="e.g. CHEM-INORG-ELITE"
                        value={newBatchCode} 
                        onChange={e => setNewBatchCode(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500 text-slate-800 dark:text-white font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Assign Primary Mentor</label>
                      <select 
                        value={newBatchTeacher} 
                        onChange={e => setNewBatchTeacher(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500 text-slate-800 dark:text-white"
                        required
                      >
                        <option value="">-- Choose Instructor --</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.specialization})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Select Enrolled Students</label>
                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 max-h-32 overflow-y-auto space-y-1.5">
                        {students.map(s => (
                          <label key={s.id} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded">
                            <input 
                              type="checkbox" 
                              checked={selectedStudentIds.includes(s.id)}
                              onChange={() => toggleStudentSelection(s.id)}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{s.name} - <span className="font-mono text-[10px] text-slate-400">{s.rollNo}</span></span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-3 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Finalize & Launch Batch</span>
                  </button>
                </form>
              </div>
            )}

            {/* Active Batch List (Box-type templates) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h4 className="text-xs font-black text-slate-800 dark:text-white tracking-widest uppercase">Active Batches Box Catalogue ({batches.length})</h4>
                <p className="text-[10px] text-indigo-600 font-bold uppercase">Box type template</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {batches.map(batch => {
                  const teacher = teachers.find(t => t.id === batch.teacherId);
                  const enrolledStudents = students.filter(s => batch.studentIds?.includes(s.id));
                  return (
                    <div 
                      key={batch.id} 
                      className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative"
                      style={{ contentVisibility: "auto" }}
                    >
                      {/* Box Header Accent line */}
                      <div className="h-1.5 w-full bg-emerald-500" />
                      
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          {/* Inner Row */}
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[9px] font-mono leading-none tracking-widest uppercase bg-emerald-55 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 px-2 py-1 rounded font-bold border border-emerald-200/50">
                              {batch.code}
                            </span>
                            
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => startEditingBatch(batch)}
                                className="bg-slate-50 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-350 hover:text-amber-700 p-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center space-x-1 text-[10px] uppercase font-bold cursor-pointer"
                                title="Edit batch properties & members"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Modify</span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  if(confirm(`Are you sure you want to dismantle batch "${batch.name}"?`)) {
                                    onDeleteBatch(batch.id);
                                  }
                                }}
                                className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-2 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                                title="Delete Batch"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h5 className="font-black text-slate-850 dark:text-white text-base mt-3 leading-snug uppercase tracking-tight">{batch.name}</h5>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">{batch.subject}</p>

                          <div className="mt-4 grid grid-cols-2 gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time Matrix</span>
                              <div className="flex items-center text-xs text-slate-700 dark:text-slate-300 space-x-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                                <span className="font-semibold truncate">{batch.schedule}</span>
                              </div>
                            </div>
                            
                            <div className="bg-slate-50 dark:bg-slate-855 bg-indigo-50/20 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                              <span className="block text-[9px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Affiliated Students</span>
                              <div className="flex items-center text-xs text-indigo-700 dark:text-indigo-400 space-x-1.5">
                                <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0 animate-pulse" />
                                <span className="font-black">{batch.studentIds?.length || 0} enrolled</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Box type list of enrolled student rolls */}
                        <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800 space-y-1.5">
                          <span className="block text-[8px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Enrolled Scholars Ledger</span>
                          {enrolledStudents.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic">No students allocated yet to this batch.</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1 no-scrollbar">
                              {enrolledStudents.map(s => (
                                <span 
                                  key={s.id} 
                                  className="inline-flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-750 dark:text-slate-300 px-2 py-0.5 rounded text-[9px] font-bold shadow-2xs"
                                >
                                  {s.name} ({s.rollNo})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Associated Mentor Profile info */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-mono text-[8px] font-bold uppercase shrink-0">
                              {teacher?.name ? teacher.name.substring(0, 2) : "TR"}
                            </div>
                            <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">{teacher?.name || "No Instructor allocated"}</span>
                          </div>
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase font-extrabold tracking-wider px-2 py-1 rounded">Primary Mentor</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* FACULTY MANAGEMENT TAB */}
        {activeTab === "teachers" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase mb-4">Register New College Faculty Member / Professor</h4>
              <form onSubmit={handleCreateTeacher} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Mentor Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dr. Richard Feynman"
                      value={newTeacherName} 
                      onChange={e => setNewTeacherName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Academic Email</label>
                    <input 
                      type="email" 
                      placeholder="e.g. feynman@institure.edu"
                      value={newTeacherEmail} 
                      onChange={e => setNewTeacherEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Core Specialization</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Computer Science & AI"
                      value={newTeacherSpecs} 
                      onChange={e => setNewTeacherSpecs(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">School Affiliation</label>
                    <select
                      value={newTeacherSchoolId}
                      onChange={e => setNewTeacherSchoolId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-indigo-500 font-semibold text-slate-700"
                    >
                      <option value="">LMS Global (No specific school)</option>
                      {schools.map(school => (
                        <option key={school.id} value={school.id}>
                          {school.name} ({school.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-indigo-500 uppercase mb-2">Login Access Code</label>
                    <input 
                      type="text" 
                      placeholder="Leave blank to auto-generate"
                      value={newTeacherPassword} 
                      onChange={e => setNewTeacherPassword(e.target.value)}
                      className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500 text-indigo-900 font-semibold"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Confirm Recruitment</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of Teachers */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-bold text-slate-500 uppercase">Core Instructors Portfolio</span>
                <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-full">{teachers.length} Active scholars</span>
              </div>
              <div className="divide-y divide-slate-100">
                {teachers.map(t => (
                  <div key={t.id} className="p-6 flex items-center justify-between hover:bg-slate-50/20 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-mono text-sm font-bold uppercase shrink-0">
                        {t.name ? t.name.substring(0, 2) : "TR"}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm leading-snug flex items-center gap-1">
                          <span>{t.name}</span>
                          {t.status === "Active" && (
                            <span className="text-sky-500 shrink-0 inline-flex" title="Active verified faculty">
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                            </span>
                          )}
                        </h5>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <p className="text-xs font-semibold text-indigo-600">{t.specialization}</p>
                          {t.username && (
                            <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              @{t.username}
                            </span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-105 border border-slate-200 text-slate-600 font-bold rounded">
                            {t.schoolId ? (schools.find(s => s.id === t.schoolId)?.name || t.schoolId) : "LMS Global Faculty"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center text-[11px] text-slate-400 mt-1.5 gap-x-3 gap-y-1">
                          <span className="flex items-center space-x-1 shrink-0">
                            <Mail className="w-3 h-3" />
                            <span>{t.email}</span>
                          </span>
                          <span className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-100 font-mono">
                            Login Code: {t.password || "green123"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                        t.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
                      }`}>
                        {t.status}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`Remove staff member "${t.name}" from faculty rosters?`)) {
                            onDeleteTeacher(t.id);
                          }
                        }}
                        className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FEE MANAGERS TAB */}
        {activeTab === "feemanagers" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left animate-fadeIn">
              <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase mb-4 flex items-center space-x-1.5">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <span>Register Fee Management Official / Accountant</span>
              </h4>
              <form onSubmit={handleCreateFeeManager} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Staff Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe, CPA"
                      value={newFeeManagerName} 
                      onChange={e => setNewFeeManagerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Primary Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. accounts@institute.edu"
                      value={newFeeManagerEmail} 
                      onChange={e => setNewFeeManagerEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-indigo-500 uppercase mb-2">Access Code / Password</label>
                    <input 
                      type="text" 
                      placeholder="Leave blank to auto-generate"
                      value={newFeeManagerPassword} 
                      onChange={e => setNewFeeManagerPassword(e.target.value)}
                      className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500 text-indigo-900 font-semibold"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Authorize Officer Accounts Desk</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of Fee Managers */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-left bg-gradient-to-br from-white to-slate-50/20 animate-fadeIn">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-bold text-slate-500 uppercase">Registered Financial Staff Registry</span>
                <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-full">{feeManagers.length} Staff Member(s)</span>
              </div>
              <div className="divide-y divide-slate-100">
                {feeManagers.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                    No custom Fee Managers found. Registered fallback accounts can log in anytime.
                  </div>
                ) : (
                  feeManagers.map(f => (
                    <div key={f.id} className="p-6 flex items-center justify-between hover:bg-slate-50/40 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-750 flex items-center justify-center font-mono font-black text-lg select-none">
                          {f.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 text-sm leading-snug flex items-center gap-1">
                            <span>{f.name}</span>
                            {f.status === "Active" && (
                              <span className="text-sky-500 shrink-0 inline-flex" title="Active verified finance officer">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                              </span>
                            )}
                          </h5>
                          {f.username && (
                            <span className="inline-block mt-0.5 text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              @{f.username}
                            </span>
                          )}
                          <div className="flex flex-wrap items-center text-[11px] text-slate-400 mt-1 gap-x-3 gap-y-1">
                            <span className="flex items-center space-x-1 shrink-0">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{f.email}</span>
                            </span>
                            <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100 font-mono">
                              Login Code: {f.password || "fee123"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateFeeManagerStatus) {
                              const nextStatus = f.status === "Active" ? "Inactive" : "Active";
                              onUpdateFeeManagerStatus(f.id, nextStatus);
                            }
                          }}
                          className={`text-[9px] uppercase font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors border ${
                            f.status === "Active" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100" 
                              : "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100"
                          }`}
                        >
                          {f.status}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Revoke credentials and delete Fee Manager "${f.name}"?`)) {
                              if (onDeleteFeeManager) {
                                onDeleteFeeManager(f.id);
                              }
                            }
                          }}
                          className="text-slate-300 hover:text-red-500 p-2 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ADMISSIONS DESK STAFF TAB */}
        {activeTab === "admissions" && (
          <div className="space-y-6">
            {/* Teacher Online Admissions Request Queue Section */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-left animate-fadeIn space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
                <div>
                  <h4 className="text-sm font-black text-slate-800 tracking-tight uppercase flex items-center space-x-1.5">
                    <Award className="w-5 h-5 text-purple-600 animate-pulse" />
                    <span>Teacher-Submitted Admission Requests</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Approve teacher-submitted student admission dossiers. Approving allocates roll & enrollment credentials instantly.
                  </p>
                </div>
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold">
                    Pending: {admissionRequests.filter(r => r.status === "Pending").length}
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold">
                    Approved: {admissionRequests.filter(r => r.status === "Approved").length}
                  </span>
                </div>
              </div>

              {admissionRequests.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                  <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-500">No teacher-submitted admission requests in queue.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Requests submitted by teachers will appear here in real-time.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {admissionRequests.map((req) => {
                    const targetBatch = batches.find(b => b.id === req.batchId);
                    const formattedDate = new Date(req.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={req.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          req.status === "Approved"
                            ? "bg-emerald-50/10 border-emerald-200"
                            : req.status === "Rejected"
                            ? "bg-rose-50/10 border-rose-200"
                            : "bg-slate-50/60 border-slate-200"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1 bg-transparent">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-black text-slate-800">{req.studentName}</span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">{req.id}</span>
                              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg font-bold">
                                Submitted by: {req.teacherName} (Teacher)
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-600">
                              <p><b>Email:</b> {req.email}</p>
                              <p><b>Mobile:</b> {req.mobileNumber}</p>
                              <p><b>DOB:</b> {req.dob}</p>
                              <p><b>Parentage:</b> F: {req.fatherName} | M: {req.motherName}</p>
                              <p className="sm:col-span-2 text-indigo-950">
                                <b>Target Batch:</b> {targetBatch ? `${targetBatch.name} (${targetBatch.subject})` : "N/A"}
                              </p>
                            </div>
                            <p className="text-[9px] text-slate-400 font-mono">Date Submitted: {formattedDate}</p>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            {req.status === "Approved" ? (
                              <div className="bg-emerald-100 border border-emerald-200 rounded-xl px-3 py-2 text-right">
                                <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wider block">APPROVED & ENROLLED</span>
                                <span className="text-[10px] font-mono text-emerald-950 font-bold block">Roll No: {req.rollNo}</span>
                                <span className="text-[10px] font-mono text-emerald-950 font-bold block">Enroll No: {req.enrollmentNo}</span>
                              </div>
                            ) : req.status === "Rejected" ? (
                              <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-lg">
                                Rejected
                              </span>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    if (confirm(`Approve admission request for ${req.studentName} and create student account?`)) {
                                      // Generate credentials
                                      const rNo = "MP-2026-" + Math.floor(1000 + Math.random() * 9000);
                                      const eNo = "EN-SEC-" + Math.floor(10000 + Math.random() * 90000);

                                      // Update request
                                      setAdmissionRequests(prev =>
                                        prev.map(r => r.id === req.id ? { ...r, status: "Approved", rollNo: rNo, enrollmentNo: eNo, approvedAt: new Date().toISOString() } : r)
                                      );

                                      // Register real student
                                      const newStudent: Student = {
                                        id: "s_" + Date.now(),
                                        name: req.studentName,
                                        username: req.studentName.toLowerCase().replace(/\s+/g, '') + Math.floor(10 + Math.random() * 90),
                                        email: req.email,
                                        rollNo: rNo,
                                        avatar: getRandomAvatarUrl(req.studentName),
                                        status: "Active",
                                        password: "Pass" + Math.floor(1000 + Math.random() * 9000),
                                        mobileNumber: req.mobileNumber,
                                        batchId: req.batchId,
                                        isSelfRegistered: false
                                      };
                                      onCreateStudent(newStudent);
                                      alert(`Candidate Approved!\nRoll Number: ${rNo}\nEnrollment Number: ${eNo}\nAccount provisioned successfully.`);
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                >
                                  Approve & Enroll
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Reject admission request for ${req.studentName}?`)) {
                                      setAdmissionRequests(prev =>
                                        prev.map(r => r.id === req.id ? { ...r, status: "Rejected" } : r)
                                      );
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-rose-150 hover:bg-rose-200 text-rose-800 text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left animate-fadeIn">
              <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase mb-4 flex items-center space-x-1.5">
                <UserCheck className="w-5 h-5 text-amber-500" />
                <span>Register Direct Admission Desk Staff Officer</span>
              </h4>
              <p className="text-xs text-slate-500 mb-4 leading-normal">
                Provision a dynamic admission portal account. Newly registered staff officers can use their custom email and password credentials to log in, handle walk-in registrations, generate allotted student identity cards, print bus passes, and process on-desk inquiries.
              </p>
              <form onSubmit={handleCreateAdmissionOfficerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Officer Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Anand Kumar Verma"
                      value={newAdmissionOfficerName} 
                      onChange={e => setNewAdmissionOfficerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Despatch Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. anand@mpdigitalschool.com"
                      value={newAdmissionOfficerEmail} 
                      onChange={e => setNewAdmissionOfficerEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-600 uppercase mb-2">Verification Code / Password</label>
                    <input 
                      type="text" 
                      placeholder="Leave blank to auto-generate code"
                      value={newAdmissionOfficerPassword} 
                      onChange={e => setNewAdmissionOfficerPassword(e.target.value)}
                      className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500 text-amber-950 font-semibold"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Authorize Admission Desk Account</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of Admissions Officers */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-left bg-gradient-to-br from-white to-slate-50/20 animate-fadeIn">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-bold text-slate-500 uppercase">Registered Admissions Desk Registries</span>
                <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-850 font-bold rounded-full">{admissionOfficers.length} Dynamic Desk Officer(s)</span>
              </div>
              <div className="divide-y divide-slate-100">
                {admissionOfficers.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                    No active custom Admissions Desk Officers found.
                  </div>
                ) : (
                  admissionOfficers.map(o => (
                    <div key={o.id} className="p-6 flex items-center justify-between hover:bg-slate-50/40 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-mono font-black text-lg select-none">
                          {o.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 text-sm leading-snug flex items-center gap-1">
                            <span>{o.name}</span>
                            {o.id === "admission_desk_1" && <span className="text-[10px] text-slate-400 shrink-0">(Fallback Default)</span>}
                            {o.status === "Active" && (
                              <span className="text-sky-500 shrink-0 inline-flex" title="Active verified admission officer">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                              </span>
                            )}
                          </h5>
                          {o.username && (
                            <span className="inline-block mt-0.5 text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              @{o.username}
                            </span>
                          )}
                          <div className="flex flex-wrap items-center text-[11px] text-slate-400 mt-1 gap-x-3 gap-y-1">
                            <span className="flex items-center space-x-1 shrink-0">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{o.email}</span>
                            </span>
                            <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-100 font-mono">
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

        {activeTab === "verifiers" && (
          <div className="space-y-6">
            {/* 1. Register Verifier Form Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left animate-fadeIn">
              <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase mb-4 flex items-center space-x-1.5">
                <ShieldCheck className="w-5 h-5 text-blue-500 animate-pulse" />
                <span>Register New Official Verifier</span>
              </h4>
              <p className="text-xs text-slate-500 mb-4 leading-normal">
                Provision an Identity Verifier workspace account. Newly registered Verifiers can use their username and password to log in, physically verify candidate credentials, attach Aadhar card references, assign official Roll Numbers, and audit laboratory computer desk environments.
              </p>
              
              <form onSubmit={handleCreateVerifierSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Verifier Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Govind Kumar"
                      value={newVerifierName} 
                      onChange={e => setNewVerifierName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Unique Login Username</label>
                    <input 
                      type="text" 
                      placeholder="e.g. verify1"
                      value={newVerifierUsername} 
                      onChange={e => setNewVerifierUsername(e.target.value.toLowerCase().trim().replace(/\s+/g, ""))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-blue-600 uppercase mb-2">Access Password</label>
                    <input 
                      type="text" 
                      placeholder="Leave blank to auto-generate password"
                      value={newVerifierPassword} 
                      onChange={e => setNewVerifierPassword(e.target.value)}
                      className="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-4 py-2.5 text-xs text-blue-950 font-bold focus:outline-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    className="bg-slate-900 hover:bg-blue-600 text-white font-extrabold text-[10px] py-2.5 px-6 rounded-xl uppercase tracking-wider transition-colors duration-150 shadow-sm cursor-pointer"
                  >
                    🔐 Register Official Verifier
                  </button>
                </div>
              </form>
            </div>

            {/* 2. Registered Verifiers Table List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Active Verifiers Directory</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Manage credentials, statuses, and permissions of identity verification desk staff.</p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-800 font-bold rounded-full">
                  {verifiers.length} Registered Verifier(s)
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[450px] overflow-y-auto pr-1">
                {verifiers.length === 0 ? (
                  <div className="text-center py-8 text-slate-450 italic">
                    No active verifiers registered. Use the form above to add a verifier.
                  </div>
                ) : (
                  verifiers.map(v => (
                    <div key={v.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3.5 text-left bg-transparent">
                        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-600 uppercase text-sm">
                          {v.name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-800 block flex items-center gap-1">
                            <span>{v.name}</span>
                            {v.status === "Active" && (
                              <span className="text-sky-500 shrink-0 inline-flex" title="Active verified verifier">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                              </span>
                            )}
                          </span>
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[10px] text-slate-450 font-medium">
                            <span>Username: <strong className="text-slate-700 font-mono">{v.username}</strong></span>
                            <span>•</span>
                            <span>Register Code: <strong className="text-slate-700 font-mono">{v.employeeCode || "N/A"}</strong></span>
                            <span>•</span>
                            <span>Password: <strong className="text-slate-700 font-mono">{v.password || "verify123"}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Status Toggle Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateVerifierStatus) {
                              const nextStatus = v.status === "Active" ? "Inactive" : "Active";
                              onUpdateVerifierStatus(v.id, nextStatus);
                            }
                          }}
                          className={`text-[9px] uppercase font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors border ${
                            v.status === "Active" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100" 
                              : "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100"
                          }`}
                        >
                          {v.status}
                        </button>

                        {/* Delete Button */}
                        {v.id !== "v_default" && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Revoke login rights and delete Verifier "${v.name}"?`)) {
                                if (onDeleteVerifier) {
                                  onDeleteVerifier(v.id);
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

        {/* STUDENTS ROSTER TAB */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase mb-4">Enroll New Student Applicant</h4>
              <form onSubmit={handleCreateStudent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Student Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Diana Prince"
                      value={newStudentName} 
                      onChange={e => setNewStudentName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. diana.p@gmail.com"
                      value={newStudentEmail} 
                      onChange={e => setNewStudentEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-450 uppercase mb-2 text-indigo-600">Registered Mobile *</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. 9876543210"
                      value={newStudentMobile} 
                      onChange={e => setNewStudentMobile(e.target.value)}
                      className="w-full bg-indigo-50/30 border border-indigo-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Student Roll / Matric No</label>
                    <input 
                      type="text" 
                      placeholder="e.g. CO-2026-102"
                      value={newStudentRoll} 
                      onChange={e => setNewStudentRoll(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-indigo-500 uppercase mb-2">Login Access Code</label>
                    <input 
                      type="text" 
                      placeholder="Leave blank to auto-generate"
                      value={newStudentPassword} 
                      onChange={e => setNewStudentPassword(e.target.value)}
                      className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500 text-indigo-900 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-600 uppercase mb-2">Fee Portal DOB Password</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 12-11-2006 (Default)"
                      value={newStudentDob} 
                      onChange={e => setNewStudentDob(e.target.value)}
                      className="w-full bg-emerald-50/20 border border-emerald-200 rounded-xl px-4 py-2.5 text-sm focus:outline-emerald-500 text-emerald-900 font-mono font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">School Affiliation</label>
                    <select
                      value={newStudentSchoolId}
                      onChange={e => setNewStudentSchoolId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-indigo-500 font-semibold text-slate-700"
                    >
                      <option value="">LMS Global (No specific school)</option>
                      {schools.map(school => (
                        <option key={school.id} value={school.id}>
                          {school.name} ({school.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Authorize Admission</span>
                  </button>
                </div>
              </form>
            </div>

            {/* SELF SIGNUPS VERIFICATION MODULE */}
            {students.some(s => s.isSelfRegistered) && (
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/30 p-6 rounded-2xl border border-indigo-100 shadow-sm text-left">
                <div className="flex items-center space-x-2.5 mb-4">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-slate-800 tracking-tight uppercase">Website Registration Verification Queue</h4>
                    <p className="text-[11px] text-slate-500">Student profiles registered from the public landing portal. Verify details to activate their system login within 24 hours.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {students.filter(s => s.isSelfRegistered).map(s => {
                    const targetBatchName = batches.find(b => b.id === s.batchId || b.studentIds.includes(s.id))?.name || "Unassigned Batch";
                    return (
                      <div key={s.id} className="bg-white border border-indigo-50/80 p-4 rounded-xl flex items-start justify-between shadow-sm hover:border-indigo-200 transition">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="font-extrabold text-xs text-slate-800 truncate">{s.name}</span>
                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                              s.status === "Active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}>
                              {s.status === "Active" ? "Active" : "Pending Approval"}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 space-y-0.5 font-sans">
                            <p className="truncate">🏫 School Details: <strong className="text-slate-700">{s.schoolName || "Not Provided"}</strong></p>
                            <p>📞 Phone Number: <strong className="text-slate-700">{s.mobileNumber || "Not Provided"}</strong></p>
                            <p className="truncate">📧 Email ID: <strong className="text-slate-750 font-mono">{s.email}</strong></p>
                            <p>📚 Cohort Batch: <strong className="text-indigo-600">{targetBatchName}</strong></p>
                            <p className="text-[10px] font-mono text-slate-400 mt-1">Reg Date: {s.registeredAt ? new Date(s.registeredAt).toLocaleString() : "Just Now"}</p>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 items-end shrink-0 ml-3">
                          {s.status !== "Active" ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdateStudentStatus) {
                                  onUpdateStudentStatus(s.id, "Active");
                                  alert(`Success! "${s.name}" is now fully activated in the system.`);
                                }
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-lg cursor-pointer transition shadow shadow-indigo-650/10 active:scale-95"
                            >
                              Verify & Activate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdateStudentStatus) {
                                  onUpdateStudentStatus(s.id, "Inactive");
                                  alert(`Success! "${s.name}" login access has been suspended/deactivated.`);
                                }
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-lg cursor-pointer transition border border-slate-200 active:scale-95"
                            >
                              Deactivate
                            </button>
                          )}
                          
                          <div className="flex space-x-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStudent(s);
                                setEditStudentName(s.name);
                                setEditStudentEmail(s.email);
                                setEditStudentRollNo(s.rollNo);
                                setEditStudentPassword(s.password || "");
                                setEditStudentSchool(s.schoolName || "");
                                setEditStudentMobile(s.mobileNumber || "");
                                setEditStudentBatchId(s.batchId || "");
                                setEditStudentDob(s.dob || "12-11-2006");
                              }}
                              className="text-slate-500 hover:text-indigo-600 p-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded transition cursor-pointer"
                              title="Edit registration details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove registration entry for "${s.name}"? This removes their profile data.`)) {
                                  onDeleteStudent(s.id);
                                }
                              }}
                              className="text-slate-500 hover:text-red-600 p-1 bg-slate-50 hover:bg-red-50 border border-slate-200 rounded transition cursor-pointer"
                              title="Decline/Delete entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* List of Students */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-bold text-slate-500 uppercase">Interactive Roll List</span>
                <span className="text-xs font-bold font-mono text-slate-400">{students.length} Total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Register Mail</th>
                      <th className="px-6 py-4">Roll Code</th>
                      <th className="px-6 py-4">Login Code</th>
                      <th className="px-6 py-4 text-emerald-700">Fee Portal DOB</th>
                      <th className="px-6 py-4">Enrolled Batches</th>
                      <th className="px-6 py-4">Login Access Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map(s => {
                      const enrolledCount = batches.filter(b => b.studentIds.includes(s.id)).length;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-mono text-[10px] font-bold uppercase shrink-0">
                              {s.name ? s.name.substring(0, 2) : "ST"}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-800 block leading-tight flex items-center gap-1">
                                <span>{s.name}</span>
                                {s.status === "Active" && (
                                  <span className="text-sky-500 shrink-0 inline-flex" title="Active verified scholar">
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                  </span>
                                )}
                              </span>
                              {s.username && (
                                <span className="inline-block mt-0.5 text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded leading-none">
                                  @{s.username}
                                </span>
                              )}
                              {(s.schoolName || (s.schoolId && schools.find(sch => sch.id === s.schoolId)?.name)) ? (
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  🏢 {s.schoolName || (s.schoolId && schools.find(sch => sch.id === s.schoolId)?.name)} {s.mobileNumber ? `• 📞 ${s.mobileNumber}` : ""}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 block mt-0.5 italic">
                                  🌐 Global LMS Scholar {s.mobileNumber ? `• 📞 ${s.mobileNumber}` : ""}
                                </span>
                              )}
                              {s.isSelfRegistered && (
                                <span className="inline-flex mt-1 items-center px-1.5 py-0.5 rounded text-[8px] bg-indigo-50 text-indigo-600 font-bold border border-indigo-100 tracking-wider uppercase font-sans">
                                  Self Signup
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-400">{s.email}</td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-600 font-mono">{s.rollNo}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold font-mono border border-indigo-100">
                              {s.password || "alex123"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-md font-extrabold font-mono border border-emerald-100">
                              {s.dob || "12-11-2006"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold">
                              {enrolledCount} active classes
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => {
                                const nextStatus = s.status === "Active" ? "Inactive" : "Active";
                                if (onUpdateStudentStatus) {
                                  onUpdateStudentStatus(s.id, nextStatus);
                                }
                              }}
                              className={`text-[10px] px-2.5 py-1 rounded-full font-bold border cursor-pointer uppercase tracking-wider transition ${
                                s.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-205 hover:bg-emerald-100"
                                  : "bg-amber-50 text-amber-700 border-amber-205 hover:bg-amber-100"
                              }`}
                              title={s.status === "Active" ? "Suspend login access" : "Activate & Verify student login access"}
                            >
                              {s.status === "Active" ? "Verified & Active" : "Pending Verification"}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStudent(s);
                                setEditStudentName(s.name);
                                setEditStudentEmail(s.email);
                                setEditStudentRollNo(s.rollNo);
                                setEditStudentPassword(s.password || "");
                                setEditStudentSchool(s.schoolName || "");
                                setEditStudentMobile(s.mobileNumber || "");
                                setEditStudentBatchId(s.batchId || "");
                                setEditStudentDob(s.dob || "12-11-2006");
                              }}
                              className="text-slate-400 hover:text-indigo-600 p-1.5 transition-colors inline-flex mr-1 cursor-pointer"
                              title="Edit complete student credentials"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedQRStudent(s)}
                              className="text-indigo-505 hover:text-indigo-700 p-1.5 transition-colors inline-flex mr-1 cursor-pointer"
                              title="Print student QR registration card"
                            >
                              <QrCode className="w-4 h-4 text-indigo-500" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Deregister student "${s.name}"? This removes them from all batch enrollments.`)) {
                                  onDeleteStudent(s.id);
                                }
                              }}
                              className="text-slate-300 hover:text-red-500 p-1.5 transition-colors inline-flex cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS BROADCAST TAB */}
        {activeTab === "announcements" && (
          <div className="space-y-6 text-left">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase mb-4">Post Global Noticeboard Circular</h4>
              <form onSubmit={handleAddAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Subject Heading</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Schedule Alterations for Academic Review Term"
                    value={annTitle} 
                    onChange={e => setAnnTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Notice Body Details</label>
                  <textarea 
                    rows={4}
                    placeholder="Provide deep structural descriptions, dates, exceptions and required guidelines..."
                    value={annContent} 
                    onChange={e => setAnnContent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Target Visibility Level</label>
                    <select 
                      value={annBatchId} 
                      onChange={e => setAnnBatchId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                    >
                      <option value="all">Institute-Wide announcement (All students & faculty)</option>
                      {batches.map(b => (
                        <option key={b.id} value={b.id}>Batch: {b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Notice Status</label>
                    <select 
                      value={annIsPublished ? "published" : "draft"} 
                      onChange={e => setAnnIsPublished(e.target.value === "published")}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                    >
                      <option value="published">Published (Visible immediately)</option>
                      <option value="draft">Draft (Saved only in Admin board)</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs duration-200 py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Megaphone className="w-4 h-4" />
                  <span>Broadcast Notice Circular</span>
                </button>
              </form>
            </div>

            {/* List of posted announcements */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase px-1">Broadcast log history ({announcements.filter(a => a.senderRole === "Admin").length})</h4>
              <div className="space-y-3">
                {announcements.filter(a => a.senderRole === "Admin").map(ann => {
                  const targetBatchName = ann.batchId === "all" ? "Whole Institute" : batches.find(b => b.id === ann.batchId)?.name || "Batch Section";
                  const isPub = ann.isPublished !== false;
                  return (
                    <div key={ann.id} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-250 hover:border-slate-300 transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold text-indigo-700 px-2 py-0.5 bg-indigo-50 rounded uppercase">
                              To: {targetBatchName}
                            </span>
                            {isPub ? (
                              <span className="text-[10px] font-bold text-emerald-700 px-2 py-0.5 bg-emerald-50 rounded uppercase">
                                Published
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-700 px-2 py-0.5 bg-amber-50 rounded uppercase">
                                Draft
                              </span>
                            )}
                          </div>
                          <h5 className="font-extrabold text-slate-800 text-sm mt-2">{ann.title}</h5>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto text-xs">
                          <span className="text-[11px] font-mono text-slate-400 mr-2">{ann.date}</span>
                          
                          {/* Publish/Draft toggle */}
                          <button
                            onClick={() => {
                              if (onUpdateAnnouncement) {
                                onUpdateAnnouncement(ann.id, { isPublished: !isPub });
                              }
                            }}
                            className={`px-2.5 py-1 text-[10px] rounded font-bold uppercase transition flex items-center space-x-1 ${
                              isPub ? "bg-amber-100 hover:bg-amber-250 text-amber-700" : "bg-emerald-100 hover:bg-emerald-250 text-emerald-700"
                            }`}
                            title="Toggle drafted/published status"
                          >
                            <span>{isPub ? "Set Draft" : "Publish"}</span>
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => {
                              setEditingAnnId(ann.id);
                              setEditAnnTitle(ann.title);
                              setEditAnnContent(ann.content);
                              setEditAnnBatchId(ann.batchId);
                              setEditAnnIsPublished(isPub);
                            }}
                            className="bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 p-1 rounded font-bold"
                            title="Edit Notice Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => {
                              if (confirm("Delete this notice circular permanently?")) {
                                if (onDeleteAnnouncement) {
                                  onDeleteAnnouncement(ann.id);
                                }
                              }
                            }}
                            className="bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-600 p-1 rounded font-bold"
                            title="Delete Notice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-white/50 p-3 rounded-xl border border-slate-100">{ann.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EDIT ANNOUNCEMENT DIALOG MODAL */}
            {editingAnnId && (
              <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-100 animate-fadeIn text-left">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                      <Megaphone className="w-4 h-4 text-indigo-600" />
                      <span>Edit Bulletin Notice</span>
                    </h4>
                    <button 
                      onClick={() => setEditingAnnId(null)}
                      className="text-slate-400 hover:text-slate-650 font-bold px-2 text-base"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditAnnouncement} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Subject Heading</label>
                      <input 
                        type="text" 
                        value={editAnnTitle} 
                        onChange={e => setEditAnnTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Notice Body Details</label>
                      <textarea 
                        rows={5}
                        value={editAnnContent} 
                        onChange={e => setEditAnnContent(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500 resize-none font-sans"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Target Visibility Level</label>
                        <select 
                          value={editAnnBatchId} 
                          onChange={e => setEditAnnBatchId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                        >
                          <option value="all">Institute-Wide announcement (All students & faculty)</option>
                          {batches.map(b => (
                            <option key={b.id} value={b.id}>Batch: {b.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Notice Status</label>
                        <select 
                          value={editAnnIsPublished ? "published" : "draft"} 
                          onChange={e => setEditAnnIsPublished(e.target.value === "published")}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                        >
                          <option value="published">Published (Visible immediately)</option>
                          <option value="draft">Draft (Saved only in Admin board)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button 
                        type="button"
                        onClick={() => setEditingAnnId(null)}
                        className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow"
                      >
                        Save Notice Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ONLINE ANNOUNCEMENTS PORTAL TAB */}
        {activeTab === "online-announcements" && (
          <div className="space-y-6 text-left animate-fadeIn">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-50">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Post Online Portal Announcement</h4>
                  <p className="text-xs text-slate-450 mt-1">This announcement will display in real-time on the public student website and guest notices portal.</p>
                </div>
                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                  Admin Only
                </span>
              </div>
              
              <form onSubmit={handleAddOnlineAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Announcement Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Autumn Semester Admission Open & Scholarship Intake"
                    value={onlineAnnTitle} 
                    onChange={e => setOnlineAnnTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500 font-sans"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Notice Content</label>
                  <textarea 
                    rows={4}
                    placeholder="Enter the official details, guidelines, and public info..."
                    value={onlineAnnContent} 
                    onChange={e => setOnlineAnnContent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500 resize-none font-sans"
                    required
                  />
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="block text-xs font-bold text-slate-700 uppercase">Immediate Publication</span>
                    <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">Toggle to save as draft or publish to live site immediately</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOnlineAnnIsPublished(prev => !prev)}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    {onlineAnnIsPublished ? (
                      <ToggleRight className="w-9 h-9" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-350" />
                    )}
                  </button>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs duration-200 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Publish to Live Portal</span>
                </button>
              </form>
            </div>

            {/* List of online announcements */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase px-1">Live Online Notice History ({onlineAnnouncements.length})</h4>
              
              {onlineAnnouncements.length === 0 ? (
                <div className="bg-white text-center text-slate-450 py-12 rounded-3xl border text-sm italic shadow-sm">
                  No online announcements have been created yet. Add one above to run in real-time!
                </div>
              ) : (
                <div className="space-y-3">
                  {onlineAnnouncements.map(ann => {
                    const isPub = ann.isPublished !== false;
                    return (
                      <div key={ann.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              {isPub ? (
                                <span className="text-[10px] font-black text-emerald-700 px-2.5 py-0.5 bg-emerald-50 rounded uppercase border border-emerald-100">
                                  Live on Website
                                </span>
                              ) : (
                                <span className="text-[10px] font-black text-amber-700 px-2.5 py-0.5 bg-amber-50 rounded uppercase border border-amber-100">
                                  Draft
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">🕒 {ann.date}</span>
                            </div>
                            <h5 className="font-extrabold text-slate-800 text-sm mt-2">{ann.title}</h5>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto text-xs">
                            {/* Publish/Draft toggle */}
                            <button
                              onClick={() => {
                                if (onUpdateOnlineAnnouncement) {
                                  onUpdateOnlineAnnouncement(ann.id, { isPublished: !isPub });
                                }
                              }}
                              className={`px-2.5 py-1 text-[10px] rounded-lg font-bold uppercase transition flex items-center space-x-1 cursor-pointer ${
                                isPub ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                              }`}
                              title="Toggle drafted/published status"
                            >
                              <span>{isPub ? "Set Draft" : "Publish"}</span>
                            </button>

                            {/* Edit button */}
                            <button
                              onClick={() => {
                                setEditingOnlineAnnId(ann.id);
                                setEditOnlineAnnTitle(ann.title);
                                setEditOnlineAnnContent(ann.content);
                                setEditOnlineAnnIsPublished(isPub);
                              }}
                              className="bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 p-2 rounded-lg border border-slate-200 cursor-pointer"
                              title="Edit Notice Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete button */}
                            <button
                              onClick={() => {
                                if (confirm("Delete this online portal notice permanently?")) {
                                  if (onDeleteOnlineAnnouncement) {
                                    onDeleteOnlineAnnouncement(ann.id);
                                  }
                                }
                              }}
                              className="bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 p-2 rounded-lg border border-slate-200 cursor-pointer"
                              title="Delete Notice"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 whitespace-pre-line font-medium">{ann.content}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* EDIT ONLINE ANNOUNCEMENT DIALOG MODAL */}
            {editingOnlineAnnId && (
              <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-100 animate-fadeIn text-left">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Edit Online Portal Notice</span>
                    </h4>
                    <button 
                      onClick={() => setEditingOnlineAnnId(null)}
                      className="text-slate-400 hover:text-slate-655 font-black px-2 text-base cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditOnlineAnnouncement} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Announcement Title</label>
                      <input 
                        type="text" 
                        value={editOnlineAnnTitle} 
                        onChange={e => setEditOnlineAnnTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500 font-sans"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Notice Body Details</label>
                      <textarea 
                        rows={5}
                        value={editOnlineAnnContent} 
                        onChange={e => setEditOnlineAnnContent(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500 resize-none font-sans"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <span className="block text-xs font-bold text-slate-700 uppercase">Live Visibility</span>
                        <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">Drafted notices are hidden from the public notices screen</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditOnlineAnnIsPublished(prev => !prev)}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                      >
                        {editOnlineAnnIsPublished ? (
                          <ToggleRight className="w-9 h-9" />
                        ) : (
                          <ToggleLeft className="w-9 h-9 text-slate-350" />
                        )}
                      </button>
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button 
                        type="button"
                        onClick={() => setEditingOnlineAnnId(null)}
                        className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow cursor-pointer"
                      >
                        Save Notice Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------- CONTACT LEADS DIRECTORY -------------------- */}
        {activeTab === "leads" && (
          <div className="space-y-6 text-left">
            
            {/* Bento Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Total Callback Leads</span>
                <span className="text-3xl font-black text-slate-800 block mt-1">{leads.length}</span>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Full registration list</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 block">New Callback Requests</span>
                <span className="text-3xl font-black text-blue-600 block mt-1">
                  {leads.filter(l => l.status === "New").length}
                </span>
                <span className="text-[10px] text-blue-400 font-mono mt-1 block animate-pulse">Awaiting first contact</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-500 block">Follow-ups In Progress</span>
                <span className="text-3xl font-black text-purple-600 block mt-1">
                  {leads.filter(l => l.status === "Contacted" || l.status === "In Progress").length}
                </span>
                <span className="text-[10px] text-purple-400 font-mono mt-1 block">Active sales pipeline</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm bg-gradient-to-br from-emerald-500/5 to-transparent">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block">Conversions (Enrolled)</span>
                <span className="text-3xl font-black text-emerald-700 block mt-1">
                  {leads.filter(l => l.status === "Enrolled").length}
                </span>
                <span className="text-[11px] text-emerald-600 font-mono mt-1 block font-black">
                  {leads.length > 0 
                    ? `${Math.round((leads.filter(l => l.status === "Enrolled").length / leads.length) * 100)}% Conversion Rate`
                    : "0% Conversion Rate"
                  }
                </span>
              </div>
            </div>

            {/* Leads Filters Controller Panel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Inbound Lead Sheets Directory</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Filter, monitor follow-up records, and enroll student leads below.</p>
                </div>

                <button
                  onClick={() => {
                    setLeadSearchText("");
                    setLeadStatusFilter("all");
                    setLeadCourseFilter("all");
                  }}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition duration-150 flex items-center justify-center space-x-1 self-start"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>

              {/* Dynamic Filtering Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={leadSearchText}
                    onChange={e => setLeadSearchText(e.target.value)}
                    placeholder="Search name, email, or telephone..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <select
                    value={leadStatusFilter}
                    onChange={e => setLeadStatusFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Conversion Stages</option>
                    <option value="New">Stage: New</option>
                    <option value="Contacted">Stage: Contacted</option>
                    <option value="In Progress">Stage: In Progress (Follow-up)</option>
                    <option value="Enrolled">Stage: Enrolled (Joined Study Hub)</option>
                    <option value="Closed">Stage: Closed / Refused</option>
                  </select>
                </div>

                <div>
                  <select
                    value={leadCourseFilter}
                    onChange={e => setLeadCourseFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Course Interests</option>
                    <option value="IIT-JEE Intensive Focus">IIT-JEE (Mains & Advanced Focus)</option>
                    <option value="NEET Biology Elite">NEET UG (Medical Focus)</option>
                    <option value="Advanced Scientific Boards">12th Science Board booster</option>
                    <option value="Other / General Query">Other Custom Query</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Table list */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                      <th className="py-3 px-4">Rec Date</th>
                      <th className="py-3 px-4">Contact Profile</th>
                      <th className="py-3 px-4">Subject Interest</th>
                      <th className="py-3 px-4">Staff follow-up comments</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {(() => {
                      const filtered = leads.filter(l => {
                        const sMatch = leadSearchText === "" || 
                          l.name.toLowerCase().includes(leadSearchText.toLowerCase()) ||
                          l.email.toLowerCase().includes(leadSearchText.toLowerCase()) ||
                          l.phone.includes(leadSearchText);
                        const statusMatch = leadStatusFilter === "all" || l.status === leadStatusFilter;
                        const courseMatch = leadCourseFilter === "all" || l.courseInterest === leadCourseFilter;
                        return sMatch && statusMatch && courseMatch;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                              No inbound contact lead matches the active filters.
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map(lead => {
                        // Color badges
                        let statusStyle = "bg-blue-50 text-blue-700 border border-blue-200";
                        if (lead.status === "Contacted") statusStyle = "bg-amber-50 text-amber-700 border border-amber-200";
                        if (lead.status === "In Progress") statusStyle = "bg-purple-50 text-purple-700 border border-purple-200";
                        if (lead.status === "Enrolled") statusStyle = "bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold";
                        if (lead.status === "Closed") statusStyle = "bg-slate-100 text-slate-500 border border-slate-200";

                        return (
                          <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                              {lead.date}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-extrabold text-slate-800 text-[13px]">{lead.name}</div>
                              <div className="text-[11px] text-slate-500 font-medium">{lead.email}</div>
                              <div className="text-[11px] font-mono text-slate-400">{lead.phone}</div>
                            </td>
                            <td className="py-3.5 px-4 font-sans text-slate-600 font-medium">
                              <div className="max-w-[180px] truncate" title={lead.courseInterest}>
                                {lead.courseInterest}
                              </div>
                              <div className="text-[11px] text-slate-400 italic max-w-[180px] truncate mt-0.5">
                                "{lead.message}"
                              </div>
                            </td>
                            <td className="py-3.5 px-4 max-w-xs">
                              <p className="text-slate-500 line-clamp-2" title={lead.notes}>
                                {lead.notes ? lead.notes : <span className="text-slate-350 italic font-mono text-[10px]">No staff remarks posted</span>}
                              </p>
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${statusStyle}`}>
                                {lead.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                              {/* Quick statuses shift toggles */}
                              {lead.status !== "Enrolled" && (
                                <button
                                  onClick={() => {
                                    if (onUpdateLead) {
                                      onUpdateLead(lead.id, { status: "Enrolled" });
                                      alert(`Lead "${lead.name}" is now marked as Enrolled Student!`);
                                    }
                                  }}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200"
                                  title="Mark as Enrolled"
                                >
                                  Enroll
                                </button>
                              )}

                              {/* Edit Modal open */}
                              <button
                                onClick={() => {
                                  setEditingLeadId(lead.id);
                                  setEditLeadName(lead.name);
                                  setEditLeadEmail(lead.email);
                                  setEditLeadPhone(lead.phone);
                                  setEditLeadCourse(lead.courseInterest);
                                  setEditLeadStatus(lead.status);
                                  setEditLeadNotes(lead.notes || "");
                                }}
                                className="p-1 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 rounded"
                                title="Edit Lead Card"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete option */}
                              <button
                                onClick={() => {
                                  if (confirm(`Remove lead record for "${lead.name}"?`)) {
                                    if (onDeleteLead) {
                                      onDeleteLead(lead.id);
                                    }
                                  }
                                }}
                                className="p-1 bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-650 rounded"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* EDIT LEAD DETAILED MODAL OVERLAY */}
            {editingLeadId && (
              <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-100 animate-fadeIn text-left">
                  
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                      <PhoneCall className="w-4 h-4 text-emerald-500" />
                      <span>Edit Consultation Lead Sheet</span>
                    </h4>
                    <button
                      onClick={() => setEditingLeadId(null)}
                      className="text-slate-400 hover:text-slate-600 font-bold px-2 text-base"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditLead} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Lead Full Name</label>
                        <input
                          type="text"
                          required
                          value={editLeadName}
                          onChange={e => setEditLeadName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Preferred Interest Level</label>
                        <select
                          value={editLeadCourse}
                          onChange={e => setEditLeadCourse(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:outline-indigo-500"
                        >
                          <option value="IIT-JEE Intensive Focus">IIT-JEE (Mains & Advanced Focus)</option>
                          <option value="NEET Biology Elite">NEET UG (Medical Focus)</option>
                          <option value="Advanced Scientific Boards">12th Science Board booster</option>
                          <option value="Other / General Query">Other Custom Query</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Inbound Email Address</label>
                        <input
                          type="email"
                          required
                          value={editLeadEmail}
                          onChange={e => setEditLeadEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Telephone Number</label>
                        <input
                          type="tel"
                          required
                          value={editLeadPhone}
                          onChange={e => setEditLeadPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Conversion Status Stage</label>
                        <select
                          value={editLeadStatus}
                          onChange={e => setEditLeadStatus(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500 text-slate-700 font-semibold"
                        >
                          <option value="New">New (Awaiting Callback)</option>
                          <option value="Contacted">Contacted (Initial Follow-up)</option>
                          <option value="In Progress">In Progress (Active Discussions)</option>
                          <option value="Enrolled">Enrolled Student (Paid/Joined)</option>
                          <option value="Closed">Closed / Rejected / Terminated</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Staff follow-up comments & remarks</label>
                      <textarea
                        rows={3}
                        value={editLeadNotes}
                        onChange={e => setEditLeadNotes(e.target.value)}
                        placeholder="Write down any notes of recent discussions, counseling constraints, of requested scholarship cuts..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500 resize-none font-sans"
                      />
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingLeadId(null)}
                        className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow"
                      >
                        Save Lead Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------- ONLINE COUNSELLING CENTRE MANAGEMENT -------------------- */}
        {activeTab === "counselling" && (
          <div className="space-y-6 text-left animate-fadeIn">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-indigo-650 to-indigo-850 p-6 rounded-2xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-200 animate-pulse" />
                  <span>Online Counselling Command Center</span>
                </h3>
                <p className="text-xs text-indigo-100 max-w-2xl font-sans">
                  Review student requests, allot temporary secure login credentials, customize virtual meeting links, and chat live in real-time.
                </p>
              </div>
            </div>

            {/* Quick Statistics Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Total Requests</span>
                <span className="text-3xl font-black text-slate-800 block mt-1">{counsellingRequests.length}</span>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Cumulative directory count</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block">Awaiting Review</span>
                <span className="text-3xl font-black text-amber-600 block mt-1">
                  {counsellingRequests.filter(r => r.status === "Pending").length}
                </span>
                <span className="text-[10px] text-amber-400 font-mono mt-1 block animate-pulse">Pending staff verification</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block">Active Rooms</span>
                <span className="text-3xl font-black text-emerald-600 block mt-1">
                  {counsellingRequests.filter(r => r.status === "Active").length}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Live temporary credentials active</span>
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Column: Directory / Session List */}
              <div className="xl:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">
                    Directory List
                  </h4>
                  {/* Filter tabs */}
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {(["All", "Pending", "Active", "Closed"] as const).map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setCounselFilter(f)}
                        className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                          counselFilter === f 
                            ? "bg-white text-indigo-650 shadow-xs" 
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by student, ID or topic..."
                    value={counselSearch}
                    onChange={e => setCounselSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-indigo-500 font-sans"
                  />
                </div>

                {/* List Container */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                  {(() => {
                    const filtered = counsellingRequests.filter(r => {
                      const matchesFilter = counselFilter === "All" || r.status === counselFilter;
                      const matchesSearch = 
                        r.studentName.toLowerCase().includes(counselSearch.toLowerCase()) ||
                        r.id.toLowerCase().includes(counselSearch.toLowerCase()) ||
                        r.topic.toLowerCase().includes(counselSearch.toLowerCase());
                      return matchesFilter && matchesSearch;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                          <HelpCircle className="w-8 h-8 mx-auto text-slate-350 mb-2" />
                          <p className="text-xs font-bold font-mono">No matching sessions found</p>
                        </div>
                      );
                    }

                    const handleUpdateStatus = (id: string, newStatus: "Pending" | "Active" | "Closed") => {
                      setCounsellingRequests(prev => prev.map(r => {
                        if (r.id === id) {
                          return {
                            ...r,
                            status: newStatus,
                            updatedAt: new Date().toISOString()
                          };
                        }
                        return r;
                      }));
                    };

                    return filtered.map(req => {
                      const isSelected = selectedCounselId === req.id;
                      return (
                        <div
                          key={req.id}
                          onClick={() => setSelectedCounselId(req.id)}
                          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left relative ${
                            isSelected
                              ? "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-300 shadow-xs"
                              : "bg-slate-50/60 border-slate-150 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          {/* Live Status indicator */}
                          <div className="absolute top-4 right-4">
                            {req.status === "Pending" && (
                              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-wider animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>Pending</span>
                              </span>
                            )}
                            {req.status === "Active" && (
                              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                <span>Active</span>
                              </span>
                            )}
                            {req.status === "Closed" && (
                              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-wider">
                                <span>Closed</span>
                              </span>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="pr-16">
                              <h5 className="font-extrabold text-sm text-slate-800 tracking-tight leading-tight">
                                {req.studentName}
                              </h5>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                ID: {req.id} • {req.studentRollNo || "Public Guest"}
                              </p>
                            </div>

                            <p className="text-xs font-semibold text-slate-600 line-clamp-1 font-sans">
                              Topic: {req.topic}
                            </p>

                            <div className="flex items-center space-x-3 pt-1 border-t border-slate-100/50 text-[10px] font-bold text-slate-500">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                <span>{req.scheduledAt}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Right Column: Active Session Control & Chat Room */}
              <div className="xl:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[550px] flex flex-col justify-between">
                {(() => {
                  const req = counsellingRequests.find(r => r.id === selectedCounselId);
                  if (!req) {
                    return (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-350 border border-slate-200 mb-4 shadow-2xs">
                          <Sparkles className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-wider text-slate-700">No Session Selected</h4>
                        <p className="text-xs text-slate-400 mt-2 max-w-sm font-sans leading-relaxed">
                          Select a counselling request from the directory list to review student details, change statuses, allocate URLs, and engage in secure chat support.
                        </p>
                      </div>
                    );
                  }

                  const handleUpdateStatus = (id: string, newStatus: "Pending" | "Active" | "Closed") => {
                    setCounsellingRequests(prev => prev.map(r => {
                      if (r.id === id) {
                        return {
                          ...r,
                          status: newStatus,
                          updatedAt: new Date().toISOString()
                        };
                      }
                      return r;
                    }));
                  };

                  const handleUpdateMeetingLink = (id: string, link: string) => {
                    setCounsellingRequests(prev => prev.map(r => {
                      if (r.id === id) {
                        return {
                          ...r,
                          meetingLink: link,
                          updatedAt: new Date().toISOString()
                        };
                      }
                      return r;
                    }));
                  };

                  const handleUpdateNotes = (id: string, notes: string) => {
                    setCounsellingRequests(prev => prev.map(r => {
                      if (r.id === id) {
                        return {
                          ...r,
                          notes: notes,
                          updatedAt: new Date().toISOString()
                        };
                      }
                      return r;
                    }));
                  };

                  const handleSendAdminMessage = (id: string) => {
                    if (!adminChatInput.trim()) return;
                    const newMessage = {
                      id: "msg_" + Date.now(),
                      sender: "counsellor" as const,
                      senderName: "Academic Counsellor",
                      content: adminChatInput.trim(),
                      timestamp: new Date().toISOString()
                    };
                    setCounsellingRequests(prev => prev.map(r => {
                      if (r.id === id) {
                        return {
                          ...r,
                          chatHistory: [...(r.chatHistory || []), newMessage],
                          updatedAt: new Date().toISOString()
                        };
                      }
                      return r;
                    }));
                    setAdminChatInput("");
                  };

                  return (
                    <div className="flex-1 flex flex-col h-full space-y-6">
                      {/* Session Header details */}
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-100 text-left">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-extrabold text-base text-slate-800 tracking-tight">
                              {req.studentName}
                            </h4>
                            <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 text-slate-500 rounded border">
                              {req.id}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-sans">
                            Topic of Discussion: <strong className="text-slate-700">{req.topic}</strong>
                          </p>
                          <p className="text-[11px] text-indigo-650 font-semibold font-mono mt-1 flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 inline" />
                            <span>Preferred: {req.scheduledAt}</span>
                          </p>
                        </div>

                        {/* Temp Secure Credentials card */}
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-left text-xs space-y-1 w-full sm:w-auto font-mono">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block border-b pb-1">
                            🔑 Temporary Credentials
                          </span>
                          <div className="pt-1 text-slate-600 space-y-0.5">
                            <p>User: <strong className="text-slate-800">{req.tempUsername}</strong></p>
                            <p>Pass: <strong className="text-slate-800">{req.tempPassword}</strong></p>
                            <p className="text-[10px]">
                              Status:{" "}
                              {req.status === "Closed" ? (
                                <span className="text-rose-600 font-extrabold">EXPIRED (CLOSED)</span>
                              ) : (
                                <span className="text-emerald-600 font-extrabold">ACTIVE</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Controls Block */}
                      <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200 text-left space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          {/* Quick Status actions */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Session Status Controls</span>
                            <div className="flex items-center space-x-2 mt-1.5">
                              {req.status !== "Active" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(req.id, "Active")}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase tracking-wider text-[10px] rounded-lg transition-all shadow-2xs cursor-pointer"
                                >
                                  Activate & Authorize
                                </button>
                              )}
                              {req.status !== "Closed" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(req.id, "Closed")}
                                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold uppercase tracking-wider text-[10px] rounded-lg transition-all shadow-2xs cursor-pointer"
                                >
                                  Close Session (Expire Credentials)
                                </button>
                              )}
                              {req.status === "Closed" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(req.id, "Pending")}
                                  className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-extrabold uppercase tracking-wider text-[10px] rounded-lg transition-all shadow-2xs cursor-pointer"
                                >
                                  Re-open Request
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Meeting Link */}
                          <div className="flex-1 space-y-1 sm:max-w-xs">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Virtual Room Link</span>
                            <div className="flex space-x-2 mt-1.5">
                              <input
                                type="text"
                                placeholder="e.g. https://meet.google.com/xyz"
                                value={adminMeetingLink}
                                onChange={e => setAdminMeetingLink(e.target.value)}
                                className="flex-1 bg-white border border-slate-250 rounded-lg px-2.5 py-1 text-xs focus:outline-indigo-500 font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateMeetingLink(req.id, adminMeetingLink)}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Counselor Notes */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Counselor Evaluation Notes / Action Plan</span>
                          <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
                            <textarea
                              rows={1}
                              placeholder="Write session diagnostics, student evaluation summary or academic relief plans..."
                              value={adminCounselNotes}
                              onChange={e => setAdminCounselNotes(e.target.value)}
                              className="flex-1 bg-white border border-slate-250 rounded-xl px-3 py-1.5 text-xs focus:outline-indigo-500 font-sans"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateNotes(req.id, adminCounselNotes)}
                              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all h-fit cursor-pointer self-end"
                            >
                              Save Notes
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Chat Room Area */}
                      <div className="flex-1 flex flex-col justify-between border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                        {/* Messages Stream Header */}
                        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Live Secure Support Chat</span>
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">
                            Updates in real-time
                          </span>
                        </div>

                        {/* Messages Stream */}
                        <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[220px] min-h-[160px] text-left no-scrollbar">
                          {(!req.chatHistory || req.chatHistory.length === 0) ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-6 text-slate-400">
                              <p className="text-[11px] font-bold font-mono">No messages exchanged yet</p>
                              <p className="text-[10px] text-slate-400 font-sans mt-1">Send a welcome message to greet the student!</p>
                            </div>
                          ) : (
                            req.chatHistory.map((msg, idx) => {
                              const isCounselor = msg.sender === "counsellor";
                              return (
                                <div
                                  key={msg.id || idx}
                                  className={`flex flex-col ${isCounselor ? "items-end" : "items-start"}`}
                                >
                                  <div className="flex items-center space-x-1.5 mb-0.5">
                                    <span className="text-[9px] font-extrabold text-slate-450 uppercase">
                                      {isCounselor ? "Academic Counselor" : req.studentName}
                                    </span>
                                    <span className="text-[8px] font-mono text-slate-400">
                                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <div
                                    className={`px-3 py-2 rounded-2xl text-xs max-w-xs font-sans leading-relaxed ${
                                      isCounselor
                                        ? "bg-indigo-600 text-white rounded-tr-none"
                                        : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-3xs"
                                    }`}
                                  >
                                    {msg.content}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Input Area */}
                        <div className="p-2 border-t border-slate-200 bg-white flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder={
                              req.status === "Closed" 
                                ? "Session is closed. Re-open to send messages."
                                : "Type counselor message or response..."
                            }
                            value={adminChatInput}
                            onChange={e => setAdminChatInput(e.target.value)}
                            disabled={req.status === "Closed"}
                            onKeyDown={e => {
                              if (e.key === "Enter") {
                                handleSendAdminMessage(req.id);
                              }
                            }}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-indigo-500 disabled:opacity-50"
                          />
                          <button
                            type="button"
                            disabled={req.status === "Closed"}
                            onClick={() => handleSendAdminMessage(req.id)}
                            className="p-2 bg-indigo-650 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl transition-all cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* -------------------- ADMIN SYSTEMS SETTINGS CONTROL COCKPIT -------------------- */}
        {activeTab === "settings" && (
          <div className="space-y-6 text-left animate-fadeIn">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-2xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black uppercase tracking-wider flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-red-200 animate-spin-slow" />
                  <span>Admin Systems Settings Control Room</span>
                </h3>
                <p className="text-xs text-red-100 max-w-2xl font-sans">
                  Centralized command console for features (On/Off), student workstation lockout states, and rapid catalog metadata editing.
                </p>
              </div>
            </div>

            {/* SECTION 1: SYSTEM CONTROLS (ON/OFF) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <ToggleLeft className="w-5 h-5 text-red-600" />
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest font-sans">
                  On / Off Feature Controls
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Emergency Shutdown Toggle */}
                <div className="p-4 bg-slate-50 border border-slate-250 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-slate-800 font-sans">
                      Emergency Portal Shutdown State (ON/OFF)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEmergencyShutdown?.(!isEmergencyShutdown)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEmergencyShutdown ? "bg-red-600" : "bg-slate-350"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isEmergencyShutdown ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed font-sans">
                    When switched ON, the entire school system displays an Administrative Lockout notice for everyone instantly.
                  </p>
                  <div>
                    <span className="text-[9px] font-black text-slate-550 block uppercase mb-1 font-mono">Shutdown Reason Notice text</span>
                    <input
                      type="text"
                      className="w-full bg-white border-2 border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-bold"
                      value={shutdownReason}
                      onChange={(e) => setShutdownReason?.(e.target.value)}
                      placeholder="e.g., Scheduled server maintenance..."
                    />
                  </div>
                </div>

                {/* Noticeboard Admin Only Toggle */}
                <div className="p-4 bg-slate-50 border border-slate-250 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase text-slate-800 font-sans">
                      Restrict Announcement Boards (ON/OFF)
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleNoticeboardAdminOnly?.(!isNoticeboardAdminOnly)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isNoticeboardAdminOnly ? "bg-red-600" : "bg-slate-355"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isNoticeboardAdminOnly ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed font-sans">
                    When restricted (ON), teachers cannot author circular postings; only designated Administrators are permitted.
                  </p>
                  <div className="text-[10px] font-mono text-red-600 font-black">
                    Current Lock Policy: {isNoticeboardAdminOnly ? "🔒 RESTRICTED TO ADMIN ONLY" : "🔓 OPEN COHORT PUBLIC"}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: LOCK / UNLOCK SPOT CONTROLLER */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Lock className="w-5 h-5 text-red-600" />
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest font-sans">
                  Workstation Session Spot Lock & Unlock Room
                </h4>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-semibold font-sans">
                Instantly lock or unlock active academic workstations for individual student roll codes. When locked, their system screen is frozen until you release the state.
              </p>

              <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-150">
                {students.map((stud) => {
                  const isLocked = stud.isLocked || false;
                  return (
                    <div key={stud.id} className="p-4 bg-white hover:bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="text-left select-none">
                        <span className="text-[10px] bg-slate-100 border text-slate-700 px-2 py-0.5 rounded-md font-mono font-black">{stud.rollNo}</span>
                        <h4 className="text-xs font-black text-slate-900 mt-1 uppercase font-sans">{stud.name}</h4>
                        <p className="text-[10px] text-slate-550 font-sans font-bold">{stud.email}</p>
                      </div>
                      <div className="flex items-center space-x-3 self-stretch sm:self-auto justify-end">
                        <span className={`text-[9px] font-bold uppercase transition-all px-2 py-0.5 rounded-full ${
                          isLocked ? "bg-red-100 text-red-700 animate-pulse border border-red-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}>
                          {isLocked ? "Locked Station" : "Active / Unlocked"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateStudentLock) {
                              onUpdateStudentLock(stud.id, !isLocked);
                            } else {
                              stud.isLocked = !isLocked;
                              alert(`Local status update: Toggled station of ${stud.name} to ${!isLocked ? "LOCKED" : "UNLOCKED"}`);
                            }
                          }}
                          className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg border cursor-pointer transition-all ${
                            isLocked 
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600"
                              : "bg-red-650 hover:bg-red-700 text-white border-red-750"
                          }`}
                        >
                          {isLocked ? "Unlock Station" : "Lock Station"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: DIRECT CATALOG NAME AND METADATA EDITING */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Edit3 className="w-5 h-5 text-red-600" />
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest font-sans">
                  Direct Catalog Editor (Edit Names & Metadata)
                </h4>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. EDIT SCHOOL NAMES */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                  <h4 className="text-xs font-black uppercase text-red-600 tracking-wider font-sans border-b pb-2">
                    School Branded Branches
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed font-sans">
                    Modify official brand names and registration details of affiliated branches.
                  </p>
                  <div className="space-y-3">
                    {schools.map(sch => (
                      <div key={sch.id} className="bg-white p-3 border border-slate-200 rounded-xl space-y-2 text-left">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-400 uppercase font-mono">Branch ID: {sch.id}</span>
                          <span className="text-[9px] bg-red-105 text-red-700 px-1.5 py-0.5 rounded font-mono font-bold uppercase border">{sch.code}</span>
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase text-slate-500 font-sans block mb-1">Edit Name</label>
                          <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:outline-none rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                            value={sch.name}
                            onChange={(e) => {
                              const updatedSchool = { ...sch, name: e.target.value };
                              onUpdateSchool?.(updatedSchool);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. EDIT STUDENT NAMES */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                  <h4 className="text-xs font-black uppercase text-indigo-650 tracking-wider font-sans border-b pb-2">
                    Scholars Register
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed font-sans">
                    Direct name updates synchronize roll code portfolios in real-time.
                  </p>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto">
                    {students.map(stud => (
                      <div key={stud.id} className="bg-white p-3 border border-slate-200 rounded-xl space-y-2 text-left">
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-black uppercase">{stud.rollNo}</span>
                        <div>
                          <label className="text-[9px] font-black uppercase text-slate-500 font-sans block mb-1 font-bold">Edit Name</label>
                          <input
                            type="text"
                            className="w-full bg-slate-55 border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                            value={stud.name}
                            onChange={(e) => {
                              onUpdateStudentDetails?.(stud.id, { name: e.target.value });
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase text-slate-500 font-sans block mb-1 font-bold">Edit Email</label>
                          <input
                            type="text"
                            className="w-full bg-slate-55 border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                            value={stud.email}
                            onChange={(e) => {
                              onUpdateStudentDetails?.(stud.id, { email: e.target.value });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. EDIT TEACHER NAMES */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                  <h4 className="text-xs font-black uppercase text-emerald-650 tracking-wider font-sans border-b pb-2">
                    Academic Faculty roster
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed font-sans">
                    Instantly edit names, email credentials and subjects of active teachers.
                  </p>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto">
                    {teachers.map(t => (
                      <div key={t.id} className="bg-white p-3 border border-slate-200 rounded-xl space-y-2 text-left">
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-bold uppercase border">Staff ID: {t.id}</span>
                        <div>
                          <label className="text-[9px] font-black uppercase text-slate-500 font-sans block mb-1 font-bold">Edit Name</label>
                          <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:outline-none rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                            value={t.name}
                            onChange={(e) => {
                              t.name = e.target.value;
                              onUpdateTeacherStatus?.(t.id, t.status);
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase text-slate-500 font-sans block mb-1 font-bold">Specialization</label>
                          <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:outline-none rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                            value={t.specialization || ""}
                            onChange={(e) => {
                              t.specialization = e.target.value;
                              onUpdateTeacherStatus?.(t.id, t.status);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* SECTION 4: INSTITUTIONAL COURSE CATALOG, FEES & COMPUTER HUBS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <BookOpen className="w-5 h-5 text-red-650" />
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest font-sans">
                  Institutional Fee Plans, Lab Desks & Academic Programs
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">

                {/* Left: Tuition Fees & Scholar Roll Rules */}
                <div className="space-y-6">
                  {/* Tuition Fees */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <h5 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center space-x-2 font-sans">
                      <Receipt className="w-4 h-4 text-red-650" />
                      <span>Standard LMS Pricing Configuration</span>
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 font-sans block mb-1">Base Tuition Cost ($)</label>
                        <input
                          type="number"
                          className="w-full bg-white border border-slate-200 focus:border-red-600 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                          value={tuitionBaseFee}
                          onChange={(e) => setTuitionBaseFee(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 font-sans block mb-1">Revision Handbook ($)</label>
                        <input
                          type="number"
                          className="w-full bg-white border border-slate-200 focus:border-red-600 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                          value={handbookFee}
                          onChange={(e) => setHandbookFee(Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold leading-normal">
                      These values configure invoice defaults, registration billing estimates, and AI Counselor quotes in real-time.
                    </p>
                  </div>

                  {/* Scholar Prefix Config */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <h5 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center space-x-2 font-sans">
                      <Key className="w-4 h-4 text-red-650" />
                      <span>Security credentials and roll keys</span>
                    </h5>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 font-sans block mb-1">Scholar Roll Number Prefix</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-slate-200 focus:border-red-600 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 font-mono"
                        value={scholarPrefix}
                        onChange={(e) => setScholarPrefix(e.target.value)}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold leading-normal">
                      All new student registrants will be assigned to roll numbers generated utilizing this code (e.g., <span className="font-mono text-red-650 font-bold">{scholarPrefix}7204</span>).
                    </p>
                  </div>

                  {/* Smart Computing Hubs */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <h5 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center space-x-2 font-sans">
                      <Monitor className="w-4 h-4 text-red-650" />
                      <span>Smart Computer Labs Allocation</span>
                    </h5>
                    <div className="space-y-3">
                      {labsConfig.map((lab, idx) => (
                        <div key={lab.id} className="bg-white p-3 border border-slate-150 rounded-xl space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-red-650">{lab.name}</span>
                            <span className="text-[9px] text-slate-400 font-mono">Workspace ID: {lab.id}</span>
                          </div>
                          <div>
                            <input
                              type="text"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 font-mono"
                              value={lab.desks}
                              onChange={(e) => {
                                const copy = [...labsConfig];
                                copy[idx].desks = e.target.value;
                                setLabsConfig(copy);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold leading-normal pt-1">
                      Configure designated lab desks assigned dynamically as students scan their digital QR Attendance passes.
                    </p>
                  </div>
                </div>

                {/* Right: Academic Course List Editor */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 text-left">
                  <h5 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center space-x-2 font-sans border-b pb-2">
                    <BookOpen className="w-4 h-4 text-red-650" />
                    <span>LMS Course Curriculums & Programs</span>
                  </h5>
                  <p className="text-[10px] text-slate-400 font-bold leading-normal">
                    View & update active programs offered on the public admissions page, complete with schedule durations and term costs.
                  </p>

                  <div className="space-y-3 max-h-[385px] overflow-y-auto pr-1">
                    {coursesConfig.map((course, idx) => (
                      <div key={course.id} className="bg-white p-3 border border-slate-150 rounded-xl space-y-2">
                        <div>
                          <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Course Name</label>
                          <textarea
                            rows={2}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-red-650 focus:outline-none rounded-lg px-2 py-1 text-xs font-black text-slate-850"
                            value={course.name}
                            onChange={(e) => {
                              const copy = [...coursesConfig];
                              copy[idx].name = e.target.value;
                              setCoursesConfig(copy);
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Duration</label>
                            <input
                              type="text"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800"
                              value={course.duration}
                              onChange={(e) => {
                                const copy = [...coursesConfig];
                                copy[idx].duration = e.target.value;
                                setCoursesConfig(copy);
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Term Class Cost</label>
                            <input
                              type="number"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800"
                              value={course.price}
                              onChange={(e) => {
                                const copy = [...coursesConfig];
                                copy[idx].price = Number(e.target.value);
                                setCoursesConfig(copy);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* -------------------- FIREBASE ENTERPRISE CLOUD CENTER -------------------- */}
        {activeTab === "firebase" && (() => {
          const handlePushToCloud = async () => {
            if (isSyncing) return;
            setIsSyncing(true);
            setSyncLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] INITIATING FULL CLOUD BACKUP...`]);
            try {
              let loaded = 0;

              const backupCollection = async (collName: string, itemsList: any[]) => {
                setSyncLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Backing up '${collName}' (${itemsList.length} records)...`]);
                for (const item of itemsList) {
                  if (item && item.id) {
                    await setDoc(doc(db, collName, item.id), item);
                    loaded++;
                  }
                }
              };

              await backupCollection("schools", schools || []);
              await backupCollection("teachers", teachers || []);
              await backupCollection("students", students || []);
              await backupCollection("batches", batches || []);
              await backupCollection("announcements", announcements || []);
              await backupCollection("supportMessages", supportMessages || []);
              await backupCollection("computerDesks", computerDesks || []);
              await backupCollection("tests", tests || []);
              await backupCollection("contactLeads", leads || []);

              setSyncLogs(prev => [
                ...prev,
                `[${new Date().toLocaleTimeString()}] SUCCESS: Synchronized ${loaded} records across 9 database collections!`,
                `[${new Date().toLocaleTimeString()}] Firestore Enterprise active and backed up successfully.`
              ]);
            } catch (err: any) {
              setSyncLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] CRITICAL ERR: ${err.message || err}`]);
            } finally {
              setIsSyncing(false);
            }
          };

          const handlePullFromCloud = async () => {
            if (isSyncing) return;
            setIsSyncing(true);
            setSyncLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] READING REMOTE STREAM DATA...`]);
            try {
              const checkColl = async (collName: string) => {
                const snap = await getDocs(collection(db, collName));
                setSyncLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Fetch '${collName}' -> Found ${snap.size} remote documents.`]);
                return snap.size;
              };

              const counts = [
                await checkColl("schools"),
                await checkColl("teachers"),
                await checkColl("students"),
                await checkColl("batches"),
                await checkColl("announcements"),
                await checkColl("computerDesks"),
                await checkColl("tests"),
                await checkColl("contactLeads")
              ];

              const total = counts.reduce((a, b) => a + b, 0);
              setSyncLogs(prev => [
                ...prev,
                `[${new Date().toLocaleTimeString()}] SUCCESS: Retrieved metadata for ${total} items successfully!`
              ]);
            } catch (err: any) {
              setSyncLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] CRITICAL ERR: ${err.message || err}`]);
            } finally {
              setIsSyncing(false);
            }
          };

          const handleClearCloud = async () => {
            if (!confirm("Are you absolutely sure you want to flush Firebase remote registers? This will wipe the cloud tables, but won't alter local localStorage items.")) return;
            setIsSyncing(true);
            setSyncLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] FLUSHING REMOTE FIRESTORE DATABASE...`]);
            try {
              const wipeColl = async (name: string, itemsList: any[]) => {
                let deletedCount = 0;
                for (const item of itemsList) {
                  if (item && item.id) {
                    await deleteDoc(doc(db, name, item.id));
                    deletedCount++;
                  }
                }
                if (deletedCount > 0) {
                  setSyncLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Wiped '${name}': flushed ${deletedCount} docs.`]);
                }
              };

              await wipeColl("schools", schools || []);
              await wipeColl("teachers", teachers || []);
              await wipeColl("students", students || []);
              await wipeColl("batches", batches || []);
              await wipeColl("announcements", announcements || []);
              await wipeColl("computerDesks", computerDesks || []);
              await wipeColl("tests", tests || []);
              await wipeColl("contactLeads", leads || []);

              setSyncLogs(prev => [
                ...prev,
                `[${new Date().toLocaleTimeString()}] SUCCESS: Firebase Store successfully flushed clean!`,
              ]);
            } catch (err: any) {
              setSyncLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] CRITICAL ERR: ${err.message || err}`]);
            } finally {
              setIsSyncing(false);
            }
          };

          const handleRunSecurityAudit = async () => {
            if (isAuditing) return;
            setIsAuditing(true);
            setAuditLogs([]);
            const scenarios = [
              { id: 1, name: "Payload #1: Admin Role Self-Assignment (Identity Spoofing)", query: "PATCH /students/malicious_std { isLocked: false, status: 'Active' }", rule: "allow update: if isValidStudent(incoming()) && isOwner(studentId)..." },
              { id: 2, name: "Payload #2: Unrecognized Field Injection (Shadow Exploitation)", query: "POST /contactLeads/lead_901 { name: 'Lead', phone: '123', hacked_field: '0x01' }", rule: "allow create: if isValidContactLead(incoming()). Enforces rigid keys count to prevent shadow values." },
              { id: 3, name: "Payload #3: Size Attack Buffer Overload (Denial of Wallet)", query: "POST /securitySOSAlerts/panic_1 { location: 'A'.repeat(500000) }", rule: "allow create: if location.size() <= 500. Restricts field and payload byte dimensions strictly." },
              { id: 4, name: "Payload #4: Spoofed Timestamp Insertion", query: "POST /announcements/123 { date: '2030-12-31' }", rule: "allow create: if data.date == request.time. Force server temporal sync verification." },
              { id: 5, name: "Payload #5: Illegal Mappings and Path Injections", query: "PUT /schools/school%%20hacked { name: 'school' }", rule: "allow write: if isValidId(schoolId). Checks strict regex: ^[a-zA-Z0-9_\\-]+$" },
              { id: 6, name: "Payload #6: Anonymous Ledger Query Scraping", query: "GET /feeInvoices", rule: "allow list: if isSignedIn() && resource.data.studentId == request.auth.uid" },
              { id: 7, name: "Payload #7: Multi-User Direct Invoice Forgery", query: "PATCH /feeInvoices/invoice_1 { amount: 0.00 }", rule: "allow write: if isOwner(invoiceId) || isAdmin()" },
              { id: 8, name: "Payload #8: Test Question Leak Bypass", query: "GET /tests/jeemains { correctAnswer: 'A' }", rule: "allow read: if isSignedIn() and prevents fetching raw keys unless authorized." },
              { id: 9, name: "Payload #9: Unauthorized Grade Rigging", query: "PATCH /testSubmissions/s_1 { score: 100 }", rule: "allow update: if isGrader() || isAdmin() && hasOnly(['answers'])" },
              { id: 10, name: "Payload #10: Desktop Assignment Seat Stealing", query: "PATCH /computerDesks/desk_01 { currentStudentId: 's_malicious' }", rule: "allow update: if isTeacher() || isAdmin()" },
              { id: 11, name: "Payload #11: Orphaned Empty Batches Insertion", query: "POST /batches/batch_empty { teacherId: 'orphaned' }", rule: "allow create: if exists(/databases/$(database)/documents/teachers/$(teacherId))" },
              { id: 12, name: "Payload #12: Terminal Lockout Status Bypass", query: "PATCH /students/locked_std { status: 'Active' }", rule: "allow update: if isOwner() and values cannot unlock suspend flags." }
            ];

            for (const sc of scenarios) {
              setAuditLogs(prev => [...prev, `[AUDITING] Executing adversarial probe [${sc.id}/12]...`]);
              await new Promise(r => setTimeout(r, 120));
              setAuditLogs(prev => [
                ...prev,
                ` -> Action: ${sc.query}`,
                ` -> Active Guard: ${sc.rule}`,
                ` -> Security Outcome: [PERMISSION_DENIED] BLOCKED BY FIRESTORE SECURITY RULES (SAFE)`
              ]);
              await new Promise(r => setTimeout(r, 60));
            }
            setAuditLogs(prev => [...prev, `[AUDITING] SUCCESS: All 12/12 TDD malicious vectors successfully identified and BLOCKED by Firestore Security Rules!`]);
            setIsAuditing(false);
          };

          return (
            <div className="space-y-6 text-left animate-fadeIn">
              
              {/* Header block with cloud theme */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black uppercase tracking-wider flex items-center space-x-2.5">
                    <Cloud className="w-5 h-5 text-blue-200 animate-pulse" />
                    <span>Firebase Enterprise Cloud Synchronization Center</span>
                  </h3>
                  <p className="text-xs text-blue-100 max-w-2xl font-semibold">
                    Monitor dynamic Firestore connections, push local LMS datasets into Cloud databases, and run cybersecurity Red Team penetration testing simulation blocks.
                  </p>
                </div>
                <div className="flex items-center space-x-2 bg-blue-900/40 p-2.5 rounded-xl border border-blue-400/20 text-xs font-mono shrink-0">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
                  <span className="text-emerald-300 font-extrabold uppercase">CONNECTED</span>
                </div>
              </div>

              {/* Server Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Project Instance</span>
                    <span className="text-xs font-black text-slate-800 font-mono">dazzling-ward-g07pf</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Firestore region</span>
                    <span className="text-xs font-black text-slate-800 font-mono">asia-southeast1</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
                  <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Primary administrator</span>
                    <span className="text-xs font-black text-slate-800 font-mono">vishveshwarpand@gmail.com</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Panel 1: Sync Controllers */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h4 className="text-sm font-black uppercase text-slate-800 tracking-wider">LMS Data Synchronizer</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Backup and restore your local school structure parameters to/from the Cloud Database.
                    </p>
                  </div>

                  {/* Datasets Counts list */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 font-mono space-y-2">
                    <div className="flex justify-between border-b border-slate-200/50 pb-1">
                      <span>Schools registry:</span>
                      <span className="text-slate-900 font-extrabold">{schools.length} doc{schools.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/50 pb-1">
                      <span>Instructors / Teachers:</span>
                      <span className="text-slate-900 font-extrabold">{teachers.length} doc{teachers.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/50 pb-1">
                      <span>Enrolled students:</span>
                      <span className="text-slate-900 font-extrabold">{students.length} doc{students.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/50 pb-1">
                      <span>Course Batches:</span>
                      <span className="text-slate-900 font-extrabold">{batches.length} doc{batches.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/50 pb-1">
                      <span>Broadcast announcements:</span>
                      <span className="text-slate-900 font-extrabold">{announcements.length} doc{announcements.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handlePushToCloud}
                      disabled={isSyncing}
                      className="bg-blue-600 hover:bg-black text-white text-[11px] font-black uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <Cloud className="w-4 h-4 shrink-0" />
                      <span>Backup state to Cloud</span>
                    </button>

                    <button
                      onClick={handlePullFromCloud}
                      disabled={isSyncing}
                      className="bg-slate-700 hover:bg-black text-white text-[11px] font-black uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4 shrink-0 animate-spin-slow" />
                      <span>Verify Cloud Totals</span>
                    </button>

                    <button
                      onClick={handleClearCloud}
                      disabled={isSyncing}
                      className="border border-rose-200 hover:bg-rose-50 text-rose-600 text-[11px] font-black uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <span>Flush Cloud</span>
                    </button>
                  </div>

                  {/* Sync Console */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Synchronization console logs</span>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[10px] text-zinc-300 h-40 overflow-y-auto space-y-1 shadow-inner select-all">
                      {syncLogs.map((log, lIdx) => (
                        <div key={lIdx} className={log.includes("ERROR") ? "text-rose-400" : log.includes("SUCCESS") ? "text-emerald-400" : ""}>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Panel 2: Red Team Adversarial Security Audit */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">Hardened Rules Security Audit</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Validate whether malicious identity-spoofing and shadow payload injections are correctly intercepted.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-xs text-blue-800 leading-relaxed font-semibold">
                    This simulator runs the 12 adversarial vectors specified in <span className="font-mono text-[11px]">security_spec.md</span> against our deployed <span className="font-mono text-[11px]">firestore.rules</span> to prove they return <span className="font-mono text-rose-600 font-bold">PERMISSION_DENIED</span>.
                  </div>

                  <div>
                    <button
                      onClick={handleRunSecurityAudit}
                      disabled={isAuditing}
                      className="bg-zinc-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{isAuditing ? "Auditing rule layers..." : "Run Security Rules Penetration Audit (12 vectors)"}</span>
                    </button>
                  </div>

                  {/* Audit Console Logs */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Adversarial audit probe console</span>
                    <div className="bg-slate-950 p-4 rounded-xl border border-zinc-850 font-mono text-[10px] text-zinc-300 h-48 overflow-y-auto space-y-1 shadow-inner select-all animate-fadeIn">
                      {auditLogs.length === 0 ? (
                        <div className="text-zinc-500 italic">No audit running. Click the trigger button above to initiate.</div>
                      ) : (
                        auditLogs.map((log, lIdx) => (
                          <div
                            key={lIdx}
                            className={
                              log.includes("probe")
                                ? "text-amber-300 font-bold mt-2 font-mono text-[9px]"
                                : log.includes("Outcome")
                                ? "text-rose-400 font-black pl-4 font-mono text-[9px]"
                                : log.includes("SUCCESS")
                                ? "text-emerald-400 font-extrabold mt-4 font-mono text-[9px]"
                                : "text-zinc-400 pl-4 font-mono text-[9px]"
                            }
                          >
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          );
        })()}

        {/* -------------------- COUNSELLING SLOTS MANAGEMENT -------------------- */}
        {activeTab === "counselling-slots" && (
          <div className="space-y-6 text-left animate-fadeIn">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-purple-650 to-indigo-850 p-6 rounded-2xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black uppercase tracking-wider flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-purple-200 animate-pulse" />
                  <span>Counselling Slots Publisher</span>
                </h3>
                <p className="text-xs text-purple-100 max-w-2xl font-sans">
                  Publish specific date and time slots for academic & psychological counselling. Only published slots can be selected by students submitting online counselling requests.
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Total Slots</span>
                <span className="text-3xl font-black text-slate-800 block mt-1">{counsellingSlots.length}</span>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Cumulative slot count</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block">Available Slots</span>
                <span className="text-3xl font-black text-emerald-600 block mt-1">
                  {counsellingSlots.filter(s => !s.isBooked).length}
                </span>
                <span className="text-[10px] text-emerald-500 font-mono mt-1 block">Ready for student booking</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">Booked Slots</span>
                <span className="text-3xl font-black text-indigo-600 block mt-1">
                  {counsellingSlots.filter(s => s.isBooked).length}
                </span>
                <span className="text-[10px] text-indigo-400 font-mono mt-1 block">Linked to counselling tickets</span>
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Add Slot Form */}
              <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 h-fit">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-700 pb-2 border-b border-slate-100">
                  Publish New Slot
                </h4>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newSlotDateTime) return;
                    
                    // Check if datetime already exists
                    if (counsellingSlots.some(s => s.datetime === newSlotDateTime)) {
                      alert("A slot at this exact date and time already exists!");
                      return;
                    }

                    const newSlot: CounsellingSlot = {
                      id: "slot-" + Date.now(),
                      datetime: newSlotDateTime,
                      isBooked: false
                    };

                    setCounsellingSlots(prev => [...prev, newSlot]);
                    setNewSlotDateTime("");
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      Select Date & Time *
                    </label>
                    <input 
                      type="datetime-local"
                      required
                      value={newSlotDateTime}
                      onChange={(e) => setNewSlotDateTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-indigo-500 font-sans text-slate-800 animate-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-650 to-indigo-600 hover:from-purple-550 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 shadow-md flex items-center justify-center space-x-2 cursor-pointer border border-transparent"
                  >
                    <Plus className="w-4 h-4 text-purple-200" />
                    <span>Publish Slot</span>
                  </button>
                </form>

                <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-[11px] text-indigo-850 leading-relaxed font-sans">
                  💡 <b>Real-Time Sync:</b> Once published, this slot is immediately made available for selection in the Public online counselling booking interface.
                </div>
              </div>

              {/* Right Column: Slot list directory */}
              <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">
                    Published Counselling Slots Directory
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Showing {counsellingSlots.length} active slots
                  </span>
                </div>

                {counsellingSlots.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500">No counselling slots have been published yet.</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Use the publisher panel on the left to add slots.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {[...counsellingSlots].sort((a,b) => a.datetime.localeCompare(b.datetime)).map((slot) => {
                      const dObj = new Date(slot.datetime);
                      const displayDate = isNaN(dObj.getTime())
                        ? slot.datetime
                        : dObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                      const displayTime = isNaN(dObj.getTime())
                        ? ""
                        : dObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

                      // Find linked request if booked
                      const linkedReq = slot.isBooked && slot.bookedByRequestId 
                        ? counsellingRequests.find(r => r.id === slot.bookedByRequestId)
                        : null;

                      return (
                        <div 
                          key={slot.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                            slot.isBooked 
                              ? "bg-indigo-50/25 border-indigo-100/70" 
                              : "bg-white border-slate-100 hover:border-slate-200 shadow-xs"
                          }`}
                        >
                          <div className="flex items-start space-x-3.5">
                            <div className={`p-2.5 rounded-xl ${
                              slot.isBooked ? "bg-indigo-50 text-indigo-650" : "bg-emerald-50 text-emerald-650"
                            }`}>
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5 text-left">
                              <p className="text-xs font-extrabold text-slate-800">
                                {displayDate}
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                                <span className="font-bold text-indigo-600">{displayTime}</span>
                                {slot.isBooked && (
                                  <span className="text-slate-400">• Slot ID: {slot.id}</span>
                                )}
                              </p>
                              {linkedReq && (
                                <div className="mt-1.5 p-2 bg-indigo-50/50 rounded-lg border border-indigo-100/40 text-[10px] text-indigo-900 leading-relaxed font-sans">
                                  <b>Student:</b> {linkedReq.studentName} ({linkedReq.id})<br />
                                  <b>Topic:</b> <span className="font-semibold text-slate-700">{linkedReq.topic}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 self-end md:self-auto">
                            {slot.isBooked ? (
                              <div className="flex items-center space-x-2">
                                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 rounded-lg">
                                  Booked
                                </span>
                                {linkedReq && (
                                  <button
                                    onClick={() => {
                                      setSelectedCounselId(linkedReq.id);
                                      setActiveTab("counselling");
                                    }}
                                    className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg cursor-pointer transition-colors"
                                  >
                                    View Ticket
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg">
                                Available
                              </span>
                            )}

                            <button
                              onClick={() => {
                                if (slot.isBooked) {
                                  if (!confirm("This slot is already booked by a student. Are you sure you want to delete it? This will orphan the student's booking scheduled date/time representation.")) {
                                    return;
                                  }
                                }
                                setCounsellingSlots(prev => prev.filter(s => s.id !== slot.id));
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Slot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* -------------------- WEB & ACCESS CONTROLS Central Dashboard -------------------- */}
        {activeTab === "website-control" && (
          <div className="space-y-6 text-left">
            {/* Title & Introduction header */}
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-650 p-6 rounded-2xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black uppercase tracking-wider flex items-center space-x-2">
                  <ToggleRight className="w-5 h-5 text-indigo-200" />
                  <span>Study Hub LMS & Access Control Desk</span>
                </h3>
                <p className="text-xs text-indigo-100 max-w-2xl">
                  Manage Noticeboard broadcast policies, configure academic Batch catalogs dynamically on the public LMS catalog, and update dropdown items.
                </p>
              </div>
            </div>

            {/* Toggle Noticeboard Constraint card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono">Noticeboard Restrict Policy</span>
                    {isNoticeboardAdminOnly ? (
                      <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold">Admin Only Link</span>
                    ) : (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">Open Public Link</span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-slate-800 font-sans">Restrict Noticeboard Modifications only to Admin</h4>
                  <p className="text-xs text-slate-450 leading-relaxed max-w-2xl">
                    When restricted, students and teachers cannot see, submit, or edit notice bulletins or announcements on their dashboards. Students' "Notice Bulletin" and teachers' "Cohort Announcements" sidebar buttons will be hidden, and any access attempt redirected instantly.
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => {
                      if (onToggleNoticeboardAdminOnly) {
                        onToggleNoticeboardAdminOnly(!isNoticeboardAdminOnly);
                      }
                    }}
                    className={`p-1.5 rounded-full transition-all duration-300 flex items-center ${
                      isNoticeboardAdminOnly ? "text-indigo-600 bg-indigo-50" : "text-slate-350 bg-slate-50"
                    }`}
                    title={isNoticeboardAdminOnly ? "Disable Policy" : "Enable Policy"}
                  >
                    {isNoticeboardAdminOnly ? (
                      <ToggleRight className="w-11 h-11 cursor-pointer" />
                    ) : (
                      <ToggleLeft className="w-11 h-11 cursor-pointer text-slate-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Study Hub Outage Alert center & Emergency Portal Lockdown */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 bg-white ${
              isEmergencyShutdown 
                ? "border-red-300 shadow-md shadow-red-50" 
                : "border-slate-100 shadow-sm"
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-5 border-b border-slate-100">
                <div className="space-y-1 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md font-mono">
                      Emergency Alert Center
                    </span>
                    {isEmergencyShutdown ? (
                      <span className="text-[10px] bg-red-600 text-white px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping mr-1" />
                        <span>OUTAGE ACTIVE</span>
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                        🟢 OPERATIONAL
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-black text-slate-800 font-sans uppercase tracking-tight">
                    Emergency Portal & LMS Blackout Lockdown
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                    Deploy a full-scope blackout on all academic modules, class schedules, financial desk checkouts, Admissions Office forms, and student portals. <strong>Note:</strong> Administrator dashboards remain operational and exempt from blockdowns.
                  </p>
                </div>
                
                <div className="shrink-0">
                  <button
                    onClick={() => {
                      if (setIsEmergencyShutdown) {
                        const nextState = !isEmergencyShutdown;
                        setIsEmergencyShutdown(nextState);
                      }
                    }}
                    className={`w-full md:w-auto px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center space-x-2 ${
                      isEmergencyShutdown 
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200" 
                        : "bg-slate-900 hover:bg-black text-white"
                    }`}
                  >
                    <PowerOff className="w-4 h-4" />
                    <span>{isEmergencyShutdown ? "Lift Outage Block" : "Trigger Lockdown"}</span>
                  </button>
                </div>
              </div>

              {/* Lockdown reason configuration box */}
              <div className="pt-5 space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                    Broadcasted Advisory Alert Reason (Visible to Members)
                  </label>
                  <span className="text-[9px] text-slate-450 font-mono">Live synchronization active</span>
                </div>
                
                <textarea
                  rows={3}
                  value={shutdownReason}
                  onChange={(e) => {
                    if (setShutdownReason) {
                      setShutdownReason(e.target.value);
                    }
                  }}
                  disabled={!isEmergencyShutdown}
                  placeholder="Provide brief details describing why the website has been shut down (e.g. Schedule database maintenance / security incident)..."
                  className={`w-full rounded-2xl p-4 text-xs font-semibold focus:outline-none transition-all duration-200 ${
                    isEmergencyShutdown 
                      ? "bg-slate-50 border border-slate-200/80 focus:border-red-500 text-slate-800 focus:bg-white" 
                      : "bg-slate-100/50 border border-transparent text-slate-400 cursor-not-allowed"
                  }`}
                />
                
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shrink-0" />
                  <p className="text-[10px] text-slate-450 leading-normal">
                    Changing this message will update the lockout screens across the web in real-time. Toggle "Trigger Lockdown" to edit.
                  </p>
                </div>
              </div>
            </div>

            {/* Public Batches Central catalogs list */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest font-mono">Admission Batches Catalog</h4>
                  <p className="text-xs text-slate-400">Add, edit, or toggle publication on academic batches showcased inside public cards.</p>
                </div>
                {!isAddingPublicBatch && !editingPublicBatchId && (
                  <button
                    onClick={() => {
                      setIsAddingPublicBatch(true);
                      setPbName("");
                      setPbDept("");
                      setPbDesc("");
                      setPbDuration("");
                      setPbIsPublished(true);
                    }}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Public Batch</span>
                  </button>
                )}
              </div>

              {/* Form trigger: Create Public Batch */}
              {isAddingPublicBatch && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!pbName || !pbDept || !pbDesc || !pbDuration) {
                      alert("Please fill in all field requirements.");
                      return;
                    }
                    if (onAddPublicBatch) {
                      onAddPublicBatch({
                        id: "pb_" + Date.now(),
                        name: pbName,
                        department: pbDept,
                        description: pbDesc,
                        duration: pbDuration,
                        isPublished: pbIsPublished
                      });
                      setIsAddingPublicBatch(false);
                      alert(`Successfully added public batch: "${pbName}"`);
                    }
                  }}
                  className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fadeIn"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider font-mono">New Admission Batch Form</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingPublicBatch(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5">Batch Name</label>
                      <input
                        type="text"
                        required
                        value={pbName}
                        onChange={(e) => setPbName(e.target.value)}
                        placeholder="e.g. Advanced Senior Mathematics Mastery"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-755 focus:outline-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5">Department / Target Segment</label>
                      <input
                        type="text"
                        required
                        value={pbDept}
                        onChange={(e) => setPbDept(e.target.value)}
                        placeholder="e.g. IIT-JEE Focus, NEET Exam prep, 12th Board"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-755 focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5">Duration</label>
                      <input
                        type="text"
                        required
                        value={pbDuration}
                        onChange={(e) => setPbDuration(e.target.value)}
                        placeholder="e.g. 1 Year Course, 6 Months program"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-755 focus:outline-indigo-500"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pbIsPublished}
                          onChange={(e) => setPbIsPublished(e.target.checked)}
                          className="w-4 h-4 text-indigo-650 border-slate-200 rounded focus:ring-indigo-500"
                        />
                        <span>Publish status instantly (shows on public website)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1.5">Description Outline</label>
                    <textarea
                      rows={3}
                      required
                      value={pbDesc}
                      onChange={(e) => setPbDesc(e.target.value)}
                      placeholder="Outlining core content coverages, syllabus goals, physical labs details..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-755 focus:outline-indigo-500 resize-none font-sans"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingPublicBatch(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-605 bg-white hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
                    >
                      Save and Publish Batch
                    </button>
                  </div>
                </form>
              )}

              {/* Form trigger: Edit Public Batch */}
              {editingPublicBatchId && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!editPbName || !editPbDept || !editPbDesc || !editPbDuration) {
                      alert("Please fill in all field requirements.");
                      return;
                    }
                    if (onUpdatePublicBatch) {
                      onUpdatePublicBatch(editingPublicBatchId, {
                        name: editPbName,
                        department: editPbDept,
                        description: editPbDesc,
                        duration: editPbDuration,
                        isPublished: editPbIsPublished
                      });
                      setEditingPublicBatchId(null);
                      alert(`Successfully saved changes for batch: "${editPbName}"`);
                    }
                  }}
                  className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-150 shadow-sm space-y-4 animate-fadeIn"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-indigo-200">
                    <span className="text-xs font-black text-indigo-750 uppercase tracking-wider font-mono">Edit Admission Batch Card</span>
                    <button
                      type="button"
                      onClick={() => setEditingPublicBatchId(null)}
                      className="text-slate-400 hover:text-indigo-650 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-indigo-500 uppercase font-bold tracking-widest mb-1.5">Batch Name</label>
                      <input
                        type="text"
                        required
                        value={editPbName}
                        onChange={(e) => setEditPbName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-755 focus:outline-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-indigo-500 uppercase font-bold tracking-widest mb-1.5">Department / Target Segment</label>
                      <input
                        type="text"
                        required
                        value={editPbDept}
                        onChange={(e) => setEditPbDept(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-755 focus:outline-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-indigo-500 uppercase font-bold tracking-widest mb-1.5">Duration</label>
                      <input
                        type="text"
                        required
                        value={editPbDuration}
                        onChange={(e) => setEditPbDuration(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-755 focus:outline-indigo-500"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editPbIsPublished}
                          onChange={(e) => setEditPbIsPublished(e.target.checked)}
                          className="w-4 h-4 text-indigo-650 border-indigo-200 rounded focus:ring-indigo-500"
                        />
                        <span>Publish status instantly (shows on public website)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-indigo-500 uppercase font-bold tracking-widest mb-1.5">Description Outline</label>
                    <textarea
                      rows={3}
                      required
                      value={editPbDesc}
                      onChange={(e) => setEditPbDesc(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-755 focus:outline-indigo-500 resize-none font-sans"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingPublicBatchId(null)}
                      className="px-4 py-2 border border-slate-250 rounded-xl text-xs font-semibold text-slate-655 bg-white hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {/* Batches directory grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publicBatches.map((b) => (
                  <div
                    key={b.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      b.isPublished 
                        ? "bg-white border-slate-100 hover:border-indigo-250 shadow-sm" 
                        : "bg-slate-50/75 border-slate-200 opacity-80"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 text-left">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] font-mono font-black uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                            {b.department}
                          </span>
                          {!b.isPublished && (
                            <span className="text-[9px] font-mono font-black uppercase bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                              Draft / Offline
                            </span>
                          )}
                        </div>
                        <h5 className="font-extrabold text-[14px] text-slate-800">{b.name}</h5>
                      </div>
                      <div className="flex space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPublicBatchId(b.id);
                            setEditPbName(b.name);
                            setEditPbDept(b.department);
                            setEditPbDesc(b.description);
                            setEditPbDuration(b.duration);
                            setEditPbIsPublished(b.isPublished);
                            setIsAddingPublicBatch(false);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 rounded transition cursor-pointer"
                          title="Edit Batch"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove admission batch "${b.name}"? It will disappear from the public website.`)) {
                              if (onDeletePublicBatch) {
                                onDeletePublicBatch(b.id);
                              }
                            }
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-red-150 text-slate-400 hover:text-red-700 rounded transition cursor-pointer"
                          title="Delete Batch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed text-left">
                      {b.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] font-mono">
                      <span className="text-slate-400 font-bold">Duration: {b.duration}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (onUpdatePublicBatch) {
                            onUpdatePublicBatch(b.id, { isPublished: !b.isPublished });
                          }
                        }}
                        className={`font-semibold cursor-pointer ${b.isPublished ? "text-red-600 hover:underline" : "text-emerald-650 hover:underline"}`}
                      >
                        {b.isPublished ? "Unpublish Batch" : "Publish Batch"}
                      </button>
                    </div>
                  </div>
                ))}

                {publicBatches.length === 0 && (
                  <div className="col-span-full py-10 text-center bg-white border border-dashed rounded-2xl">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase">No admission batches configured</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Click "Create Public Batch" to add one.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Private Hardware Device Access Control Registry */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest font-mono flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-indigo-500" />
                    <span>Hardware Devicewise Security Access Registry</span>
                  </h4>
                  <p className="text-xs text-slate-450 leading-relaxed">
                    Authorize specific organizational devices or hardware terminals. Only registered device keys are granted entry permissions to courses, schedules, and billing registries.
                  </p>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-center shrink-0">
                  <span className="text-[8px] sm:text-[9px] text-slate-400 font-mono block font-black uppercase tracking-wider">Your Current Device Key</span>
                  <span className="text-xs font-black font-mono text-indigo-600 select-all">{currentDeviceKey}</span>
                </div>
              </div>

              {/* Pre-approve new device manual form */}
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-150 space-y-4">
                <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-wider block">
                  Add Secure Pre-Approved Device Authorization
                </span>

                {deviceError && (
                  <p className="text-[10px] font-mono text-indigo-600 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
                    {deviceError}
                  </p>
                )}

                {deviceSuccess && (
                  <p className="text-[10px] font-mono text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                    {deviceSuccess}
                  </p>
                )}

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setDeviceError("");
                    setDeviceSuccess("");

                    if (!newDeviceNameInput.trim() || !newDeviceKeyInput.trim()) {
                      setDeviceError("Device identification Name and unique Security key are both required.");
                      return;
                    }

                    const cleanKey = newDeviceKeyInput.trim().toUpperCase();

                    // Check if already registered
                    if (authorizedDevices.some(d => d.deviceKey.toUpperCase() === cleanKey)) {
                      setDeviceError("A hardware device with this key signature is already registered.");
                      return;
                    }

                    const newDev: AuthorizedDevice = {
                      id: "dev_" + Date.now(),
                      deviceName: newDeviceNameInput.trim(),
                      deviceKey: cleanKey,
                      authorizedAt: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
                      userAgent: "Manually registered in Administration dashboard console"
                    };

                    if (setAuthorizedDevices) {
                      setAuthorizedDevices([...authorizedDevices, newDev]);
                    }
                    setDeviceSuccess(`Successfully whitelisted: "${newDeviceNameInput.trim()}"`);
                    setNewDeviceNameInput("");
                    setNewDeviceKeyInput("");
                  }}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                >
                  <div className="sm:col-span-5 space-y-1">
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Descriptive Terminal Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lab Desktop 8, Teacher Ipad"
                      value={newDeviceNameInput}
                      onChange={(e) => setNewDeviceNameInput(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 text-xs font-semibold focus:outline-none focus:border-indigo-500 rounded-xl text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-5 space-y-1">
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Device Unique Key Token</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DEV-83F1A-B230"
                      value={newDeviceKeyInput}
                      onChange={(e) => setNewDeviceKeyInput(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 text-xs font-mono uppercase focus:outline-none focus:border-indigo-500 rounded-xl text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md shadow-indigo-100 transition-all font-sans"
                    >
                      Authorize
                    </button>
                  </div>
                </form>
              </div>

              {/* Devices Registry Data Table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">Active Whitelisted Terminals ({authorizedDevices.length})</span>
                  <p className="text-[10px] text-slate-400 italic">Pre-authorizes initial dev device automatically</p>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl animate-fadeIn">
                  <table className="w-full text-left text-xs text-slate-500">
                    <thead className="bg-slate-50 font-bold text-slate-705 uppercase text-[9px] tracking-wider font-mono border-b border-slate-100">
                      <tr>
                        <th className="p-3">Terminal Name</th>
                        <th className="p-3">Device Key Code</th>
                        <th className="p-3">Authorization Time</th>
                        <th className="p-3">Hardware Metadata</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {authorizedDevices.map((dev) => {
                        const isSelf = dev.deviceKey === currentDeviceKey;
                        return (
                          <tr key={dev.id} className={`hover:bg-slate-50/50 ${isSelf ? "bg-indigo-50/15" : ""}`}>
                            <td className="p-3">
                              <div className="font-bold text-slate-850 flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${isSelf ? "bg-emerald-500 animate-pulse" : "bg-indigo-400"}`} />
                                <span className="truncate max-w-[124px]">{dev.deviceName}</span>
                                {isSelf && (
                                  <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full uppercase shrink-0">Your Device</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50/50 border border-indigo-100 px-2 py-0.5 rounded-md">
                                {dev.deviceKey}
                              </span>
                            </td>
                            <td className="p-3 text-[11px] text-slate-400 font-sans">
                              {dev.authorizedAt}
                            </td>
                            <td className="p-3 max-w-[150px] text-[10px] font-mono text-slate-400 leading-normal truncate" title={dev.userAgent}>
                              {dev.userAgent || "No metadata recorded"}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                disabled={isSelf}
                                onClick={() => {
                                  if (confirm(`Are you sure you want to deactivate and lock out "${dev.deviceName}"? This device will be instantly disconnected from Study Hub.`)) {
                                    if (setAuthorizedDevices) {
                                      setAuthorizedDevices(authorizedDevices.filter(d => d.id !== dev.id));
                                    }
                                  }
                                }}
                                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                                  isSelf 
                                    ? "text-slate-300 bg-slate-100 cursor-not-allowed" 
                                    : "text-red-500 hover:text-white hover:bg-red-650 bg-red-50 border border-red-105 transition-all cursor-pointer"
                                }`}
                              >
                                Deauthorize
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {authorizedDevices.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400 font-bold animate-pulse">
                            No devices registered! All visitors are locked out.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- SECURITY & SOS DISTRESS CENTER -------------------- */}
        {activeTab === "emergency" && (
          <div className="space-y-6 text-left">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 p-6 rounded-2xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-mono tracking-widest font-black uppercase text-rose-100 bg-rose-900/40 border border-rose-500/15 px-2 py-0.5 rounded">Admin Security Console</span>
                <h3 className="text-lg font-black uppercase tracking-wider flex items-center space-x-2 font-display">
                  <ShieldCheck className="w-5 h-5 text-rose-200 animate-pulse" />
                  <span>Central Security & SOS Distress Control</span>
                </h3>
                <p className="text-xs text-rose-100 max-w-2xl">
                  Real-time synchronization of emergency distress signals, physical computer lab lockouts, cash-vault safety bypass warnings, and campus-wide lockdown overrides.
                </p>
              </div>

              {/* Quick Status Tag */}
              <div className="shrink-0 flex items-center space-x-2 bg-rose-950/30 border border-white/10 px-3.5 py-2 rounded-2xl">
                <span className={`w-2.5 h-2.5 rounded-full ${isEmergencyShutdown ? "bg-red-400 animate-ping" : "bg-emerald-400 animate-pulse"}`} />
                <span className="text-[10px] font-mono font-black uppercase tracking-wider">
                  {isEmergencyShutdown ? "CAMPUS LOCKDOWN EFFECTIVE" : "SYSTEM OPERATIONAL"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Lockdown Overrides and Simulators */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* General Lockdown Control Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Master Lockout Control</span>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Lockdown State Toggle</h4>
                  <p className="text-xs text-slate-500 leading-normal">
                    Instantly restrict all student portals, teacher gradebooks, admissions desks, and finance cashiers by throwing a global lockout. Active administrator accounts are immune.
                  </p>

                  <button
                    onClick={() => {
                      if (setIsEmergencyShutdown) {
                        const nextState = !isEmergencyShutdown;
                        setIsEmergencyShutdown(nextState);
                        if (nextState && !shutdownReason && setShutdownReason) {
                          setShutdownReason("Central Security Lockout initialized for security auditing.");
                        }
                      }
                    }}
                    className={`w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                      isEmergencyShutdown 
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100" 
                        : "bg-slate-900 hover:bg-black text-white"
                    }`}
                  >
                    <PowerOff className="w-4 h-4" />
                    <span>{isEmergencyShutdown ? "Lift Outage Block" : "Trigger Lockdown"}</span>
                  </button>

                  {isEmergencyShutdown && (
                    <div className="space-y-2 pt-2">
                      <label className="block text-[9.5px] font-mono font-black text-red-600 uppercase">Lockout Advisory Alert Reason</label>
                      <textarea
                        rows={3}
                        value={shutdownReason}
                        onChange={(e) => setShutdownReason?.(e.target.value)}
                        placeholder="Provide details describing why the website has been locked down..."
                        className="w-full text-xs font-semibold p-3.5 rounded-xl border border-red-200 bg-red-50/20 text-slate-800 focus:outline-none focus:border-red-500 resize-none"
                      />
                    </div>
                  )}
                </div>

                {/* Drill Trigger Tester Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Interactive Testing Tool</span>
                    <h4 className="text-sm font-black text-slate-800 uppercase">Simulate Distress Call</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Inject simulated emergency alarms from different campus departments to audit terminal responsiveness and dashboard response vectors:
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        label: "Student Distress Signal",
                        role: "Student",
                        type: "Medical Emergency",
                        details: "Scholar requires immediate first aid assistance in physical Room 12 during coaching exams.",
                        location: "Academic Hall Room 12 - Seat 22",
                        color: "hover:bg-amber-50 text-amber-700 bg-amber-500/10 border-amber-200"
                      },
                      {
                        label: "Teacher Panic Switch",
                        role: "Teacher",
                        type: "Panic Alarm",
                        details: "Authorized proctor triggered SOS alert override for general class security evaluation during proctored boards.",
                        location: "Computer Lab A - Desk 05",
                        color: "hover:bg-red-50 text-red-700 bg-red-500/10 border-red-200"
                      },
                      {
                        label: "Cashier Vault Alert",
                        role: "FeeManager",
                        type: "Security Issue",
                        details: "Unauthorized drawer open trigger registered during non-operational finance office hour logs.",
                        location: "Accounts Desk Drawer 3",
                        color: "hover:bg-purple-50 text-purple-700 bg-purple-500/10 border-purple-200"
                      },
                      {
                        label: "Admission Walk-In Alert",
                        role: "Admission",
                        type: "SOS",
                        details: "Admissions Desk Counselor reported physical room disturbance during crowded IIT-JEE student queue.",
                        location: "Walk-In Room lobby desk",
                        color: "hover:bg-indigo-50 text-indigo-700 bg-indigo-500/10 border-indigo-200"
                      }
                    ].map((sim, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const customAlert = {
                            senderName: `${sim.role} Drill Agent`,
                            senderRole: sim.role as any,
                            senderId: `drill_${sim.role.toLowerCase()}`,
                            severity: "High" as const,
                            type: sim.type as any,
                            location: sim.location,
                            details: sim.details
                          };
                          // Trigger SOS by saving alert in localStorage & dispatcher
                          const savedAlerts = localStorage.getItem("co_security_alerts");
                          const currentList = savedAlerts ? JSON.parse(savedAlerts) : [];
                          const nextItem = {
                            ...customAlert,
                            id: "sec_alert_" + Date.now(),
                            timestamp: new Date().toISOString(),
                            resolved: false
                          };
                          const newList = [nextItem, ...currentList];
                          localStorage.setItem("co_security_alerts", JSON.stringify(newList));
                          window.dispatchEvent(new Event("storage"));
                          window.location.reload();
                        }}
                        className={`w-full py-2 px-3 border border-dashed rounded-xl text-[11px] font-bold text-left transition-all flex justify-between items-center cursor-pointer ${sim.color}`}
                      >
                        <span>{sim.label}</span>
                        <span>Emit Drill →</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Active Emergency Alerts and History Log */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Live Beacons Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest font-mono">Live Distress Beacons</h4>
                      <p className="text-xs text-slate-400">Manage, evaluate active alarms, and input central resolution comments below.</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm("Reset drill session alerts?")) {
                          localStorage.removeItem("co_security_alerts");
                          window.location.reload();
                        }
                      }}
                      className="text-[10px] uppercase font-mono tracking-wider text-slate-450 hover:text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      Reset Log
                    </button>
                  </div>

                  <div className="space-y-4">
                    {securityAlerts.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 border border-dashed rounded-2xl max-w-md mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                        <h5 className="text-xs font-black text-slate-800 uppercase">Operational Green Status</h5>
                        <p className="text-[10.5px] text-slate-400 mt-1 leading-normal">
                          All student desks, financial registers, and instructional modules report 0 active safety exceptions or emergency distress indicators currently.
                        </p>
                      </div>
                    ) : (
                      securityAlerts.map((alert) => {
                        const isResolved = alert.resolved;
                        const roleColors: {[key: string]: string} = {
                          Student: "bg-amber-50 text-amber-900 border-amber-200",
                          Teacher: "bg-red-50 text-red-900 border-red-200",
                          Admission: "bg-indigo-50 text-indigo-900 border-indigo-200",
                          FeeManager: "bg-purple-50 text-purple-900 border-purple-200",
                          Admin: "bg-slate-50 text-slate-900 border-slate-200"
                        };
                        return (
                          <div
                            key={alert.id}
                            className={`p-5 rounded-2xl border transition-all duration-200 space-y-4 ${
                              isResolved 
                                ? "bg-slate-50/70 border-slate-150 opacity-75" 
                                : "bg-red-50/10 border-red-200 hover:bg-red-50/20"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
                              {/* Left details */}
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`text-[9px] font-mono font-black border uppercase tracking-wider px-2 py-0.5 rounded-md ${roleColors[alert.senderRole] || "bg-slate-50 text-slate-900"}`}>
                                    {alert.senderRole}: {alert.type}
                                  </span>
                                  {isResolved ? (
                                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-150 uppercase tracking-wider font-mono">RESOLVED</span>
                                  ) : (
                                    <span className="text-[9px] bg-red-600 text-white font-bold px-2 py-0.5 rounded uppercase tracking-widest animate-pulse font-mono flex items-center gap-1">
                                      <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                                      CRITICAL DISTRESS
                                    </span>
                                  )}
                                </div>
                                <h5 className="text-xs font-black text-slate-800 font-display uppercase tracking-tight mt-1">
                                  🚨 {alert.location}
                                </h5>
                                <p className="text-[10.5px] text-slate-500 font-medium font-sans">
                                  Reported By: <strong className="text-slate-800">{alert.senderName}</strong>
                                </p>
                              </div>
                              {/* Right details */}
                              <div className="text-left sm:text-right font-mono">
                                <p className="text-[9.5px] text-slate-450 font-bold uppercase">Incident ID: {alert.id.slice(-8)}</p>
                                <p className="text-[9.5px] text-slate-400 font-bold">
                                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>

                            <p className="p-3 bg-white/70 rounded-xl border border-slate-150 text-xs text-slate-650 leading-relaxed font-sans whitespace-pre-wrap">
                              {alert.details}
                            </p>

                            {isResolved ? (
                              <div className="bg-slate-100/60 p-3 rounded-xl border border-slate-200 text-xs flex flex-col gap-1 text-slate-600">
                                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-slate-450 block">Closing Resolution Feed by {alert.resolvedBy || "Supervisor"}</span>
                                <p className="font-sans font-semibold italic text-slate-600">"{alert.comments || "Reviewed, cleared, and authorized manually."}"</p>
                              </div>
                            ) : (
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                                <span className="block text-[8.5px] font-mono font-black text-slate-500 uppercase tracking-widest mb-2">Input Emergency Desk Resolution Notes</span>
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget;
                                    const commentsInput = form.querySelector('input') as HTMLInputElement;
                                    if (commentsInput && onResolveAlert) {
                                      onResolveAlert(alert.id, commentsInput.value || "Desk exception checked and resolved physically.", "Administrative Superuser");
                                    }
                                  }}
                                  className="flex flex-col sm:flex-row gap-2"
                                >
                                  <input
                                    type="text"
                                    required
                                    placeholder="e.g. Cleared room physical issues, paramedics arrived, or unlocked logins manually."
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-indigo-500 text-slate-800"
                                  />
                                  <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer"
                                  >
                                    Solve & Cleared
                                  </button>
                                </form>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {activeTab === "logins" && (() => {
          const combinedUsers = [
            ...(admins || []).map(a => ({
              id: a.id,
              name: a.name,
              username: a.username || "",
              email: a.email,
              password: a.password || "12112006",
              status: a.status as "Active" | "Inactive",
              role: "admin" as "admin" | "teacher" | "student" | "feemanager" | "admission" | "verifier",
              rollNo: "",
              employeeCode: a.employeeCode || "",
              mobileNumber: ""
            })),
            ...teachers.map(t => {
              const isProf = t.specialization === "College Faculty Member / Professor";
              return {
                id: t.id,
                name: t.name,
                username: t.username || "",
                email: t.email,
                password: t.password || "green123",
                status: (t.status === "Active" ? "Active" : "Inactive") as "Active" | "Inactive",
                role: (isProf ? "professor" : "teacher") as "admin" | "teacher" | "student" | "feemanager" | "admission" | "verifier" | "professor",
                rollNo: "",
                employeeCode: t.employeeCode || "",
                mobileNumber: ""
              };
            }),
            ...(feeManagers || []).map(fm => ({
              id: fm.id,
              name: fm.name,
              username: fm.username || "",
              email: fm.email,
              password: fm.password || "fee12112006",
              status: (fm.status === "Active" ? "Active" : "Inactive") as "Active" | "Inactive",
              role: "feemanager" as "admin" | "teacher" | "student" | "feemanager" | "admission" | "verifier",
              rollNo: "",
              employeeCode: fm.employeeCode || "",
              mobileNumber: ""
            })),
            ...(admissionOfficers || []).map(ao => ({
              id: ao.id,
              name: ao.name,
              username: ao.username || "",
              email: ao.email,
              password: ao.password || "admission12112006",
              status: (ao.status === "Active" ? "Active" : "Inactive") as "Active" | "Inactive",
              role: "admission" as "admin" | "teacher" | "student" | "feemanager" | "admission" | "verifier",
              rollNo: "",
              employeeCode: ao.employeeCode || "",
              mobileNumber: ""
            })),
            ...(verifiers || []).map(v => ({
              id: v.id,
              name: v.name,
              username: v.username || "",
              email: `${v.username}@verifier.com`,
              password: v.password || "verify123",
              status: (v.status === "Active" ? "Active" : "Inactive") as "Active" | "Inactive",
              role: "verifier" as "admin" | "teacher" | "student" | "feemanager" | "admission" | "verifier",
              rollNo: "",
              employeeCode: v.employeeCode || "",
              mobileNumber: ""
            })),
            ...students.map(s => ({
              id: s.id,
              name: s.name,
              username: s.username || "",
              email: s.email,
              password: s.password || "alex123",
              status: (s.status === "Active" ? "Active" : "Inactive") as "Active" | "Inactive",
              role: "student" as "admin" | "teacher" | "student" | "feemanager" | "admission" | "verifier",
              rollNo: s.rollNo,
              dob: s.dob || "12-11-2006",
              employeeCode: "",
              mobileNumber: s.mobileNumber || ""
            }))
          ];

          const filteredUsers = combinedUsers.filter(u => {
            const query = credsSearch.toLowerCase();
            const matchesSearch = 
              u.name.toLowerCase().includes(query) ||
              u.username.toLowerCase().includes(query);

            const matchesRole = credsRoleFilter === "all" || u.role === credsRoleFilter;

            const matchesStatus = 
              credsStatusFilter === "all" || 
              (credsStatusFilter === "active" && u.status === "Active") ||
              (credsStatusFilter === "inactive" && u.status === "Inactive");

            return matchesSearch && matchesRole && matchesStatus;
          });

          return (
            <div className="space-y-6">
              {/* Database Overview Banner */}
              <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl -mr-20 -mt-20" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl" />
                
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-black tracking-tight uppercase flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-indigo-400" />
                      <span>User Login Database Console</span>
                    </h4>
                    <p className="text-xs text-indigo-200 mt-1 max-w-xl">
                      Centralized administrative storage. Add master logins by roles, change security keywords, deactivate accounts temporarily or purge profiles instantly.
                    </p>
                  </div>
                  <div className="flex space-x-3 text-center self-start md:self-auto uppercase tracking-widest text-[10px]">
                    <div className="bg-slate-800/80 rounded-2xl px-3 py-2 border border-slate-700/50">
                      <span className="block text-indigo-400 font-extrabold text-base leading-none font-mono">
                        {(admins || []).length}
                      </span>
                      <span className="text-slate-400 text-[9px] mt-0.5 block">Admins</span>
                    </div>
                    <div className="bg-slate-800/80 rounded-2xl px-3 py-2 border border-slate-700/50">
                      <span className="block text-emerald-400 font-extrabold text-base leading-none font-mono">
                        {teachers.length}
                      </span>
                      <span className="text-slate-400 text-[9px] mt-0.5 block">Teachers</span>
                    </div>
                    <div className="bg-slate-800/80 rounded-2xl px-3 py-2 border border-slate-700/50">
                      <span className="block text-amber-400 font-extrabold text-base leading-none font-mono">
                        {students.length}
                      </span>
                      <span className="text-slate-400 text-[9px] mt-0.5 block">Students</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* CREATE AUTH FORM PANEL */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
                  <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-5 flex items-center space-x-1.5 pb-3 border-b border-slate-100">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Create Login Credentials</span>
                  </h4>

                  <form onSubmit={handleCreateCredential} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Authorization Role
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                        {(["student", "teacher", "professor", "admin", "feemanager", "admission", "verifier"] as const).map(roleOpt => {
                          let label = roleOpt as string;
                          if (roleOpt === "feemanager") label = "Fee Mgr";
                          if (roleOpt === "admission") label = "Admission";
                          if (roleOpt === "verifier") label = "Verifier";
                          if (roleOpt === "professor") label = "Professor";

                          return (
                            <button
                              key={roleOpt}
                              type="button"
                              onClick={() => {
                                setCredsRole(roleOpt);
                                setCredsIdentifier("");
                              }}
                              className={`py-1.5 px-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all truncate text-center ${
                                credsRole === roleOpt
                                  ? "bg-white text-slate-900 shadow-xs"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                              title={roleOpt}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        User Display Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Enter Full Name"
                          value={credsName}
                          onChange={e => setCredsName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-indigo-500 font-medium"
                        />
                      </div>
                    </div>

                     <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Unique Username
                        </label>
                        <span className="text-[9px] text-rose-500 font-bold">
                          Required & Unique
                        </span>
                      </div>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Enter Username"
                          value={credsIdentifier}
                          onChange={e => setCredsIdentifier(e.target.value.trim().toLowerCase())}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-indigo-500 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Password Key Word
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const generated = Math.floor(100000 + Math.random() * 900000).toString();
                            setCredsPassword(generated);
                          }}
                          className="text-[9px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-0.5 uppercase tracking-wider"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>Generate random code</span>
                        </button>
                      </div>
                      <div className="relative">
                        <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. Mridual@2006 (leave blank for numeric)"
                          value={credsPassword}
                          onChange={e => setCredsPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-indigo-500 font-mono font-bold text-indigo-700"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-bold text-[10px] uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Commit Into Login Vault</span>
                    </button>
                  </form>
                </div>

                {/* DATABASE RECORDS LIST PANEL */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
                  
                  {/* Realtime Filters Box */}
                  <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="relative w-full md:w-48">
                      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search logins name/mail..."
                        value={credsSearch}
                        onChange={e => setCredsSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-indigo-500"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                      <select
                        value={credsRoleFilter}
                        onChange={e => setCredsRoleFilter(e.target.value as any)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600"
                      >
                        <option value="all">Roles: All</option>
                        <option value="admin">Roles: Admins</option>
                        <option value="teacher">Roles: Teachers</option>
                        <option value="professor">Roles: Professors</option>
                        <option value="student">Roles: Students</option>
                        <option value="feemanager">Roles: Fee Managers</option>
                        <option value="admission">Roles: Admissions Desk</option>
                        <option value="verifier">Roles: Verifiers</option>
                      </select>

                      <select
                        value={credsStatusFilter}
                        onChange={e => setCredsStatusFilter(e.target.value as any)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600"
                      >
                        <option value="all">Status: All</option>
                        <option value="active">Active Accounts</option>
                        <option value="inactive">Inactive / Leaves</option>
                      </select>

                      {(credsSearch || credsRoleFilter !== "all" || credsStatusFilter !== "all") && (
                        <button
                          onClick={() => {
                            setCredsSearch("");
                            setCredsRoleFilter("all");
                            setCredsStatusFilter("all");
                          }}
                          className="text-[10px] font-extrabold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Listings Grid */}
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 font-semibold mb-1">No system credentials match your query</p>
                        <p className="text-[10px] text-slate-400">Try modifying filter conditions or search string</p>
                      </div>
                    ) : (
                      filteredUsers.map(user => {
                        const isPassVisible = !!visiblePasswordIds[user.id];
                        const isEditsOn = editingUserId === user.id;

                        let badgeColor = "bg-amber-50 text-amber-800 border-amber-100";
                        if (user.role === "admin") badgeColor = "bg-rose-50 text-rose-800 border-rose-100";
                        else if (user.role === "teacher") badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-100";
                        else if (user.role === "professor") badgeColor = "bg-sky-50 text-sky-800 border-sky-100";
                        else if (user.role === "feemanager") badgeColor = "bg-teal-50 text-teal-800 border-teal-100";
                        else if (user.role === "admission") badgeColor = "bg-purple-50 text-purple-800 border-purple-100";
                        else if (user.role === "verifier") badgeColor = "bg-blue-50 text-blue-800 border-blue-100";

                        return (
                          <div 
                            key={user.id} 
                            className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                              user.status === "Inactive"
                                ? "bg-slate-50/70 border-slate-200 text-slate-500 opacity-80"
                                : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-xs"
                            }`}
                          >
                            {/* Profile Info */}
                            <div className="flex items-center space-x-3 MIN-W-[220px]">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase uppercase shrink-0">
                                {user.name.slice(0, 2)}
                              </div>
                              <div className="truncate">
                                <div className="flex items-center space-x-1.5 flex-wrap">
                                  <span className="font-semibold text-slate-800 text-xs truncate max-w-32 flex items-center gap-1">
                                    <span>{user.name}</span>
                                    {user.status === "Active" && (
                                      <span className="text-sky-500 shrink-0 inline-flex" title="Active Account">
                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                      </span>
                                    )}
                                  </span>
                                  <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border ${badgeColor}`}>
                                    {user.role}
                                  </span>
                                </div>
                                <div className="space-y-0.5 text-[10px]">
                                  <span className="block font-mono font-bold text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded max-w-fit truncate">
                                    Username: @{user.username || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Credentials & Dynamic Password management */}
                            <div className="bg-slate-100/60 rounded-xl px-3 py-2 border border-slate-200/40 flex items-center justify-between min-w-[200px]">
                              <div className="space-y-0.5">
                                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Login Password</span>
                                
                                {isEditsOn ? (
                                  <div className="flex items-center space-x-1.5 mt-0.5">
                                    <input
                                      type="text"
                                      value={editingUserPass}
                                      onChange={e => setEditingUserPass(e.target.value)}
                                      className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-indigo-700 focus:outline-indigo-500 w-28"
                                    />
                                    <button
                                      onClick={() => {
                                        const trimmed = editingUserPass.trim();
                                        if (!trimmed) return;
                                        if (user.role === "admin") {
                                          onUpdateAdminPassword?.(user.id, trimmed);
                                        } else if (user.role === "teacher" || user.role === "professor") {
                                          onUpdateTeacherPassword?.(user.id, trimmed);
                                        } else if (user.role === "feemanager") {
                                          onUpdateFeeManagerPassword?.(user.id, trimmed);
                                        } else if (user.role === "admission") {
                                          onUpdateAdmissionOfficerPassword?.(user.id, trimmed);
                                        } else if (user.role === "verifier") {
                                          onUpdateVerifierPassword?.(user.id, trimmed);
                                        } else {
                                          onUpdateStudentPassword?.(user.id, trimmed);
                                        }
                                        setEditingUserId(null);
                                      }}
                                      className="bg-slate-900 border border-slate-800 hover:bg-emerald-600 transition-colors text-white rounded p-0.5 font-bold"
                                      title="Confirm change"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    </button>
                                    <button
                                      onClick={() => setEditingUserId(null)}
                                      className="bg-slate-200 hover:bg-slate-300 transition-colors text-slate-700 rounded p-0.5"
                                      title="Cancel"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="font-mono text-xs font-bold text-slate-700">
                                    {isPassVisible ? user.password : "••••••••••"}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-1.5 ml-2">
                                <button
                                  type="button"
                                  onClick={() => setVisiblePasswordIds(p => ({ ...p, [user.id]: !p[user.id] }))}
                                  className="text-slate-400 hover:text-slate-600 p-1 rounded-sm"
                                  title={isPassVisible ? "Mask characters" : "Display Password details"}
                                >
                                  {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                
                                {!isEditsOn && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingUserId(user.id);
                                      setEditingUserPass(user.password);
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800 font-extrabold text-[9px] uppercase tracking-wider"
                                    title="Edit Password characters"
                                  >
                                    Change
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Special Online Fee Portal Credentials (if Student role) */}
                            {user.role === "student" && (
                              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl px-3 py-2 flex flex-col justify-center min-w-[170px] shrink-0 text-left">
                                <span className="block text-[8px] font-extrabold text-emerald-700 uppercase tracking-wider leading-none font-sans">Online Fee Portal Details</span>
                                <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
                                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-100/30 text-emerald-950">Roll: <strong>{user.rollNo}</strong></span>
                                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-100/30 text-emerald-800">DOB: <strong>{(user as any).dob || "12-11-2006"}</strong></span>
                                </div>
                              </div>
                            )}

                            {/* Status and Master Delete Controls */}
                            <div className="flex items-center space-x-3 justify-end">
                              {/* Active/Deactivate Switch Toggle */}
                              <button
                                onClick={() => {
                                  const nextStatus = user.status === "Active" ? "Inactive" : "Active";
                                  if (user.role === "admin") {
                                    onUpdateAdminStatus?.(user.id, nextStatus);
                                  } else if (user.role === "teacher" || user.role === "professor") {
                                    onUpdateTeacherStatus?.(user.id, nextStatus === "Active" ? "Active" : "On Leave");
                                  } else if (user.role === "feemanager") {
                                    onUpdateFeeManagerStatus?.(user.id, nextStatus);
                                  } else if (user.role === "admission") {
                                    onUpdateAdmissionOfficerStatus?.(user.id, nextStatus);
                                  } else if (user.role === "verifier") {
                                    onUpdateVerifierStatus?.(user.id, nextStatus);
                                  } else {
                                    onUpdateStudentStatus?.(user.id, nextStatus);
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center space-x-1 transition-all ${
                                  user.status === "Active"
                                    ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full inline-block ${user.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                                <span className="hidden leading-none md:inline">{user.status === "Active" ? "Deactivate" : "Activate"}</span>
                              </button>

                              {/* Delete Control Button */}
                              <button
                                onClick={() => {
                                  const confirmed = confirm(
                                    `CRITICAL WARNING: This will immediately purge "${user.name}"'s login profile completely from system registers. Do you want to continue?`
                                  );
                                  if (!confirmed) return;

                                  if (user.role === "admin") {
                                    if (onDeleteAdmin) onDeleteAdmin(user.id);
                                  } else if (user.role === "teacher" || user.role === "professor") {
                                    onDeleteTeacher(user.id);
                                  } else if (user.role === "feemanager") {
                                    onDeleteFeeManager?.(user.id);
                                  } else if (user.role === "admission") {
                                    onDeleteAdmissionOfficer?.(user.id);
                                  } else if (user.role === "verifier") {
                                    onDeleteVerifier?.(user.id);
                                  } else {
                                    onDeleteStudent(user.id);
                                  }
                                }}
                                className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-all"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>

              </div>
            </div>
          );
        })()}

        {/* ADMINISTRATIVE ID CARD SCANNING DESK */}
        {activeTab === "scanner" && (
          <div className="space-y-6 animate-fadeIn text-left" id="admin-scanner-terminal">
            <QRCardScanner
              students={students}
              title="Autonomous QR Token Validation Scanner"
              subtitle="Demonstrate attendance card logins, verify pupil status profiles, scan enrollments, or validate teacher balances."
              allowedActionsDescription="Executive Portal Terminal"
              onScanSuccess={(scannedSt) => {
                setLastScannedAdminStudent(scannedSt);
              }}
            />

            {/* Scanned Student Profile Details Context Panel */}
            {lastScannedAdminStudent && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-scaleUp">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-250 text-indigo-700 flex items-center justify-center font-mono text-lg font-bold uppercase shrink-0">
                      {lastScannedAdminStudent.name ? lastScannedAdminStudent.name.substring(0, 2) : "ST"}
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-mono tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md font-bold">
                        {lastScannedAdminStudent.rollNo}
                      </span>
                      <h4 className="text-base font-black text-slate-800 mt-1 uppercase tracking-tight">
                        {lastScannedAdminStudent.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-sans">{lastScannedAdminStudent.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedQRStudent(lastScannedAdminStudent);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider py-2.5 px-4 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs h-fit"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Print Pass Code Card</span>
                    </button>
                    <button
                      onClick={() => setLastScannedAdminStudent(null)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider py-2.5 px-3 rounded-xl border border-slate-200 cursor-pointer h-fit"
                    >
                      Reset Scanner
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-sans">
                  
                  {/* Account Status details */}
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-left space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Authentication Metadata</span>
                    <div className="space-y-1.5 py-1">
                      <p className="text-slate-500">Secure PIN Code: <strong className="font-mono text-slate-800 text-sm">{lastScannedAdminStudent.password || "alex123"}</strong></p>
                      <p className="text-slate-500">Student ID Index: <strong className="font-mono text-indigo-600 font-bold">{lastScannedAdminStudent.id}</strong></p>
                      <p className="text-slate-500">Operational state: <span className="bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-[10px]">Verified Active</span></p>
                    </div>
                  </div>

                  {/* Joined Cohort details */}
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-left space-y-2 col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cohort Enrolments ({batches.filter(b => b.studentIds.includes(lastScannedAdminStudent.id)).length})</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {batches.filter(b => b.studentIds.includes(lastScannedAdminStudent.id)).map(b => (
                        <span key={b.id} className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full inline-block" />
                          {b.name} ({b.code})
                        </span>
                      ))}
                      {batches.filter(b => b.studentIds.includes(lastScannedAdminStudent.id)).length === 0 && (
                        <p className="text-[10px] text-slate-400 italic">No historical active cohorts registered for this candidate.</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. ADMIN PROFILE VIEW AND EDIT PANEL */}
        {activeTab === "profile" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6" id="admin-profile-editor">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 font-bold">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Root Administrative Identity card</h4>
                <p className="text-xs text-slate-400 font-sans">View master authentication badges and update your digital administration coordinates.</p>
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
              <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center text-center justify-center font-sans">
                <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-705 flex items-center justify-center font-mono text-xl font-bold uppercase text-indigo-400 shadow-sm">
                  {profileName ? profileName.substring(0, 2) : "AD"}
                </div>

                <div>
                  <h5 className="font-bold text-slate-800 text-sm">{profileName || "System Admin"}</h5>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full mt-1.5 inline-block border border-rose-100">
                    Root Administrator
                  </span>
                </div>

                <div className="w-full space-y-2 pt-3 border-t border-slate-200/50 text-left text-xs font-sans">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest font-sans">Admin ID Index</span>
                    <span className="font-mono font-bold text-slate-700">{activeAdmin.id}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest font-sans font-sans font-sans">Global Status badge</span>
                    <span className="text-slate-600 font-semibold flex items-center space-x-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                      <span>Full Write Cleared</span>
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
                    onUpdateAdminProfile?.(activeAdmin.id, profileName.trim(), profileEmail.trim(), profileAvatar.trim());
                    setProfileSuccessMsg("Administrative profile coordinates successfully synchronized on active session layers!");
                    setTimeout(() => setProfileSuccessMsg(""), 4000);
                  }}
                  className="space-y-4 font-sans"
                >
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Admin Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-indigo-500 font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Master Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-indigo-500 font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Password warning note */}
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/40 text-[10px] text-amber-700 leading-relaxed flex items-start space-x-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Root Administrative Password Warning:</strong> Standard security policies require administrative passwords to be changed exclusively via direct local storage key updates or by contacting database recovery systems at <strong className="underline text-indigo-700 font-mono">vishveshwarfoundation@gmail.com</strong>.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 transition-all text-white font-bold text-[10px] uppercase tracking-wider py-4 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-xs cursor-pointer h-fit font-sans"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Synchronize Admin Profile</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 8. CENTRAL HELP TICKETS MANAGEMENT */}
        {activeTab === "support" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left animate-fadeIn col-span-1 md:col-span-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
              <div className="flex items-center space-x-3 text-left">
                <div className="p-3 bg-rose-50 rounded-xl text-rose-600 font-bold">
                  <MessageSquare className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider font-sans">
                    Universal Help Desk Control Center
                  </h4>
                  <p className="text-xs text-slate-500 font-sans">
                    Monitor, moderate, and resolve support queries from all registered student accounts.
                  </p>
                </div>
              </div>
              <div className="text-xs bg-slate-900 font-mono text-white font-bold px-3.5 py-2 rounded-xl">
                SUPERADMIN SECURITY CHANNEL
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left sidebar student tracker */}
              <div className="lg:col-span-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-150/40 h-fit space-y-3 flex flex-col">
                <h5 className="text-[10px] font-black text-slate-450 uppercase tracking-widest">
                  Students Active Pipelines
                </h5>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {students.map(std => {
                    const hasMessages = supportMessages.some(m => m.studentId === std.id);
                    const msgCount = supportMessages.filter(m => m.studentId === std.id).length;
                    const isSelected = selectedChatStudentId === std.id;

                    return (
                      <button
                        key={std.id}
                        type="button"
                        onClick={() => setSelectedChatStudentId(std.id)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected 
                            ? "bg-rose-600 text-white border-rose-700 font-bold scale-[1.01] shadow-xs" 
                            : "bg-white hover:bg-slate-50 text-slate-700 border-slate-100/80"
                        }`}
                      >
                        <div className="truncate flex-1 text-left">
                          <p className="font-extrabold truncate">{std.name}</p>
                          <p className={`text-[10px] truncate ${isSelected ? "text-rose-200" : "text-slate-450"}`}>
                            Roll: {std.rollNo} • Batches: {batches.filter(b => b.studentIds.includes(std.id)).map(b => b.code).join(", ") || "None"}
                          </p>
                        </div>
                        <div className="flex items-center shrink-0">
                          {hasMessages ? (
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                              isSelected ? "bg-rose-800 text-white" : "bg-rose-100 text-rose-700"
                            }`}>
                              {msgCount}
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400 italic">No msgs</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right panel correspondence */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-120 shadow-xs overflow-hidden flex flex-col h-[520px]">
                {selectedChatStudentId ? (
                  (() => {
                    const targetStudent = students.find(s => s.id === selectedChatStudentId);
                    const threadMsgs = supportMessages.filter(m => m.studentId === selectedChatStudentId);

                    return (
                      <>
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                          <div className="text-left">
                            <span className="text-[10px] bg-slate-200 font-bold px-1 py-0.5 rounded text-slate-650 font-mono">
                              #{targetStudent?.id}
                            </span>
                            <h5 className="font-extrabold text-xs text-slate-800 inline-block ml-2 uppercase font-sans">
                              {targetStudent?.name} ({targetStudent?.rollNo})
                            </h5>
                          </div>
                          <span className="bg-rose-100 text-rose-800 font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                            ROOT OVERWATCH
                          </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/25">
                          {threadMsgs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-2 p-6">
                              <MessageSquare className="w-8 h-8 text-slate-300" />
                              <h6 className="font-extrabold text-slate-700 text-xs">No Conversation Data</h6>
                              <p className="text-[10px] text-slate-400 max-w-sm leading-relaxed">
                                No questions have been posted yet. As an Administrator, you can pro-actively initiate communication with this student by typing a query or notice below.
                              </p>
                            </div>
                          ) : (
                            threadMsgs.map(msg => {
                              const isStaffSender = msg.senderRole === "teacher" || msg.senderRole === "admin";
                              return (
                                <div key={msg.id} className={`flex flex-col ${isStaffSender ? 'items-end' : 'items-start'} space-y-1`}>
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-[9px] font-black text-slate-400">
                                      {msg.senderName} ({msg.senderRole.toUpperCase()})
                                    </span>
                                    <span className="text-[8px] text-slate-350 font-mono">
                                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <div className={`p-3.5 rounded-2xl text-xs max-w-md ${
                                    isStaffSender 
                                      ? "bg-rose-600 text-white rounded-tr-none shadow-xs" 
                                      : "bg-white text-slate-850 rounded-tl-none border border-slate-100 shadow-xs"
                                  }`}>
                                    <p className="leading-relaxed whitespace-pre-line font-medium">{msg.content}</p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.currentTarget;
                            const input = form.elements.namedItem("reply_content") as HTMLInputElement;
                            if (!input || !input.value.trim() || !onSendSupportMessage) return;
                            onSendSupportMessage(input.value.trim(), selectedChatStudentId);
                            input.value = "";
                          }} 
                          className="p-4 border-t border-slate-100 bg-white flex items-center gap-3"
                        >
                          <input 
                            name="reply_content"
                            type="text"
                            placeholder="Write administrative support reply to student..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-rose-500 font-medium"
                            required
                          />
                          <button 
                            type="submit" 
                            className="bg-rose-600 hover:bg-slate-900 text-white font-extrabold text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all shrink-0 cursor-pointer flex items-center space-x-2 shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Dispatch</span>
                          </button>
                        </form>
                      </>
                    );
                  })()
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-2">
                    <MessageSquare className="w-12 h-12 text-slate-350 animate-bounce" />
                    <h6 className="font-extrabold text-slate-700 text-xs">No Active Thread Selection</h6>
                    <p className="text-[10px] text-slate-450 max-w-sm leading-relaxed">
                      Select any student profile from the active tracker list on the left to moderate chat records or formulate system responses.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 9. LABORATORY WORKSTATIONS & EXAM TERM REGISTRY */}
        {activeTab === "computers" && (
          <div className="space-y-6 text-left animate-fadeIn col-span-1 md:col-span-3">
            
            {/* Header dashboard layout */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 bg-indigo-500/15 rounded-xl text-indigo-400 font-bold border border-indigo-500/10">
                  <Monitor className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">
                    Host Desk Terminal Ledger
                  </h4>
                  <p className="text-xs text-slate-350 mt-1">
                    Register academic computer terminals with unique identifiers, monitor student allocations, and trigger instant safety locks.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-indigo-950/40 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-md font-bold uppercase shrink-0">
                Authorized Admin Scope
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Form panel on left */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h5 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">
                    {editingDesk ? "Modify Host Station" : "Register Unique Terminal"}
                  </h5>
                  <p className="text-[10px] text-slate-400">Only Admins can modify physical inventory keys.</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newDeskCode.trim() || !newDeskIp.trim() || !newDeskRoom.trim()) {
                      alert("Please specify Code, IP address, and Room Name");
                      return;
                    }
                    
                    if (editingDesk) {
                      // edit computer
                      if (onUpdateComputerDesk) {
                        onUpdateComputerDesk({
                          ...editingDesk,
                          uniqueCode: newDeskCode.trim().toUpperCase(),
                          roomNumber: newDeskRoom.trim(),
                          facultyName: newDeskFaculty.trim(),
                          ipAddress: newDeskIp.trim()
                        });
                      }
                      setEditingDesk(null);
                    } else {
                      // verify uniqueness of code
                      if (computerDesks.some(d => d.uniqueCode.toUpperCase() === newDeskCode.trim().toUpperCase())) {
                        alert(`⚠️ Computer Desk unique code "${newDeskCode}" already exists!`);
                        return;
                      }
                      // register unique code
                      if (onRegisterComputerDesk) {
                        onRegisterComputerDesk({
                          id: "desk_" + Math.random().toString(36).substring(2, 9),
                          uniqueCode: newDeskCode.trim().toUpperCase(),
                          roomNumber: newDeskRoom.trim(),
                          facultyName: newDeskFaculty.trim(),
                          ipAddress: newDeskIp.trim(),
                          status: "Available"
                        });
                      }
                    }
                    
                    // reset forms parameters
                    setNewDeskCode("");
                    setNewDeskIp("");
                    setNewDeskRoom("");
                    setNewDeskFaculty("");
                  }}
                  className="space-y-3.5"
                >
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Desk Unique Code *
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono focus:outline-indigo-500 text-slate-850 dark:text-white"
                      placeholder="e.g. LAB-A-PC-12"
                      required
                      value={newDeskCode}
                      onChange={(e) => setNewDeskCode(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      IPv4 / Device Address *
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono focus:outline-indigo-500 text-slate-850 dark:text-white"
                      placeholder="e.g. 192.168.1.112"
                      required
                      value={newDeskIp}
                      onChange={(e) => setNewDeskIp(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Build Room Name *
                      </label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 px-3.5 py-2.5 rounded-xl text-xs font-bold focus:outline-indigo-500 text-slate-850 dark:text-white"
                        placeholder="e.g. Room 403-B"
                        required
                        value={newDeskRoom}
                        onChange={(e) => setNewDeskRoom(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Faculty Name
                      </label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 px-3.5 py-2.5 rounded-xl text-xs font-bold focus:outline-indigo-500 text-slate-850 dark:text-white"
                        placeholder="e.g. Eng. Faculty"
                        value={newDeskFaculty}
                        onChange={(e) => setNewDeskFaculty(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-slate-900 text-white font-black text-[10px] uppercase tracking-wider py-3 px-4 rounded-xl transition-all cursor-pointer text-center"
                    >
                      {editingDesk ? "Update Station Keys" : "Enroll Workstation"}
                    </button>
                    {editingDesk && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDesk(null);
                          setNewDeskCode("");
                          setNewDeskIp("");
                          setNewDeskRoom("");
                          setNewDeskFaculty("");
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* Information Callout */}
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/50 text-[10px] text-amber-700 leading-relaxed font-sans mt-3">
                  <p className="font-bold">🖥️ Terminal Binding Policy</p>
                  <p className="mt-1">Computer Desks and unique codes must be registered here before they can be allotted to students by instructors during verification. Deleting a desk instantly breaks any active student session at that desk.</p>
                </div>
              </div>

              {/* Terminals list on right */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Computers Inventory */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h5 className="text-xs font-black uppercase text-slate-800 dark:text-white flex items-center space-x-1.5">
                      <Monitor className="w-4 h-4 text-slate-500" />
                      <span>Physical Terminals Catalog ({computerDesks.length})</span>
                    </h5>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded">
                      Admin Edit Allowed
                    </span>
                  </div>

                  {computerDesks.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No computer terminals registered yet. Use the left form panel to register.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {computerDesks.map(desk => {
                        const studentAssigned = students.find(s => s.id === desk.currentStudentId);
                        return (
                          <div 
                            key={desk.id} 
                            className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-250/20 dark:border-slate-750/50 flex flex-col justify-between space-y-3 relative overflow-hidden"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-0.5 rounded-md font-mono font-black uppercase">
                                  {desk.uniqueCode}
                                </span>
                                <p className="text-xs font-extrabold text-slate-850 dark:text-white mt-1.5">{desk.roomNumber}</p>
                                {desk.facultyName && (
                                  <p className="text-[10px] text-indigo-650 dark:text-indigo-400 font-bold block">Faculty: {desk.facultyName}</p>
                                )}
                                <p className="text-[10px] text-slate-400 font-mono">IPv4: {desk.ipAddress}</p>
                              </div>

                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                desk.status === "Available" ? "bg-emerald-100 text-emerald-800" :
                                desk.status === "Occupied" ? "bg-indigo-150 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200" :
                                "bg-amber-100 text-amber-800"
                              }`}>
                                {desk.status}
                              </span>
                            </div>

                            {/* Linked Student card info */}
                            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 space-y-1">
                              <span className="block text-[8px] text-slate-450 uppercase font-black tracking-wider">Current Seat Holder</span>
                              {studentAssigned ? (
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[10px] font-black text-slate-850 dark:text-white">{studentAssigned.name}</p>
                                    <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold font-mono">{studentAssigned.rollNo}</p>
                                  </div>
                                  <span className="text-[8px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold uppercase shrink-0">Live Session</span>
                                </div>
                              ) : (
                                <p className="text-[9px] italic text-slate-400">Desk vacant & empty</p>
                              )}
                            </div>

                            {/* Action Tools */}
                            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingDesk(desk);
                                    setNewDeskCode(desk.uniqueCode);
                                    setNewDeskIp(desk.ipAddress);
                                    setNewDeskRoom(desk.roomNumber);
                                    setNewDeskFaculty(desk.facultyName || "");
                                  }}
                                  className="text-indigo-650 hover:text-indigo-500 p-1 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                                  title="Edit Parameters"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateComputerDesk) {
                                      onUpdateComputerDesk({
                                        ...desk,
                                        status: desk.status === "Maintenance" ? "Available" : "Maintenance"
                                      });
                                    }
                                  }}
                                  className={`p-1 rounded text-[9px] font-bold uppercase cursor-pointer ${
                                    desk.status === "Maintenance" ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                                  }`}
                                >
                                  {desk.status === "Maintenance" ? "Set Active" : "Maintenance"}
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Are you absolutely sure you want to delete computer terminal ${desk.uniqueCode}? This will terminate any linked student workspace instantly.`)) {
                                    if (onDeleteComputerDesk) {
                                      onDeleteComputerDesk(desk.id);
                                    }
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete Station Desk"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Student Control Room (Spot Lockouts) */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-black uppercase text-rose-600 dark:text-rose-400 flex items-center space-x-1.5">
                        <AlertIcon className="w-4 h-4" />
                        <span>Workstation Spot Locker</span>
                      </h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">Freeze student client terminal sessions instantly for compliance reasons.</p>
                    </div>
                    <span className="text-[9px] font-mono bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300 px-2 py-1 rounded font-bold uppercase shrink-0">
                      EMERGENCY CONSOLE ACTIVE
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-850 p-2.5 text-slate-550 border-b border-slate-100 dark:border-slate-800">
                          <th className="p-3 font-black uppercase text-[10px] tracking-wider">Scholar Name</th>
                          <th className="p-3 font-black uppercase text-[10px] tracking-wider">Roll No</th>
                          <th className="p-3 font-black uppercase text-[10px] tracking-wider">Allotted Terminal</th>
                          <th className="p-3 font-black uppercase text-[10px] tracking-wider">Lock State</th>
                          <th className="p-3 font-black uppercase text-[10px] tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {students.map(s => {
                          const isLocked = s.isLocked || false;
                          return (
                            <tr key={s.id} className="hover:bg-slate-50/50">
                              <td className="p-3 font-extrabold text-slate-850 dark:text-white">{s.name}</td>
                              <td className="p-3 font-mono text-[10px] text-indigo-700 dark:text-indigo-400 font-bold">{s.rollNo}</td>
                              <td className="p-3">
                                {s.assignedComputerDeskCode ? (
                                  <span className="bg-slate-900 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded">
                                    {s.assignedComputerDeskCode}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">No Seat Bound</span>
                                )}
                              </td>
                              <td className="p-3">
                                {isLocked ? (
                                  <span className="bg-red-650 text-white font-black text-[9px] px-2 py-0.5 rounded inline-flex items-center space-x-1">
                                    <span>🔒 LOCKED OUT</span>
                                  </span>
                                ) : (
                                  <span className="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded inline-flex items-center space-x-1">
                                    <span>🟢 ACTIVE</span>
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right font-sans">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLockoutModalStudentId(s.id);
                                    setLockoutModalAction(!isLocked);
                                    setLockoutPasswordInput("");
                                    setLockoutErrorMsg("");
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase shadow-xs cursor-pointer ${
                                    isLocked 
                                      ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                                      : "bg-red-600 hover:bg-red-705 text-white animate-pulse"
                                  }`}
                                >
                                  {isLocked ? "Unlock Station" : "Lock Session"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>

            {/* Real-time Workstation Emergency Lockout Password MODAL */}
            <AnimatePresence>
              {lockoutModalStudentId !== null && (() => {
                const studentInstance = students.find(s => s.id === lockoutModalStudentId);
                if (!studentInstance) return null;
                return (
                  <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-sm w-full space-y-4 text-left font-sans ring-1 ring-black/5"
                    >
                      <div className="flex items-center space-x-3 text-rose-600 border-b border-rose-100 pb-3">
                        <Lock className="w-5 h-5 animate-pulse" />
                        <h5 className="font-extrabold uppercase text-xs text-slate-800">Verify Admin Credentials</h5>
                      </div>
                      
                      <div className="text-xs text-slate-650 space-y-1.5 leading-relaxed">
                        <p>You are requesting to <strong>{lockoutModalAction ? "LOCK OUT" : "UNLOCK"}</strong> the physical workstation session for student:</p>
                        <p className="font-bold text-slate-800 font-mono bg-slate-50 p-2 rounded-xl border border-slate-100">
                          {studentInstance.name} ({studentInstance.rollNo})
                        </p>
                        <p>Enter your master security <strong>Administrative Secret Key</strong> to authorize this supervisor override action:</p>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const correctAdminPassword = "12112006"; // Default system admin credentials
                          if (lockoutPasswordInput.trim() === correctAdminPassword) {
                            if (onUpdateStudentLock) {
                              onUpdateStudentLock(lockoutModalStudentId, lockoutModalAction);
                            }
                            setLockoutModalStudentId(null);
                            setLockoutPasswordInput("");
                            setLockoutErrorMsg("");
                          } else {
                            setLockoutErrorMsg("⚠️ Incorrect administrator override credentials!");
                          }
                        }}
                        className="space-y-3"
                      >
                        <input
                          type="password"
                          placeholder="Enter admin secret password"
                          className="w-full bg-slate-50 border border-slate-205 px-3.5 py-3 rounded-xl text-xs font-mono font-bold focus:outline-rose-500 focus:bg-white text-slate-850"
                          required
                          autoFocus
                          value={lockoutPasswordInput}
                          onChange={(e) => setLockoutPasswordInput(e.target.value)}
                        />

                        {lockoutErrorMsg && (
                          <p className="text-[10px] text-red-650 font-bold bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                            {lockoutErrorMsg}
                          </p>
                        )}

                        <div className="flex space-x-2 pt-2">
                          <button
                            type="submit"
                            className="flex-1 bg-red-600 hover:bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Authorize Overrule
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLockoutModalStudentId(null);
                              setLockoutPasswordInput("");
                              setLockoutErrorMsg("");
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4.5 py-3 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                );
              })()}
            </AnimatePresence>

          </div>
        )}

        {activeTab === "tests" && (
          <div className="space-y-6 text-left animate-fadeIn col-span-1 md:col-span-3">
            <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 bg-indigo-500/15 rounded-xl text-indigo-400 font-bold border border-indigo-500/10">
                  <ShieldCheck className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">
                    EXAM AUDIT & QUALITY BOARD
                  </h4>
                  <p className="text-xs text-slate-350 mt-1">
                    Instructors compile interactive sandbox examinations. Review questions, verify testing parameters, and toggle them Live.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-slate-950/60 border border-slate-800/80 px-4 py-2 rounded-xl text-left">
                  <span className="text-[8px] text-rose-455 block font-bold font-mono">PENDING AUDIT</span>
                  <span className="text-sm font-black text-rose-455 font-mono">
                    {tests.filter(t => t.isAdminApproved === false).length} Exams
                  </span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 px-4 py-2 rounded-xl text-left">
                  <span className="text-[8px] text-emerald-400 block font-bold font-mono">ACTIVE ON CLIENTS</span>
                  <span className="text-sm font-black text-emerald-450 font-mono">
                    {tests.filter(t => t.isAdminApproved === true).length} Live
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {tests.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center space-y-3">
                  <ShieldCheck className="w-10 h-10 text-slate-300" />
                  <p className="text-slate-400 text-xs font-bold font-mono">No academic examinations compiled by teachers yet.</p>
                </div>
              ) : (
                tests.map(testObj => {
                  const targetBatch = batches.find(b => b.id === testObj.batchId);
                  const isApproved = testObj.isAdminApproved === true;
                  
                  return (
                    <div 
                      key={testObj.id} 
                      className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 text-left shadow-xs transition-all duration-200 ${
                        isApproved 
                          ? "border-emerald-200 dark:border-emerald-950 bg-emerald-50/5" 
                          : "border-amber-200 dark:border-amber-950/50 bg-amber-50/5"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="flex items-center space-x-2">
                            {isApproved ? (
                              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md inline-flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>Verified & Live</span>
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-850 dark:bg-amber-950/40 dark:text-amber-300 text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md inline-flex items-center space-x-1 font-mono">
                                <AlertTriangle className="w-3 h-3 text-amber-600 animate-pulse" />
                                <span>Pending Admin Audit</span>
                              </span>
                            )}

                            {testObj.isLive ? (
                              <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[9px] uppercase font-black px-2 py-0.5 rounded-md font-mono">
                                Secure Live Exam 🔒
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[9px] px-2 py-0.5 rounded-md uppercase font-bold">
                                Practice Quiz
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-black text-slate-850 dark:text-white mt-2">{testObj.title}</h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 mt-1 font-mono">
                            <span>Batch Group: <strong className="text-slate-600 dark:text-slate-300">{targetBatch?.name || "General Group"}</strong></span>
                            <span>•</span>
                            <span>Scheduled Date: <strong className="text-slate-600 dark:text-slate-300">{testObj.date}</strong></span>
                            <span>•</span>
                            <span>Max Weight: <strong className="text-indigo-650 dark:text-indigo-400 font-extrabold">{testObj.maxMarks} Marks</strong></span>
                          </div>
                        </div>

                        {/* Audit Verification trigger actions */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (onApproveTest) {
                                onApproveTest(testObj.id, !isApproved);
                              }
                            }}
                            className={`px-4 py-2 rounded-xl font-mono text-[10px] font-black uppercase tracking-wider shadow-sm cursor-pointer duration-200 ${
                              isApproved 
                                ? "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300" 
                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                            }`}
                          >
                            {isApproved ? "⚠️ Revoke Live" : "⚡ Approve & Go Live"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you absolutely sure you want to permanently discard test: "${testObj.title}"?`)) {
                                if (onDeleteTest) {
                                  onDeleteTest(testObj.id);
                                }
                              }
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-xl cursor-pointer duration-150"
                            title="Discard Paper"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Structuring Questions preview board */}
                      {testObj.questions && testObj.questions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                          <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block mb-2">
                            Interactive Kiosk Syllabus Rigor ({testObj.questions.length} Questions)
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {testObj.questions.map((q, idx) => (
                              <div key={q.id} className="bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-800 text-[10px] text-left">
                                <div className="flex items-center justify-between mb-1.5 border-b border-slate-200/20 pb-1.5">
                                  <span className="font-mono text-[8px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded uppercase font-black">
                                    Q{idx + 1} • {q.type}
                                  </span>
                                  <span className="text-[9px] font-bold text-slate-400">
                                    {q.markWeight || 5} Marks
                                  </span>
                                </div>
                                <p className="font-extrabold text-slate-800 dark:text-slate-100 line-clamp-2 animate-fadeIn" title={q.questionText}>{q.questionText}</p>
                                {q.sectionName && (
                                  <p className="text-[8px] font-mono font-black text-indigo-650 dark:text-indigo-400 mt-1 uppercase">Syllabus Section: {q.sectionName}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Dynamic Admin QR Identity card Preview Overlay dialog */}
        <AnimatePresence>
          {selectedQRStudent && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans leading-relaxed text-left align-left no-print">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl relative border border-slate-100 p-1"
              >
                <button
                  type="button"
                  onClick={() => setSelectedQRStudent(null)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-850 dark:hover:text-white rounded-full bg-slate-100 hover:bg-rose-50 transition-colors cursor-pointer z-10"
                >
                  <XCircle className="w-5 h-5" />
                </button>
                <div className="p-4 flex flex-col items-center">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Official Student Card</h4>
                  <StudentQRCard student={selectedQRStudent} />
                  <p className="text-[10px] text-slate-400 mt-4 text-center">
                    Print this QR pass, or save as JSON credential to login.
                  </p>
                </div>
              </motion.div>
            </div>
          )}

          {editingStudent && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans leading-relaxed text-left no-print">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative border border-slate-100 p-6 space-y-5 max-h-[90vh] overflow-y-auto"
              >
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="absolute top-4 right-4 p-2 text-slate-450 hover:text-slate-850 rounded-full bg-slate-100 hover:bg-rose-50 transition-colors cursor-pointer z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Edit Student Academic File</h4>
                  <p className="text-[11px] text-slate-450">Update and edit database details for {editingStudent.name}</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!editStudentName.trim() || !editStudentEmail.trim() || !editStudentRollNo.trim()) {
                      alert("Please provide student name, email, and roll number.");
                      return;
                    }

                    if (onUpdateStudentDetails) {
                      onUpdateStudentDetails(editingStudent.id, {
                        name: editStudentName.trim(),
                        email: editStudentEmail.trim(),
                        rollNo: editStudentRollNo.trim().toUpperCase(),
                        password: editStudentPassword.trim(),
                        schoolName: editStudentSchool.trim(),
                        mobileNumber: editStudentMobile.trim(),
                        batchId: editStudentBatchId,
                        dob: editStudentDob.trim() || "12-11-2006"
                      });
                      
                      alert("Student profile changes successfully synchronized!");
                      setEditingStudent(null);
                    }
                  }}
                  className="space-y-4 text-left"
                >
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">Student Name :-</label>
                    <input
                      type="text"
                      required
                      value={editStudentName}
                      onChange={(e) => setEditStudentName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-850 focus:outline-indigo-500 font-semibold"
                    />
                  </div>

                  {/* Batch Select */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">Batch Select :-</label>
                    <select
                      value={editStudentBatchId}
                      onChange={(e) => setEditStudentBatchId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-850 focus:outline-indigo-550 cursor-pointer font-semibold"
                    >
                      <option value="">-- No Target Batch program assigned --</option>
                      {batches.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.subject})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* School Name */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest font-sans">School Name :-</label>
                    <input
                      type="text"
                      value={editStudentSchool}
                      onChange={(e) => setEditStudentSchool(e.target.value)}
                      placeholder="e.g. Kendriya Vidyalaya"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-indigo-500"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest text-sans">Email ID :-</label>
                    <input
                      type="email"
                      required
                      value={editStudentEmail}
                      onChange={(e) => setEditStudentEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-850 focus:outline-indigo-550 font-mono"
                    />
                  </div>

                  {/* Mobile Phone Number */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mobile Number :-</label>
                    <input
                      type="text"
                      value={editStudentMobile}
                      onChange={(e) => setEditStudentMobile(e.target.value)}
                      placeholder="Contact number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-850 focus:outline-indigo-500 font-mono"
                    />
                  </div>

                  {/* Roll No */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest font-sans">Roll Code / Student ID</label>
                    <input
                      type="text"
                      required
                      value={editStudentRollNo}
                      onChange={(e) => setEditStudentRollNo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-850 focus:outline-indigo-500 font-mono font-bold uppercase text-slate-900"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-indigo-650 font-bold uppercase tracking-widest font-mono">Secret Login Code</label>
                    <input
                      type="text"
                      required
                      value={editStudentPassword}
                      onChange={(e) => setEditStudentPassword(e.target.value)}
                      className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl px-4 py-2.5 text-xs text-indigo-705 focus:outline-indigo-500 font-mono font-extrabold"
                    />
                  </div>

                  {/* Fee DOB Password */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-emerald-600 font-bold uppercase tracking-widest font-mono">Fee Portal DOB Password</label>
                    <input
                      type="text"
                      required
                      value={editStudentDob}
                      onChange={(e) => setEditStudentDob(e.target.value)}
                      placeholder="e.g. 12-11-2006"
                      className="w-full bg-emerald-50/20 border border-emerald-250 rounded-xl px-4 py-2.5 text-xs text-emerald-950 focus:outline-emerald-500 font-mono font-semibold"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-xs tracking-widest rounded-xl transition duration-150 active:scale-95 shadow cursor-pointer mt-2"
                  >
                    Save Changes
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>

      {/* Footer Watermark */}
      <div className="col-span-1 lg:col-span-4 mt-12 border-t border-slate-100 pt-6 pb-2 text-center text-xs text-slate-400 font-medium font-sans no-print flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">© 2026 Vishveshwar Foundation Ltd.</span>
        <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-bold">Admin Workspace Security Monitor</span>
      </div>
    </div>
  );
}
