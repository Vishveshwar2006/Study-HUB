export interface Batch {
  id: string;
  name: string;
  subject: string;
  schedule: string; // e.g. "Mon, Wed, Fri 4:00 PM"
  teacherId: string;
  studentIds: string[];
  code: string;
}

export interface Teacher {
  id: string;
  name: string;
  username?: string;
  email?: string;
  employeeCode?: string;
  specialization: string;
  avatar: string;
  status: "Active" | "On Leave";
  password?: string;
  schoolId?: string; // affiliated school
}

export interface Student {
  id: string;
  name: string;
  username?: string;
  email?: string;
  rollNo?: string;
  avatar: string;
  status: "Active" | "Inactive";
  password?: string;
  isLocked?: boolean; // Instantly lock out student on the spot
  assignedComputerDeskCode?: string; // Allotted by verified teacher
  verifiedAt?: string; // Timestamp of verifier verification
  isVerified?: boolean; // Verified by Verifier
  aadharNumber?: string; // Aadhar number added by verifier
  verifiedRollNumber?: string; // Roll number given by teacher & verified
  isExamActive?: boolean; // Active secure exam mode
  activeExamId?: string; // Current active exam
  schoolName?: string;
  mobileNumber?: string;
  batchId?: string;
  isSelfRegistered?: boolean;
  isGoogleRegistered?: boolean;
  googleEmail?: string;
  registeredAt?: string;
  dob?: string; // Date of Birth (e.g., DD-MM-YYYY), used as the Online Fee Portal Password
  serialNumber?: string;
  apparId?: string;
  penNumber?: string;
  fatherName?: string;
  motherName?: string;
  scholarNumber?: string;
  ssmId?: string;
  schoolId?: string; // affiliated school ID
}

export interface Lesson {
  id: string;
  batchId: string;
  title: string;
  description: string;
  content: string; // Markdown formatted
  date: string;
  status: "Draft" | "Published" | "Completed";
  attendance: { [studentId: string]: boolean };
}

export interface TestQuestion {
  id: string;
  section: string; // Mechanics, Optics, Electromagnetism, etc.
  sectionName?: string;
  type: "MCQ" | "True/False" | "Written";
  questionText: string;
  options?: string[]; // MCQs array
  correctAnswer?: string;
  markWeight?: number;
}

export interface Test {
  id: string;
  batchId: string;
  title: string;
  date: string;
  maxMarks: number;
  scores: { [studentId: string]: number }; // studentId -> obtainedScore
  questions?: TestQuestion[];
  isLive?: boolean; // Secure Live Status
  isAdminApproved?: boolean; // Admin approval status to go live in Student Dashboard
  subject?: string; // Optional tag for subject wise test classification
  examKey?: string; // Secret key generated/set by the teacher to unlock the test
  requireLabAllotment?: boolean; // If student needs computer and lab allotment to start test
  isResultsPublished?: boolean; // Toggle to publish results/scores to student report
}

export interface TestSubmission {
  id: string;
  testId: string;
  studentId: string;
  answers: { [questionId: string]: string };
  submittedAt: string;
  score?: number;
  isGraded?: boolean;
  isPublished?: boolean;
  feedback?: string;
}

export interface ComputerDesk {
  id: string;
  uniqueCode: string; // Registered Unique Code (e.g. LAB-PC-01)
  ipAddress: string;
  status: "Available" | "Occupied" | "Maintenance";
  currentStudentId?: string; // Allotted student
  roomNumber: string;
  facultyName?: string; // Faculty / Department name classification
}

export interface Announcement {
  id: string;
  batchId: string | "all"; // "all" for global announcements
  senderName: string;
  senderRole: "Admin" | "Teacher";
  title: string;
  content: string;
  date: string;
  isPublished?: boolean;
}

export interface OnlineAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  isPublished?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  name: string;
  username?: string;
  email?: string;
  employeeCode?: string;
  password?: string;
  status: "Active" | "Inactive";
  avatar?: string;
}

