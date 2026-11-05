import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  BookOpen, Plus, UserCheck, Users, UserPlus, Key, ShieldCheck, 
  AlertCircle, CheckCircle2, Copy, Search, Building2, Phone, Mail, 
  ShoppingBag, Filter, Eye, EyeOff, RefreshCw, X, Check, Calendar, 
  Trash2, ChevronRight, ArrowRight, Award, ExternalLink,
  Ban, Edit3, UserMinus, RotateCcw, Sparkles, Clock, Lock, Unlock, 
  Save, FileText, ShieldAlert, AlertTriangle
} from "lucide-react";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Course, Student, StoreOrder } from "../types";

interface StudentEnrollManagerProps {
  courses: Course[];
  onUpdateCourse: (course: Course) => void;
  students: Student[];
  setStudents?: React.Dispatch<React.SetStateAction<Student[]>>;
  storeOrders: StoreOrder[];
  setStoreOrders?: React.Dispatch<React.SetStateAction<StoreOrder[]>>;
  preselectedCourseId?: string;
  onClose?: () => void;
}

export default function StudentEnrollManager({
  courses = [],
  onUpdateCourse,
  students = [],
  setStudents,
  storeOrders = [],
  setStoreOrders,
  preselectedCourseId,
  onClose
}: StudentEnrollManagerProps) {
  // Navigation / Filter state
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>(preselectedCourseId || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "store" | "admin" | "onspot">("all");

  // Notifications
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Modals state
  const [isEnrollExistingModalOpen, setIsEnrollExistingModalOpen] = useState(false);
  const [isOnSpotModalOpen, setIsOnSpotModalOpen] = useState(false);
  const [viewingLoginStudent, setViewingLoginStudent] = useState<Student | null>(null);
  const [createdLoginDetails, setCreatedLoginDetails] = useState<{
    student: Student;
    courses: Course[];
  } | null>(null);

  // Edit Student Enrollment Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEnrollRecord, setEditingEnrollRecord] = useState<EnrollmentRecord | null>(null);
  const [editName, setEditName] = useState("");
  const [editRollNo, setEditRollNo] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editSchool, setEditSchool] = useState("");
  const [editStatus, setEditStatus] = useState<"Active" | "Inactive">("Active");
  const [editSelectedCourseIds, setEditSelectedCourseIds] = useState<string[]>([]);
  const [editRemarks, setEditRemarks] = useState("");

  // Live 3-second button state tracker
  interface LiveActionState {
    action: "block" | "unblock" | "unenroll" | "delete" | "edit";
    message: string;
    secondsLeft: number;
    undoable?: boolean;
  }

  const [liveActionStates, setLiveActionStates] = useState<{ [uniqueId: string]: LiveActionState }>({});
  const activeTimersRef = useRef<{
    [uniqueId: string]: {
      intervalId?: any;
      timeoutId?: any;
      onExecute?: () => void;
    };
  }>({});

  // Cleanup active intervals/timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(activeTimersRef.current).forEach(t => {
        if (t.intervalId) clearInterval(t.intervalId);
        if (t.timeoutId) clearTimeout(t.timeoutId);
      });
    };
  }, []);

  // Live Timer Controller (3-second countdown)
  const startLiveTimer = (
    uniqueId: string, 
    action: "block" | "unblock" | "unenroll" | "delete" | "edit", 
    message: string, 
    undoable: boolean = false,
    onExecute?: () => void
  ) => {
    // Clear any existing timer on this uniqueId
    if (activeTimersRef.current[uniqueId]) {
      clearInterval(activeTimersRef.current[uniqueId].intervalId);
      clearTimeout(activeTimersRef.current[uniqueId].timeoutId);
      delete activeTimersRef.current[uniqueId];
    }

    setLiveActionStates(prev => ({
      ...prev,
      [uniqueId]: { action, message, secondsLeft: 3, undoable }
    }));

    let remaining = 3;
    const intervalId = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        setLiveActionStates(prev => {
          if (!prev[uniqueId]) return prev;
          return {
            ...prev,
            [uniqueId]: { ...prev[uniqueId], secondsLeft: remaining }
          };
        });
      }
    }, 1000);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      setLiveActionStates(prev => {
        const next = { ...prev };
        delete next[uniqueId];
        return next;
      });
      delete activeTimersRef.current[uniqueId];
      if (onExecute) {
        onExecute();
      }
    }, 3000);

    activeTimersRef.current[uniqueId] = {
      intervalId,
      timeoutId,
      onExecute
    };
  };

  const cancelLiveAction = (uniqueId: string) => {
    if (activeTimersRef.current[uniqueId]) {
      clearInterval(activeTimersRef.current[uniqueId].intervalId);
      clearTimeout(activeTimersRef.current[uniqueId].timeoutId);
      delete activeTimersRef.current[uniqueId];
    }
    setLiveActionStates(prev => {
      const next = { ...prev };
      delete next[uniqueId];
      return next;
    });
    showNotification("Action cancelled successfully.", "success");
  };

  // Form states - Enroll Existing Registered Student
  const [existingStudentId, setExistingStudentId] = useState("");
  const [existingSelectedCourseIds, setExistingSelectedCourseIds] = useState<string[]>(
    preselectedCourseId ? [preselectedCourseId] : []
  );
  const [existingEnrollmentNote, setExistingEnrollmentNote] = useState("Direct Admission by Administrator");
  const [existingStudentSearch, setExistingStudentSearch] = useState("");

  // Form states - On-Spot Student Account Creation & Instant Enrollment
  const [onSpotName, setOnSpotName] = useState("");
  const [onSpotMobile, setOnSpotMobile] = useState("");
  const [onSpotRollNo, setOnSpotRollNo] = useState(() => `STU2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [onSpotUsername, setOnSpotUsername] = useState("");
  const [onSpotPassword, setOnSpotPassword] = useState("Stud@2026");
  const [onSpotEmail, setOnSpotEmail] = useState("");
  const [onSpotSchool, setOnSpotSchool] = useState("Study HUB MP Nagar Head Center");
  const [onSpotSelectedCourseIds, setOnSpotSelectedCourseIds] = useState<string[]>(
    preselectedCourseId ? [preselectedCourseId] : []
  );
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Auto-generate username when rollNo or name changes
  const handleGenerateRollAndUsername = () => {
    const randomRoll = `STU2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setOnSpotRollNo(randomRoll);
    if (!onSpotUsername || onSpotUsername.startsWith("stu2026")) {
      setOnSpotUsername(randomRoll.toLowerCase());
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // 1. Pending Store Orders for Courses
  const pendingStoreCourseOrders = useMemo(() => {
    return (storeOrders || []).filter(o => {
      if (o.status === "Cancelled") return false;
      const isPending = o.status === "Pending Confirmation" || 
                        o.status === "Pending Admin Verification" || 
                        o.status === "Pending Payment at Center" || 
                        o.status === "Placed" || 
                        o.status === "Pending";
      if (!isPending) return false;

      return (o.items || []).some(i => 
        i.itemType === "course" || 
        i.courseId || 
        courses.some(c => c.id === i.itemId || (i.itemName && c.title.toLowerCase().includes(i.itemName.toLowerCase())))
      );
    });
  }, [storeOrders, courses]);

  // 2. Compute all enrolled student records
  interface EnrollmentRecord {
    uniqueId: string;
    studentId: string;
    studentName: string;
    studentRollNo: string;
    studentEmail: string;
    studentMobile: string;
    courseId: string;
    courseTitle: string;
    courseMentor: string;
    enrollmentSource: "store" | "admin" | "onspot";
    enrollmentDate: string;
    status: "Active" | "Blocked" | "Pending";
    orderId?: string;
    studentObject?: Student;
  }

  const enrollmentRecords = useMemo(() => {
    const list: EnrollmentRecord[] = [];

    // A. From Courses enrolledStudentIds
    courses.forEach(course => {
      (course.enrolledStudentIds || []).forEach(stdId => {
        const matchingStudent = students.find(s => s.id === stdId || s.rollNo === stdId || s.username === stdId);
        const isBlocked = matchingStudent?.status === "Inactive" || matchingStudent?.isLocked;
        list.push({
          uniqueId: `${course.id}_${stdId}`,
          studentId: stdId,
          studentName: matchingStudent?.name || "Enrolled Student",
          studentRollNo: matchingStudent?.rollNo || stdId,
          studentEmail: matchingStudent?.email || "",
          studentMobile: matchingStudent?.mobileNumber || "",
          courseId: course.id,
          courseTitle: course.title,
          courseMentor: course.mentorName,
          enrollmentSource: (matchingStudent?.isSelfRegistered ? "onspot" : "admin") as "admin" | "onspot",
          enrollmentDate: matchingStudent?.registeredAt || new Date().toISOString().split("T")[0],
          status: isBlocked ? "Blocked" : "Active",
          studentObject: matchingStudent
        });
      });
    });

    // B. From Confirmed Store Orders
    (storeOrders || []).forEach(order => {
      const isConfirmed = order.status === "Confirmed" || 
                          order.status === "Payment Confirmed / Active" || 
                          order.status === "Verified & Approved" || 
                          order.status === "Active" ||
                          order.status === "Delivered" ||
                          order.status === "Completed";
      if (!isConfirmed) return;

      (order.items || []).forEach(item => {
        const isCourse = item.itemType === "course" || item.courseId || courses.some(c => c.id === item.itemId || (item.itemName && c.title.toLowerCase().includes(item.itemName.toLowerCase())));
        if (!isCourse) return;

        const targetCourse = courses.find(c => c.id === item.courseId || c.id === item.itemId || (item.itemName && c.title.toLowerCase().includes(item.itemName.toLowerCase())));
        const courseId = targetCourse?.id || item.courseId || item.itemId;
        const courseTitle = targetCourse?.title || item.itemName;
        const matchingStudent = students.find(s => s.id === order.studentId || s.rollNo === order.studentId || (s.email && s.email.toLowerCase() === order.studentEmail?.toLowerCase()));
        const isBlocked = matchingStudent?.status === "Inactive" || matchingStudent?.isLocked;

        // Deduplicate if already in list for this course & student
        const exists = list.some(r => r.courseId === courseId && (r.studentId === order.studentId || (order.studentEmail && r.studentEmail.toLowerCase() === order.studentEmail.toLowerCase())));
        if (!exists) {
          list.push({
            uniqueId: `order_${order.id}_${courseId}`,
            studentId: order.studentId,
            studentName: order.studentName || matchingStudent?.name || "Student",
            studentRollNo: matchingStudent?.rollNo || order.studentId,
            studentEmail: order.studentEmail || matchingStudent?.email || "",
            studentMobile: order.studentMobile || matchingStudent?.mobileNumber || "",
            courseId: courseId,
            courseTitle: courseTitle,
            courseMentor: targetCourse?.mentorName || "Faculty Lead",
            enrollmentSource: "store",
            enrollmentDate: order.orderDate || order.paymentConfirmedAt || new Date().toISOString().split("T")[0],
            status: isBlocked ? "Blocked" : "Active",
            orderId: order.id,
            studentObject: matchingStudent
          });
        }
      });
    });

    return list;
  }, [courses, storeOrders, students]);

  // Filtered enrollment list
  const filteredEnrollments = useMemo(() => {
    return enrollmentRecords.filter(rec => {
      if (selectedCourseFilter !== "all" && rec.courseId !== selectedCourseFilter) {
        return false;
      }
      if (sourceFilter !== "all" && rec.enrollmentSource !== sourceFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rec.studentName.toLowerCase().includes(q);
        const matchesRoll = rec.studentRollNo.toLowerCase().includes(q);
        const matchesEmail = rec.studentEmail.toLowerCase().includes(q);
        const matchesMobile = rec.studentMobile.includes(q);
        const matchesCourse = rec.courseTitle.toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesEmail && !matchesMobile && !matchesCourse) {
          return false;
        }
      }
      return true;
    });
  }, [enrollmentRecords, selectedCourseFilter, sourceFilter, searchQuery]);

  // ACTION 1: Admin Confirms Pending Store Enrollment Order
  const handleConfirmStoreEnrollment = (order: StoreOrder) => {
    const dateStr = new Date().toLocaleDateString("en-IN") + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. Identify which courses are in this order
    const courseItems = (order.items || []).filter(i => 
      i.itemType === "course" || 
      i.courseId || 
      courses.some(c => c.id === i.itemId || (i.itemName && c.title.toLowerCase().includes(i.itemName.toLowerCase())))
    );

    const affectedCourses: Course[] = [];

    courseItems.forEach(item => {
      const course = courses.find(c => 
        c.id === item.courseId || 
        c.id === item.itemId || 
        (item.itemName && c.title.toLowerCase().includes(item.itemName.toLowerCase()))
      );
      if (course) {
        const studentIdToEnroll = order.studentId || "std_" + Date.now();
        const currentEnrolled = course.enrolledStudentIds || [];
        if (!currentEnrolled.includes(studentIdToEnroll)) {
          const updatedCourse: Course = {
            ...course,
            enrolledStudentIds: [...currentEnrolled, studentIdToEnroll]
          };
          onUpdateCourse(updatedCourse);
          affectedCourses.push(updatedCourse);
          try {
            setDoc(doc(db, "courses", course.id), updatedCourse, { merge: true }).catch(() => {});
          } catch (err) {
            console.error("Failed to sync course enrollment to Firestore", err);
          }
        }
      }
    });

    // 2. If student does not exist in students list, create/register them on the spot so they have login access!
    let matchingStudent = students.find(s => 
      s.id === order.studentId || 
      (order.studentEmail && s.email && s.email.toLowerCase() === order.studentEmail.toLowerCase()) ||
      (order.studentMobile && s.mobileNumber && s.mobileNumber === order.studentMobile)
    );

    if (!matchingStudent && setStudents) {
      const newRoll = `STU2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newStudent: Student = {
        id: order.studentId && order.studentId !== "s_guest" ? order.studentId : "std_" + Date.now(),
        name: order.studentName || "Store Enrolled Student",
        username: newRoll.toLowerCase(),
        rollNo: newRoll,
        email: order.studentEmail || `${newRoll.toLowerCase()}@studyhub.edu.in`,
        password: "Stud@2026",
        mobileNumber: order.studentMobile || "9876543210",
        status: "Active",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        isVerified: true,
        schoolName: order.centerName || "Study HUB MP Nagar Head Center",
        registeredAt: new Date().toISOString().split("T")[0]
      };
      setStudents(prev => [newStudent, ...prev]);
      matchingStudent = newStudent;
      try {
        setDoc(doc(db, "students", newStudent.id), newStudent, { merge: true }).catch(() => {});
      } catch (err) {
        console.error("Failed to save student profile", err);
      }
    }

    // 3. Update store order to Confirmed
    const updatedOrder: StoreOrder = {
      ...order,
      status: "Confirmed",
      paymentConfirmedAt: dateStr,
      adminComment: `Course enrollment confirmed by Admin in Course Management on ${dateStr}. Course access unlocked immediately.`
    };

    if (setStoreOrders) {
      setStoreOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o));
    }
    try {
      setDoc(doc(db, "storeOrders", order.id), updatedOrder, { merge: true }).catch(() => {});
    } catch (err) {
      console.error("Failed to update store order in Firestore", err);
    }

    showNotification(`Enrollment order #${order.id} for "${order.studentName}" has been CONFIRMED! Course access is now active in the student dashboard.`);
  };

  // ACTION 2: Reject / Cancel Store Order
  const handleRejectStoreEnrollment = (orderId: string) => {
    if (!confirm(`Cancel course enrollment order #${orderId}?`)) return;

    const dateStr = new Date().toLocaleDateString("en-IN");
    if (setStoreOrders) {
      setStoreOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          const updated = {
            ...o,
            status: "Cancelled" as const,
            adminComment: `Order rejected by Admin in Course Management on ${dateStr}.`
          };
          try {
            setDoc(doc(db, "storeOrders", orderId), updated, { merge: true }).catch(() => {});
          } catch (e) {}
          return updated;
        }
        return o;
      }));
    }
    showNotification(`Order #${orderId} was marked as Cancelled.`, "error");
  };

  // ACTION 3: Enroll Existing Registered Student into Courses
  const handleEnrollExistingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingStudentId) {
      showNotification("Please select a student.", "error");
      return;
    }
    if (existingSelectedCourseIds.length === 0) {
      showNotification("Please select at least one course to enroll.", "error");
      return;
    }

    const targetStudent = students.find(s => s.id === existingStudentId);
    if (!targetStudent) return;

    const enrolledCourseNames: string[] = [];
    const dateStr = new Date().toLocaleDateString("en-IN") + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Enroll into each selected course
    existingSelectedCourseIds.forEach(cId => {
      const course = courses.find(c => c.id === cId);
      if (!course) return;

      const currentIds = course.enrolledStudentIds || [];
      if (!currentIds.includes(targetStudent.id)) {
        const updatedCourse: Course = {
          ...course,
          enrolledStudentIds: [...currentIds, targetStudent.id]
        };
        onUpdateCourse(updatedCourse);
        try {
          setDoc(doc(db, "courses", course.id), updatedCourse, { merge: true }).catch(() => {});
        } catch (e) {}
      }
      enrolledCourseNames.push(course.title);

      // Create official confirmed StoreOrder for audit
      const newAuditOrder: StoreOrder = {
        id: "ORD-ADM-" + Math.floor(1000 + Math.random() * 9000),
        studentId: targetStudent.id,
        studentName: targetStudent.name,
        studentEmail: targetStudent.email || `${targetStudent.rollNo || 'student'}@studyhub.edu.in`,
        studentMobile: targetStudent.mobileNumber || "9876543210",
        items: [{
          itemId: course.id,
          itemName: course.title,
          price: course.price || 0,
          quantity: 1,
          itemType: "course",
          courseId: course.id
        }],
        totalAmount: course.price || 0,
        paymentMethod: existingEnrollmentNote || "Direct Admin Admission",
        orderDate: dateStr,
        status: "Confirmed",
        paymentConfirmedAt: dateStr,
        adminComment: `Directly enrolled by Admin: ${existingEnrollmentNote}`
      };

      if (setStoreOrders) {
        setStoreOrders(prev => [newAuditOrder, ...prev]);
      }
      try {
        setDoc(doc(db, "storeOrders", newAuditOrder.id), newAuditOrder, { merge: true }).catch(() => {});
      } catch (e) {}
    });

    showNotification(`Student "${targetStudent.name}" successfully enrolled in: ${enrolledCourseNames.join(", ")}!`);
    setIsEnrollExistingModalOpen(false);
    setExistingStudentId("");
    setExistingSelectedCourseIds(preselectedCourseId ? [preselectedCourseId] : []);
  };

  // ACTION 4: On-Spot Student Account Creation & Instant Enrollment
  const handleOnSpotCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSpotName.trim()) {
      showNotification("Student full name is required.", "error");
      return;
    }
    if (!onSpotMobile.trim()) {
      showNotification("Student mobile number is required.", "error");
      return;
    }
    if (onSpotSelectedCourseIds.length === 0) {
      showNotification("Please select at least one course for on-spot enrollment.", "error");
      return;
    }

    const rollNo = onSpotRollNo.trim() || `STU2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const username = onSpotUsername.trim() || rollNo.toLowerCase();
    const email = onSpotEmail.trim() || `${rollNo.toLowerCase()}@studyhub.edu.in`;
    const password = onSpotPassword.trim() || "Stud@2026";
    const dateStr = new Date().toLocaleDateString("en-IN") + " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. Create Student Object
    const newStudent: Student = {
      id: "std_" + Date.now(),
      name: onSpotName.trim(),
      username: username,
      rollNo: rollNo,
      email: email,
      password: password,
      mobileNumber: onSpotMobile.trim(),
      status: "Active",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      isVerified: true,
      schoolName: onSpotSchool,
      registeredAt: new Date().toISOString().split("T")[0],
      isSelfRegistered: false
    };

    // 2. Add to Students State & Firestore
    if (setStudents) {
      setStudents(prev => [newStudent, ...prev]);
    }
    try {
      setDoc(doc(db, "students", newStudent.id), newStudent, { merge: true }).catch(() => {});
    } catch (e) {
      console.error("Failed to save new student", e);
    }

    // 3. Enroll into selected courses
    const enrolledCoursesList: Course[] = [];
    onSpotSelectedCourseIds.forEach(cId => {
      const course = courses.find(c => c.id === cId);
      if (!course) return;

      const currentIds = course.enrolledStudentIds || [];
      const updatedCourse: Course = {
        ...course,
        enrolledStudentIds: [...currentIds, newStudent.id]
      };
      onUpdateCourse(updatedCourse);
      enrolledCoursesList.push(updatedCourse);
      try {
        setDoc(doc(db, "courses", course.id), updatedCourse, { merge: true }).catch(() => {});
      } catch (e) {}

      // Create official confirmed order record
      const newAuditOrder: StoreOrder = {
        id: "ORD-SPOT-" + Math.floor(1000 + Math.random() * 9000),
        studentId: newStudent.id,
        studentName: newStudent.name,
        studentEmail: newStudent.email,
        studentMobile: newStudent.mobileNumber,
        items: [{
          itemId: course.id,
          itemName: course.title,
          price: course.price || 0,
          quantity: 1,
          itemType: "course",
          courseId: course.id
        }],
        totalAmount: course.price || 0,
        paymentMethod: "On-Spot Direct Admission at Center",
        orderDate: dateStr,
        status: "Confirmed",
        paymentConfirmedAt: dateStr,
        adminComment: `On-spot login created & enrolled by Admin on ${dateStr}.`
      };

      if (setStoreOrders) {
        setStoreOrders(prev => [newAuditOrder, ...prev]);
      }
      try {
        setDoc(doc(db, "storeOrders", newAuditOrder.id), newAuditOrder, { merge: true }).catch(() => {});
      } catch (e) {}
    });

    // 4. Save and show Login Credentials Card
    setCreatedLoginDetails({
      student: newStudent,
      courses: enrolledCoursesList
    });
    setIsOnSpotModalOpen(false);

    // Reset Form
    setOnSpotName("");
    setOnSpotMobile("");
    setOnSpotRollNo(`STU2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setOnSpotUsername("");
    setOnSpotPassword("Stud@2026");
    setOnSpotEmail("");
    setOnSpotSelectedCourseIds(preselectedCourseId ? [preselectedCourseId] : []);

    showNotification(`On-spot account created for ${newStudent.name}! Login credentials generated and active.`);
  };

  // ACTION 5: Toggle Block / Unblock Student (Live button with 3s feedback)
  const handleToggleBlock = (rec: EnrollmentRecord) => {
    let targetStudent = rec.studentObject || students.find(s => 
      s.id === rec.studentId || 
      (rec.studentRollNo && s.rollNo === rec.studentRollNo) ||
      (rec.studentEmail && s.email === rec.studentEmail)
    );

    // If student record doesn't exist yet, synthesize one so we can manage status
    if (!targetStudent) {
      targetStudent = {
        id: rec.studentId || "std_" + Date.now(),
        name: rec.studentName,
        rollNo: rec.studentRollNo || "STU-" + Math.floor(1000 + Math.random() * 9000),
        email: rec.studentEmail || "",
        mobileNumber: rec.studentMobile || "",
        status: "Active",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        isLocked: false
      };
    }

    const isCurrentlyBlocked = targetStudent.status === "Inactive" || targetStudent.isLocked;
    const newStatus: "Active" | "Inactive" = isCurrentlyBlocked ? "Active" : "Inactive";
    const newIsLocked = !isCurrentlyBlocked;

    const updatedStudent: Student = {
      ...targetStudent,
      status: newStatus,
      isLocked: newIsLocked
    };

    // 1. Immediate State & Firestore Update
    if (setStudents) {
      setStudents(prev => {
        const exists = prev.some(s => s.id === updatedStudent.id);
        if (exists) {
          return prev.map(s => s.id === updatedStudent.id ? updatedStudent : s);
        }
        return [updatedStudent, ...prev];
      });
    }

    try {
      setDoc(doc(db, "students", updatedStudent.id), updatedStudent, { merge: true }).catch(() => {});
    } catch (e) {
      console.error("Failed to update student block status", e);
    }

    // 2. Start 3-second live visual transformation on the button
    const actionName = isCurrentlyBlocked ? "unblock" : "block";
    const msg = isCurrentlyBlocked ? "Unblocked!" : "Blocked!";
    startLiveTimer(rec.uniqueId, actionName, msg);

    showNotification(
      isCurrentlyBlocked
        ? `Student "${targetStudent.name}" has been UNBLOCKED. Course & portal access restored!`
        : `Student "${targetStudent.name}" has been BLOCKED. Course & portal access locked!`,
      isCurrentlyBlocked ? "success" : "error"
    );
  };

  // ACTION 6: Un-Enroll Student (Live 3-second window with Undo)
  const handleRequestUnenroll = (rec: EnrollmentRecord) => {
    // Start 3-second live countdown
    startLiveTimer(
      rec.uniqueId, 
      "unenroll", 
      "Un-enrolling...", 
      true, // undoable
      () => {
        // Execute un-enrollment after 3 seconds
        const course = courses.find(c => c.id === rec.courseId);
        if (course) {
          const updatedEnrolled = (course.enrolledStudentIds || []).filter(id => 
            id !== rec.studentId && 
            id !== rec.studentRollNo &&
            id !== rec.studentEmail
          );
          const updatedCourse: Course = {
            ...course,
            enrolledStudentIds: updatedEnrolled
          };
          onUpdateCourse(updatedCourse);
          try {
            setDoc(doc(db, "courses", course.id), updatedCourse, { merge: true }).catch(() => {});
          } catch (e) {}
        }

        // If linked to store order, mark as Cancelled/Revoked
        if (rec.orderId && setStoreOrders) {
          setStoreOrders(prev => prev.map(o => {
            if (o.id === rec.orderId) {
              const updated = {
                ...o,
                status: "Cancelled" as const,
                adminComment: `Unenrolled by Admin on ${new Date().toLocaleDateString("en-IN")}`
              };
              try {
                setDoc(doc(db, "storeOrders", o.id), updated, { merge: true }).catch(() => {});
              } catch (e) {}
              return updated;
            }
            return o;
          }));
        }

        showNotification(`Student "${rec.studentName}" un-enrolled from "${rec.courseTitle}".`, "error");
      }
    );
  };

  // ACTION 7: Delete Enrollment Record (Live 3-second window with Undo)
  const handleRequestDelete = (rec: EnrollmentRecord) => {
    // Start 3-second live countdown
    startLiveTimer(
      rec.uniqueId, 
      "delete", 
      "Deleting...", 
      true, // undoable
      () => {
        // 1. Remove student from course enrolled list
        const course = courses.find(c => c.id === rec.courseId);
        if (course) {
          const updatedEnrolled = (course.enrolledStudentIds || []).filter(id => 
            id !== rec.studentId && 
            id !== rec.studentRollNo &&
            id !== rec.studentEmail
          );
          const updatedCourse: Course = {
            ...course,
            enrolledStudentIds: updatedEnrolled
          };
          onUpdateCourse(updatedCourse);
          try {
            setDoc(doc(db, "courses", course.id), updatedCourse, { merge: true }).catch(() => {});
          } catch (e) {}
        }

        // 2. If linked to store order, delete from Firestore & state
        if (rec.orderId) {
          if (setStoreOrders) {
            setStoreOrders(prev => prev.filter(o => o.id !== rec.orderId));
          }
          try {
            deleteDoc(doc(db, "storeOrders", rec.orderId)).catch(() => {});
          } catch (e) {}
        }

        showNotification(`Enrollment record for "${rec.studentName}" deleted successfully.`, "error");
      }
    );
  };

  // ACTION 8: Open Edit Student Enrollment Modal
  const handleOpenEditModal = (rec: EnrollmentRecord) => {
    setEditingEnrollRecord(rec);
    const targetStudent = rec.studentObject || students.find(s => 
      s.id === rec.studentId || 
      (rec.studentRollNo && s.rollNo === rec.studentRollNo)
    );

    setEditName(targetStudent?.name || rec.studentName);
    setEditRollNo(targetStudent?.rollNo || rec.studentRollNo || "");
    setEditMobile(targetStudent?.mobileNumber || rec.studentMobile || "");
    setEditEmail(targetStudent?.email || rec.studentEmail || "");
    setEditSchool(targetStudent?.schoolName || "Study HUB MP Nagar Head Center");
    const isBlocked = targetStudent?.status === "Inactive" || targetStudent?.isLocked;
    setEditStatus(isBlocked ? "Inactive" : "Active");

    // Compute all courses student is currently enrolled in
    const enrolledInCourseIds = courses.filter(c => 
      c.enrolledStudentIds?.includes(rec.studentId) || 
      (rec.studentRollNo && c.enrolledStudentIds?.includes(rec.studentRollNo)) ||
      (rec.studentEmail && c.enrolledStudentIds?.includes(rec.studentEmail)) ||
      c.id === rec.courseId
    ).map(c => c.id);

    setEditSelectedCourseIds(enrolledInCourseIds.length > 0 ? enrolledInCourseIds : [rec.courseId]);
    setEditRemarks("");
    setIsEditModalOpen(true);
  };

  // ACTION 9: Save Edit Student Enrollment Changes
  const handleSaveEditEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnrollRecord) return;

    const targetStudentId = editingEnrollRecord.studentId;
    const targetStudent = editingEnrollRecord.studentObject || students.find(s => 
      s.id === targetStudentId || 
      (editingEnrollRecord.studentRollNo && s.rollNo === editingEnrollRecord.studentRollNo)
    );

    // 1. Update Student Profile in State & Firestore
    if (targetStudent && setStudents) {
      const updatedStudent: Student = {
        ...targetStudent,
        name: editName.trim() || targetStudent.name,
        rollNo: editRollNo.trim() || targetStudent.rollNo,
        mobileNumber: editMobile.trim() || targetStudent.mobileNumber,
        email: editEmail.trim() || targetStudent.email,
        schoolName: editSchool || targetStudent.schoolName,
        status: editStatus,
        isLocked: editStatus === "Inactive"
      };
      setStudents(prev => prev.map(s => s.id === targetStudent.id ? updatedStudent : s));
      try {
        setDoc(doc(db, "students", targetStudent.id), updatedStudent, { merge: true }).catch(() => {});
      } catch (e) {}
    }

    // 2. Synchronize course enrollments across all courses
    courses.forEach(course => {
      const isChecked = editSelectedCourseIds.includes(course.id);
      const currentlyEnrolled = (course.enrolledStudentIds || []).includes(targetStudentId) ||
        (editingEnrollRecord.studentRollNo && (course.enrolledStudentIds || []).includes(editingEnrollRecord.studentRollNo));

      if (isChecked && !currentlyEnrolled) {
        // Add student ID to course
        const updatedCourse: Course = {
          ...course,
          enrolledStudentIds: [...(course.enrolledStudentIds || []), targetStudentId]
        };
        onUpdateCourse(updatedCourse);
        try {
          setDoc(doc(db, "courses", course.id), updatedCourse, { merge: true }).catch(() => {});
        } catch (e) {}
      } else if (!isChecked && currentlyEnrolled) {
        // Remove student ID from course
        const updatedCourse: Course = {
          ...course,
          enrolledStudentIds: (course.enrolledStudentIds || []).filter(id => 
            id !== targetStudentId && 
            id !== editingEnrollRecord.studentRollNo
          )
        };
        onUpdateCourse(updatedCourse);
        try {
          setDoc(doc(db, "courses", course.id), updatedCourse, { merge: true }).catch(() => {});
        } catch (e) {}
      }
    });

    const recordId = editingEnrollRecord.uniqueId;
    setIsEditModalOpen(false);
    setEditingEnrollRecord(null);

    // Start 3-second live visual confirmation on the button
    startLiveTimer(recordId, "edit", "Updated ✓");
    showNotification(`Enrollment details for "${editName}" updated successfully.`);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-lg transition-all animate-fadeIn ${
          notification.type === "success" 
            ? "bg-emerald-600 text-white shadow-emerald-600/20" 
            : "bg-rose-600 text-white shadow-rose-600/20"
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/20 rounded cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-6 rounded-3xl border border-indigo-900/50 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Course Access & Enrollment Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <span>Student Enroll Management</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Verify & confirm store course orders, enroll registered students into batches, and create on-spot student logins with instant course dashboard access.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setIsEnrollExistingModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-indigo-600/30 flex items-center space-x-2 cursor-pointer"
            title="Enroll an already registered student"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Registered Student</span>
          </button>

          <button
            onClick={() => {
              handleGenerateRollAndUsername();
              setIsOnSpotModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-emerald-600/30 flex items-center space-x-2 cursor-pointer"
            title="Create student login on the spot & enroll directly"
          >
            <Key className="w-4 h-4" />
            <span>On-Spot Create Login & Enroll</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/20 transition-all cursor-pointer flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Total Enrolled Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {new Set(enrollmentRecords.map(r => r.studentId)).size}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">Across all published courses</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs space-y-1 bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">Pending Store Enrollments</span>
            <ShoppingBag className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-black text-amber-700 font-mono">
              {pendingStoreCourseOrders.length}
            </p>
            {pendingStoreCourseOrders.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-amber-500 text-white rounded-full animate-pulse">
                Needs Admin Action
              </span>
            )}
          </div>
          <p className="text-[11px] text-amber-800 font-medium">Awaiting verification in store</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Active Courses</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {courses.length}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">Live curriculums</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Registered Students</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {students.length}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">In active database</p>
        </div>
      </div>

      {/* SECTION 1: STORE COURSE ORDERS AWAITING ADMIN CONFIRMATION */}
      {pendingStoreCourseOrders.length > 0 && (
        <div className="bg-amber-50/60 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
            <div className="flex items-center space-x-3">
              <span className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-amber-950 flex items-center gap-2">
                  <span>Store Course Enrollments Pending Admin Confirmation</span>
                  <span className="bg-amber-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                    {pendingStoreCourseOrders.length}
                  </span>
                </h3>
                <p className="text-xs text-amber-800">
                  Students enrolled via the Store. Click <strong>Confirm & Unlock Access</strong> to verify payment and automatically activate the course in their student dashboard.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingStoreCourseOrders.map(order => {
              const courseItems = (order.items || []).filter(i => 
                i.itemType === "course" || 
                i.courseId || 
                courses.some(c => c.id === i.itemId || (i.itemName && c.title.toLowerCase().includes(i.itemName.toLowerCase())))
              );

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          Order #{order.id}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm mt-1">
                          {order.studentName}
                        </h4>
                        <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                          {order.studentMobile && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{order.studentMobile}</span>
                            </span>
                          )}
                          {order.studentEmail && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{order.studentEmail}</span>
                            </span>
                          )}
                        </p>
                      </div>

                      <span className="text-xs font-black text-amber-700 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full uppercase shrink-0">
                        {order.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Enrolled Course(s)
                      </div>
                      {courseItems.map((ci, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{ci.itemName}</span>
                          </span>
                          <span className="font-mono font-bold text-slate-700">₹{ci.price}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span>Method: <strong className="text-slate-800">{order.paymentMethod}</strong></span>
                      <span className="text-slate-400 font-mono">{order.orderDate}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleConfirmStoreEnrollment(order)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm & Unlock Access</span>
                    </button>

                    <button
                      onClick={() => handleRejectStoreEnrollment(order.id)}
                      className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
                      title="Cancel this order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: ENROLLED STUDENTS DIRECTORY & MANAGEMENT */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        {/* Filters & Search Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Enrolled Students Ledger</span>
              <span className="text-xs font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {filteredEnrollments.length}
              </span>
            </h3>

            {/* Course Filter Dropdown */}
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-indigo-600 cursor-pointer"
            >
              <option value="all">-- All Courses ({courses.length}) --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-indigo-600 cursor-pointer"
            >
              <option value="all">All Sources</option>
              <option value="store">Store Purchase</option>
              <option value="admin">Admin Direct</option>
              <option value="onspot">On-Spot Created</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student, roll no, mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-indigo-600"
            />
          </div>
        </div>

        {/* Enrollment Table */}
        {filteredEnrollments.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No Enrolled Students Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchQuery || selectedCourseFilter !== "all" 
                ? "No enrollment matches your current filter criteria. Try resetting the filters."
                : "No students have enrolled in this course yet. Use the buttons above to enroll registered students or create on-spot accounts."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Student</th>
                  <th className="pb-3">Roll No / Scholar</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Course</th>
                  <th className="pb-3">Source & Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnrollments.map((rec) => (
                  <tr key={rec.uniqueId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {rec.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">{rec.studentName}</div>
                          {rec.studentObject?.schoolName && (
                            <div className="text-[10px] text-slate-400">{rec.studentObject.schoolName}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 font-mono font-bold text-slate-700">
                      {rec.studentRollNo || "N/A"}
                    </td>

                    <td className="py-3.5 space-y-0.5">
                      {rec.studentMobile && (
                        <div className="text-slate-700 font-medium">{rec.studentMobile}</div>
                      )}
                      {rec.studentEmail && (
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{rec.studentEmail}</div>
                      )}
                    </td>

                    <td className="py-3.5">
                      <span className="font-bold text-slate-800 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate max-w-[180px]">{rec.courseTitle}</span>
                      </span>
                    </td>

                    <td className="py-3.5">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        rec.enrollmentSource === "store"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : rec.enrollmentSource === "onspot"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {rec.enrollmentSource === "store" ? "Store Order" : rec.enrollmentSource === "onspot" ? "On-Spot Login" : "Admin Direct"}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{rec.enrollmentDate}</div>
                    </td>

                    <td className="py-3.5">
                      {rec.status === "Blocked" ? (
                        <span className="text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
                          <Ban className="w-3 h-3 text-rose-600" />
                          Blocked Access
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Active Access
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      {/* Live 3-Second Transition State */}
                      {liveActionStates[rec.uniqueId] ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          {liveActionStates[rec.uniqueId].undoable ? (
                            <div className="flex items-center space-x-1 animate-pulse">
                              <div className={`text-[10px] font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-white shadow-sm ${
                                liveActionStates[rec.uniqueId].action === "delete" ? "bg-red-600" : "bg-rose-600"
                              }`}>
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                                <span>{liveActionStates[rec.uniqueId].action === "delete" ? "Deleting" : "Un-enrolling"} ({liveActionStates[rec.uniqueId].secondsLeft}s)</span>
                              </div>
                              <button
                                onClick={() => cancelLiveAction(rec.uniqueId)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                                title="Click to Undo within 3 seconds"
                              >
                                <RotateCcw className="w-3 h-3 text-amber-400" />
                                <span>Undo</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 animate-pulse">
                              <div className={`text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-white shadow-sm ${
                                liveActionStates[rec.uniqueId].action === "edit"
                                  ? "bg-indigo-600"
                                  : liveActionStates[rec.uniqueId].action === "unblock"
                                  ? "bg-emerald-600"
                                  : "bg-amber-600"
                              }`}>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{liveActionStates[rec.uniqueId].message} ({liveActionStates[rec.uniqueId].secondsLeft}s)</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* 1. Student Block / Unblock Button */}
                          <button
                            onClick={() => handleToggleBlock(rec)}
                            className={`px-2 py-1.5 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${
                              rec.status === "Blocked"
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300"
                                : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300"
                            }`}
                            title={rec.status === "Blocked" ? "Unblock Student Account & Courses" : "Block Student Account & Courses"}
                          >
                            {rec.status === "Blocked" ? (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Unblock</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-3.5 h-3.5 text-amber-600" />
                                <span>Block</span>
                              </>
                            )}
                          </button>

                          {/* 2. Edit Student Enroll Button */}
                          <button
                            onClick={() => handleOpenEditModal(rec)}
                            className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                            title="Edit Student Enrollment Details & Courses"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Edit Enroll</span>
                          </button>

                          {/* 3. Un-Enroll Button (Live with 3s countdown) */}
                          <button
                            onClick={() => handleRequestUnenroll(rec)}
                            className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                            title="Un-enroll student from this course (3s live window)"
                          >
                            <UserMinus className="w-3.5 h-3.5 text-rose-600" />
                            <span>Un Enroll</span>
                          </button>

                          {/* 4. Delete Button (Live with 3s countdown) */}
                          <button
                            onClick={() => handleRequestDelete(rec)}
                            className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                            title="Delete enrollment record (3s live window)"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            <span>Delete</span>
                          </button>

                          {/* 5. View Login Credentials */}
                          {rec.studentObject && (
                            <button
                              onClick={() => setViewingLoginStudent(rec.studentObject || null)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                              title="View Student Login Credentials"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ENROLL REGISTERED STUDENT */}
      {isEnrollExistingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-indigo-300" />
                <h3 className="font-extrabold text-base uppercase tracking-wider">
                  Enroll Registered Student
                </h3>
              </div>
              <button
                onClick={() => setIsEnrollExistingModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollExistingSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Search & Select Registered Student <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Search by name, roll number, or mobile..."
                    value={existingStudentSearch}
                    onChange={(e) => setExistingStudentSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-indigo-600"
                  />
                  <select
                    required
                    value={existingStudentId}
                    onChange={(e) => setExistingStudentId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-indigo-600"
                    size={4}
                  >
                    {students
                      .filter(s => {
                        if (!existingStudentSearch.trim()) return true;
                        const q = existingStudentSearch.toLowerCase();
                        return s.name.toLowerCase().includes(q) || 
                               (s.rollNo && s.rollNo.toLowerCase().includes(q)) || 
                               (s.mobileNumber && s.mobileNumber.includes(q));
                      })
                      .map(s => (
                        <option key={s.id} value={s.id} className="p-1.5 hover:bg-indigo-50">
                          {s.name} ({s.rollNo || s.username || s.id}) - {s.mobileNumber || "No Phone"}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Select Course(s) to Enroll Into <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {courses.map(course => {
                    const isSelected = existingSelectedCourseIds.includes(course.id);
                    return (
                      <label
                        key={course.id}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected ? "bg-indigo-100 text-indigo-900 border border-indigo-300" : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setExistingSelectedCourseIds(prev => prev.filter(id => id !== course.id));
                              } else {
                                setExistingSelectedCourseIds(prev => [...prev, course.id]);
                              }
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{course.title}</span>
                        </div>
                        <span className="font-mono text-slate-500">₹{course.price}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Admission / Fee Reason (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scholarship Allotment, Center Cash Paid, Direct Academic Batch"
                  value={existingEnrollmentNote}
                  onChange={(e) => setExistingEnrollmentNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEnrollExistingModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Enrollment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ON-SPOT STUDENT ACCOUNT CREATION & INSTANT ENROLLMENT */}
      {isOnSpotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="font-extrabold text-base uppercase tracking-wider">
                    On-Spot Student Registration & Enroll
                  </h3>
                  <p className="text-[11px] text-emerald-100">
                    Create login credentials on the spot and immediately unlock selected courses.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOnSpotModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOnSpotCreateSubmit} className="p-6 space-y-4 overflow-y-auto text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ayush Verma"
                    value={onSpotName}
                    onChange={(e) => setOnSpotName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600 font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={onSpotMobile}
                    onChange={(e) => setOnSpotMobile(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Roll No / Scholar ID <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateRollAndUsername}
                      className="text-[10px] text-emerald-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Re-roll</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={onSpotRollNo}
                    onChange={(e) => setOnSpotRollNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600 font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Login Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={onSpotPassword}
                      onChange={(e) => setOnSpotPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-9 py-2 text-xs focus:outline-emerald-600 font-mono font-bold text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. ayush@studyhub.edu"
                    value={onSpotEmail}
                    onChange={(e) => setOnSpotEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Center / Branch
                  </label>
                  <input
                    type="text"
                    value={onSpotSchool}
                    onChange={(e) => setOnSpotSchool(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Course(s) to Unlock Access <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5 max-h-44 overflow-y-auto bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {courses.map(course => {
                    const isSelected = onSpotSelectedCourseIds.includes(course.id);
                    return (
                      <label
                        key={course.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected ? "bg-emerald-100 text-emerald-900 border border-emerald-300" : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setOnSpotSelectedCourseIds(prev => prev.filter(id => id !== course.id));
                              } else {
                                setOnSpotSelectedCourseIds(prev => [...prev, course.id]);
                              }
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{course.title}</span>
                        </div>
                        <span className="font-mono text-slate-500">₹{course.price}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  This student will immediately be added to the registered database with <strong>Active</strong> status. They can log in right away using their Roll Number/Username and Password.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOnSpotModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <Key className="w-4 h-4" />
                  <span>Create Login & Unlock Courses</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATED LOGIN DETAILS SUMMARY CARD */}
      {createdLoginDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-emerald-300 shadow-2xl max-w-md w-full p-6 space-y-4 text-left">
            <div className="flex items-center space-x-3 text-emerald-700 border-b border-emerald-100 pb-3">
              <div className="p-2.5 bg-emerald-100 rounded-2xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">Login Account Created!</h3>
                <p className="text-xs text-emerald-600 font-bold">Registered & Enrolled Successfully</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Student Name:</span>
                <strong className="text-slate-900 font-sans">{createdLoginDetails.student.name}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Roll No / User ID:</span>
                <strong className="text-indigo-600">{createdLoginDetails.student.rollNo}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Username:</span>
                <strong className="text-indigo-600">{createdLoginDetails.student.username}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Login Password:</span>
                <strong className="text-emerald-700">{createdLoginDetails.student.password}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Registered Mobile:</span>
                <strong className="text-slate-800">{createdLoginDetails.student.mobileNumber}</strong>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-sans text-[11px]">Enrolled Course(s):</span>
                {createdLoginDetails.courses.map(c => (
                  <div key={c.id} className="text-indigo-800 font-sans font-bold flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{c.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => {
                  const detailsText = `Study HUB Student Login Credentials:\nName: ${createdLoginDetails.student.name}\nRoll No / User ID: ${createdLoginDetails.student.rollNo}\nUsername: ${createdLoginDetails.student.username}\nPassword: ${createdLoginDetails.student.password}\nMobile: ${createdLoginDetails.student.mobileNumber}\nEnrolled in: ${createdLoginDetails.courses.map(c => c.title).join(", ")}`;
                  copyToClipboard(detailsText, "all_details");
                }}
                className="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedKey === "all_details" ? "Copied to Clipboard!" : "Copy Login Details"}</span>
              </button>

              <button
                onClick={() => setCreatedLoginDetails(null)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: VIEW STUDENT LOGIN DETAILS */}
      {viewingLoginStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Student Login Credentials
                </h3>
              </div>
              <button
                onClick={() => setViewingLoginStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Full Name:</span>
                <strong className="text-slate-900 font-sans">{viewingLoginStudent.name}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Roll Number:</span>
                <strong className="text-indigo-600">{viewingLoginStudent.rollNo || viewingLoginStudent.id}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Login Username:</span>
                <strong className="text-indigo-600">{viewingLoginStudent.username || viewingLoginStudent.rollNo}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Password:</span>
                <strong className="text-emerald-700">{viewingLoginStudent.password || "alex123"}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Mobile:</span>
                <strong className="text-slate-800">{viewingLoginStudent.mobileNumber || "N/A"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Account Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 font-sans">
                  {viewingLoginStudent.status}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => {
                  const txt = `Study HUB Student Credentials:\nName: ${viewingLoginStudent.name}\nRoll: ${viewingLoginStudent.rollNo || viewingLoginStudent.id}\nUsername: ${viewingLoginStudent.username || viewingLoginStudent.rollNo}\nPassword: ${viewingLoginStudent.password || "alex123"}\nMobile: ${viewingLoginStudent.mobileNumber || "N/A"}`;
                  copyToClipboard(txt, "view_creds");
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedKey === "view_creds" ? "Copied to Clipboard!" : "Copy Credentials"}</span>
              </button>

              <button
                onClick={() => setViewingLoginStudent(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT STUDENT ENROLLMENT & ACCESS MODAL */}
      {isEditModalOpen && editingEnrollRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-900 p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-indigo-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base uppercase tracking-wider">
                    Edit Student Enrollment & Access
                  </h3>
                  <p className="text-[11px] text-indigo-100">
                    Modify profile details, adjust enrolled courses, and manage access privileges.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingEnrollRecord(null);
                }}
                className="p-1.5 rounded-full hover:bg-white/20 text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditEnroll} className="p-6 space-y-4 overflow-y-auto text-left">
              {/* Row 1: Student Name & Roll */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-indigo-600 font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Scholar / Roll No <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editRollNo}
                    onChange={(e) => setEditRollNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-indigo-600 font-mono text-slate-800"
                  />
                </div>
              </div>

              {/* Row 2: Mobile & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-indigo-600 font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-indigo-600 text-slate-800"
                  />
                </div>
              </div>

              {/* Row 3: School Branch */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  School / Center Branch
                </label>
                <input
                  type="text"
                  value={editSchool}
                  onChange={(e) => setEditSchool(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-indigo-600 text-slate-800"
                />
              </div>

              {/* Row 4: Account & Portal Access Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Portal & Course Access Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditStatus("Active")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                      editStatus === "Active"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400/30"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${editStatus === "Active" ? "text-emerald-600" : "text-slate-400"}`} />
                    <span>Active (Access Granted)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus("Inactive")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                      editStatus === "Inactive"
                        ? "bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-400/30"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Ban className={`w-4 h-4 ${editStatus === "Inactive" ? "text-rose-600" : "text-slate-400"}`} />
                    <span>Blocked (Access Locked)</span>
                  </button>
                </div>
              </div>

              {/* Row 5: Course Enrollment Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Assigned Course Enrollments ({editSelectedCourseIds.length} active)
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-200 rounded-2xl p-2.5 bg-slate-50">
                  {courses.map(course => {
                    const isChecked = editSelectedCourseIds.includes(course.id);
                    return (
                      <label
                        key={course.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? "bg-white border-indigo-200 shadow-2xs font-bold text-slate-900"
                            : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditSelectedCourseIds(prev => [...prev, course.id]);
                              } else {
                                setEditSelectedCourseIds(prev => prev.filter(id => id !== course.id));
                              }
                            }}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer shrink-0"
                          />
                          <div className="truncate">
                            <div className="font-extrabold truncate">{course.title}</div>
                            <div className="text-[10px] text-slate-400 truncate">Mentor: {course.mentorName}</div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                          isChecked ? "bg-indigo-100 text-indigo-800" : "bg-slate-200 text-slate-600"
                        }`}>
                          {isChecked ? "Enrolled" : "Not Enrolled"}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Remarks / Admin Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admission Notes / Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  placeholder="e.g. Updated enrollment branch and course access"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-indigo-600 text-slate-800"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingEnrollRecord(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Enrollment Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
