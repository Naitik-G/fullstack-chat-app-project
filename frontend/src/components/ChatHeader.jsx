import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isOnline = onlineUsers.includes(String(selectedUser._id));

  return (
    <header className="bg-gradient-to-r from-base-100 to-base-200 border-b border-base-300 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* User Profile Section */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Avatar with Status */}
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-full ring-2 ring-base-300 overflow-hidden">
                <img 
                  src={selectedUser.profilePic || "/avatar.png"} 
                  alt={selectedUser.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-base-100 shadow-sm animate-pulse" />
              )}
            </div>

            {/* User Details */}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base text-base-content truncate">
                {selectedUser.fullName}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span 
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOnline ? 'bg-green-500' : 'bg-base-content/40'
                  }`}
                />
                <p className={`text-xs font-medium ${
                  isOnline ? 'text-green-600' : 'text-base-content/60'
                }`}>
                  {isOnline ? "Active now" : "Offline"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => setSelectedUser(null)}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-base-300 active:scale-95 transition-all duration-200 group"
            aria-label="Close chat"
          >
            <X className="w-5 h-5 text-base-content/70 group-hover:text-base-content transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;