export interface FeeInvoice {
  id: string;
  studentId: string;
  studentRollNo: string;
  studentName: string;
  amount: number;
  dueDate: string;
  title: string;
  status: "Paid" | "Unpaid";
  paidDate?: string;
  notes?: string;
}

export interface SupportMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "student" | "teacher" | "admin" | "feemanager" | "admission";
  content: string;
  timestamp: string;
  studentId: string; // Groups conversation thread under a student
}

export interface FeeManager {
  id: string;
  name: string;
  username?: string;
  email?: string;
  employeeCode?: string;
  password?: string;
  status: "Active" | "Inactive";
  avatar?: string;
}

export interface AdmissionOfficer {
  id: string;
  name: string;
  username?: string;
  email?: string;
  employeeCode?: string;
  password?: string;
  status: "Active" | "Inactive";
  avatar?: string;
}

export interface ContactLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseInterest: string;
  message: string;
  status: "New" | "Contacted" | "In Progress" | "Enrolled" | "Closed";
  date: string;
  notes?: string;
}

export interface PublicBatch {
  id: string;
  name: string;
  department: string;
  description: string;
  duration: string;
  isPublished: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: "Present" | "Absent";
  batchId: string;
}

export interface AuthorizedDevice {
  id: string;
  deviceName: string;
  deviceKey: string;
  authorizedAt: string;
  lastUsedAt?: string;
  userAgent?: string;
}

export interface School {
  id: string;
  name: string;
  code: string; // unique code, e.g., "DAV-101"
  address: string;
  principalName: string;
  principalEmail: string;
  principalPassword?: string;
  principalEmployeeCode?: string;
  status: "Active" | "Inactive";
  registeredAt: string;
  isAllotted?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  content: string;
  senderName: string;
  senderRole: string;
  timestamp: string; // date and time string
  readBy: string[]; // array of userIds
  attachmentName?: string;
  attachmentType?: "image" | "video" | "pdf";
  attachmentUrl?: string; // base64 or absolute link
  youtubeUrl?: string; // watch or share video link
}

export interface SecuritySOSAlert {
  id: string;
  senderName: string;
  senderRole: "Student" | "Teacher" | "Admission" | "FeeManager" | "Admin";
  senderId: string;
  severity: "High" | "Critical" | "Standard";
  type: "SOS" | "Security Issue" | "Medical Emergency" | "Fraud Warning" | "Panic Alarm" | "System Bypass";
  location: string;
  details: string;
  timestamp: string;
  resolved: boolean;
  resolvedBy?: string;
  comments?: string;
}

export interface CounsellingRequest {
  id: string; // Request ID
  studentId?: string; // If logged in student
  studentName: string;
  studentRollNo?: string;
  email: string;
  phone?: string;
  topic: string; // e.g. "Academic Stress", "Career Path", "Exam Anxiety"
  description: string;
  status: "Pending" | "Active" | "Closed";
  tempUsername: string; // Temporary login username
  tempPassword: string; // Temporary login password
  createdAt: string; // Real date & time of request
  closedAt?: string; // Real date & time when closed/expired
  scheduledAt: string; // Scheduled date & time for counselling
  meetingLink?: string; // Virtual link/room details
  notes?: string; // Feedback or notes from counsellor
  closedBy?: string; // Admin or Teacher name who closed it
  chatHistory?: any[]; // Array of message objects for live support chat
}

export interface CounsellingSlot {
  id: string;
  datetime: string; // ISO datetime string (or YYYY-MM-DDTHH:mm)
  isBooked: boolean;
  bookedByRequestId?: string;
}

export interface AdmissionRequest {
  id: string;
  studentName: string;
  email: string;
  mobileNumber: string;
  dob: string;
  fatherName: string;
  motherName: string;
  batchId: string;
  teacherId: string;
  teacherName: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  approvedAt?: string;
  rollNo?: string;
  enrollmentNo?: string;
}

export interface Verifier {
  id: string;
  name: string;
  username: string;
  password?: string;
  status: "Active" | "Inactive";
  employeeCode?: string;
}


