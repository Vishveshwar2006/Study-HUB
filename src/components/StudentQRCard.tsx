import React from "react";
import { GraduationCap, Award, ShieldCheck, Download, Check } from "lucide-react";
import { Student } from "../types";

interface StudentQRCardProps {
  student: Student;
  compact?: boolean;
}

// Simple deterministic hash to generate a believable dynamic QR pattern
function getDeterministicQRGrid(text: string): boolean[][] {
  const size = 15;
  const grid: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));

  // Helper to draw position locator boxes
  const drawLocator = (x: number, y: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (isBorder || isCenter) {
          grid[y + r][x + c] = true;
        }
      }
    }
  };

  // Draw 3 position locator markers on corners
  drawLocator(0, 0);       // Top-left
  drawLocator(8, 0);       // Top-right
  drawLocator(0, 8);       // Bottom-left

  // Fill the rest deterministically using a string hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite the locators
      const inTopLeft = r < 7 && c < 7;
      const inTopRight = r < 7 && c >= 8;
      const inBottomLeft = r >= 8 && c < 7;
      
      if (!inTopLeft && !inTopRight && !inBottomLeft) {
        // Deterministic pseudo-random noise based on index and hash
        const val = Math.abs(Math.sin(hash + r * 13 + c * 37));
        grid[r][c] = val > 0.45;
      }
    }
  }

  return grid;
}

export function QRCodeComponent({ value, size = 130 }: { value: string; size?: number }) {
  const grid = getDeterministicQRGrid(value);
  const gridSize = grid.length;

  return (
    <div 
      className="bg-white p-2 rounded-2xl border border-slate-200 inline-block shadow-sm"
      style={{ width: size, height: size }}
    >
      <div 
        className="grid gap-0.5 w-full h-full"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {grid.map((row, rIdx) =>
          row.map((active, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              className={`rounded-xs transition-colors duration-150 ${
                active ? "bg-slate-900 dark:bg-slate-900" : "bg-transparent"
              }`}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function StudentQRCard({ student, compact = false }: StudentQRCardProps) {
  const [downloaded, setDownloaded] = React.useState(false);
  const qrString = student.rollNo;

  const handleDownloadCard = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
    // Open print view or write dynamic message showing it saved
    const cardContent = JSON.stringify({
      title: "Study Hub Attendance Pass",
      rollNo: student.rollNo,
      name: student.name,
      avatar: student.avatar,
      qrToken: qrString,
    }, null, 2);
    
    // Download as virtual pass file
    const element = document.createElement("a");
    const file = new Blob([cardContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${student.name.replace(/\s+/g, '_')}_Academic_QR_Pass.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (compact) {
    return (
      <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-205 flex items-center justify-between gap-4 font-sans">
        <div className="flex items-center space-x-3">
          <QRCodeComponent value={qrString} size={70} />
          <div>
            <span className="text-[9px] bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded font-bold font-mono">
              {student.rollNo}
            </span>
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{student.name}</h5>
            <p className="text-[10px] text-slate-400">Attendance Scan Token</p>
          </div>
        </div>
        <button
          onClick={handleDownloadCard}
          className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-100 dark:border-slate-700 cursor-pointer transition-all"
          title="Download digital pass config"
        >
          {downloaded ? <Check className="w-4 h-4 text-emerald-500" /> : <Download className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[340px] mx-auto bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative group font-sans no-print">
      {/* Dynamic graphic header decoration */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 -z-0 opacity-90" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
      
      {/* Front of Card */}
      <div className="relative p-6 space-y-6 pt-5">
        {/* Card Header branding */}
        <div className="flex justify-between items-center z-10 relative">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div className="leading-none text-left">
              <span className="text-[11px] font-black tracking-widest text-indigo-100 block uppercase">APEX STATE</span>
              <span className="text-[8px] font-bold tracking-wider text-indigo-300 block uppercase">COLLEGE PASS</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 py-0.5 px-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[8px] text-emerald-300 font-bold uppercase tracking-wider">SECURE RFID</span>
          </div>
        </div>

        {/* Student personal details */}
        <div className="flex items-start justify-between gap-4 pt-4 relative z-10 text-left">
          <div className="space-y-3.5 flex-1">
            <div className="space-y-1">
              <span className="text-[8px] uppercase font-bold tracking-widest text-indigo-300 block">Student Name</span>
              <h4 className="text-sm font-black text-white uppercase tracking-tight">{student.name}</h4>
              <span className="text-[9px] text-slate-400 truncate max-w-[150px] inline-block font-mono">{student.email}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[7.5px] uppercase font-bold tracking-wider text-slate-500 block">Roll Registry</span>
                <span className="text-xs font-bold font-mono text-indigo-300">{student.rollNo}</span>
              </div>
              <div>
                <span className="text-[7.5px] uppercase font-bold tracking-wider text-slate-500 block">Enroll Status</span>
                <span className="text-[9px] font-bold text-emerald-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 mr-0.5 shrink-0 inline" />
                  <span>Verified</span>
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 text-indigo-400 border border-slate-705 flex items-center justify-center font-mono text-sm font-extrabold uppercase shrink-0 shadow-inner">
              {student.name ? student.name.substring(0, 2) : "ST"}
            </div>
            <span className="text-[7.5px] font-bold tracking-widest text-slate-500 mt-2 uppercase">LIFETIME PASS</span>
          </div>
        </div>

        {/* Real-time Dynamic QR Frame */}
        <div className="pt-2 flex flex-col items-center justify-center space-y-3 border-t border-slate-900">
          <QRCodeComponent value={qrString} size={110} />
          
          <div className="text-center">
            <p className="text-[9px] text-slate-500 font-medium font-sans">
              Scan this card to record classroom <br /> daily attendance instantly.
            </p>
          </div>
        </div>

        {/* Download Action Footer */}
        <div className="pt-2">
          <button
            onClick={handleDownloadCard}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all text-white font-bold text-[9px] uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 border border-indigo-500/30 cursor-pointer shadow-md select-none"
          >
            {downloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Card Exported! (.json)</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Digital Attendance Card</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
