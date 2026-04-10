import { useState } from "react";
import API from "../api";

function NoteForm({ refreshNotes }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (title.trim() === "") {
      alert("Title is required");
      return;
    }

    await API.post("/notes", { title, content });

    setTitle("");
    setContent("");
    refreshNotes();
  }

  return (
    <form className="bg-white p-6 rounded-2xl shadow-md mb-6" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-4">Create a Note</h2>

      <input
        type="text"
        placeholder="Title..."
        className="w-full border p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-black"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Write something..."
        className="w-full border p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-black"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition">
        Add Note
      </button>
    </form>
  );
}

export default NoteForm;