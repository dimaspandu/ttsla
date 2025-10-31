import path from "path";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

// ----------------------
// App Initialization
// ----------------------

const app = express();
const httpServer = createServer(app);

// Configure Socket.IO with CORS enabled for all origins
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

// Define the port for the backend server
const PORT = 4000;

// ----------------------
// Middleware
// ----------------------

app.use(cors());
app.use(express.json());
app.use("/static", express.static(path.resolve(__dirname, "..", "public")));

// ----------------------
// Health Check Endpoint
// ----------------------
// Useful for monitoring and confirming the backend is up.
app.get("/", (_, res) => {
  res.json({
    message: "Hello, World!"
  });
});

// ----------------------
// Health Check Endpoint
// ----------------------
// Useful for monitoring and confirming the backend is up.
app.get("/ping", (_, res) => {
  res.send("ttsla-backend OK");
});

// ----------------------
// Start Server
// ----------------------
httpServer.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
