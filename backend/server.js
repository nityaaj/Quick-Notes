const http = require("http");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const PORT = 5002; // Changed port to avoid conflict

const notesPath = path.join(__dirname, "notes.json");
const usersPath = path.join(__dirname, "users.json");

// ── helpers ──────────────────────────────────────────────
function getNotes() {
  try { return JSON.parse(fs.readFileSync(notesPath, "utf-8") || "[]"); }
  catch { return []; }
}
function saveNotes(notes) {
  fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2));
}

function getUsers() {
  try { return JSON.parse(fs.readFileSync(usersPath, "utf-8") || "[]"); }
  catch { return []; }
}
function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}
// ─────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.writeHead(200); return res.end(); }

  // ── REGISTER ─────────────────────────────────────────
  if (req.method === "POST" && req.url === "/auth/register") {
    const { email, password } = await parseBody(req);

    if (!email || !password) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Email and password are required" }));
    }

    const users = getUsers();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      res.writeHead(409, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Email already registered" }));
    }

    const newUser = {
      id: Date.now().toString(),
      email: email.toLowerCase().trim(),
      password: hashPassword(password),
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };

    users.push(newUser);
    saveUsers(users);

    const { password: _, ...safeUser } = newUser;
    res.writeHead(201, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ user: safeUser }));
  }

  // ── LOGIN ─────────────────────────────────────────────
  if (req.method === "POST" && req.url === "/auth/login") {
    const { email, password } = await parseBody(req);

    if (!email || !password) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Email and password are required" }));
    }

    const users = getUsers();
    const user = users.find(
      (u) => u.email === email.toLowerCase().trim() && u.password === hashPassword(password)
    );

    if (!user) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Invalid email or password" }));
    }

    const { password: _, ...safeUser } = user;
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ user: safeUser }));
  }

  // ── GET NOTES (filtered by userId) ───────────────────
  if (req.method === "GET" && req.url.startsWith("/notes")) {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const userId = url.searchParams.get("userId");

    let notes = getNotes().filter((n) => !n.deletedAt);
    if (userId) notes = notes.filter((n) => n.userId === userId);

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(notes));
  }

  // ── CREATE NOTE ───────────────────────────────────────
  if (req.method === "POST" && req.url === "/notes") {
    const { title, content, userId } = await parseBody(req);

    if (!title || title.trim() === "") {
      res.writeHead(400); return res.end("Title is required");
    }

    const notes = getNotes();
    const newNote = {
      id: Date.now().toString(),
      userId: userId || null,
      title,
      content: content || "",
      createdAt: new Date().toISOString(),
      updatedAt: null,
      deletedAt: null,
    };

    notes.unshift(newNote);
    saveNotes(notes);

    res.writeHead(201, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(newNote));
  }

  // ── DELETE NOTE ───────────────────────────────────────
  if (req.method === "DELETE" && req.url.startsWith("/notes/")) {
    const id = req.url.split("/")[2];
    let notes = getNotes();
    notes = notes.map((n) =>
      n.id === id ? { ...n, deletedAt: new Date().toISOString() } : n
    );
    saveNotes(notes);
    res.writeHead(200); return res.end("Deleted");
  }

  // ── UPDATE NOTE ───────────────────────────────────────
  if (req.method === "PUT" && req.url.startsWith("/notes/")) {
    const id = req.url.split("/")[2];
    const { title, content } = await parseBody(req);

    let notes = getNotes();
    notes = notes.map((n) =>
      n.id === id
        ? { ...n, title: title ?? n.title, content: content ?? n.content, updatedAt: new Date().toISOString() }
        : n
    );
    saveNotes(notes);

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Note updated" }));
  }

  // ── NOT FOUND ─────────────────────────────────────────
  res.writeHead(404); res.end("Route not found");
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});