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

   // NEW: Typing Indicator Events
  socket.on("typing", ({ senderId, receiverId, isTyping }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      // Emit the typing status only to the receiver
      io.to(receiverSocketId).emit("typing", { senderId, receiverId, isTyping });
    }
  });

  // NEW: Messages Read Event (from client to server, then server emits to sender)
  socket.on("messagesRead", async ({ readerId, chatRoomId, lastMessageId }) => {
    // This event is primarily for the sender's client to know their message was read.
    // The actual database update is handled by the markMessagesAsRead API call.
    // Here, we just need to forward the information to the relevant sender.

    // `chatRoomId` in this context from the client side will be the ID of the
    // user whose messages were read (i.e., the sender's ID of those messages).
    const senderSocketId = getReceiverSocketId(chatRoomId); // The original sender of the messages
    const readerSocketId = getReceiverSocketId(readerId); // The user who read the messages

    if (senderSocketId && senderSocketId !== readerSocketId) { // Don't send to self if reading own message
        io.to(senderSocketId).emit("messagesRead", { readerId, chatRoomId, lastMessageId });
    }
  });

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