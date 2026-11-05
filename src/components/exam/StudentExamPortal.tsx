import React, { useState, useMemo } from "react";
import {
  FileText,
  Download,
  Award,
  Search,
  CheckCircle,
  AlertCircle,
  Lock,
  Calendar,
  Clock,
  Printer,
  BookOpen,
  User,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import {
  ExamForm,
  ExamStudentMarksheet,
  ExamPortalSettings,
  Student
} from "../../types";
import {
  downloadExamFormPdf,
  downloadAdmitCardPdf,
  downloadResultMarksheetPdf
} from "../../utils/examPdfGenerator";

interface StudentExamPortalProps {
  currentStudentId?: string;
  currentStudentName?: string;
  examForms: ExamForm[];
  examMarksheets: ExamStudentMarksheet[];
  examSettings: ExamPortalSettings;
  students: Student[];
}

export const StudentExamPortal: React.FC<StudentExamPortalProps> = ({
  currentStudentId,
  currentStudentName,
  examForms,
  examMarksheets,
  examSettings,
  students
}) => {
  const [activeTab, setActiveTab] = useState<"form" | "admitCard" | "result">("form");
  const [searchRollNo, setSearchRollNo] = useState("");
  const [searchedMarksheet, setSearchedMarksheet] = useState<ExamStudentMarksheet | null | undefined>(undefined);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Identify student's own form
  const studentForm = useMemo(() => {
    if (!currentStudentId && !currentStudentName) {
      return examForms[0] || null;
    }
    return (
      examForms.find(
        (f) =>
          f.studentId === currentStudentId ||
          f.studentName.toLowerCase() === (currentStudentName || "").toLowerCase()
      ) || examForms[0] || null
    );
  }, [currentStudentId, currentStudentName, examForms]);

  // Identify student's own marksheet
  const studentMarksheet = useMemo(() => {
    if (!studentForm) return null;
    return examMarksheets.find(
      (m) =>
        m.rollNo === studentForm.rollNo ||
        m.studentId === studentForm.studentId ||
        m.studentName.toLowerCase() === studentForm.studentName.toLowerCase()
    ) || null;
  }, [studentForm, examMarksheets]);

  const handleSearchRoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRollNo.trim()) return;
    setSearchAttempted(true);
    const found = examMarksheets.find(
      (m) => m.rollNo.trim().toLowerCase() === searchRollNo.trim().toLowerCase()
    );
    setSearchedMarksheet(found || null);
  };

  return (
    <div id="student-exam-portal-container" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-indigo-200 text-xs font-semibold rounded-full mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
              Madhya Pradesh Academic Board • Exam Portal
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Student Examination Center</h1>
            <p className="text-slate-300 text-sm mt-1">
              View your registered exam form, download official Admit Card, and inspect board marksheets.
            </p>
          </div>
          {studentForm && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 px-4 border border-white/15 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center font-bold text-indigo-200">
                {studentForm.studentName.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-slate-300">Registered Candidate</p>
                <p className="text-sm font-semibold">{studentForm.studentName}</p>
                <p className="text-xs text-indigo-300 font-mono">Roll: {studentForm.rollNo} • {studentForm.classGrade}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/10">
          <button
            id="tab-student-exam-form"
            onClick={() => setActiveTab("form")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "form"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            My Exam Form
          </button>
          <button
            id="tab-student-admit-card"
            onClick={() => setActiveTab("admitCard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "admitCard"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Award className="w-4 h-4" />
            Admit Card / Hall Ticket
            {!examSettings.isAdmitCardLaunched && (
              <span className="text-[10px] bg-amber-400 text-amber-950 font-bold px-1.5 py-0.5 rounded-full">
                Pending
              </span>
            )}
          </button>
          <button
            id="tab-student-check-result"
            onClick={() => setActiveTab("result")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "result"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Search className="w-4 h-4" />
            Check Result by Roll No
          </button>
        </div>
      </div>

      {/* TAB 1: VIEW EXAM FORM */}
      {activeTab === "form" && (
        <div id="section-exam-form" className="space-y-6">
          {studentForm ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                      {studentForm.examSession}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                        studentForm.feeStatus === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      Fee: {studentForm.feeStatus.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">
                    Examination Application Details
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Filled & Authenticated by Faculty Teacher: <strong className="text-slate-700">{studentForm.filledByTeacherName}</strong> on {studentForm.submissionDate}
                  </p>
                </div>

                <button
                  id="btn-download-exam-form-pdf"
                  onClick={() => downloadExamFormPdf(studentForm)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-medium rounded-xl shadow transition"
                >
                  <Download className="w-4 h-4" />
                  Download Exam Form (PDF)
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Candidate Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Candidate Name</span>
                    <p className="text-sm font-semibold text-slate-800">{studentForm.studentName}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Roll Number</span>
                    <p className="text-sm font-mono font-bold text-indigo-600">{studentForm.rollNo}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Class / Stream</span>
                    <p className="text-sm font-semibold text-slate-800">{studentForm.classGrade}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Scholar / Reg ID</span>
                    <p className="text-sm font-mono text-slate-700">{studentForm.scholarNumber || "SCH-2026-" + studentForm.rollNo}</p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-medium">Father's Name</span>
                    <p className="text-sm text-slate-700">{studentForm.fatherName || "Not Mentioned"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Mother's Name</span>
                    <p className="text-sm text-slate-700">{studentForm.motherName || "Not Mentioned"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Date of Birth / Gender</span>
                    <p className="text-sm text-slate-700">{studentForm.dob || "N/A"} • {studentForm.gender || "General"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Registered Center</span>
                    <p className="text-sm text-slate-700 truncate">{studentForm.branchCenterName}</p>
                  </div>
                </div>

                {/* Exam Fee Status Card */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    studentForm.feeStatus === "Paid"
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-amber-50/50 border-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        studentForm.feeStatus === "Paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Exam Registration Fee: Rs. {studentForm.examFee}
                      </p>
                      <p className="text-xs text-slate-600">
                        {studentForm.feeStatus === "Paid"
                          ? `Payment Verified • Receipt No: ${studentForm.paymentReceiptNo || "VERIFIED-DESK"} (${studentForm.paymentMethod || "Direct Payment"})`
                          : "Fee pending. Please submit payment to your campus teacher/desk to finalize enrollment."}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      studentForm.feeStatus === "Paid"
                        ? "bg-emerald-600 text-white"
                        : "bg-amber-600 text-white"
                    }`}
                  >
                    {studentForm.feeStatus}
                  </span>
                </div>

                {/* Registered Subjects Table */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Registered Subjects ({studentForm.subjects?.length || 0})
                  </h3>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-100 text-xs uppercase font-semibold text-slate-600">
                        <tr>
                          <th className="px-4 py-3">#</th>
                          <th className="px-4 py-3">Subject Code</th>
                          <th className="px-4 py-3">Subject Name</th>
                          <th className="px-4 py-3 text-center">Theory Max</th>
                          <th className="px-4 py-3 text-center">Practical Max</th>
                          <th className="px-4 py-3 text-center">Total Max</th>
                          <th className="px-4 py-3 text-center">Passing Marks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {studentForm.subjects?.map((subj, idx) => (
                          <tr key={subj.subjectId || idx} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-400">{idx + 1}</td>
                            <td className="px-4 py-3 font-mono font-semibold text-indigo-600">
                              {subj.subjectCode}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-800">
                              {subj.subjectName}
                            </td>
                            <td className="px-4 py-3 text-center">{subj.theoryMaxMarks}</td>
                            <td className="px-4 py-3 text-center">{subj.practicalMaxMarks}</td>
                            <td className="px-4 py-3 text-center font-bold text-slate-900">
                              {subj.totalMaxMarks}
                            </td>
                            <td className="px-4 py-3 text-center text-emerald-600 font-semibold">
                              {subj.passingMarks}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Exam Form Submitted Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Your examination form has not been uploaded by your branch teacher yet. Once uploaded, you will be able to review all details and download the PDF.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ADMIT CARD DOWNLOAD */}
      {activeTab === "admitCard" && (
        <div id="section-admit-card" className="space-y-6">
          {!examSettings.isAdmitCardLaunched ? (
            <div className="bg-white rounded-2xl border border-amber-200 p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Admit Cards Under Authorization</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    The Board Examination Administrator has not officially launched the admit cards yet. Admit cards are released once all student exam forms and fee verifications across branches are complete.
                  </p>
                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                    <strong>Notice:</strong> Please check back shortly or consult your branch in-charge. Once launched by the administrator, your official hall ticket will become immediately downloadable here.
                  </div>
                </div>
              </div>
            </div>
          ) : studentForm ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 bg-indigo-50/60 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                    OFFICIALLY RELEASED
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    Examination Hall Ticket / Admit Card
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorized by Examination Controller • Carry this document to the exam center
                  </p>
                </div>

                <button
                  id="btn-download-admit-card-pdf"
                  onClick={() => downloadAdmitCardPdf(studentForm, examSettings)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow transition"
                >
                  <Download className="w-4 h-4" />
                  Download Admit Card (PDF)
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Admit card preview frame */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/50">
                  <div className="flex flex-col md:flex-row items-center justify-between border-b pb-4 gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {examSettings.activeExamSession}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Study HUB Central Examination Pavilion
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Roll Number</p>
                      <p className="text-xl font-mono font-bold text-indigo-700">
                        {studentForm.rollNo}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 text-xs">
                    <div className="p-3 bg-white rounded-lg border">
                      <span className="text-slate-400">Student Name</span>
                      <p className="text-sm font-bold text-slate-800">{studentForm.studentName}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border">
                      <span className="text-slate-400">Reporting Time</span>
                      <p className="text-sm font-bold text-slate-800">
                        {examSettings.admitCardReportingTime || "08:30 AM IST"}
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border">
                      <span className="text-slate-400">Center Address</span>
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {examSettings.admitCardExamCenterName || studentForm.branchCenterName}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 bg-white p-4 rounded-xl border">
                    <p className="font-bold text-slate-800 mb-1">Key Hall Ticket Instructions:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>Report to the exam center 45 minutes prior to commencement.</li>
                      <li>Carry your original Photo Identity Card along with this printed ticket.</li>
                      <li>Smartphones, smartwatches, and study notes are strictly forbidden.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Admit Card Available</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Your examination form has not been submitted yet. Once your teacher submits your form, your admit card will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CHECK RESULT BY ROLL NUMBER */}
      {activeTab === "result" && (
        <div id="section-check-result" className="space-y-6">
          {/* Lock notice if result is locked by admin */}
          {examSettings.isResultLocked && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-900">
                  Results Locked by Examination Board
                </h3>
                <p className="text-xs text-rose-700 mt-1">
                  {examSettings.resultLockMessage || "Results are currently being moderated and finalized by the board authority."}
                </p>
                {examSettings.resultLockDate && (
                  <p className="text-xs text-rose-600 font-mono mt-2">
                    Locked on: {examSettings.resultLockDate} at {examSettings.resultLockTime}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Search Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Search Board Result by Roll Number
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter candidate's 7-digit examination roll number to view certified score card.
            </p>

            <form onSubmit={handleSearchRoll} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-search-roll-no"
                  type="text"
                  placeholder="Enter Examination Roll No (e.g. 2601001)"
                  value={searchRollNo}
                  onChange={(e) => setSearchRollNo(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                />
              </div>
              <button
                id="btn-search-result-submit"
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow transition active:scale-95"
              >
                Search Result
              </button>
            </form>

            {/* Quick autofill button for current student */}
            {studentForm && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <span>My Roll Number:</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchRollNo(studentForm.rollNo);
                    setSearchAttempted(true);
                    const found = examMarksheets.find(
                      (m) => m.rollNo.trim().toLowerCase() === studentForm.rollNo.trim().toLowerCase()
                    );
                    setSearchedMarksheet(found || null);
                  }}
                  className="font-mono text-indigo-600 font-semibold hover:underline bg-indigo-50 px-2 py-0.5 rounded"
                >
                  {studentForm.rollNo} ({studentForm.studentName})
                </button>
              </div>
            )}
          </div>

          {/* Search Result Display */}
          {searchAttempted && (
            <div>
              {searchedMarksheet ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                            searchedMarksheet.resultStatus === "PASS"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {searchedMarksheet.resultStatus} • {searchedMarksheet.division}
                        </span>
                        <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">
                          Roll: {searchedMarksheet.rollNo}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mt-2">
                        {searchedMarksheet.studentName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {searchedMarksheet.classGrade} • {searchedMarksheet.branchCenterName}
                      </p>
                    </div>

                    <button
                      id="btn-download-result-pdf"
                      onClick={() => downloadResultMarksheetPdf(searchedMarksheet)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow transition active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      Download Marksheet (PDF)
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Summary stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div>
                        <span className="text-xs text-slate-400">Marks Obtained</span>
                        <p className="text-lg font-bold text-slate-900">
                          {searchedMarksheet.grandTotalObtained} / {searchedMarksheet.grandTotalMax}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Percentage</span>
                        <p className="text-lg font-bold text-indigo-600">
                          {searchedMarksheet.percentage}%
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Overall Grade</span>
                        <p className="text-lg font-bold text-emerald-600">
                          {searchedMarksheet.overallGrade}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Division</span>
                        <p className="text-lg font-bold text-slate-800">
                          {searchedMarksheet.division}
                        </p>
                      </div>
                    </div>

                    {/* Subject Marks Table */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-100 text-xs uppercase font-semibold text-slate-600">
                          <tr>
                            <th className="px-4 py-3">Subject Code</th>
                            <th className="px-4 py-3">Subject Name</th>
                            <th className="px-4 py-3 text-center">Theory</th>
                            <th className="px-4 py-3 text-center">Practical</th>
                            <th className="px-4 py-3 text-center">Total</th>
                            <th className="px-4 py-3 text-center">Grade</th>
                            <th className="px-4 py-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {searchedMarksheet.marks?.map((m) => (
                            <tr key={m.subjectId} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-mono font-semibold text-indigo-600">
                                {m.subjectCode}
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-800">
                                {m.subjectName}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {m.theoryMarksObtained}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {m.practicalMarksObtained}
                              </td>
                              <td className="px-4 py-3 text-center font-bold text-slate-900">
                                {m.totalObtained} / {m.totalMaxMarks}
                              </td>
                              <td className="px-4 py-3 text-center font-semibold text-indigo-700">
                                {m.grade}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded font-bold ${
                                    m.isPassed
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-rose-50 text-rose-700"
                                  }`}
                                >
                                  {m.isPassed ? "PASS" : "FAIL"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                  <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
                  <h4 className="text-base font-bold text-slate-800">No Result Record Found</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    We could not find any examination result for Roll Number{" "}
                    <strong className="font-mono text-slate-700">{searchRollNo}</strong>.
                    Please double-check the number or contact your academic center.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentExamPortal;
