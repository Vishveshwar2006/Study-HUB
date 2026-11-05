import { Batch, Teacher, Student, Lesson, Test, Announcement, FeeInvoice, SupportMessage, ContactLead, Course, StoreItem, StoreOrder, StudyHubCenter, ExamSubject, ExamForm, ExamStudentMarksheet, BranchPIN, ExamPortalSettings } from "./types";

export const initialStudyHubCenters: StudyHubCenter[] = [
  {
    id: "center_bhopal",
    name: "Study HUB MP Nagar Head Center",
    city: "Bhopal",
    address: "Plot No. 14, Zone-II, MP Nagar (Near Chetna Manch Circle), Bhopal, Madhya Pradesh",
    pincode: "462011",
    contactNumber: "+91 755 2748901",
    email: "bhopal.center@studyhub.edu.in",
    operatingHours: "08:00 AM - 08:00 PM (Mon-Sat)",
    managerName: "Shri Rajesh Sharma"
  },
  {
    id: "center_indore",
    name: "Study HUB Vijay Nagar Campus",
    city: "Indore",
    address: "302, AB Road, Opposite C21 Mall, Vijay Nagar, Indore, Madhya Pradesh",
    pincode: "452010",
    contactNumber: "+91 731 4982210",
    email: "indore.center@studyhub.edu.in",
    operatingHours: "08:30 AM - 08:30 PM (Mon-Sat)",
    managerName: "Dr. Alok Verma"
  },
  {
    id: "center_gwalior",
    name: "Study HUB City Center Hub",
    city: "Gwalior",
    address: "45-A, Patel Nagar, Near City Center Circle, Gwalior, Madhya Pradesh",
    pincode: "474011",
    contactNumber: "+91 751 2348890",
    email: "gwalior.center@studyhub.edu.in",
    operatingHours: "09:00 AM - 07:30 PM (Mon-Sat)",
    managerName: "Prof. S. K. Gupta"
  },
  {
    id: "center_jabalpur",
    name: "Study HUB Civil Lines Center",
    city: "Jabalpur",
    address: "12, High Court Crossing Road, Civil Lines, Jabalpur, Madhya Pradesh",
    pincode: "482001",
    contactNumber: "+91 761 2623340",
    email: "jabalpur.center@studyhub.edu.in",
    operatingHours: "09:00 AM - 08:00 PM (Mon-Sat)",
    managerName: "Mrs. Meenakshi Dubey"
  },
  {
    id: "center_ujjain",
    name: "Study HUB Freeganj Academic Park",
    city: "Ujjain",
    address: "Tower Chowk Main Road, Freeganj, Ujjain, Madhya Pradesh",
    pincode: "456010",
    contactNumber: "+91 734 2519900",
    email: "ujjain.center@studyhub.edu.in",
    operatingHours: "08:30 AM - 07:30 PM (Mon-Sat)",
    managerName: "Shri Vikram Joshi"
  },
  {
    id: "center_sagar",
    name: "Study HUB Civil Lines Academy",
    city: "Sagar",
    address: "Near Stadium Ground, Civil Lines, Sagar, Madhya Pradesh",
    pincode: "470001",
    contactNumber: "+91 7582 223310",
    email: "sagar.center@studyhub.edu.in",
    operatingHours: "09:00 AM - 07:00 PM (Mon-Sat)",
    managerName: "Shri Dharmendra Patel"
  }
];

export const initialStoreOrders: StoreOrder[] = [
  {
    id: "ORD-2026-8801",
    studentId: "s1",
    studentName: "Aman Verma",
    studentEmail: "aman.verma@studyhub.edu.in",
    studentMobile: "9876543210",
    items: [
      {
        itemId: "course_1",
        itemName: "JEE Mains & Advanced Physics Mastery Batch 2026",
        price: 4999,
        quantity: 1,
        itemType: "course",
        courseId: "course_1"
      }
    ],
    totalAmount: 4999,
    paymentMethod: "Offline Payment at Study Hub Center",
    centerId: "center_bhopal",
    centerName: "Study HUB MP Nagar Head Center (Bhopal)",
    centerAddress: "Plot No. 14, Zone-II, MP Nagar, Bhopal",
    shippingAddress: "E-7 Arera Colony, Bhopal MP",
    status: "Pending Payment at Center",
    adminComment: "Student requested offline consultation & cash payment at MP Nagar Center.",
    orderDate: "2026-07-26 10:15"
  }
];

