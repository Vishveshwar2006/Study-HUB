import React, { useState, useEffect } from "react";
import { 
  Scan, Camera, ShieldCheck, XCircle, Info, CheckSquare, 
  HelpCircle, Sparkles, User, Fingerprint, RefreshCw, Upload, FileText, CheckCircle2 
} from "lucide-react";
import { Student } from "../types";

interface QRCardScannerProps {
  students: Student[];
  onScanSuccess: (student: Student, scannedDataRaw: string) => void;
  title?: string;
  subtitle?: string;
  allowedActionsDescription?: string;
}

// Function to play sound effects using standard Web Audio APIs
function playScanSucceedBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Create oscillator and gain node
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch A5 letter note
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch (e) {
    console.warn("Web Audio API not supported/allowed yet:", e);
  }
}

export default function QRCardScanner({ 
  students, 
  onScanSuccess, 
  title = "Unified QR Card Scanner Desk",
  subtitle = "Scan official student cards to record class attendance, verify educational codes, or access fee payment ledger details.",
  allowedActionsDescription
}: QRCardScannerProps) {
  const [selectedSimStudentId, setSelectedSimStudentId] = useState<string>("");
  const [scannerStatus, setScannerStatus] = useState<"idle" | "ready" | "scanning" | "success" | "error">("ready");
  const [scannedMessage, setScannedMessage] = useState<string>("");
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null);
  const [scanningLineY, setScanningLineY] = useState<number>(10);
  const [scanAttemptsLog, setScanAttemptsLog] = useState<{ time: string; name: string; roll: string; status: "Approved" | "Failure" }[]>([]);

  // Scanning laser animation loop
  useEffect(() => {
    if (scannerStatus === "scanning") {
      const interval = setInterval(() => {
        setScanningLineY(prev => {
          if (prev >= 90) return 10;
          return prev + 5;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [scannerStatus]);

  // Handle Drag-and-Drop or direct File upload parsing of pass .json
  const handlePassFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScannerStatus("scanning");
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);
        
        if (data && data.qrToken) {
          triggerScanAction(data.qrToken);
        } else {
          showError("Invalid Card Pass format. Missing registration QR token!");
        }
      } catch (err) {
        showError("Invalid JSON card file layout.");
      }
    };
    reader.readAsText(file);
  };

  const showError = (msg: string) => {
    setScannerStatus("error");
    setScannedMessage(msg);
    setTimeout(() => {
      setScannerStatus("ready");
      setScannedMessage("");
    }, 4000);
  };

  // Perform card matching process
  const triggerScanAction = (qrTokenRaw: string) => {
    setScannerStatus("scanning");
    setScannedMessage("Parsing QR modulation grid...");
    setScannedStudent(null);

    setTimeout(() => {
      let found = undefined;
      const trimmed = qrTokenRaw.trim();
      const parts = trimmed.split("::");
      if (parts.length >= 3 && (parts[0] === "physics-student" || parts[0] === "college-student")) {
        const id = parts[1];
        const roll = parts[2];
        found = students.find(s => s.id === id || s.rollNo === roll);
      } else {
        found = students.find(s => s.rollNo.toUpperCase() === trimmed.toUpperCase() || s.id === trimmed);
      }

      if (!found) {
        setScannerStatus("error");
        setScannedMessage(`Unknown token or roll number "${trimmed}". Re-verify the card.`);
        return;
      }
      if (found) {
        if (found.status === "Inactive") {
          setScannerStatus("error");
          setScannedMessage(`Deactivated roll number: "${found.rollNo}". Access blocked.`);
          setScanAttemptsLog(prev => [
            { time: new Date().toLocaleTimeString(), name: found.name, roll: found.rollNo, status: "Failure" },
            ...prev.slice(0, 5)
          ]);
          return;
        }

        // Play authentic High-Tech confirmation feedback sound
        playScanSucceedBeep();

        setScannerStatus("success");
        setScannedStudent(found);
        setScannedMessage(`Student Identity verified successfully: ${found.name}`);
        
        // Push scan history logs
        setScanAttemptsLog(prev => [
          { time: new Date().toLocaleTimeString(), name: found.name, roll: found.rollNo, status: "Approved" },
          ...prev.slice(0, 5)
        ]);

        // Trigger parent callback hook
        onScanSuccess(found, qrTokenRaw);

        // Reset to ready after visual duration
        setTimeout(() => {
          setScannerStatus("ready");
        }, 5000);

      } else {
        setScannerStatus("error");
        setScannedMessage("Student profile record not found in registered academic rosters.");
      }
    }, 1200); // realistic diagnostic delay
  };

  // Direct swipe action from selectors
  const handleSimulateSwipe = () => {
    if (!selectedSimStudentId) return;
    const student = students.find(s => s.id === selectedSimStudentId);
    if (!student) return;

    const mockToken = `physics-student::${student.id}::${student.rollNo}`;
    triggerScanAction(mockToken);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6 text-left font-sans">
      
      {/* Title & Badge */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Scan className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {title}
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
        {allowedActionsDescription && (
          <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-extrabold uppercase px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900 leading-none">
            {allowedActionsDescription}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Dynamic Holographic Visual camera lens frame */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-950 rounded-2xl p-6 border border-slate-800 relative overflow-hidden min-h-[280px]">
          {/* Viewfinder borders */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-indigo-400 rounded-tl-md" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-indigo-400 rounded-tr-md" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-indigo-400 rounded-bl-md" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-indigo-400 rounded-br-md" />
          
          <div className="absolute top-0 right-0 p-3 flex space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[7.5px] font-mono tracking-widest text-slate-500 uppercase font-bold">LIVE REC</span>
          </div>

          {/* Central QR scanning feedback element */}
          <div className="space-y-4 text-center z-10 w-full">
            {scannerStatus === "scanning" && (
              <div className="space-y-3 relative flex flex-col items-center justify-center h-44">
                {/* Visual laser overlay line */}
                <div 
                  className="absolute left-4 right-4 h-0.5 bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_8px_2px_rgba(99,102,241,0.5)] transition-all ease-linear pointer-events-none" 
                  style={{ top: `${scanningLineY}%` }}
                />
                <Camera className="w-10 h-10 text-indigo-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-indigo-300 animate-pulse">READING QR DECRYPT CODE...</span>
              </div>
            )}

            {scannerStatus === "ready" && (
              <div className="space-y-3 py-6 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-1">
                  <Fingerprint className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-[11px] font-medium text-slate-400 select-none">
                  Awaiting RFID Card or Digital JSON Key Pass...
                </p>
                <div className="text-[9px] text-slate-650 italic">
                  Show student card to Camera/Lens or upload file
                </div>
              </div>
            )}

            {scannerStatus === "success" && scannedStudent && (
              <div className="space-y-3 py-4 animate-scaleUp">
                <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-md">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <div className="text-center font-sans">
                  <span className="inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase rounded tracking-wider mb-1.5">
                    CARD MATCH SUCCESS
                  </span>
                  <p className="text-sm font-black text-white uppercase tracking-tight">{scannedStudent.name}</p>
                  <p className="text-xs text-indigo-300 font-mono mt-0.5">{scannedStudent.rollNo}</p>
                </div>
              </div>
            )}

            {scannerStatus === "error" && (
              <div className="space-y-3 py-4 animate-fadeIn">
                <div className="h-16 w-16 bg-rose-500/10 border border-rose-500 rounded-full flex items-center justify-center mx-auto text-rose-400">
                  <XCircle className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <span className="inline-block px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[9px] font-bold uppercase rounded tracking-wider mb-1.5">
                    DECRYPT REJECTED
                  </span>
                  <p className="text-xs text-rose-300 font-medium px-4 leading-relaxed">{scannedMessage}</p>
                </div>
              </div>
            )}
          </div>

          {/* Lens overlay sweep reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
        </div>

        {/* Swipe Simulater Controls, File Drop options and History entries */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* 1. Quick Simulating Swipe Panel */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-105 space-y-2.5">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Collegiate Simulator: Swiping Academic ID Card
                </h5>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                For rapid testing, select any of the active academy students to simulate showing their physical unique QR code card directly under the terminal scanner:
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedSimStudentId}
                  onChange={(e) => setSelectedSimStudentId(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 flex-1 dark:bg-slate-900"
                >
                  <option value="">-- Choose student card to swipe --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNo}) [{s.status}]
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSimulateSwipe}
                  disabled={!selectedSimStudentId}
                  className={`px-4 py-2 font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer  ${
                    selectedSimStudentId 
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs" 
                      : "bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed"
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Simulate Swipe</span>
                </button>
              </div>
            </div>

            {/* 2. Drag & Drop Card Pass file upload (.json) */}
            <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900 text-center relative flex hover:bg-slate-50 transition-colors">
              <label className="flex items-center justify-center space-x-2.5 w-full cursor-pointer text-xs font-semibold py-1">
                <Upload className="w-4 h-4 text-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300 font-sans">
                  Drop Student <code className="bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded text-indigo-500 font-mono text-[9px]">_QR_Pass.json</code> file to scan card
                </span>
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handlePassFileUpload}
                  className="hidden" 
                />
              </label>
            </div>

          </div>

          {/* 3. Live scan attempts dashboard */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-105 p-3 rounded-lg flex-1 min-h-[100px] flex flex-col justify-between">
            <h6 className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-2 flex items-center justify-between">
              <span>Terminal Scan Log History (Live)</span>
              <span className="font-mono text-slate-400">Online</span>
            </h6>
            
            {scanAttemptsLog.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-4">
                <span className="text-[10px] text-slate-400 italic font-sans font-medium">No recent cards swiped through the reader.</span>
              </div>
            ) : (
              <div className="space-y-1.5 flex-1 max-h-[90px] overflow-y-auto w-full text-xs font-sans">
                {scanAttemptsLog.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-lg text-[10px] shadow-2xs font-semibold">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 font-mono">{log.time}</span>
                      <span className="text-slate-800 dark:text-slate-200">{log.name}</span>
                      <span className="text-[8px] bg-slate-100 dark:bg-slate-950 text-slate-400 font-mono px-1.5 rounded">{log.roll}</span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded uppercase text-[7.5px] font-extrabold tracking-wider ${
                      log.status === "Approved" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {log.status === "Approved" ? "✔ MATCHED" : "✘ REJECTED"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
