# 💬 Real-Time Chat Application

A full-stack, real-time chat application built with the MERN stack, featuring instant messaging, image sharing, and online status tracking.

### 🔗 Live Demo
**[Live Demo →](https://fullstack-chat-app-project.onrender.com/)**


### 📹 Video Preview

![Chat preview](frontend\public\chat_preview.mp4)



Experience the app in action! Click the link above to access the live deployment.

**Demo Credentials:**
- Email: `demo@example.com`
- Password: `demo123`


## ✨ Features

### 🔐 Authentication & User Management
- **User Registration** - Create new accounts with email validation
- **Secure Login** - JWT-based authentication system
- **Logout** - Secure session termination
- **Profile Management** - Update profile information and avatar

### 💬 Real-Time Messaging
- **Instant Messaging** - Real-time message delivery using Socket.io
- **Online Status** - See who's currently active
- **Emoji Support** - Express yourself with emoji reactions
- **Image Sharing** - Send and receive images in conversations
- **Message History** - Persistent chat history

### 🎨 User Experience
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Modern UI** - Clean and intuitive interface
- **Real-time Updates** - Live status indicators and message notifications
- **User Profiles** - View and customize user information

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library for building interactive interfaces
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Socket.io Client** - Real-time bidirectional communication

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data persistence
- **Socket.io** - Real-time engine for WebSocket communication
- **JWT** - JSON Web Tokens for authentication
- **Cloudinary** - Cloud-based image storage and optimization

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- npm or yarn

### Clone the Repository
```bash
git clone https://github.com/yourusername/chat-app.git
cd chat-app
```

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend server:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend development server:
```bash
npm run dev
```

## 🚀 Usage

1. **Register** - Create a new account with your email and password
2. **Login** - Sign in with your credentials
3. **Update Profile** - Customize your profile picture and information
4. **Start Chatting** - Select a user from the list to begin conversation
5. **Send Messages** - Type and send text messages in real-time
6. **Share Images** - Upload and share images with other users
7. **Use Emojis** - Add emojis to express emotions
8. **Check Status** - See who's online with live status indicators


## 🔧 Configuration

### MongoDB Connection
Update your MongoDB URI in the backend `.env` file. You can use:
- Local MongoDB instance
- MongoDB Atlas (cloud database)

### Cloudinary Setup
1. Create a [Cloudinary account](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret
3. Add them to your backend `.env` file

### Socket.io Configuration
Socket.io is configured to handle:
- Real-time message delivery
- Online/offline status updates
- Typing indicators (if implemented)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@Naitik-G](https://github.com/Naitik-G)

## 🙏 Acknowledgments

- Socket.io for real-time communication
- Cloudinary for image management
- MongoDB for database solutions
- The MERN stack community

## 📧 Contact

For any questions or suggestions, please reach out:
- Email: your.email@example.com
- Twitter: [@yourhandle](https://twitter.com/yourhandle)

---

⭐ **Star this repository if you found it helpful!** ⭐