export const initialTeachers: Teacher[] = [];

export const initialStudents: Student[] = [];

export const initialBatches: Batch[] = [];

export const initialLessons: Lesson[] = [];

export const initialTests: Test[] = [];

export const initialAnnouncements: Announcement[] = [];

export const initialFees: FeeInvoice[] = [];

export const initialSupportMessages: SupportMessage[] = [];

export const initialLeads: ContactLead[] = [];

export const initialCourses: Course[] = [
  {
    id: "course_1",
    title: "JEE Mains & Advanced Physics Mastery Batch 2026",
    description: "Complete comprehensive physics course covering Mechanics, Electromagnetism, Modern Physics and Optics with live problem solving.",
    mentorName: "Prof. Rajesh Sharma",
    mentorId: "t_1",
    duration: "12 Months",
    price: 4999,
    isPublished: true,
    isBlocked: false,
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    createdAt: "2026-01-15",
    sections: [
      { id: "sec_1", title: "Section 1: Kinematics & Mechanics", description: "Vectors, Newton's Laws of Motion, Work Energy Power", order: 1 },
      { id: "sec_2", title: "Section 2: Electrostatics & Magnetism", description: "Coulomb's Law, Electric Potential, Magnetic Effects", order: 2 },
      { id: "sec_3", title: "Section 3: Optics & Modern Physics", description: "Wave Optics, Photoelectric Effect, Nuclear Physics", order: 3 }
    ],
    announcements: [
      { id: "ca_1", title: "Live Problem Solving Session This Saturday", content: "Join live at 5:00 PM for HC Verma Chapter 8 numericals discussion.", createdAt: "2026-07-20" }
    ],
    liveClasses: [
      { id: "clc_1", sectionId: "sec_1", title: "Live Class: Rotational Dynamics Advanced Numericals", scheduledAt: "2026-07-28 17:00", meetingOrVideoUrl: "https://meet.google.com/study-hub-live", isLive: true }
    ],
    classNotes: [
      { id: "ccn_1", sectionId: "sec_1", title: "Kinematics Formula Sheet & Shortcut Notes (PDF)", fileUrlOrContent: "https://studyhub.edu/notes/kinematics.pdf", uploadedAt: "2026-07-18" }
    ],
    doubts: [
      { id: "cd_1", studentId: "s_1", studentName: "Aman Verma", message: "Sir, in question 14 of HC Verma, how do we handle variable mass systems?", reply: "Great question Aman! Remember to apply thrust force equation F_ext + v_rel(dm/dt) = m(dv/dt).", repliedBy: "Prof. Rajesh Sharma", timestamp: "2026-07-22 14:30" }
    ]
  },
  {
    id: "course_2",
    title: "NEET UG Biology & Chemistry Fast Track 2026",
    description: "NCERT-focused diagrammatic study, daily practice sheets, and live doubt resolution for top medical ranks.",
    mentorName: "Dr. Ananya Mukherjee",
    mentorId: "t_2",
    duration: "6 Months",
    price: 3499,
    isPublished: true,
    isBlocked: false,
    demoVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    createdAt: "2026-02-01",
    sections: [
      { id: "sec_101", title: "Section 1: Human Physiology & Genetics", description: "Cell Division, DNA Replication, Mendelian Inheritance", order: 1 },
      { id: "sec_102", title: "Section 2: Organic Chemistry Reaction Mechanisms", description: "GOC, Hydrocarbons, Biomolecules", order: 2 }
    ],
    announcements: [
      { id: "ca_2", title: "Diagram Highlighting Session Update", content: "Download the updated NCERT diagram workbook from Class Notes section.", createdAt: "2026-07-21" }
    ],
    liveClasses: [
      { id: "clc_2", sectionId: "sec_101", title: "NEET Special: Human Physiology Rapid Fire Live", scheduledAt: "2026-07-29 16:00", meetingOrVideoUrl: "https://meet.google.com/study-hub-neet", isLive: false }
    ],
    classNotes: [
      { id: "ccn_2", sectionId: "sec_101", title: "NCERT Biology Mindmaps Chapter 1 to 10", fileUrlOrContent: "https://studyhub.edu/notes/neet-mindmaps.pdf", uploadedAt: "2026-07-20" }
    ],
    doubts: []
  }
];

