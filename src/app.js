import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
// console.log("app.js");
app.use((req, res, next) => {
    console.log("🔥 REQUEST RECEIVED:", req.method, req.url);
    next();
});
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"))
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";

// import routes

// routes decleration
app.use("/api/v1/users", userRouter)
// http://localhost:8000//api/v1/users/register

app.use((err, req, res, next) => {
    console.error("❌ ERROR INTERCEPTED:", err);
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        console.error("👉 CAUSE: You sent a file field that the server didn't expect. Check your Postman config!");
    }
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message,
        errors: err.errors || [],
        code: err.code
    });
});

export default app