"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Download, Trash2, ZoomIn, ZoomOut, Move,
  PenTool, Square as SquareIcon, Circle, Type, ArrowRight,
  Undo2, Redo2, Palette, GitBranch, Network, Share2,
  Maximize2, Minimize2,
} from "lucide-react";

/* ═══════ TYPES ═══════ */
type Tool = "select" | "pen" | "rect" | "circle" | "text" | "arrow" | "eraser";
type DiagramType = "flowchart" | "mindmap" | "sequence" | "custom";

interface DrawElement {
  id: string;
  type: "path" | "rect" | "circle" | "text" | "arrow";
  points?: { x: number; y: number }[];
  x?: number; y?: number;
  width?: number; height?: number;
  radius?: number;
  text?: string;
  color: string;
  strokeWidth: number;
  startX?: number; startY?: number;
  endX?: number; endY?: number;
}

interface CanvasWhiteboardProps {
  isOpen: boolean;
  onClose: () => void;
  mermaidCode?: string; // AI-generated mermaid diagram code
  onInsertToChat?: (imageDataUrl: string) => void;
  onShare?: () => void; // MAX feature: share canvas with friends
}

/* ═══════ MERMAID CDN LOADER ═══════ */
function loadMermaidFromCDN(): Promise<typeof window.mermaid> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).mermaid) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve((window as any).mermaid);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
    script.async = true;
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = (window as any).mermaid;
      if (m) resolve(m);
      else reject(new Error("Mermaid failed to load"));
    };
    script.onerror = () => reject(new Error("Failed to load mermaid from CDN"));
    document.head.appendChild(script);
  });
}

/* ═══════ MERMAID RENDERER ═══════ */
function MermaidDiagram({ code, theme }: { code: string; theme: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!code) return;
    let cancelled = false;

    async function renderMermaid() {
      try {
        const mermaid = await loadMermaidFromCDN();
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === "dark" ? "dark" : "default",
          securityLevel: "loose",
          flowchart: { useMaxWidth: true, htmlLabels: true, curve: "basis" },
          themeVariables: {
            primaryColor: "#3b82f6",
            primaryTextColor: theme === "dark" ? "#e2e8f0" : "#1e293b",
            primaryBorderColor: "#3b82f6",
            lineColor: "#64748b",
            secondaryColor: "#8b5cf6",
            tertiaryColor: theme === "dark" ? "#1e293b" : "#f1f5f9",
          },
        });
        const id = "mermaid-" + Date.now();
        const { svg: renderedSvg } = await mermaid.render(id, code);
        if (!cancelled) {
          setSvg(renderedSvg);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError("Could not render diagram. Check the syntax.");
          console.error("Mermaid error:", err);
        }
      }
    }
    renderMermaid();
    return () => { cancelled = true; };
  }, [code, theme]);

  if (error) {
    return (
      <div className="p-4 rounded-lg text-center" style={{ background: "var(--bg-tertiary)", border: "1px solid rgba(239,68,68,0.3)" }}>
        <p className="text-xs text-red-400">{error}</p>
        <pre className="mt-2 text-[10px] text-left overflow-auto p-2 rounded" style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)" }}>{code}</pre>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex items-center justify-center p-4 overflow-auto"
      dangerouslySetInnerHTML={{ __html: svg }} />
  );
}

