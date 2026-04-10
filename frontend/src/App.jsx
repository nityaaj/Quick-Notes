import { useEffect, useState } from "react";
import API from "./api";
import NoteForm from "./components/NoteForm";
import NoteCard from "./components/NoteCard";

function App() {
  const [notes, setNotes] = useState([]);

  async function fetchNotes() {
    const res = await API.get("/notes");
    setNotes(res.data);
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-center mb-8">
          QuickNotes 📝
        </h1>

        {/* Form */}
        <NoteForm refreshNotes={fetchNotes} />

        {/* Notes Grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {notes.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full">
              No notes yet. Start writing ✍️
            </p>
          ) : (
            notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                refreshNotes={fetchNotes}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default App;