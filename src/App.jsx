import { useState, useEffect, useRef } from "react";

const DEFAULT_CONFIG = {
  siteTitle: "VaultDrop",
  adminName: "Administrator",
  adminPassword: "admin123",
};

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function getFileIcon(type) {
  if (type.startsWith("image/")) return "🖼️";
  if (type.startsWith("video/")) return "🎬";
  if (type.startsWith("audio/")) return "🎵";
  if (type.includes("pdf")) return "📄";
  if (type.includes("word") || type.includes("document")) return "📝";
  if (type.includes("sheet") || type.includes("excel")) return "📊";
  if (type.includes("zip") || type.includes("rar")) return "🗜️";
  return "📁";
}

// ── localStorage helpers ──────────────────────────────────────────────────────
function loadConfig() {
  try { return JSON.parse(localStorage.getItem("vault_config")) || DEFAULT_CONFIG; }
  catch { return DEFAULT_CONFIG; }
}
function saveConfig(cfg) {
  try { localStorage.setItem("vault_config", JSON.stringify(cfg)); } catch {}
}
function loadFileList() {
  try { return JSON.parse(localStorage.getItem("vault_filelist")) || []; }
  catch { return []; }
}
function saveFileList(list) {
  try { localStorage.setItem("vault_filelist", JSON.stringify(list)); } catch {}
}
function loadFile(id) {
  try { return JSON.parse(localStorage.getItem("vault_file_" + id)); }
  catch { return null; }
}
function saveFileData(id, data) {
  try { localStorage.setItem("vault_file_" + id, JSON.stringify(data)); } catch (e) {
    alert("Storage full! Please delete some files before uploading more.");
  }
}
function removeFile(id) {
  try {
    localStorage.removeItem("vault_file_" + id);
    const list = loadFileList();
    saveFileList(list.filter(x => x !== id));
  } catch {}
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("home");
  const [config, setConfig] = useState(loadConfig());
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const ids = loadFileList();
    setFiles(ids.map(loadFile).filter(Boolean));
  }, []);

  const refreshFiles = () => {
    const ids = loadFileList();
    setFiles(ids.map(loadFile).filter(Boolean));
  };

  const updateConfig = (newCfg) => {
    setConfig(newCfg);
    saveConfig(newCfg);
  };

  if (view === "home")
    return <HomePage config={config} onAdmin={() => setView("admin-login")} onConsumer={() => setView("consumer")} />;
  if (view === "admin-login")
    return <AdminLogin config={config} onSuccess={() => setView("admin")} onBack={() => setView("home")} />;
  if (view === "admin")
    return <AdminDashboard config={config} files={files} updateConfig={updateConfig} refreshFiles={refreshFiles} onBack={() => setView("home")} />;
  if (view === "consumer")
    return <ConsumerView config={config} files={files} onBack={() => setView("home")} />;
}