export const initialStoreItems: StoreItem[] = [
  {
    id: "store_1",
    name: "JEE Advanced Physics Comprehensive Guidebook (Vol 1 & 2)",
    type: "book",
    description: "Full theory, conceptual illustrations, and 5,000+ solved previous year questions with step-by-step solutions.",
    price: 899,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
    inStock: true,
    stockCount: 45,
    sku: "BK-JEE-PHY-01",
    authorOrBrand: "Study HUB Publication"
  },
  {
    id: "store_2",
    name: "NEET UG NCERT Biology Flashcards & Mindmaps Set",
    type: "study_guide",
    description: "350+ color laminated flashcards covering all 38 NCERT chapters for rapid revision before exams.",
    price: 549,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
    inStock: true,
    stockCount: 80,
    sku: "SG-NEET-BIO-02",
    authorOrBrand: "Study HUB Academic Press"
  },
  {
    id: "store_3",
    name: "NCERT Master Chemistry Quick Formula & Reaction Pocket Handbook",
    type: "study_guide",
    description: "Compact memory handbook with all organic reaction mechanisms, named reactions, and inorganic periodic charts.",
    price: 349,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400",
    inStock: true,
    stockCount: 65,
    sku: "SG-CHEM-MKT-03",
    authorOrBrand: "Study HUB Publication"
  },
  {
    id: "store_4",
    name: "Class 10th & 12th Board Exam 10-Year Solved Question Papers Bundle",
    type: "book",
    description: "Official board paper patterns with model answer sheets and marking scheme explanations.",
    price: 499,
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400",
    inStock: true,
    stockCount: 30,
    sku: "BK-BRD-PYQ-04",
    authorOrBrand: "Study HUB Academic Press"
  },
  {
    id: "store_5",
    name: "Higher Mathematics Calculus & Coordinate Geometry Master Workbook",
    type: "book",
    description: "Advanced problem sets, shortcut tricks, and step-by-step analytical solution keys.",
    price: 649,
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=400",
    inStock: true,
    stockCount: 25,
    sku: "BK-MATH-CALC-05",
    authorOrBrand: "Study HUB Press"
  },
  {
    id: "store_6",
    name: "Study HUB Smart Digital Exam Prep Planner & Archival Pens Kit",
    type: "stationery",
    description: "Premium hardbound spiral goal planner + 5 smooth 0.5mm blue archival gel pens.",
    price: 299,
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=400",
    inStock: true,
    stockCount: 120,
    sku: "ST-PLN-PEN-06",
    authorOrBrand: "Study HUB Stationers"
  },
  {
    id: "store_7",
    name: "Complete Geometry Box & Scientific Calculator Exam Kit",
    type: "exam_kit",
    description: "Precision compass set, protractor, metallic rulers, eraser, and exam-approved scientific calculator.",
    price: 699,
    image: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&q=80&w=400",
    inStock: true,
    stockCount: 50,
    sku: "EK-GEOM-CALC-07",
    authorOrBrand: "Study HUB Stationers"
  },
  {
    id: "store_8",
    name: "OMR Sheet Practice Booklet (100 Sheets) with Timer Stencil",
    type: "stationery",
    description: "100 official 200-question OMR bubble sheets for real mock test hall simulation and time management practice.",
    price: 199,
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=400",
    inStock: true,
    stockCount: 200,
    sku: "ST-OMR-100-08",
    authorOrBrand: "Study HUB Exam Supplies"
  },
  {
    id: "store_9",
    name: "Study HUB Ultimate All-In-One Board & Competitive Exam Kit",
    type: "exam_kit",
    description: "Heavy-duty backpack + 200-page OMR workbook + formula handbook + geometry set + gel pens pack.",
    price: 1499,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400",
    inStock: true,
    stockCount: 18,
    sku: "EK-ULT-KIT-09",
    authorOrBrand: "Study HUB Gear"
  }
];

// ======================== INITIAL EXAM PORTAL DATA ========================

