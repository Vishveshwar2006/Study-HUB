import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Pencil,
  Highlighter,
  Type,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Eraser,
  RotateCcw,
  Trash2,
  Download,
  Palette,
  Grid,
  Lock,
  Unlock,
  Sparkles,
  Maximize2,
  Minimize2,
  User,
  X
} from "lucide-react";
import { db } from "../firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export interface WhiteboardStroke {
  id: string;
  type: "pen" | "highlighter" | "eraser" | "shape" | "text";
  shapeType?: "rectangle" | "circle" | "line" | "arrow";
  points: { x: number; y: number }[]; // Normalized 0..1 coordinates
  color: string;
  width: number;
  text?: string;
  authorName?: string;
  authorRole?: string;
  timestamp: number;
}

interface LiveWhiteboardProps {
  liveClassId: string;
  isHost: boolean;
  currentUser: {
    id: string;
    name: string;
    role?: string;
  };
  onClose?: () => void;
}

const COLOR_PRESETS = [
  "#FFFFFF", // White
  "#FACC15", // Yellow
  "#22D3EE", // Cyan
  "#F43F5E", // Rose/Red
  "#10B981", // Emerald/Green
  "#A855F7", // Purple
  "#FB923C", // Orange
  "#000000"  // Black
];

const STROKE_WIDTHS = [
  { label: "Fine", value: 2 },
  { label: "Medium", value: 5 },
  { label: "Thick", value: 10 },
  { label: "Heavy", value: 18 }
];

const BOARD_BACKGROUNDS = [
  { id: "dark", label: "Dark Studio", bg: "#0f172a", strokeDefault: "#FFFFFF" },
  { id: "green", label: "Chalkboard", bg: "#064e3b", strokeDefault: "#FFFFFF" },
  { id: "white", label: "Whiteboard", bg: "#ffffff", strokeDefault: "#0f172a" },
  { id: "grid", label: "Grid Paper", bg: "#1e293b", strokeDefault: "#22D3EE", showGrid: true }
];