// ── Home Page ─────────────────────────────────────────────────────────────────
function HomePage({ config, onAdmin, onConsumer }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={s.homeBg}>
      <div style={s.noise} />
      <div style={s.grid} />
      <div style={s.homeContent}>
        <div style={s.badge}>✦ Secure File Hosting</div>
        <h1 style={s.homeTitle}>{config.siteTitle}</h1>
        <p style={s.homeSub}>Upload, manage, and share files with elegance.<br />Your vault, your rules.</p>
        <div style={s.cards}>
          {/* Admin Card */}
          <div
            style={{ ...s.card, ...(hovered === "admin" ? s.cardHover : {}), background: "linear-gradient(135deg,#1a1a2e,#16213e)", border: "1px solid rgba(99,102,241,.4)" }}
            onMouseEnter={() => setHovered("admin")}
            onMouseLeave={() => setHovered(null)}
            onClick={onAdmin}
          >
            <div style={{ ...s.cardIcon, background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>⚡</div>
            <h2 style={s.cardTitle}>Admin Portal</h2>
            <p style={s.cardDesc}>Upload & manage files, customize your vault, control everything from your dashboard.</p>
            <div style={{ ...s.cardCta, background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>Enter Dashboard →</div>
          </div>
          {/* Consumer Card */}
          <div
            style={{ ...s.card, ...(hovered === "consumer" ? s.cardHover : {}), background: "linear-gradient(135deg,#0f2027,#203a43)", border: "1px solid rgba(20,184,166,.4)" }}
            onMouseEnter={() => setHovered("consumer")}
            onMouseLeave={() => setHovered(null)}
            onClick={onConsumer}
          >
            <div style={{ ...s.cardIcon, background: "linear-gradient(135deg,#14b8a6,#06b6d4)" }}>🌐</div>
            <h2 style={s.cardTitle}>Browse Files</h2>
            <p style={s.cardDesc}>Access and download all shared files. Images, videos, documents — everything in one place.</p>
            <div style={{ ...s.cardCta, background: "linear-gradient(135deg,#14b8a6,#06b6d4)" }}>Browse Vault →</div>
          </div>
        </div>
        <p style={s.homeFooter}>Hosted by {config.adminName} · {config.siteTitle}</p>
      </div>
    </div>
  );
}

// ── Admin Login ───────────────────────────────────────────────────────────────
function AdminLogin({ config, onSuccess, onBack }) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const attempt = () => {
    if (pass === config.adminPassword) { onSuccess(); }
    else {
      setError("Invalid password. Try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={s.loginBg}>
      <div style={s.noise} />
      <div style={{ ...s.loginBox, ...(shake ? s.shake : {}) }}>
        <button style={s.backBtn} onClick={onBack}>← Back</button>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
        <h2 style={s.loginTitle}>Admin Access</h2>
        <p style={s.loginSub}>Enter your password to access the dashboard</p>
        <input
          style={s.loginInput}
          type="password"
          placeholder="Enter admin password"
          value={pass}
          autoFocus
          onChange={e => { setPass(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && attempt()}
        />
        {error && <p style={{ color: "#f87171", fontSize: 13, margin: "6px 0" }}>{error}</p>}
        <button style={s.loginBtn} onClick={attempt}>Unlock Dashboard</button>
        <p style={{ color: "#475569", fontSize: 12, marginTop: 16, fontFamily: "monospace" }}>
          Default password: <code style={{ color: "#a5b4fc" }}>admin123</code>
        </p>
      </div>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ config, files, updateConfig, refreshFiles, onBack }) {
  const [tab, setTab] = useState("upload");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [editName, setEditName] = useState(config.adminName);
  const [editTitle, setEditTitle] = useState(config.siteTitle);
  const [editPass, setEditPass] = useState("");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef();

  const handleUpload = async (fileList) => {
    setUploading(true);
    const ids = loadFileList();
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setProgress(Math.round((i / fileList.length) * 100));
      await new Promise((res) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const id = Date.now() + "_" + Math.random().toString(36).slice(2);
          saveFileData(id, { id, name: file.name, type: file.type, size: file.size, uploadedAt: Date.now(), data: e.target.result });
          ids.push(id);
          res();
        };
        reader.readAsDataURL(file);
      });
    }
    saveFileList(ids);
    setProgress(100);
    setTimeout(() => { setUploading(false); setProgress(0); refreshFiles(); }, 600);
  };

  const handleDelete = (id) => { removeFile(id); refreshFiles(); };

  const handleDownload = (file) => {
    const a = document.createElement("a");
    a.href = file.data; a.download = file.name; a.click();
  };

  const handleSave = () => {
    updateConfig({ ...config, adminName: editName, siteTitle: editTitle, ...(editPass ? { adminPassword: editPass } : {}) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={s.dashBg}>
      <div style={s.noise} />
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.sidebarLogo}>{config.siteTitle}</div>
        <div style={{ color: "#64748b", fontSize: 13, padding: "0 8px 16px" }}>👤 {config.adminName}</div>
        <div style={{ height: 1, background: "rgba(99,102,241,.1)", margin: "0 0 8px" }} />
        {["upload", "files", "settings"].map(t => (
          <button key={t} style={{ ...s.sidebarBtn, ...(tab === t ? s.sidebarBtnActive : {}) }} onClick={() => setTab(t)}>
            {t === "upload" ? "⬆️ Upload Files" : t === "files" ? "📁 Manage Files" : "⚙️ Settings"}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button style={s.sidebarBack} onClick={onBack}>← Exit Dashboard</button>
      </div>

      {/* Main */}
      <div style={s.dashMain}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <h1 style={s.dashTitle}>{tab === "upload" ? "Upload Files" : tab === "files" ? "Manage Files" : "Settings"}</h1>
          <span style={{ color: "#475569", fontSize: 13, fontFamily: "monospace" }}>
            {files.length} files · {formatBytes(files.reduce((a, f) => a + f.size, 0))}
          </span>
        </div>

        {tab === "upload" && (
          <>
            <div
              style={{ ...s.dropZone, ...(dragOver ? s.dropZoneActive : {}) }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
              onClick={() => fileRef.current.click()}
            >
              <input ref={fileRef} type="file" multiple style={{ display: "none" }} onChange={e => handleUpload(e.target.files)} />
              <div style={{ fontSize: 52, marginBottom: 14 }}>{uploading ? "⏳" : "☁️"}</div>
              <p style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>
                {uploading ? `Uploading… ${progress}%` : "Drop files here or click to browse"}
              </p>
              <p style={{ color: "#475569", fontSize: 14 }}>Supports images, videos, documents, and more</p>
              {uploading && (
                <div style={s.progressBar}>
                  <div style={{ ...s.progressFill, width: progress + "%" }} />
                </div>
              )}
            </div>
            {files.length > 0 && (
              <div style={s.recentGrid}>
                {files.slice(-4).reverse().map(f => (
                  <div key={f.id} style={s.recentCard}>
                    {f.type.startsWith("image/")
                      ? <img src={f.data} alt={f.name} style={s.recentThumb} />
                      : <div style={{ fontSize: 40, marginBottom: 10 }}>{getFileIcon(f.type)}</div>}
                    <p style={{ color: "#e2e8f0", fontSize: 13, margin: "0 0 4px" }}>{f.name.length > 20 ? f.name.slice(0, 20) + "…" : f.name}</p>
                    <p style={{ color: "#475569", fontSize: 12 }}>{formatBytes(f.size)}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "files" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {files.length === 0
              ? <div style={s.empty}><div style={{ fontSize: 48 }}>📭</div><p style={{ marginTop: 12 }}>No files uploaded yet</p></div>
              : files.map(f => (
                <div key={f.id} style={s.fileRow}>
                  <div style={s.fileRowThumb}>
                    {f.type.startsWith("image/")
                      ? <img src={f.data} alt="" style={{ width: 52, height: 52, objectFit: "cover" }} />
                      : <span style={{ fontSize: 26 }}>{getFileIcon(f.type)}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 500, margin: "0 0 4px" }}>{f.name}</p>
                    <p style={{ color: "#475569", fontSize: 12 }}>{formatBytes(f.size)} · {formatDate(f.uploadedAt)} · {f.type}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={s.actionBtn} onClick={() => handleDownload(f)}>⬇️</button>
                    <button style={{ ...s.actionBtn, borderColor: "rgba(239,68,68,.3)" }} onClick={() => handleDelete(f.id)}>🗑️</button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {tab === "settings" && (
          <div style={s.settingsBox}>
            <div style={{ marginBottom: 24 }}>
              <label style={s.label}>Site Title</label>
              <input style={s.input} value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="VaultDrop" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={s.label}>Admin Name</label>
              <input style={s.input} value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your name" />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={s.label}>
                New Password <span style={{ color: "#64748b" }}>(leave blank to keep current)</span>
              </label>
              <input style={s.input} type="password" value={editPass} onChange={e => setEditPass(e.target.value)} placeholder="New password…" />
            </div>
            <button style={s.saveBtn} onClick={handleSave}>{saved ? "✅ Saved!" : "Save Changes"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Consumer View ─────────────────────────────────────────────────────────────
function ConsumerView({ config, files, onBack }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [preview, setPreview] = useState(null);

  const filtered = files.filter(f => {
    const ms = f.name.toLowerCase().includes(search.toLowerCase());
    const mf =
      filter === "all" ||
      (filter === "images" && f.type.startsWith("image/")) ||
      (filter === "videos" && f.type.startsWith("video/")) ||
      (filter === "docs" && !f.type.startsWith("image/") && !f.type.startsWith("video/"));
    return ms && mf;
  });

  const download = (file) => {
    const a = document.createElement("a");
    a.href = file.data; a.download = file.name; a.click();
  };

  return (
    <div style={s.consumerBg}>
      <div style={s.noise} />
      <div style={{ textAlign: "center", padding: "60px 20px 32px", position: "relative" }}>
        <button style={{ ...s.backBtn, position: "absolute", top: 20, left: 20 }} onClick={onBack}>← Back</button>
        <h1 style={s.consumerTitle}>{config.siteTitle}</h1>
        <p style={{ color: "#475569", fontSize: 14, fontFamily: "monospace" }}>Curated by {config.adminName}</p>
      </div>
      <div style={s.controls}>
        <input style={s.searchInput} placeholder="Search files…" value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "images", "videos", "docs"].map(f => (
            <button key={f} style={{ ...s.filterBtn, ...(filter === f ? s.filterBtnActive : {}) }} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "images" ? "🖼️ Images" : f === "videos" ? "🎬 Videos" : "📄 Docs"}
            </button>
          ))}
        </div>
      </div>

      {files.length === 0
        ? <div style={s.empty}><div style={{ fontSize: 56 }}>📭</div><p style={{ color: "#94a3b8", marginTop: 12 }}>No files yet. Check back soon!</p></div>
        : filtered.length === 0
          ? <div style={s.empty}><div style={{ fontSize: 48 }}>🔍</div><p style={{ color: "#94a3b8", marginTop: 12 }}>No files match your search</p></div>
          : (
            <div style={s.consumerGrid}>
              {filtered.map(f => (
                <div key={f.id} style={s.consumerCard} onClick={() => setPreview(f)}>
                  <div style={s.consumerThumb}>
                    {f.type.startsWith("image/")
                      ? <img src={f.data} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : f.type.startsWith("video/")
                        ? <video src={f.data} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ fontSize: 52 }}>{getFileIcon(f.type)}</div>}
                  </div>
                  <div style={{ padding: "14px 16px 8px" }}>
                    <p style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>
                      {f.name.length > 22 ? f.name.slice(0, 22) + "…" : f.name}
                    </p>
                    <p style={{ color: "#475569", fontSize: 12 }}>{formatBytes(f.size)} · {formatDate(f.uploadedAt)}</p>
                  </div>
                  <button style={s.dlBtn} onClick={e => { e.stopPropagation(); download(f); }}>⬇️ Download</button>
                </div>
              ))}
            </div>
          )
      }

      {preview && (
        <div style={s.overlay} onClick={() => setPreview(null)}>
          <div style={s.previewBox} onClick={e => e.stopPropagation()}>
            <button style={s.closeBtn} onClick={() => setPreview(null)}>✕</button>
            <h3 style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 700, margin: "0 0 6px", fontFamily: "'Playfair Display',serif" }}>{preview.name}</h3>
            <p style={{ color: "#475569", fontSize: 13, marginBottom: 20, fontFamily: "monospace" }}>{formatBytes(preview.size)} · {formatDate(preview.uploadedAt)}</p>
            {preview.type.startsWith("image/") && <img src={preview.data} alt={preview.name} style={{ maxWidth: "100%", maxHeight: 360, borderRadius: 12, marginBottom: 20 }} />}
            {preview.type.startsWith("video/") && <video src={preview.data} controls style={{ maxWidth: "100%", maxHeight: 360, borderRadius: 12, marginBottom: 20 }} />}
            {!preview.type.startsWith("image/") && !preview.type.startsWith("video/") && <div style={{ fontSize: 72, marginBottom: 20 }}>{getFileIcon(preview.type)}</div>}
            <button style={s.saveBtn} onClick={() => download(preview)}>⬇️ Download File</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  noise: { position: "fixed", inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.5, pointerEvents: "none", zIndex: 0 },
  grid: { position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.05) 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", zIndex: 0 },
  homeBg: { minHeight: "100vh", background: "radial-gradient(ellipse at 30% 20%,#0f0c29,#030712 60%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" },
  homeContent: { position: "relative", zIndex: 1, textAlign: "center", padding: "40px 20px", maxWidth: 900, width: "100%" },
  badge: { display: "inline-block", background: "rgba(99,102,241,.15)", border: "1px solid rgba(99,102,241,.3)", color: "#a5b4fc", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontFamily: "'DM Mono',monospace", letterSpacing: ".1em", marginBottom: 24 },
  homeTitle: { fontSize: "clamp(48px,8vw,96px)", fontWeight: 900, fontFamily: "'Playfair Display',serif", background: "linear-gradient(135deg,#fff 30%,#a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 16px", letterSpacing: "-2px" },
  homeSub: { color: "#94a3b8", fontSize: 18, lineHeight: 1.7, marginBottom: 48, fontFamily: "'DM Sans',sans-serif" },
  cards: { display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" },
  card: { width: 300, padding: "32px 28px", borderRadius: 20, cursor: "pointer", transition: "all .3s", textAlign: "left" },
  cardHover: { transform: "translateY(-8px)", boxShadow: "0 24px 60px rgba(0,0,0,.5)" },
  cardIcon: { width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 },
  cardTitle: { color: "#f1f5f9", fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display',serif", margin: "0 0 10px" },
  cardDesc: { color: "#94a3b8", fontSize: 14, lineHeight: 1.6, marginBottom: 24, fontFamily: "'DM Sans',sans-serif" },
  cardCta: { display: "inline-block", padding: "10px 20px", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" },
  homeFooter: { marginTop: 48, color: "#334155", fontSize: 13, fontFamily: "monospace" },
  loginBg: { minHeight: "100vh", background: "radial-gradient(ellipse at 50% 50%,#0f0c29,#030712)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  loginBox: { background: "rgba(15,23,42,.9)", border: "1px solid rgba(99,102,241,.2)", borderRadius: 24, padding: "48px 40px", width: 380, textAlign: "center", position: "relative", backdropFilter: "blur(20px)" },
  loginTitle: { color: "#f1f5f9", fontSize: 28, fontWeight: 700, fontFamily: "'Playfair Display',serif", margin: "0 0 8px" },
  loginSub: { color: "#64748b", fontSize: 14, marginBottom: 28, fontFamily: "'DM Sans',sans-serif" },
  loginInput: { width: "100%", padding: "14px 16px", background: "rgba(30,41,59,.8)", border: "1px solid rgba(99,102,241,.3)", borderRadius: 12, color: "#f1f5f9", fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 8, fontFamily: "'DM Sans',sans-serif" },
  loginBtn: { width: "100%", padding: 14, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 8, fontFamily: "'DM Sans',sans-serif" },
  backBtn: { background: "rgba(30,41,59,.6)", border: "1px solid rgba(99,102,241,.2)", color: "#94a3b8", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif" },
  shake: { animation: "shake .5s ease" },
  dashBg: { minHeight: "100vh", background: "#030712", display: "flex", fontFamily: "'DM Sans',sans-serif" },
  sidebar: { width: 240, background: "rgba(15,23,42,.95)", borderRight: "1px solid rgba(99,102,241,.15)", padding: "28px 16px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0, position: "sticky", top: 0, height: "100vh" },
  sidebarLogo: { color: "#f1f5f9", fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, padding: "0 8px 16px", borderBottom: "1px solid rgba(99,102,241,.1)", marginBottom: 8 },
  sidebarBtn: { padding: "11px 14px", borderRadius: 10, border: "none", background: "transparent", color: "#64748b", cursor: "pointer", textAlign: "left", fontSize: 14, fontFamily: "'DM Sans',sans-serif", transition: "all .2s" },
  sidebarBtnActive: { background: "rgba(99,102,241,.15)", color: "#a5b4fc" },
  sidebarBack: { padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(99,102,241,.2)", background: "transparent", color: "#475569", cursor: "pointer", textAlign: "left", fontSize: 13, fontFamily: "'DM Sans',sans-serif" },
  dashMain: { flex: 1, padding: "36px 40px", overflow: "auto" },
  dashTitle: { color: "#f1f5f9", fontSize: 30, fontWeight: 700, fontFamily: "'Playfair Display',serif", margin: 0 },
  dropZone: { border: "2px dashed rgba(99,102,241,.3)", borderRadius: 20, padding: "60px 40px", textAlign: "center", cursor: "pointer", transition: "all .3s", background: "rgba(99,102,241,.03)", marginBottom: 28 },
  dropZoneActive: { border: "2px dashed #6366f1", background: "rgba(99,102,241,.08)" },
  progressBar: { height: 6, background: "rgba(99,102,241,.15)", borderRadius: 3, marginTop: 20, overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius: 3, transition: "width .3s" },
  recentGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 16 },
  recentCard: { background: "rgba(15,23,42,.8)", border: "1px solid rgba(99,102,241,.1)", borderRadius: 14, padding: 16, textAlign: "center" },
  recentThumb: { width: "100%", height: 100, objectFit: "cover", borderRadius: 8, marginBottom: 10 },
  fileRow: { background: "rgba(15,23,42,.8)", border: "1px solid rgba(99,102,241,.1)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 },
  fileRowThumb: { width: 52, height: 52, borderRadius: 10, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(30,41,59,.8)" },
  actionBtn: { width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(99,102,241,.2)", background: "rgba(30,41,59,.8)", cursor: "pointer", fontSize: 16 },
  settingsBox: { background: "rgba(15,23,42,.8)", border: "1px solid rgba(99,102,241,.1)", borderRadius: 20, padding: 36, maxWidth: 520 },
  label: { display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 8, fontWeight: 500 },
  input: { width: "100%", padding: "13px 16px", background: "rgba(30,41,59,.8)", border: "1px solid rgba(99,102,241,.2)", borderRadius: 12, color: "#f1f5f9", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif" },
  saveBtn: { padding: "13px 28px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" },
  consumerBg: { minHeight: "100vh", background: "radial-gradient(ellipse at 20% 10%,#0c1445,#030712 50%)", position: "relative" },
  consumerTitle: { color: "#f1f5f9", fontSize: "clamp(32px,5vw,60px)", fontWeight: 900, fontFamily: "'Playfair Display',serif", margin: "0 0 8px", letterSpacing: "-1px" },
  controls: { display: "flex", gap: 14, padding: "0 40px 28px", flexWrap: "wrap", alignItems: "center" },
  searchInput: { flex: 1, minWidth: 200, padding: "12px 18px", background: "rgba(15,23,42,.8)", border: "1px solid rgba(99,102,241,.2)", borderRadius: 12, color: "#f1f5f9", fontSize: 14, outline: "none", fontFamily: "'DM Sans',sans-serif" },
  filterBtn: { padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(99,102,241,.15)", background: "transparent", color: "#64748b", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif" },
  filterBtnActive: { background: "rgba(99,102,241,.2)", color: "#a5b4fc", borderColor: "rgba(99,102,241,.4)" },
  consumerGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 20, padding: "0 40px 40px" },
  consumerCard: { background: "rgba(15,23,42,.9)", border: "1px solid rgba(99,102,241,.1)", borderRadius: 18, overflow: "hidden", cursor: "pointer", transition: "transform .2s,box-shadow .2s" },
  consumerThumb: { height: 160, background: "rgba(30,41,59,.8)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  dlBtn: { width: "100%", padding: 12, background: "rgba(99,102,241,.1)", border: "none", borderTop: "1px solid rgba(99,102,241,.1)", color: "#a5b4fc", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(10px)" },
  previewBox: { background: "rgba(15,23,42,.98)", border: "1px solid rgba(99,102,241,.2)", borderRadius: 24, padding: 36, maxWidth: 600, width: "90%", textAlign: "center", position: "relative", maxHeight: "90vh", overflow: "auto" },
  closeBtn: { position: "absolute", top: 16, right: 16, background: "rgba(30,41,59,.8)", border: "1px solid rgba(99,102,241,.2)", color: "#94a3b8", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 14 },
  empty: { textAlign: "center", padding: "80px 20px", color: "#475569", fontFamily: "'DM Sans',sans-serif" },
};
