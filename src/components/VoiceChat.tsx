"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

/* ── Web Speech API types (not always in TS lib) ── */
/* eslint-disable @typescript-eslint/no-explicit-any */
type SpeechRecognitionType = any;
type SpeechRecognitionEventType = any;
type SpeechRecognitionErrorEventType = any;

/* ───────────────────────────── types ───────────────────────────── */

interface VoiceMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  audioUrl?: string; // blob URL for TTS playback
}

interface VoiceThread {
  id: string;
  title: string;
  messages: VoiceMessage[];
  createdAt: number;
  updatedAt: number;
}

interface VoiceSettings {
  voiceName: string;
  rate: number;
  pitch: number;
  autoSpeak: boolean;
  language: string;
}

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  onSendMessage: (
    text: string,
    modelId: string,
    webSearch: boolean
  ) => Promise<string>;
  selectedModel: string;
  initialThreadId?: string | null;
  inline?: boolean;
}

/* ───────── helper: unique id ───────── */
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/* ────────────────────── default settings ────────────────────── */
const DEFAULT_SETTINGS: VoiceSettings = {
  voiceName: "",
  rate: 1,
  pitch: 1,
  autoSpeak: true,
  language: "en-US",
};

/* ═══════════════════════════════════════════════════════════════ */
/*                       VoiceChat component                      */
/* ═══════════════════════════════════════════════════════════════ */

