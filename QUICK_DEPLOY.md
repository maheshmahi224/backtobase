# ⚡ Quick Deploy Checklist

Fast track to deploy your app in 30 minutes!

---

## ⏱️ Timeline

- **MongoDB Setup:** 5 minutes
- **Backend Deploy:** 10 minutes  
- **Frontend Deploy:** 5 minutes
- **Testing:** 10 minutes

**Total: ~30 minutes**

---

## 📋 Pre-Flight Checklist

Before you start, have these ready:

- [ ] GitHub account
- [ ] MongoDB Atlas account (free)
- [ ] Render account (free)
- [ ] Vercel account (free)
- [ ] Gmail account (for email sending)

---

## 🚀 Step-by-Step (30 Minutes)

### Step 1: MongoDB Atlas (5 min)

1. **Sign up:** https://www.mongodb.com/cloud/atlas
2. **Create cluster:** Click "Build a Database" → Free (M0)
3. **Create user:** Username: `admin`, Password: (save this!)
4. **Network Access:** Click "Network Access" → "Add IP" → "Allow from Anywhere"
5. **Get connection string:**
   - Click "Connect" → "Connect your application"
   - Copy the string: `mongodb+srv://...`
   - Replace `<password>` with your password
   - Replace `myFirstDatabase` with `backtobase`

✅ **Save your connection string!**

---

### Step 2: Gmail App Password (3 min)

1. **Enable 2-Step:** https://myaccount.google.com/security
2. **Create app password:** Security → App passwords → Mail
3. **Copy 16-digit code:** (remove spaces)

✅ **Save your app password!**

---

### Step 3: Push to GitHub (2 min)

```bash
cd c:\Users\DELL\Desktop\backtobase\backtobase

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - ready for deployment"

# Create repo on GitHub, then:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

✅ **Code is on GitHub!**

---

### Step 4: Deploy Backend to Render (10 min)

1. **Sign up:** https://dashboard.render.com/register
2. **New Web Service:**
   - Click "New +" → "Web Service"
   - Connect GitHub → Select your repo
   
3. **Configure:**
   ```
   Name: backtobase-api
   Environment: Node
   Region: Singapore
   Branch: main
   Root Directory: server
   Build Command: npm install
   Start Command: npm start
   ```

4. **Add Environment Variables:**

Click "Advanced" → "Add Environment Variable":

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=generate_random_64_char_string_here
JWT_EXPIRE=7d
FRONTEND_URL=https://will-update-after-frontend.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Back To Base Events
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

5. **Create Web Service** → Wait ~5-10 minutes

✅ **Backend URL:** `https://backtobase-api.onrender.com`

---

### Step 5: Deploy Frontend to Vercel (5 min)

#### Option A: Vercel CLI (Faster)

```bash
# Install Vercel
npm install -g vercel

# Deploy
cd client
vercel login
vercel --prod
```

When prompted:
- Project name: `backtobase`
- Root directory: `./` (current)
- Build command: `npm run build`
- Output directory: `build`

#### Option B: Vercel Dashboard

1. **Sign up:** https://vercel.com/signup
2. **Import Project:**
   - Click "Add New..." → "Project"
   - Import your GitHub repo
   
3. **Configure:**
   ```
   Framework Preset: Create React App
   Root Directory: client
   Build Command: npm run build
   Output Directory: build
   ```

4. **Add Environment Variable:**
   ```
   REACT_APP_API_URL=https://backtobase-api.onrender.com/api
   ```

5. **Deploy** → Wait ~2-3 minutes

✅ **Frontend URL:** `https://backtobase-xyz.vercel.app`

---

### Step 6: Update Backend URL (2 min)

1. Go back to **Render dashboard**
2. Click your **backtobase-api** service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` with your Vercel URL:
   ```
   FRONTEND_URL=https://backtobase-xyz.vercel.app
   ```
5. Save → Auto-redeploys in ~2 minutes

✅ **CORS configured!**

---

### Step 7: Test Everything (10 min)

#### Test Backend:
```bash
# In browser or Postman
GET https://backtobase-api.onrender.com/api/health
```

Should return: `{"status":"ok"}`

#### Test Frontend:

1. **Open:** `https://backtobase-xyz.vercel.app`
2. **Register:** Create an account
3. **Login:** Sign in
4. **Create Event:** Add a new event
5. **Upload CSV:** Add participants
6. **Create Template:** Design email template
7. **Send Emails:** Test email sending
8. **Scan QR:** Test QR code scanning

✅ **Everything works!**

---

## 🎉 You're Live!

Your app is deployed and running! 

**URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://backtobase-api.onrender.com`

---

## ⚠️ Important Notes

### Render Free Tier:
- **Sleeps after 15 min inactivity**
- First request takes ~30 seconds to wake up
- After that, normal speed!

### Solution:
Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your backend every 14 minutes (keeps it awake)

---

## 🔧 Common First-Time Issues

### Issue: "Cannot connect to backend"
**Fix:** 
- Check `REACT_APP_API_URL` in Vercel
- Verify backend is running on Render
- Check CORS configuration

### Issue: "MongoDB connection failed"
**Fix:**
- Verify MongoDB IP whitelist: 0.0.0.0/0
- Check username/password in connection string
- Test connection string locally first

### Issue: "Email sending failed"  
**Fix:**
- Use Gmail app password, not regular password
- Enable 2-Step Verification
- Check EMAIL_USER matches EMAIL_FROM

### Issue: "Build failed on Vercel"
**Fix:**
- Check for unused imports
- Run `npm run build` locally first
- Check all dependencies are in package.json

### Issue: "QR codes not working"
**Fix:**
- Make sure participants have tokens (auto-generated)
- Check camera permissions in browser
- Verify backend /api/qr/scan endpoint works

---

## 📊 Monitoring

### Render Logs:
```
Dashboard → Your Service → Logs
```

### Vercel Logs:
```
Dashboard → Your Project → Deployments → View Function Logs
```

---

## 🔄 Future Deploys

Push to GitHub = Auto-deploy! 

```bash
git add .
git commit -m "Update feature"
git push

# Both Render and Vercel deploy automatically!
```

---

## 💰 Cost Breakdown

**Current Setup (FREE):**
- MongoDB Atlas: $0/month (512MB)
- Render: $0/month (sleeps after 15 min)
- Vercel: $0/month (100GB bandwidth)

**When You Scale:**
- MongoDB M2: $9/month (2GB, dedicated)
- Render Starter: $7/month (always-on)
- Vercel Pro: $20/month (optional)

---

## 🎯 Next Steps

1. **Custom Domain:** Add your own domain on Vercel
2. **Keep Alive:** Setup UptimeRobot pings
3. **Analytics:** Add Google Analytics
4. **Monitoring:** Setup error tracking (Sentry)
5. **Backup:** Export MongoDB regularly

---

## 🆘 Need Help?

**Check These First:**
1. ✅ Deployment logs (Render/Vercel)
2. ✅ Browser console (F12)
3. ✅ Environment variables
4. ✅ MongoDB network access

**Still Stuck?**
- Check `DEPLOYMENT_GUIDE.md` for detailed instructions
- Check `ENV_VARIABLES.md` for variable reference
- Review Render/Vercel docs

---

## ✅ Success Checklist

After deployment, you should have:

- [ ] MongoDB cluster running
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel  
- [ ] Environment variables configured
- [ ] CORS working
- [ ] Can register/login
- [ ] Can create events
- [ ] Can upload CSV
- [ ] Can send emails
- [ ] QR codes working
- [ ] Both URLs bookmarked

---

**Congratulations! Your event management platform is live! 🎉🚀**

Share it with the world! 🌍✨
