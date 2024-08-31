const express = require("express");
const { createTodo, updateTodo } = require("./types");
const { todo } = require("./db");

const app = express();

app.use(express.json());

//Creates a todo
//Todo can be created by sending a post request
app.post("/todo", async function (req, res) {
    const createPayload = req.body;
    const parsedPayload = createTodo.safeParse(createPayload);

    if (!parsedPayload.success) {
        res.status(400).json({
            msg: "You sent the wrong inputs",
        });
        return;
    }

    try {
        await todo.create({
            title: createPayload.title,
            description: createPayload.description,
            completed: false,
        });

        res.json({
            msg: "Todo created",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Gets all the todos
//Todos can be found by sending a get request
app.get("/todos", async function (req, res) {
    try {
        const todos = await todo.find();
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Updates the todo
//Todos can be updated by specific id by sending put request
app.put("/todos/title/:title", async (req, res) => {
    const { title } = req.params; // Extracting title from the URL parameter
    const { text, completed } = req.body; // Getting the updated fields from the request body

    try {
        const updatedTodo = await todo.findOneAndUpdate(
            { title }, // Using title to find the document
            { text, completed }, // Updating the fields
            { new: true, runValidators: true } // Options: return the updated document and run validators
        );

        if (!updatedTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.json(updatedTodo); // Sending the updated document back as a response
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handling errors
    }
});


//Marks as completed
//Todos can be completed by sending a put request
app.put("/completed", async function (req, res) {
    const updatePayload = req.body;
    const parsedPayload = updateTodo.safeParse(updatePayload);

    if (!parsedPayload.success) {
        res.status(400).json({
            msg: "You sent the wrong inputs",
        });
        return;
    }

    try {
        const updated = await todo.findByIdAndUpdate(
            req.body.id,
            { completed: true },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.json({
            msg: "Todo marked as completed",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Deleteing a todo
//To delete a todo using delete request
app.delete("/todos/title/:title", async (req, res) => {
    const { title } = req.params; // Extracting title from the URL parameter

    try {
        const deletedTodo = await todo.findOneAndDelete({ title }); // Finding and deleting the document by title

        if (!deletedTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.json({ message: "Todo deleted successfully", deletedTodo }); // Responding with the deleted document
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handling errors
    }
});


app.listen(3000, () => {
    console.log("Server is up on port 3000");
});
