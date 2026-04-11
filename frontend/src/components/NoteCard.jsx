import { useState } from "react";
import API from "../api";

function NoteCard({ note, refreshNotes }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);

  async function handleDelete() {
    await API.delete(`/notes/${note.id}`);
    refreshNotes();
  }

  async function handleUpdate() {
    if (editTitle.trim() === "") {
      alert("Title required");
      return;
    }

    await API.put(`/notes/${note.id}`, {
      title: editTitle,
      content: editContent,
    });

    setIsEditing(false);
    refreshNotes();
  }

  return (
    <div className="bg-white p-5 rounded-2xl shadow-md">

      {/* EDIT MODE */}
      {isEditing ? (
        <>
          <input
            className="w-full border p-2 mb-2 rounded"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />

          <textarea
            className="w-full border p-2 mb-3 rounded"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Save
            </button>

            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-400 text-white px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          {/* VIEW MODE */}
          <h3 className="text-lg font-semibold">{note.title}</h3>
          <p className="text-gray-600 mt-2 text-sm">{note.content}</p>

          <div className="flex justify-between mt-4 text-sm">
            <span className="text-gray-400">
              {new Date(note.createdAt).toLocaleString()}
            </span>

            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-500"
              >
                Edit
              </button>

              <button
                onClick={handleDelete}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NoteCard;