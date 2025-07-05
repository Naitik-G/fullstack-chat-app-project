import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log("User mapped:", userId, "->", socket.id);
    
    // Emit updated online users list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    console.log("Online users:", Object.keys(userSocketMap));
  }

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    
    // Find and remove the user from the map
    if (userId && userId !== "undefined") {
      delete userSocketMap[userId];
      console.log("User removed from map:", userId);
      
      // Emit updated online users list
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      console.log("Online users after disconnect:", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };