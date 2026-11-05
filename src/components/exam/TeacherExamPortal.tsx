import React, { useState, useMemo } from "react";
import {
  FileText,
  PlusCircle,
  Download,
  CheckCircle2,
  AlertCircle,
  Lock,
  Search,
  Filter,
  CreditCard,
  BookPlus,
  Edit3,
  Save,
  Trash2,
  ShieldAlert,
  KeyRound,
  Eye,
  Check,
  X
} from "lucide-react";
import {
  ExamForm,
  ExamSubject,
  ExamStudentMarksheet,
  BranchPIN,
  ExamPortalSettings,
  Student,
  StudyHubCenter,
  StudentExamMark
} from "../../types";
import { downloadStudentListPdf, downloadExamFormPdf } from "../../utils/examPdfGenerator";

interface TeacherExamPortalProps {
  currentTeacherId?: string;
  currentTeacherName?: string;
  examForms: ExamForm[];
  setExamForms: React.Dispatch<React.SetStateAction<ExamForm[]>>;
  examSubjects: ExamSubject[];
  setExamSubjects: React.Dispatch<React.SetStateAction<ExamSubject[]>>;
  examMarksheets: ExamStudentMarksheet[];
  setExamMarksheets: React.Dispatch<React.SetStateAction<ExamStudentMarksheet[]>>;
  onDeleteMarksheet?: (id: string) => void;
  branchPINs: BranchPIN[];
  examSettings: ExamPortalSettings;
  students: Student[];
  studyHubCenters: StudyHubCenter[];
}

