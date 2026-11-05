import React, { useState, useEffect } from "react";
import { 
  Sparkles, ChevronRight, ChevronLeft, CheckCircle2, BookOpen, 
  Video, Megaphone, FileText, Users, Award, Shield, CreditCard, 
  Download, HelpCircle, X, Compass, Layers, Monitor, Check
} from "lucide-react";

export interface OnboardingStep {
  title: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  keyFeatures: string[];
  tip?: string;
}

interface OnboardingTutorialProps {
  role: "student" | "teacher" | "admin" | "admission" | "fee" | "feemanager" | "principal" | "verifier";
  userName: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tabId: string) => void;
}

export default function OnboardingTutorial({
  role,
  userName,
  userId,
  isOpen,
  onClose,
  onNavigateTab,
}: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Define steps according to role
  const getTutorialSteps = (): OnboardingStep[] => {
    if (role === "student") {
      return [
        {
          title: `Welcome to Study HUB, ${userName}!`,
          badge: "Student Portal Guide",
          description: "Your all-in-one digital campus for live interactive learning, course materials, online exams, and instant announcements.",
          icon: Compass,
          iconBg: "bg-indigo-500/20",
          iconColor: "text-indigo-400",
          keyFeatures: [
            "Access enrolled batch courses and subject schedules",
            "Watch live streams and download PDF class notes",
            "Track fees, attendance, report cards & APAAR IDs"
          ],
          tip: "Pro-tip: You can download class notes to read offline even without an internet connection!"
        },
        {
          title: "My Courses & Live Classroom",
          badge: "Interactive Learning",
          description: "Join real-time video lectures, rewatch past class recordings, and download lecture notes.",
          icon: Video,
          iconBg: "bg-purple-500/20",
          iconColor: "text-purple-400",
          keyFeatures: [
            "Join ongoing live streams with one click",
            "Interact via real-time doubt chat with your batch teacher",
            "Access class notes and downloadable study resources"
          ],
          tip: "Pro-tip: Downloaded PDFs can be viewed on your device at any time!"
        },
        {
          title: "Noticeboard & Campus Broadcasts",
          badge: "Stay Updated",
          description: "Never miss crucial updates, exam dates, fee deadlines, or timetable revisions from your institute.",
          icon: Megaphone,
          iconBg: "bg-amber-500/20",
          iconColor: "text-amber-400",
          keyFeatures: [
            "Filter notices by your assigned batch or institute broadcasts",
            "Instant notifications when new circulars are published",
            "Save important notices for offline access"
          ]
        },
        {
          title: "Online Test Portal & Lab Workstations",
          badge: "Exams & Evaluation",
          description: "Take secure online tests with automatic key verification and computer lab workstation allotment.",
          icon: Monitor,
          iconBg: "bg-emerald-500/20",
          iconColor: "text-emerald-400",
          keyFeatures: [
            "Enter secret exam keys provided by your invigilator",
            "Auto-assigned computer desk number for in-person lab exams",
            "Instant score reports and detailed solution breakdowns"
          ]
        },
        {
          title: "Fees, Digital ID Card & APAAR Profile",
          badge: "Student Administration",
          description: "Keep your student profile updated, view paid receipts, and present your official QR Student ID Card.",
          icon: CreditCard,
          iconBg: "bg-rose-500/20",
          iconColor: "text-rose-400",
          keyFeatures: [
            "Generate printable digital QR ID card for campus entry",
            "View fee dues, download tax receipts, and pay online",
            "Submit APAAR ID registration form directly to the portal"
          ],
          tip: "All set! You are ready to explore your Study HUB student account."
        }
      ];
    } else if (role === "teacher") {
      return [
        {
          title: `Welcome Staff Member, ${userName}!`,
          badge: "Faculty Workspace Guide",
          description: "Empower your teaching with live streaming, automated attendance, online tests, and course publishing tools.",
          icon: Users,
          iconBg: "bg-indigo-500/20",
          iconColor: "text-indigo-400",
          keyFeatures: [
            "Manage batch schedules and subject courses",
            "Conduct live classes with interactive student chat",
            "Track student attendance and evaluate test series"
          ]
        },
        {
          title: "Live Classroom Studio & Notes",
          badge: "Teaching Tools",
          description: "Stream high-definition lectures, upload study documents, and address student queries in real time.",
          icon: Video,
          iconBg: "bg-purple-500/20",
          iconColor: "text-purple-400",
          keyFeatures: [
            "Launch WebRTC/YouTube live broadcasts directly",
            "Upload class PDFs, formula sheets, and chapter summaries",
            "Answer student doubts live during class sessions"
          ]
        },
        {
          title: "Test Series Generator & Exam Keys",
          badge: "Evaluation Engine",
          description: "Build custom objective or subjective tests, set secret access keys, and assign computer workstations.",
          icon: Award,
          iconBg: "bg-emerald-500/20",
          iconColor: "text-emerald-400",
          keyFeatures: [
            "Create MCQ and written questions with mark weightages",
            "Generate secret exam keys for secure classroom tests",
            "Publish results directly to student performance cards"
          ]
        },
        {
          title: "Attendance & Class Communication",
          badge: "Classroom Control",
          description: "Mark daily student attendance and issue batch or global announcements effortlessly.",
          icon: Megaphone,
          iconBg: "bg-amber-500/20",
          iconColor: "text-amber-400",
          keyFeatures: [
            "One-tap daily attendance marking",
            "Post instant notices to specific batches or all students",
            "Verify student roll numbers and computer allotments"
          ]
        }
      ];
    } else {
      // Admin / Admission / Fee / Principal
      return [
        {
          title: `Welcome to Administrator Portal, ${userName}!`,
          badge: "Administrative Suite",
          description: "Complete operational control over campus infrastructure, user roles, financial records, and institutional analytics.",
          icon: Shield,
          iconBg: "bg-indigo-500/20",
          iconColor: "text-indigo-400",
          keyFeatures: [
            "Manage students, teachers, fee officers, and admission staff",
            "Monitor institute revenue, fee collections, and defaulter logs",
            "Oversee physical study centers and course catalogs"
          ]
        },
        {
          title: "User Management & System Access",
          badge: "Account Control",
          description: "Add new staff members, issue student credentials, and manage system permissions.",
          icon: Users,
          iconBg: "bg-purple-500/20",
          iconColor: "text-purple-400",
          keyFeatures: [
            "Create new student registrations and assign roll numbers",
            "Onboard faculty members and assign batch permissions",
            "Lock/Unlock user access or reset credentials securely"
          ]
        },
        {
          title: "Financial Audits & Campus Broadcasts",
          badge: "Finance & Communications",
          description: "Keep track of fee transactions and publish official institute broadcasts across all portals.",
          icon: CreditCard,
          iconBg: "bg-emerald-500/20",
          iconColor: "text-emerald-400",
          keyFeatures: [
            "Monitor fee receipts, pending dues, and revenue metrics",
            "Send high-priority announcements to students & staff",
            "Manage study materials and global campus courses"
          ]
        }
      ];
    }
  };

  const steps = getTutorialSteps();

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const StepIcon = step.icon;

  const handleComplete = () => {
    localStorage.setItem(`studyhub_tutorial_seen_${role}_${userId}`, "true");
    onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative flex flex-col text-left">
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-950 p-6 text-white relative border-b border-slate-800">
          <button
            onClick={handleComplete}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer"
            title="Skip Tutorial"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl ${step.iconBg} ${step.iconColor} border border-indigo-500/30`}>
              <StepIcon className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-300 block">
                {step.badge} ({currentStep + 1} of {steps.length})
              </span>
              <h3 className="text-xl font-black text-white tracking-tight leading-snug">
                {step.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-slate-200">
          <p className="text-sm leading-relaxed text-slate-300 font-medium">
            {step.description}
          </p>

          {/* Key Features List */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Key Highlights</span>
            </h4>
            <ul className="space-y-2">
              {step.keyFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Helpful Tip if available */}
          {step.tip && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start space-x-2.5 text-xs text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="font-medium">{step.tip}</p>
            </div>
          )}

          {/* Progress Indicator Dots */}
          <div className="flex items-center justify-center space-x-2 py-1">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStep ? "w-7 bg-indigo-500" : "w-2 bg-slate-700 hover:bg-slate-600"
                }`}
                title={`Step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleComplete}
            className="text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-wider px-3 py-2 cursor-pointer transition-colors"
          >
            Skip Tutorial
          </button>

          <div className="flex items-center space-x-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
            >
              <span>{currentStep === steps.length - 1 ? "Get Started 🚀" : "Next Step"}</span>
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
