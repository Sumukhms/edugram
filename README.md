# Edugram — MERN Social Learning Platform

Edugram is a social learning network for students and teachers. Think “LinkedIn, but campus-first”: profiles, posts, reactions, discussions, and resource sharing — built on the **MERN** stack (MongoDB, Express, React, Node.js).

**Live Demo:** [https://edugram-five.vercel.app]
> This README covers local development **and** production deployment (Render + Vercel), plus a one-service alternative where Express serves the React build.

---

## ✨ Features (current & planned)
- User authentication (JWT-based)
- User profiles (students/teachers)
- Posts & comments
- Reactions/likes
- Clean React UI with `react-router-dom` and `react-toastify`

> Exact feature set depends on the repo version you pull; update this list as you add functionality.

---

## 🧰 Tech Stack
- **Frontend:** React (CRA), React Router, React Toastify, Emoji Picker
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas
- **Auth:** JWT
- **Utilities:** CORS, Dotenv, Bcrypt, Nodemon (dev)

---

## 📁 Monorepo Structure
```
edugram/
├─ frontend/            # React app (CRA)
│  ├─ src/
│  └─ package.json
├─ backend/             # Express API
│  ├─ app.js            # (entrypoint; may vary)
│  └─ package.json
└─ README.md
```

---

## 🔐 Environment Variables

Create **two** `.env` files — one for backend, one for frontend.

### Backend (`/backend/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:3000
```

- `PORT` — Express port (Render/Heroku will inject their own; make sure the code uses `process.env.PORT || 5000`)
- `CLIENT_URL` — used for CORS allowlist in production

### Frontend (`/frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:5000
```
- CRA exposes envs **only** if prefixed with `REACT_APP_`.
- In API calls, use `process.env.REACT_APP_API_URL` as the base URL.

> If your current code hardcodes `http://localhost:5000` or relies on the CRA `"proxy"` field, switch to `REACT_APP_API_URL` for production.

---

## 🧪 Local Development

### 1) Install dependencies
From the project root:
```bash
# Frontend
cd frontend
npm install

# Backend (in a separate terminal)
cd ../backend
npm install
```

### 2) Start the apps (two terminals)
```bash
# Terminal A – Frontend
cd frontend
npm start

# Terminal B – Backend (dev with nodemon if configured)
cd backend
npm run dev   # or: npm start
```

- Frontend runs at **http://localhost:3000**
- Backend runs at **http://localhost:5000** (or the `PORT` you set)

> Remove the `"proxy"` field from `frontend/package.json` for production. It's fine locally but breaks on hosted deployments.

---

## 🚀 Production Deployment (Recommended: **Render + Vercel**)

### Overview
- **Backend (Express + MongoDB)** → Render Web Service
- **Frontend (React build)** → Vercel Static App
- **Frontend calls** the API via `REACT_APP_API_URL`

### Step-by-step

#### A) Deploy the Backend on Render
1. Push your code to GitHub (public or private).
2. Go to **Render → New → Web Service**.
3. Connect the repo. In settings:
   - **Root directory:** `backend`
   - **Build command:** `npm install && npm run build`  
     > If you don’t have a backend build step, use just `npm install`. Your current `backend/package.json` has a `build` that builds the frontend; that’s optional in this split-deploy approach.
   - **Start command:** `npm start` (should run `node app.js`)
4. Add **Environment Variables** on Render:
   - `MONGO_URI` (from MongoDB Atlas)
   - `JWT_SECRET`
   - `PORT` (Render provides; you can omit)
   - `CLIENT_URL` (later set to your Vercel domain, e.g., `https://edugram.vercel.app`)
5. Ensure your Express app listens on `process.env.PORT`.
6. Deploy → copy the **backend URL** (e.g., `https://edugram-api.onrender.com`).

#### B) Deploy the Frontend on Vercel
1. Go to **Vercel → New Project** → Import GitHub repo.
2. **Root directory:** `frontend`
3. **Build command:** `npm run build`
4. **Output directory:** `build`
5. Add **Environment Variable** on Vercel:
   - `REACT_APP_API_URL` = your Render backend URL
6. Deploy → visit your Vercel URL (e.g., `https://edugram.vercel.app`).

#### C) CORS & Final Checks
- In Express, enable CORS:
  ```js
  const cors = require('cors');
  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
  ```
- Set `CLIENT_URL` on Render to your final Vercel domain.
- Verify that API requests from Vercel hit the Render backend successfully.

---

## 🧯 Alternative: **Single-Service Deploy (Express serves React)**

This option hosts both frontend and backend under one domain (e.g., on Render/Heroku).

1. Build the React app locally or in CI:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
2. Serve the build from Express (in `/backend/app.js`):
   ```js
   const path = require('path');
   const express = require('express');
   const app = express();

   // ... your middlewares & API routes here ...

   // Serve React build
   app.use(express.static(path.join(__dirname, '../frontend/build')));

   app.get('*', (req, res) => {
     res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
   });

   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   ```
3. On Render:
   - **Root directory:** `backend`
   - **Build command:** `npm install && npm run build` (your backend's `build` already runs the frontend build)
   - **Start command:** `npm start`
4. Set env vars on Render (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`).

> In this mode, **remove** the CRA `"proxy"` field and use relative API paths (e.g., `/api/...`) in the frontend, or set `REACT_APP_API_URL` to the same domain (no protocol/host).

---

## 🧩 Common Gotchas
- **CORS errors:** set `CLIENT_URL` correctly to your Vercel domain on Render and enable CORS.
- **Proxy in production:** remove `"proxy"` from `frontend/package.json`. Use `REACT_APP_API_URL` instead.
- **Port binding on Render/Heroku:** your server **must** listen on `process.env.PORT`.
- **Package typo:** ensure backend dependency is **`cors`**, not `course`. Remove any accidental `"course"` package:
  ```bash
  cd backend
  npm uninstall course
  npm install cors
  ```
- **Hardcoded URLs:** audit your frontend for `http://localhost:5000` and replace with `process.env.REACT_APP_API_URL`.

---

## 🧭 Scripts

### Frontend (`/frontend/package.json`)
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

### Backend (`/backend/package.json`)
```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "build": "cd ../frontend && npm install && npm run build"
  }
}
```

---

## 🧪 Health Checks
- Frontend: open the deployed URL → UI loads without console errors.
- Backend: `GET /health` (add a simple health route) or check Render logs.
- DB: verify the app creates/reads/writes documents in MongoDB Atlas.

---

## 🤝 Contributing
PRs are welcome! Please open an issue for feature requests/bugs before raising PRs.

---

## 📄 License
Add your license of choice (e.g., MIT) or keep it proprietary.
