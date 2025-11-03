# 🔐 Environment Variables Reference

Complete list of environment variables needed for deployment.

---

## 🖥️ Backend Environment Variables (Render)

Copy these to Render's Environment Variables section:

```bash
# ======================
# SERVER CONFIGURATION
# ======================
NODE_ENV=production
PORT=5000

# ======================
# DATABASE
# ======================
# Get this from MongoDB Atlas
# Format: mongodb+srv://username:password@cluster.mongodb.net/dbname
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/backtobase?retryWrites=true&w=majority

# ======================
# JWT AUTHENTICATION
# ======================
# Generate a random 64-character string
# You can use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long_and_random

# Token expiration time
JWT_EXPIRE=7d

# ======================
# FRONTEND URL
# ======================
# Update this after deploying frontend to Vercel
# Example: https://backtobase.vercel.app
FRONTEND_URL=https://your-frontend-url.vercel.app

# ======================
# EMAIL CONFIGURATION (Gmail)
# ======================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Your Gmail address
EMAIL_USER=your-email@gmail.com

# Gmail App Password (NOT your regular password)
# Generate at: https://myaccount.google.com/apppasswords
EMAIL_PASS=your-16-digit-app-password

# Email sender information
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Back To Base Events

# ======================
# RATE LIMITING
# ======================
# 15 minutes in milliseconds
RATE_LIMIT_WINDOW_MS=900000

# Max 100 requests per window
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🎨 Frontend Environment Variables (Vercel)

Add these in Vercel's Environment Variables section:

```bash
# ======================
# API CONFIGURATION
# ======================
# Your Render backend URL
# Example: https://backtobase-api.onrender.com/api
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

---

## 📝 How to Get Each Variable

### 1. MONGODB_URI

**Steps:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Click "Connect" → "Connect your application"
4. Copy connection string
5. Replace `<password>` with your database password
6. Replace `myFirstDatabase` with `backtobase`

**Example:**
```
mongodb+srv://admin:MyP@ssw0rd123@cluster0.abc123.mongodb.net/backtobase?retryWrites=true&w=majority
```

### 2. JWT_SECRET

**Generate a secure random string:**

**Option A - Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option B - Online:**
Use: https://randomkeygen.com/ (CodeIgniter Encryption Keys)

**Option C - Manual:**
Create a long random string (min 32 characters):
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### 3. EMAIL_PASS (Gmail App Password)

**Steps:**
1. Go to [Google Account](https://myaccount.google.com/)
2. Security → 2-Step Verification (enable if not enabled)
3. Security → App passwords
4. Select "Mail" and your device
5. Click "Generate"
6. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)
7. Use this password (remove spaces)

**Important:** This is NOT your Gmail password!

### 4. FRONTEND_URL

**After deploying to Vercel, you'll get a URL like:**
```
https://backtobase-xyz123.vercel.app
```

Use this URL without `/api` at the end.

### 5. REACT_APP_API_URL

**After deploying backend to Render, you'll get a URL like:**
```
https://backtobase-api.onrender.com
```

Add `/api` at the end:
```
https://backtobase-api.onrender.com/api
```

---

## ✅ Quick Checklist

Before deploying, make sure you have:

### For Backend (Render):
- [ ] MongoDB connection string
- [ ] JWT secret (64+ characters)
- [ ] Gmail email address
- [ ] Gmail app password
- [ ] Frontend URL (update after frontend deploys)

### For Frontend (Vercel):
- [ ] Backend API URL (get after backend deploys)

---

## 🧪 Testing Your Variables

### Test MongoDB Connection:

```javascript
// Run this in Node.js locally
const mongoose = require('mongoose');
mongoose.connect('YOUR_MONGODB_URI')
  .then(() => console.log('✅ Connected!'))
  .catch(err => console.log('❌ Failed:', err));
```

### Test Email Configuration:

```javascript
// Run this in Node.js locally
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'YOUR_EMAIL',
    pass: 'YOUR_APP_PASSWORD'
  }
});

transporter.verify()
  .then(() => console.log('✅ Email config works!'))
  .catch(err => console.log('❌ Failed:', err));
```

---

## 🔒 Security Notes

### ⚠️ Never Commit These Files:
- `.env`
- `.env.local`
- `.env.production`

Already in `.gitignore` ✅

### ✅ Best Practices:
1. Use different secrets for dev and production
2. Rotate JWT_SECRET periodically
3. Use app passwords, never real Gmail password
4. Whitelist IP addresses in MongoDB when possible
5. Never share your `.env` file

---

## 🔄 Updating Environment Variables

### Render:
1. Go to your service dashboard
2. Click "Environment"
3. Edit or add variables
4. Click "Save Changes"
5. Service will auto-redeploy

### Vercel:
1. Go to your project settings
2. Click "Environment Variables"
3. Add or edit variables
4. Redeploy (automatic or manual)

---

## 🆘 Common Issues

### "MongoServerError: bad auth"
- Check username/password in connection string
- Verify database user exists in MongoDB Atlas

### "Invalid JWT token"
- JWT_SECRET might be different between deployments
- Check JWT_SECRET is the same everywhere

### "Email sending failed"
- Verify 2-Step Verification is enabled
- Generate a NEW app password
- Check EMAIL_USER and EMAIL_FROM match

### "CORS error"
- Check FRONTEND_URL matches your Vercel deployment
- Verify no trailing slash in URLs

---

## 💡 Pro Tips

1. **Use different MongoDB databases** for dev and production
2. **Set JWT_EXPIRE to 30d** for better user experience
3. **Use environment-specific email subjects** (add [DEV] prefix for dev)
4. **Monitor email quota** (Gmail has daily limits)
5. **Test variables locally** before deploying

---

## 📞 Need Help?

If you're stuck:
1. Double-check spelling and formatting
2. No quotes needed around values in Render/Vercel
3. Watch for hidden spaces or special characters
4. Test each variable independently
5. Check deployment logs for specific errors

---

Your environment is now configured for production! 🚀✨
