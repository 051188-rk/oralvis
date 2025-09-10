OralVis MERN App (monorepo)
===========================

Structure:
/backend - Express + MongoDB API
/frontend - React app (create-react-app style)

How to run locally
------------------

1. Install MongoDB and run it locally (default URI used in .env):
   - Database name will be 'oralvis' (mongodb://localhost:27017/oralvis).
   - Collections created by the app: 'users' and 'submissions' (Mongoose creates them automatically).

2. Configure Cloudinary:
   - Create a Cloudinary account and put credentials into backend/.env:
     CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
   - If you don't want Cloudinary, you may still run the app, but uploads will fail.

3. Backend:
   cd backend
   npm install
   npm run dev
   - This starts the server on PORT (default 5000). The .env provided contains the MONGODB_URI.

4. Frontend:
   cd frontend
   npm install
   npm start
   - Open http://localhost:3000

Default admin:
 - Email: admin@oralvis.com
 - Password: oraladmin
(Seeded automatically when backend first connects to MongoDB)

API summary
-----------
- POST /auth/register {name,email,password}
- POST /auth/login {email,password} -> { token, user }
- POST /auth/logout
- POST /api/submissions (authenticated patient) { patientName, patientID, email, note, image (dataURL) }
- GET  /api/submissions (admin)
- GET  /api/submissions/mine (patient)
- GET  /api/submissions/:id (admin or owner)
- PUT  /api/submissions/:id/annotate (admin) { annotationData, annotatedImage (dataURL) }
- POST /api/submissions/:id/report (admin) -> generates PDF and uploads to Cloudinary.

Where to create DB and collections
---------------------------------
- Run MongoDB locally (e.g., `mongod`).
- The app uses MONGODB_URI from backend/.env. With the provided URI `mongodb://localhost:27017/oralvis` the database `oralvis` will be created automatically.
- Collections `users` and `submissions` will be created when you first create a user and upload a submission.
