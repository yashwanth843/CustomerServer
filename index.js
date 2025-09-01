const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to SQLite database (creates database.db if not exists)
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to SQLite database.');
});

// Create tables if they don't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone_number TEXT NOT NULL UNIQUE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        address_details TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pin_code TEXT NOT NULL,
        FOREIGN KEY(customer_id) REFERENCES customers(id)
    )`);
});

// ---------- Customer Routes ----------
app.post('/api/customers', (req, res) => {
    const { first_name, last_name, phone_number } = req.body;
    const sql = `INSERT INTO customers(first_name, last_name, phone_number) VALUES (?, ?, ?)`;
    db.run(sql, [first_name, last_name, phone_number], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Customer created", id: this.lastID });
    });
});

app.get('/api/customers', (req, res) => {
    const sql = "SELECT * FROM customers";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.get('/api/customers/:id', (req, res) => {
    const sql = "SELECT * FROM customers WHERE id = ?";
    db.get(sql, [req.params.id], (err, row) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: row });
    });
});

app.put('/api/customers/:id', (req, res) => {
    const { first_name, last_name, phone_number } = req.body;
    const sql = "UPDATE customers SET first_name=?, last_name=?, phone_number=? WHERE id=?";
    db.run(sql, [first_name, last_name, phone_number, req.params.id], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Customer updated" });
    });
});

app.delete('/api/customers/:id', (req, res) => {
    const sql = "DELETE FROM customers WHERE id=?";
    db.run(sql, [req.params.id], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Customer deleted" });
    });
});

// ---------- Address Routes ----------
app.post('/api/customers/:id/addresses', (req, res) => {
    const { address_details, city, state, pin_code } = req.body;
    const sql = `INSERT INTO addresses(customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [req.params.id, address_details, city, state, pin_code], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Address added", id: this.lastID });
    });
});

app.get('/api/customers/:id/addresses', (req, res) => {
    const sql = "SELECT * FROM addresses WHERE customer_id=?";
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

app.put('/api/addresses/:addressId', (req, res) => {
    const { address_details, city, state, pin_code } = req.body;
    const sql = `UPDATE addresses SET address_details=?, city=?, state=?, pin_code=? WHERE id=?`;
    db.run(sql, [address_details, city, state, pin_code, req.params.addressId], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Address updated" });
    });
});

app.delete('/api/addresses/:addressId', (req, res) => {
    const sql = "DELETE FROM addresses WHERE id=?";
    db.run(sql, [req.params.addressId], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Address deleted" });
    });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
