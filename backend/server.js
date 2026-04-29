const http = require("http");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const PORT = process.env.PORT || 5002;

// ── helpers ──────────────────────────────────────────────
function hashPassword(password) {
	return crypto.createHash("sha256").update(password).digest("hex");
}

function parseBody(req) {
	return new Promise((resolve) => {
		let body = "";
		req.on("data", (chunk) => (body += chunk.toString()));
		req.on("end", () => {
			try {
				resolve(JSON.parse(body));
			} catch {
				resolve({});
			}
		});
	});
}
// ─────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
	const url = new URL(req.url, `http://localhost:${PORT}`);
	const pathname = url.pathname.replace(/\/$/, "") || "/";

	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, OPTIONS",
	);
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");

	if (req.method === "OPTIONS") {
		res.writeHead(200);
		return res.end();
	}

	try {
		// ── REGISTER ─────────────────────────────────────────
		if (req.method === "POST" && pathname === "/auth/register") {
			const { email, password } = await parseBody(req);

			if (!email || !password) {
				res.writeHead(400);
				return res.end(
					JSON.stringify({ error: "Email and password required" }),
				);
			}

			const existing = await prisma.user.findUnique({
				where: { email },
			});

			if (existing) {
				res.writeHead(409);
				return res.end(JSON.stringify({ error: "Email already exists" }));
			}

			const user = await prisma.user.create({
				data: {
					email,
					password: hashPassword(password),
				},
			});

			const { password: _, ...safeUser } = user;

			res.writeHead(201, { "Content-Type": "application/json" });
			return res.end(JSON.stringify({ user: safeUser }));
		}

		// ── LOGIN ────────────────────────────────────────────
		if (req.method === "POST" && pathname === "/auth/login") {
			const { email, password } = await parseBody(req);

			const user = await prisma.user.findUnique({
				where: { email },
			});

			if (!user || user.password !== hashPassword(password)) {
				res.writeHead(401);
				return res.end(JSON.stringify({ error: "Invalid credentials" }));
			}

			const { password: _, ...safeUser } = user;

			res.writeHead(200, { "Content-Type": "application/json" });
			return res.end(JSON.stringify({ user: safeUser }));
		}

		// ── GET NOTES ────────────────────────────────────────
		if (req.method === "GET" && pathname === "/notes") {
			const userId = url.searchParams.get("userId");

			if (!userId) {
				res.writeHead(400, { "Content-Type": "application/json" });
				return res.end(JSON.stringify({ error: "User ID is required" }));
			}

			const notes = await prisma.note.findMany({
				where: {
					deletedAt: null,
					OR: [
						{ userId },
						{ sharedWith: { has: userId } },
					],
				},
				orderBy: { createdAt: "desc" },
			});

			res.writeHead(200, { "Content-Type": "application/json" });
			return res.end(JSON.stringify(notes));
		}

		// ── CREATE NOTE ──────────────────────────────────────
		if (req.method === "POST" && pathname === "/notes") {
			const { title, content, userId, colorId } = await parseBody(req);

			if (!title || title.trim() === "") {
				res.writeHead(400);
				return res.end("Title is required");
			}

			const note = await prisma.note.create({
				data: {
					title,
					content,
					userId,
					colorId,
				},
			});

			res.writeHead(201, { "Content-Type": "application/json" });
			return res.end(JSON.stringify(note));
		}

		// ── UPDATE NOTE ──────────────────────────────────────
		if (req.method === "PUT" && pathname.startsWith("/notes/")) {
			const id = pathname.split("/").pop();
			const { title, content } = await parseBody(req);

			const updatedNote = await prisma.note.update({
				where: { id },
				data: {
					title,
					content,
					updatedAt: new Date(),
				},
			});

			res.writeHead(200, { "Content-Type": "application/json" });
			return res.end(JSON.stringify(updatedNote));
		}

		// ── DELETE NOTE ──────────────────────────────────────
		if (req.method === "DELETE" && pathname.startsWith("/notes/")) {
			const id = pathname.split("/").pop();

			// check note exists
			const note = await prisma.note.findUnique({
				where: { id },
			});

			if (!note) {
				res.writeHead(404);
				return res.end(JSON.stringify({ error: "Note not found" }));
			}

			await prisma.note.update({
				where: { id },
				data: {
					deletedAt: new Date(),
					updatedAt: new Date(),
				},
			});

			res.writeHead(200);
			return res.end(JSON.stringify({ message: "Soft deleted" }));
		}

		// ── SHARE NOTE ────────────────────────────────────────
		if (req.method === "POST" && pathname === "/notes/share") {
			const { noteId, sharedWithEmail } = await parseBody(req);

			if (!noteId || !sharedWithEmail) {
				res.writeHead(400);
				return res.end(JSON.stringify({ error: "Note ID and email required" }));
			}

			const userToShareWith = await prisma.user.findUnique({
				where: { email: sharedWithEmail },
			});

			if (!userToShareWith) {
				res.writeHead(404);
				return res.end(JSON.stringify({ error: "User not found" }));
			}

			const note = await prisma.note.findUnique({
				where: { id: noteId },
			});

			if (!note) {
				res.writeHead(404);
				return res.end(JSON.stringify({ error: "Note not found" }));
			}

			if (!note.sharedWith) {
				note.sharedWith = [];
			}

			if (note.sharedWith.includes(userToShareWith.id)) {
				res.writeHead(200, { "Content-Type": "application/json" });
				return res.end(JSON.stringify({ message: "Note already shared" }));
			}

			await prisma.note.update({
				where: { id: noteId },
				data: {
					isShared: true,
					sharedWith: [...note.sharedWith, userToShareWith.id],
					updatedAt: new Date(),
				},
			});

			res.writeHead(200);
			return res.end(JSON.stringify({ message: "Note shared successfully" }));
		}

		// ── NOT FOUND ────────────────────────────────────────
		res.writeHead(404);
		res.end("Route not found");
	} catch (err) {
		console.error(err);
		res.writeHead(500);
		res.end(JSON.stringify({ error: "Server error" }));
	}
});

server.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
