import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import API from "../api";

function NoteCard({ note, refreshNotes, colorScheme }) {
  const [isEditing, setIsEditing]     = useState(false);
  const [editTitle, setEditTitle]     = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [deleting, setDeleting]       = useState(false);

  const { card, accent, shadow } = colorScheme;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formattedDate = (() => {
    try {
      return new Date(note.createdAt).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      });
    } catch { return ""; }
  })();

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${note.title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeleting(true);
    await API.delete(`/notes/${note.id}`);
    refreshNotes();
  }

  async function handleUpdate() {
  console.log("Updating note...");
  if (editTitle.trim() === "") return;

  await API.put(`/notes/${note.id}`, {
    title: editTitle,
    content: editContent
  });

  console.log("Updated!");
  setIsEditing(false);
  refreshNotes();
}

  function cancelEdit() {
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
  }

  /* ── EDIT MODE ── */
  if (isEditing) {
    return (
      <>
        <style>{CARD_STYLES}</style>
        <div
          ref={setNodeRef}
          style={{ ...dndStyle, background: card, "--accent": accent, "--shadow": shadow }}
          className="note-card editing"
        >
          <div className="edit-header">
            <span className="edit-label">Editing</span>
            <button className="close-edit" onClick={cancelEdit}>✕</button>
          </div>
          <input
            className="edit-title-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key==="Escape") cancelEdit(); if (e.key==="Enter"&&e.metaKey) handleUpdate(); }}
            placeholder="Title…"
            autoFocus
          />
          <textarea
            className="edit-content-input"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={(e) => { if (e.key==="Escape") cancelEdit(); if (e.key==="Enter"&&e.metaKey) handleUpdate(); }}
            placeholder="Write something…"
            rows={4}
          />
          <div className="edit-actions">
            <button className="btn-save" onClick={handleUpdate}>Save changes</button>
            <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>
          </div>
          <p className="kbd-hint">⌘ + Enter to save</p>
        </div>
      </>
    );
  }

  /* ── VIEW MODE ── */
  return (
    <>
      <style>{CARD_STYLES}</style>
      <div
        ref={setNodeRef}
        style={{ ...dndStyle, background: card, "--accent": accent, "--shadow": shadow }}
        className={`note-card view ${isDragging ? "is-dragging" : ""} ${deleting ? "is-deleting" : ""}`}
        // ↓ drag listeners on the WHOLE card so anywhere you grab it works
        {...attributes}
        {...listeners}
      >
        {/* color strip at top */}
        <div className="color-strip" style={{ background: accent }} />

        {/* body */}
        <div className="card-body">
          <h3 className="card-title">{note.title}</h3>
          {note.content && <p className="card-content">{note.content}</p>}
        </div>

        {/* footer */}
        <div className="card-footer">
          <span className="card-date">{formattedDate}</span>
          <div className="card-actions">
            <button
              className="action-btn"
              style={{ "--btn-hover": accent }}
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              title="Edit"
              onPointerDown={(e) => e.stopPropagation()} // prevent drag triggering on button
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11.5 2.5a1.5 1.5 0 0 1 2 2L5 13H2v-3L11.5 2.5z"/>
              </svg>
            </button>
            <button
              className="action-btn delete"
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              title="Delete"
              onPointerDown={(e) => e.stopPropagation()} // prevent drag triggering on button
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5l.5-9"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const CARD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,700;0,800;1,700&display=swap');

  .note-card {
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: transform 0.22s cubic-bezier(0.34,1.3,0.64,1), box-shadow 0.22s ease;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    cursor: grab;
    user-select: none;
  }

  .note-card:active { cursor: grabbing; }

  /* lift + glow on hover */
  .note-card.view:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow:
      0 20px 50px var(--shadow),
      0 8px 20px rgba(0,0,0,0.12);
  }

  .note-card.is-dragging { opacity: 0; }

  .note-card.is-deleting {
    animation: cardDelete 0.3s ease forwards;
  }

  @keyframes cardDelete {
    to { opacity: 0; transform: scale(0.85); }
  }

  /* color strip */
  .color-strip {
    height: 5px;
    width: 100%;
    flex-shrink: 0;
    border-radius: 0;
  }

  /* body */
  .card-body { padding: 18px 18px 10px; flex: 1; }

  .card-title {
    font-weight: 700;
    font-size: 15px;
    color: #1A1A1A;
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 0;
  }

  .card-content {
    font-size: 13px;
    font-weight: 300;
    color: rgba(26,26,26,0.6);
    line-height: 1.65;
    margin-top: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* footer */
  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px 14px;
    margin-top: auto;
  }

  .card-date {
    font-size: 11px;
    font-weight: 400;
    color: rgba(26,26,26,0.38);
    letter-spacing: 0.02em;
  }

  .card-actions {
    display: flex;
    gap: 6px;
    opacity: 0;
    transition: opacity 0.18s;
  }

  .note-card.view:hover .card-actions { opacity: 1; }

  .action-btn {
    width: 30px; height: 30px;
    border-radius: 50%; border: none;
    background: rgba(0,0,0,0.08);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: rgba(26,26,26,0.6);
    transition: background 0.15s, transform 0.14s, color 0.15s;
  }

  .action-btn svg { width: 13px; height: 13px; }

  .action-btn:hover {
    background: var(--btn-hover);
    color: #fff;
    transform: scale(1.15);
  }

  .action-btn.delete:hover {
    background: #EF4444;
    color: #fff;
  }

  /* ── Edit mode ── */
  .note-card.editing {
    cursor: default;
    padding: 18px;
    gap: 12px;
    box-shadow: 0 16px 50px var(--shadow), 0 4px 16px rgba(0,0,0,0.12);
  }

  .edit-header {
    display: flex; align-items: center; justify-content: space-between;
  }

  .edit-label {
    font-size: 10px; font-weight: 600;
    color: var(--accent);
    text-transform: uppercase; letter-spacing: 0.1em;
  }

  .close-edit {
    width: 26px; height: 26px; border-radius: 50%; border: none;
    background: rgba(0,0,0,0.08); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; color: rgba(26,26,26,0.5);
    transition: background 0.15s;
  }
  .close-edit:hover { background: rgba(0,0,0,0.15); }

  .edit-title-input,
  .edit-content-input {
    width: 100%; border: none; border-radius: 12px;
    padding: 10px 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #1A1A1A; outline: none; background: rgba(255,255,255,0.55);
    transition: background 0.15s, box-shadow 0.15s;
  }

  .edit-title-input:focus,
  .edit-content-input:focus {
    background: rgba(255,255,255,0.85);
    box-shadow: 0 0 0 2px var(--accent);
  }

  .edit-title-input {
    font-size: 14px; font-weight: 700;
  }

  .edit-content-input {
    font-size: 13px; font-weight: 300;
    line-height: 1.6; resize: none;
  }

  .edit-actions { display: flex; gap: 8px; }

  .btn-save {
    flex: 1; border: none; border-radius: 10px; padding: 10px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 700; color: #fff;
    background: var(--accent); cursor: pointer;
    transition: opacity 0.15s, transform 0.12s;
  }
  .btn-save:hover { opacity: 0.88; transform: translateY(-1px); }

  .btn-cancel {
    flex: 1; border: none; border-radius: 10px; padding: 10px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    color: rgba(26,26,26,0.55);
    background: rgba(0,0,0,0.08); cursor: pointer;
    transition: background 0.15s;
  }
  .btn-cancel:hover { background: rgba(0,0,0,0.14); }

  .kbd-hint {
    text-align: center; font-size: 10px;
    color: rgba(26,26,26,0.3); letter-spacing: 0.03em;
  }
`;

export default NoteCard;
