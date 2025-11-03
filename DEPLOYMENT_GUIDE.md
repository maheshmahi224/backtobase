# 🚀 Deployment Guide - Back To Base

Complete guide to deploy your application:
- **Backend**: Render
- **Frontend**: Vercel

---

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas account created
- [ ] GitHub repository with your code
- [ ] Email SMTP credentials ready
- [ ] Render account created
- [ ] Vercel account created

---

## 🗄️ Part 1: MongoDB Atlas Setup

### 1. Create MongoDB Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 tier is enough to start)
3. Click **"Connect"** → **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Replace `dbname` with your database name (e.g., `backtobase`)

### 2. Configure Network Access

1. Go to **Network Access** in MongoDB Atlas
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0) for Render

---

## 🔧 Part 2: Backend Deployment on Render

### 1. Push Code to GitHub

```bash
cd c:\Users\DELL\Desktop\backtobase\backtobase
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:

**Settings:**
```
Name: backtobase-api
Environment: Node
Region: Singapore (or closest to you)
Branch: main
Root Directory: server
Build Command: npm install
Start Command: npm start
```

### 3. Add Environment Variables

Click **"Environment"** tab and add these variables:

```bash
# Server
NODE_ENV=production
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/backtobase?retryWrites=true&w=majority

# JWT Secret (generate a random 64-character string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_64_chars

# JWT Expiration
JWT_EXPIRE=7d

# Frontend URL (will update after deploying frontend)
FRONTEND_URL=https://your-app.vercel.app

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Back To Base Events

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Generate Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **"2-Step Verification"**
3. Go to **"App passwords"**
4. Generate password for "Mail"
5. Use this 16-character password as `EMAIL_PASS`

### 5. Deploy

Click **"Create Web Service"** and wait for deployment (5-10 minutes)

Your backend URL will be: `https://backtobase-api.onrender.com`

---

## 🎨 Part 3: Frontend Deployment on Vercel

### 1. Create Environment File

Create `client/.env.production` in your project:

```bash
# Use your Render backend URL
REACT_APP_API_URL=https://backtobase-api.onrender.com/api
```

### 2. Update API Base URL

The frontend is already configured to use `process.env.REACT_APP_API_URL`

### 3. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to client folder
cd client

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:

**Settings:**
```
Framework Preset: Create React App
Root Directory: client
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

**Environment Variables:**
```
REACT_APP_API_URL=https://backtobase-api.onrender.com/api
```

5. Click **"Deploy"**

Your frontend URL will be: `https://your-app.vercel.app`

### 4. Update Backend FRONTEND_URL

1. Go back to Render dashboard
2. Open your backend service
3. Update `FRONTEND_URL` environment variable with your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
4. Save changes (Render will auto-redeploy)

---

## 🔄 Part 4: CORS Configuration

Your backend is already configured for CORS. Just make sure your Vercel URL is in the allowed origins.

If you face CORS issues, check `server/server.js`:

```javascript
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'https://your-app.vercel.app' // Add your Vercel URL
];
```

---

## ✅ Part 5: Verify Deployment

### Test Backend:
```bash
curl https://backtobase-api.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Test Frontend:
1. Open `https://your-app.vercel.app`
2. Try to register/login
3. Upload CSV
4. Send emails
5. Scan QR codes

---

## 🐛 Troubleshooting

### Backend Issues:

**MongoDB Connection Failed:**
- Check MongoDB IP whitelist includes 0.0.0.0/0
- Verify connection string is correct
- Check username/password

**Email Sending Failed:**
- Verify Gmail app password is correct
- Check 2-Step Verification is enabled
- Try generating new app password

**Environment Variables Not Working:**
- Check spelling and case sensitivity
- Remove quotes around values in Render
- Click "Manual Deploy" to trigger rebuild

### Frontend Issues:

**API Calls Failing:**
- Check `REACT_APP_API_URL` is correct
- Verify backend is deployed and running
- Check browser console for CORS errors

**Build Failing:**
- Check all dependencies are in `package.json`
- Verify no unused imports
- Run `npm run build` locally first

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong JWT_SECRET** - 64+ random characters
3. **Enable MongoDB network restrictions** when possible
4. **Use Gmail App Passwords** - Never use actual password
5. **Regular updates** - Keep dependencies updated

---

## 📊 Monitoring

### Render:
- View logs in Render dashboard
- Set up alerts for downtime
- Monitor resource usage

### Vercel:
- Check deployment logs
- Monitor analytics
- Set up custom domain (optional)

---

## 🔄 Continuous Deployment

### Auto-Deploy from GitHub:

Both Render and Vercel will auto-deploy when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "your changes"
git push origin main

# Render and Vercel will auto-deploy!
```

---

## 💰 Free Tier Limits

### Render Free:
- ✅ 750 hours/month
- ✅ Sleeps after 15 min inactivity (first request takes ~30s)
- ✅ 512 MB RAM
- ⚠️ Shared CPU

### Vercel Free:
- ✅ Unlimited websites
- ✅ 100 GB bandwidth/month
- ✅ Instant deployments
- ✅ Automatic HTTPS

### MongoDB Atlas Free (M0):
- ✅ 512 MB storage
- ✅ Shared cluster
- ✅ No credit card required

---

## 🚀 Upgrade Options

When you outgrow free tiers:

**Render:** $7/month for always-on service
**Vercel:** Free for most projects
**MongoDB:** $9/month for 2GB (M2 tier)

---

## 📞 Support

If you encounter issues:

1. Check Render logs
2. Check Vercel deployment logs
3. Check browser console
4. Verify all environment variables
5. Test API endpoints with Postman

---

## 🎉 You're Live!

Your application is now deployed and accessible worldwide!

- **Frontend:** https://your-app.vercel.app
- **Backend:** https://backtobase-api.onrender.com
- **Admin Panel:** https://your-app.vercel.app/dashboard

Share your event management platform with the world! 🌍✨
