import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";

// Setup for __dirname and __filename in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Database connection
const db = new pg.Client({
    user: "postgres",       // Your database username
    host: "localhost",      // Your database host
    database: "krishix",    // Your database name
    password: "mohit",      // Your database password
    port: 5432,             // Your database port
});

db.connect()
    .then(() => {
        console.log("Successfully connected to the database");
    })
    .catch((err) => {
        console.error("Database connection failed:", err);
    });

// Middleware
app.use(express.json()); // Built-in middleware to parse JSON
app.use(express.urlencoded({ extended: true })); // form data read to server
app.use(morgan("tiny")); // errorr come to see
app.use(express.static(path.join(__dirname, ))); // Serves static files from "public" directory

// Routes
app.post("/register", async (req, res) => {
    const { aadhaar, password } = req.body;

    try {
        // Check if user already exists
        const checkResult = await db.query("SELECT * FROM users WHERE aadhaar = $1", [aadhaar]);
        if (checkResult.rows.length > 0) {
            console.log("User Already exists");
            return res.status(409).json({ message: "User Already exists" }); // Use 409 Conflict
        }

        // Insert new user
        const result = await db.query("INSERT INTO users (aadhaar, password) VALUES ($1, $2)", [aadhaar, password]);
        console.log(result);
        res.sendFile(path.join(__dirname,  "login.html")); // Respond with login.html
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" }); // Respond with server error
    }
});

app.post("/login", async (req, res) => {
    const { aadhaar, password } = req.body;

    try {
        // Check if user already exists
        const result = await db.query("SELECT * FROM users WHERE aadhaar = $1", [aadhaar]);
        if (result.rows.length > 0) {
            const user=result.rows[0];
            const storedPassword=user.password;
            if(password===storedPassword){
                
                console.log("login successful");
                res.sendFile(path.join(__dirname,  "index.html"));
            }

            else{
                res.send("Incorrect Password");
                
            }
        }
        else{
            res.send("user not found");
        }

         // Respond with login.html
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" }); // Respond with server error
    }
});

app.get("/aboutme", (req, res) => {
    res.send("<h1>Made By Mohit Godara</h1>");
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname,  "index.html"));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});



