const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors()); // Enable cross-origin resource sharing

// Database configuration
const db = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE,
});
db.connect((err) => {
    if (!err) {
        console.log("Connected to database successfully");
    } else {
        console.error("Database connection failed:", err.message);
    }
});

// Utility function to execute queries
const executeQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

// Routes
app.post('/new-task', async (req, res) => {
    try {
        await executeQuery('INSERT INTO todos (task, createdAt, status) VALUES (?, ?, ?)', [req.body.task, new Date(), 'active']);
        const newList = await executeQuery('SELECT * FROM todos');
        res.send(newList);
    } catch (error) {
        console.error("Error in /new-task:", error.message);
        res.status(500).send({ error: "Failed to create a new task" });
    }
});

app.get('/read-tasks', (req, res) => {
    const q = 'SELECT * FROM todos';
    db.query(q, (err, result) => {
        if (err) {
            console.error("Failed to read tasks:", err.message);
            res.status(500).send({ error: "Failed to read tasks" });
        } else {
            console.log("Got tasks successfully from db");
            res.send(result);
        }
    });
});

app.post('/update-task', (req, res) => {
    const q = 'UPDATE todos SET task = ? WHERE id = ?';
    db.query(q, [req.body.task, req.body.updateId], (err) => {
        if (err) {
            console.error('Failed to update task:', err.message);
        } else {
            console.log('Task updated successfully');
            db.query('SELECT * FROM todos', (e, newList) => {
                if (e) {
                    console.error('Failed to fetch updated tasks:', e.message);
                } else {
                    res.send(newList);
                }
            });
        }
    });
});

app.post('/delete-task', (req, res) => {
    const q = 'DELETE FROM todos WHERE id = ?';
    db.query(q, [req.body.id], (err) => {
        if (err) {
            console.error('Failed to delete task:', err.message);
        } else {
            console.log('Task deleted successfully');
            db.query('SELECT * FROM todos', (e, newList) => {
                if (e) {
                    console.error('Failed to fetch updated tasks:', e.message);
                } else {
                    res.send(newList);
                }
            });
        }
    });
});

app.post('/complete-task', (req, res) => {
    const q = 'UPDATE todos SET status = ? WHERE id = ?';
    db.query(q, ['completed', req.body.id], (err) => {
        if (err) {
            console.error("Failed to complete task:", err.message);
            return res.status(500).send({ error: "Failed to complete task" });
        }
        db.query('SELECT * FROM todos', (e, newList) => {
            if (e) {
                console.error("Failed to fetch updated tasks:", e.message);
                return res.status(500).send({ error: "Failed to fetch updated tasks" });
            }
            res.send(newList);
        });
    });
});

// Port Configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
