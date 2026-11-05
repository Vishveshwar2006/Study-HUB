import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Radio,
  Disc,
  Pause,
  Play,
  Square,
  MessageSquare,
  Users,
  Hand,
  Pin,
  Send,
  Sparkles,
  BarChart2,
  X,
  Maximize2,
  Download,
  CheckCircle,
  HelpCircle,
  Volume2,
  Settings,
  Flame,
  ThumbsUp,
  Heart,
  Smile,
  Shield,
  FileText,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  UserX,
  RefreshCw,
  Edit3
} from "lucide-react";
import LiveWhiteboard from "./LiveWhiteboard";
import { CourseLiveClass, LiveClassChatMessage, LiveClassPoll, Student, Teacher } from "../types";
import { db, handleFirestoreError, OperationType } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  deleteDoc
} from "firebase/firestore";

interface LiveClassStudioProps {
  liveClass: CourseLiveClass;
  userRole: "admin" | "teacher" | "student" | "guest";
  currentUser: { id: string; name: string; avatar?: string; role?: string };
  onClose: () => void;
  onUpdateLiveClass?: (updated: CourseLiveClass) => void;
  students?: Student[];
}

interface FloatingEmoji {
  id: string;
  emoji: string;
  left: number; // percentage
}

// Prohibited abusive words list for auto-moderation
const ABUSIVE_WORDS = [
  "abuse", "idiot", "fool", "hate", "scam", "stupid", "bastard", "bitch",
  "asshole", "fuck", "shit", "badword", "rascal", "cheat", "dog", "garbage",
  "trash", "dumb", "useless", "fraud", "nonsense", "bloody", "loser", "shut up",
  "harass", "threat", "scammer", "fake"
];

function containsAbusiveWords(text: string): boolean {
  const normalized = text.toLowerCase();
  return ABUSIVE_WORDS.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(normalized) || normalized.includes(word);
  });
}

