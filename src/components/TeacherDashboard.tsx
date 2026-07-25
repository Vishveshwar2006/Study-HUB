import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, BrainCircuit, Sparkles, Send, Plus, 
  Trash2, ClipboardList, TrendingUp, Calendar, 
  HelpCircle, CheckCircle, FileText, Loader2,
  User, Mail, Save, Link, Lock, Shield, UserPlus,
  IndianRupee, DollarSign, Receipt, PlusCircle, CreditCard, Filter, MessageSquare, Camera, Upload,
  Menu, X, Scan, LayoutGrid, ArrowRight, School, ShieldAlert, AlertTriangle, Search
} from "lucide-react";
import { Batch, Teacher, Student, Lesson, Test, Announcement, FeeInvoice, SupportMessage, ComputerDesk, TestQuestion, TestSubmission, AttendanceRecord, School as SchoolType, CounsellingRequest, AdmissionRequest } from "../types";
import ReactMarkdown from "react-markdown";
import QRCardScanner from "./QRCardScanner";
import { Monitor, Smartphone, CheckSquare, Eye, Edit3, XCircle, Award, Printer } from "lucide-react";

interface TeacherDashboardProps {
  batches: Batch[];
  teachers: Teacher[];
  students: Student[];
  lessons: Lesson[];
  tests: Test[];
  announcements: Announcement[];
  fees: FeeInvoice[];
  supportMessages?: SupportMessage[];
  computerDesks?: ComputerDesk[];
  testSubmissions?: TestSubmission[];
  subjects?: string[];
  schools?: SchoolType[];
  onAddSubject?: (newSubject: string) => void;
  onAddTestSubmission?: (newSub: TestSubmission) => void;
  onSendSupportMessage?: (content: string, studentId: string) => void;
  onAddLesson: (lesson: Lesson) => void;
  onUpdateLessonStatus: (id: string, status: "Draft" | "Published" | "Completed") => void;
  onDeleteLesson: (id: string) => void;
  onAddTest: (test: Test) => void;
  onAddAnnouncement: (ann: Announcement) => void;
  onUpdateAttendance: (lessonId: string, studentId: string, attended: boolean) => void;
  loggedInTeacherId?: string;
  onUpdateTeacherProfile?: (id: string, name: string, email: string, specialization: string, avatar: string) => void;
  onAddFeeInvoice: (newInvoice: FeeInvoice) => void;
  onUpdateFeeStatus: (id: string, status: "Paid" | "Unpaid", paidDate?: string) => void;
  onDeleteFeeInvoice: (id: string) => void;
  onVerifyStudentAndAllotDesk?: (studentId: string, deskCode?: string) => void;
  onUpdateTest?: (test: Test) => void;
  isNoticeboardAdminOnly?: boolean;
  attendanceRecords?: AttendanceRecord[];
  onMarkAttendance?: (studentId: string, date: string, status: "Present" | "Absent", batchId: string) => void;
  onBatchMarkAttendance?: (records: Omit<AttendanceRecord, "id">[]) => void;
  onRegisterComputerDesk?: (desk: ComputerDesk) => void;
  onDeleteComputerDesk?: (id: string) => void;
  onUpdateComputerDesk?: (desk: ComputerDesk) => void;
  onUpdateStudentLock?: (id: string, isLocked: boolean) => void;
  onUpdateStudentFormDetails?: (id: string, details: any) => void;
  onCreateStudent?: (student: Student) => void;
  onTriggerSOS?: (alert: any) => void;
  counsellingRequests?: CounsellingRequest[];
  setCounsellingRequests?: React.Dispatch<React.SetStateAction<CounsellingRequest[]>>;
  admissionRequests?: AdmissionRequest[];
  setAdmissionRequests?: React.Dispatch<React.SetStateAction<AdmissionRequest[]>>;
  setStudents?: React.Dispatch<React.SetStateAction<Student[]>>;
  setBatches?: React.Dispatch<React.SetStateAction<Batch[]>>;
  activeTab?: "lessons" | "tests" | "grading" | "announcements" | "profile" | "fees" | "support" | "scanner" | "overview" | "verification" | "createTest" | "computers" | "apaar-management" | "student-management" | "counselling" | "admissions";
  setActiveTab?: (tab: "lessons" | "tests" | "grading" | "announcements" | "profile" | "fees" | "support" | "scanner" | "overview" | "verification" | "createTest" | "computers" | "apaar-management" | "student-management" | "counselling" | "admissions") => void;
  hideSidebarOnDesktop?: boolean;
}