export default function VoiceChat({ isOpen = false, onClose, onSendMessage, selectedModel, initialThreadId, inline = false }: Props) {
  /* ── state ── */
  const [threads, setThreads] = useState<VoiceThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showThreadList, setShowThreadList] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ── derived ── */
  const activeThread = threads.find((t) => t.id === activeThreadId) ?? null;

  /* ── Switch to thread selected from sidebar ── */
  useEffect(() => {
    if (initialThreadId && threads.some((t) => t.id === initialThreadId)) {
      setActiveThreadId(initialThreadId);
      setShowThreadList(false);
    }
  }, [initialThreadId, threads]);

  /* ────────────── load from localStorage ────────────── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("oforo-voice-threads");
      if (saved) {
        const parsed: VoiceThread[] = JSON.parse(saved);
        setThreads(parsed);
        if (parsed.length > 0) {
          setActiveThreadId(parsed[parsed.length - 1].id);
        }
      }
      const savedSettings = localStorage.getItem("oforo-voice-settings");
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch {}
  }, []);

  /* ── save threads ── */
  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem("oforo-voice-threads", JSON.stringify(threads));
    }
  }, [threads]);

  /* ── save settings ── */
  useEffect(() => {
    localStorage.setItem("oforo-voice-settings", JSON.stringify(settings));
  }, [settings]);

  /* ── load voices ── */
  useEffect(() => {
    const loadVoices = () => {
      const v = speechSynthesis.getVoices();
      if (v.length) setAvailableVoices(v);
    };
    loadVoices();
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  /* ── auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages]);

  /* ═══════ Speech Recognition (STT) ═══════ */
  const startListening = useCallback(() => {
    const w = window as any;
    const SpeechRecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError("Speech recognition not supported in this browser.");
      return;
    }

    // stop any current TTS
    speechSynthesis.cancel();
    setIsSpeaking(false);

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = settings.language;

    recognition.onresult = (event: SpeechRecognitionEventType) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      if (final) setTranscript((p) => (p + " " + final).trim());
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventType) => {
      if (event.error !== "aborted" && event.error !== "no-speech") {
        setError(`Speech error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setError(null);
  }, [settings.language]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  /* ═══════ Text-to-Speech (TTS) ═══════ */
  const speak = useCallback(
    (text: string) => {
      if (!text || !settings.autoSpeak) return;
      speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = settings.rate;
      utter.pitch = settings.pitch;
      utter.lang = settings.language;

      if (settings.voiceName) {
        const voice = availableVoices.find((v) => v.name === settings.voiceName);
        if (voice) utter.voice = voice;
      }

      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);

      synthRef.current = utter;
      speechSynthesis.speak(utter);
    },
    [settings, availableVoices]
  );

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  /* ═══════ send message ═══════ */
  const sendVoiceMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      let threadId = activeThreadId;
      let updatedThreads = [...threads];

      // create new thread if needed
      if (!threadId) {
        const newThread: VoiceThread = {
          id: uid(),
          title: text.slice(0, 40) + (text.length > 40 ? "…" : ""),
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        updatedThreads.push(newThread);
        threadId = newThread.id;
        setActiveThreadId(threadId);
      }

      // add user message
      const userMsg: VoiceMessage = {
        id: uid(),
        role: "user",
        text: text.trim(),
        timestamp: Date.now(),
      };

      updatedThreads = updatedThreads.map((t) =>
        t.id === threadId
          ? { ...t, messages: [...t.messages, userMsg], updatedAt: Date.now() }
          : t
      );
      setThreads(updatedThreads);
      setTranscript("");
      setInterimTranscript("");
      setIsProcessing(true);

      try {
        // build conversation context for memory
        const currentThread = updatedThreads.find((t) => t.id === threadId);
        const contextMessages = currentThread?.messages.slice(-10) ?? [];
        const contextPrompt = contextMessages.length > 1
          ? `[Voice conversation context — last ${contextMessages.length} messages]:\n` +
            contextMessages.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n") +
            `\n\nUser's latest message: ${text.trim()}\n\nRespond conversationally and concisely as this is a voice conversation.`
          : `[Voice conversation] ${text.trim()}\n\nRespond conversationally and concisely.`;

        const reply = await onSendMessage(contextPrompt, selectedModel, false);

        const assistantMsg: VoiceMessage = {
          id: uid(),
          role: "assistant",
          text: reply,
          timestamp: Date.now(),
        };

        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId
              ? { ...t, messages: [...t.messages, assistantMsg], updatedAt: Date.now() }
              : t
          )
        );

        // auto-speak response
        speak(reply);
      } catch (err) {
        setError("Failed to get response. Please try again.");
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    },
    [activeThreadId, threads, onSendMessage, selectedModel, speak]
  );

  /* ═══════ thread management ═══════ */
  const createNewThread = () => {
    setActiveThreadId(null);
    setTranscript("");
    setInterimTranscript("");
    setShowThreadList(false);
  };

  const deleteThread = (id: string) => {
    setThreads((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      if (activeThreadId === id) {
        setActiveThreadId(updated.length > 0 ? updated[updated.length - 1].id : null);
      }
      if (updated.length === 0) localStorage.removeItem("oforo-voice-threads");
      return updated;
    });
  };

  /* ═══════ handle send button or Enter ═══════ */
  const handleSend = () => {
    if (isListening) stopListening();
    if (transcript.trim()) sendVoiceMessage(transcript);
  };

  if (!inline && !isOpen) return null;

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div className={inline ? "flex flex-col h-full" : "fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"}>
      <div
        className={inline ? "relative w-full h-full flex flex-col overflow-hidden" : "relative w-full max-w-lg h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"}
        style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      >
        {/* ── header ── */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <div className="flex items-center gap-2">
            {!inline && (
              <button
                onClick={() => setShowThreadList(!showThreadList)}
                className="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
                title="Conversation threads"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            )}
            <h2 className="font-semibold text-sm">Voice Chat</h2>
            {isSpeaking && (
              <span className="flex items-center gap-1 text-xs opacity-60">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Speaking
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
              title="Voice settings"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>
            <button onClick={createNewThread} className="p-1.5 rounded-lg hover:opacity-80 transition-opacity" title="New conversation">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            {!inline && (
              <button onClick={() => onClose?.()} className="p-1.5 rounded-lg hover:opacity-80 transition-opacity" title="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── thread list sidebar (slide) ── */}
        {!inline && showThreadList && (
          <div
            className="absolute top-12 left-0 bottom-0 w-64 z-10 border-r overflow-y-auto"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}
          >
            <div className="p-3">
              <h3 className="text-xs font-semibold uppercase opacity-50 mb-2">Conversations</h3>
              {threads.length === 0 && (
                <p className="text-xs opacity-40">No voice conversations yet</p>
              )}
              {[...threads].reverse().map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between p-2 rounded-lg mb-1 cursor-pointer transition-colors ${
                    t.id === activeThreadId ? "ring-1" : "hover:opacity-80"
                  }`}
                  style={{
                    background: t.id === activeThreadId ? "var(--bg-primary)" : "transparent",
                    outlineColor: "var(--accent-primary)",
                  }}
                  onClick={() => {
                    setActiveThreadId(t.id);
                    setShowThreadList(false);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{t.title}</p>
                    <p className="text-[10px] opacity-40">
                      {t.messages.length} messages · {new Date(t.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteThread(t.id);
                    }}
                    className="p-1 rounded opacity-40 hover:opacity-100 transition-opacity"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── settings panel ── */}
        {showSettings && (
          <div className="p-4 border-b space-y-3" style={{ borderColor: "var(--border-primary)" }}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Voice</label>
              <select
                className="text-xs rounded-lg px-2 py-1 border"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                value={settings.voiceName}
                onChange={(e) => setSettings((s) => ({ ...s, voiceName: e.target.value }))}
              >
                <option value="">Default</option>
                {availableVoices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Speed ({settings.rate.toFixed(1)}x)</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.rate}
                onChange={(e) => setSettings((s) => ({ ...s, rate: parseFloat(e.target.value) }))}
                className="w-24 accent-[var(--accent-primary)]"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Pitch ({settings.pitch.toFixed(1)})</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.pitch}
                onChange={(e) => setSettings((s) => ({ ...s, pitch: parseFloat(e.target.value) }))}
                className="w-24 accent-[var(--accent-primary)]"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Language</label>
              <select
                className="text-xs rounded-lg px-2 py-1 border"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                value={settings.language}
                onChange={(e) => setSettings((s) => ({ ...s, language: e.target.value }))}
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
                <option value="it-IT">Italian</option>
                <option value="pt-BR">Portuguese</option>
                <option value="ja-JP">Japanese</option>
                <option value="ko-KR">Korean</option>
                <option value="zh-CN">Chinese</option>
                <option value="hi-IN">Hindi</option>
                <option value="ar-SA">Arabic</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Auto-speak responses</label>
              <button
                onClick={() => setSettings((s) => ({ ...s, autoSpeak: !s.autoSpeak }))}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  settings.autoSpeak ? "bg-green-500" : "bg-gray-400"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    settings.autoSpeak ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* ── messages area ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!activeThread || activeThread.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-40 text-center px-8">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-30">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              <p className="text-sm font-medium mb-1">Voice Conversation</p>
              <p className="text-xs">
                Tap the microphone to start speaking, or type below.
                Conversations are saved with full history.
              </p>
            </div>
          ) : (
            activeThread.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "rounded-br-md"
                      : "rounded-bl-md"
                  }`}
                  style={{
                    background: msg.role === "user" ? "var(--accent-primary)" : "var(--bg-secondary)",
                    color: msg.role === "user" ? "white" : "var(--text-primary)",
                  }}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.role === "user" ? "opacity-70" : "opacity-40"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {msg.role === "assistant" && (
                  <button
                    onClick={() => speak(msg.text)}
                    className="self-end p-1 ml-1 rounded opacity-40 hover:opacity-100 transition-opacity"
                    title="Replay"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </button>
                )}
              </div>
            ))
          )}
          {isProcessing && (
            <div className="flex justify-start">
              <div
                className="rounded-2xl rounded-bl-md px-4 py-3"
                style={{ background: "var(--bg-secondary)" }}
              >
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── error ── */}
        {error && (
          <div className="mx-4 mb-2 p-2 rounded-lg bg-red-500/10 text-red-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-2 opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {/* ── input area ── */}
        <div className="p-3 border-t" style={{ borderColor: "var(--border-primary)" }}>
          {/* transcript preview */}
          {(transcript || interimTranscript) && (
            <div className="mb-2 px-3 py-2 rounded-lg text-xs" style={{ background: "var(--bg-secondary)" }}>
              <span>{transcript}</span>
              {interimTranscript && <span className="opacity-40">{interimTranscript}</span>}
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* mic button */}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-full transition-all ${
                isListening
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110"
                  : ""
              }`}
              style={
                !isListening
                  ? { background: "var(--accent-primary)", color: "white" }
                  : undefined
              }
              title={isListening ? "Stop listening" : "Start listening"}
            >
              {isListening ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </button>

            {/* text input */}
            <input
              type="text"
              placeholder="Type or speak…"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm border outline-none transition-colors"
              style={{
                background: "var(--bg-secondary)",
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)",
              }}
            />

            {/* send / stop speaking */}
            {isSpeaking ? (
              <button
                onClick={stopSpeaking}
                className="p-2.5 rounded-xl transition-colors"
                style={{ background: "var(--bg-secondary)" }}
                title="Stop speaking"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!transcript.trim() || isProcessing}
                className="p-2.5 rounded-xl transition-colors disabled:opacity-30"
                style={{ background: "var(--accent-primary)", color: "white" }}
                title="Send"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            )}
          </div>

          {/* listening animation */}
          {isListening && (
            <div className="flex items-center justify-center gap-0.5 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-red-500"
                  style={{
                    animation: `voiceWave 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
                    height: "8px",
                  }}
                />
              ))}
              <span className="text-xs ml-2 opacity-50">Listening…</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes voiceWave {
          0% { height: 4px; }
          100% { height: 20px; }
        }
      `}</style>
    </div>
  );
}