export const TeacherExamPortal: React.FC<TeacherExamPortalProps> = ({
  currentTeacherId,
  currentTeacherName,
  examForms,
  setExamForms,
  examSubjects,
  setExamSubjects,
  examMarksheets,
  setExamMarksheets,
  onDeleteMarksheet,
  branchPINs,
  examSettings,
  students,
  studyHubCenters
}) => {
  const [activeTab, setActiveTab] = useState<"fillForm" | "studentsList" | "enterMarks" | "addSubject">("fillForm");

  // --- FORM FILLING STATE ---
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [formStudentName, setFormStudentName] = useState("");
  const [formRollNo, setFormRollNo] = useState("");
  const [formScholarNo, setFormScholarNo] = useState("");
  const [formFatherName, setFormFatherName] = useState("");
  const [formMotherName, setFormMotherName] = useState("");
  const [formDob, setFormDob] = useState("");
  const [formGender, setFormGender] = useState("Male");
  const [formMobile, setFormMobile] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formClass, setFormClass] = useState("Class 12");
  const [formBranchId, setFormBranchId] = useState(studyHubCenters[0]?.id || "center_bhopal");
  const [formExamSession, setFormExamSession] = useState(examSettings.activeExamSession || "Annual Board Examination 2026");
  const [formFeeStatus, setFormFeeStatus] = useState<"Paid" | "Unpaid">("Paid");
  const [formFeeAmount, setFormFeeAmount] = useState<number>(1200);
  const [formPaymentMethod, setFormPaymentMethod] = useState("Cash at Center Desk");
  const [formReceiptNo, setFormReceiptNo] = useState("REC-" + Math.floor(100000 + Math.random() * 900000));
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [formSuccessMessage, setFormSuccessMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");

  // Populate fields when registered student is picked
  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    const stud = students.find((s) => s.id === studentId);
    if (stud) {
      setFormStudentName(stud.name);
      setFormRollNo(stud.rollNo || "2601" + Math.floor(100 + Math.random() * 900));
      setFormScholarNo("SCH-2026-" + stud.rollNo);
      setFormEmail(stud.email || "");
      if (stud.batchName?.includes("10")) setFormClass("Class 10");
      else if (stud.batchName?.includes("11")) setFormClass("Class 11");
      else setFormClass("Class 12");
    }
  };

  // Filter subjects matching current class grade
  const availableSubjectsForClass = useMemo(() => {
    return examSubjects.filter((s) => s.classGrade.toLowerCase().includes(formClass.toLowerCase().slice(0, 8)));
  }, [examSubjects, formClass]);

  const handleToggleSubject = (subjectId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  const handleSaveExamForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMessage("");
    setFormSuccessMessage("");

    if (examSettings.isFormLocked) {
      setFormErrorMessage("Cannot submit form: Exam registration is currently locked by the Administrator.");
      return;
    }

    if (!formStudentName.trim() || !formRollNo.trim()) {
      setFormErrorMessage("Please provide student name and roll number.");
      return;
    }

    if (selectedSubjectIds.length === 0) {
      setFormErrorMessage("Please select at least one registered exam subject.");
      return;
    }

    const branchObj = studyHubCenters.find((c) => c.id === formBranchId);
    const chosenSubjects = examSubjects
      .filter((s) => selectedSubjectIds.includes(s.id))
      .map((s) => ({
        subjectId: s.id,
        subjectName: s.subjectName,
        subjectCode: s.subjectCode,
        theoryMaxMarks: s.theoryMaxMarks,
        practicalMaxMarks: s.practicalMaxMarks,
        totalMaxMarks: s.totalMaxMarks,
        passingMarks: s.passingMarks
      }));

    const newForm: ExamForm = {
      id: "form_" + Date.now(),
      studentId: selectedStudentId || "stud_" + Date.now(),
      studentName: formStudentName.trim(),
      rollNo: formRollNo.trim(),
      scholarNumber: formScholarNo.trim() || "SCH-2026-" + formRollNo.trim(),
      fatherName: formFatherName.trim(),
      motherName: formMotherName.trim(),
      dob: formDob,
      gender: formGender,
      mobileNumber: formMobile.trim(),
      email: formEmail.trim(),
      classGrade: formClass,
      branchCenterId: formBranchId,
      branchCenterName: branchObj ? `${branchObj.name} (${branchObj.city})` : "Study HUB MP Nagar Head Center",
      examSession: formExamSession,
      subjects: chosenSubjects,
      examFee: formFeeAmount,
      feeStatus: formFeeStatus,
      paymentMethod: formFeeStatus === "Paid" ? formPaymentMethod : undefined,
      paymentReceiptNo: formFeeStatus === "Paid" ? formReceiptNo : undefined,
      paidAt: formFeeStatus === "Paid" ? new Date().toLocaleString() : undefined,
      filledByTeacherId: currentTeacherId || "t_current",
      filledByTeacherName: currentTeacherName || "Faculty Professor",
      formStatus: "Approved",
      submissionDate: new Date().toISOString().split("T")[0]
    };

    setExamForms((prev) => [newForm, ...prev]);
    setFormSuccessMessage(`Exam Form for ${newForm.studentName} (Roll: ${newForm.rollNo}) saved and uploaded successfully!`);

    // Reset form selection
    setSelectedStudentId("");
    setFormStudentName("");
    setFormRollNo("");
    setFormFatherName("");
    setFormMotherName("");
    setSelectedSubjectIds([]);
    setFormReceiptNo("REC-" + Math.floor(100000 + Math.random() * 900000));
  };

  // --- FILTERED STUDENT LIST STATE ---
  const [filterFeeStatus, setFilterFeeStatus] = useState<"All" | "Paid" | "Unpaid">("All");
  const [filterClass, setFilterClass] = useState<string>("All");
  const [filterBranchId, setFilterBranchId] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Branch PIN Download Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [selectedBranchForDownload, setSelectedBranchForDownload] = useState<StudyHubCenter | null>(null);

  const filteredForms = useMemo(() => {
    return examForms.filter((f) => {
      const matchFee = filterFeeStatus === "All" || f.feeStatus === filterFeeStatus;
      const matchClass = filterClass === "All" || f.classGrade.toLowerCase().includes(filterClass.toLowerCase());
      const matchBranch = filterBranchId === "All" || f.branchCenterId === filterBranchId;
      const matchSearch =
        !searchQuery.trim() ||
        f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFee && matchClass && matchBranch && matchSearch;
    });
  }, [examForms, filterFeeStatus, filterClass, filterBranchId, searchQuery]);

  // Handle Quick Toggle Fee Status (Teacher can select paid/unpaid when payment comes)
  const handleToggleFeeStatus = (formId: string) => {
    setExamForms((prev) =>
      prev.map((f) => {
        if (f.id === formId) {
          const newStatus = f.feeStatus === "Paid" ? "Unpaid" : "Paid";
          return {
            ...f,
            feeStatus: newStatus,
            paymentReceiptNo: newStatus === "Paid" ? (f.paymentReceiptNo || "REC-ONLINE-" + Math.floor(100000 + Math.random() * 900000)) : undefined,
            paidAt: newStatus === "Paid" ? new Date().toLocaleString() : undefined
          };
        }
        return f;
      })
    );
  };

  // Open Branch PIN security verification for downloading list
  const handleOpenPinDownload = () => {
    setPinError("");
    setEnteredPin("");
    const targetBranch =
      filterBranchId !== "All"
        ? studyHubCenters.find((c) => c.id === filterBranchId) || studyHubCenters[0]
        : studyHubCenters[0];
    setSelectedBranchForDownload(targetBranch);
    setIsPinModalOpen(true);
  };

  const handleVerifyPinAndDownload = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");

    if (!enteredPin.trim()) {
      setPinError("Please enter the authorized 4-6 digit Branch PIN.");
      return;
    }

    const branchToValidate = selectedBranchForDownload || studyHubCenters[0];
    // Find expected PIN for this branch
    const configuredPinObj = branchPINs.find(
      (p) => p.branchId === branchToValidate.id || p.branchName.toLowerCase().includes(branchToValidate.city.toLowerCase())
    );

    const expectedPin = configuredPinObj ? configuredPinObj.pin : "462011";

    if (enteredPin.trim() !== expectedPin) {
      setPinError(`Security Verification Failed: Invalid Branch PIN for ${branchToValidate.name}. Please obtain the master PIN from the Campus Administrator.`);
      return;
    }

    // PIN is valid! Generate and download PDF
    const filterDescription = `Status: ${filterFeeStatus}, Class: ${filterClass}, Branch: ${branchToValidate.city}`;
    downloadStudentListPdf(filteredForms, branchToValidate.name, filterDescription);
    setIsPinModalOpen(false);
  };

  // --- MARKS ENTRY STATE ---
  const [selectedFormForMarks, setSelectedFormForMarks] = useState<ExamForm | null>(null);
  const [marksDraft, setMarksDraft] = useState<Record<string, { theory: number; practical: number }>>({});
  const [marksSaveMessage, setMarksSaveMessage] = useState("");
  const [marksErrorMessage, setMarksErrorMessage] = useState("");

  const handleOpenMarksEntry = (form: ExamForm) => {
    setSelectedFormForMarks(form);
    setMarksSaveMessage("");
    setMarksErrorMessage("");

    // Prepopulate existing marks if present
    const existing = examMarksheets.find((m) => m.examFormId === form.id || m.rollNo === form.rollNo);
    const draft: Record<string, { theory: number; practical: number }> = {};

    form.subjects.forEach((subj) => {
      const recorded = existing?.marks.find((m) => m.subjectId === subj.subjectId || m.subjectCode === subj.subjectCode);
      draft[subj.subjectId] = {
        theory: recorded ? recorded.theoryMarksObtained : 0,
        practical: recorded ? recorded.practicalMarksObtained : 0
      };
    });
    setMarksDraft(draft);
  };

  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    setMarksErrorMessage("");
    setMarksSaveMessage("");

    if (examSettings.isMarksLocked) {
      setMarksErrorMessage("Cannot update marks: Marks entry is locked by Administrator.");
      return;
    }

    if (!selectedFormForMarks) return;

    let grandTotalObtained = 0;
    let grandTotalMax = 0;
    let allPassed = true;

    const computedMarks: StudentExamMark[] = selectedFormForMarks.subjects.map((subj) => {
      const entry = marksDraft[subj.subjectId] || { theory: 0, practical: 0 };
      const total = Number(entry.theory) + Number(entry.practical);
      const isPassed = total >= subj.passingMarks;
      if (!isPassed) allPassed = false;

      grandTotalObtained += total;
      grandTotalMax += subj.totalMaxMarks;

      let grade = "D";
      const pct = (total / subj.totalMaxMarks) * 100;
      if (pct >= 90) grade = "A+";
      else if (pct >= 80) grade = "A";
      else if (pct >= 70) grade = "B+";
      else if (pct >= 60) grade = "B";
      else if (pct >= 50) grade = "C";
      else if (pct >= 33) grade = "D";
      else grade = "F";

      return {
        subjectId: subj.subjectId,
        subjectName: subj.subjectName,
        subjectCode: subj.subjectCode,
        theoryMarksObtained: Number(entry.theory),
        practicalMarksObtained: Number(entry.practical),
        totalObtained: total,
        totalMaxMarks: subj.totalMaxMarks,
        passingMarks: subj.passingMarks,
        isPassed,
        grade
      };
    });

    const percentage = grandTotalMax > 0 ? Number(((grandTotalObtained / grandTotalMax) * 100).toFixed(2)) : 0;
    let overallGrade = "D";
    if (percentage >= 90) overallGrade = "A+";
    else if (percentage >= 80) overallGrade = "A";
    else if (percentage >= 70) overallGrade = "B+";
    else if (percentage >= 60) overallGrade = "B";
    else if (percentage >= 50) overallGrade = "C";
    else if (percentage >= 33) overallGrade = "D";
    else overallGrade = "F";

    let division: "First Division" | "Second Division" | "Third Division" | "Fail" = "First Division";
    if (!allPassed || percentage < 33) division = "Fail";
    else if (percentage >= 60) division = "First Division";
    else if (percentage >= 45) division = "Second Division";
    else division = "Third Division";

    const marksheet: ExamStudentMarksheet = {
      id: "res_" + selectedFormForMarks.id,
      examFormId: selectedFormForMarks.id,
      studentId: selectedFormForMarks.studentId,
      studentName: selectedFormForMarks.studentName,
      rollNo: selectedFormForMarks.rollNo,
      classGrade: selectedFormForMarks.classGrade,
      branchCenterName: selectedFormForMarks.branchCenterName,
      examSession: selectedFormForMarks.examSession,
      marks: computedMarks,
      grandTotalObtained,
      grandTotalMax,
      percentage,
      overallGrade,
      resultStatus: allPassed ? "PASS" : "FAIL",
      division,
      updatedBy: currentTeacherName || "Faculty Professor",
      updatedByRole: "teacher",
      lastUpdated: new Date().toLocaleString()
    };

    setExamMarksheets((prev) => {
      const idx = prev.findIndex((m) => m.examFormId === selectedFormForMarks.id || m.rollNo === selectedFormForMarks.rollNo);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = marksheet;
        return next;
      }
      return [marksheet, ...prev];
    });

    setMarksSaveMessage(`Marks for ${selectedFormForMarks.studentName} successfully calculated and uploaded to Firestore!`);
  };

  // --- ADD SUBJECT STATE ---
  const [newSubjName, setNewSubjName] = useState("");
  const [newSubjCode, setNewSubjCode] = useState("");
  const [newSubjClass, setNewSubjClass] = useState("Class 12");
  const [newSubjTheory, setNewSubjTheory] = useState<number>(70);
  const [newSubjPractical, setNewSubjPractical] = useState<number>(30);
  const [newSubjPassing, setNewSubjPassing] = useState<number>(33);
  const [subjSuccessMessage, setSubjSuccessMessage] = useState("");
  const [subjErrorMessage, setSubjErrorMessage] = useState("");

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    setSubjErrorMessage("");
    setSubjSuccessMessage("");

    if (!newSubjName.trim() || !newSubjCode.trim()) {
      setSubjErrorMessage("Please enter both Subject Name and unique Subject Code.");
      return;
    }

    const existingCode = examSubjects.find(
      (s) => s.subjectCode.trim().toLowerCase() === newSubjCode.trim().toLowerCase()
    );
    if (existingCode) {
      setSubjErrorMessage(`Subject Code "${newSubjCode}" is already in use by ${existingCode.subjectName}.`);
      return;
    }

    const total = Number(newSubjTheory) + Number(newSubjPractical);

    const newSubject: ExamSubject = {
      id: "subj_" + Date.now(),
      subjectName: newSubjName.trim(),
      subjectCode: newSubjCode.trim().toUpperCase(),
      classGrade: newSubjClass,
      theoryMaxMarks: Number(newSubjTheory),
      practicalMaxMarks: Number(newSubjPractical),
      totalMaxMarks: total,
      passingMarks: Number(newSubjPassing),
      addedByTeacherId: currentTeacherId || "t_current",
      addedByTeacherName: currentTeacherName || "Faculty Professor",
      createdAt: new Date().toISOString().split("T")[0]
    };

    setExamSubjects((prev) => [newSubject, ...prev]);
    setSubjSuccessMessage(`Subject "${newSubject.subjectName}" (${newSubject.subjectCode}) added successfully!`);

    setNewSubjName("");
    setNewSubjCode("");
  };

  return (
    <div id="teacher-exam-portal-container" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-blue-200 text-xs font-semibold rounded-full mb-2">
              <BookPlus className="w-3.5 h-3.5 text-blue-300" />
              Faculty Academic Console • Examination Management
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Faculty Exam Management Portal</h1>
            <p className="text-slate-300 text-sm mt-1">
              Fill candidate forms, record payments, upload student marks, and securely export branch rosters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {examSettings.isFormLocked && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-full">
                <Lock className="w-3.5 h-3.5" /> Forms Locked by Admin
              </span>
            )}
            {examSettings.isMarksLocked && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-full">
                <Lock className="w-3.5 h-3.5" /> Marks Locked by Admin
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/10">
          <button
            id="tab-teacher-fill-form"
            onClick={() => setActiveTab("fillForm")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "fillForm"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            Fill Exam Form
          </button>
          <button
            id="tab-teacher-students-list"
            onClick={() => setActiveTab("studentsList")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "studentsList"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Download className="w-4 h-4" />
            Filled Forms Roster & PDF Export
            <span className="text-[10px] bg-indigo-500 text-white font-bold px-1.5 py-0.5 rounded-full">
              {examForms.length}
            </span>
          </button>
          <button
            id="tab-teacher-enter-marks"
            onClick={() => setActiveTab("enterMarks")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "enterMarks"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Upload & Edit Marks
          </button>
          <button
            id="tab-teacher-add-subject"
            onClick={() => setActiveTab("addSubject")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "addSubject"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Add Subject by Code
          </button>
        </div>
      </div>

      {/* TAB 1: FILL EXAM FORM */}
      {activeTab === "fillForm" && (
        <div id="section-teacher-fill-form" className="space-y-6">
          {examSettings.isFormLocked && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4">
              <Lock className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">Exam Form Registration Window is Locked</h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  {examSettings.formLockMessage || "Administrator has temporarily closed regular examination submissions."}
                </p>
                {examSettings.formLockDate && (
                  <p className="text-xs text-rose-600 font-mono mt-1">
                    Lock Enforced on: {examSettings.formLockDate} at {examSettings.formLockTime}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Candidate Examination Registration Form</h2>
                <p className="text-xs text-slate-500">
                  Select a registered scholar or enter details manually to submit an official exam form.
                </p>
              </div>

              {/* Quick student selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Pick Registered Student:</span>
                <select
                  id="select-registered-student"
                  value={selectedStudentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Roll: {s.rollNo || s.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formSuccessMessage && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                {formSuccessMessage}
              </div>
            )}
            {formErrorMessage && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                {formErrorMessage}
              </div>
            )}

            <form onSubmit={handleSaveExamForm} className="mt-6 space-y-6">
              {/* Row 1: Student info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-form-student-name"
                    type="text"
                    required
                    placeholder="e.g. Aman Verma"
                    value={formStudentName}
                    onChange={(e) => setFormStudentName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Examination Roll Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-form-roll-no"
                    type="text"
                    required
                    placeholder="e.g. 2601004"
                    value={formRollNo}
                    onChange={(e) => setFormRollNo(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scholar / Enrollment Number
                  </label>
                  <input
                    id="input-form-scholar-no"
                    type="text"
                    placeholder="e.g. SCH-2026-115"
                    value={formScholarNo}
                    onChange={(e) => setFormScholarNo(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Father's Name
                  </label>
                  <input
                    id="input-form-father-name"
                    type="text"
                    placeholder="e.g. Shri Rajesh Verma"
                    value={formFatherName}
                    onChange={(e) => setFormFatherName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mother's Name
                  </label>
                  <input
                    id="input-form-mother-name"
                    type="text"
                    placeholder="e.g. Smt. Sunita Verma"
                    value={formMotherName}
                    onChange={(e) => setFormMotherName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth & Gender
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="input-form-dob"
                      type="date"
                      value={formDob}
                      onChange={(e) => setFormDob(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      id="select-form-gender"
                      value={formGender}
                      onChange={(e) => setFormGender(e.target.value)}
                      className="px-2 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 2: Academic details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Class / Stream Grade <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="select-form-class"
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Class 10">Class 10 (Secondary)</option>
                    <option value="Class 11">Class 11 (Senior Secondary)</option>
                    <option value="Class 12">Class 12 (Senior Secondary)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Branch / Study HUB Center <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="select-form-branch"
                    value={formBranchId}
                    onChange={(e) => setFormBranchId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {studyHubCenters.map((center) => (
                      <option key={center.id} value={center.id}>
                        {center.name} ({center.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Exam Session
                  </label>
                  <input
                    id="input-form-session"
                    type="text"
                    value={formExamSession}
                    onChange={(e) => setFormExamSession(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Row 3: Fee Status Selection */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Exam Fee & Payment Status (Teacher Control)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Select Paid / Unpaid based on student fees clearance.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-fee-paid"
                      onClick={() => setFormFeeStatus("Paid")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                        formFeeStatus === "Paid"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      ✓ Paid
                    </button>
                    <button
                      type="button"
                      id="btn-fee-unpaid"
                      onClick={() => setFormFeeStatus("Unpaid")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                        formFeeStatus === "Unpaid"
                          ? "bg-rose-600 text-white shadow-sm"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      ✕ Unpaid
                    </button>
                  </div>
                </div>

                {formFeeStatus === "Paid" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] text-slate-500">Fee Amount (INR)</label>
                      <input
                        type="number"
                        value={formFeeAmount}
                        onChange={(e) => setFormFeeAmount(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500">Payment Mode</label>
                      <select
                        value={formPaymentMethod}
                        onChange={(e) => setFormPaymentMethod(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="Cash at Center Desk">Cash at Center Desk</option>
                        <option value="UPI Online">UPI Online (Google Pay / PhonePe)</option>
                        <option value="Bank NetBanking / NEFT">Bank NetBanking / NEFT</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500">Receipt / Transaction No</label>
                      <input
                        type="text"
                        value={formReceiptNo}
                        onChange={(e) => setFormReceiptNo(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Row 4: Subject Selection Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    Select Subjects to Register ({selectedSubjectIds.length} Selected) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setSelectedSubjectIds(availableSubjectsForClass.map((s) => s.id))}
                    className="text-xs text-indigo-600 hover:underline font-medium"
                  >
                    Select All {formClass} Subjects
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {availableSubjectsForClass.map((subj) => {
                    const isChecked = selectedSubjectIds.includes(subj.id);
                    return (
                      <div
                        key={subj.id}
                        onClick={() => handleToggleSubject(subj.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                          isChecked
                            ? "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${
                            isChecked
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{subj.subjectName}</p>
                          <p className="text-[11px] font-mono text-indigo-600 font-semibold">{subj.subjectCode}</p>
                          <p className="text-[10px] text-slate-400">
                            Theory: {subj.theoryMaxMarks} • Practical: {subj.practicalMaxMarks} (Pass: {subj.passingMarks})
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button
                  id="btn-submit-exam-form"
                  type="submit"
                  disabled={examSettings.isFormLocked}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-medium text-sm rounded-xl shadow transition active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  Save & Upload Exam Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: DOWNLOAD LIST OF STUDENTS (WITH FILTERS & BRANCH PIN VERIFICATION) */}
      {activeTab === "studentsList" && (
        <div id="section-teacher-students-list" className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Filled Examination Forms Roster
                </h2>
                <p className="text-xs text-slate-500">
                  Filter students by payment status, class, or center. Secure branch PIN required for official PDF export.
                </p>
              </div>

              {/* Download button triggering Branch PIN authentication */}
              <button
                id="btn-trigger-pin-download"
                onClick={handleOpenPinDownload}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                Download List (PDF with Branch PIN)
              </button>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 my-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Search Student / Roll</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name or roll..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Payment Status</label>
                <select
                  id="filter-fee-status"
                  value={filterFeeStatus}
                  onChange={(e) => setFilterFeeStatus(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="All">All Students (Paid & Unpaid)</option>
                  <option value="Paid">Paid Only</option>
                  <option value="Unpaid">Unpaid Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Class / Grade</label>
                <select
                  id="filter-class"
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="All">All Classes</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Branch / Center</label>
                <select
                  id="filter-branch"
                  value={filterBranchId}
                  onChange={(e) => setFilterBranchId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="All">All Branches</option>
                  {studyHubCenters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="px-3.5 py-3">Roll No</th>
                    <th className="px-3.5 py-3">Student Name</th>
                    <th className="px-3.5 py-3">Class</th>
                    <th className="px-3.5 py-3">Center / Branch</th>
                    <th className="px-3.5 py-3 text-center">Subjects</th>
                    <th className="px-3.5 py-3 text-center">Fee Status</th>
                    <th className="px-3.5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredForms.length > 0 ? (
                    filteredForms.map((form) => (
                      <tr key={form.id} className="hover:bg-slate-50">
                        <td className="px-3.5 py-3 font-mono font-bold text-indigo-700">
                          {form.rollNo}
                        </td>
                        <td className="px-3.5 py-3 font-semibold text-slate-900">
                          {form.studentName}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Filled by {form.filledByTeacherName}
                          </span>
                        </td>
                        <td className="px-3.5 py-3">{form.classGrade}</td>
                        <td className="px-3.5 py-3 truncate max-w-[160px]">
                          {form.branchCenterName}
                        </td>
                        <td className="px-3.5 py-3 text-center font-medium">
                          {form.subjects?.length || 0}
                        </td>
                        <td className="px-3.5 py-3 text-center">
                          <button
                            type="button"
                            title="Click to toggle Paid/Unpaid"
                            onClick={() => handleToggleFeeStatus(form.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition ${
                              form.feeStatus === "Paid"
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                            }`}
                          >
                            {form.feeStatus === "Paid" ? "✓ Paid" : "✕ Unpaid"}
                          </button>
                        </td>
                        <td className="px-3.5 py-3 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => downloadExamFormPdf(form)}
                            title="Download Single Student Form PDF"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleOpenMarksEntry(form);
                              setActiveTab("enterMarks");
                            }}
                            title="Enter / Edit Marks"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-emerald-600 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No examination forms match the active filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UPLOAD, EDIT, SAVE MARKS */}
      {activeTab === "enterMarks" && (
        <div id="section-teacher-enter-marks" className="space-y-6">
          {examSettings.isMarksLocked && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4">
              <Lock className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">Marks Entry Window is Locked</h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  {examSettings.marksLockMessage || "Administrator has closed marks submission and verified grade records."}
                </p>
                {examSettings.marksLockDate && (
                  <p className="text-xs text-rose-600 font-mono mt-1">
                    Lock Date: {examSettings.marksLockDate} at {examSettings.marksLockTime}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left list of candidate forms */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Select Student to Enter Marks</h3>
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {examForms.map((f) => {
                  const isSelected = selectedFormForMarks?.id === f.id;
                  const hasMarks = examMarksheets.some((m) => m.examFormId === f.id || m.rollNo === f.rollNo);
                  return (
                    <div
                      key={f.id}
                      onClick={() => handleOpenMarksEntry(f)}
                      className={`p-3 rounded-xl cursor-pointer transition ${
                        isSelected
                          ? "bg-indigo-50 border border-indigo-200"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800">{f.studentName}</p>
                        {hasMarks ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                            Marks Saved
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-1.5 py-0.5 rounded">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-indigo-600">Roll: {f.rollNo}</p>
                      <p className="text-[10px] text-slate-400">{f.classGrade} • {f.subjects?.length || 0} Subjects</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right marks entry editor */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              {selectedFormForMarks ? (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b">
                    <div>
                      <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                        Roll: {selectedFormForMarks.rollNo}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">
                        {selectedFormForMarks.studentName}
                      </h3>
                      <p className="text-xs text-slate-500">{selectedFormForMarks.classGrade} • {selectedFormForMarks.branchCenterName}</p>
                    </div>

                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        selectedFormForMarks.feeStatus === "Paid"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      Fee: {selectedFormForMarks.feeStatus}
                    </span>
                  </div>

                  {marksSaveMessage && (
                    <div className="my-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      {marksSaveMessage}
                    </div>
                  )}
                  {marksErrorMessage && (
                    <div className="my-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      {marksErrorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSaveMarks} className="mt-4 space-y-4">
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-100 text-slate-600 font-semibold uppercase">
                          <tr>
                            <th className="px-3.5 py-3">Subject</th>
                            <th className="px-3.5 py-3 text-center">Theory Marks</th>
                            <th className="px-3.5 py-3 text-center">Practical Marks</th>
                            <th className="px-3.5 py-3 text-center">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {selectedFormForMarks.subjects.map((subj) => {
                            const cur = marksDraft[subj.subjectId] || { theory: 0, practical: 0 };
                            const sum = Number(cur.theory) + Number(cur.practical);
                            return (
                              <tr key={subj.subjectId}>
                                <td className="px-3.5 py-3">
                                  <p className="font-bold text-slate-800">{subj.subjectName}</p>
                                  <p className="font-mono text-[10px] text-indigo-600">{subj.subjectCode}</p>
                                </td>
                                <td className="px-3.5 py-3 text-center">
                                  <input
                                    type="number"
                                    min={0}
                                    max={subj.theoryMaxMarks}
                                    disabled={examSettings.isMarksLocked}
                                    value={cur.theory}
                                    onChange={(e) => {
                                      const val = Math.min(subj.theoryMaxMarks, Math.max(0, Number(e.target.value)));
                                      setMarksDraft((prev) => ({
                                        ...prev,
                                        [subj.subjectId]: {
                                          ...prev[subj.subjectId],
                                          theory: val
                                        }
                                      }));
                                    }}
                                    className="w-20 px-2 py-1 text-center font-mono text-xs rounded border border-slate-300"
                                  />
                                  <span className="text-[10px] text-slate-400 block mt-0.5">Max {subj.theoryMaxMarks}</span>
                                </td>
                                <td className="px-3.5 py-3 text-center">
                                  <input
                                    type="number"
                                    min={0}
                                    max={subj.practicalMaxMarks}
                                    disabled={examSettings.isMarksLocked}
                                    value={cur.practical}
                                    onChange={(e) => {
                                      const val = Math.min(subj.practicalMaxMarks, Math.max(0, Number(e.target.value)));
                                      setMarksDraft((prev) => ({
                                        ...prev,
                                        [subj.subjectId]: {
                                          ...prev[subj.subjectId],
                                          practical: val
                                        }
                                      }));
                                    }}
                                    className="w-20 px-2 py-1 text-center font-mono text-xs rounded border border-slate-300"
                                  />
                                  <span className="text-[10px] text-slate-400 block mt-0.5">Max {subj.practicalMaxMarks}</span>
                                </td>
                                <td className="px-3.5 py-3 text-center font-bold text-slate-900">
                                  {sum} / {subj.totalMaxMarks}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {examMarksheets.some((m) => m.examFormId === selectedFormForMarks.id || m.rollNo === selectedFormForMarks.rollNo) ? (
                        <button
                          type="button"
                          disabled={examSettings.isMarksLocked}
                          onClick={() => {
                            const existing = examMarksheets.find((m) => m.examFormId === selectedFormForMarks.id || m.rollNo === selectedFormForMarks.rollNo);
                            if (!existing) return;
                            if (window.confirm(`Are you sure you want to delete the recorded marks and certified result for ${selectedFormForMarks.studentName} (Roll: ${selectedFormForMarks.rollNo})?`)) {
                              if (onDeleteMarksheet) {
                                onDeleteMarksheet(existing.id);
                              } else {
                                setExamMarksheets((prev) => prev.filter((m) => m.id !== existing.id));
                              }
                              setMarksDraft({});
                              setMarksSaveMessage(`Marks for ${selectedFormForMarks.studentName} were deleted.`);
                              setTimeout(() => setMarksSaveMessage(""), 4000);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50 text-xs font-semibold rounded-xl border border-rose-200 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete / Clear Marks
                        </button>
                      ) : <div />}

                      <button
                        type="submit"
                        disabled={examSettings.isMarksLocked}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white text-xs font-semibold rounded-xl shadow transition active:scale-95 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        Save & Compute Student Marks
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400">
                  <Edit3 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold">Select a candidate on the left to enter marks.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADD SUBJECT BY SUBJECT CODE */}
      {activeTab === "addSubject" && (
        <div id="section-teacher-add-subject" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-1">Add New Exam Subject</h2>
              <p className="text-xs text-slate-500 mb-4">
                Define subject name, unique subject code, and maximum marks distribution.
              </p>

              {subjSuccessMessage && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  {subjSuccessMessage}
                </div>
              )}
              {subjErrorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  {subjErrorMessage}
                </div>
              )}

              <form onSubmit={handleAddSubject} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sanskrit Literature"
                    value={newSubjName}
                    onChange={(e) => setNewSubjName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SAN-1005"
                    value={newSubjCode}
                    onChange={(e) => setNewSubjCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Class / Grade Level
                  </label>
                  <select
                    value={newSubjClass}
                    onChange={(e) => setNewSubjClass(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Theory Max</label>
                    <input
                      type="number"
                      value={newSubjTheory}
                      onChange={(e) => setNewSubjTheory(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs text-center rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Practical Max</label>
                    <input
                      type="number"
                      value={newSubjPractical}
                      onChange={(e) => setNewSubjPractical(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs text-center rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Pass Marks</label>
                    <input
                      type="number"
                      value={newSubjPassing}
                      onChange={(e) => setNewSubjPassing(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs text-center rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Total Max Marks: <strong>{Number(newSubjTheory) + Number(newSubjPractical)}</strong>
                </p>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Save Subject by Code
                </button>
              </form>
            </div>

            {/* List of Subjects */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Active Board Exam Subjects ({examSubjects.length})
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Subjects registered in the curriculum and eligible for student examination form attachment.
              </p>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                    <tr>
                      <th className="px-3.5 py-2.5">Code</th>
                      <th className="px-3.5 py-2.5">Subject Name</th>
                      <th className="px-3.5 py-2.5">Class</th>
                      <th className="px-3.5 py-2.5 text-center">Theory</th>
                      <th className="px-3.5 py-2.5 text-center">Practical</th>
                      <th className="px-3.5 py-2.5 text-center">Total</th>
                      <th className="px-3.5 py-2.5 text-center">Passing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {examSubjects.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-3.5 py-2.5 font-mono font-bold text-indigo-700">
                          {s.subjectCode}
                        </td>
                        <td className="px-3.5 py-2.5 font-medium text-slate-900">
                          {s.subjectName}
                        </td>
                        <td className="px-3.5 py-2.5">{s.classGrade}</td>
                        <td className="px-3.5 py-2.5 text-center">{s.theoryMaxMarks}</td>
                        <td className="px-3.5 py-2.5 text-center">{s.practicalMaxMarks}</td>
                        <td className="px-3.5 py-2.5 text-center font-bold text-slate-900">
                          {s.totalMaxMarks}
                        </td>
                        <td className="px-3.5 py-2.5 text-center text-emerald-600 font-semibold">
                          {s.passingMarks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- BRANCH PIN SECURITY VERIFICATION MODAL --- */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Branch PIN Authentication</h3>
                  <p className="text-xs text-slate-500">Security Clearance Required for PDF Export</p>
                </div>
              </div>
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyPinAndDownload} className="mt-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border text-xs text-slate-600">
                <p>
                  Exporting Roster for:{" "}
                  <strong className="text-slate-900">
                    {selectedBranchForDownload?.name || "Study HUB MP Nagar Head Center"}
                  </strong>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  To protect candidate confidentiality, enter the 4-6 digit security PIN established by the Administrator for this branch.
                </p>
              </div>

              {pinError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  {pinError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enter Branch Security PIN <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  placeholder="Enter 4 to 6 digit PIN (e.g. 462011)"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  className="w-full px-4 py-2.5 text-center font-mono text-base tracking-widest rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition"
                >
                  Verify PIN & Download PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherExamPortal;
