const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const { db } = require("./database");

// .env fayl manzili
const envPath = path.join(__dirname, ".env");

// .env mavjudligini tekshirish
if (!fs.existsSync(envPath)) {
  console.error("XATO: .env fayli topilmadi!");
  process.exit(1);
}

// .env faylni o'qish
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("ENV xatolik:", result.error.message);
  process.exit(1);
}

async function createAdmin() {
  const username = "admin";
  const password = process.env.ADMIN_PASSWORD;

  // Parolni tekshirish
  if (!password || password.length < 12) {
    console.error("XATO: ADMIN_PASSWORD topilmadi yoki juda qisqa!");
    console.log("ENV kalitlari:", Object.keys(result.parsed || {}));
    console.log("Parol uzunligi:", password?.length || 0);
    return;
  }

  // Admin jadvalini yaratish
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    )
  `);

  // Parolni hashlash
  const hashedPassword = await bcrypt.hash(password, 12);

  // Adminni bazaga saqlash
  db.prepare(
    `
    INSERT INTO admins (username, password_hash)
    VALUES (?, ?)
    ON CONFLICT(username)
    DO UPDATE SET password_hash = excluded.password_hash
  `,
  ).run(username, hashedPassword);

  console.log("Admin muvaffaqiyatli yaratildi!");
  console.log("Login: admin");
}

createAdmin()
  .catch((error) => {
    console.error("Xatolik:", error.message);
  })
  .finally(() => {
    db.close();
  });
