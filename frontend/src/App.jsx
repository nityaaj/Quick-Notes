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
import AuthPage from "./components/AuthPage";

export const CARD_COLORS = [
	{ id: "yellow", bg: "#FFF3CC", accent: "#E6B800" },
	{ id: "pink", bg: "#FFE0E0", accent: "#E05555" },
	{ id: "green", bg: "#D9F5E8", accent: "#2E9E65" },
	{ id: "blue", bg: "#E0EEFF", accent: "#3070D6" },
	{ id: "purple", bg: "#F0E0FF", accent: "#8040C8" },
	{ id: "peach", bg: "#FFE8D6", accent: "#D06020" },
];

function App() {
	const [user, setUser] = useState(() => {
		const savedUser = localStorage.getItem("notesUser");
		try {
			return savedUser ? JSON.parse(savedUser) : null;
		} catch {
			localStorage.removeItem("notesUser");
			return null;
		}
	});

	const [notes, setNotes] = useState([]);
	const [activeNote, setActiveNote] = useState(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const [search, setSearch] = useState("");
	const [showForm, setShowForm] = useState(false);

	async function fetchNotes() {
		if (!user?.id) return;
		const res = await API.get(`/notes?userId=${encodeURIComponent(user.id)}`);
		setNotes(res.data);
	}

	useEffect(() => {
		fetchNotes();
	}, [user]);

	function handleAuth(authUser) {
		localStorage.setItem("notesUser", JSON.stringify(authUser));
		setUser(authUser);
	}

	function handleLogout() {
		localStorage.removeItem("notesUser");
		setUser(null);
		setNotes([]);
		setSearch("");
		setShowForm(false);
	}

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
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
			(n.content || "").toLowerCase().includes(search.toLowerCase()),
	);

	const activeColor = activeNote
		? CARD_COLORS[activeIndex % CARD_COLORS.length]
		: null;

	const userInitial = (user?.email || "U").charAt(0).toUpperCase();

	if (!user) return <AuthPage onAuth={handleAuth} />;

	return (
		<div className="min-h-screen bg-[#F7F5F0] text-[#1A1A1A] font-sans">
			<div className="max-w-[1400px] mx-auto px-8 pt-12 pb-20">
				{/* HEADER */}
				<header className="mb-12">
					{/* Title row — always visible */}
					<div className="flex items-end justify-between gap-4 mb-4">
						<div>
							<h1 className="text-[clamp(2.6rem,6vw,4rem)] leading-none tracking-[-0.02em] font-serif">
								My Notes
							</h1>
							<p className="text-[13px] text-[#999] mt-[6px] tracking-[0.04em]">
								drag to reorder · click to edit
							</p>
						</div>

						{/* Desktop: show full controls inline with title */}
						<div className="hidden sm:flex items-center gap-3">
							{/* SEARCH */}
							<div className="relative">
								<svg
									className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa] w-[15px] h-[15px]"
									viewBox="0 0 20 20"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<circle cx="8.5" cy="8.5" r="5.5" />
									<path d="M14 14l3 3" strokeLinecap="round" />
								</svg>
								<input
									className="bg-[#EEEBE5] rounded-full pl-9 pr-4 py-[10px] text-[13px]
            w-[200px] focus:w-[240px] focus:bg-[#E8E4DC] outline-none transition-all duration-200"
									placeholder="Search..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</div>

							{/* PROFILE */}
							<details className="relative">
								<summary className="flex items-center gap-2 bg-[#EEEBE5] rounded-full px-3 py-[7px] text-[12px] text-[#777] cursor-pointer max-w-[170px]">
									<span className="w-6 h-6 flex items-center justify-center bg-black text-white rounded-full text-[11px]">
										{userInitial}
									</span>
									<span className="truncate">{user.email}</span>
								</summary>
								<div className="absolute right-0 mt-2 bg-white rounded-lg shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-2 min-w-[190px] z-10">
									<p className="text-[12px] text-[#999] p-2 break-words">
										{user.email}
									</p>
									<button
										onClick={handleLogout}
										className="w-full text-left bg-black text-white rounded-lg px-3 py-[9px] text-[13px] hover:bg-[#333] transition"
									>
										Logout
									</button>
								</div>
							</details>

							{/* ADD BUTTON */}
							<button
								onClick={() => setShowForm(true)}
								className="flex items-center gap-2 bg-black text-white rounded-full px-5 py-[10px]
          text-[13px] hover:bg-[#333] active:scale-95 transition-all duration-150"
							>
								<span className="w-[18px] h-[18px] flex items-center justify-center bg-white text-black rounded-full text-[16px]">
									+
								</span>
								New Note
							</button>
						</div>
					</div>

					{/* Mobile: compact toolbar row */}
					<div className="flex sm:hidden items-center gap-2">
						{/* SEARCH — grows to fill space */}
						<div className="relative flex-1">
							<svg
								className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa] w-[14px] h-[14px]"
								viewBox="0 0 20 20"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<circle cx="8.5" cy="8.5" r="5.5" />
								<path d="M14 14l3 3" strokeLinecap="round" />
							</svg>
							<input
								className="w-full bg-[#EEEBE5] rounded-full pl-9 pr-4 py-[9px] text-[13px]
          focus:bg-[#E8E4DC] outline-none transition-all duration-200"
								placeholder="Search..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>

						{/* PROFILE — icon only on mobile */}
						<details className="relative flex-shrink-0">
							<summary className="flex items-center justify-center w-9 h-9 bg-[#EEEBE5] rounded-full cursor-pointer list-none">
								<span className="w-6 h-6 flex items-center justify-center bg-black text-white rounded-full text-[11px]">
									{userInitial}
								</span>
							</summary>
							<div className="absolute right-0 mt-2 bg-white rounded-lg shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-2 min-w-[190px] z-10">
								<p className="text-[12px] text-[#999] p-2 break-words">
									{user.email}
								</p>
								<button
									onClick={handleLogout}
									className="w-full text-left bg-black text-white rounded-lg px-3 py-[9px] text-[13px] hover:bg-[#333] transition"
								>
									Logout
								</button>
							</div>
						</details>

						{/* ADD BUTTON — compact label on mobile */}
						<button
							onClick={() => setShowForm(true)}
							className="flex-shrink-0 flex items-center gap-1.5 bg-black text-white
        rounded-full px-4 py-[9px] text-[13px] hover:bg-[#333] active:scale-95 transition-all duration-150"
						>
							<span className="w-[16px] h-[16px] flex items-center justify-center bg-white text-black rounded-full text-[14px] leading-none">
								+
							</span>
							New
						</button>
					</div>
				</header>

				{/* COUNT */}
				<p className="text-[11px] text-[#BBB] tracking-[0.1em] uppercase mb-6">
					{filtered.length} {filtered.length === 1 ? "note" : "notes"}
				</p>

				{/* GRID */}
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
						<div className="grid gap-[18px] grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
							{filtered.length === 0 ? (
								<div className="col-span-full text-center py-20 text-[#CCC]">
									<div className="text-5xl mb-3">📋</div>
									<p className="text-[15px]">No notes yet</p>
									<span className="text-[13px] text-[#DDD]">
										Click "New Note" to get started
									</span>
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

					{/* DRAG OVERLAY FIXED */}
					<DragOverlay>
						{activeNote && activeColor && (
							<div
								className="
                  rounded-2xl p-5
                  shadow-[0_24px_60px_rgba(0,0,0,0.18)]
                  scale-105
                  pointer-events-none
                "
								style={{ background: activeColor.bg }}
							>
								<p className="text-[14px] font-medium">{activeNote.title}</p>
							</div>
						)}
					</DragOverlay>
				</DndContext>
			</div>

			{/* MODAL FIXED */}
			{showForm && (
				<div
					onClick={() => setShowForm(false)}
					className="
            fixed inset-0
            bg-[rgba(20,18,14,0.35)]
            backdrop-blur-md
            flex items-center justify-center
            p-6 z-[100]
          "
				>
					<div
						onClick={(e) => e.stopPropagation()}
						className="animate-[fadeIn_0.2s_ease]"
					>
						<NoteForm
							refreshNotes={fetchNotes}
							onClose={() => setShowForm(false)}
							colors={CARD_COLORS}
							userId={user.id}
						/>
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