export const initialExamSubjects: ExamSubject[] = [
  {
    id: "subj_phy_12",
    subjectName: "Physics",
    subjectCode: "PHY-1201",
    classGrade: "Class 12",
    theoryMaxMarks: 70,
    practicalMaxMarks: 30,
    totalMaxMarks: 100,
    passingMarks: 33,
    addedByTeacherName: "Faculty Professor",
    createdAt: "2026-08-01"
  },
  {
    id: "subj_chem_12",
    subjectName: "Chemistry",
    subjectCode: "CHE-1202",
    classGrade: "Class 12",
    theoryMaxMarks: 70,
    practicalMaxMarks: 30,
    totalMaxMarks: 100,
    passingMarks: 33,
    addedByTeacherName: "Faculty Professor",
    createdAt: "2026-08-01"
  },
  {
    id: "subj_math_12",
    subjectName: "Mathematics",
    subjectCode: "MAT-1203",
    classGrade: "Class 12",
    theoryMaxMarks: 80,
    practicalMaxMarks: 20,
    totalMaxMarks: 100,
    passingMarks: 33,
    addedByTeacherName: "Faculty Professor",
    createdAt: "2026-08-01"
  },
  {
    id: "subj_bio_12",
    subjectName: "Biology",
    subjectCode: "BIO-1204",
    classGrade: "Class 12",
    theoryMaxMarks: 70,
    practicalMaxMarks: 30,
    totalMaxMarks: 100,
    passingMarks: 33,
    addedByTeacherName: "Faculty Professor",
    createdAt: "2026-08-01"
  },
  {
    id: "subj_cs_12",
    subjectName: "Computer Science",
    subjectCode: "CS-1205",
    classGrade: "Class 12",
    theoryMaxMarks: 70,
    practicalMaxMarks: 30,
    totalMaxMarks: 100,
    passingMarks: 33,
    addedByTeacherName: "Faculty Professor",
    createdAt: "2026-08-01"
  },
  {
    id: "subj_eng_12",
    subjectName: "English Core",
    subjectCode: "ENG-1206",
    classGrade: "Class 12",
    theoryMaxMarks: 80,
    practicalMaxMarks: 20,
    totalMaxMarks: 100,
    passingMarks: 33,
    addedByTeacherName: "Faculty Professor",
    createdAt: "2026-08-01"
  },
  {
    id: "subj_sci_10",
    subjectName: "Science & Technology",
    subjectCode: "SCI-1001",
    classGrade: "Class 10",
    theoryMaxMarks: 80,
    practicalMaxMarks: 20,
    totalMaxMarks: 100,
    passingMarks: 33,
    addedByTeacherName: "Faculty Professor",
    createdAt: "2026-08-01"
  },
  {
    id: "subj_math_10",
    subjectName: "Mathematics Standard",
    subjectCode: "MAT-1002",
    classGrade: "Class 10",
    theoryMaxMarks: 80,
    practicalMaxMarks: 20,
    totalMaxMarks: 100,
    passingMarks: 33,
    addedByTeacherName: "Faculty Professor",
    createdAt: "2026-08-01"
  },
  {
    id: "subj_sst_10",
    subjectName: "Social Science",
    subjectCode: "SST-1003",
    classGrade: "Class 10",
    theoryMaxMarks: 80,
    practicalMaxMarks: 20,
    totalMaxMarks: 100,
    passingMarks: 33,
    addedByTeacherName: "Faculty Professor",
    createdAt: "2026-08-01"
  },
  {
    id: "subj_eng_10",
    subjectName: "English Language & Lit",
    subjectCode: "ENG-1004",
    classGrade: "Class 10",
    theoryMaxMarks: 80,
    practicalMaxMarks: 20,
    totalMaxMarks: 100,
    passingMarks: 33,
    addedByTeacherName: "Faculty Professor",
    createdAt: "2026-08-01"
  }
];

