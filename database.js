const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'ziyokor.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
CREATE TABLE IF NOT EXISTS applications (id INTEGER PRIMARY KEY AUTOINCREMENT, fullName TEXT NOT NULL, phone TEXT NOT NULL, course TEXT NOT NULL, createdAt TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY AUTOINCREMENT, full_name TEXT NOT NULL, phone TEXT, course TEXT NOT NULL, group_name TEXT, monthly_fee INTEGER NOT NULL DEFAULT 0 CHECK(monthly_fee >= 0), active INTEGER NOT NULL DEFAULT 1, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS monthly_fees (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL REFERENCES students(id), month TEXT NOT NULL, amount INTEGER NOT NULL CHECK(amount >= 0), due_date TEXT, UNIQUE(student_id,month));
CREATE TABLE IF NOT EXISTS payments (id INTEGER PRIMARY KEY AUTOINCREMENT, monthly_fee_id INTEGER NOT NULL REFERENCES monthly_fees(id), amount INTEGER NOT NULL CHECK(amount > 0), payment_method TEXT NOT NULL DEFAULT 'cash', paid_at TEXT DEFAULT CURRENT_TIMESTAMP, note TEXT);
`);
const getMonthlyReport = db.prepare(`SELECT s.id,s.full_name,s.phone,s.course,s.group_name,m.month,m.amount AS monthly_fee,COALESCE(SUM(p.amount),0) AS paid,MAX(m.amount-COALESCE(SUM(p.amount),0),0) AS debt FROM monthly_fees m JOIN students s ON s.id=m.student_id LEFT JOIN payments p ON p.monthly_fee_id=m.id WHERE m.month=? GROUP BY m.id ORDER BY s.full_name`);
module.exports = {db,getMonthlyReport};