/* ═══════ DIAGRAM TEMPLATES ═══════ */
const diagramTemplates: { type: DiagramType; label: string; icon: React.ReactNode; code: string }[] = [
  {
    type: "flowchart", label: "Flowchart", icon: <GitBranch className="w-4 h-4" />,
    code: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`,
  },
  {
    type: "mindmap", label: "Mind Map", icon: <Network className="w-4 h-4" />,
    code: `mindmap
  root((Main Topic))
    Branch A
      Detail 1
      Detail 2
    Branch B
      Detail 3
      Detail 4
    Branch C
      Detail 5`,
  },
  {
    type: "sequence", label: "Sequence", icon: <Share2 className="w-4 h-4" />,
    code: `sequenceDiagram
    participant User
    participant System
    participant Database
    User->>System: Request
    System->>Database: Query
    Database-->>System: Result
    System-->>User: Response`,
  },
];

/* ═══════ MAIN COMPONENT ═══════ */
export default function CanvasWhiteboard({ isOpen, onClose, mermaidCode, onInsertToChat, onShare }: CanvasWhiteboardProps) {
  const canvasRef = useRef<SVGSVGElement>(null);
  const [activeTool, setActiveTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#3b82f6");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [undoStack, setUndoStack] = useState<DrawElement[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawElement[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<DrawElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [mode, setMode] = useState<"draw" | "diagram">(mermaidCode ? "diagram" : "draw");
  const [diagramCode, setDiagramCode] = useState(mermaidCode || diagramTemplates[0].code);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingText, setEditingText] = useState<{ x: number; y: number } | null>(null);
  const [textInput, setTextInput] = useState("");

  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#ffffff", "#000000"];

  useEffect(() => {
    if (mermaidCode) {
      setDiagramCode(mermaidCode);
      setMode("diagram");
    }
  }, [mermaidCode]);

  const saveUndo = useCallback(() => {
    setUndoStack((prev) => [...prev.slice(-20), [...elements]]);
    setRedoStack([]);
  }, [elements]);

  function handleUndo() {
    if (undoStack.length === 0) return;
    setRedoStack((prev) => [...prev, [...elements]]);
    const last = undoStack[undoStack.length - 1];
    setElements(last);
    setUndoStack((prev) => prev.slice(0, -1));
  }

  function handleRedo() {
    if (redoStack.length === 0) return;
    setUndoStack((prev) => [...prev, [...elements]]);
    const last = redoStack[redoStack.length - 1];
    setElements(last);
    setRedoStack((prev) => prev.slice(0, -1));
  }

  function getMousePos(e: React.MouseEvent<SVGSVGElement>) {
    const svg = canvasRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: svgP.x, y: svgP.y };
  }

  function handleMouseDown(e: React.MouseEvent<SVGSVGElement>) {
    if (mode !== "draw") return;
    const pos = getMousePos(e);
    saveUndo();
    setIsDrawing(true);

    if (activeTool === "text") {
      setEditingText(pos);
      setTextInput("");
      return;
    }

    const newEl: DrawElement = {
      id: Date.now().toString(),
      type: activeTool === "pen" || activeTool === "eraser" ? "path" : activeTool === "rect" ? "rect" : activeTool === "circle" ? "circle" : "arrow",
      color: activeTool === "eraser" ? "var(--bg-primary)" : color,
      strokeWidth: activeTool === "eraser" ? 20 : strokeWidth,
      points: activeTool === "pen" || activeTool === "eraser" ? [pos] : undefined,
      x: activeTool === "rect" || activeTool === "circle" ? pos.x : undefined,
      y: activeTool === "rect" || activeTool === "circle" ? pos.y : undefined,
      startX: activeTool === "arrow" ? pos.x : undefined,
      startY: activeTool === "arrow" ? pos.y : undefined,
      endX: activeTool === "arrow" ? pos.x : undefined,
      endY: activeTool === "arrow" ? pos.y : undefined,
      width: 0, height: 0, radius: 0,
    };
    setCurrentElement(newEl);
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!isDrawing || !currentElement || mode !== "draw") return;
    const pos = getMousePos(e);

    if (currentElement.type === "path") {
      setCurrentElement({ ...currentElement, points: [...(currentElement.points || []), pos] });
    } else if (currentElement.type === "rect") {
      setCurrentElement({
        ...currentElement,
        width: pos.x - (currentElement.x || 0),
        height: pos.y - (currentElement.y || 0),
      });
    } else if (currentElement.type === "circle") {
      const dx = pos.x - (currentElement.x || 0);
      const dy = pos.y - (currentElement.y || 0);
      setCurrentElement({ ...currentElement, radius: Math.sqrt(dx * dx + dy * dy) });
    } else if (currentElement.type === "arrow") {
      setCurrentElement({ ...currentElement, endX: pos.x, endY: pos.y });
    }
  }

  function handleMouseUp() {
    if (!isDrawing || !currentElement) return;
    setIsDrawing(false);
    setElements((prev) => [...prev, currentElement]);
    setCurrentElement(null);
  }

  function handleAddText() {
    if (!editingText || !textInput.trim()) { setEditingText(null); return; }
    saveUndo();
    const textEl: DrawElement = {
      id: Date.now().toString(),
      type: "text",
      x: editingText.x, y: editingText.y,
      text: textInput, color, strokeWidth: 0,
    };
    setElements((prev) => [...prev, textEl]);
    setEditingText(null);
    setTextInput("");
  }

  function handleClear() {
    saveUndo();
    setElements([]);
  }

  function handleInsertToChat() {
    const svg = canvasRef.current;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new window.Image();
    img.onload = () => {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--bg-primary").trim() || "#0f172a";
      ctx.fillRect(0, 0, 1200, 800);
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      if (onInsertToChat) onInsertToChat(dataUrl);
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }

  function handleDownload() {
    const svg = canvasRef.current;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new window.Image();
    img.onload = () => {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--bg-primary").trim() || "#0f172a";
      ctx.fillRect(0, 0, 1200, 800);
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "oforo-canvas.png";
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }

  function renderElement(el: DrawElement) {
    switch (el.type) {
      case "path":
        if (!el.points || el.points.length < 2) return null;
        const d = el.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
        return <path key={el.id} d={d} stroke={el.color} strokeWidth={el.strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
      case "rect":
        return <rect key={el.id} x={Math.min(el.x || 0, (el.x || 0) + (el.width || 0))} y={Math.min(el.y || 0, (el.y || 0) + (el.height || 0))}
          width={Math.abs(el.width || 0)} height={Math.abs(el.height || 0)} stroke={el.color} strokeWidth={el.strokeWidth} fill="none" rx="4" />;
      case "circle":
        return <circle key={el.id} cx={el.x} cy={el.y} r={el.radius || 0} stroke={el.color} strokeWidth={el.strokeWidth} fill="none" />;
      case "text":
        return <text key={el.id} x={el.x} y={el.y} fill={el.color} fontSize="16" fontFamily="system-ui">{el.text}</text>;
      case "arrow":
        return (
          <g key={el.id}>
            <line x1={el.startX} y1={el.startY} x2={el.endX} y2={el.endY} stroke={el.color} strokeWidth={el.strokeWidth} />
            <polygon
              points={(() => {
                const dx = (el.endX || 0) - (el.startX || 0);
                const dy = (el.endY || 0) - (el.startY || 0);
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const ux = dx / len; const uy = dy / len;
                const px = -uy; const py = ux;
                const tipX = el.endX || 0; const tipY = el.endY || 0;
                const s = 10;
                return `${tipX},${tipY} ${tipX - s * ux + s * 0.4 * px},${tipY - s * uy + s * 0.4 * py} ${tipX - s * ux - s * 0.4 * px},${tipY - s * uy - s * 0.4 * py}`;
              })()}
              fill={el.color}
            />
          </g>
        );
      default: return null;
    }
  }

  if (!isOpen) return null;

  const tools: { tool: Tool; icon: React.ReactNode; label: string }[] = [
    { tool: "pen", icon: <PenTool className="w-4 h-4" />, label: "Pen" },
    { tool: "rect", icon: <SquareIcon className="w-4 h-4" />, label: "Rectangle" },
    { tool: "circle", icon: <Circle className="w-4 h-4" />, label: "Circle" },
    { tool: "arrow", icon: <ArrowRight className="w-4 h-4" />, label: "Arrow" },
    { tool: "text", icon: <Type className="w-4 h-4" />, label: "Text" },
    { tool: "eraser", icon: <Trash2 className="w-4 h-4" />, label: "Eraser" },
  ];

  return (
    <div className={`fixed inset-0 z-[80] flex flex-col ${isFullscreen ? "" : "p-4 sm:p-8"}`}
      style={{ background: isFullscreen ? "var(--bg-primary)" : "rgba(0,0,0,0.6)" }}>
      <div className={`flex flex-col ${isFullscreen ? "h-full" : "rounded-2xl overflow-hidden max-w-6xl mx-auto w-full h-full max-h-[90vh]"}`}
        style={{ background: "var(--bg-primary)", border: isFullscreen ? "none" : "1px solid var(--border-hover)" }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-primary)" }}>
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold">Canvas</h2>
            <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: "var(--bg-secondary)" }}>
              <button onClick={() => setMode("draw")}
                className="px-3 py-1 text-xs font-medium rounded-md transition-all"
                style={{ background: mode === "draw" ? "var(--bg-hover)" : "transparent", color: mode === "draw" ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                Draw
              </button>
              <button onClick={() => setMode("diagram")}
                className="px-3 py-1 text-xs font-medium rounded-md transition-all"
                style={{ background: mode === "diagram" ? "var(--bg-hover)" : "transparent", color: mode === "diagram" ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                Diagram
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onInsertToChat && (
              <button onClick={handleInsertToChat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: "var(--accent-primary)", color: "white" }}
                title="Send drawing to chat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Send to Chat
              </button>
            )}
            {onShare && (
              <button onClick={onShare} className="p-2 rounded-lg transition-colors" style={{ color: "var(--accent)" }} title="Share canvas with friends">
                <Share2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={handleDownload} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }} title="Download PNG">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }} title="Toggle fullscreen">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {mode === "draw" ? (
          /* ═══ DRAWING MODE ═══ */
          <div className="flex-1 flex overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col items-center gap-1 p-2 flex-shrink-0" style={{ borderRight: "1px solid var(--border-primary)" }}>
              {tools.map((t) => (
                <button key={t.tool} onClick={() => setActiveTool(t.tool)}
                  className="p-2 rounded-lg transition-all" title={t.label}
                  style={{
                    background: activeTool === t.tool ? "var(--accent)" : "transparent",
                    color: activeTool === t.tool ? "#fff" : "var(--text-tertiary)",
                  }}>
                  {t.icon}
                </button>
              ))}
              <div className="w-6 my-1" style={{ borderTop: "1px solid var(--border-primary)" }} />
              {/* Colors */}
              <div className="flex flex-col gap-1">
                {colors.slice(0, 6).map((c) => (
                  <button key={c} onClick={() => setColor(c)}
                    className="w-5 h-5 rounded-full transition-transform"
                    style={{
                      background: c, border: color === c ? "2px solid var(--text-primary)" : "1px solid var(--border-primary)",
                      transform: color === c ? "scale(1.2)" : "scale(1)",
                    }} />
                ))}
              </div>
              <div className="w-6 my-1" style={{ borderTop: "1px solid var(--border-primary)" }} />
              {/* Stroke width */}
              <div className="flex flex-col items-center gap-1">
                {[1, 2, 4, 6].map((w) => (
                  <button key={w} onClick={() => setStrokeWidth(w)}
                    className="w-6 h-6 rounded flex items-center justify-center transition-all"
                    style={{ background: strokeWidth === w ? "var(--bg-hover)" : "transparent" }}>
                    <div className="rounded-full" style={{ width: w + 2, height: w + 2, background: strokeWidth === w ? "var(--accent)" : "var(--text-tertiary)" }} />
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              <button onClick={handleUndo} className="p-2 rounded-lg transition-colors" style={{ color: undoStack.length > 0 ? "var(--text-secondary)" : "var(--text-tertiary)", opacity: undoStack.length > 0 ? 1 : 0.3 }} title="Undo">
                <Undo2 className="w-4 h-4" />
              </button>
              <button onClick={handleRedo} className="p-2 rounded-lg transition-colors" style={{ color: redoStack.length > 0 ? "var(--text-secondary)" : "var(--text-tertiary)", opacity: redoStack.length > 0 ? 1 : 0.3 }} title="Redo">
                <Redo2 className="w-4 h-4" />
              </button>
              <button onClick={handleClear} className="p-2 rounded-lg transition-colors text-red-400" title="Clear all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
              <svg ref={canvasRef} className="w-full h-full cursor-crosshair"
                viewBox={`0 0 ${1200 / zoom} ${800 / zoom}`}
                onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}>
                {/* Grid */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border-primary)" strokeWidth="0.5" opacity="0.4" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {elements.map(renderElement)}
                {currentElement && renderElement(currentElement)}
              </svg>
              {/* Text input overlay */}
              {editingText && (
                <div className="absolute" style={{
                  left: `${(editingText.x * zoom / 1200) * 100}%`,
                  top: `${(editingText.y * zoom / 800) * 100}%`
                }}>
                  <input type="text" autoFocus value={textInput} onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddText(); if (e.key === "Escape") setEditingText(null); }}
                    onBlur={handleAddText}
                    className="px-2 py-1 text-sm rounded bg-transparent focus:outline-none"
                    style={{ color, border: `1px solid ${color}`, minWidth: "100px" }}
                    placeholder="Type text..." />
                </div>
              )}
              {/* Zoom controls */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg p-1" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-primary)" }}>
                <button onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} className="p-1.5 rounded" style={{ color: "var(--text-tertiary)" }}>
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-medium w-10 text-center" style={{ color: "var(--text-secondary)" }}>{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(Math.min(4, zoom + 0.25))} className="p-1.5 rounded" style={{ color: "var(--text-tertiary)" }}>
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ═══ DIAGRAM MODE ═══ */
          <div className="flex-1 flex overflow-hidden">
            {/* Template sidebar + code editor */}
            <div className="w-72 flex-shrink-0 flex flex-col" style={{ borderRight: "1px solid var(--border-primary)" }}>
              <div className="p-3" style={{ borderBottom: "1px solid var(--border-primary)" }}>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--text-tertiary)" }}>Templates</p>
                <div className="flex flex-wrap gap-1.5">
                  {diagramTemplates.map((t) => (
                    <button key={t.type} onClick={() => setDiagramCode(t.code)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: "var(--bg-hover)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)" }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex flex-col p-3">
                <p className="text-xs font-medium mb-2" style={{ color: "var(--text-tertiary)" }}>Mermaid Code</p>
                <textarea
                  value={diagramCode}
                  onChange={(e) => setDiagramCode(e.target.value)}
                  className="flex-1 w-full bg-transparent resize-none focus:outline-none text-xs font-mono p-2 rounded-lg"
                  style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-primary)" }}
                  spellCheck={false}
                />
                <p className="text-[10px] mt-2" style={{ color: "var(--text-tertiary)" }}>
                  Edit the code above to customise the diagram. Uses Mermaid.js syntax.
                </p>
              </div>
            </div>
            {/* Diagram preview */}
            <div className="flex-1 overflow-auto flex items-center justify-center" style={{ background: "var(--bg-secondary)" }}>
              <MermaidDiagram code={diagramCode} theme="dark" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
