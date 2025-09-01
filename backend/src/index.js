import dotenv from 'dotenv';
dotenv.config();
import connectDB from "./database/index.js";
import app from "./app.js";
import { Server } from "socket.io";
import { createServer } from "http";
import { group } from 'console';

const server = createServer(app);
const PORT = process.env.PORT || 5000;


const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true,
    },
})



io.on("connection", (socket) => {


    socket.on("leave-room", (room) => {
        socket.leave(room);
    });


    socket.on("join-room", (room) => {
        socket.join(room);
    })

    socket.on("new-message", (msgobj) => {
        socket.to(msgobj.roomId).emit("receive", msgobj);
    })

    socket.on("disconnect", () => {
        console.log("Disconnected");

    })
})



connectDB().then(() => {
    server.listen(PORT, () => {
        console.log("Server is Bored.");
    })
}).catch(() => {
    console.log("DB connection attempt failed.");
    process.exit(1);
})