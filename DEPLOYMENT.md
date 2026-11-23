# Deployment Guide: Student Management System (MERN Stack)

This guide walks you through deploying the complete Student Management System to production:
- **Database:** MongoDB Atlas (Free Cloud Cluster)
- **Backend:** Render (Web Service)
- **Frontend:** Vercel (Fast Static & SPA Hosting)

---

## 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up / log in.
2. Click **Create a New Cluster** (choose the **M0 Shared Free Tier**).
3. Select your preferred cloud provider (AWS/GCP) and closest geographical region.
4. Under **Security Quickstart**:
   - Create a database user with username (e.g. `sms_admin`) and a secure password. Keep this safe!
   - In **IP Access List**, click **Add IP Address** -> choose `0.0.0.0/0` (Allow Access from Anywhere) so Render can connect.
5. Click **Clusters** -> **Connect** -> **Drivers** (Node.js).
6. Copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/student_mgmt?retryWrites=true&w=majority
   ```
   *(Replace `<username>` and `<password>` with your Atlas database user credentials).*

---

## 2. Backend Deployment on Render

1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com/).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure the Web Service:
   - **Name:** `student-management-system-api`
   - **Region:** Closest to your database (e.g. Oregon or Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
6. Under **Environment Variables**, add:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGO_URI`: *Your MongoDB Atlas connection URI from Step 1*
   - `JWT_SECRET`: *A secure random string (e.g. `prod_jwt_supersecret_key_849202`)*
   - `JWT_EXPIRE`: `30d`
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app` *(update once frontend is deployed)*
7. Click **Create Web Service**.
8. After deployment finishes, copy your Render API URL (e.g., `https://student-management-system-api.onrender.com`).
9. *(Optional)* To seed your MongoDB Atlas cluster with demo data directly on Render:
   - In your Render dashboard, click the **Shell** tab and run:
     ```bash
     npm run seed
     ```

---

## 3. Frontend Deployment on Vercel

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. In the project configuration:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click Edit and select `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Under **Environment Variables**:
   - Key: `VITE_API_URL`
   - Value: `https://student-management-system-api.onrender.com/api` *(Your Render backend URL with `/api` suffix)*
6. Click **Deploy**.
7. Once deployed, Vercel gives you a live production URL (e.g. `https://edutrack-sms.vercel.app`).

---

## 4. Final Linkage & Verification

1. Go back to Render -> **Environment Variables**.
2. Update `CLIENT_URL` to your live Vercel URL (e.g. `https://edutrack-sms.vercel.app`).
3. Click **Save Changes** (Render will automatically redeploy).
4. Open your Vercel URL in your browser:
   - Test login as Admin: `admin@sms.com` / `admin123`
   - Test login as Faculty: `teacher@sms.com` / `teacher123`
   - Test login as Student: `student@sms.com` / `student123`
5. Test adding a student, recording attendance, and viewing grades live!
