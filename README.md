# VaultDrop 🗄️

A beautiful, full-featured file hosting platform with Admin and Consumer portals.

## Features
- 🔐 Admin dashboard with password protection
- ⬆️ Drag & drop file uploads (images, videos, docs, etc.)
- 🗑️ Delete & download files
- ⚙️ Editable site title, admin name, and password
- 🌐 Consumer view with search & filter
- 👁️ File preview modal
- 💾 Persistent storage via localStorage

---

## Deploy to Render.com (Free Static Site)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial VaultDrop"
git remote add origin https://github.com/YOUR_USERNAME/vaultdrop.git
git push -u origin main
```

### Step 2 — Create a new Static Site on Render
1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repo
4. Fill in the settings:
   - **Name:** vaultdrop (or anything you like)
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
5. Click **"Create Static Site"**

Render will build and deploy automatically. You'll get a free URL like:
`https://vaultdrop.onrender.com`

---

## Default Credentials
- **Admin Password:** `admin123`
- Change it in the Settings tab after logging in

## Local Development
```bash
npm install
npm run dev
```
