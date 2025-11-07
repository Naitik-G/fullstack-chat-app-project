import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { io } from "socket.io-client";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  socket: null, // NEW: Socket instance for real-time updates
  onlineUsers: [], // NEW: To track online users for typing indicators/read receipts
  typingUsers: {},

  // Set selected user
  setSelectedUser: (user) => set({ selectedUser: user }),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("Socket is null in subscribeToMessages");
      return;
    }

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = String(newMessage.senderId) === String(selectedUser._id);
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("Socket is null in unsubscribeFromMessages");
      return;
    }

    socket.off("newMessage");
  },

   addMessageReaction: async (messageId, emoji) => {
    try {
      const res = await axios.post(`/api/messages/react/${messageId}`, {
        emoji,
      });
      if (res.status === 200) {
        // Optimistically update the UI
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === messageId ? { ...msg, reactions: res.data } : msg
          ),
        }));
      }
    } catch (error) {
      console.error("Failed to add reaction:", error);
      toast.error("Failed to add reaction.");
    }
  },

  // NEW: Socket connection and event listeners
  connectSocket: (userId) => {
    if (!userId) return;
    const socket = io("http://localhost:5000", {
      // Replace with your backend URL
      query: { userId: userId },
    });
    set({ socket });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });

    socket.on("newMessage", (newMessage) => {
      // Check if the message is for the currently selected chat
      const selectedUser = get().selectedUser;
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      } else if (
        selectedUser &&
        newMessage.receiverId === selectedUser._id &&
        newMessage.senderId === get().authUser._id
      ) {
        // This is a message sent by the current user to the selected user, ensure it's added
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
      // You might want to show a toast notification for new messages from other chats
    });

    // NEW: Listen for message reaction updates
    socket.on("messageReactionUpdate", ({ messageId, reactions }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions: reactions } : msg
        ),
      }));
    });

    // NEW: Listen for typing indicator events
    socket.on("typing", ({ senderId, receiverId, isTyping }) => {
      const selectedUser = get().selectedUser;
      const authUser = get().authUser;

      // Only update if the typing event is relevant to the current chat
      if (
        (selectedUser &&
          senderId === selectedUser._id &&
          receiverId === authUser._id) ||
        (selectedUser &&
          senderId === authUser._id &&
          receiverId === selectedUser._id)
      ) {
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [senderId]: isTyping,
          },
        }));
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      set({ socket: null, onlineUsers: [], typingUsers: {} });
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [], typingUsers: {} });
    }
  },

  // NEW: Function to emit typing status
  emitTypingStatus: (receiverId, isTyping) => {
    const socket = get().socket;
    const authUser = get().authUser;
    if (socket && authUser && receiverId) {
      socket.emit("typing", {
        senderId: authUser._id,
        receiverId,
        isTyping,
      });
    }
  },

  // NEW: Function to mark messages as read
  markMessagesAsRead: async (chatRoomId, lastMessageId) => {
    try {
      // Send a request to your backend to update the read status in DB
      await axios.post(`/api/messages/read/${chatRoomId}`, {
        lastMessageId,
      });

      // Optimistically update the frontend state
      set((state) => ({
        messages: state.messages.map((msg) => ({
          ...msg,
          // Assuming 'read' property exists on message
          read: msg.read || msg._id === lastMessageId, // Mark current and previous messages as read
        })),
      }));

      // Emit a socket event to inform the sender that messages have been read
      const socket = get().socket;
      const authUser = get().authUser;
      if (socket && authUser && chatRoomId) {
        socket.emit("messagesRead", {
          readerId: authUser._id,
          chatRoomId,
          lastMessageId,
        });
      }
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  },

}));