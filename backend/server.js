
const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();

app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

// Check backend and database
app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({ status: "Backend and database connected" });
    } catch (error) {
        res.status(500).json({ error: "Database unavailable" });
    }
});

// Get all employees
app.get("/api/employees", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM employees ORDER BY id DESC"
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch employees" });
    }
});

// Add employee
app.post("/api/employees", async (req, res) => {
    try {
        const {
            name, email, phone, department, designation, salary
        } = req.body;

        if (
            !name?.trim() ||
            !email?.trim() ||
            !department?.trim() ||
            !designation?.trim() ||
            salary === undefined ||
            salary === "" ||
            !Number.isFinite(Number(salary)) ||
            Number(salary) < 0
        ) {
            return res.status(400).json({
                error: "Please provide valid required employee details"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO employees
            (name, email, phone, department, designation, salary)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                name.trim(),
                email.trim(),
                phone || null,
                department.trim(),
                designation.trim(),
                Number(salary)
            ]
        );

        res.status(201).json({
            message: "Employee added successfully",
            id: result.insertId
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: "Email already exists"
            });
        }

        res.status(500).json({ error: "Failed to add employee" });
    }
});

// Update employee
app.put("/api/employees/:id", async (req, res) => {
    try {
        const {
            name, email, phone, department, designation, salary
        } = req.body;

        if (
            !name?.trim() ||
            !email?.trim() ||
            !department?.trim() ||
            !designation?.trim() ||
            salary === undefined ||
            salary === "" ||
            !Number.isFinite(Number(salary)) ||
            Number(salary) < 0
        ) {
            return res.status(400).json({
                error: "Please provide valid required employee details"
            });
        }

        const [result] = await pool.query(
            `UPDATE employees SET
            name = ?, email = ?, phone = ?,
            department = ?, designation = ?, salary = ?
            WHERE id = ?`,
            [
                name.trim(),
                email.trim(),
                phone || null,
                department.trim(),
                designation.trim(),
                Number(salary),
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Employee not found"
            });
        }

        res.json({ message: "Employee updated successfully" });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: "Email already exists"
            });
        }

        res.status(500).json({ error: "Failed to update employee" });
    }
});

// Delete employee
app.delete("/api/employees/:id", async (req, res) => {
    try {
        const [result] = await pool.query(
            "DELETE FROM employees WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Employee not found"
            });
        }

        res.json({ message: "Employee deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: "Failed to delete employee" });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on port ${PORT}`);
});