export default function TeacherDashboard({
  batches: rawBatches,
  teachers,
  students: rawStudents,
  lessons,
  tests,
  announcements,
  fees,
  supportMessages = [],
  computerDesks = [],
  testSubmissions = [],
  subjects = [],
  schools = [],
  onAddSubject,
  onAddTestSubmission,
  onSendSupportMessage,
  onAddLesson,
  onUpdateLessonStatus,
  onDeleteLesson,
  onAddTest,
  onAddAnnouncement,
  onUpdateAttendance,
  loggedInTeacherId,
  onUpdateTeacherProfile,
  onAddFeeInvoice,
  onUpdateFeeStatus,
  onDeleteFeeInvoice,
  onVerifyStudentAndAllotDesk,
  onUpdateTest,
  isNoticeboardAdminOnly = false,
  attendanceRecords = [],
  onMarkAttendance,
  onBatchMarkAttendance,
  onRegisterComputerDesk,
  onDeleteComputerDesk,
  onUpdateComputerDesk,
  onUpdateStudentLock,
  onUpdateStudentFormDetails,
  onCreateStudent,
  onTriggerSOS,
  counsellingRequests = [],
  setCounsellingRequests = () => {},
  admissionRequests = [],
  setAdmissionRequests = () => {},
  setStudents = () => {},
  setBatches = () => {},
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  hideSidebarOnDesktop = false
}: TeacherDashboardProps) {
  // Counselling Teacher local states
  const [selectedCounselId, setSelectedCounselId] = useState<string | null>(null);
  const [adminCounselNotes, setAdminCounselNotes] = useState("");
  const [adminMeetingLink, setAdminMeetingLink] = useState("");
  const [adminChatInput, setAdminChatInput] = useState("");
  const [counselFilter, setCounselFilter] = useState<"All" | "Pending" | "Active" | "Closed">("All");
  const [counselSearch, setCounselSearch] = useState("");

  useEffect(() => {
    if (selectedCounselId && counsellingRequests) {
      const found = counsellingRequests.find(r => r.id === selectedCounselId);
      if (found) {
        setAdminCounselNotes(found.notes || "");
        setAdminMeetingLink(found.meetingLink || "");
      }
    }
  }, [selectedCounselId, counsellingRequests]);

  // Online Admission local states
  const [admStudentName, setAdmStudentName] = useState("");
  const [admEmail, setAdmEmail] = useState("");
  const [admMobileNumber, setAdmMobileNumber] = useState("");
  const [admDob, setAdmDob] = useState("");
  const [admFatherName, setAdmFatherName] = useState("");
  const [admMotherName, setAdmMotherName] = useState("");
  const [admBatchId, setAdmBatchId] = useState("");
  const [admSelectedRequest, setAdmSelectedRequest] = useState<AdmissionRequest | null>(null);

  // Current active teacher state for the demo
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    loggedInTeacherId || teachers[0]?.id || "t_1"
  );

  // Compute active teacher and allotted school details
  const activeTeacher = teachers.find(t => t.id === selectedTeacherId) || teachers[0];
  const currentSchool = schools && activeTeacher?.schoolId ? schools.find(s => s.id === activeTeacher.schoolId) : null;

  // Filter batches and students by allotted school
  const batches = activeTeacher?.schoolId
    ? rawBatches.filter(b => {
        const t = teachers.find(tc => tc.id === b.teacherId);
        return t && t.schoolId === activeTeacher.schoolId;
      })
    : rawBatches;

  const students = activeTeacher?.schoolId
    ? rawStudents.filter(s => s.schoolId === activeTeacher.schoolId)
    : rawStudents;

  // Synergy state additions for Daily Attendance tracking
  const [attendanceRegBatchId, setAttendanceRegBatchId] = useState<string>(batches[0]?.id || "");
  const [attendanceRegDate, setAttendanceRegDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [attendanceSuccess, setAttendanceSuccess] = useState<string>("");
  const [attendanceSubMode, setAttendanceSubMode] = useState<"camera" | "register">("register");

  // Teacher APAAR Student management states
  const [selectedApaarStudentId, setSelectedApaarStudentId] = useState<string>("");
  const [apaarSearch, setApaarSearch] = useState("");
  const [ledgerSearch, setLedgerSearch ] = useState("");
  const [teacherPen, setTeacherPen] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [teacherSerial, setTeacherSerial] = useState("");
  const [teacherApaarId, setTeacherApaarId] = useState("");
  const [teacherFather, setTeacherFather] = useState("");
  const [teacherMother, setTeacherMother] = useState("");
  const [teacherDob, setTeacherDob] = useState("");
  const [teacherScholar, setTeacherScholar] = useState("");
  const [teacherSsm, setTeacherSsm] = useState("");
  const [teacherSuccessMsg, setTeacherSuccessMsg] = useState("");

  // Teacher Student Registration states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRoll, setRegRoll] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regDob, setRegDob] = useState("2006-11-12");
  const [regBatchId, setRegBatchId] = useState("");
  const [regSuccessMsg, setRegSuccessMsg] = useState("");
  const [studentSearchText, setStudentSearchText] = useState("");

  const selectedApaarStudent = students.find(s => s.id === (selectedApaarStudentId || students[0]?.id)) || students[0];

  useEffect(() => {
    if (selectedApaarStudent) {
      setTeacherSerial(selectedApaarStudent.serialNumber || "");
      setTeacherApaarId(selectedApaarStudent.apparId || "");
      setTeacherPen(selectedApaarStudent.penNumber || "");
      setTeacherName(selectedApaarStudent.name || "");
      setTeacherFather(selectedApaarStudent.fatherName || "");
      setTeacherMother(selectedApaarStudent.motherName || "");
      setTeacherDob(selectedApaarStudent.dob || "");
      setTeacherScholar(selectedApaarStudent.scholarNumber || "");
      setTeacherSsm(selectedApaarStudent.ssmId || "");
      setTeacherSuccessMsg("");
    }
  }, [selectedApaarStudentId, selectedApaarStudent]);

  // Sync state if loggedInTeacherId changes
  useState(() => {
    if (loggedInTeacherId) {
      setSelectedTeacherId(loggedInTeacherId);
    }
  });
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [localActiveTab, setLocalActiveTab ] = useState<"lessons" | "tests" | "grading" | "announcements" | "profile" | "fees" | "support" | "scanner" | "overview" | "verification" | "createTest" | "computers" | "apaar-management" | "student-management" | "counselling" | "admissions">("overview");
  const activeTab = propActiveTab || localActiveTab;
  const setActiveTab = propSetActiveTab || setLocalActiveTab;

  useEffect(() => {
    if (isNoticeboardAdminOnly && activeTab === "announcements") {
      setActiveTab("overview");
    }
  }, [isNoticeboardAdminOnly, activeTab]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedChatStudentId, setSelectedChatStudentId] = useState<string>("");

  // Card scanner constraints
  const [authorizedStudentIdForFee, setAuthorizedStudentIdForFee] = useState<string | null>(null);
  const [lastScannedTeacherDashboardStudent, setLastScannedTeacherDashboardStudent] = useState<Student | null>(null);

  // Fee management states
  const [feeStudentId, setFeeStudentId] = useState("");
  const [feeTitle, setFeeTitle] = useState("");
  const [feeAmount, setFeeAmount] = useState<number>(1000);
  const [feeDueDate, setFeeDueDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 15); // Default due date 15 days from now
    return today.toISOString().split('T')[0];
  });
  const [feeNotes, setFeeNotes] = useState("");
  const [feeSuccessMsg, setFeeSuccessMsg] = useState("");
  const [feeFilterStatus, setFeeFilterStatus] = useState<"All" | "Paid" | "Unpaid">("All");
  const [feeSearchQuery, setFeeSearchQuery] = useState("");

  // Profile management states
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileSpec, setProfileSpec] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Computer desk states
  const [editingDesk, setEditingDesk] = useState<ComputerDesk | null>(null);
  const [newDeskCode, setNewDeskCode] = useState("");
  const [newDeskIp, setNewDeskIp] = useState("");
  const [newDeskRoom, setNewDeskRoom] = useState("");
  const [newDeskFaculty, setNewDeskFaculty] = useState("");

  // Session lockout password confirmation states
  const [lockoutModalStudentId, setLockoutModalStudentId] = useState<string | null>(null);
  const [lockoutModalAction, setLockoutModalAction] = useState<boolean>(false); // false = unlock, true = lock
  const [lockoutPasswordInput, setLockoutPasswordInput] = useState("");
  const [lockoutErrorMsg, setLockoutErrorMsg] = useState("");

  // AI Content Generator state
  const [aiTopic, setAiTopic] = useState("");
  const [aiGradeLevel, setAiGradeLevel] = useState("High School Intermediate");
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [generatedLessonMarkdown, setGeneratedLessonMarkdown] = useState("");

  // Grade Assessment form state
  const [testTitle, setTestTitle] = useState("");
  const [testMaxMarks, setTestMaxMarks] = useState(100);
  const [testDate, setTestDate] = useState("");
  const [newScores, setNewScores] = useState<{ [studentId: string]: number }>({});

  // Dynamic secure live test question builder states
  const [testType, setTestType] = useState<"standard" | "quiz">("standard");
  const [questionsToCreate, setQuestionsToCreate] = useState<any[]>([]);
  const [isTestSecureLive, setIsTestSecureLive] = useState(true);
  const [testExamKey, setTestExamKey] = useState("");
  
  // Single question builder forms
  const [curQText, setCurQText] = useState("");
  const [curQType, setCurQType] = useState<"MCQ" | "True/False" | "Written">("MCQ");
  const [curQSection, setCurQSection] = useState("Computer Systems & Logic");
  const [curQWeight, setCurQWeight] = useState(10);
  const [curQOptA, setCurQOptA] = useState("");
  const [curQOptB, setCurQOptB] = useState("");
  const [curQOptC, setCurQOptC] = useState("");
  const [curQOptD, setCurQOptD] = useState("");
  const [curQAnswer, setCurQAnswer] = useState("");

  // AI Diagnostic Evaluator state
  const [evalTestId, setEvalTestId] = useState("");
  const [evalStudentId, setEvalStudentId] = useState("");
  const [evalCustomNotes, setEvalCustomNotes] = useState("");
  const [isGeneratingEvaluation, setIsGeneratingEvaluation] = useState(false);
  const [generatedEvaluationHtml, setGeneratedEvaluationHtml] = useState("");

  // Test Editing States
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [editTestTitle, setEditTestTitle] = useState("");
  const [editTestSubject, setEditTestSubject] = useState("");
  const [editTestMaxMarks, setEditTestMaxMarks] = useState(100);
  const [editTestDate, setEditTestDate] = useState("");
  const [editTestExamKey, setEditTestExamKey] = useState("");
  const [editTestIsLive, setEditTestIsLive] = useState(false);
  const [editTestRequireLab, setEditTestRequireLab] = useState(false);

  // Custom Lesson Addition Form
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [manualContent, setManualContent] = useState("");

  // Exclusive states for New Create Test dynamic panel
  const [createTestBatchId, setCreateTestBatchId] = useState("");
  const [createTestTitle, setCreateTestTitle] = useState("");
  const [createTestMaxMarks, setCreateTestMaxMarks] = useState(100);
  const [createTestDate, setCreateTestDate] = useState("");
  const [createRequireLab, setCreateRequireLab] = useState(false);
  const [createExamKey, setCreateExamKey] = useState("");
  const [createQuestionsList, setCreateQuestionsList] = useState<TestQuestion[]>([]);
  const [createSingleQText, setCreateSingleQText] = useState("");
  const [createSingleQType, setCreateSingleQType] = useState<"MCQ" | "True/False" | "Written">("MCQ");
  const [createSingleQWeight, setCreateSingleQWeight] = useState(10);
  const [createSingleQOptA, setCreateSingleQOptA] = useState("");
  const [createSingleQOptB, setCreateSingleQOptB] = useState("");
  const [createSingleQOptC, setCreateSingleQOptC] = useState("");
  const [createSingleQOptD, setCreateSingleQOptD] = useState("");
  const [createSingleQCorrectAnswer, setCreateSingleQCorrectAnswer] = useState("");
  const [createIsSecureLive, setCreateIsSecureLive] = useState(true);

  // Subject Management and Reviewing Submissions states
  const [selectedSubject, setSelectedSubject] = useState("");
  const [customSubjectName, setCustomSubjectName] = useState("");
  const [showSubjectInput, setShowSubjectInput] = useState(false);
  const [testFilterSubject, setTestFilterSubject] = useState("all");
  
  // Create Test subject tag
  const [createTestSubject, setCreateTestSubject] = useState("");
  const [customCreateSubjectName, setCustomCreateSubjectName] = useState("");
  const [showCreateSubjectInput, setShowCreateSubjectInput] = useState(false);

  // Submission monitoring states
  const [selectedSubmissionsTestId, setSelectedSubmissionsTestId] = useState<string | null>(null);
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradingFeedback, setGradingFeedback] = useState("");
  const [gradingScores, setGradingScores] = useState<{ [questionId: string]: number }>({});

  // Batch Announcement State
  const [batchAnnTitle, setBatchAnnTitle] = useState("");
  const [batchAnnContent, setBatchAnnContent] = useState("");

  const teacherBatches = batches.filter(b => b.teacherId === activeTeacher.id);

  // Sync profile editing states
  useEffect(() => {
    if (activeTeacher) {
      setProfileName(activeTeacher.name);
      setProfileEmail(activeTeacher.email);
      setProfileSpec(activeTeacher.specialization || "");
      setProfileAvatar(activeTeacher.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150");
    }
  }, [activeTeacher?.id]);

  // Auto-set the first batch if none selected
  const currentBatchId = selectedBatchId || teacherBatches[0]?.id || "";
  const currentBatch = batches.find(b => b.id === currentBatchId);

  const currentBatchLessons = lessons.filter(l => l.batchId === currentBatchId);
  const currentBatchTests = tests.filter(t => t.batchId === currentBatchId);
  const currentBatchAnnouncements = announcements.filter(a => a.batchId === currentBatchId);
  const enrolledStudentsInBatch = students.filter(s => currentBatch?.studentIds.includes(s.id));

  // Call Back-end AI Lesson Generator
  const generateAiLesson = async () => {
    if (!aiTopic) return alert("Please specify a topic!");
    if (!currentBatch) return alert("Select a batch to add this lesson to!");
    
    setIsGeneratingLesson(true);
    setGeneratedLessonMarkdown("");
    
    try {
      const res = await fetch("/api/ai/lesson-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: currentBatch.subject,
          topic: aiTopic,
          gradeLevel: aiGradeLevel
        })
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedLessonMarkdown(data.content);
      } else {
        alert("AI error: " + (data.error || "Generation failed. Try again."));
      }
    } catch (error) {
      console.error(error);
      alert("API error connecting to server. Please verify environment setup.");
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  // Add the AI generated lesson to app state
  const saveGeneratedLessonToBatch = () => {
    if (!generatedLessonMarkdown || !currentBatch) return;
    const newLesson: Lesson = {
      id: "l_" + Date.now(),
      batchId: currentBatch.id,
      title: `${aiTopic} (AI Generated Study Plan)`,
      description: `Comprehensive study module for ${aiTopic}.`,
      content: generatedLessonMarkdown,
      date: new Date().toISOString().split("T")[0],
      status: "Published",
      attendance: {}
    };
    onAddLesson(newLesson);
    setAiTopic("");
    setGeneratedLessonMarkdown("");
    alert("AI Lesson saved and published to the batch syllabus!");
  };

  const handleTeacherRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      alert("Name and Email are mandatory fields.");
      return;
    }

    if (!onCreateStudent) {
      alert("Registration callback is not wired up.");
      return;
    }

    const finalRoll = regRoll.trim() || "CO-2026-" + Math.floor(1000 + Math.random() * 9000);
    const finalPassword = regPassword.trim() || "stud" + Math.floor(100 + Math.random() * 900);
    const finalDob = regDob || "2006-11-12";
    
    const selectedSchool = currentSchool || schools[0];
    const targetBatchId = regBatchId || (teacherBatches[0]?.id || batches[0]?.id || "");

    const newStudent: Student = {
      id: "s_" + Date.now(),
      name: regName.trim(),
      email: regEmail.trim(),
      rollNo: finalRoll,
      avatar: "",
      status: "Active",
      password: finalPassword,
      dob: finalDob,
      schoolId: selectedSchool?.id || undefined,
      schoolName: selectedSchool?.name || undefined,
      batchId: targetBatchId || undefined,
    };

    onCreateStudent(newStudent);
    
    // Clear fields
    setRegName("");
    setRegEmail("");
    setRegRoll("");
    setRegPassword("");
    setRegDob("2006-11-12");
    setRegBatchId("");
    
    setRegSuccessMsg(`Student "${newStudent.name}" enrolled successfully with Roll: ${newStudent.rollNo} and Password: ${newStudent.password}`);
    setTimeout(() => {
      setRegSuccessMsg("");
    }, 10000);
  };

  const handleManualAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !currentBatch) return;

    const newLesson: Lesson = {
      id: "l_" + Date.now(),
      batchId: currentBatch.id,
      title: manualTitle,
      description: manualDesc || "No overview provided.",
      content: manualContent || "Syllabus details coming soon.",
      date: new Date().toISOString().split("T")[0],
      status: "Draft",
      attendance: {}
    };

    onAddLesson(newLesson);
    setManualTitle("");
    setManualDesc("");
    setManualContent("");
    setShowAddManual(false);
    alert("Manual lesson structure added as Draft!");
  };

  // Call Back-end AI Student Evaluator
  const generateAiEvaluationReport = async () => {
    if (!evalTestId || !evalStudentId) {
      return alert("Select both a Test and a Student to evaluate!");
    }
    const testObj = tests.find(t => t.id === evalTestId);
    const studentObj = students.find(s => s.id === evalStudentId);
    if (!testObj || !studentObj) return;

    const score = testObj.scores[studentObj.id] ?? 0;

    setIsGeneratingEvaluation(true);
    setGeneratedEvaluationHtml("");

    try {
      const res = await fetch("/api/ai/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentObj.name,
          subject: currentBatch?.subject || "Core academics",
          testTitle: testObj.title,
          score: score,
          maxMarks: testObj.maxMarks,
          notes: evalCustomNotes
        })
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedEvaluationHtml(data.feedback);
      } else {
        alert("AI error: " + (data.error || "Report generation failed."));
      }
    } catch (error) {
      console.error(error);
      alert("API Error connecting to server.");
    } finally {
      setIsGeneratingEvaluation(false);
    }
  };

  // Dispatch new Exam assessment test
  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle || !currentBatch) return;

    // Build the scores mapping from input state
    const scoreMap: { [studentId: string]: number } = {};
    enrolledStudentsInBatch.forEach(s => {
      scoreMap[s.id] = newScores[s.id] ?? 0;
    });

    const calculatedMaxMarks = questionsToCreate.length > 0 
      ? questionsToCreate.reduce((sum, q) => sum + (q.markWeight || 0), 0)
      : testMaxMarks;

    const newTest: Test = {
      id: "test_" + Date.now(),
      batchId: currentBatch.id,
      title: testTitle,
      date: testDate || new Date().toISOString().split("T")[0],
      maxMarks: calculatedMaxMarks,
      scores: scoreMap,
      isLive: isTestSecureLive,
      questions: questionsToCreate.length > 0 ? questionsToCreate : undefined,
      isAdminApproved: false, // Requires Admin verification to go live on student portals
      subject: selectedSubject || undefined,
      examKey: testExamKey || undefined,
      isResultsPublished: false
    };

    onAddTest(newTest);
    setTestTitle("");
    setTestMaxMarks(100);
    setTestDate("");
    setNewScores({});
    setSelectedSubject("");
    setQuestionsToCreate([]);
    setTestExamKey("");
    alert(questionsToCreate.length > 0 
      ? "Interactive secure live test created successfully! It is now pending Admin approval to go live on student dashboards." 
      : "Standard test assessment recorded successfully! It is now pending Admin approval to publish on student portals."
    );
  };

  const handleAddBatchAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchAnnTitle || !batchAnnContent || !currentBatch) return;

    const newAnn: Announcement = {
      id: "ann_" + Date.now(),
      batchId: currentBatch.id,
      senderName: activeTeacher.name,
      senderRole: "Teacher",
      title: batchAnnTitle,
      content: batchAnnContent,
      date: new Date().toISOString().split("T")[0]
    };

    onAddAnnouncement(newAnn);
    setBatchAnnTitle("");
    setBatchAnnContent("");
    alert("Announcement broadcasted to this batch's notice board!");
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
      
      {/* Teacher Switcher header widget for Demo Interaction */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 text-left">
        <div className="flex items-center space-x-4 w-full md:w-auto text-left">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-rose-400 border border-slate-705 flex items-center justify-center font-mono text-sm font-extrabold uppercase shrink-0">
            {activeTeacher.name ? activeTeacher.name.substring(0, 2) : "TR"}
          </div>
          <div className="text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 bg-red-600 text-white font-bold rounded uppercase">
                Staff Account
              </span>
              {currentSchool ? (
                <span className="text-xs px-2.5 py-0.5 bg-emerald-600 text-white font-bold rounded uppercase tracking-wider flex items-center gap-1">
                  🏢 {currentSchool.name}
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 bg-amber-500 text-white font-bold rounded uppercase tracking-wider">
                  ⚠️ No School Allotted
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm text-white mt-1.5">{activeTeacher.name}</h4>
            <p className="text-xs text-slate-300 mt-0.5">{activeTeacher.specialization}</p>
          </div>
        </div>

        {!loggedInTeacherId ? (
          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <span className="text-xs text-slate-400 shrink-0">Switch Instructor Profile:</span>
            <select
              value={selectedTeacherId}
              onChange={e => {
                setSelectedTeacherId(e.target.value);
                // reset selected batch for the new teacher
                const nextTeacherBatches = batches.filter(b => b.teacherId === e.target.value);
                setSelectedBatchId(nextTeacherBatches[0]?.id || "");
              }}
              className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-400 text-slate-100 w-full sm:w-auto"
              id="mentor-profile-switch"
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.specialization.split(" ")[0]})</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-xs text-emerald-400 font-bold bg-emerald-950/50 px-3.5 py-1.5 rounded-xl border border-emerald-900/40 shrink-0">
            ✓ Logged In Secure Session
          </div>
        )}
      </div>

      {/* WORK WORKSPACE ALERT FOR UNASSIGNED TEACHERS */}
      {!currentSchool && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-left animate-pulse">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-black text-red-700 uppercase tracking-wider">
              ⚠️ Workspace Assignment Missing Alert
            </h5>
            <p className="text-[11px] text-slate-700 mt-1 font-semibold leading-relaxed">
              Alert: You do not have a registered school workspace assigned to your faculty profile. Please contact an Administrative supervisor or your school Principal to authorize and register your workspace. As a teacher, you can view the active schools directory list but you cannot add, register or modify schools yourself.
            </p>
          </div>
        </div>
      )}

      {teacherBatches.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h4 className="font-bold text-slate-700">No Batches Assigned</h4>
          <p className="text-xs text-slate-400 mt-1">Please log in as Administrator to assign a batch to {activeTeacher.name}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Hamburger Mobile Menu bar */}
          <div className={`${hideSidebarOnDesktop ? "hidden" : "lg:hidden col-span-1"} flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-xs no-print`}>
            <div className="flex items-center space-x-2">
              <Menu className="w-4 h-4 text-indigo-505 text-indigo-500" />
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider animate-fadeIn">
                Menu: {activeTab}
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

          {/* Section: Batch Selector Panel (Standard Left Sidebar layout) */}
          <div className={`${hideSidebarOnDesktop ? "hidden" : "lg:col-span-3"} space-y-4 no-print lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto no-scrollbar`}>
            <div className={`bg-slate-50 p-4 lg:p-5 rounded-2xl border border-slate-250 shadow-sm ${
              isMobileMenuOpen ? "block" : "hidden lg:block"
            }`}>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                Your Tutorials / Classes ({teacherBatches.length})
              </label>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-1 lg:pb-0">
                {teacherBatches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBatchId(b.id);
                      setGeneratedEvaluationHtml("");
                      setGeneratedLessonMarkdown("");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-left p-3 lg:p-4 rounded-xl border transition-all shrink-0 w-52 lg:w-full cursor-pointer font-bold uppercase tracking-wider ${
                      currentBatchId === b.id 
                        ? "bg-red-600 border-red-600 text-white shadow-xs hover:bg-black hover:border-black hover:text-white" 
                        : "bg-white border-slate-200 text-slate-800 hover:bg-black hover:border-black hover:text-white"
                    }`}
                  >
                    <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded transition-colors ${
                      currentBatchId === b.id ? "bg-white text-red-650" : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {b.code}
                    </span>
                    <h5 className="font-extrabold text-slate-850 text-sm mt-1.5 truncate">{b.name}</h5>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{b.schedule}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub navigation within the selected batch */}
            {currentBatch && (
              <div className={`bg-slate-50 p-3 lg:p-4 rounded-2xl border border-slate-250 shadow-sm ${
                isMobileMenuOpen ? "flex flex-col animate-fadeIn" : "hidden lg:flex lg:flex-col"
              } gap-1.5`}>
                <button
                  onClick={() => {
                    setActiveTab("lessons");
                    setIsMobileMenuOpen(false);
                  }}
                  className={getMenuBtnStyle("lessons")}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Syllabus & AI Lessons</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("tests");
                    setIsMobileMenuOpen(false);
                  }}
                  className={getMenuBtnStyle("tests")}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Gradebooks & Marks</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("grading");
                    setIsMobileMenuOpen(false);
                  }}
                  className={getMenuBtnStyle("grading")}
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>AI Diagnostic Reports</span>
                </button>
                {/* Lab Allotment and computer registration is disabled for teachers as per client request */}
                {!isNoticeboardAdminOnly && (
                  <button
                    onClick={() => {
                      setActiveTab("announcements");
                      setIsMobileMenuOpen(false);
                    }}
                    className={getMenuBtnStyle("announcements")}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Cohort Announcements</span>
                  </button>
                )}
              </div>
            )}

            <div className={`bg-slate-50 p-3 lg:p-4 rounded-2xl border border-slate-250 shadow-sm ${
              isMobileMenuOpen ? "flex flex-col animate-fadeIn" : "hidden lg:flex lg:flex-col"
            } gap-1.5`}>
              <button
                onClick={() => {
                  setActiveTab("overview");
                  setIsMobileMenuOpen(false);
                }}
                className={getMenuBtnStyle("overview")}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>My Batches Overview</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("scanner");
                  setIsMobileMenuOpen(false);
                }}
                className={getMenuBtnStyle("scanner")}
                id="tab-teacher-scanner"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Attendance Desk</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("apaar-management");
                  setIsMobileMenuOpen(false);
                }}
                className={getMenuBtnStyle("apaar-management")}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>APAAR Registrar</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("student-management");
                  setIsMobileMenuOpen(false);
                }}
                className={getMenuBtnStyle("student-management")}
                id="tab-teacher-student-management"
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span>Add Student Desk</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("admissions");
                  setIsMobileMenuOpen(false);
                }}
                className={getMenuBtnStyle("admissions")}
                id="tab-teacher-admissions"
              >
                <ClipboardList className="w-3.5 h-3.5 shrink-0 text-purple-500" />
                <span>Online Admission</span>
                {admissionRequests.filter(r => r.teacherId === loggedInTeacherId).length > 0 && (
                  <span className={`font-mono text-[9px] font-black ml-auto px-1.5 py-0.5 rounded-full transition-all ${
                    activeTab === "admissions" ? "bg-purple-100 text-purple-800" : "bg-purple-600 text-white"
                  }`}>
                    {admissionRequests.filter(r => r.teacherId === loggedInTeacherId).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab("counselling");
                  setIsMobileMenuOpen(false);
                }}
                className={getMenuBtnStyle("counselling")}
                id="tab-teacher-counselling"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                <span>Online Counselling</span>
                {counsellingRequests.filter(r => r.status === "Pending").length > 0 && (
                  <span className={`font-mono text-[9px] font-black ml-auto px-1.5 py-0.5 rounded-full animate-pulse transition-all ${
                    activeTab === "counselling" ? "bg-indigo-100 text-indigo-800" : "bg-indigo-600 text-white"
                  }`}>
                    {counsellingRequests.filter(r => r.status === "Pending").length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab("profile");
                  setProfileSuccessMsg("");
                  setIsMobileMenuOpen(false);
                }}
                className={getMenuBtnStyle("profile")}
                id="tab-teacher-profile"
              >
                <User className="w-3.5 h-3.5" />
                <span>Teacher Profile</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("schools" as any);
                  setIsMobileMenuOpen(false);
                }}
                className={getMenuBtnStyle("schools")}
                id="tab-teacher-schools"
              >
                <School className="w-3.5 h-3.5 text-red-500" />
                <span>Affiliated Schools Directory</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("createTest");
                  setIsMobileMenuOpen(false);
                }}
                className={getMenuBtnStyle("createTest")}
                id="tab-teacher-create-test"
              >
                <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Create Mock/Exam</span>
              </button>
            </div>

            {/* NEW Portal Side Section */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-4 font-sans relative overflow-hidden">
              {/* Subtle decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl" />
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span>Faculty Portal Hud</span>
                </span>
                <span className="text-[9px] bg-indigo-900/50 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400">Class Load:</span>
                  <span className="font-bold text-slate-200">{teacherBatches.length} Batches</span>
                </div>
                
                <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400">Security Ring:</span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[9px] uppercase">
                    Authorized Faculty
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400">Syllabus Scope:</span>
                  <span className="font-mono text-[10px] text-emerald-400 font-bold">
                    {currentBatch?.subject || "Computer Science / Core"}
                  </span>
                </div>
              </div>

              <div className="pt-1.5">
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                  ⚡ Use our integrated artificial intelligence to draft customized, structured lecture module syllabi dynamically.
                </p>
              </div>
            </div>

          </div>

          {/* Section: Main Interactive Workspace */}
          <div className={`${hideSidebarOnDesktop ? "lg:col-span-12" : "lg:col-span-9"} space-y-6`}>
            {activeTab !== "profile" && activeTab !== "fees" && activeTab !== "scanner" && activeTab !== "support" && activeTab !== "overview" && !currentBatch ? (
              <div className="bg-slate-50 p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                <p className="text-slate-500 font-medium">Please select a cohort batch on the left grid panel to proceed.</p>
              </div>
            ) : (
              <div>
                
                {/* 0. MY BATCHES OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <div className="space-y-6 text-left animate-fadeIn">
                    
                    {/* Header Block */}
                    <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3.5 text-left">
                        <div className="p-3 bg-indigo-500/15 rounded-xl text-indigo-400 font-bold border border-indigo-500/10 shrink-0">
                          <UserPlus className="w-6 h-6 text-indigo-400 animate-pulse" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 font-sans">
                            Teacher Admission Registry & Cohorts Overview
                          </h4>
                          <p className="text-xs text-slate-350 mt-1 font-sans">
                            Review course sections, check student rosters, and directly enroll new students into active cohorts with your registrar privileges.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab("student-management")}
                        className="bg-indigo-600 hover:bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer flex items-center space-x-2 shrink-0 border border-indigo-400/20"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Onboard Student</span>
                      </button>
                    </div>

                    {/* FACULTY SOS PANIC ALARM BOARD */}
                    <div className="bg-red-50 p-5 rounded-3xl border border-red-200 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono tracking-widest font-black uppercase text-red-650 bg-red-100 border border-red-200 px-2.5 py-0.5 rounded-md">EMERGENCY SOS OVERRIDE</span>
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Active Faculty Distress Triggers</h4>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                            In case of physical disturbances, classroom intrusions, student medical crises, or extreme security threats, push the panic button below to dispatch immediate supervisor alarms.
                          </p>
                        </div>
                        
                        <div className="shrink-0">
                          <button
                            onClick={() => {
                              // toggle inline form
                              const form = document.getElementById("teacher-sos-form");
                              if (form) form.classList.toggle("hidden");
                            }}
                            className="px-4 py-2.5 bg-red-650 hover:bg-red-750 text-white font-extrabold uppercase tracking-widest text-[10.5px] rounded-xl transition shadow-lg shrink-0 cursor-pointer flex items-center space-x-1"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                            <span>EMIT SOS BEACON</span>
                          </button>
                        </div>
                      </div>

                      {/* SOS Input form */}
                      <div id="teacher-sos-form" className="hidden border-t border-red-200/80 pt-4 space-y-3 col-span-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9.5px] font-mono font-black text-slate-500 uppercase tracking-widest mb-1.5">Select SOS Distress Type</label>
                            <select
                              id="t-sos-type"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-red-500 text-slate-800 font-sans"
                            >
                              <option value="SOS">SOS Distress Beacon</option>
                              <option value="Medical Emergency">Medical Emergency</option>
                              <option value="Security Issue">Physical Intruder / Disturbance</option>
                              <option value="Panic Alarm">General Panic Alarm</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9.5px] font-mono font-black text-slate-500 uppercase tracking-widest mb-1.5">Distress Location / Physical Area</label>
                            <input
                              type="text"
                              id="t-sos-loc"
                              placeholder="e.g. Science Labs, Classroom B, Faculty Lounge"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-red-500 text-slate-800"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9.5px] font-mono font-black text-slate-500 uppercase tracking-widest mb-1.5">Distress Incident Details</label>
                          <textarea
                            id="t-sos-details"
                            rows={2}
                            placeholder="Provide details of the emergency e.g. Scholar experienced severe hyperventilation or sudden lab equipment power failure..."
                            className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs focus:outline-red-500 text-slate-800 resize-none font-sans"
                          />
                        </div>

                        <div className="flex justify-end space-x-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const form = document.getElementById("teacher-sos-form");
                              if (form) form.classList.add("hidden");
                            }}
                            className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 bg-white hover:bg-slate-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const typeEl = document.getElementById("t-sos-type") as HTMLSelectElement;
                              const locEl = document.getElementById("t-sos-loc") as HTMLInputElement;
                              const detEl = document.getElementById("t-sos-details") as HTMLTextAreaElement;
                              
                              if (typeEl && locEl && detEl) {
                                if (!locEl.value || !detEl.value) {
                                  alert("Please fill in the physical location and details of the distress emergency.");
                                  return;
                                }

                                const alertItem = {
                                  senderName: activeTeacher?.name || "Faculty Member",
                                  senderRole: "Teacher",
                                  senderId: selectedTeacherId,
                                  severity: "High",
                                  type: typeEl.value,
                                  location: locEl.value,
                                  details: detEl.value
                                };

                                // Write to local storage dynamically & dispatch so admins can synchronize
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
                                
                                // Let's invoke prop helper too if present
                                if (onTriggerSOS) {
                                  onTriggerSOS(alertItem);
                                }

                                alert("Distress Beacon transmitted! Administrators have been alerted immediately.");
                                locEl.value = "";
                                detEl.value = "";
                                const form = document.getElementById("teacher-sos-form");
                                if (form) form.classList.add("hidden");
                                window.location.reload();
                              }
                            }}
                            className="px-4 py-1.5 bg-red-650 hover:bg-red-750 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer"
                          >
                            CONFIRM TRANSMIT ALARM
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Active Alerts Feed */}
                    {(() => {
                      const allAlerts = (() => {
                        try {
                          return JSON.parse(localStorage.getItem("co_security_alerts") || "[]");
                        } catch(e) { return []; }
                      })();
                      const myActive = allAlerts.filter((a: any) => a.senderId === selectedTeacherId && !a.resolved);
                      if (myActive.length > 0) {
                        return (
                          <div className="bg-red-50/40 border border-red-150 p-4 rounded-2xl">
                            <h5 className="text-[10px] font-mono font-black text-red-650 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                              Your Live Distress Signals Outgoing:
                            </h5>
                            <div className="space-y-1.5 mt-2">
                              {myActive.map((a: any, i: number) => (
                                <div key={i} className="text-xs bg-white p-3 rounded-lg border border-red-100 flex justify-between items-start font-sans">
                                  <div>
                                    <span className="font-bold text-red-650 text-[11px]">🚨 {a.location} - {a.type}</span>
                                    <p className="text-slate-500 text-[10.5px] mt-0.5">{a.details}</p>
                                  </div>
                                  <span className="text-[8.5px] font-mono bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded animate-pulse">TRANSMITTING</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Teacher Batches Catalogs */}
                    {teacherBatches.length === 0 ? (
                      <div className="bg-slate-50 p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                        <p className="text-slate-500 font-medium">You are not currently allocated as the primary instructor for any cohort.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {teacherBatches.map(b => {
                          const enrolledScholars = students.filter(s => b.studentIds?.includes(s.id));
                          const cohortLessons = lessons.filter(l => l.batchId === b.id);
                          return (
                            <div 
                              key={b.id} 
                              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative"
                              style={{ contentVisibility: "auto" }}
                            >
                              {/* Header accent */}
                              <div className="h-1.5 w-full bg-indigo-600" />
                              
                              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                <div>
                                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <span className="text-[9px] font-mono leading-none tracking-wider uppercase text-indigo-600 dark:text-indigo-400 font-black">
                                      {b.code}
                                    </span>
                                    <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-bold uppercase">
                                      Class Assigned
                                    </span>
                                  </div>

                                  <h5 className="font-extrabold text-slate-850 dark:text-white text-base mt-2.5 leading-snug uppercase tracking-tight">
                                    {b.name}
                                  </h5>
                                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-black tracking-wide uppercase">
                                    {b.subject}
                                  </span>

                                  {/* Grid metrics row */}
                                  <div className="mt-4 grid grid-cols-2 gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                                    <div className="bg-slate-50 dark:bg-slate-850 p-2 rounded-xl flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300">
                                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span className="font-semibold truncate">{b.schedule}</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-850 p-2 rounded-xl flex items-center space-x-1.5 text-xs text-indigo-600 dark:text-indigo-400">
                                      <ClipboardList className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                      <span className="font-black">{enrolledScholars.length} Enrolled</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Scholar ledger list snippet */}
                                <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800 space-y-1.5 text-[10px]">
                                  <span className="block text-[8px] font-extrabold text-slate-500 uppercase tracking-widest">
                                    Assigned Batch Roster ({enrolledScholars.length})
                                  </span>
                                  {enrolledScholars.length === 0 ? (
                                    <p className="text-slate-400 italic">No students allocated yet.</p>
                                  ) : (
                                    <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto pr-1 no-scrollbar">
                                      {enrolledScholars.map(s => (
                                        <span 
                                          key={s.id} 
                                          className="inline-flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-350 px-2 py-0.5 rounded text-[9px] font-bold"
                                        >
                                          {s.name} ({s.rollNo})
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Study Modules scope and launch buttons */}
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">
                                    {cohortLessons.length} syllabus lessons
                                  </span>
                                  
                                  <button
                                    onClick={() => {
                                      setSelectedBatchId(b.id);
                                      setActiveTab("lessons");
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-colors shadow-xs cursor-pointer flex items-center space-x-1"
                                  >
                                    <span>Workspace</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                
                {/* 1. LESSONS TAB */}
                {activeTab === "lessons" && (
                  <div className="space-y-6">
                    
                    {/* AI Lesson Generator Tool */}
                    <div className="bg-gradient-to-r from-indigo-50 to-sky-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
                      <div className="flex items-center space-x-2.5 mb-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                          <BrainCircuit className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm tracking-tight">AI Co-Pilot: Generation of Lecture Study Materials</h4>
                          <p className="text-xs text-slate-500">Produce comprehensive textbooks, step-by-step math workouts, or organic chemistry concepts.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Target Topic</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Fundamental Theorem of Calculus PART 2"
                            value={aiTopic}
                            onChange={e => setAiTopic(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Academic Grade Target</label>
                          <select 
                            value={aiGradeLevel}
                            onChange={e => setAiGradeLevel(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-500"
                          >
                            <option value="High School Intermediate">High School Level</option>
                            <option value="Pre-Engineering Advanced Level">National Exam / Advanced Level</option>
                            <option value="Competitive Aptitude Test Prep">Competitive Aptitude</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-between items-center gap-4">
                        <span className="text-[10px] text-indigo-400 font-medium">✨ Powered by server-side Gemini-3.5-Flash</span>
                        <button
                          onClick={generateAiLesson}
                          disabled={isGeneratingLesson || !aiTopic}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-colors shrink-0 flex items-center space-x-2"
                        >
                          {isGeneratingLesson ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Structuring Concepts...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Generate Study Module</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Display AI output */}
                      {generatedLessonMarkdown && (
                        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm max-h-96 overflow-y-auto">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Concept Blueprint Draft Prepared!</span>
                            <button
                              onClick={saveGeneratedLessonToBatch}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg"
                            >
                              Publish to Batch Syllabus
                            </button>
                          </div>
                          
                          <div className="markdown-body prose max-w-none text-slate-700 text-xs leading-relaxed space-y-2">
                            <ReactMarkdown>{generatedLessonMarkdown}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Manual Syllabus Addition Section */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Active Batch Lessons ({currentBatchLessons.length})</h4>
                        <button 
                          onClick={() => setShowAddManual(!showAddManual)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{showAddManual ? "Hide form" : "Draft Syllabus Element"}</span>
                        </button>
                      </div>

                      {showAddManual && (
                        <form onSubmit={handleManualAddLesson} className="space-y-4 border-2 border-slate-100 p-4 rounded-xl bg-slate-50/50">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Lesson Topic Title</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Introduction to Newton laws of conservation"
                              value={manualTitle}
                              onChange={e => setManualTitle(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Topic Sub-title Summary</label>
                            <input 
                              type="text" 
                              placeholder="Key themes discussed..."
                              value={manualDesc}
                              onChange={e => setManualDesc(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Lesson Syllabus Material (Markdown text)</label>
                            <textarea 
                              rows={5}
                              placeholder="Draft formulas, steps and practice questions here..."
                              value={manualContent}
                              onChange={e => setManualContent(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs resize-none"
                            />
                          </div>
                          <button 
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg"
                          >
                            Save manual lesson as draft
                          </button>
                        </form>
                      )}

                      {/* Lesson entries catalog */}
                      {currentBatchLessons.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No syllabus elements found. Use our AI model at the top to draft one instantly!</p>
                      ) : (
                        <div className="space-y-3.5">
                          {currentBatchLessons.map(lesson => (
                            <div key={lesson.id} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50/30">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h5 className="font-bold text-slate-800 text-sm">{lesson.title}</h5>
                                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                                      lesson.status === "Published" ? "bg-indigo-100 text-indigo-700" :
                                      lesson.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                                      "bg-slate-100 text-slate-600"
                                    }`}>
                                      {lesson.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5">{lesson.description}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <select
                                    value={lesson.status}
                                    onChange={e => onUpdateLessonStatus(lesson.id, e.target.value as any)}
                                    className="bg-white border border-slate-200 text-[10px] uppercase font-bold text-slate-600 rounded px-2 py-1"
                                  >
                                    <option value="Draft">Draft</option>
                                    <option value="Published">Publish</option>
                                    <option value="Completed">Complete</option>
                                  </select>
                                  <button
                                    onClick={() => {
                                      if(confirm("Confirm deletion of this lesson element?")) {
                                        onDeleteLesson(lesson.id);
                                      }
                                    }}
                                    className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Simple attendance checkbox tracker for completed or ongoing lessons */}
                              <div className="mt-4 pt-3 border-t border-slate-50/60">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                  Lecture Attendance Registry ({enrolledStudentsInBatch.length} enrolled)
                                </span>
                                <div className="flex flex-wrap gap-3">
                                  {enrolledStudentsInBatch.map(s => {
                                    const attended = lesson.attendance[s.id] ?? false;
                                    return (
                                      <label key={s.id} className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 px-2.5 py-1 rounded-lg cursor-pointer text-xs">
                                        <input 
                                          type="checkbox"
                                          checked={attended}
                                          onChange={() => onUpdateAttendance(lesson.id, s.id, !attended)}
                                          className="rounded text-indigo-600 focus:ring-indigo-400 w-3.5 h-3.5"
                                        />
                                        <span className="text-[11px] text-slate-600 font-medium">{s.name.split(" ")[0]}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. TESTS AND SCORES GRADING TAB */}
                {activeTab === "tests" && (
                  <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-4">Record Mock Assessment / Test Marks</h4>

                    <form onSubmit={handleCreateTest} className="space-y-6 border-b border-slate-100 pb-6 mb-6 text-left">
                      
                      {/* Architecture Mode selection fields */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100/80 space-y-3">
                        <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Test Architecture Mode</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <button
                            type="button"
                            onClick={() => setTestType("standard")}
                            className={`p-3.5 rounded-xl border-2 text-xs font-bold transition-all text-left flex justify-between items-center cursor-pointer ${
                              testType === "standard" 
                                ? "bg-white dark:bg-slate-850 text-slate-900 dark:text-white border-slate-900 dark:border-indigo-500 shadow-sm" 
                                : "bg-slate-100/50 dark:bg-slate-850/40 text-slate-500 border-transparent hover:bg-slate-100"
                            }`}
                          >
                            <div>
                              <p className="font-extrabold text-xs">Standard Grade Tracker</p>
                              <p className="text-[10px] text-slate-400 font-normal mt-0.5">Simply record & post final paper marks manually.</p>
                            </div>
                            <span className="text-lg">📝</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setTestType("quiz");
                              setTestMaxMarks(0); // auto-calculate based on question weights
                            }}
                            className={`p-3.5 rounded-xl border-2 text-xs font-bold transition-all text-left flex justify-between items-center cursor-pointer ${
                              testType === "quiz" 
                                ? "bg-white dark:bg-slate-850 text-slate-900 dark:text-white border-slate-900 dark:border-indigo-500 shadow-sm" 
                                : "bg-slate-100/50 dark:bg-slate-850/40 text-slate-500 border-transparent hover:bg-slate-100"
                            }`}
                          >
                            <div>
                              <p className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">Secure Live Exam Paper</p>
                              <p className="text-[10px] text-slate-400 font-normal mt-0.5">Build sections, questions, and auto-grade responses.</p>
                            </div>
                            <span className="text-lg">🖥️</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Assessment Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Kinematics Secure Live Quiz"
                            value={testTitle}
                            onChange={e => setTestTitle(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-indigo-500 focus:bg-white text-slate-850"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Subject Tag *</label>
                          <select
                            value={selectedSubject}
                            onChange={e => {
                              if (e.target.value === "__NEW__") {
                                setShowSubjectInput(true);
                              } else {
                                setSelectedSubject(e.target.value);
                                setShowSubjectInput(false);
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-indigo-505 focus:bg-white text-slate-850 font-bold"
                          >
                            <option value="">-- No Subject Tag --</option>
                            {subjects.map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                            <option value="__NEW__" className="text-red-600 font-bold">+ Register New Subject...</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">
                            {testType === "quiz" ? "Max Marks (Calculated)" : "Maximum Marks"}
                          </label>
                          <input 
                            type="number" 
                            value={testType === "quiz" ? (questionsToCreate.reduce((sum, q) => sum + (q.markWeight || 0), 0)) : testMaxMarks}
                            onChange={e => setTestMaxMarks(Number(e.target.value))}
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-650 cursor-not-allowed font-bold"
                            disabled={testType === "quiz"}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Assessment Date</label>
                          <input 
                            type="date" 
                            value={testDate}
                            onChange={e => setTestDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-indigo-505 focus:bg-white text-slate-850"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 bg-slate-50 p-4 rounded-xl border border-slate-150">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                            <span>🔑 Secure Exam Access Key</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. CHEM-QUIZ-101 (Optional)"
                            value={testExamKey}
                            onChange={e => setTestExamKey(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-indigo-500 text-slate-805 font-mono tracking-wider font-extrabold"
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            🔒 <strong>Secured Access:</strong> If set, students must enter this EXACT key to unlock the exam questions. You can view, edit and copy this key at any time from your test registry list below.
                          </p>
                        </div>
                      </div>

                      {showSubjectInput && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-250 flex items-center gap-3 animate-fadeIn">
                          <div className="flex-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">New Subject Name</label>
                            <input
                              type="text"
                              value={customSubjectName}
                              onChange={e => setCustomSubjectName(e.target.value)}
                              placeholder="e.g. Organic Chemistry, Real Analysis"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (customSubjectName.trim()) {
                                onAddSubject?.(customSubjectName.trim());
                                setSelectedSubject(customSubjectName.trim());
                                setCustomSubjectName("");
                                setShowSubjectInput(false);
                              }
                            }}
                            className="bg-red-600 hover:bg-black text-white hover:text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase cursor-pointer transition-all shrink-0 mt-4"
                          >
                            Add & Select
                          </button>
                        </div>
                      )}

                      {testType === "standard" ? (
                        /* Standard Score grading map inputs form */
                        <div className="bg-slate-50/50 p-4 rounded-xl space-y-3">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Configure Student Mark Book</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {enrolledStudentsInBatch.map(student => (
                              <div key={student.id} className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                                <span className="text-xs font-semibold text-slate-700">{student.name}</span>
                                <div className="flex items-center space-x-2">
                                  <input 
                                    type="number"
                                    placeholder="0"
                                    max={testMaxMarks}
                                    value={newScores[student.id] ?? ""}
                                    onChange={e => setNewScores({ ...newScores, [student.id]: Number(e.target.value) })}
                                    className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-center font-bold text-indigo-700"
                                    min={0}
                                  />
                                  <span className="text-[10px] text-slate-400">/ {testMaxMarks}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Secure Quiz Question builder and list view form */
                        <div className="space-y-4 border-2 border-indigo-150/40 p-4 rounded-2xl bg-indigo-50/10">
                          
                          {/* Added questions list preview list */}
                          <div>
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-2">Drafted Exam Questions ({questionsToCreate.length})</span>
                            {questionsToCreate.length === 0 ? (
                              <p className="text-[11px] text-slate-400 italic">No questions added to the test paper yet. Use the question generator fields below.</p>
                            ) : (
                              <div className="space-y-2">
                                {questionsToCreate.map((q, idx) => (
                                  <div key={idx} className="bg-white border border-slate-150 rounded-xl p-3 flex justify-between items-center text-xs">
                                    <div className="space-y-1">
                                      <div className="flex items-center space-x-2">
                                        <span className="bg-indigo-600 text-white text-[9px] font-mono px-2 py-0.5 rounded font-black uppercase">Q-{idx+1}</span>
                                        <span className="bg-slate-100 text-slate-500 text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase">{q.sectionName}</span>
                                        <span className="bg-amber-100 text-amber-800 text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase">{q.type}</span>
                                      </div>
                                      <p className="font-extrabold text-slate-800 mt-1">{q.questionText}</p>
                                      {q.options && (
                                        <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 mt-1">
                                          <span>A: {q.options[0]}</span>
                                          <span>B: {q.options[1]}</span>
                                          <span>C: {q.options[2]}</span>
                                          <span>D: {q.options[3]}</span>
                                        </div>
                                      )}
                                      <p className="text-[10px] font-black text-emerald-600">Correct Answer: {q.correctAnswer}</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <span className="font-mono font-black text-indigo-650 bg-indigo-50 px-2 py-1 rounded">{q.markWeight} Marks</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setQuestionsToCreate(questionsToCreate.filter((_, i) => i !== idx));
                                        }}
                                        className="text-red-500 hover:text-red-700 cursor-pointer p-1 rounded hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Interactive single question builder inputs */}
                          <div className="bg-white border border-slate-150 p-4 rounded-xl space-y-3.5 pt-4">
                            <span className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-1.5 mb-2">Create New Question Entry</span>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subject / Section Title</label>
                                <select 
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-800"
                                  value={curQSection}
                                  onChange={e => setCurQSection(e.target.value)}
                                >
                                  <option value="Computer Science Core">Computer Science Core</option>
                                  <option value="Electronics & Circuits">Electronics & Circuits</option>
                                  <option value="Physical Chemistry">Physical Chemistry</option>
                                  <option value="Pure Mathematics">Pure Mathematics</option>
                                  <option value="General Engineering">General Engineering</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Question Type format</label>
                                <select 
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-800"
                                  value={curQType}
                                  onChange={e => setCurQType(e.target.value as any)}
                                >
                                  <option value="MCQ">Multiple Choice (MCQ)</option>
                                  <option value="True/False">True / False</option>
                                  <option value="Written">Short subjective Written</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mark Weight Value</label>
                                <input 
                                  type="number"
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-850"
                                  min={1}
                                  value={curQWeight}
                                  onChange={e => setCurQWeight(Number(e.target.value))}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Question Description text *</label>
                              <input 
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-850 focus:bg-white"
                                placeholder="Write the main question question text here..."
                                value={curQText}
                                onChange={e => setCurQText(e.target.value)}
                              />
                            </div>

                            {curQType === "MCQ" && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800"
                                  placeholder="Option A"
                                  value={curQOptA}
                                  onChange={e => setCurQOptA(e.target.value)}
                                />
                                <input
                                  type="text"
                                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800"
                                  placeholder="Option B"
                                  value={curQOptB}
                                  onChange={e => setCurQOptB(e.target.value)}
                                />
                                <input
                                  type="text"
                                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800"
                                  placeholder="Option C"
                                  value={curQOptC}
                                  onChange={e => setCurQOptC(e.target.value)}
                                />
                                <input
                                  type="text"
                                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800"
                                  placeholder="Option D"
                                  value={curQOptD}
                                  onChange={e => setCurQOptD(e.target.value)}
                                />
                              </div>
                            )}

                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                {curQType === "Written" ? "Expected Model Answer Keywords (e.g. friction, gravity)" : "Correct Answer Select **"}
                              </label>
                              {curQType === "MCQ" ? (
                                <select
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-800"
                                  value={curQAnswer}
                                  onChange={e => setCurQAnswer(e.target.value)}
                                >
                                  <option value="">-- Choose Option --</option>
                                  <option value="A">Option A</option>
                                  <option value="B">Option B</option>
                                  <option value="C">Option C</option>
                                  <option value="D">Option D</option>
                                </select>
                              ) : curQType === "True/False" ? (
                                <select
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-800"
                                  value={curQAnswer}
                                  onChange={e => setCurQAnswer(e.target.value)}
                                >
                                  <option value="">-- Choose State --</option>
                                  <option value="True">True</option>
                                  <option value="False">False</option>
                                </select>
                              ) : (
                                <input 
                                  type="text"
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                                  placeholder="e.g. vector velocity kinetic energy"
                                  value={curQAnswer}
                                  onChange={e => setCurQAnswer(e.target.value)}
                                />
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (!curQText.trim()) {
                                  alert("Please specify the question text!");
                                  return;
                                }
                                if (curQType === "MCQ" && (!curQOptA || !curQOptB || !curQAnswer)) {
                                  alert("MCQ requires Option A, Option B and a clear designated answer!");
                                  return;
                                }
                                if (curQType === "True/False" && !curQAnswer) {
                                  alert("True/False requires a designated answer!");
                                  return;
                                }

                                const newQ: any = {
                                  id: "q_" + Date.now() + Math.random().toString(36).substring(2, 5),
                                  questionText: curQText.trim(),
                                  type: curQType,
                                  sectionName: curQSection,
                                  markWeight: curQWeight,
                                  correctAnswer: curQAnswer
                                };

                                if (curQType === "MCQ") {
                                  newQ.options = [curQOptA.trim(), curQOptB.trim(), curQOptC.trim() || "", curQOptD.trim() || ""];
                                }

                                setQuestionsToCreate([...questionsToCreate, newQ]);
                                
                                // Reset single builder states
                                setCurQText("");
                                setCurQOptA("");
                                setCurQOptB("");
                                setCurQOptC("");
                                setCurQOptD("");
                                setCurQAnswer("");
                              }}
                              className="bg-indigo-650 hover:bg-indigo-800 text-white font-extrabold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-lg flex items-center space-x-1 duration-200 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Include question to test paper</span>
                            </button>
                          </div>

                          {/* Security Options control board */}
                          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <Shield className="w-5 h-5 text-indigo-400 animate-pulse" />
                              <div>
                                <p className="text-xs font-black uppercase text-indigo-400">Secure Live Sandbox Environment</p>
                                <p className="text-[10px] text-slate-300">Requires verified workspace IP and supervisor desk allot code authorization.</p>
                              </div>
                            </div>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isTestSecureLive}
                                onChange={() => setIsTestSecureLive(!isTestSecureLive)}
                                className="rounded text-indigo-500 focus:ring-indigo-400 w-4 h-4 cursor-pointer"
                              />
                              <span className="text-[10px] font-black uppercase text-indigo-300">Live Secure Test</span>
                            </label>
                          </div>
                        </div>
                      )}

                      <button 
                        type="submit"
                        className="bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest duration-200 cursor-pointer text-center w-full"
                      >
                        {testType === "quiz" ? "Publish Dynamic Live exam to All Portals" : "Publish Test Results to Student Portals"}
                      </button>
                    </form>

                    {/* Pre-existing Marks logs */}
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 pb-2 border-b border-slate-100">
                        <h5 className="text-xs font-bold text-slate-500 uppercase">Published Assessment Score Sheets</h5>
                        
                        {/* Subject Filter */}
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Filter by Subject:</span>
                          <select
                            value={testFilterSubject}
                            onChange={e => setTestFilterSubject(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                          >
                            <option value="all">All Subjects</option>
                            {subjects.map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {currentBatchTests.filter(t => testFilterSubject === "all" || t.subject === testFilterSubject).length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No previous test registers match the filtered subject for this batch.</p>
                      ) : (
                        <div className="space-y-4">
                          {currentBatchTests
                            .filter(t => testFilterSubject === "all" || t.subject === testFilterSubject)
                            .map(testObj => {
                              const isEditingThis = editingTestId === testObj.id;

                              if (isEditingThis) {
                                return (
                                  <div key={testObj.id} className="border-2 border-indigo-500 rounded-xl p-5 bg-indigo-50/10 text-left space-y-4 shadow-sm animate-fadeIn">
                                    <div className="flex justify-between items-center pb-2 border-b border-indigo-150">
                                      <h6 className="font-extrabold text-slate-800 text-xs">🛠️ Edit Assessment Details</h6>
                                      <span className="text-[10px] text-indigo-600 font-mono font-bold">ID: {testObj.id}</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                                      <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Assessment Title</label>
                                        <input
                                          type="text"
                                          value={editTestTitle}
                                          onChange={e => setEditTestTitle(e.target.value)}
                                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-indigo-500 font-bold"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Date</label>
                                        <input
                                          type="date"
                                          value={editTestDate}
                                          onChange={e => setEditTestDate(e.target.value)}
                                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-indigo-500"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Subject Tag</label>
                                        <input
                                          type="text"
                                          value={editTestSubject}
                                          onChange={e => setEditTestSubject(e.target.value)}
                                          placeholder="e.g. Science"
                                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-indigo-500"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">🔑 Secure Access Key</label>
                                        <input
                                          type="text"
                                          value={editTestExamKey}
                                          onChange={e => setEditTestExamKey(e.target.value)}
                                          placeholder="e.g. EXAM-KEY-101 (Optional)"
                                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-mono text-xs uppercase focus:outline-indigo-500 font-extrabold"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Maximum Marks</label>
                                        <input
                                          type="number"
                                          value={editTestMaxMarks}
                                          onChange={e => setEditTestMaxMarks(Number(e.target.value))}
                                          disabled={testObj.questions && testObj.questions.length > 0}
                                          className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 disabled:cursor-not-allowed text-xs focus:outline-indigo-505"
                                        />
                                        {testObj.questions && testObj.questions.length > 0 && (
                                          <p className="text-[9px] text-slate-400 italic mt-0.5">Calculated from dynamic live quiz questions weights.</p>
                                        )}
                                      </div>

                                      <div className="flex items-center space-x-2 pt-4">
                                        <input
                                          id={`edit-require-lab-${testObj.id}`}
                                          type="checkbox"
                                          checked={editTestRequireLab}
                                          onChange={e => setEditTestRequireLab(e.target.checked)}
                                          className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                                        />
                                        <label htmlFor={`edit-require-lab-${testObj.id}`} className="text-[10px] font-black uppercase text-slate-500 tracking-wider cursor-pointer">
                                          Require Lab Allotment 🖥️
                                        </label>
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (!editTestTitle.trim()) {
                                            alert("Title cannot be empty!");
                                            return;
                                          }
                                          onUpdateTest?.({
                                            ...testObj,
                                            title: editTestTitle,
                                            date: editTestDate,
                                            subject: editTestSubject || undefined,
                                            maxMarks: editTestMaxMarks,
                                            examKey: editTestExamKey || undefined,
                                            requireLabAllotment: editTestRequireLab,
                                          });
                                          setEditingTestId(null);
                                        }}
                                        className="bg-indigo-600 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase transition duration-150 cursor-pointer"
                                      >
                                        Save Changes
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingTestId(null)}
                                        className="bg-slate-100 hover:bg-slate-205 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold uppercase transition duration-150 cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div key={testObj.id} className="border border-slate-150 rounded-2xl p-5 bg-white shadow-xs text-left space-y-4">
                                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <h6 className="font-extrabold text-slate-900 text-xs">{testObj.title}</h6>
                                        {testObj.subject && (
                                          <span className="text-[9px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full uppercase">
                                            {testObj.subject}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-mono tracking-wider">{testObj.date}</span>
                                    </div>
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded">
                                      Max value: {testObj.maxMarks} marks
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-sans items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150/50">
                                    <div className="flex items-center space-x-1">
                                      <span className="font-bold text-slate-400 uppercase tracking-wider">Exam key:</span>
                                      {testObj.examKey ? (
                                        <span className="font-mono bg-yellow-50 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded font-black uppercase text-[10px] flex items-center space-x-1">
                                          <span>🔑 {testObj.examKey}</span>
                                        </span>
                                      ) : (
                                        <span className="italic text-slate-400">None set (Public Access)</span>
                                      )}
                                    </div>

                                    <div className="w-px h-3 bg-slate-200 hidden sm:block" />

                                    <div className="flex items-center space-x-1">
                                      <span className="font-bold text-slate-400 uppercase tracking-wider">Verification:</span>
                                      {testObj.requireLabAllotment ? (
                                        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded font-bold uppercase text-[9px]">
                                          🖥️ Lab PC Required
                                        </span>
                                      ) : (
                                        <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded uppercase text-[9px]">
                                          Any PC (Flexible)
                                        </span>
                                      )}
                                    </div>

                                    <div className="w-px h-3 bg-slate-200 hidden sm:block" />

                                    <div className="flex items-center space-x-1">
                                      <span className="font-bold text-slate-400 uppercase tracking-wider">Result status:</span>
                                      {testObj.isResultsPublished ? (
                                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                                          📢 Results Published
                                        </span>
                                      ) : (
                                        <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-bold uppercase text-[9px] border-dashed">
                                          🔇 Private (Unpublished)
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Actions Toolbar */}
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingTestId(testObj.id);
                                        setEditTestTitle(testObj.title || "");
                                        setEditTestSubject(testObj.subject || "");
                                        setEditTestMaxMarks(testObj.maxMarks || 100);
                                        setEditTestDate(testObj.date || "");
                                        setEditTestExamKey(testObj.examKey || "");
                                        setEditTestRequireLab(testObj.requireLabAllotment || false);
                                      }}
                                      className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-755 hover:text-black font-extrabold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider duration-150 cursor-pointer inline-flex items-center gap-1.5"
                                    >
                                      🖊 Edit Exam & Key
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextStatus = !testObj.isResultsPublished;
                                        onUpdateTest?.({
                                          ...testObj,
                                          isResultsPublished: nextStatus
                                        });
                                      }}
                                      className={`${
                                        testObj.isResultsPublished 
                                          ? "bg-rose-100 hover:bg-rose-200 text-rose-800" 
                                          : "bg-emerald-100 hover:bg-emerald-200 text-emerald-850"
                                      } font-extrabold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider duration-150 cursor-pointer inline-flex items-center gap-1.5`}
                                    >
                                      {testObj.isResultsPublished ? "🔇 Make Results Private" : "📢 Publish Results to Students"}
                                    </button>
                                  </div>

                                  <div className="mt-3 pt-3 border-t border-slate-100">
                                    <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Student Scoreboard Sheet</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      {enrolledStudentsInBatch.map(s => {
                                        const mark = testObj.scores[s.id] ?? "N/A";
                                        const percent = typeof mark === "number" ? ((mark / testObj.maxMarks) * 100).toFixed(0) : null;
                                        return (
                                          <div key={s.id} className="flex justify-between items-center bg-white border border-slate-100 p-2.5 rounded-lg">
                                            <span className="text-xs text-slate-600">{s.name.split(" ")[0]}</span>
                                            <span className="text-xs font-bold font-mono">
                                              {mark} {percent !== null && <span className="text-[10px] font-normal text-slate-400">({percent}%)</span>}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2.5 WORKSTATION ALLOTMENT & IDENTITY VERIFICATION TAB */}
                {activeTab === "verification" && (
                  <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left animate-fadeIn">
                    
                    {/* Header dashboard banner */}
                    <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">
                          Secure Desk Allotment Center
                        </h4>
                        <p className="text-[11px] text-slate-350 mt-1">
                          Verify students by Name & Roll number, and bind computer terminals. Run automatic or manual seat assignments.
                        </p>
                      </div>
                      <span className="text-[9px] font-mono bg-indigo-950 border border-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-lg uppercase shrink-0 font-bold tracking-wider">
                        Supervisor Station Control
                      </span>
                    </div>

                    {!currentBatch ? (
                      <p className="text-xs text-slate-400 italic">Please select an academic cohort first from the header selection bar.</p>
                    ) : (
                      <div className="space-y-5">
                        
                        {/* Summary overview of computer registries */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-slate-50 border border-slate-200/50 p-3.5 rounded-xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Available Terminals</span>
                            <p className="text-lg font-black text-slate-850 mt-1">
                              {computerDesks.filter(d => d.status === "Available").length} / {computerDesks.length} Free
                            </p>
                          </div>
                          <div className="bg-slate-50 border border-slate-200/50 p-3.5 rounded-xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Verified Students</span>
                            <p className="text-lg font-black text-emerald-650 mt-1">
                              {enrolledStudentsInBatch.filter(s => s.assignedComputerDeskCode).length} / {enrolledStudentsInBatch.length} Seated
                            </p>
                          </div>
                          <div className="bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-xl text-indigo-900">
                            <span className="text-[10px] font-bold text-indigo-500 uppercase">Automatic Registry</span>
                            <p className="text-xs font-bold leading-relaxed mt-1">
                              System picks first empty PC. Admin manages physical catalogs in Admin panel.
                            </p>
                          </div>
                        </div>

                        {/* Students seat allocation checklist */}
                        <div className="bg-white border text-left border-slate-150 rounded-2xl overflow-hidden mt-4">
                          <div className="bg-slate-50 border-b border-slate-150 p-4">
                            <h5 className="text-xs font-black uppercase text-slate-800">
                              Cohort Seat Binder ({enrolledStudentsInBatch.filter(s => s.isVerified).length} Verified of {enrolledStudentsInBatch.length} Enrolled)
                            </h5>
                            <p className="text-[10px] text-slate-450 mt-0.5">Physically check scholar ID card containing Name & Roll before seat commitment. Only officially verified candidates are eligible for computer seat allotment.</p>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-100 font-bold">
                                  <th className="p-3 font-semibold uppercase text-[9px] tracking-wider">Scholar Roll & Name</th>
                                  <th className="p-3 font-semibold uppercase text-[9px] tracking-wider">Verification status</th>
                                  <th className="p-3 font-semibold uppercase text-[9px] tracking-wider">Bound Terminal Code</th>
                                  <th className="p-3 font-semibold uppercase text-[9px] tracking-wider text-right">Desk Assignment action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {enrolledStudentsInBatch.filter(s => s.isVerified).length === 0 ? (
                                  <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                                      No verified students found in this cohort. Only students verified by the official Verifier can be allotted computer desks.
                                    </td>
                                  </tr>
                                ) : (
                                  enrolledStudentsInBatch.filter(s => s.isVerified).map(s => {
                                  const alreadySeated = s.assignedComputerDeskCode;
                                  
                                  // Local selection dropdown state key
                                  const selectId = `desk_sel_${s.id}`;
                                  const availableDesks = computerDesks.filter(d => d.status === "Available");

                                  return (
                                    <tr key={s.id} className="hover:bg-slate-50/50">
                                      {/* Student Identity verify details */}
                                      <td className="p-3">
                                        <div className="flex flex-col text-left">
                                          <span className="font-extrabold text-slate-850 text-xs">{s.name}</span>
                                          <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase mt-0.5">Roll: {s.rollNo}</span>
                                        </div>
                                      </td>

                                      {/* verification tag status */}
                                      <td className="p-3">
                                        {alreadySeated ? (
                                          <span className="bg-emerald-100 text-emerald-800 font-black text-[9px] px-2.5 py-0.5 rounded-md inline-flex items-center space-x-1 uppercase">
                                            <span>✓ Verified & Seat Engaged</span>
                                          </span>
                                        ) : (
                                          <span className="bg-amber-100 text-amber-800 font-black text-[9px] px-2.5 py-0.5 rounded-md inline-flex items-center space-x-1 uppercase">
                                            <span>⚠ Unverified / Vacant</span>
                                          </span>
                                        )}
                                      </td>

                                      {/* Active Seat binding */}
                                      <td className="p-3">
                                        {alreadySeated ? (
                                          <span className="font-mono text-[10px] font-black bg-slate-900 text-white px-2.5 py-1 rounded inline-block">
                                            💻 Terminal {s.assignedComputerDeskCode}
                                          </span>
                                        ) : (
                                          <span className="text-[10px] text-slate-400 italic">No assigned seat</span>
                                        )}
                                      </td>

                                      {/* Action Panel: Auto-allot or specific selection */}
                                      <td className="p-3 text-right">
                                        {alreadySeated ? (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (onVerifyStudentAndAllotDesk) {
                                                // Unassigning is done by calling with empty empty code
                                                onVerifyStudentAndAllotDesk(s.id, undefined);
                                              }
                                            }}
                                            className="bg-slate-100 hover:bg-rose-50 text-rose-600 font-black text-[9px] uppercase tracking-wider py-1.5 px-3 rounded-lg border border-transparent hover:border-rose-200 cursor-pointer"
                                          >
                                            De-allot & Release PC
                                          </button>
                                        ) : (
                                          <div className="flex items-center justify-end space-x-2">
                                            {/* Manual specific terminal dropdown selector */}
                                            <select
                                              id={selectId}
                                              className="bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-slate-800 max-w-[130px]"
                                              defaultValue=""
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                if (!val) return;
                                                if (onVerifyStudentAndAllotDesk) {
                                                  onVerifyStudentAndAllotDesk(s.id, val);
                                                }
                                                // reset select box
                                                e.target.value = "";
                                              }}
                                            >
                                              <option value="">-- Choose PC --</option>
                                              {availableDesks.map(d => (
                                                <option key={d.id} value={d.uniqueCode}>
                                                  {d.uniqueCode} ({d.roomNumber.replace("Lab", "")})
                                                </option>
                                              ))}
                                            </select>

                                            {/* Automatic pick PC */}
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (availableDesks.length === 0) {
                                                  alert("⚠️ Error: There are no free computer terminals vacant in the system! Register new nodes under Admin Dashboard first.");
                                                  return;
                                                }
                                                if (onVerifyStudentAndAllotDesk) {
                                                  // Auto selects first vacant desk
                                                  const targetDeskCode = availableDesks[0].uniqueCode;
                                                  onVerifyStudentAndAllotDesk(s.id, targetDeskCode);
                                                }
                                              }}
                                              className="bg-indigo-600 hover:bg-slate-900 text-white font-extrabold text-[9px] uppercase tracking-widest py-1.5 px-3 rounded-lg shadow-2xs cursor-pointer inline-flex items-center space-x-1"
                                            >
                                              <span>Auto Allot</span>
                                            </button>
                                          </div>
                                        )}
                                      </td>

                                    </tr>
                                  );
                                }))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                )}

                {/* PC LAB & DESK REGISTRATION TAB */}
                {activeTab === "computers" && (
                  <div className="space-y-6 text-left animate-fadeIn">
                    
                    {/* Header dashboard layout */}
                    <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3.5">
                        <div className="p-3 bg-indigo-500/15 rounded-xl text-indigo-400 font-bold border border-indigo-500/10">
                          <Monitor className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">
                            PC Lab & Desk Registry Console
                          </h4>
                          <p className="text-xs text-slate-350 mt-1">
                            Register physical computer terminals with unique codes, manage network IP assets, and execute real-time terminal lockout protocols.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono bg-indigo-950/40 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-md font-bold uppercase shrink-0">
                        Instructor Control Scope
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Form panel on left */}
                      <div className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                          <h5 className="text-xs font-black uppercase text-indigo-650">
                            {editingDesk ? "Modify Terminal Station" : "Register Unique PC Terminal"}
                          </h5>
                          <p className="text-[10px] text-slate-400">Specify network device keys and classroom locations securely.</p>
                        </div>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!newDeskCode.trim() || !newDeskIp.trim() || !newDeskRoom.trim()) {
                              alert("Please specify Desk Code, IP address, and Room Name");
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
                              className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono focus:outline-indigo-550 text-slate-850"
                              placeholder="e.g. LAB-PC-15"
                              required
                              value={newDeskCode}
                              onChange={(e) => setNewDeskCode(e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              IPv4 / Local Network IP *
                            </label>
                            <input
                              type="text"
                              className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono focus:outline-indigo-555 text-slate-850"
                              placeholder="e.g. 192.168.1.115"
                              required
                              value={newDeskIp}
                              onChange={(e) => setNewDeskIp(e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Laboratory Room *
                              </label>
                              <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold focus:outline-indigo-555 text-slate-850"
                                placeholder="e.g. Lab Alpha"
                                required
                                value={newDeskRoom}
                                onChange={(e) => setNewDeskRoom(e.target.value)}
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Dept / Faculty
                              </label>
                              <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold focus:outline-indigo-555 text-slate-850"
                                placeholder="e.g. Phy Department"
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
                              {editingDesk ? "Update Station Keys" : "Enroll PC Terminal"}
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
                        <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100/55 text-[10px] text-indigo-850 leading-relaxed font-sans mt-3">
                          <p className="font-bold">✨ Live Integration Policy</p>
                          <p className="mt-1">Computer terminals registered here become immediately checkable on the "Lab Seats & Verify" dynamic console for scanning QR identity cards and allocating desks with physical computer systems.</p>
                        </div>
                      </div>

                      {/* Terminals list on right */}
                      <div className="lg:col-span-8 space-y-6">
                        
                        {/* Computers Inventory */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h5 className="text-xs font-black uppercase text-slate-800 flex items-center space-x-1.5 animate-fadeIn">
                              <LayoutGrid className="w-4 h-4 text-slate-500" />
                              <span>Active Physical terminals list ({computerDesks.length})</span>
                            </h5>
                          </div>

                          {computerDesks.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs">
                              No PC terminals registered yet. Use the left console forms to enroll a workstation.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {computerDesks.map(desk => {
                                const studentAssigned = students.find(s => s.id === desk.currentStudentId);
                                return (
                                  <div 
                                    key={desk.id} 
                                    className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3 relative overflow-hidden text-left"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="text-[10px] bg-indigo-105 text-indigo-700 px-2.5 py-0.5 rounded-md font-mono font-black uppercase">
                                          {desk.uniqueCode}
                                        </span>
                                        <p className="text-xs font-extrabold text-slate-805 mt-1.5">{desk.roomNumber}</p>
                                        {desk.facultyName && (
                                          <p className="text-[10px] text-indigo-655 font-bold block">Faculty: {desk.facultyName}</p>
                                        )}
                                        <p className="text-[10px] text-slate-400 font-mono">IP Address: {desk.ipAddress}</p>
                                      </div>

                                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                        desk.status === "Available" ? "bg-emerald-100 text-emerald-800" :
                                        desk.status === "Occupied" ? "bg-indigo-100 text-indigo-800" :
                                        "bg-amber-100 text-amber-800"
                                      }`}>
                                        {desk.status}
                                      </span>
                                    </div>

                                    {/* Linked Student card info */}
                                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/50 space-y-1">
                                      <span className="block text-[8px] text-slate-450 uppercase font-black tracking-wider">Allotted Seat Scholar</span>
                                      {studentAssigned ? (
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="text-[10px] font-black text-slate-805">{studentAssigned.name}</p>
                                            <p className="text-[9px] text-indigo-650 font-bold font-mono">{studentAssigned.rollNo}</p>
                                          </div>
                                          <span className="text-[8px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold uppercase shrink-0">Live Active</span>
                                        </div>
                                      ) : (
                                        <p className="text-[9px] italic text-slate-400">Terminal currently vacant</p>
                                      )}
                                    </div>

                                    {/* Action Tools */}
                                    <div className="pt-2 border-t border-slate-200/50 flex justify-between items-center">
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
                                          <Edit3 className="w-3.5 h-3.5" />
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
                                          className={`px-2 py-1 rounded text-[9px] font-bold uppercase cursor-pointer ${
                                            desk.status === "Maintenance" ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                                          }`}
                                        >
                                          {desk.status === "Maintenance" ? "Activate" : "Maintenance"}
                                        </button>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm(`Do you want to delete computer terminal ${desk.uniqueCode}? This will free up any seated student session instantly.`)) {
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
                        <div className="bg-white border border-slate-205 rounded-2xl p-5 space-y-4 shadow-sm">
                          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h5 className="text-xs font-black uppercase text-rose-600 flex items-center space-x-1.5">
                                <Lock className="w-4 h-4 text-rose-600" />
                                <span>Real-time Workstation Session Locker</span>
                              </h5>
                              <p className="text-[10px] text-slate-400 mt-0.5">Protect exams by locking down a student terminal session instantly.</p>
                            </div>
                            <span className="text-[9px] font-mono bg-rose-50 text-rose-600 px-2 py-1 rounded font-bold uppercase shrink-0">
                              SUPERVISOR CONSOLE ACTIVE
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="bg-slate-50 text-slate-550 border-b border-slate-100">
                                  <th className="p-3 font-black uppercase text-[10px] tracking-wider">Scholar Name</th>
                                  <th className="p-3 font-black uppercase text-[10px] tracking-wider font-mono">Roll No</th>
                                  <th className="p-3 font-black uppercase text-[10px] tracking-wider">Assigned Seat</th>
                                  <th className="p-3 font-black uppercase text-[10px] tracking-wider">Console Status</th>
                                  <th className="p-3 font-black uppercase text-[10px] tracking-wider text-right">Emergency Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {students.map(s => {
                                  const isLocked = s.isLocked || false;
                                  return (
                                    <tr key={s.id} className="hover:bg-slate-50">
                                      <td className="p-3 font-extrabold text-slate-805">{s.name}</td>
                                      <td className="p-3 font-mono text-[10px] text-indigo-705 font-bold">{s.rollNo}</td>
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
                                          <span className="bg-red-655 text-white font-black text-[9px] px-2 py-0.5 rounded inline-flex items-center space-x-1">
                                            <span>🔒 LOCKED OUT</span>
                                          </span>
                                        ) : (
                                          <span className="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded inline-flex items-center space-x-1">
                                            <span>🟢 RUNNING</span>
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
                                              : "bg-red-655 hover:bg-red-705 text-white"
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
                                <h5 className="font-extrabold uppercase text-xs">Verify Admin Credentials</h5>
                              </div>
                              
                              <div className="text-xs text-slate-650 space-y-1.5 leading-relaxed">
                                <p>You are requesting to <strong>{lockoutModalAction ? "LOCK OUT" : "UNLOCK"}</strong> the physical workstation session for student:</p>
                                <p className="font-bold text-slate-800 font-mono bg-slate-50 p-2 rounded-xl border border-slate-100">
                                  {studentInstance.name} ({studentInstance.rollNo})
                                </p>
                                <p>Enter the master security <strong>Administrative Secret Key</strong> to authorize this supervisor override action:</p>
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
                                  <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2.5 rounded-xl border border-red-100">
                                    {lockoutErrorMsg}
                                  </p>
                                )}

                                <div className="flex space-x-2 pt-2">
                                  <button
                                    type="submit"
                                    className="flex-1 bg-red-650 hover:bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
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

                {/* 3. AI GRADING DIAGNOSTIC TAB */}
                {activeTab === "grading" && (() => {
                  const batchTestIds = currentBatchTests.map(t => t.id);
                  const batchSubmissions = testSubmissions?.filter(sub => batchTestIds.includes(sub.testId)) || [];
                  return (
                    <div className="space-y-6">
                    
                    {/* EXCLUSIVE SUBMISSIONS & PUBLISHING CONTROL PANEL */}
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
                      <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-extrabold text-sm text-slate-850 uppercase tracking-wider font-sans">
                            Live Submissions & Result Publisher
                          </h4>
                          <p className="text-xs text-slate-500 font-sans mt-0.5">
                            Review written answers, edit marks weights, generate feedback, and publish graded results to student portals.
                          </p>
                        </div>
                      </div>

                      {/* No Selected Test Grid or Table */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                        {/* Submissions Sidebar: Choose Test */}
                        <div className="lg:col-span-4 space-y-3">
                          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            Choose Active Assessment
                          </label>
                          <div className="space-y-2">
                            {currentBatchTests.filter(t => t.questions && t.questions.length > 0).length === 0 ? (
                              <p className="text-xs text-slate-400 italic">No custom interactive tests found in this batch yet.</p>
                            ) : (
                              currentBatchTests.filter(t => t.questions && t.questions.length > 0).map(t => {
                                const subs = batchSubmissions.filter(s => s.testId === t.id);
                                const pendingCount = subs.filter(s => !s.isPublished).length;
                                return (
                                  <button
                                    key={t.id}
                                    onClick={() => {
                                      setSelectedSubmissionsTestId(t.id);
                                      setGradingSubmissionId(null);
                                    }}
                                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                                      selectedSubmissionsTestId === t.id
                                        ? "bg-red-50 border-red-550 text-red-950 shadow-xs"
                                        : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                                    }`}
                                  >
                                    <div className="flex justify-between items-start w-full">
                                      <span className="text-xs font-black uppercase tracking-wider line-clamp-1">{t.title}</span>
                                      {t.subject && (
                                        <span className="text-[8px] bg-red-100 text-red-800 font-extrabold px-1.5 py-0.5 rounded-md uppercase">
                                          {t.subject}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex justify-between items-center w-full mt-2 text-[10px] text-slate-400 font-bold">
                                      <span>Date: {t.date}</span>
                                      <span className="bg-slate-100 text-slate-705 px-2 py-0.5 rounded font-mono">
                                        {subs.length} submissions ({pendingCount} pending)
                                      </span>
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Submissions Detail List or Active Submission Grading */}
                        <div className="lg:col-span-8 bg-slate-50/50 p-4 lg:p-5 rounded-2xl border border-slate-200 text-left">
                          {!selectedSubmissionsTestId ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-2">
                              <span className="text-3xl">📥</span>
                              <p className="text-xs font-bold uppercase tracking-wider">Select an assessment to review student answer sheets</p>
                            </div>
                          ) : (
                            (() => {
                              const activeTest = tests.find(t => t.id === selectedSubmissionsTestId);
                              if (!activeTest) return null;
                              const testSubs = batchSubmissions.filter(s => s.testId === selectedSubmissionsTestId);

                              if (gradingSubmissionId) {
                                // RENDER ACTIVE GRADING RESPONSE SHEET
                                const actSub = testSubs.find(s => s.id === gradingSubmissionId);
                                const actStud = students.find(s => s.id === actSub?.studentId);
                                if (!actSub || !actStud) return null;

                                return (
                                  <div className="space-y-5 animate-fadeIn">
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                      <div>
                                        <h5 className="text-[10px] text-red-650 uppercase font-black tracking-widest">Grading Assessment</h5>
                                        <h6 className="font-extrabold text-sm text-slate-800 mt-1">{activeTest.title}</h6>
                                        <span className="text-[10px] text-slate-500 font-medium font-sans">
                                          Candidate: <strong>{actStud.name}</strong> (Roll: {actStud.rollNo})
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => setGradingSubmissionId(null)}
                                        className="text-xs font-bold text-slate-505 hover:text-black uppercase px-2.5 py-1.5 bg-slate-200 hover:bg-slate-350 rounded-lg cursor-pointer transition-all"
                                      >
                                        Back to Candidates
                                      </button>
                                    </div>

                                    {/* Questions and Answers sheet list */}
                                    <div className="space-y-4">
                                      <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Response Index</h6>
                                      {activeTest.questions?.map((q, idx) => {
                                        const studAnswer = actSub.answers[q.id] || "(No Answer Submitted)";
                                        const isMCQ = q.type === "MCQ" || q.type === "True/False";
                                        const isCorrect = isMCQ && studAnswer === q.correctAnswer;
                                        
                                        // Auto calculate score if loaded or preconfigured
                                        const currentScoreVal = gradingScores[q.id] ?? (isMCQ ? (isCorrect ? q.markWeight || 5 : 0) : 0);

                                        return (
                                          <div key={q.id} className="bg-white border border-slate-200/85 p-4 rounded-xl space-y-3 shadow-sm">
                                            <div className="flex justify-between items-start gap-4">
                                              <span className="text-xs font-black text-slate-500 font-mono">Q{idx + 1}.</span>
                                              <div className="flex-1">
                                                <p className="text-xs font-bold text-slate-800 leading-relaxed">{q.questionText}</p>
                                                {q.options && (
                                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                                    {q.options.map(opt => (
                                                      <div key={opt} className={`px-2.5 py-1 rounded text-[10px] border font-sans ${
                                                        opt === studAnswer 
                                                          ? "bg-indigo-50 border-indigo-405 font-extrabold text-indigo-900" 
                                                          : "bg-slate-50 border-transparent text-slate-650"
                                                      }`}>
                                                        {opt}
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                                {q.correctAnswer && (
                                                  <p className="text-[10px] mt-2 font-bold text-emerald-600 font-sans">
                                                    Correct Answer Reference: {q.correctAnswer}
                                                  </p>
                                                )}
                                              </div>
                                              {/* Grade assign box */}
                                              <div className="shrink-0 w-24 text-right">
                                                <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Score Gained</label>
                                                <input
                                                  type="number"
                                                  max={q.markWeight || 10}
                                                  min={0}
                                                  disabled={isMCQ} // MCQs are auto-evaluated
                                                  value={currentScoreVal}
                                                  onChange={(e) => {
                                                    setGradingScores({
                                                      ...gradingScores,
                                                      [q.id]: Math.min(Number(e.target.value) || 0, q.markWeight || 10)
                                                    });
                                                  }}
                                                  className="w-full text-center font-bold font-mono text-xs border border-slate-200 bg-slate-55 rounded px-2 py-1 focus:bg-white text-slate-800 disabled:opacity-75 disabled:bg-slate-100"
                                                />
                                                <span className="text-[8px] text-slate-400 block mt-1 font-mono">
                                                  Max: {q.markWeight || 10} pts
                                                </span>
                                              </div>
                                            </div>

                                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Student's Submitted Answer</span>
                                              <p className={`text-xs font-bold mt-1 leading-relaxed ${
                                                isMCQ 
                                                  ? (isCorrect ? "text-emerald-700" : "text-rose-700") 
                                                  : "text-slate-800"
                                              }`}>
                                                {studAnswer}
                                                {isMCQ && (isCorrect ? " ✓ (Correct)" : " ✗ (Incorrect)")}
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* General feedback option */}
                                    <div className="space-y-1">
                                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Supervisor Review Feedback Notes</label>
                                      <textarea
                                        rows={3}
                                        value={gradingFeedback}
                                        onChange={e => setGradingFeedback(e.target.value)}
                                        placeholder="Add specialized review advice or focus plans..."
                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-indigo-500 text-slate-800"
                                      />
                                    </div>

                                    {/* Action Buttons: Save Graded / Publish Result (Red click / Hover black) */}
                                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                                      <button
                                        onClick={() => {
                                          const finalScoreVal = activeTest.questions?.reduce((sum, q) => {
                                            const isMCQ = q.type === "MCQ" || q.type === "True/False";
                                            if (isMCQ) {
                                              const correct = actSub.answers[q.id] === q.correctAnswer;
                                              return sum + (correct ? q.markWeight || 5 : 0);
                                            }
                                            return sum + (gradingScores[q.id] ?? 0);
                                          }, 0) || 0;

                                          const updatedSub: TestSubmission = {
                                            ...actSub,
                                            score: finalScoreVal,
                                            isGraded: true,
                                            isPublished: false,
                                            feedback: gradingFeedback
                                          };
                                          
                                          onAddTestSubmission?.(updatedSub);
                                          
                                          // Also sync in the test scores map
                                          const updatedScoresMap = { ...(activeTest.scores || {}), [actStud.id]: finalScoreVal };
                                          onUpdateTest?.({
                                            ...activeTest,
                                            scores: updatedScoresMap
                                          });

                                          alert("Draft scores saved successfully! Candidates will not see their performance index until you execute 'Publish Results to Student'.");
                                          setGradingSubmissionId(null);
                                        }}
                                        className="bg-white border border-slate-350 text-slate-800 transition-all font-bold text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-black hover:text-white hover:border-black cursor-pointer"
                                      >
                                        Save Draft Grades
                                      </button>
                                      <button
                                        onClick={() => {
                                          const finalScoreVal = activeTest.questions?.reduce((sum, q) => {
                                            const isMCQ = q.type === "MCQ" || q.type === "True/False";
                                            if (isMCQ) {
                                              const correct = actSub.answers[q.id] === q.correctAnswer;
                                              return sum + (correct ? q.markWeight || 5 : 0);
                                            }
                                            return sum + (gradingScores[q.id] ?? 0);
                                          }, 0) || 0;

                                          const updatedSub: TestSubmission = {
                                            ...actSub,
                                            score: finalScoreVal,
                                            isGraded: true,
                                            isPublished: true,
                                            feedback: gradingFeedback
                                          };
                                          
                                          onAddTestSubmission?.(updatedSub);

                                          // Also sync in the test scores map
                                          const updatedScoresMap = { ...(activeTest.scores || {}), [actStud.id]: finalScoreVal };
                                          onUpdateTest?.({
                                            ...activeTest,
                                            scores: updatedScoresMap
                                          });

                                          alert("Success! Your score sheet evaluations & written marks have been successfully Published. Students can instantly check their complete results of this test paper.");
                                          setGradingSubmissionId(null);
                                        }}
                                        className="bg-red-650 hover:bg-black text-white hover:text-white transition-all font-bold text-xs uppercase tracking-wider py-3 rounded-xl cursor-pointer shadow"
                                      >
                                        Publish Results to Student 📢
                                      </button>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div className="space-y-4 animate-fadeIn text-left">
                                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                    <div>
                                      <span className="text-[9px] uppercase tracking-widest font-black text-slate-400">Exam Code: {activeTest.id}</span>
                                      <h5 className="font-extrabold text-sm text-slate-850 truncate">{activeTest.title}</h5>
                                    </div>
                                    <span className="text-[10px] bg-red-50 text-red-750 px-3 py-1 rounded font-mono font-bold uppercase">
                                      Batch Enrolled: {enrolledStudentsInBatch.length} candidates
                                    </span>
                                  </div>

                                  {testSubs.length === 0 ? (
                                    <div className="py-10 text-center text-slate-400 italic text-xs">
                                      No submissions received yet for this active assessment paper.
                                    </div>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-xs text-slate-700 font-sans">
                                        <thead>
                                          <tr className="border-b border-slate-200 text-slate-400 uppercase text-[9px] font-black tracking-widest">
                                            <th className="py-3 px-1">Candidate student</th>
                                            <th className="py-3 px-1">Submitted Date</th>
                                            <th className="py-3 px-1 text-center">Status</th>
                                            <th className="py-3 px-1 text-center">Marks Score</th>
                                            <th className="py-3 px-1 text-right font-bold uppercase">Actions</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-150">
                                          {testSubs.map(sub => {
                                            const studObj = students.find(s => s.id === sub.studentId);
                                            if (!studObj) return null;

                                            return (
                                              <tr key={sub.id} className="hover:bg-slate-100/50 transition-colors">
                                                <td className="py-3 px-1 font-bold">
                                                  <div>{studObj.name}</div>
                                                  <div className="text-[9px] text-slate-400 font-mono">Roll: {studObj.rollNo}</div>
                                                </td>
                                                <td className="py-3 px-1 font-mono text-slate-500">
                                                  {new Date(sub.submittedAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-1 text-center">
                                                  {sub.isPublished ? (
                                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-[9px] font-black uppercase inline-block">
                                                      GRADED & PUBLISHED
                                                    </span>
                                                  ) : sub.isGraded ? (
                                                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-150 px-2.5 py-1 rounded-full text-[9px] font-black uppercase inline-block">
                                                      DRAFT SCORE (UNPUBLISHED)
                                                    </span>
                                                  ) : (
                                                    <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full text-[9px] font-black uppercase inline-block">
                                                      PENDING EVALUATION
                                                    </span>
                                                  )}
                                                </td>
                                                <td className="py-3 px-1 text-center font-bold font-mono">
                                                  {sub.score !== undefined ? `${sub.score} / ${activeTest.maxMarks}` : `--`}
                                                </td>
                                                <td className="py-3 px-1 text-right">
                                                  <button
                                                    onClick={() => {
                                                      setGradingSubmissionId(sub.id);
                                                      setGradingFeedback(sub.feedback || "");
                                                      const loadedScores: { [key: string]: number } = {};
                                                      // MCQs or True/False are precalculated, subjective answers are loaded or set to 0
                                                      activeTest.questions?.forEach(q => {
                                                        const isMCQ = q.type === "MCQ" || q.type === "True/False";
                                                        if (isMCQ) {
                                                          const correct = sub.answers[q.id] === q.correctAnswer;
                                                          loadedScores[q.id] = correct ? q.markWeight || 5 : 0;
                                                        } else {
                                                          // written scores can be estimated or loaded from submission if saved
                                                          loadedScores[q.id] = sub.score !== undefined ? (sub.score - activeTest.questions!.filter(question => question.type !== "Written").reduce((sum, mcq_q) => sum + (sub.answers[mcq_q.id] === mcq_q.correctAnswer ? mcq_q.markWeight || 5 : 0), 0)) : 0;
                                                          if (loadedScores[q.id] < 0) loadedScores[q.id] = 0;
                                                        }
                                                      });
                                                      setGradingScores(loadedScores);
                                                    }}
                                                    className="bg-red-650 hover:bg-black text-white hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-all border border-red-650 hover:border-black"
                                                  >
                                                    {sub.isPublished ? "Edit Evaluation" : "Review & Grade"}
                                                  </button>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-slate-800 shadow-sm">
                      <div className="flex items-center space-x-2.5 mb-4">
                        <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                        <h4 className="font-bold text-sm text-slate-100 uppercase tracking-wider">AI Student Diagnostic Guidance Plan</h4>
                      </div>
                      <p className="text-xs text-indigo-200 leading-relaxed mb-6">
                        Provide a specialized remedial action report using our server-side API. Gemini extracts educational gaps, analyses marks percentages, and details concrete motivation advice.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-indigo-300 uppercase mb-1">Select Target Assessment</label>
                          <select
                            value={evalTestId}
                            onChange={e => setEvalTestId(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-400 text-slate-100"
                          >
                            <option value="">-- Choose Exam assessment --</option>
                            {currentBatchTests.map(t => (
                              <option key={t.id} value={t.id}>{t.title} ({t.date})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-indigo-300 uppercase mb-1">Select Target Student</label>
                          <select
                            value={evalStudentId}
                            onChange={e => setEvalStudentId(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-400 text-slate-100"
                          >
                            <option value="">-- Choose Student candidate --</option>
                            {enrolledStudentsInBatch.map(s => (
                              <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-[10px] font-bold text-indigo-300 uppercase mb-1">Teacher's Private Observations / Focus Points (Optional)</label>
                        <textarea 
                          rows={3}
                          placeholder="e.g. Good grasp of concepts but made small calculation limits slip-ups. Needs attention to negative signs."
                          value={evalCustomNotes}
                          onChange={e => setEvalCustomNotes(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-3 focus:outline-none focus:border-indigo-400 text-white resize-none"
                        />
                      </div>

                      <div className="mt-6 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-mono">Status: Ready</span>
                        <button
                          onClick={generateAiEvaluationReport}
                          disabled={isGeneratingEvaluation || !evalTestId || !evalStudentId}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold text-xs px-6 py-3 rounded-xl duration-200 flex items-center space-x-2"
                        >
                          {isGeneratingEvaluation ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Analysing marks data...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Formulate Diagnostic Feedback</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* AI Generated Diagnostics Viewer Card */}
                    {generatedEvaluationHtml && (
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Gemini 3.5 Personalised Study Plan</span>
                          </div>
                          <button
                            onClick={() => {
                              window.print();
                            }}
                            className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg"
                          >
                            Print Report Card
                          </button>
                        </div>

                        <div className="markdown-body prose max-w-none text-slate-700 text-xs leading-relaxed space-y-4">
                          <ReactMarkdown>{generatedEvaluationHtml}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

                {/* 4. COHORT ANNOUNCEMENTS TAB */}
                {activeTab === "announcements" && (
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-4">Post Cohort announcement Circular</h4>
                      
                      <form onSubmit={handleAddBatchAnnouncement} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Subject Heading</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Schedule shift for Calculus weekend bootcamps"
                            value={batchAnnTitle}
                            onChange={e => setBatchAnnTitle(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-indigo-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Announcement Message Content</label>
                          <textarea 
                            rows={4}
                            placeholder="Provide deep details, assignments reference chapters, and expected prep guidelines..."
                            value={batchAnnContent}
                            onChange={e => setBatchAnnContent(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-indigo-500 resize-none"
                            required
                          />
                        </div>

                        <button 
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all"
                        >
                          Broadcast to Noticeboards
                        </button>
                      </form>
                    </div>

                    {/* Announcements Log list */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold text-slate-500 uppercase px-1">Cohort Notice History</h5>
                      {currentBatchAnnouncements.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No notices posted to this batch yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {currentBatchAnnouncements.map(ann => (
                            <div key={ann.id} className="bg-slate-50/50 p-5 rounded-xl border border-slate-200/50">
                              <div className="flex justify-between items-start">
                                <h6 className="font-bold text-slate-800 text-xs">{ann.title}</h6>
                                <span className="text-[10px] text-slate-400 font-mono tracking-wider">{ann.date}</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{ann.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* LECTURER CARD SCANNING TERMINAL DESK */}
            {activeTab === "scanner" && (
              <div className="space-y-6 animate-fadeIn text-left">
                {/* Mode Selector */}
                <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-250/60 inline-flex space-x-1 font-sans">
                  <button
                    onClick={() => setAttendanceSubMode("register")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      attendanceSubMode === "register"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    📝 Manual Class Register
                  </button>
                  <button
                    onClick={() => setAttendanceSubMode("camera")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      attendanceSubMode === "camera"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    📷 Scan QR ID Pass
                  </button>
                </div>

                {/* Sub-Mode 1: Camera Attendance Scanner */}
                {attendanceSubMode === "camera" && (
                  <div className="space-y-6">
                    <QRCardScanner
                      students={students}
                      title="Lecture Room Attendance Scanner Portal"
                      subtitle="Scan a student's ID card QR code (their roll number) to register them as PRESENT for today's lecture instantly."
                      allowedActionsDescription="Lecture Room Scanner Active"
                      onScanSuccess={(scannedSt) => {
                        setLastScannedTeacherDashboardStudent(scannedSt);
                        const matchBatch = batches.find(b => b.studentIds.includes(scannedSt.id)) || batches[0];
                        if (matchBatch && onMarkAttendance) {
                          onMarkAttendance(scannedSt.id, attendanceRegDate, "Present", matchBatch.id);
                          setAttendanceSuccess(`Identity Verified & Registered! Marked ${scannedSt.name} (${scannedSt.rollNo}) PRESENT for ${attendanceRegDate}.`);
                          setTimeout(() => setAttendanceSuccess(""), 4000);
                        }
                      }}
                    />

                    {attendanceSuccess && (
                      <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-fadeIn">
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                        <span>{attendanceSuccess}</span>
                      </div>
                    )}

                    {/* Scanned Student Profile details & Interactive Toolbox buttons */}
                    {lastScannedTeacherDashboardStudent && (
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-scaleUp">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-mono text-lg font-bold uppercase shrink-0">
                              {lastScannedTeacherDashboardStudent.name ? lastScannedTeacherDashboardStudent.name.substring(0, 2) : "ST"}
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-mono tracking-widest text-indigo-600 bg-indigo-50 dark:bg-slate-800 px-2.5 py-1 rounded-md font-bold">
                                {lastScannedTeacherDashboardStudent.rollNo}
                              </span>
                              <h4 className="text-base font-black text-slate-800 dark:text-white mt-1 uppercase tracking-tight">
                                {lastScannedTeacherDashboardStudent.name}
                              </h4>
                              <p className="text-xs text-slate-400 font-sans">{lastScannedTeacherDashboardStudent.email}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => setLastScannedTeacherDashboardStudent(null)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 font-bold text-[10px] uppercase tracking-wider py-2.5 px-3 rounded-xl border border-slate-200 cursor-pointer h-fit"
                            >
                              Clear Record
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Enrolled Batches and status */}
                          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-left space-y-3.5">
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                              <CheckCircle className="w-4 h-4 text-indigo-500" />
                              <span>Academic Student Cohorts</span>
                            </h5>
                            
                            {(() => {
                              const studentBatches = batches.filter(b => b.studentIds.includes(lastScannedTeacherDashboardStudent.id));
                              if (studentBatches.length === 0) {
                                return <p className="text-[10px] text-slate-400 italic">This student has not been assigned to any cohorts.</p>;
                              }

                              return (
                                <div className="space-y-2">
                                  {studentBatches.map(b => (
                                    <div key={b.id} className="bg-white p-3 rounded-xl border border-slate-200/50 flex justify-between items-center text-xs">
                                      <span className="font-bold text-slate-755 truncate">{b.name}</span>
                                      <span className="text-[9px] bg-indigo-50 text-indigo-600 font-mono font-bold px-1.5 rounded">{b.code}</span>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>

                          {/* Quick Attendance History Details */}
                          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-left space-y-3.5">
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                              <Calendar className="w-4 h-4 text-indigo-500" />
                              <span>Recent Logged Records</span>
                            </h5>
                            {(() => {
                              const recentLogs = attendanceRecords
                                .filter(r => r.studentId === lastScannedTeacherDashboardStudent.id)
                                .slice(-3);
                              if (recentLogs.length === 0) {
                                return <p className="text-[10px] text-slate-400 italic">No attendance records stored yet.</p>;
                              }
                              return (
                                <div className="space-y-1.5">
                                  {recentLogs.map(log => (
                                    <div key={log.id} className="flex justify-between items-center bg-white p-2 rounded-lg text-xs border border-slate-100">
                                      <span className="font-mono text-slate-500">{log.date}</span>
                                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                        log.status === "Present" ? "bg-emerald-55 text-emerald-800" : "bg-rose-55 text-rose-800"
                                      }`}>{log.status}</span>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-Mode 2: Manual Class Register with batch marking */}
                {attendanceSubMode === "register" && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div className="text-left">
                        <h4 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center space-x-2">
                          <ClipboardList className="w-5 h-5 text-indigo-600" />
                          <span>Student Attendance Register</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">Choose a class cohort and record present/absent status sheets with live verification state.</p>
                      </div>

                      {/* Filter Selectors */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="space-y-1 text-left">
                          <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Target Cohort</label>
                          <select
                            value={attendanceRegBatchId}
                            onChange={(e) => setAttendanceRegBatchId(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-indigo-500 font-sans"
                          >
                            {batches.map(b => (
                              <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Session Date</label>
                          <input
                            type="date"
                            value={attendanceRegDate}
                            onChange={(e) => setAttendanceRegDate(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-indigo-500 font-sans"
                          />
                        </div>
                      </div>
                    </div>

                    {attendanceSuccess && (
                      <div className="bg-emerald-50 border border-emerald-255 text-emerald-800 p-3.5 rounded-xl text-xs font-bold animate-fadeIn">
                        {attendanceSuccess}
                      </div>
                    )}

                    {/* Student List */}
                    {(() => {
                      const cohortStudents = students.filter(s => s.batchId === attendanceRegBatchId);
                      if (cohortStudents.length === 0) {
                        return (
                          <div className="py-12 text-center text-slate-400 text-xs italic">
                            No students currently registered in this academic cohort.
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                            <span>Student Identity Details</span>
                            <span>Attendance Flag</span>
                          </div>

                          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                            {cohortStudents.map(student => {
                              // Find stored record or default to Present
                              const savedRecord = attendanceRecords.find(
                                r => r.studentId === student.id && r.date === attendanceRegDate && r.batchId === attendanceRegBatchId
                              );
                              const status = savedRecord ? savedRecord.status : "Present";

                              return (
                                <div key={student.id} className="bg-slate-50 hover:bg-slate-100/70 p-3 rounded-2xl border border-slate-200/40 flex items-center justify-between gap-4 transition-all">
                                  <div className="flex items-center space-x-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-mono text-sm font-bold uppercase shrink-0">
                                      {student.name ? student.name.substring(0, 2) : "ST"}
                                    </div>
                                    <div className="text-left min-w-0">
                                      <p className="text-xs font-black text-slate-800 truncate uppercase tracking-tight">{student.name}</p>
                                      <p className="text-[9px] text-slate-400 font-mono font-bold mt-0.5">{student.rollNo} • {student.schoolName}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-1.5 shrink-0">
                                    <button
                                      onClick={() => {
                                        if (onMarkAttendance) {
                                          onMarkAttendance(student.id, attendanceRegDate, "Present", attendanceRegBatchId);
                                          setAttendanceSuccess(`Successfully marked ${student.name} PRESENT.`);
                                          setTimeout(() => setAttendanceSuccess(""), 3000);
                                        }
                                      }}
                                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-colors ${
                                        status === "Present"
                                          ? "bg-emerald-600 text-white shadow-xs"
                                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                      }`}
                                    >
                                      Present
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (onMarkAttendance) {
                                          onMarkAttendance(student.id, attendanceRegDate, "Absent", attendanceRegBatchId);
                                          setAttendanceSuccess(`Successfully marked ${student.name} ABSENT.`);
                                          setTimeout(() => setAttendanceSuccess(""), 3000);
                                        }
                                      }}
                                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-colors ${
                                        status === "Absent"
                                          ? "bg-rose-600 text-white shadow-xs"
                                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                      }`}
                                    >
                                      Absent
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="pt-4 border-t border-slate-105 flex items-center justify-between text-xs text-slate-400 font-mono">
                            <span>Register Headcount: <strong>{cohortStudents.length}</strong> Students</span>
                            <span className="text-emerald-600 font-bold">Autosaved to Database</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* 5. TEACHER PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6" id="teacher-profile-editor">
                <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
                  <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 font-bold">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Academic Profile & Specialization Context</h4>
                    <p className="text-xs text-slate-400 font-sans">View your verified designation badges and adjust public educational bio details.</p>
                  </div>
                </div>

                {profileSuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs py-3 px-4 rounded-xl font-bold flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                  <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center text-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-rose-100 border border-rose-250 text-rose-600 font-mono text-xl font-bold flex items-center justify-center uppercase shadow-sm">
                      {profileName ? profileName.substring(0, 2) : "TR"}
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-800 text-sm">{profileName || "Lecturer Faculty"}</h5>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full mt-1.5 inline-block border border-indigo-100">
                        Senior Faculty Member
                      </span>
                    </div>

                    <div className="w-full space-y-2 pt-3 border-t border-slate-200/50 text-left text-xs font-sans">
                      <div>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Faculty ID Code</span>
                        <span className="font-mono font-bold text-slate-700">{activeTeacher.id}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Verification Status</span>
                        <span className="text-slate-600 font-semibold flex items-center space-x-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                          <span>Credentials Authenticated</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!profileName.trim() || !profileEmail.trim() || !profileSpec.trim()) {
                          alert("All standard fields are required to submit.");
                          return;
                        }
                        onUpdateTeacherProfile?.(activeTeacher.id, profileName.trim(), profileEmail.trim(), profileSpec.trim(), profileAvatar.trim());
                        setProfileSuccessMsg("Teacher profile updated successfully and synchronized to local stores!");
                        setTimeout(() => setProfileSuccessMsg(""), 4000);
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Designation Name
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
                          Academic Email Coordinates
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

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Syllabus / Specialization
                        </label>
                        <input
                          type="text"
                          required
                          value={profileSpec}
                          onChange={(e) => setProfileSpec(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-indigo-500 font-medium text-slate-800"
                          placeholder="e.g. Pure Mathematics, Software Engineering"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Faculty Avatar Image URL
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

                      {/* Password Field (DISABLED) */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center space-x-1 text-slate-400">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Credentials Change Password</span>
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            disabled
                            value="••••••••••••••"
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-400 cursor-not-allowed font-mono"
                          />
                        </div>
                        <div className="mt-2 text-[10px] text-amber-700 leading-relaxed bg-amber-50 rounded-xl p-3 border border-amber-200/45 flex items-start space-x-2">
                          <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>Scholastic Security Protocol:</strong> Faculty passwords are administrative secrets controlled by general coordinators. For updates, please direct inquiries to support desk <strong className="underline text-indigo-700">vishveshwarfoundation@gmail.com</strong>.
                          </span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 transition-all text-white font-bold text-[10px] uppercase tracking-wider py-3.5 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-xs cursor-pointer h-fit font-sans"
                      >
                        <Save className="w-4 h-4" />
                        <span>Update Faculty Profile</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* 6. FEES MANAGEMENT TAB (Deprecated - Transferred to Fee Management portal) */}
            {activeTab === "fees" && (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl">🔒</div>
                <h5 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Access Restricted</h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  As requested by the administrator, Fee Management features have been removed from the Faculty dashboard and completely transferred to the Fee Management portal.
                </p>
              </div>
            )}
            {false && (
              <div className="space-y-6" id="teacher-fees-manager text-left align-left">
                
                {/* Visual Lock Notification status block */}
                {authorizedStudentIdForFee ? (
                  (() => {
                    const authedStudent = students.find(s => s.id === authorizedStudentIdForFee);
                    return (
                      <div className="bg-emerald-500/10 border border-emerald-400 text-emerald-850 dark:text-emerald-300 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                        <div className="flex items-center space-x-3 text-left">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-pulse"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <div className="text-xs">
                            <p className="font-extrabold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">💳 Student ID Card Auth Passed</p>
                            <p className="mt-0.5 text-slate-550 dark:text-slate-300">You are authorized to settle ledger invoice balances for student <strong>{authedStudent?.name}</strong> ({authedStudent?.rollNo}).</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setAuthorizedStudentIdForFee(null)}
                          className="text-[9px] bg-white border border-slate-200 px-3 py-1.5 hover:bg-slate-50 text-slate-600 rounded-lg font-bold uppercase tracking-wider transition-colors cursor-pointer select-none"
                        >
                          Lock Terminal
                        </button>
                      </div>
                    );
                  })()
                ) : (
                  <div className="bg-amber-500/10 border border-amber-300 text-amber-900 dark:text-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-left shadow-xs">
                    <div className="text-xs">
                      <p className="font-extrabold uppercase tracking-widest text-amber-800 dark:text-amber-400">🔒 Transaction Compliance Lock active</p>
                      <p className="mt-0.5 text-slate-500 text-slate-600">For secure tracking, in-person student attendance ID card verification scanning is strictly required to mark invoices as Paid.</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab("scanner")}
                      className="text-[9px] bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold tracking-wider py-2 px-3 rounded-xl uppercase leading-none self-start shrink-0 cursor-pointer shadow-xs"
                    >
                      Open Scanner Panel
                    </button>
                  </div>
                )}

                {/* Header Title block */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 font-bold">
                      <Receipt className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider font-sans">
                        Scholastic Fee Management Engine
                      </h4>
                      <p className="text-xs text-slate-500 font-sans">
                        Issue professional billing invoices, track collections, verify receipts, and maintain clear records of student obligations.
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <span className="text-[10px] bg-slate-100 font-mono text-slate-600 font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-slate-200">
                      Active Invoices: {fees.length}
                    </span>
                  </div>
                </div>

                {/* KPI Metrics block */}
                {(() => {
                  const totalCollected = fees.filter(f => f.status === "Paid").reduce((acc, current) => acc + current.amount, 0);
                  const totalOutstanding = fees.filter(f => f.status === "Unpaid").reduce((acc, current) => acc + current.amount, 0);
                  const totalBilled = totalCollected + totalOutstanding;
                  const paymentRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <motion.div 
                        whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="bg-white p-4 rounded-xl border border-slate-105 shadow-xs flex items-center space-x-4 cursor-pointer"
                      >
                        <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest font-sans">Collected Receipts</span>
                          <span className="text-lg font-black text-slate-800 font-mono">${totalCollected.toLocaleString()}</span>
                        </div>
                      </motion.div>

                      <motion.div 
                        whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="bg-white p-4 rounded-xl border border-slate-105 shadow-xs flex items-center space-x-4 cursor-pointer"
                      >
                        <div className="p-2.5 bg-rose-50 rounded-lg text-rose-600">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest font-sans">Outstanding Receivables</span>
                          <span className="text-lg font-black text-slate-800 font-mono">${totalOutstanding.toLocaleString()}</span>
                        </div>
                      </motion.div>

                      <motion.div 
                        whileHover={{ scale: 1.025, y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="bg-white p-4 rounded-xl border border-slate-105 bg-gradient-to-br from-indigo-50/40 to-indigo-100/10 shadow-xs flex items-center space-x-4 cursor-pointer"
                      >
                        <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <span className="block text-[8px] font-bold text-indigo-400 uppercase tracking-widest font-sans">Realized Payment Rate</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-black text-indigo-700 font-mono">{paymentRate}%</span>
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${paymentRate}%` }} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })()}

                {feeSuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl font-bold flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feeSuccessMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Create Invoice Form */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h5 className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center space-x-1">
                        <PlusCircle className="w-4 h-4 text-indigo-600" />
                        <span>Issue New Student Invoice</span>
                      </h5>
                      <p className="text-[10px] text-slate-400 font-sans mt-0.5">Bill an active student for tuition, bootcamp packs, or print guides.</p>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!feeStudentId) {
                          alert("Select a target student to attach this invoice.");
                          return;
                        }
                        if (!feeTitle.trim()) {
                          alert("Provide a clear billing description title.");
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
                        setFeeSuccessMsg(`Billing invoice of $${feeAmount} generated for ${student.name}!`);
                        setTimeout(() => setFeeSuccessMsg(""), 3000);
                      }}
                      className="space-y-3.5 font-sans"
                    >
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 text-left">
                          Target Student Cohort
                        </label>
                        <select
                          required
                          value={feeStudentId}
                          onChange={(e) => setFeeStudentId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-indigo-500 font-medium text-slate-800"
                        >
                          <option value="">-- Choose student accounts --</option>
                          {students.filter(s => s.status === "Active").map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.rollNo})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 text-left">
                          Invoice Title / Description
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. June Monthly Tuition Fee"
                          value={feeTitle}
                          onChange={(e) => setFeeTitle(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-indigo-500 font-medium text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 text-left">
                          Billable Value (USD $)
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={50000}
                          value={feeAmount}
                          onChange={(e) => setFeeAmount(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-indigo-500 font-mono font-medium text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 text-left">
                          Invoicing Due Date
                        </label>
                        <input
                          type="date"
                          required
                          value={feeDueDate}
                          onChange={(e) => setFeeDueDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-indigo-500 font-mono font-medium text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 text-left">
                          Ledger Audit Notes (Optional)
                        </label>
                        <textarea
                          placeholder="Concessions, split payments, scholarship code audit notes."
                          value={feeNotes}
                          onChange={(e) => setFeeNotes(e.target.value)}
                          rows={2}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-indigo-500 font-medium text-slate-800 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all text-white font-bold text-[10px] uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-xs cursor-pointer h-fit font-sans"
                      >
                        <Receipt className="w-4 h-4" />
                        <span>Issue Student Invoice</span>
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Invoice Registry list */}
                  <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
                      <div className="text-left">
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider font-sans">
                          Invoices Registry Ledger
                        </h5>
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5 font-sans">Filter and transition user receipts.</p>
                      </div>

                      {/* Filter switches */}
                      <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-150 tracking-wider font-sans text-[8px] font-bold text-slate-400 uppercase">
                        {(["All", "Paid", "Unpaid"] as const).map(tabVal => (
                          <button
                            key={tabVal}
                            type="button"
                            onClick={() => setFeeFilterStatus(tabVal)}
                            className={`px-3 py-1 rounded-lg transition-all ${
                              feeFilterStatus === tabVal ? "bg-white text-indigo-600 font-black shadow-xs" : "text-slate-550 hover:text-slate-700"
                            }`}
                          >
                            {tabVal}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Simple Search Query bar */}
                    <div className="relative font-sans text-xs">
                      <input
                        type="text"
                        placeholder="Search invoices by student name, roll code, or billing title..."
                        value={feeSearchQuery}
                        onChange={(e) => setFeeSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 pl-10 text-xs focus:outline-indigo-500 text-slate-850 font-normal"
                      />
                      <Filter className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      {feeSearchQuery && (
                        <button
                          onClick={() => setFeeSearchQuery("")}
                          className="absolute right-3.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Table / List layout */}
                    {(() => {
                      const filteredFees = fees.filter(f => {
                        const matchesFilter = feeFilterStatus === "All" || f.status === feeFilterStatus;
                        const matchQuery = !feeSearchQuery.trim() || 
                          f.studentName.toLowerCase().includes(feeSearchQuery.toLowerCase()) || 
                          f.studentRollNo.toLowerCase().includes(feeSearchQuery.toLowerCase()) || 
                          f.title.toLowerCase().includes(feeSearchQuery.toLowerCase());
                        return matchesFilter && matchQuery;
                      });

                      if (filteredFees.length === 0) {
                        return (
                          <div className="bg-slate-50/55 p-12 text-center rounded-2xl border border-slate-100">
                            <p className="text-slate-400 text-xs font-sans font-medium">No matching billing record entries found for your criteria.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                          {filteredFees.map(f => {
                            const matchedStudent = students.find(s => s.id === f.studentId);
                            return (
                              <div 
                                key={f.id}
                                className="bg-slate-55/30 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all flex flex-col sm:flex-row items-stretch justify-between gap-4 text-left"
                              >
                                <div className="flex items-start space-x-3 flex-1 font-sans">
                                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center font-mono text-xs font-bold uppercase shrink-0 mt-0.5">
                                    {f.studentName ? f.studentName.substring(0, 2) : "ST"}
                                  </div>
                                  <div className="space-y-0.5 flex-1 select-text">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-bold text-slate-800 text-xs leading-none">{f.studentName}</span>
                                      <span className="font-mono text-[9px] text-slate-400 uppercase font-semibold">({f.studentRollNo})</span>
                                    </div>
                                    <h6 className="font-semibold text-slate-700 text-xs mt-0.5 leading-snug">{f.title}</h6>
                                    {f.notes && <p className="text-[10px] text-slate-450 italic font-medium leading-relaxed mt-0.5 bg-slate-50 p-2 rounded-lg border border-slate-100 font-sans">{f.notes}</p>}
                                    <div className="flex items-center space-x-3 text-[9px] text-slate-400 font-sans mt-2 pt-1.5 border-t border-slate-100/60">
                                      <span>Due: <span className="font-mono font-bold text-slate-500">{f.dueDate}</span></span>
                                      {f.paidDate && (
                                        <span className="text-emerald-650">Settled: <span className="font-mono font-bold">{f.paidDate}</span></span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-slate-100/50 pt-3 sm:pt-0 shrink-0 font-sans">
                                  <div className="flex items-center space-x-2 sm:text-right">
                                    <span className="font-mono font-black text-sm text-slate-800">₹{f.amount}</span>
                                    <span className={`px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-widest rounded-full border ${
                                      f.status === "Paid" 
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                        : "bg-rose-50 text-rose-700 border-rose-100"
                                    }`}>
                                      {f.status}
                                    </span>
                                  </div>

                                  <div className="flex items-center space-x-2 mt-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextStatus = f.status === "Paid" ? "Unpaid" : "Paid";
                                        onUpdateFeeStatus(f.id, nextStatus);
                                        setFeeSuccessMsg(`Receipt invoice #${f.id} status modified to ${nextStatus}.`);
                                        setTimeout(() => setFeeSuccessMsg(""), 3000);
                                      }}
                                      className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border cursor-pointer select-none transition-colors ${
                                        f.status === "Paid"
                                          ? "bg-white hover:bg-slate-50 text-slate-500 border-slate-200"
                                          : "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500"
                                      }`}
                                    >
                                      {f.status === "Paid" ? "Mark Unpaid" : "Mark Paid"}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to completely void and delete invoice ${f.title}?`)) {
                                          onDeleteFeeInvoice(f.id);
                                          setFeeSuccessMsg("Billing invoice has been deleted successfully.");
                                          setTimeout(() => setFeeSuccessMsg(""), 3000);
                                        }
                                      }}
                                      className="p-1 px-1.5 text-rose-650 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200/40 cursor-pointer"
                                      title="Delete Invoice"
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
              </div>
            )}

            {/* 7. SUPPORT HELP TICKETS MANAGER */}
            {activeTab === "support" && (
              <div className="space-y-6 text-left animate-fadeIn">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 text-left">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 font-bold">
                      <MessageSquare className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider font-sans">
                        Help Tickets Resolution Desk
                      </h4>
                      <p className="text-xs text-slate-500 font-sans">
                        Review academic doubts, technical issues, or billing reports filed by enrolled students.
                      </p>
                    </div>
                  </div>
                  <div className="text-xs bg-slate-100 font-mono text-slate-600 font-semibold px-3.5 py-2 rounded-xl border border-slate-200">
                    Staff Identity: {teachers.find(t => t.id === selectedTeacherId)?.name || "Teacher Staff"}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Students with support tickets */}
                  <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-3 flex flex-col">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                      Student Message Threads
                    </h5>
                    
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
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
                                ? "bg-indigo-600 text-white border-indigo-700 font-bold scale-[1.01] shadow-xs" 
                                : "bg-slate-50/70 hover:bg-slate-50 text-slate-700 border-slate-100"
                            }`}
                          >
                            <div className="truncate flex-1">
                              <p className="font-extrabold truncate">{std.name}</p>
                              <p className={`text-[10px] truncate ${isSelected ? "text-indigo-200" : "text-slate-450"}`}>
                                Roll: {std.rollNo} • Batches: {batches.filter(b => b.studentIds.includes(std.id)).map(b => b.code).join(", ") || "None"}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1 shrink-0">
                              {hasMessages ? (
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                  isSelected ? "bg-indigo-800 text-white" : "bg-indigo-100 text-indigo-700"
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

                  {/* Right: Selected conversations Thread */}
                  <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
                    {selectedChatStudentId ? (
                      (() => {
                        const targetStudent = students.find(s => s.id === selectedChatStudentId);
                        const threadMsgs = supportMessages.filter(m => m.studentId === selectedChatStudentId);

                        return (
                          <>
                            {/* Thread Title */}
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                              <div className="text-left">
                                <span className="text-[10px] font-mono font-bold bg-slate-200/60 p-1 rounded text-slate-550">
                                  #{targetStudent?.id}
                                </span>
                                <h5 className="font-extrabold text-xs text-slate-800 inline-block ml-2 uppercase">
                                  {targetStudent?.name} ({targetStudent?.rollNo})
                                </h5>
                              </div>
                              <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[9px] px-2.5 py-1 rounded-full uppercase">
                                RESOLVING TICKET
                              </span>
                            </div>

                            {/* Thread Message history scrollable */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
                              {threadMsgs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-1.5 p-6">
                                  <MessageSquare className="w-8 h-8 text-slate-300" />
                                  <h6 className="font-extrabold text-slate-700 text-xs">No Message History</h6>
                                  <p className="text-[10px] text-slate-450 max-w-sm leading-relaxed">
                                    No queries have been submitted by this student. Since help replies are restricted to Teacher & Admin, you can type a proactive check-in message or doubt-clearance note below to start the help session.
                                  </p>
                                </div>
                              ) : (
                                threadMsgs.map(msg => {
                                  // Replies sent by teachers or admins are seen as staff
                                  const isStaffSender = msg.senderRole === "teacher" || msg.senderRole === "admin";
                                  return (
                                    <div key={msg.id} className={`flex flex-col ${isStaffSender ? 'items-end' : 'items-start'} space-y-1`}>
                                      <div className="flex items-center space-x-1.5">
                                        <span className="text-[9px] font-extrabold text-slate-400 font-sans">
                                          {msg.senderName} ({msg.senderRole.toUpperCase()})
                                        </span>
                                        <span className="text-[8px] text-slate-350 font-mono">
                                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <div className={`p-3.5 rounded-2xl text-xs max-w-md ${
                                        isStaffSender 
                                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs' 
                                          : 'bg-white text-slate-850 rounded-tl-none border border-slate-100 shadow-xs'
                                      }`}>
                                        <p className="leading-relaxed whitespace-pre-line font-medium font-sans break-words">{msg.content}</p>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            {/* Thread reply composer form */}
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
                                placeholder={`Write helpful ticket reply to ${targetStudent?.name || 'student'}...`}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                                required
                              />
                              <button 
                                type="submit" 
                                className="bg-indigo-650 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all font-sans shrink-0 cursor-pointer flex items-center space-x-2"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Reply</span>
                              </button>
                            </form>
                          </>
                        );
                      })()
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-2">
                        <MessageSquare className="w-12 h-12 text-slate-300 animate-pulse" />
                        <h6 className="font-extrabold text-slate-700 text-xs">No Selected Conversation</h6>
                        <p className="text-[10px] text-slate-450 max-w-sm leading-relaxed">
                          Select any student file from the left sidebar tracker panel to review and respond to academic doubts, system issues, or fees waiver tickets.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TEACHER SIDE: ACADEMIC APAAR STUDENT REGISTRY & PROFILE MANAGER */}
            {activeTab === "apaar-management" && (
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

                {/* Banner Header Desk */}
                <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5 text-left">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-505/20 shrink-0">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-indigo-400 uppercase tracking-wider font-sans">National APAAR Identity Registrar Workspace</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Select students to verify credentials, edit SSM/PEN database fields, and generate academic identity cards.
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono bg-indigo-950/40 text-indigo-300 border border-indigo-500/20 px-3.5 py-1.5 rounded-lg uppercase shrink-0 font-bold tracking-wider">
                    Ministry Clearance Active
                  </div>
                </div>

                {teacherSuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs py-3.5 px-4 rounded-xl font-bold flex items-center space-x-2 animate-fadeIn">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{teacherSuccessMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column (LG/4): Student Directory Picker */}
                  <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-2.5">
                      <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Student Directory</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">Assigned cohort academic members</p>
                    </div>

                    {/* Registry search input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search student or roll no..."
                        value={apaarSearch}
                        onChange={(e) => setApaarSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs focus:outline-indigo-500 font-medium text-slate-800"
                      />
                    </div>

                    {/* Students Scrollable Tracker list */}
                    <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                      {(() => {
                        const filtered = students.filter(s => 
                          s.name.toLowerCase().includes(apaarSearch.toLowerCase()) || 
                          (s.rollNo && s.rollNo.toLowerCase().includes(apaarSearch.toLowerCase()))
                        );

                        if (filtered.length === 0) {
                          return <p className="text-[10px] text-slate-400 italic text-center py-4">No matching records found.</p>;
                        }

                        return filtered.map(s => {
                          const isSelected = (selectedApaarStudentId || students[0]?.id) === s.id;
                          const isConfigured = !!s.apparId;

                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setSelectedApaarStudentId(s.id)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                isSelected
                                  ? "bg-indigo-600 border-indigo-700 text-white font-bold scale-[1.01] shadow-xs"
                                  : "bg-slate-55/40 hover:bg-slate-50 border-slate-100/80 text-slate-700"
                              }`}
                            >
                              <div className="truncate flex-1">
                                <p className="font-extrabold truncate">{s.name}</p>
                                <p className={`text-[9.5px] truncate mt-0.5 ${isSelected ? "text-indigo-250" : "text-slate-450"}`}>
                                  Roll: {s.rollNo || "No Roll"} • PEN: {s.penNumber || "Pending"}
                                </p>
                              </div>
                              <div className="shrink-0">
                                {isConfigured ? (
                                  <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded ${
                                    isSelected ? "bg-indigo-705/30 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  }`}>
                                    Configured
                                  </span>
                                ) : (
                                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                    isSelected ? "bg-indigo-705/30 text-white" : "bg-amber-50 text-amber-700 border border-amber-100"
                                  }`}>
                                    Incomplete
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Right Column (LG/8): Edit Workspace & Card Preview */}
                  <div className="lg:col-span-8 space-y-6">
                    {selectedApaarStudent ? (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                        
                        {/* Interactive Edit Form card */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                          <div className="border-b border-slate-100 pb-2.5">
                            <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center space-x-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-600" />
                              <span>Registrar Record Workspace</span>
                            </h5>
                            <p className="text-[9.5px] text-slate-400 mt-0.5">Modify regulatory identity data of {selectedApaarStudent.name}</p>
                          </div>

                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              onUpdateStudentFormDetails?.(selectedApaarStudent.id, {
                                serialNumber: teacherSerial.trim(),
                                apparId: teacherApaarId.trim(),
                                penNumber: teacherPen.trim(),
                                name: teacherName.trim(),
                                fatherName: teacherFather.trim(),
                                motherName: teacherMother.trim(),
                                dob: teacherDob.trim(),
                                scholarNumber: teacherScholar.trim(),
                                ssmId: teacherSsm.trim()
                              });
                              setTeacherSuccessMsg(`Scholastic record of student ${teacherName} successfully synchronized on regional registries.`);
                              setTimeout(() => setTeacherSuccessMsg(""), 4500);
                            }}
                            className="space-y-3"
                          >
                            <div>
                              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Student Name</label>
                              <input
                                type="text"
                                required
                                value={teacherName}
                                onChange={(e) => setTeacherName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-indigo-500"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">DOB</label>
                                <input
                                  type="text"
                                  required
                                  value={teacherDob}
                                  onChange={(e) => setTeacherDob(e.target.value)}
                                  placeholder="DD-MM-YYYY"
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-850 font-bold focus:outline-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">State SSM ID</label>
                                <input
                                  type="text"
                                  required
                                  value={teacherSsm}
                                  onChange={(e) => setTeacherSsm(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-850 focus:outline-indigo-500 font-mono"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">APAAR CARD ID</label>
                                <input
                                  type="text"
                                  required
                                  value={teacherApaarId}
                                  onChange={(e) => setTeacherApaarId(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-850 font-bold focus:outline-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Student PEN no</label>
                                <input
                                  type="text"
                                  required
                                  value={teacherPen}
                                  onChange={(e) => setTeacherPen(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-850 font-bold focus:outline-indigo-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Father's Name</label>
                                <input
                                  type="text"
                                  required
                                  value={teacherFather}
                                  onChange={(e) => setTeacherFather(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Mother's Name</label>
                                <input
                                  type="text"
                                  required
                                  value={teacherMother}
                                  onChange={(e) => setTeacherMother(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-indigo-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Scholar no</label>
                                <input
                                  type="text"
                                  required
                                  value={teacherScholar}
                                  onChange={(e) => setTeacherScholar(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-850 font-mono focus:outline-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Registry Serial</label>
                                <input
                                  type="text"
                                  required
                                  value={teacherSerial}
                                  onChange={(e) => setTeacherSerial(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-850 font-mono focus:outline-indigo-500"
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 pt-3">
                              <button
                                type="submit"
                                className="flex-1 bg-indigo-650 hover:bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest py-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all duration-155 active:scale-95 cursor-pointer"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Save Registry Record</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => window.print()}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-widest py-3 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition-all"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print card</span>
                              </button>
                            </div>
                          </form>
                        </div>

                        {/* Live Digital APAAR ID Card Display */}
                        <div className="space-y-4 text-center">
                          <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block font-mono">LIVE IDENTITY CARD PREVIEW</span>

                          {/* Card Container block absolute printable */}
                          <div 
                            id="apaar-card-printable"
                            className="w-full max-w-[420px] mx-auto bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-indigo-700 relative overflow-hidden"
                          >
                            {/* Background graphic styling elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

                            {/* Card Header design */}
                            <div className="flex items-start justify-between border-b border-indigo-550 pb-2 mb-3 relative">
                              <div className="text-left">
                                <span className="block text-[7px] text-indigo-200 uppercase font-bold tracking-widest leading-none">Government of India</span>
                                <h4 className="text-[11px] font-black tracking-wider text-white uppercase leading-tight font-sans mt-0.5">APAAR Registry Authority</h4>
                                <span className="text-[6.5px] text-indigo-300 block font-mono mt-0.5">ONE NATION • ONE STUDENT CARD</span>
                              </div>
                              <span className="text-[5.5px] bg-indigo-500/30 text-indigo-250 border border-indigo-400/20 px-1 py-0.5 rounded font-black font-mono tracking-wider shrink-0 uppercase leading-none">
                                ACADEMIC CARD
                              </span>
                            </div>

                            {/* Card Fields Grid */}
                            <div className="grid grid-cols-3 gap-3 text-left relative z-10">
                              {/* Left column: student avatar */}
                              <div className="col-span-1 flex flex-col items-center justify-start space-y-1">
                                <div className="w-16 h-20 rounded-lg border border-indigo-550 bg-indigo-900 flex flex-col items-center justify-center p-1 shadow-sm shrink-0">
                                  <User className="w-8 h-8 text-indigo-200" />
                                  <span className="text-[9px] font-mono font-extrabold text-white mt-1">
                                    {selectedApaarStudent.name ? selectedApaarStudent.name.substring(0, 2) : "ST"}
                                  </span>
                                </div>
                                <span className="text-[6px] font-mono font-black text-indigo-300 tracking-wider block text-center truncate w-full">
                                  {selectedApaarStudent.rollNo}
                                </span>
                              </div>

                              {/* Middle-Right details block */}
                              <div className="col-span-2 space-y-1.5 font-sans">
                                <div>
                                  <span className="block text-[6px] text-indigo-305 uppercase font-medium leading-none">Student Name</span>
                                  <span className="text-[10.5px] font-extrabold text-white leading-tight block truncate tracking-wide">{teacherName || "-"}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5">
                                  <div>
                                    <span className="block text-[5.5px] text-indigo-305 uppercase font-medium leading-none font-sans">DOB</span>
                                    <span className="text-[8px] font-bold text-slate-100 block">{teacherDob || "-"}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[5.5px] text-indigo-305 uppercase font-medium leading-none font-sans">PEN Number</span>
                                    <span className="text-[8px] font-bold text-slate-100 block font-mono">{teacherPen || "-"}</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5">
                                  <div>
                                    <span className="block text-[5.5px] text-indigo-305 uppercase font-medium leading-none">Father's Name</span>
                                    <span className="text-[7.5px] font-semibold text-slate-200 block truncate">{teacherFather || "-"}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[5.5px] text-indigo-305 uppercase font-medium leading-none">Mother's Name</span>
                                    <span className="text-[7.5px] font-semibold text-slate-200 block truncate">{teacherMother || "-"}</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5 pt-0.5 border-t border-indigo-800/40">
                                  <div>
                                    <span className="block text-[5.5px] text-indigo-305 uppercase font-medium leading-none font-sans">Scholar No</span>
                                    <span className="text-[7.5px] font-mono text-slate-100 block truncate">{teacherScholar || "-"}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[5.5px] text-indigo-305 uppercase font-medium leading-none font-sans">SSM ID</span>
                                    <span className="text-[7.5px] font-mono text-slate-100 block truncate">{teacherSsm || "-"}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Card Footer barcode */}
                            <div className="mt-4 pt-2 border-t border-indigo-800/60 flex items-center justify-between text-left relative">
                              <div>
                                <span className="block text-[5px] text-indigo-350 uppercase tracking-widest font-mono">APAAR ID NUMBER</span>
                                <span className="text-[9.5px] font-black font-mono text-indigo-300 tracking-wider">
                                  {teacherApaarId ? teacherApaarId.replace(/(\d{4})(?=\d)/g, '$1 - ') : "---- - ---- - ----"}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[4px] font-mono text-indigo-400 block uppercase leading-none">SERIAL REGISTRY NO</span>
                                <span className="text-[7px] font-mono text-slate-300 font-bold block">{teacherSerial || "N/A"}</span>
                              </div>
                            </div>

                            {/* Stamp design */}
                            <div className="absolute top-2.5 right-24 border border-indigo-400/20 bg-indigo-500/10 rounded-full w-7 h-7 flex items-center justify-center text-[5px] font-mono uppercase tracking-widest text-indigo-300 border-dashed animate-spin-slow pointer-events-none">
                              Gov. India
                            </div>
                          </div>
                          
                          <div className="bg-amber-50 border border-amber-205 rounded-xl p-3 text-left font-sans text-stone-800 text-[10.5px] leading-relaxed">
                            <strong>Official Clearances Notice:</strong> Teachers hold authorized administrative privileges to modify fields that are state mandated (such as state SSM-IDs, PEN registration tags, or scholarship indices) for any enrolled scholars. Use responsibly in alignment with academic credentials.
                          </div>
                        </div>

                      </div>
                    ) : (
                      <p className="text-xs text-slate-450 italic">Please select a student record from the directory sidebar panel to review credentials.</p>
                    )}
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
                        id="teacher-ledger-search-box"
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
                    <table className="w-full text-left border-collapse font-sans">
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
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
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
                                std.id === selectedApaarStudentId ? "bg-indigo-50/35" : ""
                              }`}
                            >
                              <td className="py-3 px-4 text-center font-bold text-slate-400">{index + 1}</td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-600">{std.serialNumber || `SN-${index + 101}`}</td>
                              <td className="py-3 px-4 font-bold text-slate-800 flex items-center space-x-2">
                                <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center font-mono text-[9px] font-extrabold shrink-0">
                                  {std.name ? std.name.substring(0, 2) : "ST"}
                                </div>
                                <span>{std.name}</span>
                                {std.id === selectedApaarStudentId && (
                                  <span className="text-[8px] bg-indigo-150 text-indigo-750 px-1.5 py-0.2 rounded font-extrabold uppercase ml-1">Selected</span>
                                )}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-550">{std.rollNo || "N/A"}</td>
                              <td className="py-3 px-4 font-mono text-indigo-650 font-bold">{std.apparId || "Pending"}</td>
                              <td className="py-3 px-4 font-mono text-slate-805 font-bold">{std.penNumber || "Pending"}</td>
                              <td className="py-3 px-4 text-slate-650 font-medium">{std.dob || "N/A"}</td>
                              <td className="py-3 px-4 text-slate-655 font-medium">{std.fatherName || "N/A"}</td>
                              <td className="py-3 px-4 text-slate-655 font-medium">{std.motherName || "N/A"}</td>
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

            {/* NEW EXCLUSIVE TAB: CREATE TEST SCHEDULER PANEL */}
            {activeTab === "createTest" && (
              <div className="space-y-6 text-left animate-fadeIn">
                {/* Header Banner */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 text-left">
                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600 font-bold shrink-0">
                      <PlusCircle className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-black text-slate-850 uppercase tracking-widest font-sans">
                        Dynamic Assessment Compiler
                      </h4>
                      <p className="text-xs text-slate-500 font-sans mt-0.5">
                        Compile custom examination papers, program rigorous student questions, and send them to the admin registry desk for live activation approvals.
                      </p>
                    </div>
                  </div>
                  <div className="text-xs bg-purple-50 border border-purple-100 font-mono text-purple-700 font-bold px-3.5 py-2 rounded-xl shrink-0">
                    Proctor State: Secure Sandbox Built
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Side: Test Settings */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!createTestBatchId) {
                        alert("Please select a target batch first!");
                        return;
                      }
                      if (!createTestTitle.trim()) {
                        alert("Please specify a test title!");
                        return;
                      }

                      const calculatedMaxMarks = createQuestionsList.length > 0 
                        ? createQuestionsList.reduce((sum, q) => sum + (q.markWeight || 0), 0)
                        : createTestMaxMarks;

                      const compiledTest: Test = {
                        id: "test_" + Date.now(),
                        batchId: createTestBatchId,
                        title: createTestTitle,
                        date: createTestDate || new Date().toISOString().split("T")[0],
                        maxMarks: calculatedMaxMarks,
                        scores: {},
                        questions: createQuestionsList.length > 0 ? createQuestionsList : undefined,
                        isLive: createIsSecureLive,
                        isAdminApproved: false, // Sent to admin for verification
                        subject: createTestSubject || undefined,
                        requireLabAllotment: createRequireLab,
                        examKey: createExamKey.trim() || undefined
                      };

                      onAddTest(compiledTest);
                      
                      // Reset fields
                      setCreateTestBatchId("");
                      setCreateTestTitle("");
                      setCreateTestMaxMarks(100);
                      setCreateTestDate("");
                      setCreateTestSubject("");
                      setCreateQuestionsList([]);
                      setCreateIsSecureLive(true);
                      setCreateRequireLab(false);
                      setCreateExamKey("");
                      
                      alert("Success! Your test has been queued for Admin verification. Once approved by the administrator, students will be authorized to lock into the exam session.");
                    }}
                    className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-5"
                  >
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                        1. Assessment Specifications
                      </h5>
                    </div>

                    {/* Choose Batch */}
                    <div className="space-y-1 text-left">
                      <label className="block text-[10px] uppercase font-bold text-slate-500">Target Group Section *</label>
                      <select
                        required
                        value={createTestBatchId}
                        onChange={(e) => setCreateTestBatchId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-800 focus:outline-indigo-505 font-medium"
                      >
                        <option value="">-- Choose Assigned Student Group --</option>
                        {teacherBatches.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.code} - {b.subject})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subject Selector */}
                    <div className="space-y-1 text-left">
                      <label className="block text-[10px] uppercase font-bold text-slate-500">Assessment Subject *</label>
                      <select
                        value={createTestSubject}
                        onChange={(e) => {
                          if (e.target.value === "__NEW__") {
                            setShowCreateSubjectInput(true);
                          } else {
                            setCreateTestSubject(e.target.value);
                            setShowCreateSubjectInput(false);
                          }
                        }}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-800 focus:outline-indigo-505 font-medium"
                      >
                        <option value="">-- Choose Subject Tag --</option>
                        {subjects.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                        <option value="__NEW__" className="text-red-650 font-bold">+ Register New Subject...</option>
                      </select>
                    </div>

                    {showCreateSubjectInput && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-250 flex items-center gap-3 animate-fadeIn">
                        <div className="flex-1">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">New Subject Name</label>
                          <input
                            type="text"
                            value={customCreateSubjectName}
                            onChange={e => setCustomCreateSubjectName(e.target.value)}
                            placeholder="e.g. Organic Chemistry, Linear Algebra"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-850"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (customCreateSubjectName.trim()) {
                              onAddSubject?.(customCreateSubjectName.trim());
                              setCreateTestSubject(customCreateSubjectName.trim());
                              setCustomCreateSubjectName("");
                              setShowCreateSubjectInput(false);
                            }
                          }}
                          className="bg-red-600 hover:bg-black text-white hover:text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase cursor-pointer transition-all shrink-0 mt-4.5"
                        >
                          Save & Tag
                        </button>
                      </div>
                    )}

                    {/* Test Title */}
                    <div className="space-y-1 text-left">
                      <label className="block text-[10px] uppercase font-bold text-slate-500">Test Title / Paper Name *</label>
                      <input
                        type="text"
                        required
                        value={createTestTitle}
                        onChange={(e) => setCreateTestTitle(e.target.value)}
                        placeholder="e.g. Calculus Limit Theory Term Exam"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-505 font-medium"
                      />
                    </div>

                    {/* Date Details */}
                    <div className="space-y-1 text-left">
                      <label className="block text-[10px] uppercase font-bold text-slate-500">Scheduled Date</label>
                      <input
                        type="date"
                        value={createTestDate}
                        onChange={(e) => setCreateTestDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-indigo-505 font-medium"
                      />
                    </div>

                    {/* Marks and Settings */}
                    <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-100 dark:border-slate-850 pb-4">
                      <div className="space-y-1 text-left">
                        <label className="block text-[10px] uppercase font-bold text-slate-500">Max Weight Marks</label>
                        <input
                          type="number"
                          value={createQuestionsList.length > 0 
                            ? createQuestionsList.reduce((sum, q) => sum + (q.markWeight || 0), 0) 
                            : createTestMaxMarks}
                          onChange={(e) => setCreateTestMaxMarks(Number(e.target.value) || 100)}
                          disabled={createQuestionsList.length > 0}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium disabled:bg-slate-50/50"
                        />
                        {createQuestionsList.length > 0 && (
                          <span className="text-[9px] text-slate-400 block font-mono font-bold">Auto-calculated from items</span>
                        )}
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="block text-[10px] uppercase font-bold text-slate-500">Assessed Exam Proctor</label>
                        <select
                          value={createIsSecureLive ? "secure" : "practice"}
                          onChange={(e) => setCreateIsSecureLive(e.target.value === "secure")}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-505 font-medium"
                        >
                          <option value="secure">Proctored Live Exam 🔒</option>
                          <option value="practice">Practice Practice Mock</option>
                        </select>
                      </div>
                    </div>

                    {/* Lab & Exam Key Options as requested */}
                    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <label className="block text-[10px] uppercase font-extrabold text-slate-700">Lab Seat Allotment (Require Lab)</label>
                          <p className="text-[9px] text-slate-400 leading-tight">Requires verified identification and computer desk allotment before starting</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={createRequireLab}
                          onChange={(e) => setCreateRequireLab(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="block text-[10px] uppercase font-extrabold text-slate-700">Exam Key (Secret Passcode)</label>
                        <input
                          type="text"
                          value={createExamKey}
                          onChange={(e) => setCreateExamKey(e.target.value)}
                          placeholder="e.g. EXAM-CHEM-101 (optional)"
                          className="w-full bg-white rounded-lg border border-slate-250 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-550 font-mono font-bold"
                        />
                        <p className="text-[9px] text-slate-405 leading-snug">The instructor or proctor must share this key to initiate the examination session</p>
                      </div>
                    </div>

                    {/* RED BUTTON, HOVER BLACK, AS REQUESTED */}
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-black text-white border border-red-600 hover:border-black font-black text-xs uppercase tracking-widest px-6 py-4 rounded-xl transition-colors duration-200 cursor-pointer shadow-md flex items-center justify-center space-x-2 w-full"
                    >
                      <PlusCircle className="w-4 h-4 text-white" />
                      <span>Create & Request Live Live</span>
                    </button>
                    <p className="text-[10px] text-slate-400 text-center leading-relaxed font-sans italic">
                      Instructors design the curriculum. The Registry Admin Desk will verify credentials, vet content, and toggle live availability.
                    </p>
                  </form>

                  {/* Right Side: Question Constructor */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Left/Interactive: Build Question Box */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-left space-y-4">
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                        <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                          2. Syllabus Question Composer
                        </h5>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded-full">
                          Draft: {createQuestionsList.length} programmed
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Question type selector */}
                        <div className="space-y-1 text-left">
                          <label className="block text-[10px] uppercase font-bold text-slate-500">Rigor Type</label>
                          <select
                            value={createSingleQType}
                            onChange={(e) => setCreateSingleQType(e.target.value as any)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                          >
                            <option value="MCQ">Multiple Choice (MCQ)</option>
                            <option value="True/False">True / False Choice</option>
                            <option value="Written">Written Comprehensive response</option>
                          </select>
                        </div>

                        {/* Marks weight */}
                        <div className="space-y-1 text-left">
                          <label className="block text-[10px] uppercase font-bold text-slate-500">Marks Weight</label>
                          <input
                            type="number"
                            min={1}
                            value={createSingleQWeight}
                            onChange={(e) => setCreateSingleQWeight(Number(e.target.value) || 5)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                          />
                        </div>
                      </div>

                      {/* Question Content */}
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold text-slate-400">Rigor Prompt Question Text *</label>
                        <textarea
                          rows={2}
                          value={createSingleQText}
                          onChange={(e) => setCreateSingleQText(e.target.value)}
                          placeholder="Write the academic assessment challenge question prompt clearly..."
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>

                      {/* Conditional Options if MCQ */}
                      {createSingleQType === "MCQ" && (
                        <div className="space-y-2.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Set MCQ Option Text Selection Grid</span>
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[9px] text-slate-400 font-mono">Option A</label>
                              <input
                                type="text"
                                value={createSingleQOptA}
                                onChange={(e) => setCreateSingleQOptA(e.target.value)}
                                placeholder="Core Choice Option A"
                                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-slate-400 font-mono">Option B</label>
                              <input
                                type="text"
                                value={createSingleQOptB}
                                onChange={(e) => setCreateSingleQOptB(e.target.value)}
                                placeholder="Core Choice Option B"
                                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-slate-400 font-mono">Option C</label>
                              <input
                                type="text"
                                value={createSingleQOptC}
                                onChange={(e) => setCreateSingleQOptC(e.target.value)}
                                placeholder="Choice Option C"
                                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-slate-400 font-mono">Option D</label>
                              <input
                                type="text"
                                value={createSingleQOptD}
                                onChange={(e) => setCreateSingleQOptD(e.target.value)}
                                placeholder="Choice Option D"
                                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-800"
                              />
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200/20">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Answer Selection Key</label>
                            <select
                              value={createSingleQCorrectAnswer}
                              onChange={(e) => setCreateSingleQCorrectAnswer(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                            >
                              <option value="">-- Choose correct choice option key --</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* True or False Options */}
                      {createSingleQType === "True/False" && (
                        <div className="space-y-1 leading-normal text-left bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50">
                          <label className="block text-[10px] uppercase font-bold text-slate-500">Correct Verification Value</label>
                          <select
                            value={createSingleQCorrectAnswer}
                            onChange={(e) => setCreateSingleQCorrectAnswer(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-800"
                          >
                            <option value="">-- Choose key --</option>
                            <option value="True">True</option>
                            <option value="False">False</option>
                          </select>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (!createSingleQText.trim()) {
                            alert("Please supply prompt question text for this draft key.");
                            return;
                          }
                          const newQ: TestQuestion = {
                            id: "q_" + Date.now(),
                            section: "Curriculum Objective",
                            type: createSingleQType,
                            questionText: createSingleQText,
                            options: createSingleQType === "MCQ" 
                              ? [createSingleQOptA || "A", createSingleQOptB || "B", createSingleQOptC || "C", createSingleQOptD || "D"]
                              : undefined,
                            correctAnswer: createSingleQType !== "Written" 
                              ? createSingleQCorrectAnswer || "A" 
                              : undefined,
                            markWeight: createSingleQWeight
                          };

                          setCreateQuestionsList(prev => [...prev, newQ]);
                          
                          // reset fields
                          setCreateSingleQText("");
                          setCreateSingleQOptA("");
                          setCreateSingleQOptB("");
                          setCreateSingleQOptC("");
                          setCreateSingleQOptD("");
                          setCreateSingleQCorrectAnswer("");
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl cursor-pointer shadow-xs transition-colors"
                      >
                        Add to exam paper draft
                      </button>
                    </div>

                    {/* Show Draft list */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs text-left space-y-4">
                      <span className="text-[10px] uppercase font-black text-slate-450 tracking-wider block">Compiled Questions Overview ({createQuestionsList.length})</span>
                      
                      {createQuestionsList.length === 0 ? (
                        <div className="py-8 text-center text-slate-450 text-xs italic">
                          No questions programmed. Draft items using the prompt composer interface above to assemble your testing paper.
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                          {createQuestionsList.map((q, idx) => (
                            <div key={q.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/50 relative">
                              <button
                                type="button"
                                onClick={() => setCreateQuestionsList(createQuestionsList.filter((_, i) => i !== idx))}
                                className="absolute top-2.5 right-2.5 text-slate-450 hover:text-rose-600 transition-colors"
                                title="Discard Question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <div className="flex items-center space-x-2 text-[10px] font-mono mb-1.5">
                                <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-black text-[9px] uppercase">
                                  Q{idx + 1} • {q.type}
                                </span>
                                <span className="text-slate-450 font-bold">• {q.markWeight} Marks</span>
                              </div>
                              <p className="text-xs text-slate-700 font-bold leading-normal">{q.questionText}</p>
                              {q.options && (
                                <div className="mt-1.5 grid grid-cols-2 gap-1 text-[10px] text-slate-500 font-sans">
                                  {q.options.map((opt, oIdx) => (
                                    <span key={oIdx} className="truncate">
                                      <strong>{["A","B","C","D"][oIdx]}:</strong> {opt}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {q.correctAnswer && (
                                <p className="text-[10px] text-emerald-650 font-sans font-bold mt-1.5">
                                  Correct Key: {q.correctAnswer}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STUDENT DIRECTORY & REGISTRATION DESK */}
            {activeTab === "student-management" && (
              <div id="teacher-student-management-section" className="space-y-6 text-left animate-fadeIn">
                
                {/* Header Banner */}
                <div id="student-management-banner" className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 text-left">
                    <div className="p-3 bg-indigo-550/15 rounded-xl text-indigo-400 font-bold shrink-0">
                      <UserPlus className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="text-left">
                      <h4 id="student-management-title" className="text-sm font-black text-indigo-400 uppercase tracking-widest font-sans">
                        Student Admission Desk & Registry
                      </h4>
                      <p className="text-xs text-slate-350 font-sans mt-0.5">
                        Enroll and onboard new scholars directly into your active course cohorts. Logged under institutional verification ring.
                      </p>
                    </div>
                  </div>
                  <div className="text-xs bg-indigo-950/40 border border-indigo-500/20 font-mono text-indigo-300 font-bold px-3.5 py-2 rounded-xl shrink-0">
                    Faculty Role: Direct Registrar
                  </div>
                </div>

                {/* Inline Success Notice */}
                {regSuccessMsg && (
                  <div id="reg-success-banner" className="bg-emerald-50 border-2 border-emerald-500/40 p-4 rounded-xl text-emerald-800 text-xs font-semibold font-sans animate-scaleUp flex items-start space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-extrabold text-[13px] leading-tight text-emerald-900 font-sans">Enrolled Student Authenticated</p>
                      <p className="font-sans font-medium">{regSuccessMsg}</p>
                    </div>
                  </div>
                )}

                {/* Principal Workspace Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* LEFT: Enrollment Form (RESTRICTED) */}
                  <div className="lg:col-span-4 bg-slate-50 p-6 rounded-2xl border border-slate-200/60 shadow-inner space-y-4 text-center flex flex-col justify-center items-center">
                    <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                      <Lock className="w-6 h-6 text-rose-600" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-black text-rose-800 uppercase tracking-widest font-sans">
                        Enrollment Restricted
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-medium">
                        Student logins and academic credentials can only be authorized by the School Principal or Central Admin. 
                        Faculty instructors do not hold write privileges over the credential vault. Please contact administration to register new scholars.
                      </p>
                    </div>
                    <div className="w-full bg-white p-3 rounded-xl border border-slate-150 text-left font-mono text-[9px] text-slate-400">
                      🔒 STATUS: VAULT_ACCESS_DENIED <br />
                      // Role Teacher: READ_ONLY
                    </div>
                  </div>

                  {/* RIGHT: Active School Roster Directory */}
                  <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-left">
                        <h5 className="text-sm font-black text-slate-850 uppercase tracking-wider font-sans">
                          School Registry Roster
                        </h5>
                        <p className="text-[10px] text-slate-400 font-medium font-sans">Verified active students allocated in allied school branches</p>
                      </div>
                      
                      {/* Search filter input */}
                      <div className="relative w-full sm:w-48 font-sans">
                        <input
                          id="search-roster-students"
                          type="text"
                          value={studentSearchText}
                          onChange={(e) => setStudentSearchText(e.target.value)}
                          placeholder="Search name/roll..."
                          className="w-full bg-slate-50 border border-slate-150 rounded-xl py-1.5 pl-3 pr-8 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500 shadow-inner"
                        />
                        {studentSearchText && (
                          <button
                            onClick={() => setStudentSearchText("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-sans text-xs"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Students directory list table */}
                    <div className="overflow-x-auto rounded-xl border border-slate-150 font-sans">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-150 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                            <th className="py-2.5 px-4 font-black">Student Name</th>
                            <th className="py-2.5 px-4 font-mono font-black">Roll / ID</th>
                            <th className="py-2.5 px-4 font-black">Allocated Batch</th>
                            <th className="py-2.5 px-4 text-center font-black">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                          {(() => {
                            const filtered = students.filter(s => {
                              if (!studentSearchText.trim()) return true;
                              const search = studentSearchText.toLowerCase();
                              return s.name.toLowerCase().includes(search) || s.rollNo.toLowerCase().includes(search);
                            });

                            if (filtered.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={4} className="py-8 text-center text-slate-400 italic font-sans font-medium">
                                    No registered scholars found matching your filter criteria.
                                  </td>
                                </tr>
                              );
                            }

                            return filtered.map(s => {
                              const b = rawBatches.find(bat => bat.id === s.batchId);
                              return (
                                <tr key={s.id} className="hover:bg-slate-50/40">
                                  <td className="py-2.5 px-4 flex items-center space-x-2.5">
                                    <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 font-mono text-[9px] font-black flex items-center justify-center uppercase shrink-0">
                                      {s.name ? s.name.substring(0, 2) : "ST"}
                                    </div>
                                    <div className="min-w-0 text-left">
                                      <span className="font-extrabold text-slate-800 block truncate">{s.name}</span>
                                      <span className="text-[9px] text-slate-400 truncate block font-mono font-medium">{s.email}</span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-4 font-mono font-bold text-slate-500">
                                    {s.rollNo}
                                  </td>
                                  <td className="py-2.5 px-4 text-left">
                                    {b ? (
                                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[9.5px]">
                                        {b.name} ({b.code})
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 italic text-[10px] font-medium">Unassigned</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-4 text-center">
                                    <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full ${
                                      s.status === "Active" 
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-250" 
                                        : "bg-slate-100 text-slate-500 border border-slate-200"
                                    }`}>
                                      {s.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* -------------------- ONLINE ADMISSION FORM & REGISTRY -------------------- */}
            {activeTab === "admissions" && (
              <div className="space-y-6 text-left animate-fadeIn">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-purple-650 to-indigo-850 p-6 rounded-2xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black uppercase tracking-wider flex items-center space-x-2">
                      <ClipboardList className="w-5 h-5 text-purple-200 animate-pulse" />
                      <span>Online Admission Desk</span>
                    </h3>
                    <p className="text-xs text-purple-100 max-w-2xl font-sans">
                      Fill out student admission forms directly. Submitted requests are sent to the Admin Board for review and approval, triggering Roll & Enrollment allocation.
                    </p>
                  </div>
                </div>

                {/* Main Interactive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Register Student Form */}
                  <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 h-fit">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-700 pb-2 border-b border-slate-100 flex items-center space-x-2">
                      <Plus className="w-4 h-4 text-purple-600" />
                      <span>New Candidate Admission Form</span>
                    </h4>
                    
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!admStudentName || !admEmail || !admMobileNumber || !admDob || !admFatherName || !admMotherName || !admBatchId) {
                          alert("Please fill all mandatory fields!");
                          return;
                        }

                        // Generate unique candidate ID
                        const requestId = "ADM-" + Date.now().toString().slice(-6);
                        const currentTeacherObj = teachers.find(t => t.id === loggedInTeacherId);
                        const teacherNameVal = currentTeacherObj ? currentTeacherObj.name : "Faculty Teacher";

                        const newRequest: AdmissionRequest = {
                          id: requestId,
                          studentName: admStudentName,
                          email: admEmail,
                          mobileNumber: admMobileNumber,
                          dob: admDob,
                          fatherName: admFatherName,
                          motherName: admMotherName,
                          batchId: admBatchId,
                          teacherId: loggedInTeacherId || "teacher_1",
                          teacherName: teacherNameVal,
                          status: "Pending",
                          createdAt: new Date().toISOString()
                        };

                        setAdmissionRequests(prev => [newRequest, ...prev]);

                        // Reset form fields
                        setAdmStudentName("");
                        setAdmEmail("");
                        setAdmMobileNumber("");
                        setAdmDob("");
                        setAdmFatherName("");
                        setAdmMotherName("");
                        setAdmBatchId("");

                        alert(`Admission request ${requestId} submitted successfully to the Admin!`);
                      }}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-1 gap-3">
                        {/* Student Name */}
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                            Student Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={admStudentName}
                            onChange={(e) => setAdmStudentName(e.target.value)}
                            placeholder="Enter full name"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-purple-500 text-slate-800"
                          />
                        </div>

                        {/* DOB & Phone */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                              Date of Birth *
                            </label>
                            <input
                              type="date"
                              required
                              value={admDob}
                              onChange={(e) => setAdmDob(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-purple-500 text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                              Mobile Number *
                            </label>
                            <input
                              type="tel"
                              required
                              pattern="[0-9]{10}"
                              placeholder="10-digit number"
                              value={admMobileNumber}
                              onChange={(e) => setAdmMobileNumber(e.target.value.replace(/\D/g, '').slice(0,10))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-purple-500 text-slate-800"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={admEmail}
                            onChange={(e) => setAdmEmail(e.target.value)}
                            placeholder="student@example.com"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-purple-500 text-slate-800"
                          />
                        </div>

                        {/* Father & Mother names */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                              Father's Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={admFatherName}
                              onChange={(e) => setAdmFatherName(e.target.value)}
                              placeholder="Father's name"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-purple-500 text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                              Mother's Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={admMotherName}
                              onChange={(e) => setAdmMotherName(e.target.value)}
                              placeholder="Mother's name"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-purple-500 text-slate-800"
                            />
                          </div>
                        </div>

                        {/* Choose Batch */}
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                            Enroll in Target Batch *
                          </label>
                          <select
                            required
                            value={admBatchId}
                            onChange={(e) => setAdmBatchId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-purple-500 text-slate-800 font-sans"
                          >
                            <option value="">-- Choose target batch --</option>
                            {rawBatches.map(b => (
                              <option key={b.id} value={b.id}>
                                {b.name} ({b.subject} - {b.schedule})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-550 hover:to-indigo-550 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer border border-transparent"
                      >
                        <PlusCircle className="w-4 h-4 text-purple-200" />
                        <span>Submit & Request Admin Approval</span>
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Submitted Admissions Registry */}
                  <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">
                        My Registered Candidates & Approvals
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        Showing {admissionRequests.filter(r => r.teacherId === loggedInTeacherId).length} candidates
                      </span>
                    </div>

                    {admissionRequests.filter(r => r.teacherId === loggedInTeacherId).length === 0 ? (
                      <div className="text-center py-16 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                        <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-500">No candidate requests registered by you yet.</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Use the registry panel on the left to add a candidate.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                        {admissionRequests
                          .filter(r => r.teacherId === loggedInTeacherId)
                          .map((req) => {
                            const bObj = rawBatches.find(b => b.id === req.batchId);
                            const displayDate = new Date(req.createdAt).toLocaleString('en-IN', {
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
                                    ? "bg-emerald-50/20 border-emerald-100"
                                    : req.status === "Rejected"
                                    ? "bg-rose-50/20 border-rose-100"
                                    : "bg-slate-50/40 border-slate-100 hover:border-slate-200"
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs font-extrabold text-slate-800">
                                        {req.studentName}
                                      </span>
                                      <span className="text-[10px] font-mono font-bold text-slate-400">
                                        ({req.id})
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 font-sans">
                                      <b>Target Batch:</b> {bObj ? bObj.name : "N/A"}<br />
                                      <b>Parentage:</b> F: {req.fatherName} | M: {req.motherName}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-mono">
                                      Registered: {displayDate}
                                    </p>
                                  </div>

                                  <div className="flex flex-col items-end gap-2 shrink-0">
                                    {req.status === "Approved" ? (
                                      <div className="text-right space-y-1">
                                        <span className="inline-block px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-lg">
                                          Approved & Enrolled
                                        </span>
                                        <div className="text-[10px] text-emerald-800 font-mono leading-none">
                                          Roll No: <b>{req.rollNo}</b><br />
                                          Enroll No: <b>{req.enrollmentNo}</b>
                                        </div>
                                      </div>
                                    ) : req.status === "Rejected" ? (
                                      <span className="inline-block px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 rounded-lg">
                                        Rejected
                                      </span>
                                    ) : (
                                      <span className="inline-block px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 rounded-lg animate-pulse">
                                        Awaiting Approval
                                      </span>
                                    )}

                                    <button
                                      onClick={() => setAdmSelectedRequest(req)}
                                      className="mt-1 px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-700 rounded-lg flex items-center space-x-1 transition-colors cursor-pointer"
                                    >
                                      <Printer className="w-3.5 h-3.5 text-purple-600" />
                                      <span>Print Admission Slip</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Print Template Preview Modal */}
                {admSelectedRequest && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
                      {/* Modal Header */}
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between no-print">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center space-x-2">
                          <Printer className="w-4 h-4 text-purple-600" />
                          <span>Admission Slip Printer Hub</span>
                        </span>
                        <button
                          onClick={() => setAdmSelectedRequest(null)}
                          className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>

                      {/* Modal Printable Sheet Container */}
                      <div id="admission-slip-printable" className="p-8 bg-white text-slate-800 text-left relative font-sans leading-relaxed">
                        
                        {/* Elegant Border Wrapper */}
                        <div className="border-4 border-double border-indigo-950 p-6 rounded-2xl relative">
                          
                          {/* Simulated stamp & seal badge watermark background */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none select-none text-center">
                            <Award className="w-80 h-80 mx-auto text-indigo-950" />
                          </div>

                          {/* Letterhead */}
                          <div className="text-center space-y-1.5 pb-4 border-b-2 border-indigo-950">
                            <h2 className="text-xl font-black uppercase tracking-wider text-indigo-950 flex items-center justify-center space-x-2">
                              <span>🎓 MP DIGITAL SCHOOL OF EXCELLENCE</span>
                            </h2>
                            <p className="text-[10px] tracking-widest text-indigo-900 font-mono font-bold">
                              IIT-JEE, NEET & SENIOR SECONDARY FOUNDATION COACHING HUB
                            </p>
                            <p className="text-[9px] text-slate-500 font-mono">
                              Affiliated to National Boards • Digital Lab Campus Center • Web: mpdigitalschool.com
                            </p>
                          </div>

                          {/* Subject Title */}
                          <div className="my-4 text-center">
                            <span className="px-4 py-1.5 bg-indigo-50 border border-indigo-950 rounded-full text-xs font-black uppercase tracking-widest text-indigo-950">
                              Official Admission Enrollment Slip
                            </span>
                          </div>

                          {/* Metadata Fields */}
                          <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                            <div className="space-y-1">
                              <p><b>Candidate Reg ID:</b> <span className="font-mono text-indigo-750 font-black">{admSelectedRequest.id}</span></p>
                              <p><b>Student Name:</b> <span className="text-slate-800 font-semibold">{admSelectedRequest.studentName}</span></p>
                              <p><b>Date of Birth:</b> <span className="text-slate-700">{new Date(admSelectedRequest.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                              <p><b>Mobile Number:</b> <span className="text-slate-700 font-mono">{admSelectedRequest.mobileNumber}</span></p>
                              <p><b>Email Address:</b> <span className="text-slate-700">{admSelectedRequest.email}</span></p>
                            </div>
                            <div className="space-y-1 pl-4 border-l border-slate-200">
                              <p><b>Father's Name:</b> <span className="text-slate-700">{admSelectedRequest.fatherName}</span></p>
                              <p><b>Mother's Name:</b> <span className="text-slate-700">{admSelectedRequest.motherName}</span></p>
                              <p><b>Enrolled Batch:</b> <span className="font-semibold text-slate-800">{(rawBatches.find(b => b.id === admSelectedRequest.batchId))?.name || "N/A"}</span></p>
                              <p><b>Registered By:</b> <span className="text-slate-600">{admSelectedRequest.teacherName} (Faculty)</span></p>
                              <p><b>Status:</b> <span className={`font-bold ${admSelectedRequest.status === "Approved" ? "text-emerald-700" : "text-amber-700"}`}>{admSelectedRequest.status}</span></p>
                            </div>
                          </div>

                          {/* Allocation credentials (if Approved) */}
                          {admSelectedRequest.status === "Approved" ? (
                            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-300 rounded-xl grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider block">ALLOCATED STUDENT ROLL NUMBER</span>
                                <span className="text-lg font-black text-emerald-900 font-mono tracking-wider">{admSelectedRequest.rollNo}</span>
                              </div>
                              <div className="pl-4 border-l border-emerald-200">
                                <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider block">ALLOCATED ENROLLMENT NO</span>
                                <span className="text-lg font-black text-emerald-900 font-mono tracking-wider">{admSelectedRequest.enrollmentNo}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-6 p-4 bg-amber-50 border border-amber-300 rounded-xl text-center text-xs text-amber-850">
                              ⚠️ <b>Admission Status: Awaiting Admin Review</b><br />
                              Roll number and official Enrollment certificate code will be generated dynamically once the Board Admin approves this registration dossier.
                            </div>
                          )}

                          {/* Terms / Notice footer */}
                          <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-[9px] text-slate-400 font-sans leading-tight">
                            <p>
                              1. This document is a digitally generated admission slip. All details have been verified by the respective class teacher.<br />
                              2. Approved students must report to their respective batch lecture timings on time.
                            </p>
                            <div className="text-right flex flex-col justify-end items-end pt-4">
                              <div className="w-32 border-t border-slate-800 text-center text-slate-700 pt-1 font-mono font-bold text-[9px]">
                                Registrar Seal / Stamp
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Modal Footer Controls */}
                      <div className="p-4 border-t border-slate-150 bg-slate-50 rounded-b-3xl flex justify-end space-x-3 no-print">
                        <button
                          onClick={() => setAdmSelectedRequest(null)}
                          className="px-4 py-2 text-xs font-black text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            const style = document.createElement('style');
                            style.innerHTML = `
                              @media print {
                                body * {
                                  visibility: hidden;
                                }
                                #admission-slip-printable, #admission-slip-printable * {
                                  visibility: visible;
                                }
                                #admission-slip-printable {
                                  position: absolute;
                                  left: 0;
                                  top: 0;
                                  width: 100%;
                                  margin: 0;
                                  padding: 0;
                                }
                              }
                            `;
                            document.head.appendChild(style);
                            window.print();
                            document.head.removeChild(style);
                          }}
                          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-550 hover:to-indigo-550 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Printer className="w-4 h-4 text-purple-100" />
                          <span>Trigger Print</span>
                        </button>
                      </div>
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
                                className="flex-1 bg-slate-550 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-indigo-500 disabled:opacity-50"
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

            {/* REGISTERED SCHOOLS READING-ONLY PORTFOLIO TAB PANEL */}
            {activeTab === ("schools" as any) && (
              <div className="space-y-6 text-left animate-fadeIn">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 text-left">
                    <div className="p-3 bg-red-50 rounded-xl text-red-650 font-bold shrink-0">
                      <School className="w-6 h-6 text-red-650" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest font-sans">
                        Registered Schools Portfolio
                      </h4>
                      <p className="text-xs text-slate-500 font-sans mt-0.5">
                        These are the affiliated educational school networks registered in the system. Teachers can view allotted associations, but cannot register or add schools herself.
                      </p>
                    </div>
                  </div>
                  <div className="text-xs bg-red-50 border border-red-100 font-mono text-red-700 font-bold px-3.5 py-2 rounded-xl shrink-0">
                    Directory Scope: Read Only
                  </div>
                </div>

                {schools.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-500 font-bold">No registered schools found in the directory.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schools.map(school => {
                      const isTeacherAllotted = activeTeacher?.schoolId === school.id;
                      return (
                        <div key={school.id} className={`p-5 rounded-2xl border transition-all text-left space-y-3 ${
                          isTeacherAllotted 
                            ? "bg-red-50/50 border-red-300 shadow-xs" 
                            : "bg-white border-slate-150"
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="bg-red-50 text-red-650 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg">
                              {school.code}
                            </span>
                            {isTeacherAllotted && (
                              <span className="text-[9px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Allotted School
                              </span>
                            )}
                          </div>
                          <div>
                            <h6 className="text-sm font-black text-slate-800">{school.name}</h6>
                            <p className="text-[11px] text-slate-400 font-medium mt-1">{school.address}</p>
                          </div>
                          <div className="pt-3 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-600">
                            <div>Principal: <strong className="text-slate-800 font-extrabold">{school.principalName}</strong></div>
                            <div className="font-mono text-[10px] text-slate-450 mt-0.5">Email: {school.principalEmail}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Watermark */}
      <div className="mt-12 border-t border-slate-100 pt-6 pb-2 text-center text-xs text-slate-400 font-medium font-sans no-print flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">© 2026 Vishveshwar Foundation Ltd.</span>
        <span className="text-[10px] bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full font-bold">Faculty Academic Console</span>
      </div>
    </div>
  );
}