export default function LiveWhiteboard({
  liveClassId,
  isHost,
  currentUser,
  onClose
}: LiveWhiteboardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Whiteboard Remote State
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>([]);
  const [boardBg, setBoardBg] = useState<string>("#0f172a");
  const [allowStudentDraw, setAllowStudentDraw] = useState<boolean>(false);
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string>("");

  // Local Tool State
  const [activeTool, setActiveTool] = useState<
    "pen" | "highlighter" | "eraser" | "shape" | "text"
  >("pen");
  const [activeShape, setActiveShape] = useState<
    "rectangle" | "circle" | "line" | "arrow"
  >("rectangle");
  const [strokeColor, setStrokeColor] = useState<string>("#FACC15");
  const [strokeWidth, setStrokeWidth] = useState<number>(5);
  const [showGridLines, setShowGridLines] = useState<boolean>(true);

  // Drawing in progress state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);

  // Text Insertion Overlay
  const [activeTextInput, setActiveTextInput] = useState<{
    x: number;
    y: number;
    normX: number;
    normY: number;
    text: string;
  } | null>(null);

  // Fullscreen Toggle
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Determine if user can draw
  const canDraw = isHost || allowStudentDraw;

  // Sync with Firestore Real-time Document
  useEffect(() => {
    if (!liveClassId) return;

    const docRef = doc(db, "liveClassWhiteboards", liveClassId);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.strokes)) {
            setStrokes(data.strokes);
          }
          if (data.backgroundColor) {
            setBoardBg(data.backgroundColor);
          }
          if (typeof data.allowStudentDraw === "boolean") {
            setAllowStudentDraw(data.allowStudentDraw);
          }
          if (data.updatedBy) {
            setLastUpdatedBy(data.updatedBy);
          }
        }
      },
      (error) => {
        console.warn("Whiteboard Firestore sync warning:", error);
      }
    );

    return () => unsubscribe();
  }, [liveClassId]);

  // Save changes to Firestore
  const saveWhiteboardToCloud = async (
    newStrokes: WhiteboardStroke[],
    newBg?: string,
    newAllowDraw?: boolean
  ) => {
    if (!liveClassId) return;
    try {
      const docRef = doc(db, "liveClassWhiteboards", liveClassId);
      const rawPayload = {
        liveClassId,
        strokes: newStrokes,
        backgroundColor: newBg !== undefined ? newBg : (boardBg || "#0f172a"),
        allowStudentDraw: newAllowDraw !== undefined ? newAllowDraw : Boolean(allowStudentDraw),
        updatedAt: Date.now(),
        updatedBy: currentUser?.name || "User"
      };
      // Clean undefined properties using JSON serialization
      const cleanPayload = JSON.parse(JSON.stringify(rawPayload));
      await setDoc(docRef, cleanPayload, { merge: true });
    } catch (err) {
      console.error("Error updating whiteboard in cloud:", err);
    }
  };

  // Render Canvas Drawing
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Fill Background
    ctx.fillStyle = boardBg;
    ctx.fillRect(0, 0, width, height);

    // Draw Grid Lines if enabled
    if (showGridLines && (boardBg === "#1e293b" || boardBg === "#0f172a" || boardBg === "#064e3b")) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (showGridLines && boardBg === "#ffffff") {
      ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Helper to render stroke
    const renderStroke = (stroke: WhiteboardStroke, livePoints?: { x: number; y: number }[]) => {
      const pointsToUse = livePoints || stroke.points;
      if (!pointsToUse || pointsToUse.length === 0) return;

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (stroke.type === "highlighter") {
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width * 2.5;
      } else if (stroke.type === "eraser") {
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = boardBg;
        ctx.lineWidth = stroke.width * 3;
      } else if (stroke.type === "pen") {
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
      } else if (stroke.type === "shape") {
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
      }

      if (stroke.type === "pen" || stroke.type === "highlighter" || stroke.type === "eraser") {
        if (pointsToUse.length === 1) {
          const pt = pointsToUse[0];
          ctx.beginPath();
          ctx.arc(pt.x * width, pt.y * height, stroke.width / 2, 0, Math.PI * 2);
          ctx.fillStyle = stroke.type === "eraser" ? boardBg : stroke.color;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(pointsToUse[0].x * width, pointsToUse[0].y * height);
          for (let i = 1; i < pointsToUse.length; i++) {
            const pt = pointsToUse[i];
            ctx.lineTo(pt.x * width, pt.y * height);
          }
          ctx.stroke();
        }
      } else if (stroke.type === "shape" && pointsToUse.length >= 2) {
        const start = pointsToUse[0];
        const end = pointsToUse[pointsToUse.length - 1];
        const x1 = start.x * width;
        const y1 = start.y * height;
        const x2 = end.x * width;
        const y2 = end.y * height;

        ctx.beginPath();
        if (stroke.shapeType === "rectangle") {
          ctx.rect(x1, y1, x2 - x1, y2 - y1);
        } else if (stroke.shapeType === "circle") {
          const radius = Math.hypot(x2 - x1, y2 - y1);
          ctx.arc(x1, y1, radius, 0, Math.PI * 2);
        } else if (stroke.shapeType === "line") {
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        } else if (stroke.shapeType === "arrow") {
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const headLen = Math.max(12, stroke.width * 2.5);
          ctx.lineTo(
            x2 - headLen * Math.cos(angle - Math.PI / 6),
            y2 - headLen * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(x2, y2);
          ctx.lineTo(
            x2 - headLen * Math.cos(angle + Math.PI / 6),
            y2 - headLen * Math.sin(angle + Math.PI / 6)
          );
        }
        ctx.stroke();
      } else if (stroke.type === "text" && stroke.text && pointsToUse.length > 0) {
        const pt = pointsToUse[0];
        const fontPx = Math.max(16, stroke.width * 4);
        ctx.font = `bold ${fontPx}px Inter, sans-serif`;
        ctx.fillStyle = stroke.color;
        ctx.textBaseline = "top";
        ctx.fillText(stroke.text, pt.x * width, pt.y * height);
      }

      ctx.restore();
    };

    // Render all saved strokes
    strokes.forEach((s) => renderStroke(s));

    // Render current active drawing stroke
    if (isDrawing && currentPoints.length > 0) {
      renderStroke(
        {
          id: "temp",
          type: activeTool,
          shapeType: activeShape,
          points: currentPoints,
          color: strokeColor,
          width: strokeWidth,
          timestamp: Date.now()
        },
        currentPoints
      );
    }
  }, [strokes, boardBg, showGridLines, isDrawing, currentPoints, activeTool, activeShape, strokeColor, strokeWidth]);

  // Auto Resize Canvas to Match Container Size
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (container && canvas) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        redrawCanvas();
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Pointer / Mouse Event Handlers
  const getNormalizedPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    return { x, y, pixelX: clientX - rect.left, pixelY: clientY - rect.top };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canDraw) return;
    const { x, y, pixelX, pixelY } = getNormalizedPos(e);

    if (activeTool === "text") {
      setActiveTextInput({
        x: pixelX,
        y: pixelY,
        normX: x,
        normY: y,
        text: ""
      });
      return;
    }

    setIsDrawing(true);
    setCurrentPoints([{ x, y }]);
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canDraw) return;
    const { x, y } = getNormalizedPos(e);

    if (activeTool === "shape") {
      // Shape only updates end point
      setCurrentPoints((prev) => [prev[0], { x, y }]);
    } else {
      setCurrentPoints((prev) => [...prev, { x, y }]);
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing || !canDraw) return;
    setIsDrawing(false);

    if (currentPoints.length > 0) {
      const newStroke: WhiteboardStroke = {
        id: "stroke_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        type: activeTool,
        shapeType: activeTool === "shape" ? activeShape : undefined,
        points: currentPoints,
        color: strokeColor,
        width: strokeWidth,
        authorName: currentUser.name,
        authorRole: isHost ? "Teacher" : "Student",
        timestamp: Date.now()
      };

      const updated = [...strokes, newStroke];
      setStrokes(updated);
      saveWhiteboardToCloud(updated);
    }

    setCurrentPoints([]);
  };

  // Submit Text Input
  const handleAddText = () => {
    if (!activeTextInput || !activeTextInput.text.trim()) {
      setActiveTextInput(null);
      return;
    }

    const newStroke: WhiteboardStroke = {
      id: "text_" + Date.now(),
      type: "text",
      points: [{ x: activeTextInput.normX, y: activeTextInput.normY }],
      color: strokeColor,
      width: strokeWidth,
      text: activeTextInput.text.trim(),
      authorName: currentUser.name,
      authorRole: isHost ? "Teacher" : "Student",
      timestamp: Date.now()
    };

    const updated = [...strokes, newStroke];
    setStrokes(updated);
    saveWhiteboardToCloud(updated);
    setActiveTextInput(null);
  };

  // Actions
  const handleUndo = () => {
    if (strokes.length === 0 || !canDraw) return;
    const updated = strokes.slice(0, -1);
    setStrokes(updated);
    saveWhiteboardToCloud(updated);
  };

  const handleClearBoard = () => {
    if (!isHost) return;
    if (!confirm("Are you sure you want to clear the entire whiteboard?")) return;
    setStrokes([]);
    saveWhiteboardToCloud([]);
  };

  const handleDownloadBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `studyhub_live_whiteboard_${Date.now()}.png`;
    link.click();
  };

  const handleChangeBackground = (bgHex: string) => {
    if (!isHost) return;
    setBoardBg(bgHex);
    saveWhiteboardToCloud(strokes, bgHex);
  };

  const handleToggleStudentDraw = () => {
    if (!isHost) return;
    const nextVal = !allowStudentDraw;
    setAllowStudentDraw(nextVal);
    saveWhiteboardToCloud(strokes, undefined, nextVal);
  };

  return (
    <div className={`relative w-full h-full flex flex-col bg-slate-950 overflow-hidden font-sans select-none ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      {/* TOP HEADER BAR */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold text-white">Interactive Live Whiteboard</h3>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Real-Time Synced</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {lastUpdatedBy ? `Last updated by ${lastUpdatedBy}` : "Collaborative digital chalkboard for equations, notes, & diagrams"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* TEACHER PERMISSION TOGGLE: ALLOW STUDENTS TO DRAW */}
          {isHost ? (
            <button
              onClick={handleToggleStudentDraw}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer border ${
                allowStudentDraw
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
              title="Toggle student drawing permissions"
            >
              {allowStudentDraw ? <Unlock className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">
                {allowStudentDraw ? "Students Can Draw" : "Student Draw Off"}
              </span>
            </button>
          ) : (
            <div className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center space-x-1">
              {allowStudentDraw ? (
                <>
                  <Unlock className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-extrabold">Student Draw Enabled</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>View Only Mode</span>
                </>
              )}
            </div>
          )}

          {/* Download PNG */}
          <button
            onClick={handleDownloadBoard}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition cursor-pointer"
            title="Download Whiteboard Image"
          >
            <Download className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Toggle Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-rose-900/40 hover:bg-rose-700 text-rose-300 border border-rose-600/50 rounded-xl transition cursor-pointer"
              title="Close Whiteboard"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* MAIN CANVAS AREA */}
      <div ref={containerRef} className="flex-1 relative w-full h-full overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="w-full h-full block"
        />

        {/* OVERLAY TEXT INPUT MODAL / BOX */}
        {activeTextInput && (
          <div
            style={{ left: activeTextInput.x, top: activeTextInput.y }}
            className="absolute z-30 transform -translate-x-2 -translate-y-2 bg-slate-900 border-2 border-indigo-500 p-2.5 rounded-2xl shadow-2xl flex flex-col space-y-2 min-w-56"
          >
            <div className="flex items-center justify-between text-[10px] text-indigo-400 font-bold uppercase">
              <span>Add Whiteboard Text</span>
              <button onClick={() => setActiveTextInput(null)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="text"
              autoFocus
              placeholder="Type note, equation, or heading..."
              value={activeTextInput.text}
              onChange={(e) => setActiveTextInput({ ...activeTextInput, text: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleAddText()}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400"
            />
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={handleAddText}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer"
              >
                Place Text
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING DRAWING TOOLBAR (BOTTOM CENTER) */}
      <div className="bg-slate-900/95 border-t border-slate-800 p-2.5 px-4 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20 backdrop-blur-md">
        {/* LEFT: TOOLS SELECTION */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            disabled={!canDraw}
            onClick={() => setActiveTool("pen")}
            className={`p-2 rounded-xl flex items-center space-x-1.5 text-xs font-bold transition cursor-pointer ${
              activeTool === "pen"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title="Pen / Freehand Draw"
          >
            <Pencil className="w-4 h-4" />
            <span className="hidden md:inline">Pen</span>
          </button>

          <button
            disabled={!canDraw}
            onClick={() => setActiveTool("highlighter")}
            className={`p-2 rounded-xl flex items-center space-x-1.5 text-xs font-bold transition cursor-pointer ${
              activeTool === "highlighter"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title="Highlighter"
          >
            <Highlighter className="w-4 h-4 text-amber-300" />
            <span className="hidden md:inline">Highlight</span>
          </button>

          <button
            disabled={!canDraw}
            onClick={() => setActiveTool("text")}
            className={`p-2 rounded-xl flex items-center space-x-1.5 text-xs font-bold transition cursor-pointer ${
              activeTool === "text"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title="Text Note (Click canvas)"
          >
            <Type className="w-4 h-4" />
            <span className="hidden md:inline">Text</span>
          </button>

          {/* SHAPE SELECTOR */}
          <div className="flex items-center space-x-1 border-l border-slate-800 pl-1.5">
            <button
              disabled={!canDraw}
              onClick={() => {
                setActiveTool("shape");
                setActiveShape("rectangle");
              }}
              className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTool === "shape" && activeShape === "rectangle"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              } disabled:opacity-40`}
              title="Rectangle"
            >
              <Square className="w-4 h-4" />
            </button>

            <button
              disabled={!canDraw}
              onClick={() => {
                setActiveTool("shape");
                setActiveShape("circle");
              }}
              className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTool === "shape" && activeShape === "circle"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              } disabled:opacity-40`}
              title="Circle"
            >
              <Circle className="w-4 h-4" />
            </button>

            <button
              disabled={!canDraw}
              onClick={() => {
                setActiveTool("shape");
                setActiveShape("line");
              }}
              className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTool === "shape" && activeShape === "line"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              } disabled:opacity-40`}
              title="Line"
            >
              <Minus className="w-4 h-4" />
            </button>

            <button
              disabled={!canDraw}
              onClick={() => {
                setActiveTool("shape");
                setActiveShape("arrow");
              }}
              className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTool === "shape" && activeShape === "arrow"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              } disabled:opacity-40`}
              title="Arrow Pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button
            disabled={!canDraw}
            onClick={() => setActiveTool("eraser")}
            className={`p-2 rounded-xl flex items-center space-x-1.5 text-xs font-bold transition cursor-pointer ${
              activeTool === "eraser"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4 text-rose-400" />
            <span className="hidden md:inline">Eraser</span>
          </button>
        </div>

        {/* CENTER: COLOR PALETTE & STROKE WIDTH */}
        {canDraw && (
          <div className="flex items-center space-x-3">
            {/* Color Swatches */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() => setStrokeColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-5 h-5 rounded-full border-2 transition transform hover:scale-110 cursor-pointer ${
                    strokeColor === color ? "border-white ring-2 ring-indigo-500 scale-110" : "border-slate-800"
                  }`}
                  title={color}
                />
              ))}
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-6 h-6 rounded-full border-0 bg-transparent cursor-pointer p-0"
                title="Custom Color"
              />
            </div>

            {/* Thickness selector */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              {STROKE_WIDTHS.map((sw) => (
                <button
                  key={sw.value}
                  onClick={() => setStrokeWidth(sw.value)}
                  className={`px-2 py-1 rounded-xl text-[10px] font-extrabold transition cursor-pointer ${
                    strokeWidth === sw.value
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {sw.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RIGHT: BOARD BACKGROUND & CLEAR/UNDO */}
        <div className="flex items-center space-x-2">
          {/* Background Selector (Host Only) */}
          {isHost && (
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
              {BOARD_BACKGROUNDS.map((bgItem) => (
                <button
                  key={bgItem.id}
                  onClick={() => handleChangeBackground(bgItem.bg)}
                  style={{ backgroundColor: bgItem.bg }}
                  className={`w-6 h-6 rounded-xl border border-slate-700 text-[9px] font-black flex items-center justify-center transition cursor-pointer ${
                    boardBg === bgItem.bg ? "ring-2 ring-indigo-400 border-white" : "opacity-80 hover:opacity-100"
                  }`}
                  title={`Switch to ${bgItem.label}`}
                >
                  <Palette className="w-3 h-3 text-white/70" />
                </button>
              ))}
            </div>
          )}

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGridLines(!showGridLines)}
            className={`p-2 rounded-2xl border text-xs font-bold transition cursor-pointer ${
              showGridLines
                ? "bg-slate-800 text-indigo-400 border-indigo-500/50"
                : "bg-slate-950 text-slate-500 border-slate-800"
            }`}
            title="Toggle Grid Lines"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Undo */}
          <button
            disabled={!canDraw || strokes.length === 0}
            onClick={handleUndo}
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-2xl transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo Last Stroke"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Clear Board (Host Only) */}
          {isHost && (
            <button
              onClick={handleClearBoard}
              className="p-2 bg-rose-900/40 hover:bg-rose-700 border border-rose-600/50 text-rose-300 rounded-2xl transition cursor-pointer"
              title="Clear Entire Whiteboard"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
