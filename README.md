# OralVis - Dental Screening Platform

A MERN stack application for dental health screening with AI-powered annotations and PDF reporting. This application allows dental professionals to upload patient dental images, perform annotations, and generate comprehensive PDF reports.

> **Note on Performance**: 
> - Image uploads and processing may be slow due to free-tier hosting limitations
> - The backend server on Render goes to sleep after 15 minutes of inactivity - please open the backend URL once to wake it up
> - Initial login may be slow as the server starts up

## 🚀 Live Demo

- **Frontend (Vercel)**: https://oralvis-puce.vercel.app/
- **Backend (Render)**: https://oralvis-mqdw.onrender.com/

## Features

- 📸 Multi-image upload (upper, front, lower teeth views)
- 🤖 AI-powered auto-annotation using Python
- ✏️ Manual annotation tools
- 📄 PDF report generation
- 🔐 User authentication (Admin/Patient roles)
- ☁️ Cloudinary integration for image storage

## 📋 Prerequisites

- Node.js 16+ & npm
- Python 3.8+ with pip
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for image storage)
- Git

## 🛠 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/oralvis.git
cd oralvis
```

### 2. Backend Setup
```bash
cd backend
npm install

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Environment Variables (`backend/.env`)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PYTHON_BIN=python3  # or 'python' on Windows
```

### Frontend Environment Variables (`frontend/.env`)
```
REACT_APP_API_URL=https://oralvis-mqdw.onrender.com  # or your backend URL
```

## 🚀 Running the Application

### Development Mode

1. **Start Backend**
```bash
cd backend
npm run dev  # Runs on http://localhost:5000
```

2. **Start Frontend**
```bash
cd frontend
npm start    # Runs on http://localhost:3000
```

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Serve frontend (using serve)
npm install -g serve
serve -s build
```

## 🔐 Default Credentials

- **Admin Account**:
  - Email: admin@oralvis.com
  - Password: oraladmin

- **Patient Account**:
  - Register a new account from the registration page

## 🏗 Project Structure

```
oralvis/
├── backend/               # Node.js + Express server
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Authentication middleware
│   ├── models/            # Mongoose models
│   ├── python/            # Python AI/ML code
│   ├── routes/            # API routes
│   ├── server.js          # Main server file
│   └── .env               # Environment variables
│
└── frontend/              # React frontend
    ├── public/            # Static files
    ├── src/
    │   ├── components/    # React components
    │   ├── contexts/      # React contexts
    │   └── App.jsx        # Main app component
    └── package.json
```

## 🤖 AI Integration

The application uses Python for AI-powered annotations, wrapped in a Node.js child process. The Python code is located in `backend/python/` and is called from the Node.js backend when processing images.

Key files:
- `backend/python/app.py` - Main Python script for image processing
- `backend/routes/submissions.js` - Node.js route handler that calls the Python script

## 🌐 Deployment

The application is deployed across multiple platforms:

1. **Frontend**: Vercel (https://oralvis-puce.vercel.app/)
2. **Backend**: Render (https://oralvis-mqdw.onrender.com/)
3. **Database**: MongoDB Atlas (Cloud)
4. **File Storage**: Cloudinary

### Important Notes:
- The Render free tier puts the backend to sleep after 15 minutes of inactivity
- First request after inactivity will be slow as the server wakes up
- For production use, consider upgrading to a paid plan for better performance

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with MERN stack (MongoDB, Express, React, Node.js)
- PDF generation using pdf-lib and jsPDF
- Image processing with Python OpenCV
- Hosted on Vercel and Render
