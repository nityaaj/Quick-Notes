const http = require("http");
const fs = require("fs");

const PORT = 5001;

// read notes
function getNotes() {
  const data = fs.readFileSync("notes.json", "utf-8");
  return JSON.parse(data || "[]");
}

// save notes
function saveNotes(notes) {
  fs.writeFileSync("notes.json", JSON.stringify(notes, null, 2));
}

const server = http.createServer((req, res) => {
  // allow frontend connection
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  // -------- GET NOTES --------
  if (req.method === "GET" && req.url === "/notes") {
    const notes = getNotes();

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(notes));
  }

  // -------- CREATE NOTE --------
  if (req.method === "POST" && req.url === "/notes") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const { title, content } = JSON.parse(body);

      if (!title || title.trim() === "") {
        res.writeHead(400);
        return res.end("Title is required");
      }

      const notes = getNotes();

      const newNote = {
        id: Date.now().toString(),
        title,
        content: content || "",
        createdAt: new Date().toISOString(),
      };

      notes.unshift(newNote);
      saveNotes(notes);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newNote));
    });

    return;
  }

  // -------- DELETE NOTE --------
  if (req.method === "DELETE" && req.url.startsWith("/notes/")) {
    const id = req.url.split("/")[2];

    let notes = getNotes();
    notes = notes.filter((note) => note.id !== id);

    saveNotes(notes);

    res.writeHead(200);
    return res.end("Deleted");
  }

  // -------- UPDATE NOTE --------
else if (req.method === "PUT" && req.url.startsWith("/notes/")) {
  const id = req.url.split("/")[2];

  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    const { title, content } = JSON.parse(body);

    let notes = getNotes();

    notes = notes.map((note) => {
      if (note.id === id) {
        return {
          ...note,
          title: title || note.title,
          content: content || note.content,
        };
      }
      return note;
    });

    saveNotes(notes);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Note updated" }));
  });

  return;
}

  // -------- NOT FOUND --------
  res.writeHead(404);
  res.end("Route not found");
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});