import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState  } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import EmojiPicker from "emoji-picker-react"; 
import { ThumbsUp, Heart, Laugh, ChevronDown, Smile } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    addMessageReaction, // NEW
    socket, // NEW
    onlineUsers, // NEW
    typingUsers, // NEW
    markMessagesAsRead, // NEW
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
   const [showReactionPicker, setShowReactionPicker] = useState(null); // State to control which message's picker is shown
  const reactionButtonRef = useRef(null); // Ref for the reaction button


  useEffect(() => {
  if (!selectedUser?._id) return;

  getMessages(selectedUser._id);
  subscribeToMessages();
  // NEW: Mark messages as read when a chat is opened
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.senderId !== authUser._id) {
      markMessagesAsRead(selectedUser._id, lastMessage._id);
    }

    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, messages.length]); // Added messages.length to re-run for new messages


  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
   // Close reaction picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        reactionButtonRef.current &&
        !reactionButtonRef.current.contains(event.target) &&
        !event.target.closest(".EmojiPickerReact")
      ) {
        setShowReactionPicker(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddReaction = (messageId, emojiObject) => {
    addMessageReaction(messageId, emojiObject.emoji);
    setShowReactionPicker(null); // Close picker after selecting emoji
  };

  const isUserOnline = onlineUsers.includes(selectedUser?._id);
  const isTyping = typingUsers[selectedUser?._id];


  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

   return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            
            // Add ref to the last message if you want auto-scroll to it on load
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1 flex items-center gap-1">
              {message.senderId !== authUser._id && (
                <span className="text-sm font-semibold">
                  {selectedUser.fullName}
                </span>
              )}
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
              {message.senderId === authUser._id &&
                message.read && ( // Display read receipt for sent messages
                  <span className="text-xs text-blue-500 ml-1">✓ Read</span>
                )}
            </div>
            <div className="chat-bubble flex flex-col relative group">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}

              {/* Message Reactions Display */}
              {message.reactions && message.reactions.length > 0 && (
                <div
                  className={`absolute ${
                    message.senderId === authUser._id
                      ? "-bottom-2 -left-2"
                      : "-bottom-2 -right-2"
                  } bg-base-200 px-2 py-0.5 rounded-full text-xs flex items-center gap-1 border border-zinc-700`}
                >
                  {/* Aggregate and display unique emojis */}
                  {Object.entries(
                    message.reactions.reduce((acc, reaction) => {
                      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([emoji, count]) => (
                    <span key={emoji}>
                      {emoji} {count > 1 && count}
                    </span>
                  ))}
                </div>
              )}

              {/* Reaction Button (appears on hover) */}
              <button
                type="button"
                className={`absolute top-1/2 -translate-y-1/2 ${
                  message.senderId === authUser._id ? "-left-10" : "-right-10"
                } bg-base-200 p-1 rounded-full text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                onClick={() =>
                  setShowReactionPicker(
                    showReactionPicker === message._id ? null : message._id
                  )
                }
                ref={showReactionPicker === message._id ? reactionButtonRef : null}
              >
                <Smile size={16} />
              </button>

              {/* Emoji Picker for Reactions */}
              {showReactionPicker === message._id && (
                <div
                  className={`absolute z-20 ${
                    message.senderId === authUser._id
                      ? "top-full left-0 mt-2"
                      : "top-full right-0 mt-2"
                  }`}
                >
                  <EmojiPicker
                    onEmojiClick={(emojiObject) =>
                      handleAddReaction(message._id, emojiObject)
                    }
                    theme="dark"
                    emojiStyle="google"
                    reactionsDefaultOpen={true} // Show reactions tab by default
                    // Optionally, filter emojis or reactions to a common set
                    reactions={["👍", "❤️", "😂", "😢", "😡"]}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && selectedUser && (
          <div className="chat chat-start">
            <div className="chat-bubble typing-indicator">
              <div className="dot-flashing"></div>
              <div className="dot-flashing delay-1"></div>
              <div className="dot-flashing delay-2"></div>
            </div>
          </div>
        )}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
