import { useState } from "react";
import API from "../api";

function NoteForm({ refreshNotes, onClose, colors, userId }) {
  const [title, setTitle]         = useState("");
  const [content, setContent]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [pickedId, setPickedId]   = useState(colors[0].id);

  const picked = colors.find((c) => c.id === pickedId) || colors[0];

  async function handleSubmit() {
    if (title.trim() === "") return;
    setLoading(true);
    // ✅ colorId is saved with the note so the card ALWAYS shows the right color
    await API.post("/notes", { title, content, userId });
    setLoading(false)
    refreshNotes();
    onClose();
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && e.metaKey) handleSubmit();
  }

  const canSubmit = !loading && title.trim() !== "";

  return (
    <>
      <style>{FORM_STYLES}</style>

      {/* Live preview: form bg transitions as you pick colors */}
      <div
        className="note-form"
        style={{ "--card": picked.card, "--accent": picked.accent, "--shadow": picked.shadow }}
        onKeyDown={handleKeyDown}
      >
        {/* top accent bar */}
        <div className="form-accent-bar" style={{ background: picked.accent }} />

        <div className="form-body">
          {/* header */}
          <div className="form-header">
            <div>
              <p className="form-eyebrow">New Note</p>
              <h2 className="form-title">What's on your mind?</h2>
            </div>
            <button className="close-btn" onClick={onClose}>
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13"/>
              </svg>
            </button>
          </div>

          {/* inputs */}
          <input
            className="form-input title-input"
            type="text"
            placeholder="Give it a title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <textarea
            className="form-input content-input"
            placeholder="Start writing… (optional)"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* color picker */}
          <div className="picker-section">
            <p className="picker-label">Card color</p>
            <div className="color-grid">
              {colors.map((c) => (
                <button
                  key={c.id}
                  className={`color-swatch ${pickedId === c.id ? "selected" : ""}`}
                  style={{
                    background: c.card,
                    borderColor: pickedId === c.id ? c.accent : "transparent",
                    boxShadow: pickedId === c.id
                      ? `0 0 0 3px ${c.accent}55, 0 4px 12px ${c.shadow}`
                      : "0 2px 6px rgba(0,0,0,0.1)",
                  }}
                  onClick={() => setPickedId(c.id)}
                  title={c.id}
                >
                  {pickedId === c.id && (
                    <svg viewBox="0 0 12 12" fill="none" stroke={c.accent} strokeWidth="2.5" strokeLinecap="round">
                      <path d="M2 6l3 3 5-5"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* submit */}
          <button
            className="submit-btn"
            style={{ background: canSubmit ? picked.accent : "#ccc", cursor: canSubmit ? "pointer" : "not-allowed" }}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {loading
              ? <span className="loading-dots">Saving<span>.</span><span>.</span><span>.</span></span>
              : "✦ Add Note"}
          </button>

          <p className="kbd-hint">⌘ + Enter to save · Esc to close</p>
        </div>
      </div>
    </>
  );
}

const FORM_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,700;0,800;1,700&display=swap');

  .note-form {
    width: min(470px, 94vw);
    border-radius: 24px;
    overflow: hidden;
    background: var(--card);
    font-family: 'Plus Jakarta Sans', sans-serif;
    box-shadow:
      0 40px 100px var(--shadow),
      0 16px 40px rgba(0,0,0,0.25),
      0 0 0 1px rgba(255,255,255,0.08);
    transition: background 0.3s ease;
  }

  .form-accent-bar {
    height: 6px; width: 100%;
    transition: background 0.3s ease;
  }

  .form-body {
    padding: 26px 28px 24px;
    display: flex; flex-direction: column; gap: 14px;
  }

  .form-header {
    display: flex; align-items: flex-start; justify-content: space-between;
  }

  .form-eyebrow {
    font-size: 10px; font-weight: 600;
    color: var(--accent); text-transform: uppercase;
    letter-spacing: 0.1em; margin-bottom: 3px;
    transition: color 0.3s;
  }

  .form-title {
    font-size: 20px; font-weight: 800;
    color: #1A1A1A; letter-spacing: -0.02em; line-height: 1.2;
  }

  .close-btn {
    width: 34px; height: 34px; border-radius: 50%; border: none;
    background: rgba(0,0,0,0.07); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: rgba(26,26,26,0.45); flex-shrink: 0;
    transition: background 0.15s, transform 0.15s;
  }

  .close-btn svg { width: 12px; height: 12px; }
  .close-btn:hover { background: rgba(0,0,0,0.14); transform: rotate(90deg); }

  .form-input {
    width: 100%; border: 2px solid transparent;
    border-radius: 14px; padding: 12px 16px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #1A1A1A; outline: none;
    background: rgba(255,255,255,0.5);
    transition: background 0.15s, border-color 0.2s, box-shadow 0.2s;
  }

  .form-input:focus {
    background: rgba(255,255,255,0.85);
    border-color: var(--accent);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 15%, transparent);
  }

  .form-input::placeholder { color: rgba(26,26,26,0.35); }

  .title-input { font-size: 15px; font-weight: 700; }
  .content-input { font-size: 13px; font-weight: 300; line-height: 1.65; resize: none; }

  /* Color picker */
  .picker-section { display: flex; flex-direction: column; gap: 8px; }

  .picker-label {
    font-size: 10px; font-weight: 600;
    color: rgba(26,26,26,0.45); text-transform: uppercase; letter-spacing: 0.08em;
  }

  .color-grid {
    display: flex; gap: 8px; flex-wrap: wrap;
  }

  .color-swatch {
    width: 32px; height: 32px; border-radius: 50%;
    border: 2.5px solid transparent;
    cursor: pointer; position: relative;
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.18s cubic-bezier(0.34,1.5,0.64,1), box-shadow 0.18s;
    flex-shrink: 0;
  }

  .color-swatch:hover { transform: scale(1.18); }
  .color-swatch.selected { transform: scale(1.2); }

  .color-swatch svg { width: 12px; height: 12px; }

  /* Submit */
  .submit-btn {
    border: none; border-radius: 14px; padding: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; font-weight: 800;
    color: #fff; letter-spacing: 0.01em;
    transition: transform 0.16s, box-shadow 0.16s, filter 0.16s, background 0.3s;
    box-shadow: 0 4px 16px var(--shadow);
  }

  .submit-btn:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px var(--shadow);
    filter: brightness(1.08);
  }

  .submit-btn:not(:disabled):active { transform: scale(0.97); }

  .loading-dots span {
    animation: dotBounce 1s infinite;
    display: inline-block;
  }
  .loading-dots span:nth-child(2) { animation-delay: 0.15s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.3s; }

  @keyframes dotBounce {
    0%,80%,100% { transform: translateY(0); }
    40%          { transform: translateY(-4px); }
  }

  .kbd-hint {
    text-align: center; font-size: 10px;
    color: rgba(26,26,26,0.28); letter-spacing: 0.03em;
  }
`;

export default NoteForm;