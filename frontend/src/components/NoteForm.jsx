import { useState } from "react";
import API from "../api";

function NoteForm({ refreshNotes, onClose, colors, userId }) {
  const [title, setTitle]       = useState("");
  const [content, setContent]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [pickedId, setPickedId] = useState(colors[0].id);

  const picked = colors.find((c) => c.id === pickedId) || colors[0];

  async function handleSubmit() {
    if (title.trim() === "") return;
    setLoading(true);
    await API.post("/notes", { title, content, userId, colorId: pickedId });
    setLoading(false);
    refreshNotes();
    onClose();
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && e.metaKey) handleSubmit();
  }

  const canSubmit = !loading && title.trim() !== "";

  return (
    <div
      onKeyDown={handleKeyDown}
      className="w-[min(460px,92vw)] rounded-[20px] overflow-hidden font-sans
        bg-white/55 backdrop-blur-xl
        border border-white/70
        shadow-[0_32px_80px_rgba(0,0,0,0.22),0_8px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)]"
    >
      {/* Accent strip */}
      <div className="h-[5px] w-full transition-colors duration-300" style={{ background: picked.accent }} />

      <div className="px-6 py-5 flex flex-col gap-3">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.1em] mb-[3px] transition-colors duration-300"
              style={{ color: picked.accent }}
            >
              New Note
            </p>
            <h2 className="text-[19px] font-extrabold text-[#1a1a1a] tracking-[-0.025em] leading-tight m-0">
              What's on your mind?
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/[0.08] flex items-center justify-center
              text-black/40 flex-shrink-0 border-none cursor-pointer
              hover:bg-black/[0.15] hover:rotate-90 transition-all duration-200"
          >
            <svg className="w-[11px] h-[11px]" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13"/>
            </svg>
          </button>
        </div>

        {/* Title input */}
        <input
          type="text"
          placeholder="Give it a title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className="w-full rounded-xl px-[14px] py-[11px] text-[14px] font-bold
            text-[#1a1a1a] placeholder:text-black/35
            bg-white/60 border-[1.5px] border-black/[0.08]
            outline-none transition-all duration-200
            focus:bg-white/90 focus:border-[1.5px]"
          style={{ "--tw-ring-color": picked.accent }}
          onFocus={(e) => {
            e.target.style.borderColor = picked.accent;
            e.target.style.boxShadow = `0 0 0 3px ${picked.accent}30`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(0,0,0,0.08)";
            e.target.style.boxShadow = "none";
          }}
        />

        {/* Content textarea */}
        <textarea
          rows={4}
          placeholder="Start writing… (optional)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-xl px-[14px] py-[11px] text-[13px] font-normal
            leading-relaxed text-[#1a1a1a] placeholder:text-black/35
            bg-white/60 border-[1.5px] border-black/[0.08]
            outline-none resize-none transition-all duration-200
            focus:bg-white/90"
          onFocus={(e) => {
            e.target.style.borderColor = picked.accent;
            e.target.style.boxShadow = `0 0 0 3px ${picked.accent}30`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(0,0,0,0.08)";
            e.target.style.boxShadow = "none";
          }}
        />

        {/* Color picker */}
        <div className="flex flex-col gap-[7px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-black/40">
            Card color
          </p>
          <div className="flex gap-2 flex-wrap">
            {colors.map((c) => (
              <button
                key={c.id}
                onClick={() => setPickedId(c.id)}
                className={`w-[30px] h-[30px] rounded-full flex items-center justify-center
                  flex-shrink-0 border-2 cursor-pointer
                  transition-transform duration-200
                  ${pickedId === c.id ? "scale-125" : "scale-100 hover:scale-110"}`}
                style={{
                  background: c.bg,
                  borderColor: pickedId === c.id ? c.accent : "transparent",
                  boxShadow: pickedId === c.id
                    ? `0 0 0 2px ${c.accent}, 0 4px 10px rgba(0,0,0,0.15)`
                    : "0 2px 6px rgba(0,0,0,0.12)",
                }}
                title={c.id}
              >
                {pickedId === c.id && (
                  <svg className="w-[11px] h-[11px]" viewBox="0 0 12 12" fill="none" stroke={c.accent} strokeWidth="2.8" strokeLinecap="round">
                    <path d="M2 6l3 3 5-5"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full rounded-xl py-[13px] text-[13px] font-extrabold
            text-white border-none tracking-[0.01em]
            transition-all duration-200
            enabled:hover:-translate-y-[1px] enabled:hover:brightness-110
            enabled:active:scale-[0.97]
            disabled:cursor-not-allowed"
          style={{
            background: canSubmit ? picked.accent : "rgba(0,0,0,0.12)",
          }}
        >
          {loading ? "Saving..." : "✦ Add Note"}
        </button>

        <p className="text-center text-[10px] text-black/30 tracking-[0.03em]">
          ⌘ + Enter to save · Esc to close
        </p>
      </div>
    </div>
  );
}

export default NoteForm;