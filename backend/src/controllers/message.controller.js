import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addReactionToMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params; // Message ID
    const { emoji } = req.body;
    const userId = req.user._id; // The user reacting

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if the user has already reacted with this emoji
    const existingReactionIndex = message.reactions.findIndex(
      (reaction) =>
        reaction.userId.toString() === userId.toString() &&
        reaction.emoji === emoji
    );

    if (existingReactionIndex > -1) {
      // If same user, same emoji exists, remove it (toggle reaction)
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Add new reaction
      message.reactions.push({ emoji, userId });
    }

    await message.save();

    // Emit socket event to update reactions in real-time for all connected clients
    // Determine the chat participants to send the update only to them
    const senderSocketId = getReceiverSocketId(message.senderId.toString());
    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());

    if (senderSocketId) {
      io.to(senderSocketId).emit("messageReactionUpdate", {
        messageId: message._id,
        reactions: message.reactions,
      });
    }
    if (receiverSocketId && receiverSocketId !== senderSocketId) {
      io.to(receiverSocketId).emit("messageReactionUpdate", {
        messageId: message._id,
        reactions: message.reactions,
      });
    }

    res.status(200).json(message.reactions);
  } catch (error) {
    console.error("Error in addReactionToMessage: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatRoomId } = req.params; // This is the ID of the user whose messages were read
    const { lastMessageId } = req.body; // The ID of the last message read
    const readerId = req.user._id; // The user who read the messages

    // Update all messages in the conversation sent by the other user
    // up to and including the lastMessageId
    await Message.updateMany(
      {
        senderId: chatRoomId, // Messages sent by the other user
        receiverId: readerId, // Messages received by the current user
        _id: { $lte: lastMessageId }, // Messages up to and including the last read message
        read: false, // Only mark unread messages
      },
      { $set: { read: true } }
    );

    // Emit a socket event to inform the sender that messages have been read
    const senderSocketId = getReceiverSocketId(chatRoomId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", {
        readerId,
        chatRoomId: readerId, // Sending back readerId as chatRoomId for consistency on client
        lastMessageId,
      });
    }

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error in markMessagesAsRead: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};