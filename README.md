# OralVis - Dental Screening Platform

A MERN stack application for dental health screening with AI-powered annotations and PDF reporting.

## Features

- Multi-image upload (upper, front, lower teeth views)
- AI-powered auto-annotation using Python
- Manual annotation tools
- PDF report generation
- User authentication (Admin/Patient roles)
- Cloudinary integration for image storage

## Quick Start

1. **Prerequisites**
   - Node.js 16+
   - MongoDB 5.0+
   - Python 3.8+ (for auto-annotation)
   - Cloudinary account

2. **Setup**
   ```bash
   # Clone and install
   git clone https://github.com/yourusername/oralvis.git
   cd oralvis
   
   # Backend
   cd backend
   npm install
   cp .env.example .env  # Update with your credentials
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment Variables**
   Create `.env` in `/backend` with:
   ```
   MONGODB_URI=mongodb://localhost:27017/oralvis
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Run**
   ```bash
   # In separate terminals:
   cd backend && npm run dev   # Backend on http://localhost:5000
   cd frontend && npm start    # Frontend on http://localhost:3000
   ```

## Default Credentials
- **Admin**: admin@oralvis.com / oraladmin
- New users can register as patients

## Tech Stack
- **Frontend**: React, React-PDF
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **AI**: Python 3.8+
- **Storage**: Cloudinary
- **Authentication**: JWT
