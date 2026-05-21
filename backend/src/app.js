import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);
app.set("port", (process.env.PORT || 8000))

app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));
app.use("/api/v1/users", userRoutes);

const start = async () => {
    const connectionDb = await mongoose.connect("mongodb+srv://kaharprince2006_db_user:Kairos%40237@cluster0.ex3talm.mongodb.net/");
    console.log("db connected");
    server.listen(app.get("port"), () => {
        console.log("listening at port 8000");
    });
}
start();