export const initialBranchPINs: BranchPIN[] = [
  {
    id: "pin_bhopal",
    branchId: "center_bhopal",
    branchName: "Study HUB MP Nagar Head Center (Bhopal)",
    pin: "462011",
    inchargeName: "Shri Rajesh Sharma",
    createdAt: "2026-08-01",
    updatedAt: "2026-08-01",
    createdByAdminId: "admin_1"
  },
  {
    id: "pin_indore",
    branchId: "center_indore",
    branchName: "Study HUB Vijay Nagar Campus (Indore)",
    pin: "452010",
    inchargeName: "Dr. Alok Verma",
    createdAt: "2026-08-01",
    updatedAt: "2026-08-01",
    createdByAdminId: "admin_1"
  },
  {
    id: "pin_gwalior",
    branchId: "center_gwalior",
    branchName: "Study HUB City Center Hub (Gwalior)",
    pin: "474011",
    inchargeName: "Prof. S. K. Gupta",
    createdAt: "2026-08-01",
    updatedAt: "2026-08-01",
    createdByAdminId: "admin_1"
  },
  {
    id: "pin_jabalpur",
    branchId: "center_jabalpur",
    branchName: "Study HUB Civil Lines Center (Jabalpur)",
    pin: "482001",
    inchargeName: "Mrs. Meenakshi Dubey",
    createdAt: "2026-08-01",
    updatedAt: "2026-08-01",
    createdByAdminId: "admin_1"
  },
  {
    id: "pin_ujjain",
    branchId: "center_ujjain",
    branchName: "Study HUB Freeganj Academic Park (Ujjain)",
    pin: "456010",
    inchargeName: "Shri Vikram Joshi",
    createdAt: "2026-08-01",
    updatedAt: "2026-08-01",
    createdByAdminId: "admin_1"
  },
  {
    id: "pin_sagar",
    branchId: "center_sagar",
    branchName: "Study HUB Civil Lines Academy (Sagar)",
    pin: "470001",
    inchargeName: "Shri Dharmendra Patel",
    createdAt: "2026-08-01",
    updatedAt: "2026-08-01",
    createdByAdminId: "admin_1"
  }
];

export const initialExamSettings: ExamPortalSettings = {
  id: "global_settings",
  isFormLocked: false,
  formLockDate: "2026-10-30",
  formLockTime: "23:59 IST",
  formLockMessage: "Regular Exam Form Submission is open. Late submission window will close soon.",
  isMarksLocked: false,
  marksLockDate: "",
  marksLockTime: "",
  marksLockMessage: "Marks entry is open for authorized subject teachers.",
  isResultLocked: false,
  resultLockDate: "",
  resultLockTime: "",
  resultLockMessage: "Official Board Examination Results are published and verified.",
  isAdmitCardLaunched: true,
  admitCardLaunchDate: "2026-09-10",
  admitCardReportingTime: "08:30 AM (Morning Shift) / 01:30 PM (Evening Shift)",
  admitCardExamCenterName: "Study HUB Central Examination Pavilion (Block A & B)",
  admitCardExamCenterAddress: "Plot No. 14, Zone-II, MP Nagar, Bhopal, Madhya Pradesh - 462011",
  admitCardExamStartDate: "2026-10-15",
  admitCardInstructions: [
    "Candidate must carry the printed Admit Card along with an original Photo ID proof (Aadhar Card/School ID).",
    "Electronic gadgets including smartphones, smartwatches, digital calculators, and bluetooth devices are strictly prohibited inside the examination hall.",
    "Candidate must report at least 45 minutes before the scheduled commencement of the examination.",
    "No candidate will be allowed to leave the examination room before the conclusion of the test.",
    "Maintain silence and decorum; any malpractice or unfair means will result in permanent debarment."
  ],
  launchedByAdminName: "Examination Controller (Admin)",
  activeExamSession: "Annual Board Examination 2026"
};

