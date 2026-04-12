import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import API from "./api";
import NoteForm from "./components/NoteForm";
import NoteCard from "./components/NoteCard";

export const CARD_COLORS = [
  { bg: "#FFF3CC", accent: "#E6B800" },
  { bg: "#FFE0E0", accent: "#E05555" },
  { bg: "#D9F5E8", accent: "#2E9E65" },
  { bg: "#E0EEFF", accent: "#3070D6" },
  { bg: "#F0E0FF", accent: "#8040C8" },
  { bg: "#FFE8D6", accent: "#D06020" },
];

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function fetchNotes() {
    const res = await API.get("/notes");
    setNotes(res.data);
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragStart(event) {
    const idx = notes.findIndex((n) => n.id === event.active.id);
    setActiveNote(notes[idx]);
    setActiveIndex(idx);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveNote(null);
    if (!over || active.id === over.id) return;
    setNotes((prev) => {
      const oldIndex = prev.findIndex((n) => n.id === active.id);
      const newIndex = prev.findIndex((n) => n.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  const filtered = notes.filter(
    (n) =>
      (n.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (n.content || "").toLowerCase().includes(search.toLowerCase())
  );

  const activeColor =
    activeNote ? CARD_COLORS[activeIndex % CARD_COLORS.length] : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #F7F5F0;
          font-family: 'DM Sans', sans-serif;
          color: #1A1A1A;
          min-height: 100vh;
        }

        .app-wrapper {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 32px 80px;
        }

        /* ── Header ── */
        .header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 48px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .header-left h1 {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(2.6rem, 6vw, 4rem);
          font-weight: 400;
          line-height: 1;
          color: #1A1A1A;
          letter-spacing: -0.02em;
        }

        .header-left p {
          font-size: 13px;
          color: #999;
          font-weight: 300;
          margin-top: 6px;
          letter-spacing: 0.04em;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* ── Search ── */
        .search-wrap {
          position: relative;
        }

        .search-wrap svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #aaa;
          pointer-events: none;
          width: 15px;
          height: 15px;
        }

        .search-input {
          background: #EEEBE5;
          border: none;
          border-radius: 24px;
          padding: 10px 16px 10px 36px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #333;
          outline: none;
          width: 200px;
          transition: background 0.2s, width 0.3s;
        }

        .search-input:focus {
          background: #E8E4DC;
          width: 240px;
        }

        .search-input::placeholder { color: #BBB; }

        /* ── Add button ── */
        .add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #1A1A1A;
          color: #fff;
          border: none;
          border-radius: 24px;
          padding: 10px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }

        .add-btn:hover { background: #333; transform: translateY(-1px); }
        .add-btn:active { transform: scale(0.97); }

        .add-btn-icon {
          width: 18px;
          height: 18px;
          background: #fff;
          color: #1A1A1A;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          line-height: 1;
          flex-shrink: 0;
        }

        /* ── Note count ── */
        .note-count {
          font-size: 11px;
          font-weight: 400;
          color: #BBB;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        /* ── Grid ── */
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 18px;
        }

        /* ── Empty ── */
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 0;
          color: #CCC;
        }

        .empty-state .emoji { font-size: 48px; margin-bottom: 12px; }
        .empty-state p { font-size: 15px; font-weight: 300; }
        .empty-state span { font-size: 13px; color: #DDD; }

        /* ── Modal overlay ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(20, 18, 14, 0.35);
          backdrop-filter: blur(6px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: fadeIn 0.18s ease;
        }

        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

        .modal-card {
          animation: slideUp 0.22s cubic-bezier(0.34, 1.3, 0.64, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97) }
          to   { opacity: 1; transform: translateY(0) scale(1) }
        }

        /* ── Drag overlay ── */
        .drag-ghost {
          border-radius: 20px;
          padding: 20px;
          transform: rotate(2.5deg) scale(1.04);
          box-shadow: 0 24px 60px rgba(0,0,0,0.18);
          pointer-events: none;
        }

        .drag-ghost-title {
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 14px;
          color: #1A1A1A;
        }
      `}</style>

      <div className="app-wrapper">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <h1>My Notes</h1>
            <p>drag to reorder · click to edit</p>
          </div>
          <div className="header-right">
            <div className="search-wrap">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="8.5" cy="8.5" r="5.5" />
                <path d="M14 14l3 3" strokeLinecap="round" />
              </svg>
              <input
                className="search-input"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="add-btn" onClick={() => setShowForm(true)}>
              <span className="add-btn-icon">+</span>
              New Note
            </button>
          </div>
        </header>

        {/* Note count */}
        <p className="note-count">
          {filtered.length} {filtered.length === 1 ? "note" : "notes"}
        </p>

        {/* Grid with DnD */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filtered.map((n) => n.id)}
            strategy={rectSortingStrategy}
          >
            <div className="notes-grid">
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="emoji">📋</div>
                  <p>No notes yet</p>
                  <span>Click "New Note" to get started</span>
                </div>
              ) : (
                filtered.map((note, i) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    refreshNotes={fetchNotes}
                    colorScheme={CARD_COLORS[i % CARD_COLORS.length]}
                  />
                ))
              )}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeNote && activeColor && (
              <div
                className="drag-ghost"
                style={{ background: activeColor.bg }}
              >
                <p className="drag-ghost-title">{activeNote.title}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <NoteForm
              refreshNotes={fetchNotes}
              onClose={() => setShowForm(false)}
              colors={CARD_COLORS}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default App;