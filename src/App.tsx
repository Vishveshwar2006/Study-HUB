import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playAnnouncementSound } from "./utils/sound";
import {
  GraduationCap,
  ShieldAlert,
  ShieldCheck,
  Award,
  BookOpen,
  Users,
  Megaphone,
  CheckSquare,
  Sparkles,
  Lock,
  Clock,
  LogOut,
  Key,
  UserCheck,
  X,
  XCircle,
  CreditCard,
  Receipt,
  ClipboardList,
  CheckCircle,
  PowerOff,
  RefreshCw,
  Smartphone,
  Laptop,
  Fingerprint,
  Terminal,
  LayoutDashboard,
  HelpCircle,
  Compass,
  Bookmark,
  QrCode,
  Download,
  Copy,
  Share2,
  School as SchoolIcon,
  Bell,
  BellRing,
  Plus,
  Trash2,
  Paperclip,
  Youtube,
  Settings,
  UserPlus,
  Menu,
  Search,
  Volume2,
  Eye,
  EyeOff,
  Home,
  Globe,
  Bot,
  Send,
  MessageSquare,
  Minimize2,
  MapPin,
  Navigation,
  LocateFixed,
  ExternalLink,
  Map as MapIcon,
  ShoppingBag,
  Headphones,
  Boxes,
  Truck,
} from "lucide-react";

import {
  Batch,
  Teacher,
  Student,
  Lesson,
  Test,
  Announcement,
  OnlineAnnouncement,
  AdminUser,
  FeeInvoice,
  SupportMessage,
  ComputerDesk,
  TestSubmission,
  FeeManager,
  ContactLead,
  PublicBatch,
  AttendanceRecord,
  AuthorizedDevice,
  School,
  AppNotification,
  SecuritySOSAlert,
  AdmissionOfficer,
  CounsellingRequest,
  CounsellingSlot,
  AdmissionRequest,
  Verifier,
  Course,
  StoreItem,
  StoreOrder,
  StudyHubCenter,
  ExamSubject,
  ExamForm,
  ExamStudentMarksheet,
  BranchPIN,
  ExamPortalSettings,
} from "./types";
import {
  initialBatches,
  initialTeachers,
  initialStudents,
  initialLessons,
  initialTests,
  initialAnnouncements,
  initialFees,
  initialSupportMessages,
  initialLeads,
  initialStudyHubCenters,
  initialExamSubjects,
  initialExamSettings,
  initialExamForms,
  initialExamMarksheets,
  initialBranchPINs,
} from "./data";

import AdminDashboard from "./components/AdminDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";
import FeeDashboard from "./components/FeeDashboard";
import PrincipalDashboard from "./components/PrincipalDashboard";
import AdmissionOfficeDashboard from "./components/AdmissionOfficeDashboard";
import VerifierDashboard from "./components/VerifierDashboard";
import PublicWebsite from "./components/PublicWebsite";
import CourseManager from "./components/CourseManager";
import StoreView from "./components/StoreView";
import InventoryManager from "./components/InventoryManager";
import OnboardingTutorial from "./components/OnboardingTutorial";
import StudentExamPortal from "./components/exam/StudentExamPortal";
import TeacherExamPortal from "./components/exam/TeacherExamPortal";
import AdminExamPortal from "./components/exam/AdminExamPortal";
import { Wifi, WifiOff, Database } from "lucide-react";


import { db, auth } from "./firebase";
import { signInAnonymously, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import {
  getDeletedIds,
  markIdAsDeleted,
  clearDeletedId,
  isIdDeleted,
  areItemsEqual,
  areItemListsEqual,
  sanitizeForFirestore,
} from "./lib/firestoreSync";

/**
 * Robust initial state loader that guarantees deleted items are NEVER restored
 * from stale localStorage cache or mock fallback arrays.
 */
function loadInitialCollectionState<T extends { id: string }>(
  collectionName: string,
  fallback: T[],
  storageKey?: string,
): T[] {
  const deletedIds = getDeletedIds(collectionName);
  const key = storageKey || "co_" + collectionName.toLowerCase();
  let items: T[] = fallback;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        items = parsed;
      }
    }
  } catch (e) {
    // fallback
  }
  return (items || []).filter(
    (item) => item && item.id && !deletedIds.has(String(item.id))
  );
}

export function getRandomAvatarUrl(name: string): string {
  const images = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
  ];
  if (!name) return images[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h << 5) - h + name.charCodeAt(i);
    h |= 0;
  }
  return images[Math.abs(h) % images.length];
}

