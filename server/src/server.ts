import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./utils/db.js";
import mentionRoutes from "./routes/mentionRoutes.js";
import analyticsRoute from "./routes/analyticsRoute.js";
import queryRoutes from "./routes/queryRoutes.js";
import publicRoute from "./routes/publicRoute.js";
import brandRouter from "./routes/brandRoute.js";
import summaryRoute from "./routes/summaryRoute.js";
import refreshRoute from "./routes/refreshRoute.js";
import { startPolling } from "./services/mentionPoller.js";

dotenv.config();

const allowedOrigin = process.env.FRONTEND_URL;
const corsOptions: cors.CorsOptions = {
  origin: allowedOrigin,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

const server = http.createServer(app);
export const io = new Server(server, { cors: { origin: "*" } });

// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
  res.status(200).json({ 
      status: "up", 
      message: "Mention Backend API is running!",
  });
});

// API routes
app.use("/api/mentions", mentionRoutes);
app.use("/api/analytics", analyticsRoute);
app.use("/api/queries", queryRoutes);
app.use("/api/public", publicRoute);
app.use("/api/brand", brandRouter);
app.use("/api/summary", summaryRoute);
app.use("/api/refresh-feed", refreshRoute);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

// Start dynamic polling
startPolling();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
