import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import * as pdfjs from "pdfjs-dist";
import {
  FileText,
  Shield,
  Moon,
  Sun,
  Send,
  Cpu,
  Loader2,
  Sparkles,
  Trash2,
  Eye,
  Download,
  LogOut,
  CheckCircle2,
  Layers,
} from "lucide-react";
import "./App.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

function App() {
  // --- AUTH STATE ---
  const [user, setUser] = useState(null);

  // --- APP STATE ---
  const [isDark, setIsDark] = useState(true);
  const [loadingState, setLoadingState] = useState({ active: false, step: "" });
  const [showPreview, setShowPreview] = useState(false);
  const [question, setQuestion] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);

  // --- SESSION MANAGEMENT ---
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("docuSessions");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeSessionId, setActiveSessionId] = useState(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const worker = useRef(null);
  const chatEndRef = useRef(null);

  // --- AUTH EFFECTS ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- WORKER & PERSISTENCE EFFECTS ---
  useEffect(() => {
    localStorage.setItem("docuSessions", JSON.stringify(sessions));
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions]);

  useEffect(() => {
    worker.current = new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });

    worker.current.onmessage = (e) => {
      if (e.data.status === "complete") {
        // Find the active session and add the bot message to its history
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                chatHistory: [
                  ...s.chatHistory,
                  { role: "bot", text: e.data.output },
                ],
              };
            }
            return s;
          }),
        );
        setLoadingState({ active: false, step: "Response generated..." });
      }
    };

    return () => worker.current.terminate();
  }, [activeSessionId]); // <--- CRITICAL: Add activeSessionId here so the worker knows which session to update

  // --- HANDLERS ---
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") return;

    setLoadingState({ active: true, step: "Uploading file..." });
    const sessionId = Date.now().toString();
    const blobUrl = URL.createObjectURL(file);
    setPdfUrl(blobUrl);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const typedarray = new Uint8Array(reader.result);
        const pdf = await pdfjs.getDocument({ data: typedarray }).promise;

        let extractedText = "";
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          extractedText +=
            content.items.map((item) => item.str).join(" ") + " ";
        }

        const newSession = {
          id: sessionId,
          fileName: file.name,
          pdfText: extractedText,
          chatHistory: [],
          date: new Date().toLocaleDateString(),
          pageCount: pdf.numPages,
        };

        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(sessionId);
        worker.current.postMessage({ type: "INGEST_PDF", text: extractedText });
      } catch (err) {
        alert("Failed to parse PDF");
      } finally {
        setLoadingState({ active: false, step: "File uploaded." });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const addBotMessage = (text) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            chatHistory: [...s.chatHistory, { role: "bot", text }],
          };
        }
        return s;
      }),
    );
  };

  const askAI = (q = question) => {
    const query = q || question;
    if (!query.trim()) return;

    if (!activeSession) {
      alert("Please upload or select a document first!");
      return;
    }

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            chatHistory: [...s.chatHistory, { role: "user", text: query }],
          };
        }
        return s;
      }),
    );

  setLoadingState({ active: true, step: "Accessing document layers..." });

  // Simulate "Intelligence" by cycling steps
  setTimeout(() => setLoadingState(prev => ({ ...prev, step: "Scanning for context matches..." })), 1200);
  setTimeout(() => setLoadingState(prev => ({ ...prev, step: "Synthesizing neural response..." })), 3000);

  worker.current.postMessage({ text: activeSession.pdfText, question: query });
  setQuestion("");
  };

  const exportChat = () => {
    if (!activeSession) return;
    const content = activeSession.chatHistory
      .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
      .join("\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeSession.fileName}-chat.txt`;
    a.click();
  };

  // --- AUTH RENDER ---
  if (!user) {
  return (
    <div className="auth-screen">
      {/* Background Decorative Elements */}
      <div className="glow-orb top-right"></div>
      <div className="glow-orb bottom-left"></div>

      <nav className="auth-nav">
        <div className="logo-area">
          <div className="logo-icon"><Sparkles size={20} /></div>
          <span className="logo-text">DocuMind AI</span>
        </div>
        <div className="nav-links">
          <span>Security</span>
          <span>Documentation</span>
          <button className="nav-btn-outline">Open Source</button>
        </div>
      </nav>

      <main className="hero-content">
        <div className="badge-container">
          <span className="new-badge">v2.0 Beta</span>
          <span className="badge-text">Llama 3.2 1B Edge Integration</span>
        </div>
        
        <h1 className="hero-title">
          Chat with your PDFs, <br />
          <span className="text-gradient">Fully Offline.</span>
        </h1>
        
        <p className="hero-subtitle">
          The world's first browser-native PDF intelligence. No data leaves your 
          machine. No subscriptions. Just pure local power.
        </p>

        <div className="auth-actions">
          <button className="gsi-material-button" onClick={handleGoogleLogin}>
            <div className="gsi-material-button-state" />
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  style={{ display: "block" }}
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
              </div>
              <span className="gsi-material-button-contents">
                Sign in with Google
              </span>
              <span style={{ display: "none" }}>Sign in with Google</span>
            </div>
          </button>

          <p className="auth-note">Free forever for individual researchers.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-item">
            <Shield size={18} className="primary-text" />
            <span>Zero-Knowledge Privacy</span>
          </div>
          <div className="feature-item">
            <Cpu size={18} className="primary-text" />
            <span>WebGPU Accelerated</span>
          </div>
          <div className="feature-item">
            <Layers size={18} className="primary-text" />
            <span>Multi-Doc Sessions</span>
          </div>
        </div>
      </main>
    </div>
  );
}

  // --- MAIN APP RENDER ---
  return (
    <div className={`app-container ${isDark ? "dark" : "light"}`}>
      <aside className="sidebar">
        <div className="logo-area">
          <div className="logo-icon">
            <Sparkles size={22} />
          </div>
          <span className="logo-text">DocuMind</span>
        </div>

        <div className="sidebar-section">
          <p className="section-label">Your Workspace</p>
          <label className="upload-box mini">
            <input
              type="file"
              hidden
              onChange={handleFileUpload}
              accept=".pdf"
            />
            <Sparkles size={14} /> <span>New Analysis</span>
          </label>

          <div className="session-list">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`session-item ${activeSessionId === session.id ? "active" : ""}`}
                onClick={() => {
                  setActiveSessionId(session.id);
                  worker.current.postMessage({
                    type: "INGEST_PDF",
                    text: session.pdfText,
                  });
                }}
              >
                <FileText size={14} />
                <div className="session-info">
                  <span className="session-name">{session.fileName}</span>
                  <span className="session-date">{session.date}</span>
                </div>
                
                <button
                  className="delete-session"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSessions((prev) =>
                      prev.filter((s) => s.id !== session.id),
                    );
                    if (activeSessionId === session.id)
                      setActiveSessionId(null);
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="suggested-section">
          <p className="section-label">Quick Actions</p>
          <button
            onClick={() => askAI("Summarize the key takeaways")}
            className={`chip-btn ${!activeSession ? "disabled" : ""}`}
          >
            📝 Summarize
          </button>
          <button
            onClick={() => askAI("What are the key dates mentioned?")}
            className={`chip-btn ${!activeSession ? "disabled" : ""}`}
          >
            📅 Key Dates
          </button>
          <button
            onClick={exportChat}
            className={`chip-btn ${!activeSession ? "disabled" : ""}`}
          >
            <Download size={14} /> Export Chat
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="privacy-badge">
            <Shield size={14} color="#10b981" />
            <div className="badge-text">
              <strong>Private & Offline</strong>
              <span>Edge-AI Encryption</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <h1>
            Workspace /{" "}
            <span className="sub-path">
              {activeSession?.fileName || "Select Document"}
            </span>
          </h1>
          <div className="header-right">
            <button className="theme-toggle" onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <section className="workspace-body">
          {showPreview && pdfUrl && (
            <div className="pdf-preview-pane animate-in">
              <iframe
                src={pdfUrl}
                title="PDF Preview"
                width="100%"
                height="100%"
              />
            </div>
          )}

          <div className="chat-window">
            <div className="chat-messages">
              {!activeSession && (
                <div className="empty-state">
                  <Cpu size={48} />
                  <h3>Neural Workspace Ready</h3>
                  <p>Upload a document to start a secure, offline session.</p>
                </div>
              )}
              {activeSession?.chatHistory.map((msg, i) => (
                <div key={i} className={`message-wrapper ${msg.role}`}>
                  <div className="message-bubble">{msg.text}</div>
                </div>
              ))}
              {loadingState.active && (
  <div className="message-wrapper bot animate-in">
    <div className="thought-card">
      <div className="thought-header">
        <div className="pulse-dot"></div>
        <span>AI Chain of Thought</span>
      </div>
      
      <div className="thought-content">
        <div className="step-item completed">
          <CheckCircle2 size={14} />
          <span>Context: {activeSession?.fileName}</span>
        </div>
        
        <div className="step-item processing">
          <Loader2 size={14} className="animate-spin" />
          <span>{loadingState.step}</span>
        </div>

        <div className="thought-skeleton">
          <div className="skeleton-bar"></div>
          <div className="skeleton-bar short"></div>
        </div>
      </div>
    </div>
  </div>
)}
              <div ref={chatEndRef} />
            </div>

            <div className="input-area">
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Ask a question about the document..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askAI()}
                  disabled={!activeSession}
                />
                <button
                  className="send-btn"
                  onClick={() => askAI()}
                  disabled={!activeSession || !question.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="hardware-hint">
                <Cpu size={12} />
                <span>
                  Engine: Llama 3.2 1B • <strong>WebGPU Acceleration</strong>
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