export const initialExamForms: ExamForm[] = [
  {
    id: "form_sh_001",
    studentId: "s1",
    studentName: "Aman Verma",
    rollNo: "2601001",
    scholarNumber: "SCH-2026-042",
    fatherName: "Shri Rakesh Verma",
    motherName: "Smt. Sunita Verma",
    dob: "2008-05-14",
    gender: "Male",
    mobileNumber: "9876543210",
    email: "aman.verma@studyhub.edu.in",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    classGrade: "Class 12",
    branchCenterId: "center_bhopal",
    branchCenterName: "Study HUB MP Nagar Head Center (Bhopal)",
    examSession: "Annual Board Examination 2026",
    subjects: [
      { subjectId: "subj_phy_12", subjectName: "Physics", subjectCode: "PHY-1201", theoryMaxMarks: 70, practicalMaxMarks: 30, totalMaxMarks: 100, passingMarks: 33 },
      { subjectId: "subj_chem_12", subjectName: "Chemistry", subjectCode: "CHE-1202", theoryMaxMarks: 70, practicalMaxMarks: 30, totalMaxMarks: 100, passingMarks: 33 },
      { subjectId: "subj_math_12", subjectName: "Mathematics", subjectCode: "MAT-1203", theoryMaxMarks: 80, practicalMaxMarks: 20, totalMaxMarks: 100, passingMarks: 33 },
      { subjectId: "subj_cs_12", subjectName: "Computer Science", subjectCode: "CS-1205", theoryMaxMarks: 70, practicalMaxMarks: 30, totalMaxMarks: 100, passingMarks: 33 },
      { subjectId: "subj_eng_12", subjectName: "English Core", subjectCode: "ENG-1206", theoryMaxMarks: 80, practicalMaxMarks: 20, totalMaxMarks: 100, passingMarks: 33 }
    ],
    examFee: 1200,
    feeStatus: "Paid",
    paymentMethod: "UPI Online",
    paymentReceiptNo: "REC-EXAM-2026-8801",
    paidAt: "2026-08-10 11:20",
    filledByTeacherId: "t_1",
    filledByTeacherName: "Prof. Rajesh Sharma",
    formStatus: "Approved",
    submissionDate: "2026-08-10",
    adminRemarks: "All prerequisites, documents and examination fee verified."
  },
  {
    id: "form_sh_002",
    studentId: "s2",
    studentName: "Priya Sharma",
    rollNo: "2601002",
    scholarNumber: "SCH-2026-089",
    fatherName: "Dr. Anil Sharma",
    motherName: "Smt. Kavita Sharma",
    dob: "2008-08-22",
    gender: "Female",
    mobileNumber: "9823456781",
    email: "priya.sharma@studyhub.edu.in",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    classGrade: "Class 12",
    branchCenterId: "center_bhopal",
    branchCenterName: "Study HUB MP Nagar Head Center (Bhopal)",
    examSession: "Annual Board Examination 2026",
    subjects: [
      { subjectId: "subj_phy_12", subjectName: "Physics", subjectCode: "PHY-1201", theoryMaxMarks: 70, practicalMaxMarks: 30, totalMaxMarks: 100, passingMarks: 33 },
      { subjectId: "subj_chem_12", subjectName: "Chemistry", subjectCode: "CHE-1202", theoryMaxMarks: 70, practicalMaxMarks: 30, totalMaxMarks: 100, passingMarks: 33 },
      { subjectId: "subj_bio_12", subjectName: "Biology", subjectCode: "BIO-1204", theoryMaxMarks: 70, practicalMaxMarks: 30, totalMaxMarks: 100, passingMarks: 33 },
      { subjectId: "subj_eng_12", subjectName: "English Core", subjectCode: "ENG-1206", theoryMaxMarks: 80, practicalMaxMarks: 20, totalMaxMarks: 100, passingMarks: 33 }
    ],
    examFee: 1200,
    feeStatus: "Paid",
    paymentMethod: "Cash at Center Desk",
    paymentReceiptNo: "REC-EXAM-2026-8802",
    paidAt: "2026-08-12 14:45",
    filledByTeacherId: "t_1",
    filledByTeacherName: "Prof. Rajesh Sharma",
    formStatus: "Approved",
    submissionDate: "2026-08-12",
    adminRemarks: "Approved for medical stream board exams."
  },
  {
    id: "form_sh_003",
    studentId: "s3",
    studentName: "Rohan Patel",
    rollNo: "2601003",
    scholarNumber: "SCH-2026-112",
    fatherName: "Shri Mahesh Patel",
    motherName: "Smt. Rekha Patel",
    dob: "2009-02-11",
    gender: "Male",
    mobileNumber: "9755123456",
    email: "rohan.patel@studyhub.edu.in",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    classGrade: "Class 10",
    branchCenterId: "center_indore",
    branchCenterName: "Study HUB Vijay Nagar Campus (Indore)",
    examSession: "Annual Board Examination 2026",
    subjects: [
      { subjectId: "subj_sci_10", subjectName: "Science & Technology", subjectCode: "SCI-1001", theoryMaxMarks: 80, practicalMaxMarks: 20, totalMaxMarks: 100, passingMarks: 33 },
      { subjectId: "subj_math_10", subjectName: "Mathematics Standard", subjectCode: "MAT-1002", theoryMaxMarks: 80, practicalMaxMarks: 20, totalMaxMarks: 100, passingMarks: 33 },
      { subjectId: "subj_sst_10", subjectName: "Social Science", subjectCode: "SST-1003", theoryMaxMarks: 80, practicalMaxMarks: 20, totalMaxMarks: 100, passingMarks: 33 },
      { subjectId: "subj_eng_10", subjectName: "English Language & Lit", subjectCode: "ENG-1004", theoryMaxMarks: 80, practicalMaxMarks: 20, totalMaxMarks: 100, passingMarks: 33 }
    ],
    examFee: 1000,
    feeStatus: "Unpaid",
    filledByTeacherId: "t_2",
    filledByTeacherName: "Dr. Ananya Mukherjee",
    formStatus: "Submitted",
    submissionDate: "2026-08-15"
  }
];

