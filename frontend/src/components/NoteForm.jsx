import { useState } from "react";
import API from "../api";

const PICK_COLORS = [
  "bg-orange-300",
  "bg-yellow-200",
  "bg-purple-300",
  "bg-cyan-300",
  "bg-lime-300",
  "bg-pink-300",
];

function NoteForm({ refreshNotes, onClose }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [pickedColor, setPickedColor] = useState("bg-yellow-200");

  async function handleSubmit() {
    if (title.trim() === "") return;
    setLoading(true);
    await API.post("/notes", { title, content });
    setTitle("");
    setContent("");
    setLoading(false);
    refreshNotes();
    onClose();
  }

  return (
    <div className={`${pickedColor} rounded-3xl shadow-2xl w-full max-w-md p-7 flex flex-col gap-4`}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900">New Note</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-900/10 hover:bg-gray-900/20 flex items-center justify-center text-gray-700 text-sm transition-all"
        >
          ✕
        </button>
      </div>

      {/* Inputs */}
      <input
        type="text"
        className="bg-white/50 focus:bg-white/80 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 placeholder-gray-500 outline-none transition-all"
        placeholder="Give it a title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />

      <textarea
        className="bg-white/50 focus:bg-white/80 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-500 outline-none transition-all resize-none"
        placeholder="What's on your mind?"
        rows={5}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* Color picker */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600 font-semibold mr-1">Color:</span>
        {PICK_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setPickedColor(c)}
            className={`w-6 h-6 rounded-full ${c} transition-transform hover:scale-110 ${pickedColor === c ? "ring-2 ring-gray-900 ring-offset-1 scale-110" : ""}`}
          />
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || title.trim() === ""}
        className="bg-gray-900 text-white rounded-2xl py-3 text-sm font-bold hover:bg-gray-700 transition-all hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
      >
        {loading ? "Saving..." : "Add Note ✦"}
      </button>
    </div>
  );
}

export default NoteForm;