# 🚀 Deploying ContentAI Studio on Vercel

This guide walks you through deploying **both the FastAPI backend and React frontend** as two separate Vercel projects from the same GitHub repo.

---

## Prerequisites

| Requirement | Notes |
|---|---|
| GitHub repo | `sumit08kumar/contentai-studio` (already pushed) |
| Vercel account | Sign up at [vercel.com](https://vercel.com) with GitHub |
| MongoDB Atlas | Already configured — the connection string works from anywhere |
| API keys | OpenAI, Pinecone, Tavily, HuggingFace — all from your `.env` |

---

## Part 1 — Deploy the Backend (FastAPI)

### Step 1: Go to Vercel Dashboard

1. Open [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select `sumit08kumar/contentai-studio`

### Step 2: Configure the Project

| Setting | Value |
|---|---|
| **Project Name** | `contentai-studio-api` |
| **Framework Preset** | `Other` |
| **Root Directory** | Click **Edit** → type `backend` → Click **Continue** |
| **Build Command** | *(leave empty)* |
| **Output Directory** | *(leave empty)* |

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add each key-value pair from your `backend/.env`:

| Variable | Value |
|---|---|
| `MONGODB_URL` | `mongodb+srv://...your connection string...` |
| `MONGODB_DB_NAME` | `youtube_rag_db` |
| `BWA_MONGODB_DB_NAME` | `blog_writing_db` |
| `OPENAI_API_KEY` | `sk-proj-...` |
| `PINECONE_API_KEY` | `pcsk_...` |
| `TAVILY_API_KEY` | `tvly-dev-...` |
| `HF_API_TOKEN` | `hf_...` |
| `SECRET_KEY` | `your-jwt-secret` |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` |
| `ALLOWED_ORIGINS` | `["https://contentai-studio.vercel.app"]` |

> ⚠️ **Important:** Set `ALLOWED_ORIGINS` to your **frontend's** Vercel URL (you'll get this after deploying the frontend). You can update it later.

### Step 4: Deploy

Click **"Deploy"** and wait for the build to complete.

Once done, your backend will be live at:
```
https://contentai-studio-api.vercel.app
```

### Step 5: Verify

Visit these URLs to confirm:
- `https://contentai-studio-api.vercel.app/` — should return JSON with app info
- `https://contentai-studio-api.vercel.app/docs` — Swagger UI
- `https://contentai-studio-api.vercel.app/health` — health check

---

## Part 2 — Deploy the Frontend (React + Vite)

### Step 1: Create a Second Vercel Project

1. Open [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select `sumit08kumar/contentai-studio` **again** (same repo, different root)

### Step 2: Configure the Project

| Setting | Value |
|---|---|
| **Project Name** | `contentai-studio` |
| **Framework Preset** | `Vite` (Vercel auto-detects this) |
| **Root Directory** | Click **Edit** → type `frontend` → Click **Continue** |
| **Build Command** | `npm run build` *(auto-filled)* |
| **Output Directory** | `dist` *(auto-filled)* |

### Step 3: Add Environment Variables

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://contentai-studio-api.vercel.app` |
| `VITE_APP_NAME` | `ContentAI Studio` |

> 📌 Replace `contentai-studio-api.vercel.app` with the **actual URL** from Step 4 of Part 1.

### Step 4: Deploy

Click **"Deploy"** and wait for the build to complete.

Your frontend will be live at:
```
https://contentai-studio.vercel.app
```

---

## Part 3 — Connect Frontend ↔ Backend (CORS)

After both are deployed, you need to update the backend's CORS:

1. Go to **Vercel Dashboard** → `contentai-studio-api` project
2. **Settings** → **Environment Variables**
3. Update `ALLOWED_ORIGINS`:
   ```
   ["https://contentai-studio.vercel.app"]
   ```
4. Go to **Deployments** tab → Click the three dots on the latest → **Redeploy**

---

## Part 4 — Verify Everything

| Test | URL |
|---|---|
| Backend root | `https://contentai-studio-api.vercel.app/` |
| API docs | `https://contentai-studio-api.vercel.app/docs` |
| Frontend home | `https://contentai-studio.vercel.app/` |
| Sign up | `https://contentai-studio.vercel.app/signup` |
| Login | `https://contentai-studio.vercel.app/login` |

---

## Redeployment (after code changes)

```bash
# Push changes to GitHub — Vercel auto-deploys on every push
git add -A
git commit -m "your commit message"
git push origin main
```

Both projects will automatically redeploy since they're connected to the same repo.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **CORS errors** | Update `ALLOWED_ORIGINS` in backend env vars to include frontend URL, then redeploy |
| **Login fails** | Check browser console — ensure `VITE_API_URL` points to the correct backend URL |
| **500 on backend** | Check Vercel Functions logs: Dashboard → Project → Logs tab |
| **MongoDB connection fails** | Ensure MongoDB Atlas Network Access allows `0.0.0.0/0` (allow from anywhere) |
| **Build fails (frontend)** | Make sure root directory is set to `frontend` |
| **Build fails (backend)** | Ensure `requirements.txt` is in the `backend/` folder |

### MongoDB Atlas — Allow Vercel IPs

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **Network Access** → **Add IP Address**
3. Click **"Allow Access from Anywhere"** (`0.0.0.0/0`)
4. Click **Confirm**

> This is required because Vercel serverless functions use dynamic IPs.

---

## File Structure (deployment-related)

```
youtube-rag-chatbot/
├── backend/
│   ├── api/
│   │   └── index.py          ← Vercel serverless entry point
│   ├── app/
│   │   └── main.py           ← FastAPI app
│   ├── requirements.txt       ← Python dependencies
│   └── vercel.json            ← Backend Vercel config
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vercel.json            ← Frontend Vercel config (SPA rewrites)
└── .gitignore
```
