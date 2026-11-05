import { jsPDF } from "jspdf";
import { ExamForm, ExamPortalSettings, ExamStudentMarksheet } from "../types";

// Helper for drawing clean borders and headers
function drawHeader(doc: jsPDF, title: string, subtitle: string) {
  // Brand banner background
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(14, 10, 182, 24, "F");

  // Title text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("STUDY HUB ACADEMIC BOARD • MADHYA PRADESH", 105, 18, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(title.toUpperCase(), 105, 24, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(subtitle, 105, 30, { align: "center" });
}

// 1. Download Exam Form PDF
export function downloadExamFormPdf(form: ExamForm) {
  const doc = new jsPDF();

  drawHeader(
    doc,
    "OFFICIAL CANDIDATE EXAMINATION FORM",
    `Session: ${form.examSession} • Registration Status: ${form.formStatus}`
  );

  let y = 40;

  // Form ID & Date Banner
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 8, "F");
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Form ID: ${form.id}`, 18, y + 5.5);
  doc.text(`Date of Submission: ${form.submissionDate || "N/A"}`, 130, y + 5.5);

  y += 14;

  // Candidate Details Box
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(14, y, 140, 52); // Info box
  doc.rect(158, y, 38, 48); // Photo box

  // Photo placeholder inside photo box
  doc.setFillColor(248, 250, 252);
  doc.rect(159, y + 1, 36, 46, "F");
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text("AFFIX RECENT", 177, y + 20, { align: "center" });
  doc.text("PASSPORT PHOTO", 177, y + 26, { align: "center" });
  doc.text("& SIGN ACROSS", 177, y + 32, { align: "center" });

  // Candidate Info Text
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);

  const info = [
    ["Candidate Name:", form.studentName, "Roll Number:", form.rollNo],
    ["Father's Name:", form.fatherName || "N/A", "Scholar/Enroll No:", form.scholarNumber || "N/A"],
    ["Mother's Name:", form.motherName || "N/A", "Date of Birth:", form.dob || "N/A"],
    ["Class / Grade:", form.classGrade, "Gender / Contact:", `${form.gender || "N/A"} / ${form.mobileNumber || "N/A"}`],
    ["Center / Branch:", form.branchCenterName, "Exam Fee:", `Rs. ${form.examFee} (${form.feeStatus})`]
  ];

  let lineY = y + 7;
  info.forEach(([label1, val1, label2, val2]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label1, 18, lineY);
    doc.setFont("helvetica", "normal");
    doc.text(val1.length > 24 ? val1.substring(0, 22) + ".." : val1, 48, lineY);

    doc.setFont("helvetica", "bold");
    doc.text(label2, 90, lineY);
    doc.setFont("helvetica", "normal");
    doc.text(val2.length > 20 ? val2.substring(0, 18) + ".." : val2, 126, lineY);

    lineY += 9;
  });

  y += 60;

  // Fee Status Highlight Bar
  if (form.feeStatus === "Paid") {
    doc.setFillColor(220, 252, 231); // green-100
    doc.rect(14, y, 182, 10, "F");
    doc.setTextColor(22, 101, 52); // green-800
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`EXAMINATION FEE: PAID IN FULL  |  Receipt No: ${form.paymentReceiptNo || "ONLINE-VERIFIED"}  |  Mode: ${form.paymentMethod || "Verified Desk"}`, 18, y + 6.5);
  } else {
    doc.setFillColor(254, 242, 242); // red-100
    doc.rect(14, y, 182, 10, "F");
    doc.setTextColor(153, 27, 27); // red-800
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`EXAMINATION FEE STATUS: UNPAID (AMOUNT DUE: Rs. ${form.examFee}). Fee clearance required before admit card verification.`, 18, y + 6.5);
  }

  y += 18;

  // Registered Subjects Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("REGISTERED EXAMINATION SUBJECTS", 14, y);

  y += 5;
  // Table Header
  doc.setFillColor(226, 232, 240);
  doc.rect(14, y, 182, 8, "F");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.5);
  doc.text("S.No", 18, y + 5.5);
  doc.text("Subject Code", 34, y + 5.5);
  doc.text("Subject Name", 75, y + 5.5);
  doc.text("Theory Max", 132, y + 5.5);
  doc.text("Practical Max", 155, y + 5.5);
  doc.text("Passing Marks", 175, y + 5.5);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  form.subjects.forEach((subj, idx) => {
    // Alternating rows
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 7, "F");
    }
    doc.rect(14, y, 182, 7, "S");
    doc.text(String(idx + 1), 19, y + 5);
    doc.text(subj.subjectCode, 34, y + 5);
    doc.text(subj.subjectName, 75, y + 5);
    doc.text(String(subj.theoryMaxMarks), 138, y + 5);
    doc.text(String(subj.practicalMaxMarks), 162, y + 5);
    doc.text(String(subj.passingMarks), 180, y + 5);
    y += 7;
  });

  y += 14;

  // Declaration & Signature Blocks
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Declaration: I hereby declare that all entries made in this examination application form are correct and complete to the best of my knowledge.",
    14,
    y
  );
  doc.text(
    "I agree to abide by the official rules and code of conduct set by Study HUB Examination Board.",
    14,
    y + 4
  );

  y += 24;

  // Signatures
  doc.setLineWidth(0.2);
  doc.line(18, y, 65, y);
  doc.line(80, y, 125, y);
  doc.line(140, y, 188, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text("Candidate Signature", 26, y + 5);
  doc.text(`Filled By: ${form.filledByTeacherName}`, 82, y + 5);
  doc.text("Examination Controller Seal", 145, y + 5);

  doc.save(`Exam_Form_${form.rollNo}_${form.studentName.replace(/\s+/g, '_')}.pdf`);
}

// 2. Download Admit Card PDF
export function downloadAdmitCardPdf(form: ExamForm, settings: ExamPortalSettings) {
  const doc = new jsPDF();

  drawHeader(
    doc,
    "OFFICIAL EXAMINATION HALL TICKET / ADMIT CARD",
    `${settings.activeExamSession} • AUTHENTICATED BOARD COPY`
  );

  let y = 40;

  // Admit Card Badge
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.rect(14, y, 182, 9, "F");
  doc.setTextColor(67, 56, 202); // indigo-700
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(`ROLL NUMBER: ${form.rollNo}  |  ENROLLMENT NO: ${form.scholarNumber || "SH-2026-" + form.rollNo}`, 105, y + 6, { align: "center" });

  y += 14;

  // Candidate Details Section
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(14, y, 140, 56);
  doc.rect(158, y, 38, 50);

  // Photo
  doc.setFillColor(241, 245, 249);
  doc.rect(159, y + 1, 36, 48, "F");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text("STUDENT PHOTO", 177, y + 22, { align: "center" });
  doc.text("VERIFIED", 177, y + 28, { align: "center" });

  // Details
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);

  const lines = [
    ["Candidate Name:", form.studentName],
    ["Father's Name:", form.fatherName || "N/A"],
    ["Mother's Name:", form.motherName || "N/A"],
    ["Class / Stream:", form.classGrade],
    ["Examination Center:", settings.admitCardExamCenterName || form.branchCenterName],
    ["Center Address:", (settings.admitCardExamCenterAddress || form.branchCenterName).substring(0, 48)]
  ];

  let lY = y + 7;
  lines.forEach(([lbl, val]) => {
    doc.setFont("helvetica", "bold");
    doc.text(lbl, 18, lY);
    doc.setFont("helvetica", "normal");
    doc.text(val, 55, lY);
    lY += 8.5;
  });

  y += 62;

  // Timing & Schedule Bar
  doc.setFillColor(254, 243, 199); // amber-100
  doc.rect(14, y, 182, 10, "F");
  doc.setTextColor(146, 64, 14); // amber-800
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(`REPORTING TIME: ${settings.admitCardReportingTime || "08:30 AM"}  •  EXAM START DATE: ${settings.admitCardExamStartDate || "2026-10-15"}`, 18, y + 6.5);

  y += 15;

  // Subject Timetable
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("SCHEDULE OF EXAMINATION PAPERS", 14, y);

  y += 5;
  doc.setFillColor(226, 232, 240);
  doc.rect(14, y, 182, 7.5, "F");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.5);
  doc.text("Paper Code", 18, y + 5);
  doc.text("Subject Name", 50, y + 5);
  doc.text("Exam Date", 115, y + 5);
  doc.text("Timing Slot", 145, y + 5);
  doc.text("Room / Desk", 175, y + 5);

  y += 7.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  // Generate staggered dates for demonstration
  const baseDates = ["15-Oct-2026", "18-Oct-2026", "21-Oct-2026", "24-Oct-2026", "28-Oct-2026", "31-Oct-2026"];

  form.subjects.forEach((subj, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 6.5, "F");
    }
    doc.rect(14, y, 182, 6.5, "S");
    doc.text(subj.subjectCode, 18, y + 4.5);
    doc.text(subj.subjectName, 50, y + 4.5);
    doc.text(baseDates[idx % baseDates.length], 115, y + 4.5);
    doc.text("09:00 AM - 12:00 PM", 145, y + 4.5);
    doc.text(`Desk ${idx + 101}`, 177, y + 4.5);
    y += 6.5;
  });

  y += 10;

  // Candidate Instructions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("IMPORTANT INSTRUCTIONS FOR CANDIDATES:", 14, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  const instructions = settings.admitCardInstructions || [
    "1. Bring this printed Admit Card and an original valid photo ID (Aadhar / School ID) to every examination session.",
    "2. Entry to the exam hall closes strictly 15 minutes before the exam begins. Late arrivals will not be permitted.",
    "3. Mobile phones, smart watches, bags, and electronic calculators are strictly banned inside exam rooms.",
    "4. Use only Blue or Black ballpoint pens for marking answers and OMR sheets."
  ];

  instructions.slice(0, 4).forEach((inst) => {
    doc.text(inst, 14, y);
    y += 4.5;
  });

  y += 10;

  // Signatures
  doc.setLineWidth(0.2);
  doc.line(18, y, 65, y);
  doc.line(135, y, 188, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text("Candidate's Signature in Hall", 22, y + 4.5);
  doc.text("Controller of Examinations (Admin)", 138, y + 4.5);

  doc.save(`Admit_Card_${form.rollNo}_${form.studentName.replace(/\s+/g, '_')}.pdf`);
}

// 3. Download Filtered Students List PDF (Teacher Feature with PIN validation)
export function downloadStudentListPdf(
  forms: ExamForm[],
  branchName: string,
  filterInfo: string
) {
  const doc = new jsPDF();

  drawHeader(
    doc,
    "AUTHORIZED BRANCH CANDIDATE EXAMINATION ROSTER",
    `Campus: ${branchName} • Authentication: Validated via Branch PIN`
  );

  let y = 40;

  // Filter & Stats Summary
  const paidCount = forms.filter((f) => f.feeStatus === "Paid").length;
  const unpaidCount = forms.filter((f) => f.feeStatus === "Unpaid").length;
  const totalFees = forms.reduce((acc, f) => acc + (f.feeStatus === "Paid" ? f.examFee : 0), 0);

  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 10, "F");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text(`Active Filter: ${filterInfo}  |  Total Forms: ${forms.length} (Paid: ${paidCount}, Unpaid: ${unpaidCount})  |  Collected: Rs. ${totalFees}`, 18, y + 6.5);

  y += 16;

  // Table Headers
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, 182, 7.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("S.No", 16, y + 5);
  doc.text("Roll No", 27, y + 5);
  doc.text("Student Name", 50, y + 5);
  doc.text("Class", 90, y + 5);
  doc.text("Subjects", 112, y + 5);
  doc.text("Fee Status", 136, y + 5);
  doc.text("Receipt No", 162, y + 5);

  y += 7.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  forms.forEach((f, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 6.5, "F");
    }
    doc.rect(14, y, 182, 6.5, "S");

    doc.text(String(idx + 1), 17, y + 4.5);
    doc.text(f.rollNo, 27, y + 4.5);
    doc.text(f.studentName.length > 20 ? f.studentName.substring(0, 18) + ".." : f.studentName, 50, y + 4.5);
    doc.text(f.classGrade, 90, y + 4.5);
    doc.text(`${f.subjects?.length || 0} Subjs`, 113, y + 4.5);

    if (f.feeStatus === "Paid") {
      doc.setTextColor(22, 101, 52);
      doc.text("PAID", 138, y + 4.5);
    } else {
      doc.setTextColor(185, 28, 28);
      doc.text("UNPAID", 138, y + 4.5);
    }

    doc.setTextColor(51, 65, 85);
    doc.text(f.paymentReceiptNo || (f.feeStatus === "Paid" ? "VERIFIED" : "DUE"), 162, y + 4.5);

    y += 6.5;

    // Check if new page needed
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  y += 16;
  if (y > 260) {
    doc.addPage();
    y = 20;
  }

  // End of report authentication stamp
  doc.setLineWidth(0.2);
  doc.line(18, y, 65, y);
  doc.line(135, y, 188, y);

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Branch Coordinator Signature", 20, y + 5);
  doc.text("Authorized Center Seal", 145, y + 5);

  doc.save(`Exam_Roster_${branchName.replace(/\s+/g, '_')}_${filterInfo.replace(/\s+/g, '_')}.pdf`);
}

// 4. Download Result Marksheet PDF
export function downloadResultMarksheetPdf(marksheet: ExamStudentMarksheet) {
  const doc = new jsPDF();

  drawHeader(
    doc,
    "ANNUAL BOARD PROVISIONAL STATEMENT OF MARKS",
    `Session: ${marksheet.examSession} • Madhya Pradesh Examination Council`
  );

  let y = 40;

  // Student Summary Box
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 22, "F");
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, 182, 22, "S");

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  doc.setFont("helvetica", "bold");
  doc.text("Candidate Name:", 18, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text(marksheet.studentName, 50, y + 7);

  doc.setFont("helvetica", "bold");
  doc.text("Roll Number:", 120, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text(marksheet.rollNo, 145, y + 7);

  doc.setFont("helvetica", "bold");
  doc.text("Class / Stream:", 18, y + 15);
  doc.setFont("helvetica", "normal");
  doc.text(marksheet.classGrade, 50, y + 15);

  doc.setFont("helvetica", "bold");
  doc.text("Campus / Center:", 120, y + 15);
  doc.setFont("helvetica", "normal");
  doc.text(marksheet.branchCenterName.substring(0, 24), 148, y + 15);

  y += 28;

  // Marks Table
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, 182, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("Code", 17, y + 5.5);
  doc.text("Subject Name", 38, y + 5.5);
  doc.text("Theory (Max/Obt)", 95, y + 5.5);
  doc.text("Practical (Max/Obt)", 135, y + 5.5);
  doc.text("Total", 175, y + 5.5);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  marksheet.marks.forEach((m, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 7, "F");
    }
    doc.rect(14, y, 182, 7, "S");

    doc.text(m.subjectCode, 17, y + 5);
    doc.text(m.subjectName, 38, y + 5);
    doc.text(`${m.theoryMarksObtained} / ${m.totalMaxMarks - (m.totalMaxMarks === 100 ? (m.totalMaxMarks > 80 ? 20 : 30) : 20)}`, 100, y + 5);
    doc.text(`${m.practicalMarksObtained} / ${m.totalMaxMarks === 100 ? (m.totalMaxMarks > 80 ? 20 : 30) : 20}`, 142, y + 5);
    doc.setFont("helvetica", "bold");
    doc.text(`${m.totalObtained} (${m.grade})`, 175, y + 5);
    doc.setFont("helvetica", "normal");

    y += 7;
  });

  y += 10;

  // Grand Total & Division Banner
  doc.setFillColor(238, 242, 255);
  doc.rect(14, y, 182, 16, "F");
  doc.setDrawColor(199, 210, 254);
  doc.rect(14, y, 182, 16, "S");

  doc.setFontSize(10);
  doc.setTextColor(30, 27, 75);
  doc.setFont("helvetica", "bold");
  doc.text(`GRAND TOTAL: ${marksheet.grandTotalObtained} / ${marksheet.grandTotalMax}`, 20, y + 7);
  doc.text(`PERCENTAGE: ${marksheet.percentage}%`, 110, y + 7);

  const statusColor = marksheet.resultStatus === "PASS" ? [22, 101, 52] : [185, 28, 28];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`FINAL RESULT: ${marksheet.resultStatus} (${marksheet.division})`, 20, y + 13);
  doc.setTextColor(30, 27, 75);
  doc.text(`OVERALL GRADE: ${marksheet.overallGrade}`, 110, y + 13);

  y += 26;

  // Grading key explanation
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Grading Scale: A+ (90-100%), A (80-89%), B+ (70-79%), B (60-69%), C (50-59%), D (33-49%), F (Below 33% - Essential Repeat)", 14, y);
  doc.text("Note: This provisional statement of marks is certified and verified by the authorized examination division.", 14, y + 4.5);

  y += 24;

  // Signatures
  doc.setLineWidth(0.2);
  doc.line(18, y, 65, y);
  doc.line(135, y, 188, y);

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Prepared & Checked By", 22, y + 4.5);
  doc.text("Controller of Examinations (Admin)", 136, y + 4.5);

  doc.save(`Marksheet_${marksheet.rollNo}_${marksheet.studentName.replace(/\s+/g, '_')}.pdf`);
}
