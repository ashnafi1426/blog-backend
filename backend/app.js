import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import router from "./routes/indexRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =====================
// Load env variables
// =====================
console.log("📁 Loading .env from:", `${__dirname}/.env`);
dotenv.config({ path: `${__dirname}/.env`, debug: true });

const app = express();
const port = process.env.PORT || 5000;

// =====================
// CORS CONFIG - Allow All Origins
// =====================
const corsOptions = {
  origin: "*",
  credentials: false,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

console.log("✅ CORS: Allowing all origins");

// ✅ CORS FIRST (this handles OPTIONS automatically)
app.use(cors(corsOptions));

// =====================
// Logger
// =====================
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// =====================
// Body Parsers
// =====================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// =====================
// Routes
// =====================
app.use("/api", router);

// =====================
// JSON Error Handler
// =====================
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON body" });
  }
  next(err);
});

// =====================
// Global Error Handler
// =====================
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// =====================
// Start Server
// =====================
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