export const initialExamMarksheets: ExamStudentMarksheet[] = [
  {
    id: "res_sh_001",
    examFormId: "form_sh_001",
    studentId: "s1",
    studentName: "Aman Verma",
    rollNo: "2601001",
    classGrade: "Class 12",
    branchCenterName: "Study HUB MP Nagar Head Center (Bhopal)",
    examSession: "Annual Board Examination 2026",
    marks: [
      { subjectId: "subj_phy_12", subjectName: "Physics", subjectCode: "PHY-1201", theoryMarksObtained: 65, practicalMarksObtained: 28, totalObtained: 93, totalMaxMarks: 100, passingMarks: 33, isPassed: true, grade: "A+" },
      { subjectId: "subj_chem_12", subjectName: "Chemistry", subjectCode: "CHE-1202", theoryMarksObtained: 62, practicalMarksObtained: 29, totalObtained: 91, totalMaxMarks: 100, passingMarks: 33, isPassed: true, grade: "A+" },
      { subjectId: "subj_math_12", subjectName: "Mathematics", subjectCode: "MAT-1203", theoryMarksObtained: 74, practicalMarksObtained: 20, totalObtained: 94, totalMaxMarks: 100, passingMarks: 33, isPassed: true, grade: "A+" },
      { subjectId: "subj_cs_12", subjectName: "Computer Science", subjectCode: "CS-1205", theoryMarksObtained: 68, practicalMarksObtained: 29, totalObtained: 97, totalMaxMarks: 100, passingMarks: 33, isPassed: true, grade: "A+" },
      { subjectId: "subj_eng_12", subjectName: "English Core", subjectCode: "ENG-1206", theoryMarksObtained: 71, practicalMarksObtained: 19, totalObtained: 90, totalMaxMarks: 100, passingMarks: 33, isPassed: true, grade: "A+" }
    ],
    grandTotalObtained: 465,
    grandTotalMax: 500,
    percentage: 93.0,
    overallGrade: "A+",
    resultStatus: "PASS",
    division: "First Division",
    updatedBy: "Prof. Rajesh Sharma",
    updatedByRole: "teacher",
    lastUpdated: "2026-08-20 16:30"
  },
  {
    id: "res_sh_002",
    examFormId: "form_sh_002",
    studentId: "s2",
    studentName: "Priya Sharma",
    rollNo: "2601002",
    classGrade: "Class 12",
    branchCenterName: "Study HUB MP Nagar Head Center (Bhopal)",
    examSession: "Annual Board Examination 2026",
    marks: [
      { subjectId: "subj_phy_12", subjectName: "Physics", subjectCode: "PHY-1201", theoryMarksObtained: 61, practicalMarksObtained: 27, totalObtained: 88, totalMaxMarks: 100, passingMarks: 33, isPassed: true, grade: "A" },
      { subjectId: "subj_chem_12", subjectName: "Chemistry", subjectCode: "CHE-1202", theoryMarksObtained: 64, practicalMarksObtained: 28, totalObtained: 92, totalMaxMarks: 100, passingMarks: 33, isPassed: true, grade: "A+" },
      { subjectId: "subj_bio_12", subjectName: "Biology", subjectCode: "BIO-1204", theoryMarksObtained: 66, practicalMarksObtained: 29, totalObtained: 95, totalMaxMarks: 100, passingMarks: 33, isPassed: true, grade: "A+" },
      { subjectId: "subj_eng_12", subjectName: "English Core", subjectCode: "ENG-1206", theoryMarksObtained: 72, practicalMarksObtained: 18, totalObtained: 90, totalMaxMarks: 100, passingMarks: 33, isPassed: true, grade: "A+" }
    ],
    grandTotalObtained: 365,
    grandTotalMax: 400,
    percentage: 91.25,
    overallGrade: "A+",
    resultStatus: "PASS",
    division: "First Division",
    updatedBy: "Prof. Rajesh Sharma",
    updatedByRole: "teacher",
    lastUpdated: "2026-08-20 16:35"
  }
];
