import API from "../api";

function NoteCard({ note, refreshNotes }) {
  async function handleDelete() {
    await API.delete(`/notes/${note.id}`);
    refreshNotes();
  }

  return (
    <div className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold">{note.title}</h3>
        <p className="text-gray-600 mt-2 text-sm">{note.content}</p>
      </div>

      <div className="flex justify-between items-center mt-5 text-xs text-gray-400">
        <span>
          {new Date(note.createdAt).toLocaleString()}
        </span>

        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default NoteCard;