import React, { useState, useMemo } from "react";
import {
  ShieldAlert,
  Lock,
  Unlock,
  Award,
  FileText,
  KeyRound,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Search,
  Save,
  Trash2,
  PlusCircle,
  Download,
  Building2,
  Check,
  X,
  Send,
  Eye
} from "lucide-react";
import {
  ExamForm,
  ExamStudentMarksheet,
  ExamPortalSettings,
  BranchPIN,
  StudyHubCenter,
  StudentExamMark
} from "../../types";
import { downloadExamFormPdf, downloadResultMarksheetPdf } from "../../utils/examPdfGenerator";

interface AdminExamPortalProps {
  currentAdminId?: string;
  currentAdminName?: string;
  examForms: ExamForm[];
  setExamForms: React.Dispatch<React.SetStateAction<ExamForm[]>>;
  examMarksheets: ExamStudentMarksheet[];
  setExamMarksheets: React.Dispatch<React.SetStateAction<ExamStudentMarksheet[]>>;
  onDeleteMarksheet?: (id: string) => void;
  examSettings: ExamPortalSettings;
  setExamSettings: React.Dispatch<React.SetStateAction<ExamPortalSettings>>;
  branchPINs: BranchPIN[];
  setBranchPINs: React.Dispatch<React.SetStateAction<BranchPIN[]>>;
  studyHubCenters: StudyHubCenter[];
}

