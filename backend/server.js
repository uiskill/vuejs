const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = "your_jwt_secret"; // store securely in production


const port = 3002;


// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // your password
  database: "crud",
});

db.connect((err) => {
  if (err) {
    console.error("DB connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Create table if not exists (run once)
const createTableSql = `
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
)`;
db.query(createTableSql);

// --- CRUD API ---
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(403);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Example: protected route
app.get('/items', verifyToken, (req, res) => {
  db.query('SELECT * FROM items', (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(results);
  });
});


app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
    if (err) return res.status(500).json({ message: "User already exists" });
    res.json({ message: "Registered successfully" });
  });
});



app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ message: "Invalid username" });

    const user = results[0];
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  });
});
















// Get all items
app.get("/items", (req, res) => {
  db.query("SELECT * FROM items", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get one item by id
app.get("/items/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM items WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Item not found" });
    res.json(results[0]);
  });
});

// Create new item
app.post("/items", (req, res) => {
  const { name, description } = req.body;
  db.query("INSERT INTO items (name, description) VALUES (?, ?)", [name, description], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, name, description });
  });
});

// Update item by id
app.put("/items/:id", (req, res) => {
  const id = req.params.id;
  const { name, description } = req.body;
  db.query("UPDATE items SET name = ?, description = ? WHERE id = ?", [name, description, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, name, description });
  });
});

// Delete item by id
app.delete("/items/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM items WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted successfully" });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