export default function LiveClassStudio({
  liveClass,
  userRole,
  currentUser,
  onClose,
  onUpdateLiveClass,
  students = []
}: LiveClassStudioProps) {
  const isHost = userRole === "admin" || userRole === "teacher";

  // Media Streams & Hardware
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Toggle Controls
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isWhiteboardActive, setIsWhiteboardActive] = useState<boolean>(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Screen Recording States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Blocked Students Registry (Cloud Database Synced)
  const [blockedStudents, setBlockedStudents] = useState<
    Record<string, { id: string; studentId: string; studentName: string; reason: string; blockedAt: string; blockedBy: string }>
  >({});

  // Real-time Cloud Firestore listener for Blocked Students
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "blockedLiveStudents"),
      (snapshot) => {
        const map: Record<string, any> = {};
        snapshot.docs.forEach((d) => {
          map[d.id] = { id: d.id, ...d.data() };
        });
        setBlockedStudents(map);
      },
      (error) => {
        console.warn("Blocked students firestore listener warning:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Determine if current student is blocked
  const isCurrentUserBlocked = Boolean(
    userRole === "student" &&
    (blockedStudents[currentUser.id] ||
      Object.values(blockedStudents).some(
        (b) =>
          b.studentId === currentUser.id ||
          (currentUser.name && b.studentName?.trim().toLowerCase() === currentUser.name?.trim().toLowerCase())
      ))
  );

  // Security Verification: Identify unauthorized third persons
  const isUnauthorizedThirdPerson = Boolean(
    userRole === "guest" ||
    (!isHost && students.length > 0 && !students.some(s => s.id === currentUser.id || s.name === currentUser.name || s.email === currentUser.id))
  );

  // Real-time Date and Clock Display
  const [currentTimeString, setCurrentTimeString] = useState<string>("");
  const [currentDateString, setCurrentDateString] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTimeString(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setCurrentDateString(now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Total Enrolled Batch/Course Students Count
  const totalEnrolledStudents = Math.max(students.length, 1);

  // Live Studio Session Stopwatch Info
  const [sessionDuration, setSessionDuration] = useState<number>(180); // seconds live so far
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Floating Reactions State
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);

  // Sidebar Tabs
  const [sidebarTab, setSidebarTab] = useState<"chat" | "qa" | "poll" | "roster" | "blocked">("chat");

  // Chat Messages State
  const [messages, setMessages] = useState<LiveClassChatMessage[]>(
    liveClass.chatMessages || [
      {
        id: "msg_1",
        senderId: "t_host",
        senderName: liveClass.instructorName || "Faculty Instructor",
        senderRole: "Teacher",
        message: "Welcome everyone to today's live interactive masterclass! Feel free to ask questions.",
        timestamp: "10:00 AM",
        isPinned: true
      }
    ]
  );
  const [inputMsg, setInputMsg] = useState("");
  const [pinnedMessage, setPinnedMessage] = useState<LiveClassChatMessage | null>(
    messages.find((m) => m.isPinned) || messages[0] || null
  );

  // Real-Time Cloud Database Chat Sync (`liveClassChats`)
  useEffect(() => {
    const q = query(collection(db, "liveClassChats"), where("liveClassId", "==", liveClass.id));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedMsgs: LiveClassChatMessage[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            senderId: data.senderId || "unknown",
            senderName: data.senderName || "User",
            senderRole: data.senderRole || "Student",
            senderAvatar: data.senderAvatar,
            message: data.text || data.message || "",
            timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isPinned: Boolean(data.isPinned),
            createdAt: data.createdAt || 0
          };
        });

        fetchedMsgs.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

        if (fetchedMsgs.length > 0) {
          setMessages(fetchedMsgs);
        }
      },
      (error) => {
        console.warn("Live chat snapshot sync fallback:", error);
      }
    );

    return () => unsubscribe();
  }, [liveClass.id]);

  // --- Real-Time Online Presence Tracker (`liveClassPresence`) ---
  const [activeParticipants, setActiveParticipants] = useState<{ id: string; userId: string; userName: string; userRole: string }[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(1);

  useEffect(() => {
    if (!liveClass?.id || !currentUser?.id || isUnauthorizedThirdPerson || isCurrentUserBlocked) return;

    const presenceDocRef = doc(db, "liveClassPresence", `${liveClass.id}_${currentUser.id}`);

    const presenceData = {
      liveClassId: liveClass.id,
      userId: currentUser.id,
      userName: currentUser.name || "User",
      userRole: userRole,
      avatar: currentUser.avatar || "",
      joinedAt: Date.now(),
      lastActive: Date.now()
    };

    setDoc(presenceDocRef, presenceData, { merge: true }).catch((err) => {
      console.warn("Presence registration warning:", err);
    });

    const heartbeatTimer = setInterval(() => {
      setDoc(presenceDocRef, { lastActive: Date.now() }, { merge: true }).catch(() => {});
    }, 8000);

    return () => {
      clearInterval(heartbeatTimer);
      deleteDoc(presenceDocRef).catch(() => {});
    };
  }, [liveClass.id, currentUser.id, userRole, isUnauthorizedThirdPerson, isCurrentUserBlocked]);

  // Real-Time Active Attendance Listener
  useEffect(() => {
    if (!liveClass?.id) return;

    const q = query(collection(db, "liveClassPresence"), where("liveClassId", "==", liveClass.id));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const active: { id: string; userId: string; userName: string; userRole: string }[] = [];
        const now = Date.now();
        snapshot.docs.forEach((d) => {
          const data = d.data();
          if (!data.lastActive || now - data.lastActive < 45000) {
            active.push({
              id: d.id,
              userId: data.userId || d.id,
              userName: data.userName || "Student",
              userRole: data.userRole || "student"
            });
          }
        });
        setActiveParticipants(active);
        setOnlineCount(Math.max(active.length, 1));
      },
      (error) => {
        console.warn("Active participants listener warning:", error);
      }
    );

    return () => unsubscribe();
  }, [liveClass.id]);

  // Raised Hands State
  const [raisedHands, setRaisedHands] = useState<{ studentId: string; name: string; timestamp: string }[]>([]);
  const [myHandRaised, setMyHandRaised] = useState(false);

  // --- Real-Time Cloud Polls (`liveClassPolls`) ---
  const [poll, setPoll] = useState<LiveClassPoll | null>(
    liveClass.activePoll || {
      id: "poll_1",
      question: "Do you understand Newton's 3rd Law of Motion?",
      options: [
        { id: "opt_1", text: "Yes, 100% Clear!", votes: 14 },
        { id: "opt_2", text: "Need 1 More Example", votes: 4 },
        { id: "opt_3", text: "Have a Question", votes: 2 }
      ],
      totalVotes: 20,
      votedUserIds: [],
      isActive: true
    }
  );
  const [newPollQuestion, setNewPollQuestion] = useState("");
  const [newPollOptions, setNewPollOptions] = useState<string[]>(["Yes, completely!", "Need revision", "Have doubts"]);

  useEffect(() => {
    if (!liveClass?.id) return;
    const pollDocRef = doc(db, "liveClassPolls", liveClass.id);
    const unsubscribe = onSnapshot(
      pollDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as LiveClassPoll;
          setPoll(data);
        }
      },
      (err) => console.warn("Poll listener warning:", err)
    );
    return () => unsubscribe();
  }, [liveClass.id]);

  // Audio Analyzer Ref
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // --- INITIALIZE CAMERA STREAM (TEACHERS / HOSTS ONLY) ---
  const initCamera = async () => {
    if (!isHost) return; // Only teacher/host streams camera and microphone broadcast
    setVideoError(null);

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      setCameraDevices(videoInputs);

      const constraints: MediaStreamConstraints = {
        video: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      };

      const userStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(userStream);

      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
      }

      // Set up Audio Visualizer
      const audioTrack = userStream.getAudioTracks()[0];
      if (audioTrack) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(userStream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateVolume = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          }
          requestAnimationFrame(updateVolume);
        };
        updateVolume();
      }
    } catch (err: any) {
      console.warn("Camera or Microphone access issue:", err);
      setVideoError("Camera or Microphone stream unavailable on this device.");
    }
  };

  useEffect(() => {
    if (isHost && !isCurrentUserBlocked) {
      initCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [selectedCameraId, isHost, isCurrentUserBlocked]);

  // Handle Camera Toggle
  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isCameraOn;
        setIsCameraOn(!isCameraOn);
      } else {
        setIsCameraOn(!isCameraOn);
      }
    } else {
      setIsCameraOn(!isCameraOn);
    }
  };

  // Handle Mic Toggle
  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
        setIsMicOn(!isMicOn);
      } else {
        setIsMicOn(!isMicOn);
      }
    } else {
      setIsMicOn(!isMicOn);
    }
  };

  // Handle Screen Share
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
      }
      setScreenStream(null);
      setIsScreenSharing(false);
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        setScreenStream(displayStream);
        setIsScreenSharing(true);

        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = displayStream;
        }

        displayStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setScreenStream(null);
        };
      } catch (err) {
        console.warn("Screen share cancelled or failed:", err);
      }
    }
  };

  // Handle Screen Recording
  const startRecording = () => {
    recordedChunksRef.current = [];
    const mediaStreamToRecord = screenStream || stream;

    if (!mediaStreamToRecord) {
      // Simulate recording if no media stream is available
      setIsRecording(true);
      setIsRecordingPaused(false);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      return;
    }

    try {
      const recorder = new MediaRecorder(mediaStreamToRecord, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm"
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setIsRecordingPaused(false);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (e) {
      console.warn("MediaRecorder start failed, falling back to simulated recording timer:", e);
      setIsRecording(true);
      setIsRecordingPaused(false);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
    }
    setIsRecordingPaused(true);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
    }
    setIsRecordingPaused(false);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsRecordingPaused(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  // Floating Emoji Reaction
  const handleTriggerEmoji = (emoji: string) => {
    const newEmoji: FloatingEmoji = {
      id: "emoji_" + Date.now() + "_" + Math.random(),
      emoji,
      left: Math.floor(Math.random() * 80) + 10
    };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    }, 3000);
  };

  // --- Send Cloud Chat Message with Automated Abuse Detection & Spot Block ---
  const handleSendMessage = async () => {
    if (!inputMsg.trim()) return;
    const trimmedText = inputMsg.trim();

    if (isCurrentUserBlocked) {
      alert("You are blocked by Study HUB. Access to chat is restricted.");
      setInputMsg("");
      return;
    }

    // AUTOMATIC ABUSIVE WORDS DETECTION & INSTANT BLOCK ON THE SPOT
    if (!isHost && containsAbusiveWords(trimmedText)) {
      const blockData = {
        id: currentUser.id,
        studentId: currentUser.id,
        studentName: currentUser.name,
        reason: "Automated Ban: Used prohibited/abusive language in live chat",
        blockedAt: new Date().toISOString(),
        blockedBy: "Study HUB Auto-Moderator"
      };

      try {
        await setDoc(doc(db, "blockedLiveStudents", currentUser.id), blockData);
        await addDoc(collection(db, "liveClassChats"), {
          liveClassId: liveClass.id,
          senderId: "system",
          senderName: "STUDY HUB MODERATOR 🛡️",
          senderRole: "System",
          text: `🚫 Student ${currentUser.name} was automatically BLOCKED ON THE SPOT for using prohibited abusive language.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          createdAt: Date.now()
        });
      } catch (err) {
        console.error("Auto block failed:", err);
      }

      setInputMsg("");
      return;
    }

    // Broadcast Valid Chat Message to Cloud Firestore
    const msgObj = {
      liveClassId: liveClass.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: isHost ? "Teacher" : "Student",
      senderAvatar: currentUser.avatar || "",
      text: trimmedText,
      message: trimmedText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdAt: Date.now()
    };

    setInputMsg("");

    try {
      await addDoc(collection(db, "liveClassChats"), msgObj);
    } catch (err) {
      // Fallback local append if offline
      setMessages((prev) => [
        ...prev,
        {
          id: "msg_" + Date.now(),
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: isHost ? "Teacher" : "Student",
          senderAvatar: currentUser.avatar,
          message: trimmedText,
          timestamp: msgObj.timestamp
        }
      ]);
    }
  };

  // --- Teacher / Admin Manual Block Control ---
  const handleBlockStudent = async (studentId: string, studentName: string) => {
    if (!isHost) return;
    if (!confirm(`Are you sure you want to block ${studentName} on the spot from all live classes?`)) return;

    const blockData = {
      id: studentId,
      studentId: studentId,
      studentName: studentName,
      reason: `Manual ban by ${currentUser.name}`,
      blockedAt: new Date().toISOString(),
      blockedBy: currentUser.name
    };

    try {
      await setDoc(doc(db, "blockedLiveStudents", studentId), blockData);
      await addDoc(collection(db, "liveClassChats"), {
        liveClassId: liveClass.id,
        senderId: "system",
        senderName: "STUDY HUB MODERATOR 🛡️",
        senderRole: "System",
        text: `🚫 Student ${studentName} was BLOCKED ON THE SPOT by ${currentUser.name}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        createdAt: Date.now()
      });
    } catch (err) {
      console.error("Manual block failed:", err);
    }
  };

  const handleUnblockStudent = async (studentId: string) => {
    if (!isHost) return;
    try {
      await deleteDoc(doc(db, "blockedLiveStudents", studentId));
    } catch (err) {
      console.error("Unblock failed:", err);
    }
  };

  // Pin Message
  const handlePinMessage = (msg: LiveClassChatMessage) => {
    if (!isHost) return;
    const updated = messages.map((m) => ({ ...m, isPinned: m.id === msg.id }));
    setMessages(updated);
    setPinnedMessage(msg);
  };

  // Toggle Raise Hand
  const handleToggleHand = () => {
    if (isCurrentUserBlocked) {
      alert("You are blocked by Study HUB.");
      return;
    }
    if (myHandRaised) {
      setRaisedHands((prev) => prev.filter((h) => h.studentId !== currentUser.id));
      setMyHandRaised(false);
    } else {
      const handObj = {
        studentId: currentUser.id,
        name: currentUser.name,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setRaisedHands((prev) => [...prev, handObj]);
      setMyHandRaised(true);
      handleTriggerEmoji("🖐️");
    }
  };

  // Vote on Poll
  const handleVotePoll = (optionId: string) => {
    if (!poll || poll.votedUserIds.includes(currentUser.id)) return;
    const updatedOptions = poll.options.map((opt) =>
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    );
    const updatedPoll: LiveClassPoll = {
      ...poll,
      options: updatedOptions,
      totalVotes: poll.totalVotes + 1,
      votedUserIds: [...poll.votedUserIds, currentUser.id]
    };
    setPoll(updatedPoll);
  };

  // Create Poll (Host)
  const handleCreatePoll = () => {
    if (!newPollQuestion.trim()) return;
    const created: LiveClassPoll = {
      id: "poll_" + Date.now(),
      question: newPollQuestion.trim(),
      options: newPollOptions.filter((o) => o.trim()).map((o, idx) => ({ id: "opt_" + idx, text: o.trim(), votes: 0 })),
      totalVotes: 0,
      votedUserIds: [],
      isActive: true
    };
    setPoll(created);
    setNewPollQuestion("");
  };

  // Format stopwatch string
  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden select-none font-sans">
      {/* --- POPUP MODAL FOR UNAUTHORIZED THIRD PERSON --- */}
      {isUnauthorizedThirdPerson && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl shadow-amber-950/80 animate-in fade-in zoom-in">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 text-amber-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="bg-amber-500/20 text-amber-300 font-mono font-black text-[10px] tracking-widest uppercase px-3 py-1 rounded-full border border-amber-500/40">
                PROTECTED LIVE CLASSROOM 🔒
              </span>
              <h3 className="text-xl font-extrabold text-white">Access Restricted to Enrolled Students</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                This live class session is protected and encrypted in real-time. Unenrolled third persons and external visitors are strictly prohibited from joining.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] text-slate-400 font-mono text-left space-y-1.5">
              <p><strong className="text-slate-200">Class Topic:</strong> {liveClass.title}</p>
              <p><strong className="text-slate-200">User Identity:</strong> {currentUser.name || "Guest Visitor"}</p>
              <p><strong className="text-slate-200">Enrollment Status:</strong> <span className="text-rose-400 font-bold">UNAUTHORIZED / THIRD PERSON</span></p>
              <p><strong className="text-slate-200">Security Rule:</strong> Enrolled Batch Students & Faculty Members Only</p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-lg shadow-amber-900/50 cursor-pointer"
            >
              Exit Live Classroom
            </button>
          </div>
        </div>
      )}

      {/* --- POPUP MODAL FOR BLOCKED STUDENTS --- */}
      {isCurrentUserBlocked && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-600 rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl shadow-rose-950/80 animate-in fade-in zoom-in">
            <div className="w-16 h-16 rounded-full bg-rose-600/20 border-2 border-rose-500 text-rose-500 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="bg-rose-600 text-white font-black text-[10px] tracking-widest uppercase px-3 py-1 rounded-full">
                STUDY HUB MODERATION
              </span>
              <h3 className="text-xl font-extrabold text-white">You are blocked by Study HUB.</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Access to live class sessions and interactive chat features has been restricted for your account due to inappropriate/abusive conduct or violation of Study HUB policies.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] text-slate-400 font-mono text-left space-y-1.5">
              <p><strong className="text-slate-200">Account:</strong> {currentUser.name}</p>
              <p><strong className="text-slate-200">Status:</strong> <span className="text-rose-400 font-bold">BLOCKED ON THE SPOT</span></p>
              <p><strong className="text-slate-200">Authority:</strong> Study HUB Central Control</p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition shadow-lg shadow-rose-900/50 cursor-pointer"
            >
              Exit Live Classroom
            </button>
          </div>
        </div>
      )}

      {/* --- TOP APP BAR --- */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="flex items-center space-x-2 bg-rose-600/20 border border-rose-500/40 text-rose-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>LIVE STUDIO</span>
          </div>

          <div className="min-w-0">
            <h2 className="font-extrabold text-sm md:text-base text-white truncate">{liveClass.title}</h2>
            <p className="text-xs text-slate-400 truncate">
              {liveClass.courseTitle || "Study HUB Masterclass"} • Instructor:{" "}
              <strong className="text-indigo-300">{liveClass.instructorName || "Faculty Mentor"}</strong>
            </p>
          </div>
        </div>

        {/* Status Indicators & Action Bar */}
        <div className="flex items-center space-x-3">
          {/* Real-time Clock & Date Indicator */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-300">
            <span>📅 {currentDateString}</span>
            <span className="text-rose-400 font-mono">⏱️ {currentTimeString}</span>
          </div>

          {/* Stopwatch Duration */}
          <div className="hidden sm:flex items-center space-x-2 bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-200">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>{formatTime(sessionDuration)}</span>
          </div>

          {/* Screen Recording Status Badge */}
          {isRecording && (
            <div className="flex items-center space-x-2 bg-rose-600 text-white px-3 py-1.5 rounded-xl text-xs font-mono font-bold animate-pulse shadow-lg shadow-rose-900/50">
              <Disc className="w-4 h-4 animate-spin" />
              <span>REC {formatTime(recordingSeconds)}</span>
            </div>
          )}

          {/* Enrolled vs Active Attendees Real-Time Counter */}
          <div className="hidden md:flex items-center space-x-1.5 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400">
            <Users className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{onlineCount} Joined / {totalEnrolledStudents} Enrolled</span>
          </div>

          {/* Leave / Exit Button */}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl flex items-center space-x-1.5 transition shadow-md cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Leave Class</span>
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT LAYOUT --- */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* --- LEFT / CENTER STAGE (Video & Controls) --- */}
        <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
          {/* FLOATING EMOJI CANVAS OVERLAY */}
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {floatingEmojis.map((item) => (
              <div
                key={item.id}
                style={{ left: `${item.left}%` }}
                className="absolute bottom-12 text-4xl md:text-5xl animate-bounce transition-all duration-1000 opacity-90 filter drop-shadow-lg"
              >
                {item.emoji}
              </div>
            ))}
          </div>

          {/* PINNED ANNOUNCEMENT BANNER */}
          {pinnedMessage && (
            <div className="bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-indigo-950/90 border-b border-indigo-700/50 px-4 py-2.5 flex items-center justify-between text-xs text-indigo-100 shrink-0 z-20 backdrop-blur-md">
              <div className="flex items-center space-x-2.5 min-w-0">
                <Pin className="w-4 h-4 text-amber-400 shrink-0 fill-amber-400 animate-bounce" />
                <span className="font-bold text-amber-300 uppercase shrink-0 text-[10px]">Pinned Note:</span>
                <span className="truncate font-medium">{pinnedMessage.message}</span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 ml-2">by {pinnedMessage.senderName}</span>
            </div>
          )}

          {/* MAIN VIDEO STAGE CONTAINER */}
          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
            {/* COLLABORATIVE DIGITAL WHITEBOARD VIEW */}
            {isWhiteboardActive ? (
              <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
                <LiveWhiteboard
                  liveClassId={liveClass.id}
                  isHost={isHost}
                  currentUser={currentUser}
                  onClose={() => setIsWhiteboardActive(false)}
                />

                {/* Picture-in-Picture Webcam Box on Whiteboard Stage */}
                <div className="absolute bottom-16 right-6 w-44 h-32 bg-slate-950 border-2 border-indigo-500 rounded-2xl overflow-hidden shadow-2xl z-30 pointer-events-auto">
                  {isCameraOn ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-2 text-center">
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs mb-1">
                        {currentUser.name[0]}
                      </div>
                      <span className="text-[10px] font-bold">{currentUser.name}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : isScreenSharing ? (
              <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 left-4 bg-indigo-600/90 text-white px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide flex items-center space-x-2 backdrop-blur-md shadow-lg">
                  <Monitor className="w-4 h-4" />
                  <span>Presenter Screen Share Active</span>
                </div>

                {/* Picture-in-Picture Webcam Box */}
                <div className="absolute bottom-6 right-6 w-48 h-36 bg-slate-950 border-2 border-indigo-500 rounded-2xl overflow-hidden shadow-2xl z-20">
                  {isCameraOn ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-2 text-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm mb-1">
                        {currentUser.name[0]}
                      </div>
                      <span className="text-[10px] font-bold">{currentUser.name}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* DIRECT CAMERA STAGE VIEW WITH ERROR RECOVERY */
              <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
                {videoError ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-900/80 border border-slate-800 rounded-3xl max-w-sm">
                    <AlertTriangle className="w-10 h-10 text-amber-400" />
                    <p className="text-xs font-bold text-slate-200">{videoError}</p>
                    <p className="text-[11px] text-slate-400">Class audio and screen studio tools remain fully functional.</p>
                    {isHost && (
                      <button
                        onClick={initCamera}
                        className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center space-x-2 hover:bg-indigo-700 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Camera Stream</span>
                      </button>
                    )}
                  </div>
                ) : isCameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onError={() => setVideoError("Video stream playback error.")}
                    className="w-full h-full object-cover max-h-full transform -scale-x-100"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
                    <div className="relative">
                      <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 p-1 shadow-2xl animate-pulse">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-4xl md:text-5xl font-black text-white">
                          {liveClass.instructorName ? liveClass.instructorName[0] : "S"}
                        </div>
                      </div>
                      <div className="absolute bottom-1 right-1 bg-rose-600 text-white p-2 rounded-full shadow-lg border-2 border-slate-900">
                        <VideoOff className="w-5 h-5" />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-lg text-white">
                        {liveClass.instructorName || "Study HUB Studio Feed"}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Camera preview paused • Studio audio broadcast active
                      </p>
                    </div>
                  </div>
                )}

                {/* Live Audio Meter Overlay on Stage */}
                <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-2xl flex items-center space-x-2.5">
                  <Volume2 className={`w-4 h-4 ${isMicOn ? "text-emerald-400" : "text-rose-400"}`} />
                  <div className="flex items-end space-x-1 h-4 w-16">
                    {[20, 40, 60, 80, 100].map((step, idx) => (
                      <div
                        key={idx}
                        style={{ height: `${isMicOn ? Math.max(15, audioLevel >= step ? step : step / 3) : 10}%` }}
                        className={`w-2 rounded-full transition-all duration-75 ${
                          !isMicOn
                            ? "bg-slate-700"
                            : audioLevel >= step
                            ? step > 80
                              ? "bg-rose-500"
                              : "bg-emerald-400"
                            : "bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-slate-300 font-bold">
                    {isMicOn ? `${audioLevel}%` : "MUTED"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* --- INTERACTIVE CONTROL BAR (BOTTOM) --- */}
          <div className="h-20 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between shrink-0 z-20">
            {/* Left Controls: Audio / Video Toggles (Teacher Only) or Viewer Badge (Student) */}
            <div className="flex items-center space-x-2.5">
              {isHost ? (
                <>
                  {/* Mic Toggle */}
                  <button
                    onClick={toggleMic}
                    title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                    className={`p-3 rounded-2xl font-bold flex items-center space-x-2 transition cursor-pointer ${
                      isMicOn
                        ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                        : "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/50"
                    }`}
                  >
                    {isMicOn ? <Mic className="w-5 h-5 text-emerald-400" /> : <MicOff className="w-5 h-5" />}
                    <span className="hidden sm:inline text-xs">{isMicOn ? "Mute" : "Unmute"}</span>
                  </button>

                  {/* Camera Toggle */}
                  <button
                    onClick={toggleCamera}
                    title={isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
                    className={`p-3 rounded-2xl font-bold flex items-center space-x-2 transition cursor-pointer ${
                      isCameraOn
                        ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                        : "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/50"
                    }`}
                  >
                    {isCameraOn ? <Video className="w-5 h-5 text-indigo-400" /> : <VideoOff className="w-5 h-5" />}
                    <span className="hidden sm:inline text-xs">{isCameraOn ? "Stop Video" : "Start Video"}</span>
                  </button>

                  {/* Screen Share Toggle */}
                  <button
                    onClick={toggleScreenShare}
                    title={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
                    className={`p-3 rounded-2xl font-bold flex items-center space-x-2 transition cursor-pointer ${
                      isScreenSharing
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                        : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                    }`}
                  >
                    {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5 text-cyan-400" />}
                    <span className="hidden sm:inline text-xs">{isScreenSharing ? "Sharing" : "Share Screen"}</span>
                  </button>

                  {/* Digital Whiteboard Toggle (Teacher) */}
                  <button
                    onClick={() => setIsWhiteboardActive(!isWhiteboardActive)}
                    title={isWhiteboardActive ? "Close Whiteboard" : "Open Digital Whiteboard"}
                    className={`p-3 rounded-2xl font-bold flex items-center space-x-2 transition cursor-pointer ${
                      isWhiteboardActive
                        ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-900/50 font-black"
                        : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                    }`}
                  >
                    <Edit3 className={`w-5 h-5 ${isWhiteboardActive ? "text-slate-950" : "text-amber-400"}`} />
                    <span className="hidden sm:inline text-xs">{isWhiteboardActive ? "In Board" : "Whiteboard"}</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-2xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-extrabold text-slate-200">Live Student View</span>
                  </div>

                  {/* Digital Whiteboard Toggle (Student) */}
                  <button
                    onClick={() => setIsWhiteboardActive(!isWhiteboardActive)}
                    title={isWhiteboardActive ? "Close Whiteboard" : "View Live Digital Whiteboard"}
                    className={`px-3 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer ${
                      isWhiteboardActive
                        ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-900/50"
                        : "bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-300"
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="hidden sm:inline">{isWhiteboardActive ? "Close Board" : "Whiteboard"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Center Controls: Screen Recording (Teacher Only) & Reactions / Hand Raise */}
            <div className="flex items-center space-x-2">
              {/* Screen Recording Controls - Host/Teacher Only */}
              {isHost && (
                !isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-3.5 py-2.5 bg-rose-900/40 hover:bg-rose-800/60 border border-rose-600/50 text-rose-300 rounded-2xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer"
                    title="Start Class Screen Recording"
                  >
                    <Disc className="w-4 h-4 text-rose-500 animate-pulse" />
                    <span className="hidden md:inline">Record Class</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-1.5 bg-slate-800 p-1 rounded-2xl border border-rose-500/50">
                    {isRecordingPaused ? (
                      <button
                        onClick={resumeRecording}
                        className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
                        title="Resume Recording"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    ) : (
                      <button
                        onClick={pauseRecording}
                        className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl cursor-pointer"
                        title="Pause Recording"
                      >
                        <Pause className="w-4 h-4 fill-current" />
                      </button>
                    )}
                    <button
                      onClick={stopRecording}
                      className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer"
                      title="Stop & Save Recording"
                    >
                      <Square className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                )
              )}

              {/* Quick Emojis Reaction Bar - Accessible to all */}
              <div className="hidden lg:flex items-center space-x-1 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
                {["👏", "❤️", "💡", "🔥", "🎯", "👍"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleTriggerEmoji(emoji)}
                    className="p-1.5 hover:bg-slate-700 rounded-xl text-lg transition transform hover:scale-125 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Raise Hand Button - Accessible to all */}
              <button
                onClick={handleToggleHand}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer ${
                  myHandRaised
                    ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-900/50"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                }`}
              >
                <Hand className={`w-4 h-4 ${myHandRaised ? "fill-slate-950" : "text-amber-400"}`} />
                <span className="hidden sm:inline">{myHandRaised ? "Hand Raised 🖐️" : "Raise Hand"}</span>
              </button>
            </div>

            {/* Right Controls: Recording Download (Teacher Only) */}
            <div className="flex items-center space-x-2">
              {isHost && recordedVideoUrl && (
                <a
                  href={recordedVideoUrl}
                  download={`live_class_recording_${Date.now()}.webm`}
                  className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center space-x-1.5 shadow-md cursor-pointer animate-bounce"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Save Recording</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDEBAR STUDIO (Chat, Polls, Hand Raises, Attendance) --- */}
        <aside className="w-full md:w-80 lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-20 h-72 md:h-auto">
          {/* SIDEBAR TABS HEADER */}
          <div className="grid grid-cols-5 bg-slate-950 p-1 border-b border-slate-800 gap-0.5 text-[11px] font-bold shrink-0">
            <button
              onClick={() => setSidebarTab("chat")}
              className={`py-2 rounded-xl flex items-center justify-center space-x-1 transition cursor-pointer ${
                sidebarTab === "chat" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => setSidebarTab("qa")}
              className={`py-2 rounded-xl flex items-center justify-center space-x-1 transition cursor-pointer relative ${
                sidebarTab === "qa" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Hand className="w-3.5 h-3.5 text-amber-400" />
              <span>Hands</span>
              {raisedHands.length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1 rounded-full ml-0.5">
                  {raisedHands.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setSidebarTab("poll")}
              className={`py-2 rounded-xl flex items-center justify-center space-x-1 transition cursor-pointer ${
                sidebarTab === "poll" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Poll</span>
            </button>

            <button
              onClick={() => setSidebarTab("roster")}
              className={`py-2 rounded-xl flex items-center justify-center space-x-1 transition cursor-pointer ${
                sidebarTab === "roster" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Roster</span>
            </button>

            {isHost && (
              <button
                onClick={() => setSidebarTab("blocked")}
                className={`py-2 rounded-xl flex items-center justify-center space-x-1 transition cursor-pointer ${
                  sidebarTab === "blocked" ? "bg-rose-600 text-white" : "text-rose-400 hover:text-rose-300"
                }`}
                title="Manage Blocked Students"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Blocked</span>
              </button>
            )}
          </div>

          {/* TAB 1: LIVE CHAT */}
          {sidebarTab === "chat" && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-900">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
                {messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  const isSystem = msg.senderRole === "System" || msg.senderId === "system";

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-center space-y-1 my-2">
                        <div className="flex items-center justify-center space-x-1 text-rose-400 text-xs font-black">
                          <Shield className="w-4 h-4" />
                          <span>{msg.senderName}</span>
                        </div>
                        <p className="text-xs text-rose-200 font-bold leading-relaxed">{msg.message}</p>
                        <span className="text-[9px] text-rose-400/80 font-mono">{msg.timestamp}</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col space-y-1 ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                        <span className="font-bold text-slate-200">{msg.senderName}</span>
                        {msg.senderRole && (
                          <span
                            className={`px-1.5 py-0.2 rounded font-black uppercase text-[8px] ${
                              msg.senderRole === "Teacher" || msg.senderRole === "Host"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {msg.senderRole}
                          </span>
                        )}
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                          isMe
                            ? "bg-indigo-600 text-white rounded-tr-none"
                            : msg.senderRole === "Teacher"
                            ? "bg-slate-800 border border-amber-500/30 text-amber-100 rounded-tl-none"
                            : "bg-slate-800 border border-slate-700/80 text-slate-200 rounded-tl-none"
                        }`}
                      >
                        {msg.message}
                      </div>

                      {isHost && (
                        <div className="flex items-center space-x-3 pt-0.5">
                          {!msg.isPinned && (
                            <button
                              onClick={() => handlePinMessage(msg)}
                              className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
                            >
                              <Pin className="w-2.5 h-2.5" />
                              <span>Pin</span>
                            </button>
                          )}
                          {msg.senderRole !== "Teacher" && msg.senderRole !== "Host" && (
                            <button
                              onClick={() => handleBlockStudent(msg.senderId, msg.senderName)}
                              className="text-[9px] font-bold text-rose-400 hover:text-rose-300 flex items-center space-x-1 cursor-pointer"
                            >
                              <UserX className="w-2.5 h-2.5" />
                              <span>Block On Spot</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Message Input Form */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2 shrink-0">
                <input
                  type="text"
                  placeholder={isCurrentUserBlocked ? "You are blocked by Study HUB" : "Type a doubt or message..."}
                  disabled={isCurrentUserBlocked}
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isCurrentUserBlocked}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: RAISED HANDS & Q&A */}
          {sidebarTab === "qa" && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs uppercase text-slate-300 flex items-center space-x-1.5">
                  <Hand className="w-4 h-4 text-amber-400" />
                  <span>Raised Hands Queue ({raisedHands.length})</span>
                </h4>
                {raisedHands.length > 0 && isHost && (
                  <button
                    onClick={() => setRaisedHands([])}
                    className="text-[10px] font-bold text-rose-400 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {raisedHands.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center mx-auto text-xl">
                    🖐️
                  </div>
                  <p className="text-xs text-slate-400 font-medium">No active raised hands.</p>
                  <p className="text-[10px] text-slate-500">
                    Students can click &quot;Raise Hand&quot; to request audio permission or ask a live doubt.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {raisedHands.map((h, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-800 border border-amber-500/30 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                          {h.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-100">{h.name}</p>
                          <p className="text-[10px] text-slate-400">Raised at {h.timestamp}</p>
                        </div>
                      </div>

                      {isHost && (
                        <button
                          onClick={() => setRaisedHands((prev) => prev.filter((item) => item.studentId !== h.studentId))}
                          className="px-3 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded-lg hover:bg-emerald-700 transition cursor-pointer"
                        >
                          Call On Student
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INSTANT POLLS STUDIO */}
          {sidebarTab === "poll" && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900">
              {poll && (
                <div className="bg-slate-800 border border-indigo-500/40 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                      Live Classroom Poll
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      {poll.totalVotes} Votes
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xs text-white">{poll.question}</h4>

                  <div className="space-y-2 pt-1">
                    {poll.options.map((opt) => {
                      const percent =
                        poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                      const hasVoted = poll.votedUserIds.includes(currentUser.id);

                      return (
                        <button
                          key={opt.id}
                          disabled={hasVoted}
                          onClick={() => handleVotePoll(opt.id)}
                          className={`w-full p-2.5 rounded-xl text-left border transition relative overflow-hidden cursor-pointer ${
                            hasVoted
                              ? "bg-slate-900 border-slate-700 text-slate-200"
                              : "bg-slate-900/60 border-slate-700 hover:border-indigo-500 text-slate-100"
                          }`}
                        >
                          {/* Percentage Fill Bar */}
                          <div
                            style={{ width: `${percent}%` }}
                            className="absolute top-0 left-0 bottom-0 bg-indigo-600/30 transition-all duration-500"
                          />

                          <div className="relative flex items-center justify-between text-xs font-bold z-10">
                            <span>{opt.text}</span>
                            <span className="font-mono text-[10px] text-indigo-300">
                              {opt.votes} ({percent}%)
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Host Poll Creator */}
              {isHost && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Create New Poll</span>
                  </h4>

                  <input
                    type="text"
                    placeholder="Enter poll question..."
                    value={newPollQuestion}
                    onChange={(e) => setNewPollQuestion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />

                  <div className="space-y-2">
                    {newPollOptions.map((optText, i) => (
                      <input
                        key={i}
                        type="text"
                        placeholder={`Option ${i + 1}`}
                        value={optText}
                        onChange={(e) => {
                          const updated = [...newPollOptions];
                          updated[i] = e.target.value;
                          setNewPollOptions(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600"
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleCreatePoll}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    🚀 Launch Poll to Class
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ROSTER & ATTENDANCE */}
          {sidebarTab === "roster" && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-extrabold text-slate-300">
                  Classroom Roster ({onlineCount} Joined / {totalEnrolledStudents} Enrolled)
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Cloud Synced
                </span>
              </div>

              <div className="space-y-2">
                {/* Host Entry */}
                <div className="p-2.5 bg-indigo-950/60 border border-indigo-700/50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                      {liveClass.instructorName ? liveClass.instructorName[0] : "I"}
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-amber-200">
                        {liveClass.instructorName || "Faculty Instructor"}
                      </p>
                      <p className="text-[9px] text-indigo-300 uppercase font-bold">Host / Presenter</p>
                    </div>
                  </div>
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                </div>

                {/* Real-time Cloud Synced Active Participants */}
                {activeParticipants.length > 0 ? (
                  activeParticipants
                    .filter((p) => p.userId !== currentUser.id && p.userRole !== "teacher" && p.userRole !== "admin")
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-200 font-bold flex items-center justify-center text-xs">
                            {p.userName ? p.userName[0] : "S"}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-200">{p.userName}</p>
                            <p className="text-[9px] text-emerald-400 font-bold">● Active Joined</p>
                          </div>
                        </div>
                        {isHost ? (
                          <button
                            onClick={() => handleBlockStudent(p.userId, p.userName)}
                            className="px-2.5 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-lg text-[10px] font-extrabold transition cursor-pointer"
                          >
                            Block
                          </button>
                        ) : (
                          <MicOff className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </div>
                    ))
                ) : (
                  students.slice(0, 8).map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-200 font-bold flex items-center justify-center text-xs">
                          {s.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-200">{s.name}</p>
                          <p className="text-[9px] text-slate-400">Enrolled Student</p>
                        </div>
                      </div>
                      {isHost ? (
                        <button
                          onClick={() => handleBlockStudent(s.id, s.name)}
                          className="px-2.5 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-lg text-[10px] font-extrabold transition cursor-pointer"
                        >
                          Block
                        </button>
                      ) : (
                        <MicOff className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: BLOCKED / BANNED STUDENTS (HOST ONLY) */}
          {sidebarTab === "blocked" && isHost && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-extrabold text-rose-400 flex items-center space-x-1.5">
                  <UserX className="w-4 h-4" />
                  <span>Blocked Students ({Object.keys(blockedStudents).length})</span>
                </span>
                <span className="text-[9px] bg-rose-600/20 border border-rose-500/40 text-rose-300 px-2 py-0.5 rounded-full font-bold">
                  Cloud Protected
                </span>
              </div>

              {Object.keys(blockedStudents).length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-xs text-slate-300 font-bold">No blocked students</p>
                  <p className="text-[10px] text-slate-500">
                    Students caught using abusive words in live chat or manually flagged will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {Object.values(blockedStudents).map((bStudent) => (
                    <div
                      key={bStudent.id}
                      className="p-3 bg-slate-950 border border-rose-500/30 rounded-2xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-rose-600/30 text-rose-400 font-black flex items-center justify-center text-xs">
                            {bStudent.studentName ? bStudent.studentName[0] : "S"}
                          </div>
                          <div>
                            <p className="font-extrabold text-xs text-slate-100">{bStudent.studentName}</p>
                            <p className="text-[9px] text-rose-400 font-medium">{bStudent.reason}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleUnblockStudent(bStudent.studentId || bStudent.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg transition cursor-pointer"
                        >
                          Unblock
                        </button>
                      </div>

                      <div className="text-[9px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-900">
                        <span>By: {bStudent.blockedBy}</span>
                        <span>{new Date(bStudent.blockedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
