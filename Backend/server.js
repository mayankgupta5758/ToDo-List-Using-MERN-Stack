const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const mongoose = require('mongoose');
const app = express();
let port = 3000;

dotenv.config();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
main().catch(err => console.log("Database connection error:", err));

async function main() {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: "newTodo"
    });
}

// Define Todo schema and model
const todoSchema = new mongoose.Schema({
    value: {
        type: String,
        required: true,
    },
    isDone: {
        type: Boolean,
        default: false,
    },
});

const Todo = mongoose.model("Todo", todoSchema);

// Get all todos
app.get("/", async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (error) {
        console.error("Error fetching todos:", error);
        res.status(500).json({ error: "Error fetching todos" });
    }
});

// Add a new todo
app.post("/", async (req, res) => {
    const { value } = req.body;

    if (!value) {
        return res.status(400).json({ error: "Todo value is required" });
    }

    try {
        const newTodo = new Todo({ value });
        const savedTodo = await newTodo.save();
        res.json(savedTodo); // Respond with the saved todo
    } catch (error) {
        console.error("Error saving todo:", error);
        res.status(500).json({ error: "Server error saving todo" });
    }
});

// Edit a specific todo
app.put("/:id", async (req, res) => {
    const id = req.params.id;
    const { value } = req.body;

    if (!value) {
        return res.status(400).json({ error: "Todo value is required" });
    }

    try {
        const updatedTodo = await Todo.findByIdAndUpdate(
            id,
            { value },
            { new: true, runValidators: true }
        );

        if (updatedTodo) {
            res.json(updatedTodo);
        } else {
            res.status(404).json({ error: "Todo not found" });
        }
    } catch (error) {
        console.error("Error updating todo:", error);
        res.status(500).json({ error: "Server error updating todo" });
    }
});

// Delete a specific todo
app.delete("/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const deletedTodo = await Todo.findByIdAndDelete(id);

        if (deletedTodo) {
            res.json({ message: "Todo deleted successfully", deletedTodo });
        } else {
            res.status(404).json({ error: "Todo not found" });
        }
    } catch (error) {
        console.error("Error deleting todo:", error);
        res.status(500).json({ error: "Server error deleting todo" });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