export default function App() {
  // Session authentication state synced with LocalStorage
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem("co_is_logged_in");
    return saved === "true";
  });

  const [role, setRole] = useState<
    "admin" | "teacher" | "student" | "feemanager" | "admission" | "principal" | "verifier"
  >(() => {
    return (localStorage.getItem("co_user_role") as any) || "admin";
  });

  const [loggedInUserId, setLoggedInUserId] = useState<string>(() => {
    const saved = localStorage.getItem("co_user_id");
    return saved || "admin_1";
  });

  const [loggedInUserName, setLoggedInUserName] = useState<string>(() => {
    const saved = localStorage.getItem("co_user_name");
    return saved || "Administrator";
  });

  // --- STARTING DIGITAL CLOCK AND TIMEZONE AGENT STATES ---
  const [digitalTime, setDigitalTime] = useState<string>("");
  const [digitalDate, setDigitalDate] = useState<string>("");

  // Unified Sidebar Feature States
  const [adminActiveTab, setAdminActiveTab] = useState<any>("courses");
  const [teacherActiveTab, setTeacherActiveTab] = useState<any>("courses");
  const [studentActiveTab, setStudentActiveTab] = useState<any>("courses");
  const [admissionActiveTab, setAdmissionActiveTab] = useState<any>("leads");
  const [feeActiveTab, setFeeActiveTab] = useState<any>("ledger");
  const [principalActiveTab, setPrincipalActiveTab] = useState<any>("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDigitalTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
      setDigitalDate(
        now.toLocaleDateString([], {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- RESOLVE PROFILE PICTURE, DISPLAY NAME AND RICH ROLE ---
  const getCurrentUserProfile = () => {
    let avatarUrl = "";
    let nameVal = loggedInUserName || "Academic Representative";
    let displayRole = "LMS Specialist Portal";

    if (role === "admin") {
      const userObj = admins.find(
        (a) => a.id === loggedInUserId || a.name === loggedInUserName,
      );
      avatarUrl = userObj?.avatar || getRandomAvatarUrl(nameVal);
      displayRole = "Super Administrator";
    } else if (role === "teacher") {
      const userObj = teachers.find(
        (t) => t.id === loggedInUserId || t.name === loggedInUserName,
      );
      avatarUrl = userObj?.avatar || getRandomAvatarUrl(nameVal);
      displayRole = "Faculty Professor";
      if (userObj) nameVal = userObj.name;
    } else if (role === "student") {
      const userObj = students.find(
        (s) => s.id === loggedInUserId || s.name === loggedInUserName,
      );
      avatarUrl = userObj?.avatar || getRandomAvatarUrl(nameVal);
      displayRole = "Registered Academy Scholar";
      if (userObj) nameVal = userObj.name;
    } else if (role === "admission") {
      avatarUrl = getRandomAvatarUrl("Admission Desk Office");
      displayRole = "Head of Admissions Desk";
      nameVal = loggedInUserName || "Admissions Core Officer";
    } else if (role === "feemanager") {
      const userObj = feeManagers.find(
        (fm) => fm.id === loggedInUserId || fm.name === loggedInUserName,
      );
      avatarUrl = userObj?.avatar || getRandomAvatarUrl(nameVal);
      displayRole = "Financial Audit Desk Manager";
      if (userObj) nameVal = userObj.name;
    } else if (role === "principal") {
      avatarUrl = getRandomAvatarUrl("Academy Chancellor");
      displayRole = "General Principal Overseer";
    } else {
      avatarUrl = getRandomAvatarUrl(nameVal);
    }

    return { avatarUrl, nameVal, displayRole };
  };

  // Dynamic brand coaching theme color selector configuration
  const [themeColor, setThemeColor] = useState<
    "indigo" | "emerald" | "crimson" | "amber" | "violet" | "sky" | "saffron"
  >(() => {
    return (localStorage.getItem("co_theme_color") as any) || "indigo";
  });

  // --- EMERGENCY SHUTDOWN AND BOOTLOADER STATE HOOKS ---
  const [isEmergencyShutdown, setIsEmergencyShutdown] = useState<boolean>(
    () => {
      return localStorage.getItem("co_is_emergency_shutdown") === "true";
    },
  );

  const [shutdownReason, setShutdownReason] = useState<string>(() => {
    return (
      localStorage.getItem("co_shutdown_reason") ||
      "Scheduled educational node maintenance. Live classrooms will resume shortly."
    );
  });

  const [isSystemLoading, setIsSystemLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "co_is_emergency_shutdown",
      isEmergencyShutdown ? "true" : "false",
    );
  }, [isEmergencyShutdown]);

  useEffect(() => {
    localStorage.setItem("co_shutdown_reason", shutdownReason);
  }, [shutdownReason]);

  const trigger15SecLoading = (onComplete?: () => void) => {
    setIsSystemLoading(true);
    setTimeout(() => {
      setIsSystemLoading(false);
      if (onComplete) onComplete();
    }, 250);
  };

  useEffect(() => {
    if (!hasLoadedInitial) {
      setHasLoadedInitial(true);
      trigger15SecLoading();
    }
  }, [hasLoadedInitial]);

  const handleNavigatePortal = (
    view:
      | "website"
      | "choose"
      | "student"
      | "teacher"
      | "admin"
      | "feemanager"
      | "admission"
      | "principal",
    roleSetting?: "admin" | "teacher" | "student" | "feemanager" | "admission" | "principal",
  ) => {
    trigger15SecLoading(() => {
      setLoginPortalView(view);
      if (roleSetting) {
        setLoginRole(roleSetting);
      }
    });
  };

  // Override login helper states during blackout outages
  const [overrideEmail, setOverrideEmail] = useState("");
  const [overridePassword, setOverridePassword] = useState("");
  const [overrideError, setOverrideError] = useState("");
  const [showOverrideForm, setShowOverrideForm] = useState(false);

  // --- DEVICE AUTHORIZATION AND REGISTRATION SYSTEM ---
  const [currentDeviceKey] = useState<string>(() => {
    let key = localStorage.getItem("co_device_key");
    if (!key) {
      key =
        "DEV-" +
        Math.random().toString(36).substring(2, 10).toUpperCase() +
        "-" +
        Math.random().toString(36).substring(2, 6).toUpperCase();
      localStorage.setItem("co_device_key", key);
    }
    return key;
  });

  const [authorizedDevices, setAuthorizedDevices] = useState<
    AuthorizedDevice[]
  >(() => {
    const saved = localStorage.getItem("co_authorized_devices");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore fallback
      }
    }
    // Pre-authorize the initial developer/admin device so the user isn't locked out immediately upon update!
    const initialKey =
      localStorage.getItem("co_device_key") || "DEV-INIT-ROOT-KEY";
    return [
      {
        id: "dev_initial",
        deviceName: "Primary Admin Console (Active Terminal)",
        deviceKey: initialKey,
        authorizedAt: new Date().toLocaleDateString(),
        lastUsedAt: new Date().toLocaleTimeString(),
        userAgent: navigator.userAgent,
      },
    ];
  });

  // Keep devices in localStorage
  useEffect(() => {
    localStorage.setItem(
      "co_authorized_devices",
      JSON.stringify(authorizedDevices),
    );
  }, [authorizedDevices]);

  // Form states for manual device registration on the block page
  const [regDeviceName, setRegDeviceName] = useState("");
  const [regAdminPIN, setRegAdminPIN] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const handleRegisterCurrentDevice = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    if (!regDeviceName.trim()) {
      setRegError(
        "Please provide a descriptive identifier name for this hardware (e.g. Lab Tablet 2).",
      );
      return;
    }

    setIsRegisteringDevice(true);
    setTimeout(() => {
      setIsRegisteringDevice(false);
      // Check PIN. We match admin password "12112006" or Master bypass PIN "30303"
      if (regAdminPIN === "12112006" || regAdminPIN === "30303") {
        const newDevice: AuthorizedDevice = {
          id: "dev_" + Date.now(),
          deviceName: regDeviceName.trim(),
          deviceKey: currentDeviceKey,
          authorizedAt:
            new Date().toLocaleDateString() +
            " " +
            new Date().toLocaleTimeString(),
          lastUsedAt: new Date().toLocaleTimeString(),
          userAgent: navigator.userAgent,
        };

        setAuthorizedDevices((prev) => [...prev, newDevice]);
        setRegSuccess("Hardware Authorized successfully! Redirecting...");
        setTimeout(() => {
          setIsSystemLoading(true);
          setTimeout(() => setIsSystemLoading(false), 800);
        }, 1500);
      } else {
        setRegError("Invalid SuperAdmin authorization security PIN.");
      }
    }, 750);
  };

  const themes = {
    indigo: {
      "50": "#f5f7ff",
      "100": "#e0e7ff",
      "150": "#ccd6ff",
      "200": "#c7d2fe",
      "300": "#a5b4fc",
      "400": "#818cf8",
      "500": "#6366f1",
      "600": "#4f46e5",
      "650": "#4338ca",
      "700": "#4338ca",
      "800": "#3730a3",
      "900": "#312e81",
      "950": "#1e1b4b",
    },
    emerald: {
      "50": "#ecfdf5",
      "100": "#d1fae5",
      "150": "#bbf7d0",
      "200": "#a7f3d0",
      "300": "#6ee7b7",
      "400": "#34d399",
      "500": "#10b981",
      "600": "#059669",
      "650": "#047857",
      "700": "#047857",
      "800": "#065f46",
      "900": "#064e3b",
      "950": "#022c22",
    },
    crimson: {
      "50": "#fff1f2",
      "100": "#ffe4e6",
      "150": "#fecdd3",
      "200": "#fecdd3",
      "300": "#fda4af",
      "400": "#fb7185",
      "500": "#f43f5e",
      "600": "#e11d48",
      "650": "#be123c",
      "700": "#be123c",
      "800": "#9f1239",
      "900": "#881337",
      "950": "#4c0519",
    },
    amber: {
      "50": "#fffbeb",
      "100": "#fef3c7",
      "150": "#fde68a",
      "200": "#fde68a",
      "300": "#fcd34d",
      "400": "#fbbf24",
      "500": "#f59e0b",
      "600": "#d97706",
      "650": "#b45309",
      "700": "#b45309",
      "800": "#92400e",
      "900": "#78350f",
      "950": "#451a03",
    },
    violet: {
      "50": "#faf5ff",
      "100": "#f3e8ff",
      "150": "#e9d5ff",
      "200": "#e9d5ff",
      "300": "#d8b4fe",
      "400": "#c084fc",
      "500": "#a855f7",
      "600": "#9333ea",
      "650": "#7e22ce",
      "700": "#7e22ce",
      "800": "#6b21a8",
      "900": "#581c87",
      "950": "#3b0764",
    },
    sky: {
      "50": "#f0f9ff",
      "100": "#e0f2fe",
      "150": "#bae6fd",
      "200": "#bae6fd",
      "300": "#7dd3fc",
      "400": "#38bdf8",
      "500": "#0ea5e9",
      "600": "#0284c7",
      "650": "#0369a1",
      "700": "#0369a1",
      "800": "#075985",
      "900": "#0c4a6e",
      "950": "#082f49",
    },
    saffron: {
      "50": "#fff7ed",
      "100": "#ffedd5",
      "150": "#fed7aa",
      "200": "#fed7aa",
      "300": "#fdbb2d",
      "400": "#fb923c",
      "505": "#f97316",
      "500": "#f97316",
      "600": "#ea580c",
      "650": "#c2410c",
      "700": "#c2410c",
      "800": "#9a3412",
      "900": "#7c2d12",
      "950": "#431407",
    },
  };

  const selectedColors = themes[themeColor] || themes.indigo;

  useEffect(() => {
    localStorage.setItem("co_theme_color", themeColor);
  }, [themeColor]);

  useEffect(() => {
    localStorage.setItem("co_theme_mode", "light");
    document.documentElement.classList.remove("dark");
  }, []);

  // PWA & Web App Install Prompt State
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isOnlineState, setIsOnlineState] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  // First-time login tutorial auto-trigger
  useEffect(() => {
    if (isLoggedIn && loggedInUserId) {
      const tutorialKey = `studyhub_tutorial_seen_${role}_${loggedInUserId}`;
      const hasSeen = localStorage.getItem(tutorialKey);
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setIsTutorialOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoggedIn, role, loggedInUserId]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnlineState(true);
    };
    const handleOffline = () => {
      setIsOnlineState(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);
  const [copiedLinkSuccess, setCopiedLinkSuccess] = useState<boolean>(false);


  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === "accepted") {
        setIsAppInstalled(true);
      }
      setDeferredInstallPrompt(null);
    } else {
      setIsInstallModalOpen(true);
    }
  };

  // Dynamic admin accounts list
  const [admins, setAdmins] = useState<AdminUser[]>(() =>
    loadInitialCollectionState(
      "admins",
      [
        {
          id: "admin_1",
          name: "Administrator",
          username: "admin",
          email: "admin@coachinghub.edu",
          employeeCode: "MPDIGI000",
          password: "12112006",
          status: "Active",
        },
      ],
      "co_admins"
    )
  );

  // State engines loaded from LocalStorage if available for persistence
  const [securityAlerts, setSecurityAlerts] = useState<SecuritySOSAlert[]>(
    () => {
      const saved = localStorage.getItem("co_security_alerts");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
      return [];
    },
  );

  const [counsellingRequests, setCounsellingRequests] = useState<CounsellingRequest[]>(() => {
    const saved = localStorage.getItem("co_counselling_requests");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("co_counselling_requests", JSON.stringify(counsellingRequests));
  }, [counsellingRequests]);

  const [counsellingSlots, setCounsellingSlots] = useState<CounsellingSlot[]>(() => {
    const saved = localStorage.getItem("co_counselling_slots");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("co_counselling_slots", JSON.stringify(counsellingSlots));
  }, [counsellingSlots]);

  const [admissionRequests, setAdmissionRequests] = useState<AdmissionRequest[]>(() => {
    const saved = localStorage.getItem("co_admission_requests");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("co_admission_requests", JSON.stringify(admissionRequests));
  }, [admissionRequests]);

  // Dynamic Courses Engine
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem("co_courses");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: "course_1",
        title: "JEE Advanced Physics & Quantum Mechanics Mastery",
        description: "Complete live batch covering Mechanics, Electrodynamics, Quantum Physics and Advanced Numerical Solving with mentor guidance.",
        mentorName: "Dr. Richard Feynman",
        duration: "12 Months",
        price: 4999,
        isPublished: true,
        isBlocked: false,
        demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        createdAt: "2026-07-20",
        sections: [
          {
            id: "sec_1",
            title: "Module 1: Rotational Dynamics & Gravitation",
            order: 1,
            description: "Torque, Angular Momentum, Gyroscopic Motion and Planetary Mechanics"
          },
          {
            id: "sec_2",
            title: "Module 2: Electrostatics & Magnetism",
            order: 2,
            description: "Gauss Law, Capacitances, Ampere Law and Electromagnetic Induction"
          }
        ],
        announcements: [
          { id: "ann_1", title: "Welcome Live Orientation Batch 2026", content: "Welcome students! Live problem solving session is scheduled every Monday at 5 PM.", createdAt: "2026-07-25" }
        ],
        liveClasses: [
          { id: "live_1", title: "Live Session: Rigid Body Dynamics & Torque Numericals", scheduledAt: "Mon, Wed, Fri @ 5:00 PM IST", meetingOrVideoUrl: "https://meet.google.com/abc-defg-hij", isLive: true }
        ],
        classNotes: [
          { id: "cn_1", title: "Formula Sheet - Rotational Mechanics.pdf", fileUrlOrContent: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", uploadedAt: "2026-07-21" },
          { id: "cn_2", title: "HC Verma Solutions Chapter 1-10.pdf", fileUrlOrContent: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", uploadedAt: "2026-07-22" }
        ],
        doubts: [
          { id: "d_1", studentId: "s1", studentName: "Aarav Sharma", message: "Sir, in question 4 of sheet 2, how do we apply pseudo force in rotating frame?", reply: "In rotating frame, add centrifugal force m*omega^2*r radially outwards.", repliedBy: "Dr. Richard Feynman", timestamp: "2026-07-25 14:30" }
        ]
      },
      {
        id: "course_2",
        title: "NEET Organic Chemistry Masterclass 2026",
        description: "Master reaction mechanisms, named reactions, biomolecules and NCERT deep-dive with daily notes and doubt resolution.",
        mentorName: "Prof. Marie Curie",
        duration: "8 Months",
        price: 3499,
        isPublished: true,
        isBlocked: false,
        demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        createdAt: "2026-07-22",
        sections: [
          {
            id: "sec_21",
            title: "Module 1: Hydrocarbons & Reaction Mechanisms",
            order: 1,
            description: "Electrophilic Addition, Nucleophilic Substitution, Alkanes, Alkenes & Alkynes"
          }
        ],
        announcements: [
          { id: "ann_21", title: "NCERT Highlight PDF Ready", content: "NCERT line-by-line reading PDF updated in notes section.", createdAt: "2026-07-24" }
        ],
        liveClasses: [
          { id: "live_21", title: "Live Session: Aldehydes, Ketones & Carboxylic Acids", scheduledAt: "Tue, Thu, Sat @ 6:00 PM IST", meetingOrVideoUrl: "https://meet.google.com/xyz-uvwx-rst", isLive: false }
        ],
        classNotes: [
          { id: "cn_21", title: "Organic Named Reactions Cheat Sheet.pdf", fileUrlOrContent: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", uploadedAt: "2026-07-20" }
        ],
        doubts: []
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("co_courses", JSON.stringify(courses));
  }, [courses]);

  // Dynamic Store Items Engine (Books, Stationery)
  const [storeItems, setStoreItems] = useState<StoreItem[]>(() => {
    const saved = localStorage.getItem("co_store_items");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: "book_1",
        name: "Study HUB Physics Master Volume 1 (Class 11 & 12)",
        type: "book",
        description: "Comprehensive theory, 3000+ solved numericals & previous years questions for JEE/NEET.",
        price: 499,
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80",
        inStock: true,
        authorOrBrand: "Study HUB Academic Press"
      },
      {
        id: "book_2",
        name: "Organic & Inorganic Chemistry Reaction Handbook",
        type: "book",
        description: "Color-coded mind maps, named reactions summary and NCERT key highlights.",
        price: 399,
        image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80",
        inStock: true,
        authorOrBrand: "Study HUB Faculty Team"
      },
      {
        id: "stat_1",
        name: "Study HUB Premium Student Study Kit",
        type: "stationery",
        description: "High-quality spiral notebook set (500 pages), gel pens, highlighters, sticky notes & geometry set.",
        price: 299,
        image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&q=80",
        inStock: true,
        authorOrBrand: "Study HUB Essentials"
      },
      {
        id: "stat_2",
        name: "Study HUB Scientific Calculator & Formula Ruler Set",
        type: "stationery",
        description: "Durable solar-powered scientific calculator with stainless steel formula ruler and pouch.",
        price: 699,
        image: "https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?w=400&q=80",
        inStock: true,
        authorOrBrand: "Study HUB Tech Labs"
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("co_store_items", JSON.stringify(storeItems));
  }, [storeItems]);

  // Dynamic Store Orders (Cash on Delivery Orders)
  const [storeOrders, setStoreOrders] = useState<StoreOrder[]>(() =>
    loadInitialCollectionState("storeOrders", [], "co_store_orders")
  );

  useEffect(() => {
    localStorage.setItem("co_store_orders", JSON.stringify(storeOrders));
  }, [storeOrders]);

  // Physical Study Hub Centers
  const [studyHubCenters, setStudyHubCenters] = useState<StudyHubCenter[]>(() =>
    loadInitialCollectionState(
      "studyHubCenters",
      initialStudyHubCenters,
      "co_study_hub_centers"
    )
  );

  useEffect(() => {
    localStorage.setItem("co_study_hub_centers", JSON.stringify(studyHubCenters));
  }, [studyHubCenters]);

  const [batches, setBatches] = useState<Batch[]>(() =>
    loadInitialCollectionState("batches", initialBatches, "co_batches")
  );

  const [teachers, setTeachers] = useState<Teacher[]>(() =>
    loadInitialCollectionState("teachers", initialTeachers, "co_teachers")
  );

  const [students, setStudents] = useState<Student[]>(() =>
    loadInitialCollectionState("students", initialStudents, "co_students")
  );

  const [lessons, setLessons] = useState<Lesson[]>(() =>
    loadInitialCollectionState("lessons", initialLessons, "co_lessons")
  );

  const [tests, setTests] = useState<Test[]>(() =>
    loadInitialCollectionState("tests", initialTests, "co_tests")
  );

  const [schools, setSchools] = useState<School[]>(() =>
    loadInitialCollectionState("schools", [], "co_schools")
  );

  useEffect(() => {
    localStorage.setItem("co_schools", JSON.stringify(schools));
  }, [schools]);

  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    loadInitialCollectionState("announcements", initialAnnouncements, "co_announcements")
  );

  const [onlineAnnouncements, setOnlineAnnouncements] = useState<OnlineAnnouncement[]>(() =>
    loadInitialCollectionState("onlineAnnouncements", [], "co_online_announcements")
  );

  const [fees, setFees] = useState<FeeInvoice[]>(() =>
    loadInitialCollectionState("feeInvoices", initialFees, "co_fees")
  );

  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(() =>
    loadInitialCollectionState("supportMessages", initialSupportMessages, "co_support_messages")
  );

  const [feeManagers, setFeeManagers] = useState<FeeManager[]>(() =>
    loadInitialCollectionState(
      "feeManagers",
      [
        {
          id: "fm_default",
          name: "Devid Pandey (Internal CPA)",
          username: "feeman",
          email: "accounts@coachinghub.edu",
          employeeCode: "MPDIGI201",
          status: "Active",
          password: "fee12112006",
        },
      ],
      "co_fee_managers"
    )
  );

  useEffect(() => {
    localStorage.setItem("co_fee_managers", JSON.stringify(feeManagers));
  }, [feeManagers]);

  const [admissionOfficers, setAdmissionOfficers] = useState<AdmissionOfficer[]>(() =>
    loadInitialCollectionState(
      "admissionOfficers",
      [
        {
          id: "admission_desk_1",
          name: "Admissions Desk Staff",
          username: "admission",
          email: "admission@mpdigitalschool.com",
          employeeCode: "MPDIGI301",
          status: "Active",
          password: "admission12112006",
        },
      ],
      "co_admission_officers"
    )
  );

  useEffect(() => {
    localStorage.setItem(
      "co_admission_officers",
      JSON.stringify(admissionOfficers),
    );
  }, [admissionOfficers]);

  const [verifiers, setVerifiers] = useState<Verifier[]>(() =>
    loadInitialCollectionState(
      "verifiers",
      [
        {
          id: "v_default",
          name: "Govind Kumar (Chief Verifier)",
          username: "verify1",
          employeeCode: "VRF401",
          status: "Active",
          password: "verify123",
        },
      ],
      "co_verifiers"
    )
  );

  useEffect(() => {
    localStorage.setItem("co_verifiers", JSON.stringify(verifiers));
  }, [verifiers]);

  const [studentDashboardInitialTab, setStudentDashboardInitialTab] = useState<
    | "syllabus"
    | "report-card"
    | "announcements"
    | "profile"
    | "fees"
    | "support"
    | "card"
    | "explore"
    | "attendance"
    | undefined
  >(() => {
    const saved = localStorage.getItem("co_student_initial_tab");
    return (saved as any) || undefined;
  });

  useEffect(() => {
    if (studentDashboardInitialTab) {
      localStorage.setItem(
        "co_student_initial_tab",
        studentDashboardInitialTab,
      );
    } else {
      localStorage.removeItem("co_student_initial_tab");
    }
  }, [studentDashboardInitialTab]);

  const getAllottedSchoolName = (): string => {
    return "";
  };

  const [computerDesks, setComputerDesks] = useState<ComputerDesk[]>(() =>
    loadInitialCollectionState("computerDesks", [], "co_computer_desks")
  );

  const [testSubmissions, setTestSubmissions] = useState<TestSubmission[]>(
    () => {
      const saved = localStorage.getItem("co_test_submissions");
      return saved ? JSON.parse(saved) : [];
    },
  );

  const [leads, setLeads] = useState<ContactLead[]>(() =>
    loadInitialCollectionState("contactLeads", initialLeads, "co_contact_leads")
  );

  useEffect(() => {
    localStorage.setItem("co_contact_leads", JSON.stringify(leads));
  }, [leads]);

  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >(() => {
    const saved = localStorage.getItem("co_attendance_records");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(
      "co_attendance_records",
      JSON.stringify(attendanceRecords),
    );
  }, [attendanceRecords]);

  const [isNoticeboardAdminOnly, setIsNoticeboardAdminOnly] = useState<boolean>(
    () => {
      const saved = localStorage.getItem("co_is_noticeboard_admin_only");
      return saved ? saved === "true" : false;
    },
  );

  const [publicBatches, setPublicBatches] = useState<PublicBatch[]>(() => {
    const saved = localStorage.getItem("co_public_batches");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(
      "co_is_noticeboard_admin_only",
      isNoticeboardAdminOnly ? "true" : "false",
    );
  }, [isNoticeboardAdminOnly]);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem("co_app_notifications");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("co_app_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isComposeNotificationOpen, setIsComposeNotificationOpen] =
    useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("co_public_batches", JSON.stringify(publicBatches));
  }, [publicBatches]);

  const [subjects, setSubjects] = useState<string[]>(() => {
    const saved = localStorage.getItem("co_subjects");
    return saved
      ? JSON.parse(saved)
      : ["Mathematics", "Computer Science", "Chemistry", "Physics", "Biology"];
  });

  // Sync state modifications to LocalStorage
  useEffect(() => {
    localStorage.setItem("co_computer_desks", JSON.stringify(computerDesks));
  }, [computerDesks]);

  useEffect(() => {
    localStorage.setItem("co_subjects", JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(
      "co_test_submissions",
      JSON.stringify(testSubmissions),
    );
  }, [testSubmissions]);

  useEffect(() => {
    localStorage.setItem("co_fees", JSON.stringify(fees));
  }, [fees]);

  useEffect(() => {
    localStorage.setItem(
      "co_support_messages",
      JSON.stringify(supportMessages),
    );
  }, [supportMessages]);

  useEffect(() => {
    localStorage.setItem("co_batches", JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem("co_teachers", JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem("co_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("co_admins", JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    localStorage.setItem("co_lessons", JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem("co_tests", JSON.stringify(tests));
  }, [tests]);

  useEffect(() => {
    localStorage.setItem("co_announcements", JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem("co_online_announcements", JSON.stringify(onlineAnnouncements));
  }, [onlineAnnouncements]);

  // --- EXAM PORTAL STATES & REPOSITORIES ---
  const [examSubjects, setExamSubjects] = useState<ExamSubject[]>(() =>
    loadInitialCollectionState("examSubjects", initialExamSubjects, "co_exam_subjects")
  );

  const [examSettings, setExamSettings] = useState<ExamPortalSettings>(() => {
    try {
      const saved = localStorage.getItem("co_exam_settings");
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialExamSettings;
  });

  const [examForms, setExamForms] = useState<ExamForm[]>(() =>
    loadInitialCollectionState("examForms", initialExamForms, "co_exam_forms")
  );

  const [examMarksheets, setExamMarksheets] = useState<ExamStudentMarksheet[]>(() =>
    loadInitialCollectionState("examResults", initialExamMarksheets, "co_exam_marksheets")
  );

  const [branchPINs, setBranchPINs] = useState<BranchPIN[]>(() =>
    loadInitialCollectionState("branchPins", initialBranchPINs, "co_branch_pins")
  );

  useEffect(() => {
    localStorage.setItem("co_exam_subjects", JSON.stringify(examSubjects));
  }, [examSubjects]);

  useEffect(() => {
    localStorage.setItem("co_exam_settings", JSON.stringify(examSettings));
  }, [examSettings]);

  useEffect(() => {
    localStorage.setItem("co_exam_forms", JSON.stringify(examForms));
  }, [examForms]);

  useEffect(() => {
    localStorage.setItem("co_exam_marksheets", JSON.stringify(examMarksheets));
  }, [examMarksheets]);

  useEffect(() => {
    localStorage.setItem("co_branch_pins", JSON.stringify(branchPINs));
  }, [branchPINs]);

  // Real-time Announcement Audio Alert Trigger
  const isInitialAnnounceMount = useRef(true);
  const prevAnnLengthRef = useRef(announcements.length);
  const prevOnlineAnnLengthRef = useRef(onlineAnnouncements.length);

  useEffect(() => {
    if (isInitialAnnounceMount.current) {
      isInitialAnnounceMount.current = false;
      prevAnnLengthRef.current = announcements.length;
      prevOnlineAnnLengthRef.current = onlineAnnouncements.length;
      return;
    }

    if (
      announcements.length > prevAnnLengthRef.current ||
      onlineAnnouncements.length > prevOnlineAnnLengthRef.current
    ) {
      playAnnouncementSound();
    }

    prevAnnLengthRef.current = announcements.length;
    prevOnlineAnnLengthRef.current = onlineAnnouncements.length;
  }, [announcements, onlineAnnouncements]);

  useEffect(() => {
    localStorage.setItem("co_security_alerts", JSON.stringify(securityAlerts));
  }, [securityAlerts]);

  // Session storage sync
  useEffect(() => {
    localStorage.setItem("co_is_logged_in", isLoggedIn ? "true" : "false");
    localStorage.setItem("co_user_role", role);
    localStorage.setItem("co_user_id", loggedInUserId);
    localStorage.setItem("co_user_name", loggedInUserName);
  }, [isLoggedIn, role, loggedInUserId, loggedInUserName]);

  // --- FIREBASE LIVE AND REAL-TIME SYNC ---
  const [isFirebaseReady, setIsFirebaseReady] = useState(true);

  useEffect(() => {
    const performAuth = async () => {
      try {
        await signInAnonymously(auth);
        console.log("Firebase Anonymously Authenticated successfully.");
      } catch (err) {
        console.warn("Firebase auth note: operating directly over Firestore rules.", err);
      }
      setIsFirebaseReady(true);
    };
    performAuth();
  }, []);

  function useFirestoreSync<T extends { id: string }>(
    collectionName: string,
    state: T[],
    setState: React.Dispatch<React.SetStateAction<T[]>>,
    isReady: boolean,
  ) {
    const isHydratedRef = useRef(false);
    const prevRef = useRef<T[]>(state);
    const pendingLocalWritesRef = useRef<Map<string, { item: T; time: number }>>(new Map());

    // 1. Sync from Firestore (listen to remote changes in real time!)
    useEffect(() => {
      if (!isReady) return;

      const seededKey = "co_seeded_" + collectionName;

      const unsubscribe = onSnapshot(
        collection(db, collectionName),
        async (snapshot) => {
          const hasEverSeeded = localStorage.getItem(seededKey) === "true";
          const currentDeletedIds = getDeletedIds(collectionName);

          // Handle empty remote collection
          if (snapshot.empty) {
            const validInitial = (state || []).filter(
              (item) => item && item.id && !currentDeletedIds.has(String(item.id))
            );

            if (!hasEverSeeded && validInitial.length > 0) {
              // Initial seed ONLY on first execution for non-deleted items
              localStorage.setItem(seededKey, "true");
              for (const item of validInitial) {
                try {
                  const cleanItem = sanitizeForFirestore(item);
                  await setDoc(doc(db, collectionName, String(item.id)), cleanItem, { merge: true });
                } catch (e) {
                  console.error(`[Firestore Sync] Seed failed for ${collectionName}/${item.id}:`, e);
                }
              }
            } else {
              localStorage.setItem(seededKey, "true");
              // Remote collection is genuinely empty
              if (prevRef.current.length > 0) {
                prevRef.current = [];
                setState([]);
              }
            }
            isHydratedRef.current = true;
            return;
          }

          localStorage.setItem(seededKey, "true");

          // Extract remote items, ignoring any item that has been permanently deleted
          const remoteMap = new Map<string, T>();
          snapshot.docs.forEach((d) => {
            const id = d.id;
            if (currentDeletedIds.has(id)) {
              // Permanently deleted: remove from cloud if resurrecting, never restore locally!
              deleteDoc(doc(db, collectionName, id)).catch(() => {});
              return;
            }

            const data = d.data();
            const remoteItem = { id, ...data } as T;

            // If user recently modified this item locally (within last 3.5s), preserve user's edits!
            const pending = pendingLocalWritesRef.current.get(id);
            if (pending && Date.now() - pending.time < 3500) {
              remoteMap.set(id, { ...remoteItem, ...pending.item });
            } else {
              remoteMap.set(id, remoteItem);
              if (pending) {
                pendingLocalWritesRef.current.delete(id);
              }
            }
          });

          // Also keep any freshly created local items that haven't appeared in snapshot yet
          pendingLocalWritesRef.current.forEach((pending, id) => {
            if (!currentDeletedIds.has(id) && !remoteMap.has(id) && Date.now() - pending.time < 4000) {
              remoteMap.set(id, pending.item);
            }
          });

          const remoteItems = Array.from(remoteMap.values());

          // Deep equality check: avoids needless state resets that revert user inputs or cause flicker
          if (!areItemListsEqual(prevRef.current, remoteItems)) {
            prevRef.current = remoteItems;
            setState(remoteItems);
          }

          isHydratedRef.current = true;
        },
        (error) => {
          console.error(`[Firestore Sync] Subscription failed on ${collectionName}:`, error);
          isHydratedRef.current = true;
        },
      );

      return () => unsubscribe();
    }, [isReady, collectionName, setState]);

    // 2. Sync to Firestore on local state changes (additions, modifications, deletions)
    useEffect(() => {
      if (!isReady || !isHydratedRef.current) return;

      const prev = prevRef.current || [];
      const currentList = state || [];
      const currentDeletedIds = getDeletedIds(collectionName);

      // Sanity check: Ensure state never contains items that were permanently marked as deleted
      const filteredCurrent = currentList.filter((s) => !currentDeletedIds.has(String(s.id)));
      if (filteredCurrent.length !== currentList.length) {
        setState(filteredCurrent);
        return;
      }

      // 1. Find deleted items (items in prev that are no longer in currentList)
      const deleted = prev.filter((p) => !currentList.some((s) => String(s.id) === String(p.id)));
      deleted.forEach(async (item) => {
        const idStr = String(item.id);
        markIdAsDeleted(collectionName, idStr);
        pendingLocalWritesRef.current.delete(idStr);
        try {
          await deleteDoc(doc(db, collectionName, idStr));
          console.log(`[Firestore Sync] Permanently deleted ${collectionName}/${idStr}`);
        } catch (err) {
          console.error(
            `[Firestore Sync] Error deleting ${collectionName}/${idStr}:`,
            err,
          );
        }
      });

      // 2. Find added or changed items
      const changed = currentList.filter((s) => {
        if (currentDeletedIds.has(String(s.id))) return false;
        const prevItem = prev.find((x) => String(x.id) === String(s.id));
        if (!prevItem) return true; // Newly added
        return !areItemsEqual(prevItem, s); // Updated
      });

      changed.forEach(async (item) => {
        const idStr = String(item.id);
        if (currentDeletedIds.has(idStr)) return;

        pendingLocalWritesRef.current.set(idStr, { item, time: Date.now() });
        try {
          const cleanItem = sanitizeForFirestore(item);
          await setDoc(doc(db, collectionName, idStr), cleanItem, { merge: true });
          console.log(`[Firestore Sync] Saved ${collectionName}/${idStr}`);
        } catch (err) {
          console.error(
            `[Firestore Sync] Error saving ${collectionName}/${idStr}:`,
            err,
          );
        }
      });

      // Update ref
      prevRef.current = currentList;
    }, [state, isReady, collectionName]);
  }

  // Bind individual state lists to live collection subscriptions
  useFirestoreSync("schools", schools, setSchools, isFirebaseReady);
  useFirestoreSync("teachers", teachers, setTeachers, isFirebaseReady);
  useFirestoreSync("students", students, setStudents, isFirebaseReady);
  useFirestoreSync("batches", batches, setBatches, isFirebaseReady);
  useFirestoreSync("lessons", lessons, setLessons, isFirebaseReady);
  useFirestoreSync("tests", tests, setTests, isFirebaseReady);
  useFirestoreSync("courses", courses, setCourses, isFirebaseReady);
  useFirestoreSync("storeItems", storeItems, setStoreItems, isFirebaseReady);
  useFirestoreSync("storeOrders", storeOrders, setStoreOrders, isFirebaseReady);
  useFirestoreSync("studyHubCenters", studyHubCenters, setStudyHubCenters, isFirebaseReady);
  useFirestoreSync(
    "announcements",
    announcements,
    setAnnouncements,
    isFirebaseReady,
  );
  useFirestoreSync(
    "onlineAnnouncements",
    onlineAnnouncements,
    setOnlineAnnouncements,
    isFirebaseReady,
  );
  useFirestoreSync("feeInvoices", fees, setFees, isFirebaseReady);
  useFirestoreSync(
    "supportMessages",
    supportMessages,
    setSupportMessages,
    isFirebaseReady,
  );
  useFirestoreSync(
    "computerDesks",
    computerDesks,
    setComputerDesks,
    isFirebaseReady,
  );
  useFirestoreSync(
    "testSubmissions",
    testSubmissions,
    setTestSubmissions,
    isFirebaseReady,
  );
  useFirestoreSync("contactLeads", leads, setLeads, isFirebaseReady);
  useFirestoreSync(
    "securitySOSAlerts",
    securityAlerts,
    setSecurityAlerts,
    isFirebaseReady,
  );
  useFirestoreSync(
    "counsellingRequests",
    counsellingRequests,
    setCounsellingRequests,
    isFirebaseReady,
  );
  useFirestoreSync("admins", admins, setAdmins, isFirebaseReady);
  useFirestoreSync("feeManagers", feeManagers, setFeeManagers, isFirebaseReady);
  useFirestoreSync(
    "admissionOfficers",
    admissionOfficers,
    setAdmissionOfficers,
    isFirebaseReady,
  );
  useFirestoreSync(
    "verifiers",
    verifiers,
    setVerifiers,
    isFirebaseReady,
  );
  useFirestoreSync(
    "counsellingSlots",
    counsellingSlots,
    setCounsellingSlots,
    isFirebaseReady,
  );
  useFirestoreSync(
    "admissionRequests",
    admissionRequests,
    setAdmissionRequests,
    isFirebaseReady,
  );
  useFirestoreSync(
    "publicBatches",
    publicBatches,
    setPublicBatches,
    isFirebaseReady,
  );
  useFirestoreSync(
    "appNotifications",
    notifications,
    setNotifications,
    isFirebaseReady,
  );
  useFirestoreSync(
    "attendanceRecords",
    attendanceRecords,
    setAttendanceRecords,
    isFirebaseReady,
  );
  useFirestoreSync(
    "authorizedDevices",
    authorizedDevices,
    setAuthorizedDevices,
    isFirebaseReady,
  );
  useFirestoreSync("examForms", examForms, setExamForms, isFirebaseReady);
  useFirestoreSync("examSubjects", examSubjects, setExamSubjects, isFirebaseReady);
  useFirestoreSync("examResults", examMarksheets, setExamMarksheets, isFirebaseReady);
  useFirestoreSync("branchPins", branchPINs, setBranchPINs, isFirebaseReady);

  // --- USER PROFILE MODAL STATE AND UPDATE HANDLERS ---
  const [profileModalMode, setProfileModalMode] = useState<
    "view" | "edit" | null
  >(null);
  const [editProfileName, setEditProfileName] = useState("");
  const [editProfileEmail, setEditProfileEmail] = useState("");
  const [editProfileAvatar, setEditProfileAvatar] = useState("");

  // Mobile Quick Search Modal State
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  const handleUpdateProfile = (
    newName: string,
    newAvatar: string,
    newEmail: string,
  ) => {
    setLoggedInUserName(newName);
    localStorage.setItem("co_user_name", newName);

    if (role === "admin") {
      setAdmins((prev) =>
        prev.map((a) => {
          if (a.id === loggedInUserId) {
            return { ...a, name: newName, avatar: newAvatar, email: newEmail };
          }
          return a;
        }),
      );
    } else if (role === "teacher") {
      setTeachers((prev) =>
        prev.map((t) => {
          if (t.id === loggedInUserId) {
            return { ...t, name: newName, avatar: newAvatar, email: newEmail };
          }
          return t;
        }),
      );
    } else if (role === "student") {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === loggedInUserId) {
            return { ...s, name: newName, avatar: newAvatar, email: newEmail };
          }
          return s;
        }),
      );
    } else if (role === "feemanager") {
      setFeeManagers((prev) =>
        prev.map((fm) => {
          if (fm.id === loggedInUserId) {
            return { ...fm, name: newName, avatar: newAvatar, email: newEmail };
          }
          return fm;
        }),
      );
    } else if (role === "principal") {
      setSchools((prev) =>
        prev.map((s) => {
          if (s.id === loggedInUserId) {
            return {
              ...s,
              principalName: newName,
              logoUrl: newAvatar,
              principalEmail: newEmail,
            };
          }
          return s;
        }),
      );
    }

    setProfileModalMode(null);
  };

  // Login inputs form states
  const [loginPortalView, setLoginPortalView] = useState<
    | "website"
    | "choose"
    | "student"
    | "teacher"
    | "admin"
    | "feemanager"
    | "admission"
    | "principal"
  >("choose");
  const [loginRole, setLoginRole] = useState<
    "admin" | "teacher" | "student" | "feemanager" | "admission" | "principal"
  >("admin");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Loading spinner states for logins/auth
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRegisteringDevice, setIsRegisteringDevice] = useState(false);
  const [isOverriding, setIsOverriding] = useState(false);

  // Show/Hide password toggle states
  const [showQuickAccessPassword, setShowQuickAccessPassword] = useState(false);
  const [showMainLoginPassword, setShowMainLoginPassword] = useState(false);
  const [showRegAdminPIN, setShowRegAdminPIN] = useState(false);
  const [showOverridePassword, setShowOverridePassword] = useState(false);

  // Guest Dashboard states (For unauthenticated public routes)
  const [guestActiveTab, setGuestActiveTab] = useState<"login" | "marksheet" | "nearby" | "announcements">("login");
  const [guestMarksheetRollNo, setGuestMarksheetRollNo] = useState("");
  const [guestMarksheetResult, setGuestMarksheetResult] = useState<Student | null>(null);
  const [guestMarksheetError, setGuestMarksheetError] = useState("");
  const [guestSchoolSearch, setGuestSchoolSearch] = useState("");
  const [selectedGuestSchool, setSelectedGuestSchool] = useState<School | null>(null);

  // Geolocation & Nearby Centers states
  const [locationStatus, setLocationStatus] = useState<"idle" | "locating" | "granted" | "denied" | "unsupported">("idle");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string>("");
  const [nearbySearchQuery, setNearbySearchQuery] = useState<string>("");
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(500);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      setLocationErrorMsg("Geolocation is not supported by your browser.");
      return;
    }
    setLocationStatus("locating");
    setLocationErrorMsg("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus("granted");
      },
      (error) => {
        setLocationStatus("denied");
        if (error.code === error.PERMISSION_DENIED) {
          setLocationErrorMsg("Location access was denied. Please grant location access in your browser settings to search nearby centers.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationErrorMsg("Location information is currently unavailable.");
        } else if (error.code === error.TIMEOUT) {
          setLocationErrorMsg("Location request timed out. Please try again.");
        } else {
          setLocationErrorMsg("Failed to retrieve your location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const getSchoolCoordinates = (school: School): { lat: number; lng: number } => {
    if (school.lat !== undefined && school.lng !== undefined) {
      return { lat: school.lat, lng: school.lng };
    }
    const text = (school.name + " " + school.address).toLowerCase();
    if (text.includes("delhi")) return { lat: 28.6139, lng: 77.2090 };
    if (text.includes("mumbai")) return { lat: 18.9388, lng: 72.8353 };
    if (text.includes("bhopal")) return { lat: 23.2599, lng: 77.4126 };
    if (text.includes("indore")) return { lat: 22.7196, lng: 75.8577 };
    if (text.includes("gwalior")) return { lat: 26.2183, lng: 78.1828 };
    if (text.includes("jabalpur")) return { lat: 23.1815, lng: 79.9864 };
    if (text.includes("ujjain")) return { lat: 23.1765, lng: 75.7885 };
    const hash = school.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      lat: 23.2599 + ((hash % 10) - 5) * 0.15,
      lng: 77.4126 + (((hash * 3) % 10) - 5) * 0.15,
    };
  };

  const [showWelcomePortal, setShowWelcomePortal] = useState<boolean>(false);

  const handleInbuiltLogin = (
    roleValue:
      | "student"
      | "teacher"
      | "admin"
      | "feemanager"
      | "admission"
      | "principal"
      | "verifier",
    identifierVal: string,
    passwordVal: string,
  ): string | null => {
    const term = identifierVal.trim();
    const pass = passwordVal.trim();

    if (roleValue === "admin") {
      const foundAdmin = admins.find(
        (a) =>
          (a.employeeCode || "").trim().toUpperCase() === term.toUpperCase() &&
          (a.password || "12112006") === pass,
      );

      if (foundAdmin) {
        if (foundAdmin.status === "Inactive") {
          return "This Administrator account has been deactivated.";
        }
        setLoggedInUserId(foundAdmin.id);
        setLoggedInUserName(foundAdmin.name);
        setRole("admin");
        setIsLoggedIn(true);
        return null;
      } else if (term.toUpperCase() === "MPDIGI000" && pass === "12112006") {
        setLoggedInUserId("admin_1");
        setLoggedInUserName("Administrator");
        setRole("admin");
        setIsLoggedIn(true);
        return null;
      } else {
        return "Incorrect Registrar Employee Code or Access Pin. Unauthorized action blocked.";
      }
    } else if (roleValue === "teacher") {
      const found = teachers.find(
        (t) =>
          (t.employeeCode || "").trim().toUpperCase() === term.toUpperCase() &&
          (t.password || "green123") === pass,
      );
      if (found) {
        if (found.status === "On Leave") {
          return "This teacher account is currently marked 'On Leave' (deactivated).";
        }
        if (found.schoolId) {
          const teacherSchool = schools.find((s) => s.id === found.schoolId);
          if (teacherSchool && teacherSchool.status === "Inactive") {
            return "This teacher's school workspace is currently blocked or pending administrative approval.";
          }
        }
        setLoggedInUserId(found.id);
        setLoggedInUserName(found.name);
        setRole("teacher");
        setIsLoggedIn(true);
        return null;
      } else {
        return "Invalid Teacher Employee Code or Password.";
      }
    } else if (roleValue === "student") {
      const found =
        passwordVal === "BYPASS_GOOGLE_SIGN_IN"
          ? students.find(
              (s) =>
                s.email?.toLowerCase() === term.toLowerCase() ||
                (s.isGoogleRegistered &&
                  s.googleEmail &&
                  s.googleEmail.toLowerCase() === term.toLowerCase()),
            )
          : students.find(
              (s) =>
                (s.mobileNumber || "").trim() === term &&
                (s.dob || "").trim() === pass,
            );
      if (found) {
        if (found.status === "Inactive") {
          if (found.isSelfRegistered) {
            return "Your registration details are currently being verified by the administrator. Login will be activated within 24 hours of registration.";
          }
          return "This student account has been marked Inactive (deactivated).";
        }
        setLoggedInUserId(found.id);
        setLoggedInUserName(found.name);
        setRole("student");
        setIsLoggedIn(true);
        setStudentDashboardInitialTab(undefined);
        return null;
      } else {
        return "Incorrect Registered Mobile Number or DOB Password (DD-MM-YYYY).";
      }
    } else if (roleValue === "feemanager") {
      const found = feeManagers.find(
        (fm) =>
          (fm.employeeCode || "").trim().toUpperCase() === term.toUpperCase() &&
          (fm.password || "fee12112006") === pass,
      );
      if (found) {
        if (found.status === "Inactive") {
          return "This Fee Manager account has been deactivated by a Registrar.";
        }
        setLoggedInUserId(found.id);
        setLoggedInUserName(found.name);
        setRole("feemanager");
        setIsLoggedIn(true);
        return null;
      } else {
        return "Invalid Fee Manager Employee Code or Passphrase.";
      }
    } else if (roleValue === "admission") {
      const found = admissionOfficers.find(
        (ao) =>
          (ao.employeeCode || "").trim().toUpperCase() === term.toUpperCase() &&
          (ao.password || "admission12112006") === pass,
      );
      if (found) {
        if (found.status === "Inactive") {
          return "This Admission Desk account has been deactivated.";
        }
        setLoggedInUserId(found.id);
        setLoggedInUserName(found.name);
        setRole("admission");
        setIsLoggedIn(true);
        return null;
      } else {
        return "Invalid Admission Desk Employee Code or Password.";
      }
    } else if (roleValue === "principal") {
      const matchSchool = schools.find(
        (s) =>
          (s.principalEmail.toLowerCase() === term.toLowerCase() ||
           (s.principalEmployeeCode && s.principalEmployeeCode.trim().toUpperCase() === term.toUpperCase())) &&
          s.principalPassword === pass,
      );
      if (matchSchool) {
        if (matchSchool.status === "Inactive") {
          return "This school portal has been placed on hold (Deactive) by the super administrator.";
        }
        setLoggedInUserId(matchSchool.id);
        setLoggedInUserName(matchSchool.principalName);
        setRole("principal");
        setIsLoggedIn(true);
        return null;
      } else {
        return "Incorrect School Principal Email, Employee Code or password.";
      }
    } else if (roleValue === "verifier") {
      const found = verifiers.find(
        (v) =>
          ((v.employeeCode || "").trim().toUpperCase() === term.toUpperCase() ||
           (v.username || "").trim().toLowerCase() === term.toLowerCase()) &&
          (v.password || "verify123") === pass,
      );
      if (found) {
        if (found.status === "Inactive") {
          return "This Verifier account has been deactivated.";
        }
        setLoggedInUserId(found.id);
        setLoggedInUserName(found.name);
        setRole("verifier");
        setIsLoggedIn(true);
        return null;
      } else {
        return "Invalid Verifier Employee Code, Username or Password.";
      }
    }
    return "Invalid role selected.";
  };

  const handleOnlineFeePortalLogin = (
    rollNo: string,
    dobPassword: string,
  ): string | null => {
    const term = rollNo.trim().toUpperCase();
    const dobInput = dobPassword.trim();

    const found = students.find(
      (s) =>
        s.rollNo.toUpperCase() === term &&
        (s.dob || "12-11-2006").trim() === dobInput,
    );

    if (found) {
      if (found.status === "Inactive") {
        return "Your profile details are currently inactive or suspended. Please contact Admin.";
      }
      setLoggedInUserId(found.id);
      setLoggedInUserName(found.name);
      setRole("student");
      setStudentDashboardInitialTab("fees");
      setIsLoggedIn(true);
      return null;
    } else {
      return "Incorrect Roll Number or Date of Birth. Fee Portal authentication failed.";
    }
  };

  const handleRegisterStudent = (registrationData: {
    name: string;
    batchId: string;
    schoolName: string;
    email: string;
    mobileNumber: string;
    isGoogleRegistered?: boolean;
    googleEmail?: string;
  }): { rollNo: string; password: string } => {
    // Generate unique roll number: RJ2026 + random 4 digits
    let isUnique = false;
    let rollNo = "";
    let attempts = 0;
    while (!isUnique && attempts < 100) {
      attempts++;
      const randDigits = Math.floor(1000 + Math.random() * 9000);
      rollNo = `RJ2026${randDigits}`;
      if (
        !students.some((s) => s.rollNo.toUpperCase() === rollNo.toUpperCase())
      ) {
        isUnique = true;
      }
    }

    // Generate random password of 6 chars
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newStudent: Student = {
      id: "std_" + Date.now().toString(),
      name: registrationData.name,
      email: registrationData.email,
      rollNo: rollNo,
      avatar: getRandomAvatarUrl(registrationData.name),
      status: "Inactive", // starts as inactive/unverified for 24 hours lock
      password: password,
      schoolName: registrationData.schoolName,
      mobileNumber: registrationData.mobileNumber,
      batchId: registrationData.batchId,
      isSelfRegistered: true,
      isGoogleRegistered: registrationData.isGoogleRegistered || false,
      googleEmail: registrationData.googleEmail || "",
      registeredAt: new Date().toISOString(),
      dob: "12-11-2006", // Default date of birth template
    };

    // Update students state
    setStudents((prev) => [newStudent, ...prev]);

    // Link the student to the batch
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === registrationData.batchId) {
          return {
            ...b,
            studentIds: [...b.studentIds, newStudent.id],
          };
        }
        return b;
      }),
    );

    return { rollNo, password };
  };

  const isUsernameTaken = (uname: string): boolean => {
    const norm = uname.trim().toLowerCase();
    if (!norm) return false;
    if (norm === "admin") return true;
    if (admins.some((a) => (a.username || "").toLowerCase() === norm)) return true;
    if (teachers.some((t) => (t.username || "").toLowerCase() === norm)) return true;
    if (students.some((s) => (s.username || "").toLowerCase() === norm)) return true;
    if (feeManagers.some((fm) => (fm.username || "").toLowerCase() === norm)) return true;
    if (admissionOfficers.some((ao) => (ao.username || "").toLowerCase() === norm)) return true;
    return false;
  };

  const handleGoogleSignIn = async () => {
    setLoginError("");
    setIsAuthenticating(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = (user.email || "").toLowerCase().trim();

      // 1. Search Admins
      const foundAdmin = admins.find(
        (a) => (a.email || "").toLowerCase().trim() === email
      );
      if (foundAdmin) {
        if (foundAdmin.status === "Inactive") {
          throw new Error("This Administrator account has been deactivated.");
        }
        trigger15SecLoading(() => {
          setLoggedInUserId(foundAdmin.id);
          setLoggedInUserName(foundAdmin.name);
          setRole("admin");
          setIsLoggedIn(true);
          setLoginIdentifier("");
          setLoginPassword("");
        });
        return;
      }

      // 2. Search Teachers
      const foundTeacher = teachers.find(
        (t) => (t.email || "").toLowerCase().trim() === email
      );
      if (foundTeacher) {
        if (foundTeacher.status === "On Leave") {
          throw new Error("This Instructor is currently listed as On Leave.");
        }
        trigger15SecLoading(() => {
          setLoggedInUserId(foundTeacher.id);
          setLoggedInUserName(foundTeacher.name);
          setRole("teacher");
          setIsLoggedIn(true);
          setLoginIdentifier("");
          setLoginPassword("");
        });
        return;
      }

      // 3. Search Students
      const foundStudent = students.find(
        (s) =>
          (s.email || "").toLowerCase().trim() === email ||
          (s.googleEmail || "").toLowerCase().trim() === email
      );
      if (foundStudent) {
        if (foundStudent.status === "Inactive" || foundStudent.isLocked) {
          throw new Error("This Student account is currently inactive or locked.");
        }
        trigger15SecLoading(() => {
          setLoggedInUserId(foundStudent.id);
          setLoggedInUserName(foundStudent.name);
          setRole("student");
          setIsLoggedIn(true);
          setLoginIdentifier("");
          setLoginPassword("");
        });
        return;
      }

      // 4. Search Fee Managers
      const foundFee = feeManagers.find(
        (fm) => (fm.email || "").toLowerCase().trim() === email
      );
      if (foundFee) {
        if (foundFee.status === "Inactive") {
          throw new Error("This Treasurer account has been deactivated.");
        }
        trigger15SecLoading(() => {
          setLoggedInUserId(foundFee.id);
          setLoggedInUserName(foundFee.name);
          setRole("feemanager");
          setIsLoggedIn(true);
          setLoginIdentifier("");
          setLoginPassword("");
        });
        return;
      }

      // 5. Search Admission Officers
      const foundAdmOff = admissionOfficers.find(
        (ao) => (ao.email || "").toLowerCase().trim() === email
      );
      if (foundAdmOff) {
        if (foundAdmOff.status === "Inactive") {
          throw new Error("This Admission Officer account has been deactivated.");
        }
        trigger15SecLoading(() => {
          setLoggedInUserId(foundAdmOff.id);
          setLoggedInUserName(foundAdmOff.name);
          setRole("admission");
          setIsLoggedIn(true);
          setLoginIdentifier("");
          setLoginPassword("");
        });
        return;
      }

      // 6. Search Principal in Schools
      const foundSchool = schools.find(
        (sc) => (sc.principalEmail || "").toLowerCase().trim() === email
      );
      if (foundSchool) {
        if (foundSchool.status === "Inactive") {
          throw new Error("This school is currently listed as inactive.");
        }
        trigger15SecLoading(() => {
          setLoggedInUserId(foundSchool.id);
          setLoggedInUserName(foundSchool.principalName);
          setRole("principal");
          setIsLoggedIn(true);
          setLoginIdentifier("");
          setLoginPassword("");
        });
        return;
      }

      // 7. Search Verifiers
      const foundVerifier = verifiers.find(
        (v) => (v.email || "").toLowerCase().trim() === email
      );
      if (foundVerifier) {
        if (foundVerifier.status === "Inactive") {
          throw new Error("This Verifier account has been deactivated.");
        }
        trigger15SecLoading(() => {
          setLoggedInUserId(foundVerifier.id);
          setLoggedInUserName(foundVerifier.name);
          setRole("verifier");
          setIsLoggedIn(true);
          setLoginIdentifier("");
          setLoginPassword("");
        });
        return;
      }

      // Fallback: Auto-Register New Google Sign-In user as active Student!
      const newStudentId = `stud_google_${Date.now()}`;
      const newStudent: Student = {
        id: newStudentId,
        name: user.displayName || user.email?.split("@")[0] || "Google Student",
        email: email,
        googleEmail: email,
        isGoogleRegistered: true,
        mobileNumber: user.phoneNumber || "+91 9999999999",
        dob: "2008-01-01",
        fatherName: "Google Auth Parent",
        motherName: "Google Auth Parent",
        batchId: (batches && batches[0]?.id) || (publicBatches && publicBatches[0]?.id) || "batch_1",
        rollNo: `G-${Math.floor(1000 + Math.random() * 9000)}`,
        scholarNumber: `ENR-G-${Math.floor(10000 + Math.random() * 90000)}`,
        status: "Active",
        avatar: user.photoURL || getRandomAvatarUrl(user.displayName || "Google User"),
        registeredAt: new Date().toISOString(),
      };

      setStudents((prev) => [...prev, newStudent]);

      trigger15SecLoading(() => {
        setLoggedInUserId(newStudentId);
        setLoggedInUserName(newStudent.name);
        setRole("student");
        setIsLoggedIn(true);
        setLoginIdentifier("");
        setLoginPassword("");
      });

    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setLoginError("Sign-in was cancelled (popup window closed).");
      } else if (err.code === "auth/popup-blocked") {
        setLoginError("Popup was blocked by your browser. Please allow popups to sign in with Google.");
      } else {
        setLoginError(err.message || "Google Sign-In failed or was cancelled.");
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const term = loginIdentifier.trim();
    const pass = loginPassword.trim();

    if (!term) {
      setLoginError("Please enter your unique username.");
      return;
    }
    if (!pass) {
      setLoginError("Please enter your password.");
      return;
    }

    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      const usernameNorm = term.toLowerCase();

      // 1. Default super-admin fallback
      if ((usernameNorm === "admin" || usernameNorm === "mpdigi000") && pass === "12112006") {
        trigger15SecLoading(() => {
          setLoggedInUserId("admin_1");
          setLoggedInUserName("Administrator");
          setRole("admin");
          setIsLoggedIn(true);
          setLoginIdentifier("");
          setLoginPassword("");
        });
        return;
      }

      // 2. Search Admins
      const foundAdmin = admins.find(
        (a) => (a.username || "").trim().toLowerCase() === usernameNorm && (a.password || "12112006") === pass
      );
      if (foundAdmin) {
        if (foundAdmin.status === "Inactive") {
          setLoginError("This Administrator account has been deactivated.");
          return;
        }
        trigger15SecLoading(() => {
          setLoggedInUserId(foundAdmin.id);
          setLoggedInUserName(foundAdmin.name);
          setRole("admin");
          setIsLoggedIn(true);
          setLoginIdentifier("");
          setLoginPassword("");
        });
        return;
      }

      // 3. Search Teachers
      const foundTeacher = teachers.find(
        (t) => (t.username || "").trim().toLowerCase() === usernameNorm && (t.password || "green123") === pass
      );
      if (foundTeacher) {
        if (foundTeacher.status === "On Leave") {
          setLoginError("This teacher account is currently inactive or on leave.");
          return;
        }
        trigger15SecLoading(() => {
          setLoggedInUserId(foundTeacher.id);
          setLoggedInUserName(foundTeacher.name);
          setRole("teacher");
          setIsLoggedIn(true);
          setLoginIdentifier("");
          setLoginPassword("");
        });
        return;
      }

      // 4. Search Students (by username, rollNo, ID, email, or mobile number)
      const foundStudent = students.find(
        (s) => (
          (s.username || "").trim().toLowerCase() === usernameNorm ||
          (s.rollNo || "").trim().toLowerCase() === usernameNorm ||
          (s.id || "").trim().toLowerCase() === usernameNorm ||
          (s.email || "").trim().toLowerCase() === usernameNorm ||
          (s.mobileNumber || "").trim() === (loginIdentifier || "").trim()
        ) && (s.password || "alex123") === pass
      );
      if (foundStudent) {
        if (foundStudent.status === "Inactive" || foundStudent.isLocked) {
          setLoginError("This student account has been marked Inactive or Blocked by administration. Please contact center office.");
          return;
        }
        trigger15SecLoading(() => {
          setLoggedInUserId(foundStudent.id);
          setLoggedInUserName(foundStudent.name);
          setRole("student");
          setIsLoggedIn(true);
          setLoginIdentifier("");
          setLoginPassword("");
        });
        return;
      }

      // 5. Search Fee Managers
      const foundFM = feeManagers.find(
        (fm) => (fm.username || "").trim().toLowerCase() === usernameNorm && (fm.password || "fee12112006") === pass
      );
      if (foundFM) {
        if (foundFM.status === "Inactive") {
          setLoginError("This Fee Manager account has been deactivated.");
          return;
        }
        trigger15SecLoading(() => {
          setLoggedInUserId(foundFM.id);
          setLoggedInUserName(foundFM.name);
          setRole("feemanager");
          setIsLoggedIn(true);
          setLoginIdentifier("");
          setLoginPassword("");
        });
        return;
      }

      // 6. Search Admission Officers
      const foundAO = admissionOfficers.find(
        (ao) => (ao.username || "").trim().toLowerCase() === usernameNorm && (ao.password || "admission12112006") === pass
      );
      if (foundAO) {
        if (foundAO.status === "Inactive") {
          setLoginError("This Admission Desk account has been deactivated.");
          return;
        }
        trigger15SecLoading(() => {
          setLoggedInUserId(foundAO.id);
          setLoggedInUserName(foundAO.name);
          setRole("admission");
          setIsLoggedIn(true);
          setLoginIdentifier("");
          setLoginPassword("");
        });
        return;
      }

      // 8. Search Verifiers
      const foundVerifier = verifiers.find(
        (v) => (v.username || "").trim().toLowerCase() === usernameNorm && (v.password || "verify123") === pass
      );
      if (foundVerifier) {
        if (foundVerifier.status === "Inactive") {
          setLoginError("This Verifier account has been deactivated.");
          return;
        }
        trigger15SecLoading(() => {
          setLoggedInUserId(foundVerifier.id);
          setLoggedInUserName(foundVerifier.name);
          setRole("verifier");
          setIsLoggedIn(true);
          setLoginIdentifier("");
          setLoginPassword("");
        });
        return;
      }

      // 7. Search Principals
      const foundSchool = schools.find(
        (s) =>
          ((s.principalEmail || "").trim().toLowerCase() === usernameNorm ||
           (s.principalEmployeeCode || "").trim().toLowerCase() === usernameNorm ||
           (s.principalName || "").trim().toLowerCase() === usernameNorm) &&
          (s.principalPassword || "principal123") === pass
      );
      if (foundSchool) {
        trigger15SecLoading(() => {
          setLoggedInUserId(foundSchool.id);
          setLoggedInUserName(foundSchool.principalName);
          setRole("principal");
          setIsLoggedIn(true);
          setLoginIdentifier("");
          setLoginPassword("");
        });
        return;
      }

      setLoginError("Invalid username or password. Secure login blocked.");
    }, 750);
  };

  // Evict deleted accounts immediately
  useEffect(() => {
    if (!isLoggedIn) return;

    if (role === "admin") {
      if (loggedInUserId === "admin" || loggedInUserId === "admin_1") return;
      const adminExists = admins.some((a) => a.id === loggedInUserId);
      if (!adminExists) {
        handleLogout();
      }
    } else if (role === "teacher") {
      const teacherExists = teachers.some((t) => t.id === loggedInUserId);
      if (!teacherExists) {
        handleLogout();
      }
    } else if (role === "student") {
      const studentExists = students.some((s) => s.id === loggedInUserId);
      if (!studentExists) {
        handleLogout();
      }
    } else if (role === "feemanager") {
      if (loggedInUserId === "fm_default") return;
      const fmExists = feeManagers.some((fm) => fm.id === loggedInUserId);
      if (!fmExists) {
        handleLogout();
      }
    } else if (role === "admission") {
      if (loggedInUserId === "admission_desk_1") return;
    }
  }, [
    students,
    teachers,
    admins,
    feeManagers,
    isLoggedIn,
    loggedInUserId,
    role,
  ]);

  // --- START OF REAL-TIME NOTIFICATION BROADCAST COMPOSER AND DRAWER ---
  const [composeTitle, setComposeTitle] = useState<string>("");
  const [composeContent, setComposeContent] = useState<string>("");
  const [composeYoutube, setComposeYoutube] = useState<string>("");
  const [composeAttachmentType, setComposeAttachmentType] = useState<
    "image" | "video" | "pdf" | "none"
  >("none");
  const [composeAttachmentName, setComposeAttachmentName] =
    useState<string>("");
  const [composeAttachmentUrl, setComposeAttachmentUrl] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const getYouTubeEmbedId = (url?: string): string | null => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    setComposeAttachmentName(file.name);
    if (
      file.type.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
    ) {
      setComposeAttachmentType("image");
    } else if (
      file.type.startsWith("video/") ||
      /\.(mp4|webm|ogg|mov)$/i.test(file.name)
    ) {
      setComposeAttachmentType("video");
    } else if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
      setComposeAttachmentType("pdf");
    } else {
      setComposeAttachmentType("pdf");
    }

    if (file.size <= 2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setComposeAttachmentUrl((event.target?.result as string) || "");
      };
      reader.readAsDataURL(file);
    } else {
      setComposeAttachmentUrl("mock-large-file-payload-" + Date.now());
    }
  };

  const handlePublishNotification = () => {
    if (!composeTitle.trim() || !composeContent.trim()) {
      alert(
        "Please enter both a Title and Content description for your official circular.",
      );
      return;
    }

    const profile = getCurrentUserProfile();
    const newNotif: AppNotification = {
      id: "notif_" + Date.now(),
      title: composeTitle,
      content: composeContent,
      senderName: profile.nameVal,
      senderRole: role,
      timestamp: new Date().toLocaleString([], {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      readBy: [loggedInUserId], // author reads instantly
      youtubeUrl: composeYoutube.trim() || undefined,
      attachmentType:
        composeAttachmentType !== "none" ? composeAttachmentType : undefined,
      attachmentName: composeAttachmentName || undefined,
      attachmentUrl: composeAttachmentUrl || undefined,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Reset Form
    setComposeTitle("");
    setComposeContent("");
    setComposeYoutube("");
    setComposeAttachmentType("none");
    setComposeAttachmentName("");
    setComposeAttachmentUrl("");
    setIsComposeNotificationOpen(false);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          if (!n.readBy.includes(loggedInUserId)) {
            return { ...n, readBy: [...n.readBy, loggedInUserId] };
          }
        }
        return n;
      }),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (!n.readBy.includes(loggedInUserId)) {
          return { ...n, readBy: [...n.readBy, loggedInUserId] };
        }
        return n;
      }),
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Helper inside App component block to render the Workspace Comms widget
  const NotificationHubWorkspace = () => {
    const isSender = ["admin", "teacher", "principal"].includes(role);
    const profile = getCurrentUserProfile();

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md">
              Real-Time Broadcast Console
            </span>
            <h2 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1.5 flex items-center space-x-2">
              <Megaphone className="w-5 h-5 text-indigo-600" />
              <span>Institutional Broadcast Terminal</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Draft official notices, attach classroom documents, configure
              video feeds, and broadcast notifications instantly.
            </p>
          </div>

          {isSender && !isComposeNotificationOpen && (
            <button
              onClick={() => setIsComposeNotificationOpen(true)}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold uppercase tracking-wide px-4 py-2.5 rounded-xl cursor-pointer shadow-md shadow-red-600/15"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Compose Message</span>
            </button>
          )}
        </div>

        {isComposeNotificationOpen && isSender ? (
          <div className="bg-white border-2 border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-sans">
                Create Real-Time Broadcast circular
              </h3>
              <button
                onClick={() => setIsComposeNotificationOpen(false)}
                className="text-xs font-black text-red-600 hover:text-red-700 uppercase tracking-widest cursor-pointer font-sans"
              >
                Back to Feed
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Side */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1.5 font-sans">
                    Broadcast Notice Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Revision Test Schedules & Mock Syllabus"
                    className="w-full bg-white text-slate-900 placeholder-slate-400 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={composeTitle}
                    onChange={(e) => setComposeTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1.5 font-sans">
                    Broadcasting Circular Content *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide detailed instructions and context for this circular here..."
                    className="w-full bg-white text-slate-900 placeholder-slate-400 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={composeContent}
                    onChange={(e) => setComposeContent(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1.5 flex justify-between items-center font-sans">
                    <span>YouTube Lecture/Trailer URL (Optional)</span>
                    <span className="text-[9px] text-red-600 font-mono font-bold">
                      Real-Time Embed Block
                    </span>
                  </label>
                  <input
                    type="url"
                    placeholder="e.g., https://www.youtube.com/watch?v=..."
                    className="w-full bg-white text-slate-900 placeholder-slate-400 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={composeYoutube}
                    onChange={(e) => setComposeYoutube(e.target.value)}
                  />
                </div>

                {/* Secure File Multi-Uploader Tool */}
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1.5 font-sans">
                    Multi-Media Attachment Tools (Images, PDF, Video uploads)
                  </label>

                  {composeAttachmentType === "none" ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processFile(file);
                      }}
                      className={`border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center space-y-2 cursor-pointer transition-colors ${
                        isDragOver
                          ? "border-red-500 bg-red-50/20"
                          : "border-slate-350 bg-white hover:bg-slate-50"
                      }`}
                      onClick={() =>
                        document
                          .getElementById("hidden-file-uploader-workspace")
                          ?.click()
                      }
                    >
                      <Paperclip className="w-5 h-5 text-slate-500 animate-bounce" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 font-sans">
                          Drag & Drop real file, or browse files
                        </p>
                        <p className="text-[9px] text-slate-500 mt-1 uppercase font-mono font-bold">
                          Supports Images (.png, .jpg), Videos (.mp4), and PDFs
                        </p>
                      </div>

                      <input
                        id="hidden-file-uploader-workspace"
                        type="file"
                        className="hidden"
                        accept="image/*,video/*,application/pdf"
                        onChange={handleFileSelect}
                      />
                    </div>
                  ) : (
                    <div className="bg-white border-2 border-slate-200 px-4 py-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">
                          {composeAttachmentType === "image" && "🖼️"}
                          {composeAttachmentType === "video" && "🎬"}
                          {composeAttachmentType === "pdf" && "📄"}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                            {composeAttachmentName}
                          </p>
                          <p className="text-[10px] text-red-600 font-mono uppercase tracking-widest font-black">
                            {composeAttachmentType} Selected
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setComposeAttachmentType("none");
                          setComposeAttachmentName("");
                          setComposeAttachmentUrl("");
                        }}
                        className="text-xs font-black text-red-600 hover:text-red-800 uppercase cursor-pointer font-sans"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Preset Quick Select for high-fidelity testing */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-[9px] text-slate-500 font-bold self-center block mr-1 uppercase font-sans">
                      Sample Templates:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setComposeAttachmentType("pdf");
                        setComposeAttachmentName("academic_test_syllabus.pdf");
                        setComposeAttachmentUrl("sample-pdf-guideline");
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-350 text-[9px] font-black text-slate-700 rounded-lg scale-95 hover:border-red-500 cursor-pointer"
                    >
                      📄 Sample.pdf
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setComposeAttachmentType("image");
                        setComposeAttachmentName(
                          "chemistry_mechanics_diagram.png",
                        );
                        setComposeAttachmentUrl(
                          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800",
                        );
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-350 text-[9px] font-black text-slate-700 rounded-lg scale-95 hover:border-red-500 cursor-pointer"
                    >
                      🖼️ Science.png
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setComposeAttachmentType("video");
                        setComposeAttachmentName(
                          "lab_orientation_walkthrough.mp4",
                        );
                        setComposeAttachmentUrl(
                          "https://www.w3schools.com/html/mov_bbb.mp4",
                        );
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-350 text-[9px] font-black text-slate-700 rounded-lg scale-95 hover:border-red-500 cursor-pointer"
                    >
                      🎬 Lecture.mp4
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handlePublishNotification}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase py-3.5 rounded-xl tracking-wider shadow-md shadow-red-600/10 transition-colors text-center cursor-pointer font-sans"
                  >
                    🚀 Release Real-Time Broadcast Notice
                  </button>
                </div>
              </div>

              {/* Preview Side */}
              <div className="bg-slate-100 dark:bg-slate-950 p-5 rounded-2xl space-y-4 border border-slate-200/40 dark:border-slate-900">
                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest block font-mono">
                  Live Subscriber Mobile Preview Device
                </span>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-xl space-y-3 shadow-md max-w-sm mx-auto text-left relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />

                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <span className="inline-block p-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 text-xs rounded-lg font-black uppercase font-mono">
                        {role.substring(0, 4)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-305">
                        {profile.nameVal}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">
                      Just Now
                    </span>
                  </div>

                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase">
                    {composeTitle || "Noticeboard Heading Preview"}
                  </h3>

                  <p className="text-[11px] text-slate-500 leading-relaxed whitespace-pre-wrap">
                    {composeContent ||
                      "Draft content will appear here recursively as you enter text inside the circular release forms..."}
                  </p>

                  {/* Attachment Previews */}
                  {composeAttachmentType !== "none" && (
                    <div className="mt-2 text-left border-t border-slate-100 dark:border-slate-800 pt-2.5">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono tracking-wider mb-2">
                        Attachment Preview:
                      </span>

                      {composeAttachmentType === "image" && (
                        <div className="relative rounded-lg overflow-hidden border border-slate-100 max-h-[140px] bg-slate-950">
                          <img
                            src={
                              composeAttachmentUrl ||
                              "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300"
                            }
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {composeAttachmentType === "video" && (
                        <div className="relative rounded-lg overflow-hidden border border-slate-100 bg-slate-950">
                          <video
                            src={
                              composeAttachmentUrl ||
                              "https://www.w3schools.com/html/mov_bbb.mp4"
                            }
                            controls
                            className="w-full max-h-[140px]"
                          />
                        </div>
                      )}

                      {composeAttachmentType === "pdf" && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/60 rounded-xl flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">📄</span>
                            <div>
                              <p className="text-[10px] font-bold text-slate-850 dark:text-slate-100 truncate max-w-[140px]">
                                {composeAttachmentName || "Syllabus.pdf"}
                              </p>
                              <p className="text-[8px] text-red-500 font-mono uppercase font-bold">
                                Adobe PDF Document
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* YouTube Embedded Previews */}
                  {composeYoutube && getYouTubeEmbedId(composeYoutube) && (
                    <div className="mt-2 text-left border-t border-slate-100 dark:border-slate-800 pt-2.5">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono tracking-wider mb-2 flex items-center space-x-1">
                        <Youtube className="w-3.5 h-3.5 text-red-500" />
                        <span>Interactive Video Player:</span>
                      </span>
                      <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-video border border-slate-200 dark:border-slate-800 mb-1">
                        <iframe
                          title="YouTube video player"
                          src={`https://www.youtube.com/embed/${getYouTubeEmbedId(composeYoutube)}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Live Feed View */
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold uppercase text-slate-400 font-mono tracking-wider">
                Authorized Communications Feed ({notifications.length} Posted
                Alerts)
              </span>
              <button
                onClick={handleMarkAllAsRead}
                className="text-indigo-600 hover:text-indigo-800 font-extrabold uppercase tracking-wide cursor-pointer text-[10px]"
              >
                Mark all as Read
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl">
                <span className="text-4xl">📭</span>
                <h4 className="text-sm font-black text-slate-850 dark:text-slate-350 uppercase tracking-widest mt-4">
                  Comms channel is quiet
                </h4>
                <p className="text-xs text-slate-405 mt-1 max-w-sm mx-auto font-medium">
                  None has authored any system notifications yet. Click +
                  Compose Message above to release a notice.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notif) => {
                  const hasRead = notif.readBy.includes(loggedInUserId);
                  const ytId = getYouTubeEmbedId(notif.youtubeUrl);

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id)}
                      className={`relative bg-white border-2 rounded-2xl p-5 shadow-sm transition-all text-left ${
                        hasRead
                          ? "border-slate-200"
                          : "border-red-500/50 bg-red-50/5 shadow-red-500/5 ring-1 ring-red-500/10"
                      }`}
                    >
                      {/* Read/Unread Indicator Pill - Red */}
                      {!hasRead && (
                        <span className="absolute top-4 right-4 bg-red-600 text-[8px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse font-mono shadow-xs">
                          Unread Alert
                        </span>
                      )}

                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-red-700 bg-red-50 px-2.5 py-1 rounded-xl text-[9px] font-mono font-bold uppercase tracking-widest">
                            Sender: {notif.senderRole}
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            {notif.senderName}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono font-bold mt-0.5">
                          {notif.timestamp}
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-slate-950 uppercase tracking-tight mb-2 flex items-center space-x-1.5 font-sans">
                        <Megaphone className="w-4 h-4 text-red-500" />
                        <span>{notif.title}</span>
                      </h3>

                      <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap pl-5.5 font-sans font-medium">
                        {notif.content}
                      </p>

                      {/* Display media attachments directly */}
                      {notif.attachmentType && notif.attachmentUrl && (
                        <div className="mt-4 pl-5.5 pt-4 border-t border-slate-150 max-w-xl">
                          <span className="text-[9px] font-mono font-black uppercase text-slate-500 tracking-wider block mb-2">
                            Attached Material: {notif.attachmentName}
                          </span>

                          {notif.attachmentType === "image" && (
                            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 max-h-[250px]">
                              <img
                                src={notif.attachmentUrl}
                                alt={notif.attachmentName}
                                className="w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800";
                                }}
                              />
                            </div>
                          )}

                          {notif.attachmentType === "video" && (
                            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
                              <video
                                src={notif.attachmentUrl}
                                controls
                                className="w-full max-h-[250px]"
                              />
                            </div>
                          )}

                          {notif.attachmentType === "pdf" && (
                            <div className="bg-red-50/40 border border-red-150 p-4 rounded-xl flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">📄</span>
                                <div className="text-left">
                                  <p className="text-xs font-black text-slate-900 uppercase font-sans">
                                    {notif.attachmentName}
                                  </p>
                                  <p className="text-[9px] text-red-600 font-mono font-bold uppercase mt-0.5">
                                    Academic PDF Pamphlet (Fully Downloadable)
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(
                                    `Downloading payload of "${notif.attachmentName}" securely in workspace...`,
                                  );
                                }}
                                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                              >
                                View / Download
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Display YouTube block if present */}
                      {ytId && (
                        <div className="mt-4 pl-5.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 max-w-xl">
                          <span className="text-[9px] font-mono font-black uppercase text-slate-400 tracking-wider block mb-2 flex items-center space-x-1">
                            <Plus className="w-3.5 h-3.5 text-rose-500" />
                            <span>Interactive Video Presentation:</span>
                          </span>
                          <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video border border-slate-100 dark:border-slate-800 max-w-md">
                            <iframe
                              title="YouTube video player"
                              src={`https://www.youtube.com/embed/${ytId}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="absolute inset-0 w-full h-full"
                            />
                          </div>
                        </div>
                      )}

                      {/* Delete Privileges for Author */}
                      {isSender && (
                        <div className="mt-4 pr-1 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notif.id);
                            }}
                            className="flex items-center space-x-1.5 text-rose-500 hover:text-rose-700 text-[10px] font-extrabold uppercase tracking-wide cursor-pointer px-2 py-1 rounded-md hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Recall Notice</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleLogout = () => {
    trigger15SecLoading(() => {
      setIsLoggedIn(false);
      setLoggedInUserId("");
      setLoggedInUserName("");
      setRole("admin"); // default fallback role
      setStudentDashboardInitialTab(undefined);
      setLoginPortalView("choose");
      localStorage.removeItem("co_is_logged_in");
      localStorage.removeItem("co_user_role");
      localStorage.removeItem("co_user_id");
      localStorage.removeItem("co_user_name");
    });
  };

  // Handler functions
  const handleResolveAlert = (
    id: string,
    comments: string,
    resolvedBy: string,
  ) => {
    setSecurityAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, resolved: true, resolvedBy, comments } : a,
      ),
    );
  };

  const handleTriggerSOS = (
    alert: Omit<SecuritySOSAlert, "id" | "timestamp" | "resolved">,
  ) => {
    const newAlert: SecuritySOSAlert = {
      ...alert,
      id: "sec_alert_" + Date.now(),
      timestamp: new Date().toISOString(),
      resolved: false,
    };
    setSecurityAlerts((prev) => [newAlert, ...prev]);
  };

  const handleCreateBatch = (newBatch: Batch) => {
    clearDeletedId("batches", newBatch.id);
    setBatches((prev) => [newBatch, ...prev]);
  };

  const handleDeleteBatch = (id: string) => {
    markIdAsDeleted("batches", id);
    setBatches((prev) => prev.filter((b) => b.id !== id));
    deleteDoc(doc(db, "batches", id)).catch(() => {});
  };

  const handleUpdateBatch = (updatedBatch: Batch) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === updatedBatch.id ? updatedBatch : b)),
    );
  };

  const generateRandomEmployeeCode = (): string => {
    let result = "";
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 1000) {
      attempts++;
      const randNum = Math.floor(100 + Math.random() * 900); // 3 digits precisely
      const code = `MPDIGI${randNum}`;
      
      const inAdmins = admins?.some((a) => (a.employeeCode || "").toUpperCase() === code);
      const inTeachers = teachers?.some((t) => (t.employeeCode || "").toUpperCase() === code);
      const inFee = feeManagers?.some((f) => (f.employeeCode || "").toUpperCase() === code);
      const inAdmission = admissionOfficers?.some((ao) => (ao.employeeCode || "").toUpperCase() === code);
      const inSchools = schools?.some((s) => (s.principalEmployeeCode || "").toUpperCase() === code);

      if (!inAdmins && !inTeachers && !inFee && !inAdmission && !inSchools) {
        result = code;
        isUnique = true;
      }
    }
    if (!result) {
      result = `MPDIGI${Math.floor(100 + Math.random() * 900)}`;
    }
    return result;
  };

  const handleCreateTeacher = (newTeacher: Teacher) => {
    clearDeletedId("teachers", newTeacher.id);
    const updated = {
      ...newTeacher,
      employeeCode: newTeacher.employeeCode || generateRandomEmployeeCode(),
    };
    setTeachers((prev) => [updated, ...prev]);
  };

  const handleDeleteTeacher = (id: string) => {
    markIdAsDeleted("teachers", id);
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    deleteDoc(doc(db, "teachers", id)).catch(() => {});
    // reset assigned batches
    setBatches((prev) =>
      prev.map((b) => (b.teacherId === id ? { ...b, teacherId: "" } : b)),
    );
  };

  const handleCreateFeeManager = (fm: FeeManager) => {
    clearDeletedId("feeManagers", fm.id);
    const updated = {
      ...fm,
      employeeCode: fm.employeeCode || generateRandomEmployeeCode(),
    };
    setFeeManagers((prev) => {
      if (prev.some((x) => x.email.toLowerCase() === updated.email.toLowerCase())) {
        alert("A Fee Manager with this email address already exists.");
        return prev;
      }
      return [...prev, updated];
    });
  };

  const handleDeleteFeeManager = (id: string) => {
    markIdAsDeleted("feeManagers", id);
    setFeeManagers((prev) => prev.filter((fm) => fm.id !== id));
    deleteDoc(doc(db, "feeManagers", id)).catch(() => {});
  };

  const handleUpdateFeeManagerStatus = (
    id: string,
    nextStatus: "Active" | "Inactive",
  ) => {
    setFeeManagers((prev) =>
      prev.map((fm) => (fm.id === id ? { ...fm, status: nextStatus } : fm)),
    );
  };

  const handleUpdateFeeManagerPassword = (id: string, nextPass: string) => {
    setFeeManagers((prev) =>
      prev.map((fm) => (fm.id === id ? { ...fm, password: nextPass } : fm)),
    );
  };

  const handleCreateAdmissionOfficer = (ao: AdmissionOfficer) => {
    clearDeletedId("admissionOfficers", ao.id);
    const updated = {
      ...ao,
      employeeCode: ao.employeeCode || generateRandomEmployeeCode(),
    };
    setAdmissionOfficers((prev) => {
      if (prev.some((x) => x.email.toLowerCase() === updated.email.toLowerCase())) {
        alert("An Admission Officer with this email address already exists.");
        return prev;
      }
      return [...prev, updated];
    });
  };

  const handleDeleteAdmissionOfficer = (id: string) => {
    markIdAsDeleted("admissionOfficers", id);
    setAdmissionOfficers((prev) => prev.filter((ao) => ao.id !== id));
    deleteDoc(doc(db, "admissionOfficers", id)).catch(() => {});
  };

  const handleUpdateAdmissionOfficerStatus = (
    id: string,
    nextStatus: "Active" | "Inactive",
  ) => {
    setAdmissionOfficers((prev) =>
      prev.map((ao) => (ao.id === id ? { ...ao, status: nextStatus } : ao)),
    );
  };

  const handleUpdateAdmissionOfficerPassword = (
    id: string,
    nextPass: string,
  ) => {
    setAdmissionOfficers((prev) =>
      prev.map((ao) => (ao.id === id ? { ...ao, password: nextPass } : ao)),
    );
  };

  const handleCreateVerifier = (v: Verifier) => {
    clearDeletedId("verifiers", v.id);
    setVerifiers((prev) => {
      if (prev.some((x) => x.username.toLowerCase() === v.username.toLowerCase())) {
        alert("A Verifier with this username already exists.");
        return prev;
      }
      return [...prev, v];
    });
  };

  const handleDeleteVerifier = (id: string) => {
    markIdAsDeleted("verifiers", id);
    setVerifiers((prev) => prev.filter((v) => v.id !== id));
    deleteDoc(doc(db, "verifiers", id)).catch(() => {});
  };

  const handleUpdateVerifierStatus = (id: string, nextStatus: "Active" | "Inactive") => {
    setVerifiers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: nextStatus } : v)),
    );
  };

  const handleUpdateVerifierPassword = (id: string, nextPass: string) => {
    setVerifiers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, password: nextPass } : v)),
    );
  };

  const handleCreateStudent = (newStudent: Student) => {
    clearDeletedId("students", newStudent.id);
    setStudents((prev) => [newStudent, ...prev]);
    if (newStudent.batchId) {
      setBatches((prev) =>
        prev.map((b) => {
          if (b.id === newStudent.batchId) {
            const studentIds = b.studentIds || [];
            if (!studentIds.includes(newStudent.id)) {
              return { ...b, studentIds: [...studentIds, newStudent.id] };
            }
          }
          return b;
        }),
      );
    }
  };

  const handleDeleteStudent = (id: string) => {
    markIdAsDeleted("students", id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    deleteDoc(doc(db, "students", id)).catch(() => {});
    // remove from enrolled student lists in batches
    setBatches((prev) =>
      prev.map((b) => ({
        ...b,
        studentIds: b.studentIds.filter((sid) => sid !== id),
      })),
    );
  };

  const handleUnenrollStudent = (id: string) => {
    // remove from enrolled student lists in all batches
    setBatches((prev) =>
      prev.map((b) => ({
        ...b,
        studentIds: (b.studentIds || []).filter((sid) => sid !== id),
      })),
    );
    // clear student batch assignment and mark enrollmentStatus as Un-Enrolled
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, batchId: "", batchName: "", enrollmentStatus: "Un-Enrolled" as const }
          : s,
      ),
    );
    updateDoc(doc(db, "students", id), {
      batchId: "",
      batchName: "",
      enrollmentStatus: "Un-Enrolled",
    }).catch(() => {});
  };

  const handleDeleteMarksheet = (id: string) => {
    markIdAsDeleted("examResults", id);
    setExamMarksheets((prev) => prev.filter((m) => m.id !== id));
    deleteDoc(doc(db, "examResults", id)).catch(() => {});
  };

  const handleCreateAdmin = (newAdmin: AdminUser) => {
    clearDeletedId("admins", newAdmin.id);
    const updated = {
      ...newAdmin,
      employeeCode: newAdmin.employeeCode || generateRandomEmployeeCode(),
    };
    setAdmins((prev) => [updated, ...prev]);
  };

  const handleDeleteAdmin = (id: string) => {
    if (
      admins.filter((a) => a.status === "Active").length <= 1 &&
      admins.some((a) => a.id === id && a.status === "Active")
    ) {
      alert(
        "Cannot delete or deactivate the last remaining Active Admin to prevent security lockout!",
      );
      return;
    }
    markIdAsDeleted("admins", id);
    setAdmins((prev) => prev.filter((a) => a.id !== id));
    deleteDoc(doc(db, "admins", id)).catch(() => {});
  };

  const handleUpdateAdminStatus = (
    id: string,
    nextStatus: "Active" | "Inactive",
  ) => {
    if (
      nextStatus === "Inactive" &&
      admins.filter((a) => a.status === "Active").length <= 1 &&
      admins.some((a) => a.id === id && a.status === "Active")
    ) {
      alert(
        "Cannot deactivate the last remaining Active Admin to prevent security lockout!",
      );
      return;
    }
    setAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a)),
    );
  };

  const handleUpdateAdminPassword = (id: string, nextPass: string) => {
    setAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, password: nextPass } : a)),
    );
  };

  const handleUpdateTeacherStatus = (
    id: string,
    nextStatus: "Active" | "On Leave",
  ) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)),
    );
  };

  const handleUpdateTeacherPassword = (id: string, nextPass: string) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, password: nextPass } : t)),
    );
  };

  const handleUpdateStudentStatus = (
    id: string,
    nextStatus: "Active" | "Inactive",
  ) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s)),
    );
  };

  const handleUpdateStudentPassword = (id: string, nextPass: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, password: nextPass } : s)),
    );
  };

  const handleUpdateStudentDetails = (
    id: string,
    updatedFields: Partial<Student>,
  ) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s)),
    );

    if (updatedFields.batchId !== undefined) {
      setBatches((prev) =>
        prev.map((b) => {
          let studentIds = b.studentIds || [];
          if (b.id !== updatedFields.batchId) {
            studentIds = studentIds.filter((sid) => sid !== id);
          } else {
            if (!studentIds.includes(id)) {
              studentIds = [...studentIds, id];
            }
          }
          return { ...b, studentIds };
        }),
      );
    }
  };

  const handleUpdateStudentProfile = (
    id: string,
    name: string,
    email: string,
    avatar: string,
  ) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name, email, avatar } : s)),
    );
    if (loggedInUserId === id) {
      setLoggedInUserName(name);
    }
  };

  const handleUpdateStudentFormDetails = (
    id: string,
    details: {
      serialNumber?: string;
      apparId?: string;
      penNumber?: string;
      name?: string;
      fatherName?: string;
      motherName?: string;
      dob?: string;
      scholarNumber?: string;
      ssmId?: string;
    },
  ) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...details } : s)),
    );
    if (loggedInUserId === id && details.name) {
      setLoggedInUserName(details.name);
    }
  };

  const handleUpdateTeacherProfile = (
    id: string,
    name: string,
    email: string,
    specialization: string,
    avatar: string,
  ) => {
    setTeachers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, name, email, specialization, avatar } : t,
      ),
    );
    if (loggedInUserId === id) {
      setLoggedInUserName(name);
    }
  };

  const handleUpdateAdminProfile = (
    id: string,
    name: string,
    email: string,
    avatar?: string,
  ) => {
    setAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, name, email, avatar } : a)),
    );
    if (loggedInUserId === id) {
      setLoggedInUserName(name);
    }
  };

  const handleUpdateFeeManagerProfile = (
    id: string,
    name: string,
    email: string,
    password?: string,
  ) => {
    setFeeManagers((prev) =>
      prev.map((fm) => {
        if (fm.id === id) {
          return {
            ...fm,
            name,
            email,
            ...(password ? { password } : {}),
          };
        }
        return fm;
      }),
    );
    if (loggedInUserId === id) {
      setLoggedInUserName(name);
    }
  };

  const handleAddFeeInvoice = (newInvoice: FeeInvoice) => {
    setFees((prev) => [newInvoice, ...prev]);
  };

  const handleUpdateFeeStatus = (
    id: string,
    status: "Paid" | "Unpaid",
    paidDate?: string,
  ) => {
    setFees((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status,
              paidDate:
                status === "Paid"
                  ? paidDate || new Date().toISOString().split("T")[0]
                  : undefined,
            }
          : f,
      ),
    );
  };

  const handleDeleteFeeInvoice = (id: string) => {
    markIdAsDeleted("feeInvoices", id);
    setFees((prev) => prev.filter((f) => f.id !== id));
    deleteDoc(doc(db, "feeInvoices", id)).catch(() => {});
  };

  const handleSendSupportMessage = (content: string, studentId: string) => {
    const newMsg: SupportMessage = {
      id: "support_msg_" + Math.random().toString(36).substring(2, 9),
      senderId: loggedInUserId || "guest",
      senderName: loggedInUserName || "Anonymous",
      senderRole: role as any,
      content,
      timestamp: new Date().toISOString(),
      studentId,
    };
    setSupportMessages((prev) => [...prev, newMsg]);
  };

  const handleAddLesson = (newLesson: Lesson) => {
    clearDeletedId("lessons", newLesson.id);
    setLessons((prev) => [newLesson, ...prev]);
  };

  const handleUpdateLessonStatus = (
    id: string,
    nextStatus: "Draft" | "Published" | "Completed",
  ) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: nextStatus } : l)),
    );
  };

  const handleDeleteLesson = (id: string) => {
    markIdAsDeleted("lessons", id);
    setLessons((prev) => prev.filter((l) => l.id !== id));
    deleteDoc(doc(db, "lessons", id)).catch(() => {});
  };

  const handleMarkAttendance = (
    studentId: string,
    date: string,
    status: "Present" | "Absent",
    batchId: string,
  ) => {
    setAttendanceRecords((prev) => {
      const filtered = prev.filter(
        (r) =>
          !(
            r.studentId === studentId &&
            r.date === date &&
            r.batchId === batchId
          ),
      );
      return [
        ...filtered,
        {
          id: "att_" + Math.random().toString(36).substring(2, 9),
          studentId,
          date,
          status,
          batchId,
        },
      ];
    });
  };

  const handleBatchMarkAttendance = (
    recordsToSave: Omit<AttendanceRecord, "id">[],
  ) => {
    setAttendanceRecords((prev) => {
      const keysToReplace = new Set(
        recordsToSave.map((r) => `${r.studentId}::${r.date}::${r.batchId}`),
      );
      const filtered = prev.filter(
        (r) => !keysToReplace.has(`${r.studentId}::${r.date}::${r.batchId}`),
      );
      const newItems = recordsToSave.map((r) => ({
        ...r,
        id: "att_" + Math.random().toString(36).substring(2, 9),
      }));
      return [...filtered, ...newItems];
    });
  };

  const handleAddTest = (newTest: Test) => {
    clearDeletedId("tests", newTest.id);
    setTests((prev) => [newTest, ...prev]);
  };

  const handleUpdateTest = (updatedTest: Test) => {
    setTests((prev) =>
      prev.map((t) => (t.id === updatedTest.id ? updatedTest : t)),
    );
  };

  const handleApproveTest = (id: string, isApproved: boolean) => {
    setTests((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, isAdminApproved: isApproved } : t,
      ),
    );
  };

  const handleDeleteTest = (id: string) => {
    markIdAsDeleted("tests", id);
    setTests((prev) => prev.filter((t) => t.id !== id));
    deleteDoc(doc(db, "tests", id)).catch(() => {});
  };

  const handleUpdateStudentLock = (id: string, isLocked: boolean) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          let deskCode = s.assignedComputerDeskCode;
          if (isLocked && deskCode) {
            // set that desk as Available
            setComputerDesks((desks) =>
              desks.map((d) =>
                d.uniqueCode === deskCode
                  ? { ...d, status: "Available", currentStudentId: undefined }
                  : d,
              ),
            );
            return {
              ...s,
              isLocked,
              assignedComputerDeskCode: undefined,
              verifiedAt: undefined,
            };
          }
          return { ...s, isLocked };
        }
        return s;
      }),
    );
  };

  const handleVerifyStudentAndAllotDesk = (
    studentId: string,
    deskCode: string | "auto" | undefined,
  ) => {
    if (deskCode === undefined) {
      // Release desk cleanly
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === studentId) {
            return {
              ...s,
              assignedComputerDeskCode: undefined,
              verifiedAt: undefined,
            };
          }
          return s;
        }),
      );
      setComputerDesks((prev) =>
        prev.map((d) => {
          if (d.currentStudentId === studentId) {
            return { ...d, status: "Available", currentStudentId: undefined };
          }
          return d;
        }),
      );
      return;
    }

    // Check if student is verified
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) {
      alert("⚠️ Student record not found!");
      return;
    }

    if (!targetStudent.isVerified) {
      alert(`⚠️ Allocation Rejected: "${targetStudent.name}" is not verified. Only verified students are allowed computer allotment!`);
      return;
    }

    let targetCode = deskCode;

    // Find available desk if request is "auto"
    if (deskCode === "auto") {
      const avail = computerDesks.find((d) => d.status === "Available");
      if (!avail) {
        alert(
          "⚠️ No available computer desks registered at the moment! Please register or release some.",
        );
        return;
      }
      targetCode = avail.uniqueCode;
    }

    // Verify desk validity
    const deskObj = computerDesks.find((d) => d.uniqueCode === targetCode);
    if (!deskObj) {
      alert(`⚠️ Computer Desk unique code "${targetCode}" is invalid!`);
      return;
    }

    // Update students list
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            assignedComputerDeskCode: targetCode,
            verifiedAt: new Date().toISOString(),
          };
        }
        return s;
      }),
    );

    // Update desks status
    setComputerDesks((prev) =>
      prev.map((d) => {
        // Free up any previous desk for this student
        if (d.currentStudentId === studentId) {
          return { ...d, status: "Available", currentStudentId: undefined };
        }
        if (d.uniqueCode === targetCode) {
          return { ...d, status: "Occupied", currentStudentId: studentId };
        }
        return d;
      }),
    );
  };

  const handleRegisterComputerDesk = (newDesk: ComputerDesk) => {
    clearDeletedId("computerDesks", newDesk.id);
    setComputerDesks((prev) => [newDesk, ...prev]);
  };

  const handleDeleteComputerDesk = (id: string) => {
    markIdAsDeleted("computerDesks", id);
    const target = computerDesks.find((d) => d.id === id);
    if (target && target.currentStudentId) {
      const sId = target.currentStudentId;
      setStudents((prev) =>
        prev.map((s) =>
          s.id === sId
            ? {
                ...s,
                assignedComputerDeskCode: undefined,
                verifiedAt: undefined,
              }
            : s,
        ),
      );
    }
    setComputerDesks((prev) => prev.filter((d) => d.id !== id));
    deleteDoc(doc(db, "computerDesks", id)).catch(() => {});
  };

  const handleUpdateComputerDesk = (updated: ComputerDesk) => {
    setComputerDesks((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d)),
    );
  };

  const handleAddTestSubmission = (newSub: TestSubmission) => {
    setTestSubmissions((prev) => {
      const filtered = prev.filter(
        (s) =>
          !(s.testId === newSub.testId && s.studentId === newSub.studentId),
      );
      return [newSub, ...filtered];
    });

    // Automatically grade if MCQ or True/False questions only
    const test = tests.find((t) => t.id === newSub.testId);
    if (test && test.questions && test.questions.length > 0) {
      const isAllMcqTrueFalse = test.questions.every(
        (q) => q.type === "MCQ" || q.type === "True/False",
      );
      if (isAllMcqTrueFalse) {
        let scoredMarks = 0;
        const eachWeight =
          Math.round(test.maxMarks / test.questions.length) || 1;
        test.questions.forEach((q) => {
          const studentAnswer = newSub.answers[q.id];
          if (
            studentAnswer &&
            q.correctAnswer &&
            studentAnswer.trim().toLowerCase() ===
              q.correctAnswer.trim().toLowerCase()
          ) {
            scoredMarks += eachWeight;
          }
        });
        if (scoredMarks > test.maxMarks) scoredMarks = test.maxMarks;

        setTests((prev) =>
          prev.map((t) => {
            if (t.id === newSub.testId) {
              return {
                ...t,
                scores: {
                  ...t.scores,
                  [newSub.studentId]: scoredMarks,
                },
              };
            }
            return t;
          }),
        );
      }
    }
  };

  const handleAddSubject = (newSub: string) => {
    const trimmed = newSub.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects((prev) => [...prev, trimmed]);
    }
  };

  const handleAddAnnouncement = (newAnn: Announcement) => {
    clearDeletedId("announcements", newAnn.id);
    setAnnouncements((prev) => [newAnn, ...prev]);
    playAnnouncementSound();
  };

  const handleUpdateAnnouncement = (
    id: string,
    updatedFields: Partial<Announcement>,
  ) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a)),
    );
  };

  const handleDeleteAnnouncement = (id: string) => {
    markIdAsDeleted("announcements", id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    deleteDoc(doc(db, "announcements", id)).catch(() => {});
  };

  const handleAddOnlineAnnouncement = (newAnn: OnlineAnnouncement) => {
    clearDeletedId("onlineAnnouncements", newAnn.id);
    setOnlineAnnouncements((prev) => [newAnn, ...prev]);
    playAnnouncementSound();
  };

  const handleUpdateOnlineAnnouncement = (
    id: string,
    updatedFields: Partial<OnlineAnnouncement>,
  ) => {
    setOnlineAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a)),
    );
  };

  const handleDeleteOnlineAnnouncement = (id: string) => {
    markIdAsDeleted("onlineAnnouncements", id);
    setOnlineAnnouncements((prev) => prev.filter((a) => a.id !== id));
    deleteDoc(doc(db, "onlineAnnouncements", id)).catch(() => {});
  };

  const handleAddLead = (newLead: ContactLead) => {
    clearDeletedId("contactLeads", newLead.id);
    setLeads((prev) => [newLead, ...prev]);
  };

  const handleUpdateLead = (
    id: string,
    updatedFields: Partial<ContactLead>,
  ) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updatedFields } : l)),
    );
  };

  const handleDeleteLead = (id: string) => {
    markIdAsDeleted("contactLeads", id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    deleteDoc(doc(db, "contactLeads", id)).catch(() => {});
  };

  const handleUpdateAttendance = (
    lessonId: string,
    studentId: string,
    attended: boolean,
  ) => {
    setLessons((prev) =>
      prev.map((l) => {
        if (l.id === lessonId) {
          return {
            ...l,
            attendance: {
              ...l.attendance,
              [studentId]: attended,
            },
          };
        }
        return l;
      }),
    );
  };

  const clearPersistenceAndReset = () => {
    if (
      confirm("Reset application database state to default system seed levels?")
    ) {
      localStorage.clear();
      setBatches(initialBatches);
      setTeachers(initialTeachers);
      setStudents(initialStudents);
      setLessons(initialLessons);
      setTests(initialTests);
      setAnnouncements(initialAnnouncements);
      setLeads(initialLeads);
      setAdmins([
        {
          id: "admin_1",
          name: "Administrator",
          email: "admin@coachinghub.edu",
          password: "12112006",
          status: "Active",
        },
      ]);
      alert("Database reset completed successfully!");
    }
  };

  const handleOverrideLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOverrideError("");
    const term = overrideEmail.trim();
    const pass = overridePassword.trim();

    setIsOverriding(true);
    setTimeout(() => {
      setIsOverriding(false);
      const foundAdmin = admins.find(
        (a) =>
          (term === "" || a.email.toLowerCase() === term.toLowerCase()) &&
          (a.password || "12112006") === pass,
      );

      if (foundAdmin) {
        if (foundAdmin.status === "Inactive") {
          setOverrideError("Deactivated Administrative account credentials.");
          return;
        }
        trigger15SecLoading(() => {
          setLoggedInUserId(foundAdmin.id);
          setLoggedInUserName(foundAdmin.name);
          setRole("admin");
          setIsLoggedIn(true);
          setOverrideEmail("");
          setOverridePassword("");
          setShowOverrideForm(false);
        });
      } else if (pass === "12112006") {
        trigger15SecLoading(() => {
          setLoggedInUserId("admin_1");
          setLoggedInUserName("Administrator");
          setRole("admin");
          setIsLoggedIn(true);
          setOverrideEmail("");
          setOverridePassword("");
          setShowOverrideForm(false);
        });
      } else {
        setOverrideError(
          "Incorrect credential validation token. Override blocked.",
        );
      }
    }, 750);
  };

  if (isSystemLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-6 text-center select-none relative overflow-hidden font-sans">
        <style>{`
          @keyframes pulse-soft {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.75; }
          }
          .animate-pulse-soft {
            animation: pulse-soft 2.5s ease-in-out infinite;
          }
        `}</style>

        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-soft" />

        <div className="max-w-md w-full space-y-6 relative z-10">
          <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shadow-2xl mx-auto">
            <GraduationCap className="w-9 h-9 text-indigo-400 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-white uppercase tracking-wider font-sans">
              Study Hub
            </h1>
            <p className="text-[10px] text-emerald-400 font-mono tracking-widest font-bold uppercase animate-pulse">
              [ Synchronizing stored LMS modules ]
            </p>
          </div>

          {/* Simple 3 Dots Loading Indicator */}
          <div className="flex items-center justify-center space-x-2 py-2">
            <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" />
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed font-sans max-w-xs mx-auto">
            Loaded active batch curricula and security permissions.
          </p>
        </div>
      </div>
    );
  }

  // --- DEVICE LOCKOUT PORTAL SCREEN (DISABLED / REMOVED REQUIREMENT) ---
  const isDeviceAuthorized = true; // Device access code requirement removed as requested

  if (!isDeviceAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans select-none text-white animate-fadeIn">
        <style>{`
          @keyframes glow-pulse {
            0%, 100% { filter: drop-shadow(0 0 15px rgba(99,102,241,0.20)); }
            50% { filter: drop-shadow(0 0 30px rgba(99,102,241,0.30)); }
          }
          .animate-glow-pulse {
            animation: glow-pulse 3s infinite ease-in-out;
          }
        `}</style>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
          <div className="w-[450px] h-[450px] bg-indigo-950/10 rounded-full blur-3xl absolute -translate-x-1/2 -translate-y-1/2 opacity-60" />
          <div className="w-[600px] h-[600px] bg-purple-950/10 rounded-full blur-3xl absolute -translate-x-1/2 -translate-y-1/2 opacity-30 delay-1000" />
        </div>

        <div className="max-w-md w-full text-center space-y-8 relative z-10 px-4">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center animate-glow-pulse">
            <div className="absolute inset-0 bg-indigo-500/15 rounded-full blur-md" />
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shadow-2xl">
              <Fingerprint className="w-9 h-9 text-indigo-400 animate-pulse" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="inline-block bg-indigo-500/10 border border-indigo-500/25 rounded-full px-4 py-1.5 shadow-inner">
              <span className="text-[10px] text-indigo-350 font-black uppercase tracking-widest font-mono flex items-center space-x-1.5 justify-center">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping shrink-0" />
                <span>🔐 Private LMS Security Restrict Option</span>
              </span>
            </div>

            <h1 className="text-2xl font-black text-white uppercase tracking-tight font-sans">
              Device Access Code Required
            </h1>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              This Learning Management System is configured to operate in a
              private sandbox. Only designated institutional hardware and
              pre-verified terminals can access educational boards.
            </p>
          </div>

          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 p-5 rounded-2xl text-left space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-[8px] font-mono text-slate-650 bg-slate-1050/80 border-b border-l border-slate-800/60 rounded-bl-xl font-bold uppercase tracking-wider">
              Terminal Identifier
            </div>

            <div className="space-y-1 mt-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">
                Your Device Key Token:
              </span>
              <div className="flex items-center space-x-2 bg-slate-950/85 border border-slate-850 px-3.5 py-2.5 rounded-xl font-mono text-xs font-black select-all text-indigo-300">
                <Terminal className="w-3.5 h-3.5 text-slate-505 shrink-0" />
                <span className="truncate w-full leading-none">
                  {currentDeviceKey}
                </span>
              </div>
              <p className="text-[9.5px] text-slate-500 leading-normal pt-1 italic">
                Provide this terminal code token key to a system Administrator
                or Registrar Officer to authorize this machine remotely.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl text-left space-y-3.5 shadow-xl">
            <h4 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 mb-1 flex items-center justify-between">
              <span>Instant Local Enrollment</span>
              <span className="text-indigo-400">PIN Activation</span>
            </h4>

            {regError && (
              <p className="text-[10px] font-mono text-center text-red-400 bg-red-950/30 p-2.5 rounded-xl border border-red-900/20 leading-relaxed">
                {regError}
              </p>
            )}

            {regSuccess && (
              <p className="text-[10px] font-mono text-center text-emerald-400 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-955/20 leading-relaxed">
                {regSuccess}
              </p>
            )}

            <form
              onSubmit={handleRegisterCurrentDevice}
              className="space-y-3.5"
            >
              <div className="space-y-1 text-xs">
                <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">
                  Hardware Terminal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Personal Laptop, Classroom Tablet 4"
                  value={regDeviceName}
                  onChange={(e) => setRegDeviceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">
                  Admin Enrollment Security PIN
                </label>
                <div className="relative">
                  <input
                    type={showRegAdminPIN ? "text" : "password"}
                    required
                    placeholder="Enter SuperAdmin PIN code"
                    value={regAdminPIN}
                    onChange={(e) => setRegAdminPIN(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 pl-2.5 pr-10 py-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500 rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegAdminPIN(!showRegAdminPIN)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-450 hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
                  >
                    {showRegAdminPIN ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 pt-1 leading-snug">
                  Authorize this specific terminal instantly by typing the
                  administrative registry PIN passcode.
                </p>
              </div>

              <button
                type="submit"
                disabled={isRegisteringDevice}
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegisteringDevice ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Registering Terminal...</span>
                  </>
                ) : (
                  <span>Authorize & Register Terminal</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (isEmergencyShutdown && (!isLoggedIn || role !== "admin")) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans select-none text-white">
        <style>{`
          @keyframes radar-pulse {
            0% { transform: scale(0.9); opacity: 0.5; }
            50% { transform: scale(1.15); opacity: 0.1; }
            100% { transform: scale(1.4); opacity: 0; }
          }
          .animate-radar-pulse {
            animation: radar-pulse 3s cubic-bezier(0.25, 0, 0, 1) infinite;
          }
        `}</style>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
          <div className="w-96 h-96 bg-red-950/20 rounded-full animate-radar-pulse absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="w-128 h-128 bg-red-950/10 rounded-full animate-radar-pulse absolute -translate-x-1/2 -translate-y-1/2 delay-1000" />
        </div>

        <div className="max-w-xl w-full text-center space-y-8 relative z-10 px-4">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-red-500/10 rounded-full animate-pulse blur" />
            <div className="w-16 h-16 bg-red-950 border border-red-500/40 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="inline-block bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1">
              <span className="text-[10px] text-red-400 font-extrabold uppercase tracking-widest font-mono">
                🛑 Study Hub Outage Alert System
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight font-sans">
              Emergency Suspension Portal Block
            </h1>

            <p className="text-xs text-slate-450 leading-relaxed max-w-md mx-auto">
              Our dynamic educational networks, student forums, teacher portals,
              and registration boards are temporarily offline under instructions
              from Study Hub Administrative Council.
            </p>
          </div>

          <div className="bg-red-500/5 backdrop-blur border border-red-500/30 p-6 rounded-3xl text-left space-y-3 max-w-md mx-auto shadow-2xl">
            <div className="flex items-center space-x-2 border-b border-red-500/25 pb-2.5">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              <span className="text-[10px] font-mono font-black text-red-400 uppercase tracking-widest">
                Advisory Message to Members:
              </span>
            </div>
            <p className="text-xs font-bold font-sans text-slate-100 leading-relaxed italic">
              "{shutdownReason}"
            </p>
            <div className="border-t border-slate-900 pt-2 flex justify-between items-center text-[9px] text-slate-500 font-mono">
              <span>Status: Restricted Area</span>
              <span>Reason logged live</span>
            </div>
          </div>

          <div className="pt-4 max-w-sm mx-auto space-y-4">
            {!showOverrideForm ? (
              <button
                onClick={() => setShowOverrideForm(true)}
                className="text-xs font-mono font-bold text-slate-500 hover:text-red-400 underline transition-all cursor-pointer"
              >
                Access Registrar Administrative Override Sign-In Terminal
              </button>
            ) : (
              <form
                onSubmit={handleOverrideLoginSubmit}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-left space-y-3.5 shadow-xl text-slate-105"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-1">
                  <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider">
                    SuperAdmin Secure Override
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowOverrideForm(false)}
                    className="text-xs text-slate-500 hover:text-white"
                  >
                    Hide
                  </button>
                </div>

                {overrideError && (
                  <p className="text-[10px] font-mono text-center text-red-400 bg-red-950/40 p-2 rounded-lg border border-red-900/30">
                    {overrideError}
                  </p>
                )}

                <div className="space-y-1 text-xs">
                  <label className="block text-[9px] font-black uppercase text-slate-400">
                    Admin Email ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="admin@coachinghub.edu"
                    value={overrideEmail}
                    onChange={(e) => setOverrideEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 text-xs font-semibold focus:outline-none focus:border-red-500 rounded-xl"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="block text-[9px] font-black uppercase text-slate-400">
                    Passcode PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showOverridePassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={overridePassword}
                      onChange={(e) => setOverridePassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 pl-2.5 pr-10 py-2.5 text-xs font-mono focus:outline-none focus:border-red-500 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOverridePassword(!showOverridePassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-450 hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
                    >
                      {showOverridePassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isOverriding}
                  className="w-full py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isOverriding ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Verifying administrative key...</span>
                    </>
                  ) : (
                    <span>Verify administrative key</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (loginPortalView === "website") {
      setLoginPortalView("choose");
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans transition-all duration-200">
        <style>{`
          :root {
            --brand-50: ${selectedColors["50"]};
            --brand-100: ${selectedColors["100"]};
            --brand-150: ${selectedColors["150"]};
            --brand-200: ${selectedColors["200"]};
            --brand-300: ${selectedColors["300"]};
            --brand-400: ${selectedColors["400"]};
            --brand-500: ${selectedColors["500"]};
            --brand-600: ${selectedColors["600"]};
            --brand-650: ${selectedColors["650"]};
            --brand-700: ${selectedColors["700"]};
            --brand-800: ${selectedColors["800"]};
            --brand-900: ${selectedColors["900"]};
            --brand-950: ${selectedColors["950"]};
          }
        `}</style>
        
        {/* --- LEFT SIDEBAR (GUEST MODE) --- */}
        <div className="w-full md:w-80 bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/40 via-transparent to-transparent pointer-events-none" />

          {/* Header */}
          <div className="p-6 border-b border-slate-800 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white ring-4 ring-indigo-500/10">
                <GraduationCap className="w-5.5 h-5.5" />
              </div>
              <div>
                <h1 className="text-sm font-black uppercase tracking-wider leading-none text-white">
                  Study Hub
                </h1>
              </div>
            </div>
          </div>

          {/* Sidebar Menu items */}
          <div className="flex-1 p-4 space-y-1 relative z-10 overflow-y-auto">
            <div className="px-3 mb-2.5">
              <span className="text-[8.5px] font-black tracking-widest text-slate-555 uppercase">
                Quick Access
              </span>
            </div>

            {/* Tab 1: Unified Secure Login */}
            <button
              id="guest-tab-login"
              onClick={() => {
                setGuestActiveTab("login");
                setLoginError("");
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-[11px] font-black transition-all text-left uppercase tracking-wider cursor-pointer ${
                guestActiveTab === "login"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Key id="icon-login" className="w-4 h-4 shrink-0" />
              <span>Login</span>
            </button>

            {/* Tab 2: Marksheet Retrieval View */}
            <button
              id="guest-tab-marksheet"
              onClick={() => {
                setGuestActiveTab("marksheet");
                setGuestMarksheetError("");
                setGuestMarksheetResult(null);
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-[11px] font-black transition-all text-left uppercase tracking-wider cursor-pointer ${
                guestActiveTab === "marksheet"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Award id="icon-marksheet" className="w-4 h-4 shrink-0" />
              <span>Check Result</span>
            </button>

            {/* Tab 3: Search Center in your location */}
            <button
              id="guest-tab-nearby"
              onClick={() => {
                setGuestActiveTab("nearby");
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-[11px] font-black transition-all text-left uppercase tracking-wider cursor-pointer ${
                guestActiveTab === "nearby"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <MapPin id="icon-nearby" className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Nearby Centers</span>
            </button>


            {/* Tab 4: Online Announcements */}
            <button
              id="guest-tab-announcements"
              onClick={() => {
                setGuestActiveTab("announcements");
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-[11px] font-black transition-all text-left uppercase tracking-wider cursor-pointer ${
                guestActiveTab === "announcements"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Megaphone id="icon-meg" className="w-4 h-4 shrink-0" />
              <span>Online Announcements</span>
            </button>
          </div>

          {/* Footer Area */}
          <div className="p-4 border-t border-slate-800 text-xs text-center text-slate-500 font-mono relative z-10 bg-slate-905">
            <p className="tracking-wider uppercase text-[8px] font-black pointer-events-none">
              Vishveshwar Foundation Tech
            </p>
          </div>
        </div>

        {/* --- MAIN DASHBOARD CONTENT AREA --- */}
        <div id="guest-main-workspace" className="flex-1 bg-slate-50 relative overflow-y-auto min-h-screen">
          <div className="absolute top-0 right-0 w-128 h-128 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-128 h-128 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Inside Container */}
          <div className="p-6 md:p-10 max-w-6xl mx-auto relative z-10">

            {/* -------------------- 1. ALL IN ONE LOGIN PORTAL TAB -------------------- */}
            {guestActiveTab === "login" && (
              <div className="max-w-md mx-auto space-y-6 pt-4">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600" />

                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-2">
                      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                        Login
                      </h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 font-medium">
                      Enter your unique credentials to access your secure portal.
                    </p>
                  </div>

                  {loginError && (
                    <div className="bg-red-50 text-red-700 p-3.5 rounded-2xl text-xs font-semibold border border-red-200 mb-5 leading-normal flex items-start space-x-2">
                      <span className="font-extrabold shrink-0 mt-0.5">⚠️</span>
                      <span>{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAuthenticate} className="space-y-4">
                    {/* Username Input */}
                    <div className="space-y-1 text-left">
                      <label className="block text-[10px] uppercase font-black tracking-wide text-slate-500">
                        Unique Username:
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <Users className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="Enter Username"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-950 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 placeholder-slate-400 transition-all font-sans"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1 text-left">
                      <label className="block text-[10px] uppercase font-black tracking-wide text-slate-500">
                        Secure Password:
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          type={showQuickAccessPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-950 rounded-xl pl-10 pr-10 py-3 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 placeholder-slate-400 transition-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowQuickAccessPassword(!showQuickAccessPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                        >
                          {showQuickAccessPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>



                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isAuthenticating}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3.5 px-4 rounded-xl uppercase tracking-wider transition-all duration-150 shadow-md shadow-indigo-600/10 flex items-center justify-center space-x-2 mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAuthenticating ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Authenticating credentials...</span>
                        </>
                      ) : (
                        <>
                          <Key className="w-4 h-4" />
                          <span>Login</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Or divider */}
                  <div className="relative my-4 flex items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                      Or continue with
                    </span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  {/* Google Login CTA */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isAuthenticating}
                    className="w-full bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2.5 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
                    Fast 1-click access for students, teachers and staff
                  </p>
                </div>
              </div>
            )}

            {/* -------------------- 2. MARKSHEET RETRIEVAL TAB -------------------- */}
            {guestActiveTab === "marksheet" && (
              <div className="max-w-2xl mx-auto space-y-6 pt-2">
                <div className="bg-white rounded-3xl border border-slate-200/85 p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
                  
                  <div className="mb-4">
                    <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                      Scholar Marksheet Search Engine
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed font-semibold">
                      Retrieve certified report cards instantly by typing a registered scholar roll number.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                        <Users className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        placeholder="Type scholar roll number"
                        value={guestMarksheetRollNo}
                        onChange={(e) => {
                          setGuestMarksheetRollNo(e.target.value);
                          setGuestMarksheetError("");
                        }}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-950 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white uppercase font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const target = guestMarksheetRollNo.trim().toUpperCase();
                        if (!target) {
                          setGuestMarksheetError("Please write a scholar roll number first.");
                          setGuestMarksheetResult(null);
                          return;
                        }
                        const found = students.find(s => (s.rollNo || "").trim().toUpperCase() === target);
                        if (found) {
                          setGuestMarksheetResult(found);
                          setGuestMarksheetError("");
                        } else {
                          setGuestMarksheetError(`⚠️ Scholar roll number "${guestMarksheetRollNo}" was not found in our database directory. Please check the roll number.`);
                          setGuestMarksheetResult(null);
                        }
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-5 rounded-xl uppercase tracking-wider transition-all cursor-pointer shrink-0"
                    >
                      Search Marksheet
                    </button>
                  </div>

                  {guestMarksheetError && (
                    <div className="bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-200 mt-4 text-[11px] leading-relaxed">
                      {guestMarksheetError}
                    </div>
                  )}
                </div>

                {/* Marksheet Report Display */}
                {guestMarksheetResult && (
                  <div className="bg-white rounded-3xl border border-slate-300 p-8 shadow-2xl relative overflow-hidden text-slate-800">
                    <div className="absolute inset-3 border border-slate-200 pointer-events-none rounded-2xl" />

                    {/* Official Banner Header */}
                    <div className="text-center pb-6 border-b-2 border-slate-800 space-y-2 relative">
                      <h3 className="text-lg font-black tracking-wider uppercase text-slate-955 font-sans">
                        Study Hub Academy
                      </h3>
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-550">
                        [ Consolidated Official Report of Academic Performance ]
                      </p>
                      <div className="text-slate-300 text-xs">◆ ◆ ◆</div>
                    </div>

                    {/* Personal Information Meta Details */}
                    <div className="grid grid-cols-2 gap-4 py-5 font-sans border-b border-slate-200 text-xs text-slate-700">
                      <div className="space-y-1">
                        <p><span className="text-slate-400 font-extrabold uppercase text-[9px] block">Scholar Pupil Name:</span> <strong className="text-slate-950 text-sm">{guestMarksheetResult.name}</strong></p>
                        <p><span className="text-slate-400 font-extrabold uppercase text-[9px] block">Unique ID Username:</span> <span className="font-mono bg-slate-100 px-1 py-0.5 rounded font-black text-indigo-700">{guestMarksheetResult.username}</span></p>
                        <p><span className="text-slate-400 font-extrabold uppercase text-[9px] block">Affiliation:</span> <strong className="text-slate-800">{guestMarksheetResult.schoolName || "Central High"}</strong></p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p><span className="text-slate-400 font-extrabold uppercase text-[9px] block">Academic Term:</span> <span className="font-semibold">Spring Term 2026</span></p>
                        <p><span className="text-slate-400 font-extrabold uppercase text-[9px] block">Status:</span> <span className={`inline-block px-2 py-0.5 text-[10px] rounded-full font-black uppercase ${guestMarksheetResult.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{guestMarksheetResult.status}</span></p>
                        <p><span className="text-slate-400 font-extrabold uppercase text-[9px] block">DOB / Key Code:</span> <span className="font-mono text-slate-500 font-bold">{guestMarksheetResult.dob || "N/A"}</span></p>
                      </div>
                    </div>

                    {/* Performance Grades Table of Tests */}
                    <div className="py-5 space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-505">
                        Evaluated Subjects & Exam Scores
                      </h4>

                      {(() => {
                        const gradedExamScores = tests.filter(
                          (t) => t.scores && t.scores[guestMarksheetResult.id] !== undefined
                        );

                        if (gradedExamScores.length === 0) {
                          return (
                            <div className="bg-slate-50 p-6 rounded-2xl border text-center text-slate-450 italic text-xs">
                              No certified exam scores recorded for this scholar yet. Participate in Batch exams to populate grades.
                            </div>
                          );
                        }

                        let aggregateMaxMarks = 0;
                        let aggregateObtainedMarks = 0;

                        return (
                          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-slate-50 text-[9.5px] font-black uppercase tracking-wider text-slate-505 border-b">
                                <tr>
                                  <th className="p-3.5 pl-4">Course Module / Exam Subject</th>
                                  <th className="p-3.5 text-center">Max Score</th>
                                  <th className="p-3.5 text-center">Mark Secured</th>
                                  <th className="p-3.5 text-center">Percentage</th>
                                  <th className="p-3.5 text-right pr-4">Grade Badge</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white text-slate-705">
                                {gradedExamScores.map((t) => {
                                  const secured = t.scores[guestMarksheetResult.id];
                                  const max = t.maxMarks || 100;
                                  aggregateMaxMarks += max;
                                  aggregateObtainedMarks += secured;
                                  const percentage = Math.round((secured / max) * 100);

                                  let grade = "F";
                                  let gradeStyle = "text-red-650 bg-red-50";
                                  if (percentage >= 90) { grade = "A+"; gradeStyle = "text-emerald-800 bg-emerald-50"; }
                                  else if (percentage >= 80) { grade = "A"; gradeStyle = "text-teal-800 bg-teal-50"; }
                                  else if (percentage >= 70) { grade = "B"; gradeStyle = "text-indigo-805 bg-indigo-50"; }
                                  else if (percentage >= 50) { grade = "C"; gradeStyle = "text-amber-808 bg-amber-50"; }

                                  return (
                                    <tr key={t.id} className="hover:bg-slate-50/40">
                                      <td className="p-3.5 pl-4 font-semibold text-slate-900">{t.title} <span className="text-[10px] text-slate-400 block font-normal">{t.subject || "General Physics"} (LMS ID: {t.batchId})</span></td>
                                      <td className="p-3.5 text-center font-mono font-bold text-slate-550">{max}</td>
                                      <td className="p-3.5 text-center font-mono font-black text-slate-900">{secured}</td>
                                      <td className="p-3.5 text-center font-mono font-bold text-slate-600">{percentage}%</td>
                                      <td className="p-3.5 text-right pr-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase inline-block border border-current bg-opacity-10 ${gradeStyle}`}>
                                          {grade}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}

                                {/* Total Summary Line */}
                                <tr className="bg-slate-50/70 font-bold text-slate-900 border-t-2">
                                  <td className="p-3.5 pl-4 uppercase font-black text-[10px] tracking-wider">Aggregate Scholar Ledger Summary</td>
                                  <td className="p-3.5 text-center font-mono">{aggregateMaxMarks}</td>
                                  <td className="p-3.5 text-center font-mono text-indigo-700">{aggregateObtainedMarks}</td>
                                  <td className="p-3.5 text-center font-mono text-indigo-700 font-black">
                                    {Math.round((aggregateObtainedMarks / aggregateMaxMarks) * 100)}%
                                  </td>
                                  <td className="p-3.5 text-right pr-4 text-emerald-700 uppercase font-black">
                                    {Math.round((aggregateObtainedMarks / aggregateMaxMarks) * 100) >= 40 ? "PASSED" : "PROBATION"}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Official Footer Verification Seals */}
                    <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 space-y-4 sm:space-y-0 font-mono">
                      <div className="flex items-center space-x-2 text-indigo-600 font-extrabold bg-indigo-50/40 border border-indigo-100 rounded-xl px-2.5 py-1">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Certified Academy Database Record Verified</span>
                      </div>
                      <div className="text-center sm:text-right">
                        <p className="font-bold text-slate-600 uppercase tracking-widest text-[8px]">Study Hub Board Council</p>
                        <p className="text-[7.5px] text-slate-400 italic">Centralized Digital Registry Signature Seal Enabled</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* -------------------- 3. SEARCH CENTER IN YOUR LOCATION TAB -------------------- */}
            {guestActiveTab === "nearby" && (
              <div className="space-y-6 pt-2">
                {/* Header card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <MapPin className="w-5 h-5" />
                      </span>
                      <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                        Search Center in Your Location
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 font-medium max-w-xl">
                      Find the nearest Study HUB campuses, exam centers, and affiliated academies relative to your live GPS coordinates.
                    </p>
                  </div>

                  {locationStatus === "granted" && userCoords && (
                    <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-2xl text-xs font-mono font-bold">
                      <LocateFixed className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
                      <div>
                        <span className="block text-[8px] uppercase tracking-widest text-emerald-600 font-black">Detected GPS Location</span>
                        <span>{userCoords.lat.toFixed(4)}° N, {userCoords.lng.toFixed(4)}° E</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="ml-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-xl transition-colors cursor-pointer font-sans uppercase font-black text-[9px]"
                      >
                        Refresh
                      </button>
                    </div>
                  )}
                </div>

                {/* Location Request / Prompt Card when location is not granted yet */}
                {locationStatus !== "granted" && (
                  <div className="bg-white rounded-3xl border border-indigo-100 p-8 shadow-sm text-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500" />
                    
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl border border-emerald-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Navigation className={`w-8 h-8 ${locationStatus === "locating" ? "animate-spin" : ""}`} />
                    </div>

                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">
                      Location Access Required
                    </h3>
                    
                    <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed mb-6 font-medium">
                      Location permission is required by your browser to detect your current position and compute precise road distances to nearest Study HUB centers.
                    </p>

                    {locationErrorMsg && (
                      <div className="max-w-md mx-auto mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold text-center">
                        ⚠️ {locationErrorMsg}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={locationStatus === "locating"}
                      className="inline-flex items-center space-x-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer uppercase tracking-wider disabled:opacity-50"
                    >
                      <LocateFixed className="w-4 h-4" />
                      <span>{locationStatus === "locating" ? "Acquiring GPS Location..." : "Grant Location Access & Search"}</span>
                    </button>
                  </div>
                )}

                {/* Main Results View once location is detected */}
                {locationStatus === "granted" && userCoords && (
                  <div className="space-y-6">
                    {/* Controls Bar: Search Filter & Radius Selector */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
                      <div className="relative w-full sm:w-72">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <Search className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          placeholder="Search center name, city or code..."
                          value={nearbySearchQuery}
                          onChange={(e) => setNearbySearchQuery(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                        />
                      </div>

                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Radius:</span>
                        <select
                          value={maxRadiusKm}
                          onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                          className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                        >
                          <option value={50}>Within 50 km</option>
                          <option value={100}>Within 100 km</option>
                          <option value={250}>Within 250 km</option>
                          <option value={500}>Within 500 km</option>
                          <option value={10000}>All Distance Centers</option>
                        </select>
                      </div>
                    </div>

                    {/* Nearby Centers List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(() => {
                        const centersWithDistance = (schools || [])
                          .map((s) => {
                            const coords = getSchoolCoordinates(s);
                            const dist = calculateDistanceKm(userCoords.lat, userCoords.lng, coords.lat, coords.lng);
                            return { school: s, distance: dist, coords };
                          })
                          .filter((item) => {
                            const matchesQuery =
                              item.school.name.toLowerCase().includes(nearbySearchQuery.toLowerCase()) ||
                              item.school.code.toLowerCase().includes(nearbySearchQuery.toLowerCase()) ||
                              item.school.address.toLowerCase().includes(nearbySearchQuery.toLowerCase());
                            const matchesRadius = item.distance <= maxRadiusKm;
                            return matchesQuery && matchesRadius;
                          })
                          .sort((a, b) => a.distance - b.distance);

                        if (centersWithDistance.length === 0) {
                          return (
                            <div className="col-span-2 bg-white text-center py-12 px-4 rounded-3xl border border-slate-200 text-slate-400 text-xs font-semibold italic">
                              No Study HUB centers found within {maxRadiusKm < 1000 ? `${maxRadiusKm} km` : "selected radius"}. Try expanding your search radius or changing search keywords.
                            </div>
                          );
                        }

                        return centersWithDistance.map(({ school: s, distance }) => (
                          <div
                            key={s.id}
                            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between group"
                          >
                            <div className="absolute top-0 right-0 p-3 text-[9px] font-mono text-emerald-700 font-extrabold uppercase tracking-widest bg-emerald-50 rounded-bl-xl border-l border-b border-emerald-100 flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-emerald-600" />
                              <span>{distance} km away</span>
                            </div>

                            <div>
                              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                CENTER CODE: {s.code}
                              </span>

                              <h3 className="font-extrabold text-slate-900 uppercase tracking-tight text-sm pr-24 font-sans leading-snug">
                                {s.name}
                              </h3>

                              <div className="space-y-1.5 mt-4 text-xs text-slate-600">
                                <p className="flex items-start space-x-1.5">
                                  <span className="text-slate-400 font-extrabold uppercase text-[8.5px] block w-20 shrink-0 mt-0.5">Address:</span>
                                  <span className="font-medium text-slate-700 leading-relaxed">{s.address}</span>
                                </p>
                                <p className="flex items-center space-x-1.5">
                                  <span className="text-slate-400 font-extrabold uppercase text-[8.5px] block w-20 shrink-0">Principal:</span>
                                  <strong className="text-slate-800">{s.principalName}</strong>
                                </p>
                                <p className="flex items-center space-x-1.5">
                                  <span className="text-slate-400 font-extrabold uppercase text-[8.5px] block w-20 shrink-0">Status:</span>
                                  <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase ${s.status === "Active" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}>
                                    {s.status} Campus
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[9.5px] text-slate-400 font-mono font-semibold">
                                Registered: {s.registeredAt ? s.registeredAt.substring(0, 10) : "Verified"}
                              </span>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + " " + s.address)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1.5 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                              >
                                <span>Get Directions</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* -------------------- 4. EXAM ANNOUNCEMENTS Timeline TAB -------------------- */}
            {guestActiveTab === "announcements" && (
              <div className="max-w-2xl mx-auto space-y-6 pt-2">
                <div className="bg-white rounded-3xl border border-slate-200/85 p-6 shadow-md">
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    Online Portal Noticeboard
                  </h2>
                  <p className="text-xs text-slate-450 mt-0.5 leading-relaxed font-semibold">
                    Real-time official announcements and news published exclusively by the administrator.
                  </p>
                </div>

                <div className="space-y-4">
                  {(onlineAnnouncements || []).filter(ann => ann.isPublished !== false).length === 0 ? (
                    <div className="bg-white text-center text-slate-450 py-12 rounded-3xl border text-sm italic">
                      There are no online portal announcements published today.
                    </div>
                  ) : (
                    (onlineAnnouncements || []).filter(ann => ann.isPublished !== false).map(ann => (
                      <div key={ann.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
                        
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full uppercase border border-indigo-100">
                              Official Announcement
                            </span>
                            <span className="text-[9.5px] text-slate-400 font-mono ml-2">🕒 {ann.date}</span>
                          </div>
                        </div>

                        <h3 className="font-black text-slate-950 uppercase tracking-tight text-sm mt-3 leading-snug font-sans">
                          {ann.title}
                        </h3>

                        <p className="text-xs text-slate-650 leading-relaxed pt-1.5 whitespace-pre-line font-medium">
                          {ann.content}
                        </p>

                        <div className="border-t border-slate-100 pt-3.5 mt-4 flex items-center space-x-1 text-[9px] text-slate-400 font-mono font-medium">
                          <span>Verified by:</span>
                          <strong className="text-slate-600 font-semibold">System Administrator</strong>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback temporary redirect block
  if (!isLoggedIn) {
    if (loginPortalView === "website") {
      return null;
    }

    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
        <style>{`
          :root {
            --brand-50: ${selectedColors["50"]};
            --brand-100: ${selectedColors["100"]};
            --brand-150: ${selectedColors["150"]};
            --brand-200: ${selectedColors["200"]};
            --brand-300: ${selectedColors["300"]};
            --brand-400: ${selectedColors["400"]};
            --brand-500: ${selectedColors["500"]};
            --brand-600: ${selectedColors["600"]};
            --brand-650: ${selectedColors["650"]};
            --brand-700: ${selectedColors["700"]};
            --brand-800: ${selectedColors["800"]};
            --brand-900: ${selectedColors["900"]};
            --brand-950: ${selectedColors["950"]};
          }
        `}</style>
        {/* Abstract decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 -z-10" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

        {/* Global Login Header */}
        <div className="text-center mb-8 max-w-lg">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 ring-4 ring-indigo-500/20">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            Study Hub
          </h1>
          <p className="text-xs text-slate-450 mt-1 uppercase tracking-widest font-mono">
            Academy Administration Engine
          </p>
        </div>

        {/* ==================== 1. MAIN DIRECTORY CHOOSE SCREEN ==================== */}
        {loginPortalView === "choose" && (
          <div className="w-full max-w-6xl space-y-8 animate-fadeIn">
            {/* Top Info Banner */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start space-x-3 text-left max-w-2xl mx-auto">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldAlert className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest leading-none">
                  Unified Authentication Gateway
                </p>
                <p className="text-[10px] text-slate-400 leading-normal mt-1">
                  Please select your primary access portal from the dedicated
                  channels below. All credentials, diagnostic activity logs, and
                  exams are certified under secure session proctor rules.
                </p>
              </div>
            </div>

            {/* Quick 1-Click Google Sign In */}
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isAuthenticating}
                className="w-full py-3.5 px-4 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 text-white font-bold text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-3 cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Instant Sign In with Google</span>
              </button>
            </div>

            {/* Split Page Portal Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto gap-6">
              {/* STUDENT CARD */}
              <div className="bg-slate-800/65 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-300 transform hover:-translate-y-1">
                <div className="space-y-4 text-left">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">
                      Student Portal
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium font-mono uppercase tracking-wider mt-0.5">
                      Academic Studies
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Explore Study HUB courses, access live classes, read class notes,
                    purchase books & stationary from inbuilt store, and ask doubts to mentors.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700/50">
                  <button
                    onClick={() => handleNavigatePortal("student", "student")}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-1"
                  >
                    <span>Enter Student Login</span>
                    <span className="font-mono text-sm">→</span>
                  </button>
                </div>
              </div>

              {/* FACULTY CARD */}
              <div className="bg-slate-800/65 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-300 transform hover:-translate-y-1">
                <div className="space-y-4 text-left">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">
                      Teacher Portal
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium font-mono uppercase tracking-wider mt-0.5">
                      Faculty Instructor
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Access course sections, conduct live classes, upload class notes,
                    interact with student doubts, and publish course announcements.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700/50">
                  <button
                    onClick={() => handleNavigatePortal("teacher", "teacher")}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-1"
                  >
                    <span>Enter Teacher Login</span>
                    <span className="font-mono text-sm">→</span>
                  </button>
                </div>
              </div>

              {/* ADMIN CARD */}
              <div className="bg-slate-800/65 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-violet-500/50 hover:bg-slate-800/80 transition-all duration-300 transform hover:-translate-y-1">
                <div className="space-y-4 text-left">
                  <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">
                      Admin Portal
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium font-mono uppercase tracking-wider mt-0.5">
                      System Headquarters
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Create, edit, publish live and block courses, add new users (teachers/students)
                    with custom usernames, and manage Study HUB Center store catalog.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700/50">
                  <button
                    onClick={() => handleNavigatePortal("admin", "admin")}
                    className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-1"
                  >
                    <span>Enter Admin Login</span>
                    <span className="font-mono text-sm">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. DEDICATED INDIVIDUAL PORTAL PAGES ==================== */}
        {loginPortalView !== "choose" && (
          <div className="w-full max-w-md bg-slate-800/85 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative animate-fadeIn">
            {/* Back to selector hub option */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => handleNavigatePortal("choose")}
                className="inline-flex items-center space-x-1.5 text-[10px] uppercase tracking-wider font-extrabold text-slate-450 hover:text-indigo-400 cursor-pointer transition-all"
              >
                <span>← Back to Portal Directory</span>
              </button>
            </div>

            {/* Custom Header dependent on Role selected */}
            <div className="pb-4 border-b border-slate-700/30 mb-5">
              {loginPortalView === "student" && (
                <div className="text-left space-y-1">
                  <h2 className="text-base font-black text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Student Room Access</span>
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Provide administrative e-mail contact or assigned numeric
                    Roll Code to enter your study classes.
                  </p>
                </div>
              )}
              {loginPortalView === "teacher" && (
                <div className="text-left space-y-1">
                  <h2 className="text-base font-black text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-450 animate-pulse" />
                    <span>Faculty Academic desk</span>
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Input registered Study Hub teacher email values & private
                    password to sync files.
                  </p>
                </div>
              )}
              {loginPortalView === "admin" && (
                <div className="text-left space-y-1">
                  <h2 className="text-base font-black text-violet-400 uppercase tracking-wider flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                    <span>Registrar Headquarters</span>
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    System security active. Submit administrative authentication
                    pin to modify rosters.
                  </p>
                </div>
              )}
              {loginPortalView === "feemanager" && (
                <div className="text-left space-y-1">
                  <h2 className="text-base font-black text-emerald-405 uppercase tracking-wider flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Treasurer Command Center</span>
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Please submit registered treasurer staff email and secure
                    access code keys to open ledgers.
                  </p>
                </div>
              )}
              {loginPortalView === "principal" && (
                <div className="text-left space-y-1">
                  <h2 className="text-base font-black text-red-405 uppercase tracking-wider flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <span>Principal Executive Desk</span>
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Submit verified School Principal email and private password to access broad institutional analytics and controls.
                  </p>
                </div>
              )}
            </div>

            {/* Dynamic Credentials Form */}
            <form onSubmit={handleAuthenticate} className="space-y-4">
              {loginError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs py-2.5 px-4 rounded-xl font-medium flex items-center space-x-2 text-left">
                  <span className="shrink-0 bg-rose-500 w-1.5 h-1.5 rounded-full inline-block animate-pulse" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginPortalView !== "admin" && (
                <div className="text-left">
                  <label className="block text-[10px] font-black hover:text-slate-200 text-slate-400 uppercase tracking-widest mb-1.5">
                    {loginPortalView === "teacher"
                      ? "Instructor Official Email"
                      : loginPortalView === "feemanager"
                        ? "Registered Staff Email"
                        : loginPortalView === "principal"
                          ? "Principal Official Email"
                          : "Student Email / PJ-Roll ID"}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-505">
                      <Users className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder=""
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-505/10 transition-all font-semibold font-sans"
                    />
                  </div>
                </div>
              )}

              <div className="text-left">
                <label className="block text-[10px] font-black hover:text-slate-200 text-slate-400 uppercase tracking-widest mb-1.5">
                  {loginPortalView === "admin"
                    ? "Administrative Master Pin"
                    : loginPortalView === "principal"
                      ? "Principal Password Passkey"
                      : "Password key"}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-505">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showMainLoginPassword ? "text" : "password"}
                    required
                    placeholder=""
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-505/10 transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMainLoginPassword(!showMainLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
                  >
                    {showMainLoginPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isAuthenticating}
                className={`w-full text-white font-black text-xs py-3.5 px-4 rounded-xl uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center space-x-2 mt-6 cursor-pointer transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                  loginPortalView === "student"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10"
                    : loginPortalView === "teacher"
                      ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10"
                      : "bg-violet-600 hover:bg-violet-700 shadow-violet-600/10"
                }`}
              >
                {isAuthenticating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Verifying session token...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Verify & Enter Workspace</span>
                  </>
                )}
              </button>
            </form>

            <div className="relative my-4 flex items-center">
              <div className="flex-grow border-t border-slate-700/60"></div>
              <span className="flex-shrink mx-3 text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                Or Continue With
              </span>
              <div className="flex-grow border-t border-slate-700/60"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className="w-full bg-slate-900/90 hover:bg-slate-900 border border-slate-700 hover:border-slate-500 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2.5 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In with Google</span>
            </button>

            <div className="mt-8 pt-4 border-t border-slate-700/20 text-center">
              <p className="text-[10px] text-slate-505 font-medium leading-relaxed uppercase tracking-wider">
                Study Hub Session Engine Encrypted Setup
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const renderRoleSidebarMenu = () => {
    if (role === "admin") {
      const adminTabs = [
        { id: "courses", label: "Course Management", icon: BookOpen, color: "text-indigo-400", badge: "LIVE" },
        { id: "exam-portal", label: "Exam Portal (Live)", icon: Award, color: "text-amber-400", badge: "EXAMS" },
        { id: "store", label: "Store", icon: ShoppingBag, color: "text-rose-400", badge: "STORE" },
        { id: "store-helpdesk", label: "Store Help Desk", icon: Headphones, color: "text-sky-400", badge: "SUPPORT" },
        { id: "inventory", label: "Inventory Management", icon: Boxes, color: "text-amber-400", badge: "STOCK" },
        { id: "orders", label: "Order & Home Delivery Control", icon: Truck, color: "text-emerald-400", badge: "DELIVERY" },
        { id: "centers", label: "Physical Study Centers", icon: MapPin, color: "text-emerald-400", badge: "CENTERS" },
        { id: "create-user", label: "Create User (Admin Only)", icon: UserPlus, color: "text-emerald-400", badge: "CREATE" },
      ];

      return (
        <div className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-14rem)] no-scrollbar">
          <p className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
            Admin Control Center
          </p>
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = adminActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setAdminActiveTab(tab.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm sm:text-base font-bold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : tab.color}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    if (role === "teacher") {
      const teacherTabs = [
        { id: "courses", label: "Course Management", icon: BookOpen, color: "text-indigo-400", badge: "LIVE" },
        { id: "exam-portal", label: "Exam Portal", icon: Award, color: "text-amber-400", badge: "EXAMS" },
        { id: "store", label: "Store", icon: ShoppingBag, color: "text-rose-400" },
        { id: "questionbank", label: "Question Bank & Tests", icon: ClipboardList, color: "text-rose-400" },
      ];
      return (
        <div className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-14rem)] no-scrollbar">
          <p className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
            Teacher Console
          </p>
          {teacherTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = teacherActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setTeacherActiveTab(tab.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : tab.color}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    if (role === "student") {
      const studentTabs = [
        { id: "courses", label: "My Course", icon: BookOpen, color: "text-indigo-400", badge: "LIVE" },
        { id: "exam-portal", label: "Exam Portal", icon: Award, color: "text-amber-400", badge: "EXAMS" },
        { id: "store", label: "Store", icon: ShoppingBag, color: "text-rose-400" },
      ];
      return (
        <div className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-14rem)] no-scrollbar">
          <p className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
            Quick Button
          </p>
          {studentTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = studentActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setStudentActiveTab(tab.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : tab.color}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    if (role === "admission") {
      const admissionTabs = [
        { id: "leads", label: "Leads & Inquiries", icon: Compass, color: "text-indigo-400" },
        { id: "admissions", label: "Admission Requests", icon: UserCheck, color: "text-emerald-400" },
        { id: "fees", label: "Collect Fees", icon: Receipt, color: "text-cyan-400" },
        { id: "cards", label: "Student ID Cards", icon: CreditCard, color: "text-amber-400" },
      ];
      return (
        <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)] no-scrollbar">
          <p className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">
            Admissions Portal
          </p>
          {admissionTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = admissionActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setAdmissionActiveTab(tab.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : tab.color}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    if (role === "feemanager") {
      const feeTabs = [
        { id: "ledger", label: "Fee Ledger", icon: Receipt, color: "text-cyan-400" },
        { id: "collect", label: "Collect Fee Payment", icon: CreditCard, color: "text-emerald-400" },
        { id: "defaulters", label: "Dues & Defaulters", icon: ShieldAlert, color: "text-rose-400" },
        { id: "receipts", label: "Payment Receipts", icon: ClipboardList, color: "text-indigo-400" },
      ];
      return (
        <div className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-14rem)] no-scrollbar">
          <p className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
            Finance Portal
          </p>
          {feeTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = feeActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setFeeActiveTab(tab.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : tab.color}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    if (role === "principal") {
      const principalTabs = [
        { id: "overview", label: "Campus Dashboard", icon: Award, color: "text-amber-400" },
        { id: "faculty", label: "Faculty Members", icon: Users, color: "text-cyan-400" },
        { id: "students", label: "Student Analytics", icon: GraduationCap, color: "text-emerald-400" },
        { id: "announcements", label: "Campus Broadcasts", icon: Megaphone, color: "text-orange-400" },
      ];
      return (
        <div className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-14rem)] no-scrollbar">
          <p className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
            Principal Portal
          </p>
          {principalTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = principalActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setPrincipalActiveTab(tab.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : tab.color}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row font-sans transition-colors duration-200"
      id="app-root-container"
    >
      <style>{`
        :root {
          --brand-50: ${selectedColors["50"]};
          --brand-100: ${selectedColors["100"]};
          --brand-150: ${selectedColors["150"]};
          --brand-200: ${selectedColors["200"]};
          --brand-300: ${selectedColors["300"]};
          --brand-400: ${selectedColors["400"]};
          --brand-500: ${selectedColors["500"]};
          --brand-600: ${selectedColors["600"]};
          --brand-650: ${selectedColors["650"]};
          --brand-700: ${selectedColors["700"]};
          --brand-800: ${selectedColors["800"]};
          --brand-900: ${selectedColors["900"]};
          --brand-950: ${selectedColors["950"]};
        }

        /* Direct printed layout adjustments */
        @media print {
          header, nav, button, aside, .no-print {
            display: none !important;
          }
          body, #app-root-container {
            background-color: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* 
        1. PERSISTENT DESKTOP LEFT SIDEBAR 
        Starts code from the very top of the webpage (sticky top-0, h-screen). 
        The logo & name are fixed at the top of this sidebar menu.
      */}
      <aside className="no-print hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-slate-950 border-r border-slate-850 text-white shrink-0 z-40 select-none no-scrollbar overflow-y-auto">
        {/* Fixed Header Section inside the Sidebar Menu */}
        <div className="sticky top-0 bg-slate-950/95 backdrop-blur-md border-b border-slate-850 p-5 flex items-center space-x-3 z-20">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-display font-black text-white tracking-tight text-sm uppercase block leading-none">
              Study Hub
            </span>
          </div>
        </div>

        {/* Scrollable middle section inside the Sidebar Menu */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {renderRoleSidebarMenu()}
        </div>

        {/* Floating Profile Section inside sidebar footer */}
        <div className="p-4 border-t border-slate-850 bg-slate-950/40 space-y-2 mt-auto">
          {/* Guided First-Time Tutorial Button */}
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="w-full flex items-center justify-between p-2.5 bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-200 rounded-xl transition-all cursor-pointer border border-indigo-500/30 group"
            title="Start Guided Tutorial & Feature Overview"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Compass className="w-4 h-4 text-amber-400 shrink-0 group-hover:rotate-45 transition-transform" />
              <span className="text-xs font-extrabold uppercase tracking-wider truncate">
                Guided Tutorial
              </span>
            </div>
            <span className="bg-amber-400/20 text-amber-300 font-mono font-black text-[9px] px-2 py-0.5 rounded uppercase shrink-0 border border-amber-400/30">
              Tour 💡
            </span>
          </button>

          {(() => {
            const profile = getCurrentUserProfile();
            return (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setEditProfileName(profile.nameVal || "");
                    setEditProfileAvatar(profile.avatarUrl || "");
                    let currentMail = "";
                    if (role === "admin")
                      currentMail =
                        admins.find((a) => a.id === loggedInUserId)?.email ||
                        "admin@coachinghub.edu";
                    else if (role === "teacher")
                      currentMail =
                        teachers.find((t) => t.id === loggedInUserId)?.email ||
                        "";
                    else if (role === "student")
                      currentMail =
                        students.find((s) => s.id === loggedInUserId)?.email ||
                        "";
                    else if (role === "feemanager")
                      currentMail =
                        feeManagers.find((fm) => fm.id === loggedInUserId)
                          ?.email || "";
                    else if (role === "principal")
                      currentMail =
                        schools.find((s) => s.id === loggedInUserId)
                          ?.principalEmail || "";
                    setEditProfileEmail(currentMail);
                    setProfileModalMode("view");
                  }}
                  className="w-full flex items-center space-x-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 p-2.5 rounded-xl transition-all cursor-pointer text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 font-extrabold text-white text-xs flex items-center justify-center font-mono uppercase">
                    {profile.nameVal ? profile.nameVal.substring(0, 2) : "US"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-white truncate max-w-[130px] leading-tight flex items-center gap-1">
                      <span>{profile.nameVal}</span>
                      <span className="text-sky-400 shrink-0 inline-flex animate-pulse" title="Active Verified Session">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </span>
                    </p>
                    <p className="text-[7.5px] text-slate-400 font-mono uppercase tracking-wider mt-0.5 leading-none">
                      {profile.displayRole}
                    </p>
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/30 hover:border-rose-900/60 rounded-xl text-rose-300 hover:text-rose-200 transition-all text-[9.5px] font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            );
          })()}
        </div>
      </aside>

      {/* 
        2. DYNAMIC MOBILE HEADER NAVBAR 
        Only visible on mobile/tablets (lg:hidden), sticky top-0.
      */}
      <header className="lg:hidden no-print bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="px-4 py-3 flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            {/* Mobile sidebar menu trigger icon */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 rounded-xl transition-all h-9 w-9 flex items-center justify-center cursor-pointer"
              title="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-4.5 h-4.5 shrink-0" />
              ) : (
                <Menu className="w-4.5 h-4.5 shrink-0" />
              )}
            </button>

            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-display font-black text-slate-900 tracking-tight text-sm uppercase block leading-none">
                Study Hub
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Notification bell icon (hidden for student) */}
            {role !== "student" && (
              <button
                onClick={() => setIsNotificationOpen(true)}
                className="relative p-2 bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 rounded-xl transition-all h-8 w-8 flex items-center justify-center cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4 shrink-0" />
                {notifications.filter((n) => !n.readBy.includes(loggedInUserId))
                  .length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-black text-white ring-2 ring-white animate-pulse">
                    {
                      notifications.filter(
                        (n) => !n.readBy.includes(loggedInUserId),
                      ).length
                    }
                  </span>
                )}
              </button>
            )}

            {loggedInUserId === "admin" && (
              <select
                value={role}
                onChange={(e) => {
                  const newRole = e.target.value as any;
                  setRole(newRole);
                  if (newRole === "admin") setAdminActiveTab("courses");
                  if (newRole === "teacher") setTeacherActiveTab("courses");
                  if (newRole === "student") setStudentActiveTab("courses");
                  setIsMobileMenuOpen(false);
                }}
                className="bg-slate-50 border border-slate-200 text-xs font-extrabold uppercase px-2 py-1.5 rounded-lg text-indigo-700 focus:outline-none"
              >
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="admission">Admissions</option>
                <option value="feemanager">Finance</option>
                <option value="principal">Principal</option>
              </select>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Sliding Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex no-print">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative flex flex-col w-72 max-w-[85vw] h-screen bg-slate-950 border-r border-slate-850 text-white select-none shadow-2xl z-10 overflow-y-auto no-scrollbar"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-850 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                    <GraduationCap className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="font-display font-black text-white tracking-tight text-xs uppercase block leading-none">
                      Study Hub
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Scrollable Middle Sections */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {renderRoleSidebarMenu()}
              </div>

              {/* Floating Profile Section inside drawer footer */}
              <div className="p-4 border-t border-slate-850 bg-slate-950/40 space-y-3 mt-auto">
                {(() => {
                  const profile = getCurrentUserProfile();
                  return (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setEditProfileName(profile.nameVal || "");
                          setEditProfileAvatar(profile.avatarUrl || "");
                          let currentMail = "";
                          if (role === "admin")
                            currentMail =
                              admins.find((a) => a.id === loggedInUserId)
                                ?.email || "admin@coachinghub.edu";
                          else if (role === "teacher")
                            currentMail =
                              teachers.find((t) => t.id === loggedInUserId)
                                ?.email || "";
                          else if (role === "student")
                            currentMail =
                              students.find((s) => s.id === loggedInUserId)
                                ?.email || "";
                          else if (role === "feemanager")
                            currentMail =
                              feeManagers.find((fm) => fm.id === loggedInUserId)
                                ?.email || "";
                          else if (role === "principal")
                            currentMail =
                              schools.find((s) => s.id === loggedInUserId)
                                ?.principalEmail || "";
                          setEditProfileEmail(currentMail);
                          setProfileModalMode("view");
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 p-2.5 rounded-xl transition-all cursor-pointer text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 font-extrabold text-white text-xs flex items-center justify-center font-mono uppercase">
                          {profile.nameVal ? profile.nameVal.substring(0, 2) : "US"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-white truncate max-w-[130px] leading-tight flex items-center gap-1">
                            <span>{profile.nameVal}</span>
                            <span className="text-sky-400 shrink-0 inline-flex animate-pulse" title="Active Verified Session">
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                            </span>
                          </p>
                          <p className="text-[7.5px] text-slate-400 font-mono uppercase tracking-wider mt-0.5 leading-none">
                            {profile.displayRole}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/30 hover:border-rose-900/60 rounded-xl text-rose-300 hover:text-rose-200 transition-all text-[9.5px] font-extrabold uppercase tracking-wider cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 
        3. MAIN WORKSPACE SCROLL CONTAINER 
        Takes up the remaining width next to the Left Sidebar menu.
      */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Main Core Body Space */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Starting Dynamic Welcome Profile Dashboard panel (Purple & Dark Blue style with perfect contrast) */}
          {(() => {
            const profile = getCurrentUserProfile();
            const showWelcomeBanner = (() => {
              if (role === "admin") return adminActiveTab === "overview";
              if (role === "teacher") return teacherActiveTab === "overview";
              if (role === "student") return studentActiveTab === "syllabus";
              if (role === "admission") return admissionActiveTab === "leads";
              if (role === "feemanager") return feeActiveTab === "ledger";
              if (role === "principal")
                return principalActiveTab === "overview";
              return false;
            })();

            if (!showWelcomeBanner) return null;

            return (
              <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c0f24] via-[#1b103c] to-[#0a071c] border border-purple-500/25 shadow-lg p-5 text-white relative">
                {/* Backlight Glows */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-12 w-36 h-36 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Guided Tutorial Trigger Banner Button */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsTutorialOpen(true)}
                      className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center space-x-2 cursor-pointer border border-indigo-400/30 group"
                      title="Launch Guided First-Time Tutorial"
                    >
                      <Compass className="w-4 h-4 text-amber-300 group-hover:rotate-90 transition-transform shrink-0" />
                      <span>Take Guided Tour 💡</span>
                    </button>
                  </div>

                  {/* Digital Clock & System Timezone Info */}
                  <div className="flex flex-col items-start md:items-end gap-1 px-4 py-2 bg-slate-950/40 border border-purple-500/15 rounded-xl backdrop-blur-sm self-stretch md:self-auto justify-center min-w-[200px]">
                    {role !== "student" && (
                      <div className="flex items-center space-x-1.5 text-purple-400">
                        <span className="text-[9px] font-bold uppercase tracking-widest font-mono">
                          System Timezone Active
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                    )}

                    {/* Digital Clock & Calendar Date Row */}
                    <div className="flex md:flex-col lg:flex-row items-baseline gap-2">
                      <span className="text-lg font-mono font-black text-rose-300 tracking-wider">
                        {digitalTime || "00:00:00"}
                      </span>
                      <span className="text-[9px] text-slate-400 font-sans tracking-wide uppercase font-bold">
                        {digitalDate || "Loading active calendar..."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Dynamic workspace injection with animations */}
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
              className="w-full"
            >
              {(() => {
                const isNotificationsHubActive =
                  (role === "admin" &&
                    adminActiveTab === "notifications_hub") ||
                  (role === "teacher" &&
                    teacherActiveTab === "notifications_hub") ||
                  (role === "principal" &&
                    principalActiveTab === "notifications_hub");

                if (isNotificationsHubActive) {
                  return (
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                      <NotificationHubWorkspace />
                    </div>
                  );
                }

                return (
                  <>
                    {role === "admin" && (
                      adminActiveTab === "courses" ? (
                        <CourseManager 
                          courses={courses}
                          teachers={teachers}
                          onCreateCourse={(c) => {
                            clearDeletedId("courses", c.id);
                            setCourses(prev => [c, ...prev]);
                          }}
                          onUpdateCourse={(c) => setCourses(prev => prev.map(x => x.id === c.id ? c : x))}
                          onDeleteCourse={(id) => {
                            markIdAsDeleted("courses", id);
                            setCourses(prev => prev.filter(x => x.id !== id));
                            deleteDoc(doc(db, "courses", id)).catch(() => {});
                          }}
                          isAdmin={true}
                          currentUserId={loggedInUserId || "admin_1"}
                          currentUserName="Administrator"
                          storeOrders={storeOrders}
                          setStoreOrders={setStoreOrders}
                          students={students}
                          setStudents={setStudents}
                        />
                      ) : adminActiveTab === "exam-portal" ? (
                        <AdminExamPortal
                          currentAdminId={loggedInUserId || "admin_1"}
                          currentAdminName="Super Administrator"
                          examForms={examForms}
                          setExamForms={setExamForms}
                          examMarksheets={examMarksheets}
                          setExamMarksheets={setExamMarksheets}
                          onDeleteMarksheet={handleDeleteMarksheet}
                          examSettings={examSettings}
                          setExamSettings={setExamSettings}
                          branchPINs={branchPINs}
                          setBranchPINs={setBranchPINs}
                          studyHubCenters={studyHubCenters}
                        />
                      ) : (adminActiveTab === "inventory" || adminActiveTab === "orders") ? (
                        <InventoryManager
                          storeItems={storeItems}
                          setStoreItems={setStoreItems}
                          storeOrders={storeOrders}
                          setStoreOrders={setStoreOrders}
                          students={students}
                          courses={courses}
                          initialView={adminActiveTab === "orders" ? "delivery-orders" : "inventory"}
                        />
                      ) : adminActiveTab === "store" || adminActiveTab === "store-helpdesk" ? (
                        <StoreView 
                          courses={courses}
                          storeItems={storeItems}
                          storeOrders={storeOrders}
                          studyHubCenters={studyHubCenters}
                          currentUser={{ id: "admin_1", name: "Administrator", email: "admin@coachinghub.edu", role: "admin" }}
                          onPlaceOrder={(ord) => setStoreOrders(prev => [ord, ...prev])}
                          onAskDoubt={(cId, msg) => setCourses(prev => prev.map(c => c.id === cId ? { ...c, doubts: [...c.doubts, { id: "d_" + Date.now(), studentId: "admin", studentName: "Administrator", message: msg, timestamp: new Date().toLocaleString() }] } : c))}
                          supportMessages={supportMessages}
                          setSupportMessages={setSupportMessages}
                          setStoreOrders={setStoreOrders}
                          initialTab={adminActiveTab === "store-helpdesk" ? "helpdesk" : "books"}
                          onNavigateToInventory={() => setAdminActiveTab("inventory")}
                        />
                      ) : (
                        <AdminDashboard
                          activeTab={adminActiveTab}
                          setActiveTab={setAdminActiveTab}
                          hideSidebarOnDesktop={true}
                          studyHubCenters={studyHubCenters}
                          setStudyHubCenters={setStudyHubCenters}
                          storeOrders={storeOrders}
                          setStoreOrders={setStoreOrders}
                          batches={batches}
                          teachers={teachers}
                          students={students}
                          announcements={announcements}
                          admins={admins}
                          supportMessages={supportMessages}
                          setSupportMessages={setSupportMessages}
                          computerDesks={computerDesks}
                          schools={schools}
                          onCreateSchool={(sch) => {
                            clearDeletedId("schools", sch.id);
                            setSchools((prev) => [sch, ...prev]);
                          }}
                          onDeleteSchool={(id) => {
                            markIdAsDeleted("schools", id);
                            setSchools((prev) => prev.filter((s) => s.id !== id));
                            deleteDoc(doc(db, "schools", id)).catch(() => {});
                          }}
                          onUpdateSchool={(sch) =>
                            setSchools((prev) =>
                              prev.map((s) => (s.id === sch.id ? sch : s)),
                            )
                          }
                          onSendSupportMessage={handleSendSupportMessage}
                          onCreateBatch={handleCreateBatch}
                          onDeleteBatch={handleDeleteBatch}
                          onUpdateBatch={handleUpdateBatch}
                          onCreateTeacher={handleCreateTeacher}
                          onDeleteTeacher={handleDeleteTeacher}
                          onCreateStudent={handleCreateStudent}
                          onDeleteStudent={handleDeleteStudent}
                          onAddAnnouncement={handleAddAnnouncement}
                          onCreateAdmin={handleCreateAdmin}
                          onDeleteAdmin={handleDeleteAdmin}
                          onUpdateAdminStatus={handleUpdateAdminStatus}
                          onUpdateAdminPassword={handleUpdateAdminPassword}
                          onUpdateTeacherStatus={handleUpdateTeacherStatus}
                          onUpdateTeacherPassword={handleUpdateTeacherPassword}
                          onUpdateStudentStatus={handleUpdateStudentStatus}
                          onUpdateStudentPassword={handleUpdateStudentPassword}
                          onUpdateStudentDetails={handleUpdateStudentDetails}
                          onUpdateAdminProfile={handleUpdateAdminProfile}
                          loggedInAdminId={loggedInUserId || "admin_1"}
                          onRegisterComputerDesk={handleRegisterComputerDesk}
                          onDeleteComputerDesk={handleDeleteComputerDesk}
                          onUpdateComputerDesk={handleUpdateComputerDesk}
                          onUpdateStudentLock={handleUpdateStudentLock}
                          onUnenrollStudent={handleUnenrollStudent}
                          tests={tests}
                          onApproveTest={handleApproveTest}
                          onDeleteTest={handleDeleteTest}
                          feeManagers={feeManagers}
                          onCreateFeeManager={handleCreateFeeManager}
                          onDeleteFeeManager={handleDeleteFeeManager}
                          onUpdateFeeManagerStatus={handleUpdateFeeManagerStatus}
                          onUpdateFeeManagerPassword={
                            handleUpdateFeeManagerPassword
                          }
                          admissionOfficers={admissionOfficers}
                          onCreateAdmissionOfficer={handleCreateAdmissionOfficer}
                          onDeleteAdmissionOfficer={handleDeleteAdmissionOfficer}
                          onUpdateAdmissionOfficerStatus={
                            handleUpdateAdmissionOfficerStatus
                          }
                          onUpdateAdmissionOfficerPassword={
                            handleUpdateAdmissionOfficerPassword
                          }
                          verifiers={verifiers}
                          onCreateVerifier={handleCreateVerifier}
                          onDeleteVerifier={handleDeleteVerifier}
                          onUpdateVerifierStatus={handleUpdateVerifierStatus}
                          onUpdateVerifierPassword={handleUpdateVerifierPassword}
                          leads={leads}
                          onUpdateLead={handleUpdateLead}
                          onDeleteLead={handleDeleteLead}
                          onUpdateAnnouncement={handleUpdateAnnouncement}
                          onDeleteAnnouncement={handleDeleteAnnouncement}
                          onlineAnnouncements={onlineAnnouncements}
                          onAddOnlineAnnouncement={handleAddOnlineAnnouncement}
                          onUpdateOnlineAnnouncement={handleUpdateOnlineAnnouncement}
                          onDeleteOnlineAnnouncement={handleDeleteOnlineAnnouncement}
                          isNoticeboardAdminOnly={isNoticeboardAdminOnly}
                          onToggleNoticeboardAdminOnly={setIsNoticeboardAdminOnly}
                          publicBatches={publicBatches}
                          onAddPublicBatch={(b) =>
                            setPublicBatches((prev) => [...prev, b])
                          }
                          onUpdatePublicBatch={(id, fields) =>
                            setPublicBatches((prev) =>
                              prev.map((b) =>
                                b.id === id ? { ...b, ...fields } : b,
                              ),
                            )
                          }
                          onDeletePublicBatch={(id) =>
                            setPublicBatches((prev) =>
                              prev.filter((b) => b.id !== id),
                            )
                          }
                          isEmergencyShutdown={isEmergencyShutdown}
                          setIsEmergencyShutdown={setIsEmergencyShutdown}
                          shutdownReason={shutdownReason}
                          setShutdownReason={setShutdownReason}
                          authorizedDevices={authorizedDevices}
                          setAuthorizedDevices={setAuthorizedDevices}
                          currentDeviceKey={currentDeviceKey}
                          securityAlerts={securityAlerts}
                          onResolveAlert={handleResolveAlert}
                          counsellingRequests={counsellingRequests}
                          setCounsellingRequests={setCounsellingRequests}
                          counsellingSlots={counsellingSlots}
                          setCounsellingSlots={setCounsellingSlots}
                          admissionRequests={admissionRequests}
                          setAdmissionRequests={setAdmissionRequests}
                          setStudents={setStudents}
                          setBatches={setBatches}
                        />
                      )
                    )}

                    {role === "teacher" && (
                      teacherActiveTab === "courses" ? (
                        <CourseManager 
                          courses={courses}
                          teachers={teachers}
                          onCreateCourse={(c) => {
                            clearDeletedId("courses", c.id);
                            setCourses(prev => [c, ...prev]);
                          }}
                          onUpdateCourse={(c) => setCourses(prev => prev.map(x => x.id === c.id ? c : x))}
                          onDeleteCourse={(id) => {
                            markIdAsDeleted("courses", id);
                            setCourses(prev => prev.filter(x => x.id !== id));
                            deleteDoc(doc(db, "courses", id)).catch(() => {});
                          }}
                          isAdmin={true}
                          currentUserId={loggedInUserId}
                          currentUserName={teachers.find(t => t.id === loggedInUserId)?.name || "Faculty Mentor"}
                          storeOrders={storeOrders}
                          setStoreOrders={setStoreOrders}
                          students={students}
                          setStudents={setStudents}
                        />
                      ) : teacherActiveTab === "exam-portal" ? (
                        <TeacherExamPortal
                          currentTeacherId={loggedInUserId}
                          currentTeacherName={teachers.find(t => t.id === loggedInUserId)?.name || "Faculty Mentor"}
                          examForms={examForms}
                          setExamForms={setExamForms}
                          examSubjects={examSubjects}
                          setExamSubjects={setExamSubjects}
                          examMarksheets={examMarksheets}
                          setExamMarksheets={setExamMarksheets}
                          onDeleteMarksheet={handleDeleteMarksheet}
                          branchPINs={branchPINs}
                          examSettings={examSettings}
                          students={students}
                          studyHubCenters={studyHubCenters}
                        />
                      ) : teacherActiveTab === "store" ? (
                        <StoreView 
                          courses={courses}
                          storeItems={storeItems}
                          storeOrders={storeOrders}
                          studyHubCenters={studyHubCenters}
                          currentUser={{ id: loggedInUserId || "t1", name: teachers.find(t => t.id === loggedInUserId)?.name || "Faculty Mentor", email: teachers.find(t => t.id === loggedInUserId)?.email || "teacher@studyhub.edu", role: "teacher" }}
                          onPlaceOrder={(ord) => setStoreOrders(prev => [ord, ...prev])}
                          onAskDoubt={(cId, msg) => setCourses(prev => prev.map(c => c.id === cId ? { ...c, doubts: [...c.doubts, { id: "d_" + Date.now(), studentId: loggedInUserId || "t1", studentName: teachers.find(t => t.id === loggedInUserId)?.name || "Faculty Mentor", message: msg, timestamp: new Date().toLocaleString() }] } : c))}
                          supportMessages={supportMessages}
                          setSupportMessages={setSupportMessages}
                          setStoreOrders={setStoreOrders}
                          initialTab="courses"
                        />
                      ) : (
                        <TeacherDashboard
                          activeTab={teacherActiveTab}
                          setActiveTab={setTeacherActiveTab}
                          hideSidebarOnDesktop={true}
                          batches={batches}
                          teachers={teachers}
                          students={students}
                          lessons={lessons}
                          tests={tests}
                          announcements={announcements}
                          fees={fees}
                          schools={schools}
                          supportMessages={supportMessages}
                          computerDesks={computerDesks}
                          testSubmissions={testSubmissions}
                          subjects={subjects}
                          onAddSubject={handleAddSubject}
                          onAddTestSubmission={handleAddTestSubmission}
                          onSendSupportMessage={handleSendSupportMessage}
                          onAddLesson={handleAddLesson}
                          onUpdateLessonStatus={handleUpdateLessonStatus}
                          onDeleteLesson={handleDeleteLesson}
                          onAddTest={handleAddTest}
                          onUpdateTest={handleUpdateTest}
                          onAddAnnouncement={handleAddAnnouncement}
                          onUpdateAttendance={handleUpdateAttendance}
                          loggedInTeacherId={
                            loggedInUserId !== "admin"
                              ? loggedInUserId
                              : undefined
                          }
                          onUpdateTeacherProfile={handleUpdateTeacherProfile}
                          onAddFeeInvoice={handleAddFeeInvoice}
                          onUpdateFeeStatus={handleUpdateFeeStatus}
                          onDeleteFeeInvoice={handleDeleteFeeInvoice}
                          onVerifyStudentAndAllotDesk={
                            handleVerifyStudentAndAllotDesk
                          }
                          isNoticeboardAdminOnly={isNoticeboardAdminOnly}
                          attendanceRecords={attendanceRecords}
                          onMarkAttendance={handleMarkAttendance}
                          onBatchMarkAttendance={handleBatchMarkAttendance}
                          onRegisterComputerDesk={handleRegisterComputerDesk}
                          onDeleteComputerDesk={handleDeleteComputerDesk}
                          onUpdateComputerDesk={handleUpdateComputerDesk}
                          onUpdateStudentLock={handleUpdateStudentLock}
                          onUpdateStudentFormDetails={
                            handleUpdateStudentFormDetails
                          }
                          onCreateStudent={handleCreateStudent}
                          counsellingRequests={counsellingRequests}
                          setCounsellingRequests={setCounsellingRequests}
                          admissionRequests={admissionRequests}
                          setAdmissionRequests={setAdmissionRequests}
                          setStudents={setStudents}
                          setBatches={setBatches}
                          courses={courses}
                          setCourses={setCourses}
                        />
                      )
                    )}

                    {role === "student" &&
                      (() => {
                        const currentStud = students.find(
                          (s) => s.id === loggedInUserId,
                        );
                        if (currentStud?.isLocked) {
                          return (
                            <div className="bg-red-500/10 dark:bg-rose-955/20 border-2 border-red-500 p-8 rounded-3xl max-w-2xl mx-auto text-center space-y-6 animate-pulse">
                              <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-3xl font-bold font-mono">
                                🔒
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-red-850 dark:text-red-400 uppercase tracking-widest leading-tight">
                                  ADMINISTRATIVE WORKSTATION LOCKOUT triggered
                                </h3>
                                <p className="text-sm font-semibold text-red-700 dark:text-slate-300 mt-2 font-mono">
                                  Host Terminal Session Locked:{" "}
                                  {currentStud.name} ({currentStud.rollNo})
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                                  Your examination desk and database profiles
                                  was frozen by the director portal instantly.
                                  Any physical action requires supervisor QR ID
                                  authentication and direct workspace unlock
                                  approval. All active test submission streams
                                  are paused.
                                </p>
                              </div>
                              <div className="pt-4 border-t border-red-200/50 dark:border-red-900/40">
                                <span className="text-[10px] font-mono uppercase bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold tracking-widest shadow-xs">
                                  TERMINAL STATE: SUSPENDED
                                </span>
                              </div>
                            </div>
                          );
                        }

                        if (studentActiveTab === "courses") {
                          return (
                            <CourseManager 
                              courses={courses}
                              teachers={teachers}
                              onCreateCourse={() => {}}
                              onUpdateCourse={(c) => setCourses(prev => prev.map(x => x.id === c.id ? c : x))}
                              onDeleteCourse={() => {}}
                              isAdmin={false}
                              currentUserId={loggedInUserId}
                              currentUserEmail={currentStud?.email}
                              currentUserName={currentStud?.name || "Student"}
                              currentUserStudent={currentStud}
                              storeOrders={storeOrders}
                            />
                          );
                        }

                        if (studentActiveTab === "store") {
                          return (
                            <StoreView 
                              courses={courses}
                              storeItems={storeItems}
                              storeOrders={storeOrders}
                              studyHubCenters={studyHubCenters}
                              currentUser={{ id: loggedInUserId || "s1", name: currentStud?.name || "Student", email: currentStud?.email || "student@studyhub.edu", mobileNumber: currentStud?.mobileNumber || "9876543210", role: "student" }}
                              onPlaceOrder={(ord) => setStoreOrders(prev => [ord, ...prev])}
                              onAskDoubt={(cId, msg) => setCourses(prev => prev.map(c => c.id === cId ? { ...c, doubts: [...c.doubts, { id: "d_" + Date.now(), studentId: loggedInUserId || "s1", studentName: currentStud?.name || "Student", message: msg, timestamp: new Date().toLocaleString() }] } : c))}
                              supportMessages={supportMessages}
                              setSupportMessages={setSupportMessages}
                              setStoreOrders={setStoreOrders}
                              initialTab="courses"
                            />
                          );
                        }

                        if (studentActiveTab === "exam-portal") {
                          return (
                            <StudentExamPortal
                              currentStudentId={loggedInUserId}
                              currentStudentName={currentStud?.name}
                              examForms={examForms}
                              examMarksheets={examMarksheets}
                              examSettings={examSettings}
                              students={students}
                            />
                          );
                        }

                        return (
                          <StudentDashboard
                            activeTab={studentActiveTab}
                            setActiveTab={setStudentActiveTab}
                            hideSidebarOnDesktop={true}
                            batches={batches}
                            teachers={teachers}
                            students={students}
                            lessons={lessons}
                            tests={tests}
                            announcements={announcements}
                            fees={fees}
                            supportMessages={supportMessages}
                            computerDesks={computerDesks}
                            testSubmissions={testSubmissions}
                            subjects={subjects}
                            onSendSupportMessage={handleSendSupportMessage}
                            loggedInStudentId={
                              loggedInUserId !== "admin"
                                ? loggedInUserId
                                : undefined
                            }
                            onUpdateStudentProfile={handleUpdateStudentProfile}
                            onUpdateStudentFormDetails={
                              handleUpdateStudentFormDetails
                            }
                            onAddTestSubmission={handleAddTestSubmission}
                            isNoticeboardAdminOnly={isNoticeboardAdminOnly}
                            attendanceRecords={attendanceRecords}
                            initialTab={studentDashboardInitialTab}
                          />
                        );
                      })()}

                    {role === "feemanager" &&
                      (() => {
                        const currentFm =
                          feeManagers.find((fm) => fm.id === loggedInUserId) ||
                          feeManagers[0];
                        return (
                          <FeeDashboard
                            activeTab={feeActiveTab}
                            setActiveTab={setFeeActiveTab}
                            hideSidebarOnDesktop={true}
                            fees={fees}
                            students={students}
                            onAddFeeInvoice={handleAddFeeInvoice}
                            onUpdateFeeStatus={handleUpdateFeeStatus}
                            onDeleteFeeInvoice={handleDeleteFeeInvoice}
                            loggedInFeeManagerId={currentFm?.id || "fm_default"}
                            feeManagers={feeManagers}
                            onUpdateFeeManagerProfile={
                              handleUpdateFeeManagerProfile
                            }
                            onLogout={handleLogout}
                          />
                        );
                      })()}

                    {role === "admission" && (
                      <AdmissionOfficeDashboard
                        activeTab={admissionActiveTab}
                        setActiveTab={setAdmissionActiveTab}
                        hideSidebarOnDesktop={true}
                        leads={leads}
                        onUpdateLead={handleUpdateLead}
                        onDeleteLead={handleDeleteLead}
                        onAddLead={handleAddLead}
                        onCreateStudent={handleCreateStudent}
                        batches={batches}
                        students={students}
                        schools={schools}
                        onDeleteStudent={handleDeleteStudent}
                      />
                    )}

                    {role === "principal" &&
                      (() => {
                        const currentSchool =
                          schools.find((s) => s.id === loggedInUserId) ||
                          schools[0];
                        return (
                          <PrincipalDashboard
                            activeTab={principalActiveTab}
                            setActiveTab={setPrincipalActiveTab}
                            hideSidebarOnDesktop={true}
                            school={currentSchool}
                            teachers={teachers}
                            students={students}
                            batches={batches}
                            onCreateTeacher={handleCreateTeacher}
                            onDeleteTeacher={handleDeleteTeacher}
                            onCreateStudent={handleCreateStudent}
                            onDeleteStudent={handleDeleteStudent}
                            onCreateBatch={handleCreateBatch}
                            onDeleteBatch={handleDeleteBatch}
                            onLogout={handleLogout}
                            admissionOfficers={admissionOfficers}
                            onCreateAdmissionOfficer={
                              handleCreateAdmissionOfficer
                            }
                            onDeleteAdmissionOfficer={
                              handleDeleteAdmissionOfficer
                            }
                            onUpdateAdmissionOfficerStatus={
                              handleUpdateAdmissionOfficerStatus
                            }
                            onUpdateTeacherStatus={handleUpdateTeacherStatus}
                            onUpdateStudentStatus={handleUpdateStudentStatus}
                            onUpdateTeacherPassword={handleUpdateTeacherPassword}
                            onUpdateStudentPassword={handleUpdateStudentPassword}
                          />
                        );
                      })()}

                    {role === "verifier" && (
                      <VerifierDashboard
                        students={students}
                        setStudents={setStudents}
                        computerDesks={computerDesks}
                        batches={batches}
                        onLogout={handleLogout}
                        loggedInVerifierId={loggedInUserId}
                        verifiers={verifiers}
                        onUpdateVerifierPassword={handleUpdateVerifierPassword}
                        onVerifyStudentAndAllotDesk={handleVerifyStudentAndAllotDesk}
                      />
                    )}
                  </>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Elegant Standard Base Footer */}
        <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500 font-medium font-sans">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="font-bold text-slate-700">
              © 2026 Vishveshwar Foundation Ltd.
            </p>
            <p className="text-slate-400">
              For academic queries or technical help: Support Email:{" "}
              <a
                href="mailto:vishveshwarfoundation@gmail.com"
                className="text-indigo-600 hover:underline font-bold font-mono"
              >
                vishveshwarfoundation@gmail.com
              </a>
            </p>
          </div>
        </footer>

        {profileModalMode && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeIn text-left">
              {/* Header banner gradient with deep purple theme */}
              <div className="bg-gradient-to-r from-indigo-700 via-purple-800 to-slate-900 p-6 text-white relative">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setProfileModalMode(null)}
                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-black uppercase tracking-wider">
                  {profileModalMode === "view"
                    ? "Scholar Profile Card"
                    : "Edit Workspace Registry"}
                </h3>
                <p className="text-xs text-indigo-200 mt-1 font-mono uppercase tracking-widest font-bold">
                  {getCurrentUserProfile().displayRole}
                </p>
              </div>

              {/* Profile Fields Area */}
              <div className="p-6 space-y-6">
                {/* Profile Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Authorized Full Name
                    </label>
                    {profileModalMode === "view" ? (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-800 font-bold text-sm flex items-center justify-between">
                        <span>{getCurrentUserProfile().nameVal}</span>
                        <span className="flex items-center space-x-1.5 bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-sky-100 shrink-0">
                          <svg className="w-3.5 h-3.5 fill-current text-sky-500" viewBox="0 0 24 24">
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <span>Active Verified User</span>
                        </span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={editProfileName}
                        onChange={(e) => setEditProfileName(e.target.value)}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Institution Communication Email
                    </label>
                    {profileModalMode === "view" ? (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-600 font-bold text-xs font-mono">
                        {editProfileEmail || "no-reply@institutions.gov.in"}
                      </div>
                    ) : (
                      <input
                        type="email"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={editProfileEmail}
                        onChange={(e) => setEditProfileEmail(e.target.value)}
                      />
                    )}
                  </div>

                  <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-4 text-left">
                    <div className="flex items-center space-x-2 text-indigo-700">
                      <ShieldAlert className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                        Security Authorization Active
                      </span>
                    </div>
                    <p className="text-[10px] text-indigo-600/80 mt-1 leading-relaxed">
                      This profile represents an authorized{" "}
                      {getCurrentUserProfile().displayRole} within the
                      Vishveshwar Foundation network system framework.
                    </p>
                  </div>
                </div>

                {/* Controls Footer */}
                <div className="flex space-x-3 pt-2">
                  {profileModalMode === "view" ? (
                    <>
                      <button
                        onClick={() => setProfileModalMode("edit")}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-xs tracking-wider py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10 text-center"
                      >
                        Edit Register Details
                      </button>
                      <button
                        onClick={() => setProfileModalMode(null)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold uppercase text-xs tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
                      >
                        Close Card
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateProfile(
                            editProfileName,
                            editProfileAvatar,
                            editProfileEmail,
                          )
                        }
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase text-xs tracking-wider py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/10 text-center"
                      >
                        Save Updates
                      </button>
                      <button
                        onClick={() => setProfileModalMode("view")}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold uppercase text-xs tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
                      >
                        Back to View
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {isNotificationOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn text-left flex flex-col max-h-[85vh]">
              {/* Header banner gradient with deep Indigo/Rose theme to feel premium */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 p-6 text-white relative flex justify-between items-start shrink-0">
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-indigo-500/15 border border-indigo-400/30 rounded-xl text-indigo-400 font-bold shrink-0">
                      <Bell className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider font-sans leading-none">
                        Institutional Broadcasts
                      </h3>
                      <p className="text-[10px] text-indigo-200 mt-1 uppercase font-mono tracking-widest font-bold font-sans">
                        Supervisor Bulletins & Notifications
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      // Mark all as read
                      setNotifications((prev) =>
                        prev.map((n) => {
                          if (!n.readBy.includes(loggedInUserId)) {
                            return {
                              ...n,
                              readBy: [...n.readBy, loggedInUserId],
                            };
                          }
                          return n;
                        }),
                      );
                    }}
                    className="bg-indigo-900/40 hover:bg-indigo-850/55 border border-indigo-500/20 text-indigo-200 hover:text-white px-2.5 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-black duration-150 shrink-0"
                    title="Mark all notifications as read"
                  >
                    Mark All Read
                  </button>
                  <button
                    onClick={() => setIsNotificationOpen(false)}
                    className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all shrink-0 cursor-pointer"
                    title="Close feeds panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Feed Core */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <p className="text-slate-400 italic text-xs">
                      No notifications or circular alerts have been broadcasted
                      yet.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const hasRead = notif.readBy.includes(loggedInUserId);
                    const ytId = getYouTubeEmbedId(notif.youtubeUrl);

                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        className={`relative bg-slate-50 dark:bg-slate-905/40 border rounded-2xl p-4 transition-all text-left group cursor-pointer ${
                          hasRead
                            ? "border-slate-150 hover:bg-slate-100/50"
                            : "border-rose-500/45 bg-rose-50/5 ring-1 ring-rose-500/10 hover:bg-rose-50/10"
                        }`}
                      >
                        {/* Unread indicator dot */}
                        {!hasRead && (
                          <span className="absolute top-4 right-4 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                          </span>
                        )}

                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-[8px] bg-slate-200 text-slate-700 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                            {notif.senderRole}
                          </span>
                          <span className="text-[10px] text-slate-855 font-heavy font-black">
                            {notif.senderName}
                          </span>
                          <span className="text-[8.5px] text-slate-400 font-mono">
                            • {notif.timestamp}
                          </span>
                        </div>

                        <h4 className="text-xs font-extrabold text-slate-900 leading-snug group-hover:text-indigo-650 transition-colors">
                          {notif.title}
                        </h4>
                        <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans mt-1.5 whitespace-pre-wrap break-words">
                          {notif.content}
                        </p>

                        {/* YouTube video attachment render */}
                        {ytId && (
                          <div className="mt-3">
                            <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-red-650 block mb-1 font-mono">
                              Interactive Video Presentation:
                            </span>
                            <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video border border-slate-150 max-w-sm">
                              <iframe
                                title="YouTube video player"
                                src={`https://www.youtube.com/embed/${ytId}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                              />
                            </div>
                          </div>
                        )}

                        {/* File attachment rendering style */}
                        {notif.attachmentName && (
                          <div className="mt-3 flex items-center justify-between border border-dashed border-slate-200 bg-white p-2.5 rounded-xl text-[10.5px]">
                            <span
                              className="font-bold text-slate-600 truncate max-w-[200px]"
                              title={notif.attachmentName}
                            >
                              📎 {notif.attachmentName}
                            </span>
                            {notif.attachmentUrl && (
                              <a
                                href={notif.attachmentUrl}
                                download={notif.attachmentName}
                                onClick={(e) => {
                                  e.stopPropagation(); // prevent mark as read twice triggering a general click conflict
                                  handleMarkAsRead(notif.id);
                                }}
                                className="bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-colors shrink-0"
                              >
                                Download File
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
                <button
                  onClick={() => setIsNotificationOpen(false)}
                  className="bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider duration-150 cursor-pointer"
                >
                  Dismiss Feed
                </button>
              </div>
            </div>
          </div>
        )}



        {/* Mobile Student Search and Management Modal */}
        {isMobileSearchOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[120] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn text-left flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 p-5 text-white relative shrink-0 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-indigo-500/15 border border-indigo-400/30 rounded-xl text-indigo-400 font-bold shrink-0">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider font-sans leading-none">
                      Mobile Student Search
                    </h3>
                    <p className="text-[9px] text-indigo-200 mt-1 uppercase font-mono tracking-widest font-bold">
                      Direct Scholar Management Portal
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all cursor-pointer"
                  title="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search bar input section */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-905/30 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={mobileSearchQuery}
                    onChange={(e) => {
                      setMobileSearchQuery(e.target.value);
                      setExpandedStudentId(null);
                    }}
                    placeholder="Search by name, roll code, APAAR ID, parent..."
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                  {mobileSearchQuery && (
                    <button
                      onClick={() => {
                        setMobileSearchQuery("");
                        setExpandedStudentId(null);
                      }}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2 px-1">
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                    {mobileSearchQuery.trim() ? "Search Results" : "Showing list of scholars"}
                  </span>
                  <span className="text-[8.5px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    Total: {students.length} Students
                  </span>
                </div>
              </div>

              {/* List of matched students */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {(() => {
                  const filtered = mobileSearchQuery.trim()
                    ? students.filter(s => {
                        const q = mobileSearchQuery.toLowerCase().trim();
                        return (
                          s.name?.toLowerCase().includes(q) ||
                          s.rollNo?.toLowerCase().includes(q) ||
                          s.username?.toLowerCase().includes(q) ||
                          s.email?.toLowerCase().includes(q) ||
                          s.fatherName?.toLowerCase().includes(q) ||
                          s.motherName?.toLowerCase().includes(q) ||
                          s.apparId?.toLowerCase().includes(q) ||
                          s.scholarNumber?.toLowerCase().includes(q) ||
                          s.penNumber?.toLowerCase().includes(q) ||
                          s.ssmId?.toLowerCase().includes(q)
                        );
                      })
                    : students.slice(0, 15);

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-10 space-y-2">
                        <p className="text-slate-400 italic text-xs">
                          No student matching "{mobileSearchQuery}" was found.
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Try searching for full names, roll codes, parent names or IDs.
                        </p>
                      </div>
                    );
                  }

                  return filtered.map((student) => {
                    const isExpanded = expandedStudentId === student.id;
                    const batch = batches.find(b => b.id === student.batchId);
                    const isLocked = student.isLocked === true;

                    return (
                      <div
                        key={student.id}
                        className={`bg-white dark:bg-slate-905 border rounded-2xl transition-all duration-150 overflow-hidden ${
                          isExpanded
                            ? "border-indigo-550 ring-1 ring-indigo-500/20 shadow-md"
                            : "border-slate-150 hover:bg-slate-50/50"
                        }`}
                      >
                        {/* Header card view */}
                        <div
                          onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                          className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/40 dark:to-indigo-900/40 border border-indigo-100/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 text-xs font-black font-mono">
                              {student.name ? student.name.substring(0, 2).toUpperCase() : "ST"}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                {student.name}
                              </h4>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <span className="text-[8.5px] text-indigo-600 dark:text-indigo-400 font-mono font-bold uppercase">
                                  {student.rollNo || "No Roll"}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-[8.5px] text-slate-500 truncate max-w-[120px]">
                                  {batch ? batch.name : "Unassigned"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0">
                            {/* Verification Badge */}
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono flex items-center gap-1 ${
                              student.isVerified || student.verifiedAt
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300/60"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300/60"
                            }`}>
                              {student.isVerified || student.verifiedAt ? (
                                <>
                                  <CheckCircle className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>Verified</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                                  <span>Pending Verification</span>
                                </>
                              )}
                            </span>

                            {/* Status Badge */}
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono ${
                              student.status === "Active"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}>
                              {student.status}
                            </span>
                            {isLocked && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 font-mono uppercase">
                                Locked
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expanded details container */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/30 space-y-4 animate-slideDown">
                            {/* Information Grid */}
                            <div className="grid grid-cols-2 gap-3 text-[10px]">
                              {/* Parent Info */}
                              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                                <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold block">
                                  Parentage Information
                                </span>
                                <p className="text-slate-900 dark:text-slate-100 truncate">
                                  <span className="font-bold text-slate-500">Father:</span> {student.fatherName || "Not Recorded"}
                                </p>
                                <p className="text-slate-900 dark:text-slate-100 truncate">
                                  <span className="font-bold text-slate-500">Mother:</span> {student.motherName || "Not Recorded"}
                                </p>
                              </div>

                              {/* Identity IDs */}
                              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                                <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold block">
                                  Identity & IDs
                                </span>
                                <p className="text-slate-900 dark:text-slate-100 truncate">
                                  <span className="font-bold text-slate-500">APAAR ID:</span> {student.apparId || "Not Set"}
                                </p>
                                <p className="text-slate-900 dark:text-slate-100 truncate">
                                  <span className="font-bold text-slate-500">SSM ID:</span> {student.ssmId || "Not Set"}
                                </p>
                              </div>

                              {/* Basic Data */}
                              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                                <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold block">
                                  Contact & DOB
                                </span>
                                <p className="text-slate-900 dark:text-slate-100 truncate">
                                  <span className="font-bold text-slate-500">Mobile:</span> {student.mobileNumber || "Not Recorded"}
                                </p>
                                <p className="text-slate-900 dark:text-slate-100 truncate">
                                  <span className="font-bold text-slate-500">DOB:</span> {student.dob || "Not Recorded"}
                                </p>
                              </div>

                              {/* Portal Credentials */}
                              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-indigo-100/50 dark:border-indigo-950/50 space-y-1">
                                <span className="text-[8px] uppercase tracking-widest text-indigo-500 font-bold block">
                                  Portal Credentials
                                </span>
                                <p className="text-slate-900 dark:text-slate-100 truncate">
                                  <span className="font-bold text-indigo-500">Username:</span> {student.username || "None"}
                                </p>
                                <p className="text-slate-900 dark:text-slate-100 truncate">
                                  <span className="font-bold text-indigo-500">Password:</span> {student.password || "alex123"}
                                </p>
                              </div>
                            </div>

                            {/* Verification Desk details if present */}
                            {(student.verifiedAt || student.assignedComputerDeskCode) && (
                              <div className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl text-[9.5px] border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <div>
                                  <span className="font-bold text-slate-500">Allotted Desk:</span>{" "}
                                  <span className="text-slate-900 dark:text-slate-100 font-mono font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                                    {student.assignedComputerDeskCode || "None"}
                                  </span>
                                </div>
                                {student.verifiedAt && (
                                  <div className="text-slate-450 text-[8px] font-mono">
                                    Verified: {student.verifiedAt}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Direct Actions Toolbar inside drawer */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                              {/* Toggle Status action */}
                              <button
                                onClick={() => {
                                  const nextStatus = student.status === "Active" ? "Inactive" : "Active";
                                  handleUpdateStudentStatus(student.id, nextStatus);
                                }}
                                className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer duration-150 flex items-center space-x-1.5 border ${
                                  student.status === "Active"
                                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white border-transparent"
                                }`}
                              >
                                {student.status === "Active" ? (
                                  <>
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Deactivate Scholar</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>Activate Scholar</span>
                                  </>
                                )}
                              </button>

                              {/* Toggle Lock action */}
                              <button
                                onClick={() => {
                                  handleUpdateStudentLock(student.id, !isLocked);
                                }}
                                className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer duration-150 flex items-center space-x-1.5 border ${
                                  isLocked
                                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-transparent"
                                    : "bg-rose-950/20 hover:bg-rose-900/30 border-rose-900/30 hover:border-rose-900/60 text-rose-300"
                                }`}
                              >
                                {isLocked ? (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>Unlock Account</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Lockout Scholar</span>
                                  </>
                                )}
                              </button>

                              {/* Quick Password Reset */}
                              <button
                                onClick={() => {
                                  const newPass = prompt("Enter new password for " + student.name + ":", student.password || "alex123");
                                  if (newPass && newPass.trim()) {
                                    handleUpdateStudentPassword(student.id, newPass.trim());
                                    alert("Password updated successfully!");
                                  }
                                }}
                                className="px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-100/30 hover:border-indigo-400/40 cursor-pointer duration-150 flex items-center space-x-1.5"
                              >
                                <Key className="w-3.5 h-3.5" />
                                <span>Reset Password</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-905/60 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider duration-150 cursor-pointer"
                >
                  Dismiss Search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* First-Time User Guided Tutorial Overlay */}
        <OnboardingTutorial
          role={role === "verifier" ? "admin" : role}
          userName={loggedInUserName || getCurrentUserProfile().nameVal || "User"}
          userId={loggedInUserId}
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
        />
      </div>
    </div>
  );
}