export const AdminExamPortal: React.FC<AdminExamPortalProps> = ({
  currentAdminId,
  currentAdminName,
  examForms,
  setExamForms,
  examMarksheets,
  setExamMarksheets,
  onDeleteMarksheet,
  examSettings,
  setExamSettings,
  branchPINs,
  setBranchPINs,
  studyHubCenters
}) => {
  const [activeTab, setActiveTab] = useState<
    "forms" | "lockControls" | "marksResults" | "admitCardLaunch" | "branchPins"
  >("forms");

  // --- TAB 1: VIEW & EDIT EXAM FORMS ---
  const [searchQuery, setSearchQuery] = useState("");
  const [editingForm, setEditingForm] = useState<ExamForm | null>(null);
  const [formNotice, setFormNotice] = useState("");

  const filteredForms = useMemo(() => {
    return examForms.filter(
      (f) =>
        !searchQuery.trim() ||
        f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.branchCenterName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [examForms, searchQuery]);

  const handleUpdateExamForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingForm) return;

    setExamForms((prev) =>
      prev.map((f) => (f.id === editingForm.id ? { ...editingForm, updatedAt: new Date().toLocaleString() } : f))
    );
    setFormNotice(`Exam Form for ${editingForm.studentName} (Roll: ${editingForm.rollNo}) updated successfully!`);
    setEditingForm(null);
  };

  const handleDeleteExamForm = (formId: string) => {
    if (window.confirm("Are you sure you want to delete this examination form?")) {
      setExamForms((prev) => prev.filter((f) => f.id !== formId));
      setFormNotice("Exam Form deleted.");
    }
  };

  // --- TAB 2: LOCK / UNLOCK CONTROLS (FORM, MARKS, RESULT) ---
  const [lockDate, setLockDate] = useState(examSettings.formLockDate || new Date().toISOString().split("T")[0]);
  const [lockTime, setLockTime] = useState(examSettings.formLockTime || "23:59 IST");
  const [lockMsg, setLockMsg] = useState(
    examSettings.formLockMessage || "Regular examination form submissions have concluded for this term."
  );

  const [marksLockDate, setMarksLockDate] = useState(examSettings.marksLockDate || new Date().toISOString().split("T")[0]);
  const [marksLockTime, setMarksLockTime] = useState(examSettings.marksLockTime || "18:00 IST");
  const [marksLockMsg, setMarksLockMsg] = useState(
    examSettings.marksLockMessage || "Marks entry has been finalized and certified by Academic Council."
  );

  const [resultLockDate, setResultLockDate] = useState(examSettings.resultLockDate || new Date().toISOString().split("T")[0]);
  const [resultLockTime, setResultLockTime] = useState(examSettings.resultLockTime || "12:00 IST");
  const [resultLockMsg, setResultLockMsg] = useState(
    examSettings.resultLockMessage || "Results are currently being moderated. Expected publication shortly."
  );

  const [lockSaveSuccess, setLockSaveSuccess] = useState("");

  const handleToggleFormLock = () => {
    const newLocked = !examSettings.isFormLocked;
    const updated = {
      ...examSettings,
      isFormLocked: newLocked,
      formLockDate: lockDate,
      formLockTime: lockTime,
      formLockMessage: lockMsg
    };
    setExamSettings(updated);
    setLockSaveSuccess(`Exam Form Registration is now ${newLocked ? "LOCKED" : "UNLOCKED"}.`);
  };

  const handleToggleMarksLock = () => {
    const newLocked = !examSettings.isMarksLocked;
    const updated = {
      ...examSettings,
      isMarksLocked: newLocked,
      marksLockDate: marksLockDate,
      marksLockTime: marksLockTime,
      marksLockMessage: marksLockMsg
    };
    setExamSettings(updated);
    setLockSaveSuccess(`Marks Entry is now ${newLocked ? "LOCKED" : "UNLOCKED"}.`);
  };

  const handleToggleResultLock = () => {
    const newLocked = !examSettings.isResultLocked;
    const updated = {
      ...examSettings,
      isResultLocked: newLocked,
      resultLockDate: resultLockDate,
      resultLockTime: resultLockTime,
      resultLockMessage: resultLockMsg
    };
    setExamSettings(updated);
    setLockSaveSuccess(`Board Results are now ${newLocked ? "LOCKED / WITHHELD" : "UNLOCKED / PUBLISHED"}.`);
  };

  // --- TAB 3: CHECK & EDIT RESULTS / MARKS ---
  const [editingMarksheet, setEditingMarksheet] = useState<ExamStudentMarksheet | null>(null);
  const [marksheetNotice, setMarksheetNotice] = useState("");
  const [marksheetSearchQuery, setMarksheetSearchQuery] = useState("");
  const [marksheetGradeFilter, setMarksheetGradeFilter] = useState("all");
  const [marksheetToDelete, setMarksheetToDelete] = useState<ExamStudentMarksheet | null>(null);

  const filteredMarksheets = useMemo(() => {
    return examMarksheets.filter((m) => {
      const q = marksheetSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.studentName.toLowerCase().includes(q) ||
        m.rollNo.toLowerCase().includes(q) ||
        (m.classGrade && m.classGrade.toLowerCase().includes(q)) ||
        (m.examFormId && m.examFormId.toLowerCase().includes(q));
      const matchesGrade = marksheetGradeFilter === "all" || m.classGrade === marksheetGradeFilter;
      return matchesSearch && matchesGrade;
    });
  }, [examMarksheets, marksheetSearchQuery, marksheetGradeFilter]);

  const handleConfirmDeleteMarksheet = (marksheet: ExamStudentMarksheet) => {
    if (onDeleteMarksheet) {
      onDeleteMarksheet(marksheet.id);
    } else {
      setExamMarksheets((prev) => prev.filter((m) => m.id !== marksheet.id));
    }
    setMarksheetNotice(`Certified marksheet and results for "${marksheet.studentName}" (Roll: ${marksheet.rollNo}) were permanently deleted.`);
    setMarksheetToDelete(null);
    if (editingMarksheet?.id === marksheet.id) {
      setEditingMarksheet(null);
    }
    setTimeout(() => {
      setMarksheetNotice("");
    }, 4500);
  };

  const handleSaveEditedMarksheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMarksheet) return;

    let grandTotalObtained = 0;
    let grandTotalMax = 0;
    let allPassed = true;

    const recomputedMarks: StudentExamMark[] = editingMarksheet.marks.map((m) => {
      const tot = Number(m.theoryMarksObtained) + Number(m.practicalMarksObtained);
      const isPassed = tot >= m.passingMarks;
      if (!isPassed) allPassed = false;
      grandTotalObtained += tot;
      grandTotalMax += m.totalMaxMarks;

      let grade = "D";
      const pct = (tot / m.totalMaxMarks) * 100;
      if (pct >= 90) grade = "A+";
      else if (pct >= 80) grade = "A";
      else if (pct >= 70) grade = "B+";
      else if (pct >= 60) grade = "B";
      else if (pct >= 50) grade = "C";
      else if (pct >= 33) grade = "D";
      else grade = "F";

      return {
        ...m,
        totalObtained: tot,
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

    const updated = {
      ...editingMarksheet,
      marks: recomputedMarks,
      grandTotalObtained,
      grandTotalMax,
      percentage,
      overallGrade,
      resultStatus: allPassed ? ("PASS" as const) : ("FAIL" as const),
      division,
      updatedBy: currentAdminName || "Super Administrator",
      updatedByRole: "admin" as const,
      lastUpdated: new Date().toLocaleString()
    };

    setExamMarksheets((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setMarksheetNotice(`Result for ${updated.studentName} updated successfully!`);
    setEditingMarksheet(null);
  };

  // --- TAB 4: ADMIT CARD LAUNCH CONTROL ---
  const [admitCenterName, setAdmitCenterName] = useState(
    examSettings.admitCardExamCenterName || "Study HUB Central Examination Pavilion (Block A & B)"
  );
  const [admitCenterAddress, setAdmitCenterAddress] = useState(
    examSettings.admitCardExamCenterAddress || "Plot No. 14, Zone-II, MP Nagar, Bhopal, Madhya Pradesh - 462011"
  );
  const [admitReportingTime, setAdmitReportingTime] = useState(
    examSettings.admitCardReportingTime || "08:30 AM (Morning Shift) / 01:30 PM (Evening Shift)"
  );
  const [admitStartDate, setAdmitStartDate] = useState(
    examSettings.admitCardExamStartDate || "2026-10-15"
  );
  const [admitLaunchNotice, setAdmitLaunchNotice] = useState("");

  const handleToggleAdmitCardLaunch = () => {
    const nextState = !examSettings.isAdmitCardLaunched;
    const updated: ExamPortalSettings = {
      ...examSettings,
      isAdmitCardLaunched: nextState,
      admitCardLaunchDate: nextState ? new Date().toISOString().split("T")[0] : "",
      admitCardExamCenterName: admitCenterName,
      admitCardExamCenterAddress: admitCenterAddress,
      admitCardReportingTime: admitReportingTime,
      admitCardExamStartDate: admitStartDate,
      launchedByAdminName: currentAdminName || "Super Administrator"
    };

    setExamSettings(updated);
    setAdmitLaunchNotice(
      nextState
        ? "Official Admit Cards have been launched! All registered candidates can now download their hall tickets."
        : "Admit Cards revoked / withheld from candidate download."
    );
  };

  // --- TAB 5: BRANCH PIN CREATE & MANAGEMENT ---
  const [newPinBranchId, setNewPinBranchId] = useState(studyHubCenters[0]?.id || "center_bhopal");
  const [newPinCode, setNewPinCode] = useState("");
  const [newPinIncharge, setNewPinIncharge] = useState("");
  const [pinNotice, setPinNotice] = useState("");

  const handleCreateOrUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinNotice("");

    if (!newPinCode.trim()) {
      setPinNotice("Please enter a 4-6 digit numeric PIN.");
      return;
    }

    const branchObj = studyHubCenters.find((c) => c.id === newPinBranchId);
    const branchName = branchObj ? `${branchObj.name} (${branchObj.city})` : "Study HUB Center";

    const pinId = "pin_" + newPinBranchId;
    const newBranchPin: BranchPIN = {
      id: pinId,
      branchId: newPinBranchId,
      branchName,
      pin: newPinCode.trim(),
      inchargeName: newPinIncharge.trim() || branchObj?.managerName || "Branch In-charge",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      createdByAdminId: currentAdminId || "admin_current"
    };

    setBranchPINs((prev) => {
      const idx = prev.findIndex((p) => p.branchId === newPinBranchId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newBranchPin;
        return copy;
      }
      return [newBranchPin, ...prev];
    });

    setPinNotice(`Security PIN for ${branchName} successfully saved as: ${newPinCode.trim()}!`);
    setNewPinCode("");
    setNewPinIncharge("");
  };

  return (
    <div id="admin-exam-portal-container" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-indigo-300 text-xs font-semibold rounded-full mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-300" />
              Super Administrator • Central Examination Council
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Controller of Examinations Desk</h1>
            <p className="text-slate-300 text-sm mt-1">
              Command center for exam form verifications, lock controls, marks moderations, admit card launches, and branch security PINs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                examSettings.isAdmitCardLaunched
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Admit Cards: {examSettings.isAdmitCardLaunched ? "Launched" : "Withheld"}
            </span>
            <span
              className={`px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                examSettings.isFormLocked
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Forms: {examSettings.isFormLocked ? "Locked" : "Open"}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/10">
          <button
            id="tab-admin-exam-forms"
            onClick={() => setActiveTab("forms")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "forms"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            View & Edit Forms ({examForms.length})
          </button>
          <button
            id="tab-admin-lock-controls"
            onClick={() => setActiveTab("lockControls")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "lockControls"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Lock className="w-4 h-4" />
            Lock / Unlock Controls
          </button>
          <button
            id="tab-admin-marks-results"
            onClick={() => setActiveTab("marksResults")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "marksResults"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Moderated Marks & Results ({examMarksheets.length})
          </button>
          <button
            id="tab-admin-admit-card-launch"
            onClick={() => setActiveTab("admitCardLaunch")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "admitCardLaunch"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Award className="w-4 h-4" />
            Admit Card Launch Desk
          </button>
          <button
            id="tab-admin-branch-pins"
            onClick={() => setActiveTab("branchPins")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "branchPins"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Branch PIN Management
          </button>
        </div>
      </div>

      {/* TAB 1: VIEW & EDIT STUDENTS EXAM FORMS */}
      {activeTab === "forms" && (
        <div id="section-admin-view-edit-forms" className="space-y-6">
          {formNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
              <span>{formNotice}</span>
              <button onClick={() => setFormNotice("")} className="text-emerald-600 hover:text-emerald-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Submitted Candidate Examination Forms</h2>
                <p className="text-xs text-slate-500">
                  Total {examForms.length} student application forms submitted by branch faculty.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student, roll, branch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="px-3.5 py-3">Roll No</th>
                    <th className="px-3.5 py-3">Student Name</th>
                    <th className="px-3.5 py-3">Class</th>
                    <th className="px-3.5 py-3">Branch Center</th>
                    <th className="px-3.5 py-3 text-center">Fee Status</th>
                    <th className="px-3.5 py-3 text-center">Status</th>
                    <th className="px-3.5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredForms.map((form) => (
                    <tr key={form.id} className="hover:bg-slate-50">
                      <td className="px-3.5 py-3 font-mono font-bold text-indigo-700">{form.rollNo}</td>
                      <td className="px-3.5 py-3 font-semibold text-slate-900">
                        {form.studentName}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          Teacher: {form.filledByTeacherName}
                        </span>
                      </td>
                      <td className="px-3.5 py-3">{form.classGrade}</td>
                      <td className="px-3.5 py-3 truncate max-w-[170px]">{form.branchCenterName}</td>
                      <td className="px-3.5 py-3 text-center">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            form.feeStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {form.feeStatus}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-center">
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {form.formStatus}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-right space-x-1">
                        <button
                          onClick={() => downloadExamFormPdf(form)}
                          title="Download Form PDF"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingForm(form)}
                          title="Admin Edit Form"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-amber-600 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExamForm(form.id)}
                          title="Delete Form"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* EDIT FORM MODAL */}
          {editingForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b">
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Exam Form: {editingForm.studentName}
                  </h3>
                  <button onClick={() => setEditingForm(null)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateExamForm} className="mt-4 space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500">Student Name</label>
                      <input
                        type="text"
                        value={editingForm.studentName}
                        onChange={(e) => setEditingForm({ ...editingForm, studentName: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500">Roll Number</label>
                      <input
                        type="text"
                        value={editingForm.rollNo}
                        onChange={(e) => setEditingForm({ ...editingForm, rollNo: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500">Father's Name</label>
                      <input
                        type="text"
                        value={editingForm.fatherName || ""}
                        onChange={(e) => setEditingForm({ ...editingForm, fatherName: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500">Fee Status</label>
                      <select
                        value={editingForm.feeStatus}
                        onChange={(e) => setEditingForm({ ...editingForm, feeStatus: e.target.value as any })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500">Form Approval Status</label>
                      <select
                        value={editingForm.formStatus}
                        onChange={(e) => setEditingForm({ ...editingForm, formStatus: e.target.value as any })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="Approved">Approved</option>
                        <option value="Verified">Verified</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500">Class / Grade</label>
                      <input
                        type="text"
                        value={editingForm.classGrade}
                        onChange={(e) => setEditingForm({ ...editingForm, classGrade: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500">Admin Remarks / Notes</label>
                    <textarea
                      rows={2}
                      value={editingForm.adminRemarks || ""}
                      onChange={(e) => setEditingForm({ ...editingForm, adminRemarks: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      placeholder="e.g. Special accommodations approved."
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button
                      type="button"
                      onClick={() => setEditingForm(null)}
                      className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LOCK / UNLOCK CONTROLS */}
      {activeTab === "lockControls" && (
        <div id="section-admin-lock-controls" className="space-y-6">
          {lockSaveSuccess && (
            <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
              <span>{lockSaveSuccess}</span>
              <button onClick={() => setLockSaveSuccess("")} className="text-indigo-600 hover:text-indigo-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Control 1: Exam Form Lock */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      examSettings.isFormLocked ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {examSettings.isFormLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Exam Forms Lock</h3>
                    <p className="text-[11px] text-slate-500">Controls teacher form submission</p>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-admin-toggle-form-lock"
                  onClick={handleToggleFormLock}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                    examSettings.isFormLocked
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {examSettings.isFormLocked ? "Locked" : "Unlocked"}
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t text-xs">
                <div>
                  <label className="text-slate-500 font-medium">Mention Lock Date</label>
                  <input
                    type="date"
                    value={lockDate}
                    onChange={(e) => setLockDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-medium">Mention Lock Time</label>
                  <input
                    type="text"
                    value={lockTime}
                    onChange={(e) => setLockTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 mt-1"
                    placeholder="e.g. 23:59 IST"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-medium">Message for Teachers/Students</label>
                  <textarea
                    rows={2}
                    value={lockMsg}
                    onChange={(e) => setLockMsg(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Control 2: Marks Entry Lock */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      examSettings.isMarksLocked ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {examSettings.isMarksLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Marks Entry Lock</h3>
                    <p className="text-[11px] text-slate-500">Freezes faculty score uploads</p>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-admin-toggle-marks-lock"
                  onClick={handleToggleMarksLock}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                    examSettings.isMarksLocked
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {examSettings.isMarksLocked ? "Locked" : "Unlocked"}
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t text-xs">
                <div>
                  <label className="text-slate-500 font-medium">Mention Lock Date</label>
                  <input
                    type="date"
                    value={marksLockDate}
                    onChange={(e) => setMarksLockDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-medium">Mention Lock Time</label>
                  <input
                    type="text"
                    value={marksLockTime}
                    onChange={(e) => setMarksLockTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 mt-1"
                    placeholder="e.g. 18:00 IST"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-medium">Message for Faculty</label>
                  <textarea
                    rows={2}
                    value={marksLockMsg}
                    onChange={(e) => setMarksLockMsg(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Control 3: Results Publication Lock */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      examSettings.isResultLocked ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {examSettings.isResultLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Result Lock / Release</h3>
                    <p className="text-[11px] text-slate-500">Publishes or withholds results</p>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-admin-toggle-result-lock"
                  onClick={handleToggleResultLock}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                    examSettings.isResultLocked
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {examSettings.isResultLocked ? "Locked" : "Unlocked"}
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t text-xs">
                <div>
                  <label className="text-slate-500 font-medium">Mention Lock/Release Date</label>
                  <input
                    type="date"
                    value={resultLockDate}
                    onChange={(e) => setResultLockDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-medium">Mention Lock/Release Time</label>
                  <input
                    type="text"
                    value={resultLockTime}
                    onChange={(e) => setResultLockTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 mt-1"
                    placeholder="e.g. 12:00 IST"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-medium">Public Results Announcement</label>
                  <textarea
                    rows={2}
                    value={resultLockMsg}
                    onChange={(e) => setResultLockMsg(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHECK, VIEW, EDIT MARKS & RESULTS */}
      {activeTab === "marksResults" && (
        <div id="section-admin-marks-results" className="space-y-6">
          {marksheetNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
              <span>{marksheetNotice}</span>
              <button onClick={() => setMarksheetNotice("")} className="text-emerald-600 hover:text-emerald-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Certified Student Marksheets & Results</h2>
                <p className="text-xs text-slate-500">
                  Admin inspection, grace marks moderation, certified result deletion, and provisional marksheets overview.
                </p>
              </div>

              {/* Statistics counter chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">
                  Total: {examMarksheets.length}
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">
                  Passed: {examMarksheets.filter((m) => m.resultStatus === "PASS").length}
                </span>
                <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold border border-rose-200">
                  Failed: {examMarksheets.filter((m) => m.resultStatus === "FAIL").length}
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by student name, roll no, or class..."
                  value={marksheetSearchQuery}
                  onChange={(e) => setMarksheetSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {marksheetSearchQuery && (
                  <button
                    onClick={() => setMarksheetSearchQuery("")}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={marksheetGradeFilter}
                  onChange={(e) => setMarksheetGradeFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Classes</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 12">Class 12</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 11">Class 11</option>
                </select>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="px-3.5 py-3">Roll No</th>
                    <th className="px-3.5 py-3">Student Name</th>
                    <th className="px-3.5 py-3">Class</th>
                    <th className="px-3.5 py-3 text-center">Grand Total</th>
                    <th className="px-3.5 py-3 text-center">Percentage</th>
                    <th className="px-3.5 py-3 text-center">Grade</th>
                    <th className="px-3.5 py-3 text-center">Status</th>
                    <th className="px-3.5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredMarksheets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Award className="w-8 h-8 text-slate-300 stroke-1" />
                          <p className="text-sm font-semibold text-slate-600">No certified student marksheets found</p>
                          <p className="text-xs text-slate-400">
                            {marksheetSearchQuery || marksheetGradeFilter !== "all"
                              ? "No marksheets match your search or filter criteria."
                              : "Certified student marksheets and results will be listed here after entry and publication."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMarksheets.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3.5 py-3 font-mono font-bold text-indigo-700">{m.rollNo}</td>
                        <td className="px-3.5 py-3 font-semibold text-slate-900">{m.studentName}</td>
                        <td className="px-3.5 py-3">{m.classGrade}</td>
                        <td className="px-3.5 py-3 text-center font-bold text-slate-800">
                          {m.grandTotalObtained} / {m.grandTotalMax}
                        </td>
                        <td className="px-3.5 py-3 text-center font-mono font-bold text-indigo-600">
                          {m.percentage}%
                        </td>
                        <td className="px-3.5 py-3 text-center font-bold text-emerald-600">{m.overallGrade}</td>
                        <td className="px-3.5 py-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              m.resultStatus === "PASS"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {m.resultStatus}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-right space-x-1">
                          <button
                            onClick={() => downloadResultMarksheetPdf(m)}
                            title="Download Marksheet PDF"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingMarksheet(m)}
                            title="Edit Marks & Result"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-amber-600 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-marksheet-${m.id}`}
                            onClick={() => setMarksheetToDelete(m)}
                            title="Delete Marksheet & Result"
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* EDIT MARKS MODAL */}
          {editingMarksheet && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b">
                  <h3 className="text-base font-bold text-slate-900">
                    Admin Marks Moderation: {editingMarksheet.studentName}
                  </h3>
                  <button onClick={() => setEditingMarksheet(null)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditedMarksheet} className="mt-4 space-y-4">
                  <div className="max-h-[340px] overflow-y-auto space-y-3">
                    {editingMarksheet.marks.map((subj, sIdx) => (
                      <div key={subj.subjectId} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{subj.subjectName}</p>
                          <p className="font-mono text-[10px] text-indigo-600">{subj.subjectCode}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Theory</span>
                            <input
                              type="number"
                              value={subj.theoryMarksObtained}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updatedList = [...editingMarksheet.marks];
                                updatedList[sIdx] = { ...subj, theoryMarksObtained: val };
                                setEditingMarksheet({ ...editingMarksheet, marks: updatedList });
                              }}
                              className="w-16 px-2 py-1 text-xs text-center rounded border border-slate-300"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Practical</span>
                            <input
                              type="number"
                              value={subj.practicalMarksObtained}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const updatedList = [...editingMarksheet.marks];
                                updatedList[sIdx] = { ...subj, practicalMarksObtained: val };
                                setEditingMarksheet({ ...editingMarksheet, marks: updatedList });
                              }}
                              className="w-16 px-2 py-1 text-xs text-center rounded border border-slate-300"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setMarksheetToDelete(editingMarksheet);
                      }}
                      className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl inline-flex items-center gap-1.5 border border-rose-200 hover:border-rose-300 transition cursor-pointer"
                      title="Permanently remove this certified marksheet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Marksheet
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingMarksheet(null)}
                        className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow cursor-pointer"
                      >
                        Save & Recalculate
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* DEDICATED DELETE MARKSHEET CONFIRMATION MODAL */}
          {marksheetToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-900">Delete Certified Marksheet?</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      This will permanently remove the student's examination results, transcript grades, and certified marksheet record from both local memory and Firestore database.
                    </p>
                  </div>
                </div>

                {/* Candidate Summary Card */}
                <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Student Name:</span>
                    <span className="font-bold text-slate-800">{marksheetToDelete.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Roll Code:</span>
                    <span className="font-mono font-bold text-indigo-700">{marksheetToDelete.rollNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Class & Grade:</span>
                    <span className="font-medium text-slate-700">{marksheetToDelete.classGrade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Result & Total:</span>
                    <span className="font-bold text-slate-800">
                      {marksheetToDelete.grandTotalObtained} / {marksheetToDelete.grandTotalMax} ({marksheetToDelete.percentage}%) • {marksheetToDelete.resultStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setMarksheetToDelete(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    id="btn-confirm-delete-marksheet"
                    onClick={() => handleConfirmDeleteMarksheet(marksheetToDelete)}
                    className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Confirm Delete Marksheet
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ADMIT CARD LAUNCH BY ADMIN ONLY */}
      {activeTab === "admitCardLaunch" && (
        <div id="section-admin-admit-card-launch" className="space-y-6">
          {admitLaunchNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
              <span>{admitLaunchNotice}</span>
              <button onClick={() => setAdmitLaunchNotice("")} className="text-emerald-600 hover:text-emerald-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md mb-2">
                  Admin Launch Authority Only
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Admit Card Publication Command Center
                </h2>
                <p className="text-xs text-slate-500">
                  When all candidate exam forms across branches are filled and verified, the Administrator has exclusive access to launch official Admit Cards for students.
                </p>
              </div>

              <button
                type="button"
                id="btn-admin-launch-admit-cards"
                onClick={handleToggleAdmitCardLaunch}
                className={`px-6 py-3 rounded-xl text-sm font-bold shadow-md transition active:scale-95 flex items-center gap-2 ${
                  examSettings.isAdmitCardLaunched
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                <Award className="w-5 h-5" />
                {examSettings.isAdmitCardLaunched ? "Revoke / Unpublish Admit Cards" : "Launch Admit Cards Now"}
              </button>
            </div>

            {/* Verification Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border">
                <span className="text-xs text-slate-500">Total Filled Exam Forms</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">{examForms.length}</p>
                <span className="text-[10px] text-emerald-600 font-semibold">Ready for examination</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border">
                <span className="text-xs text-slate-500">Total Fees Cleared</span>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {examForms.filter((f) => f.feeStatus === "Paid").length} / {examForms.length}
                </p>
                <span className="text-[10px] text-slate-400">Paid candidate forms</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border">
                <span className="text-xs text-slate-500">Candidate Download Status</span>
                <p className={`text-2xl font-bold mt-1 ${examSettings.isAdmitCardLaunched ? "text-emerald-600" : "text-amber-600"}`}>
                  {examSettings.isAdmitCardLaunched ? "LIVE & ACCESSIBLE" : "LOCKED / PENDING"}
                </p>
                <span className="text-[10px] text-slate-400">
                  {examSettings.isAdmitCardLaunched ? "Students can download PDF" : "Restricted by Admin"}
                </span>
              </div>
            </div>

            {/* Admit Card Configuration Form */}
            <div className="space-y-4 pt-2 border-t">
              <h3 className="text-sm font-bold text-slate-900">Configure Examination Center & Schedule on Admit Cards</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Examination Center Name</label>
                  <input
                    type="text"
                    value={admitCenterName}
                    onChange={(e) => setAdmitCenterName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Center Full Address</label>
                  <input
                    type="text"
                    value={admitCenterAddress}
                    onChange={(e) => setAdmitCenterAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Reporting Time Slot</label>
                  <input
                    type="text"
                    value={admitReportingTime}
                    onChange={(e) => setAdmitReportingTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Examination Start Date</label>
                  <input
                    type="date"
                    value={admitStartDate}
                    onChange={(e) => setAdmitStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BRANCH PIN CREATE & MANAGEMENT */}
      {activeTab === "branchPins" && (
        <div id="section-admin-branch-pins" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create PIN Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create Branch Security PIN</h3>
                  <p className="text-xs text-slate-500">Admin Only Access</p>
                </div>
              </div>

              {pinNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  {pinNotice}
                </div>
              )}

              <form onSubmit={handleCreateOrUpdatePin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Study HUB Branch / Center <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newPinBranchId}
                    onChange={(e) => setNewPinBranchId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    {studyHubCenters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Security PIN (4 to 6 Digits) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 462011"
                    maxLength={6}
                    value={newPinCode}
                    onChange={(e) => setNewPinCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono tracking-widest text-center rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Teachers must enter this exact PIN to download candidate rosters.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Branch In-charge Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shri Rajesh Sharma"
                    value={newPinIncharge}
                    onChange={(e) => setNewPinIncharge(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save / Update Branch PIN
                </button>
              </form>
            </div>

            {/* List of Branch PINs */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Active Branch Security PINs ({branchPINs.length})
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Configured PINs used for authenticating official teacher roster exports.
              </p>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                    <tr>
                      <th className="px-3.5 py-2.5">Branch Campus</th>
                      <th className="px-3.5 py-2.5 text-center">Security PIN</th>
                      <th className="px-3.5 py-2.5">Branch In-charge</th>
                      <th className="px-3.5 py-2.5 text-right">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {branchPINs.map((pin) => (
                      <tr key={pin.id} className="hover:bg-slate-50">
                        <td className="px-3.5 py-3 font-semibold text-slate-900">
                          {pin.branchName}
                        </td>
                        <td className="px-3.5 py-3 text-center">
                          <span className="px-3 py-1 font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 rounded-md tracking-wider">
                            {pin.pin}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-slate-600">
                          {pin.inchargeName}
                        </td>
                        <td className="px-3.5 py-3 text-right text-slate-400">
                          {pin.updatedAt}
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
    </div>
  );
};

export default AdminExamPortal;
