const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = 4000;

// Ma'lumotlar bazasi
const db = new Database("ziyokor.db");

db.pragma("journal_mode = WAL");

// Arizalar jadvali
db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    phone TEXT NOT NULL,
    course TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Kurslar (hozircha namuna)
const courses = [
  { id: 1, name: "Frontend dasturlash" },
  { id: 2, name: "Backend dasturlash" },
  { id: 3, name: "Ingliz tili" },
  { id: 4, name: "Matematika" },
  { id: 5, name: "Python dasturlash" },
  { id: 6, name: "Rus tili" },
];

// Kurslar API
app.get("/api/courses", (req, res) => {
  res.json(courses);
});

// Ariza qabul qilish
app.post("/api/applications", (req, res) => {
  const { fullName, phone, course } = req.body || {};

  if (
    typeof fullName !== "string" ||
    typeof phone !== "string" ||
    typeof course !== "string" ||
    fullName.trim().length < 3 ||
    fullName.length > 100 ||
    !/^\+?[0-9\s()-]{9,20}$/.test(phone.trim()) ||
    !courses.some((c) => c.name === course)
  ) {
    return res.status(400).json({
      message: "Ma'lumotlarni to‘g‘ri kiriting.",
    });
  }

  try {
    const statement = db.prepare(`
      INSERT INTO applications (fullName, phone, course)
      VALUES (?, ?, ?)
    `);

    statement.run(fullName.trim(), phone.trim(), course);

    res.status(201).json({
      message: "Arizangiz muvaffaqiyatli qabul qilindi!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Serverda xatolik yuz berdi.",
    });
  }
});

// Server
app.listen(PORT, () => {
  console.log(`Ziyokor server: http://localhost:${PORT}`);
});
