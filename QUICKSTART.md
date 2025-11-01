# ⚡ Quick Start Guide

Get Back To Base up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 16+ installed
- [ ] MongoDB Atlas account created
- [ ] Gmail account ready
- [ ] Git installed

## 🚀 Setup Steps

### 1. Clone & Install (2 minutes)

```bash
# Clone the repository
cd Desktop/backtobase/backtobase

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Backend (2 minutes)

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
NODE_ENV=development

# Get from MongoDB Atlas (see below)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/backtobase

# Generate a random string
JWT_SECRET=your-random-secret-key-here

# Get from Gmail OAuth setup (see GMAIL_OAUTH_SETUP.md)
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
EMAIL_FROM=your-email@gmail.com

FRONTEND_URL=http://localhost:3000
```

### 3. Setup MongoDB Atlas (30 seconds)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (M0)
3. Create database user
4. Whitelist IP: `0.0.0.0/0`
5. Get connection string → Replace `<password>` and `<dbname>`

### 4. Setup Gmail OAuth (Optional - 1 minute)

Quick option for testing:
```env
# Use these test credentials (NOT for production!)
GMAIL_CLIENT_ID=test
GMAIL_CLIENT_SECRET=test
GMAIL_REFRESH_TOKEN=test
```

For real email sending, follow [GMAIL_OAUTH_SETUP.md](./GMAIL_OAUTH_SETUP.md)

### 5. Start Application (10 seconds)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

Application opens at: `http://localhost:3000`

## 🎯 First Steps

### Create Your Account

1. Open `http://localhost:3000/register`
2. Fill in your details
3. Click "Create Account"

### Create Your First Event

1. Click "Create Event"
2. Fill in:
   - Event Name: "Tech Conference 2024"
   - Description: "Annual tech conference"
   - Date: Tomorrow
   - Time: "10:00 AM"
   - Venue: "Convention Center"
3. Click "Create Event"

### Upload Participants

1. Open the event
2. Click "Upload CSV"
3. Use this sample CSV:

```csv
name,email,phone
John Doe,john@example.com,1234567890
Jane Smith,jane@example.com,0987654321
Bob Johnson,bob@example.com,5555555555
```

4. Save as `participants.csv` and upload

### Send Invitations

1. Click "Send Invitations"
2. Customize email template (optional)
3. Click "Send Invitations"
4. Check console for email sending progress

### Test Check-In

1. Copy check-in link from email (or database)
2. Open in new tab
3. Click "Confirm Check-In"
4. See success message

## 🔥 Sample Data Generator

Want to test with more data? Run this in MongoDB shell:

```javascript
// Create 100 test participants
db.participants.insertMany(
  Array.from({ length: 100 }, (_, i) => ({
    name: `Test User ${i + 1}`,
    email: `user${i + 1}@test.com`,
    phone: `555000${String(i).padStart(4, '0')}`,
    eventId: ObjectId("YOUR_EVENT_ID"),
    token: new UUID().toString(),
    invited: false,
    checkedIn: false,
    shortlisted: false,
    source: 'upload',
    createdAt: new Date(),
    updatedAt: new Date()
  }))
)
```

## ⚙️ Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT tokens | `my-secret-key-123` |
| `GMAIL_CLIENT_ID` | Google OAuth client ID | `123-abc.apps.googleusercontent.com` |
| `GMAIL_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-xxx` |
| `GMAIL_REFRESH_TOKEN` | Gmail refresh token | `1//04xxx` |
| `EMAIL_FROM` | Sender email address | `noreply@backtobase.com` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |

## 🐛 Common Issues

### "Cannot connect to MongoDB"
**Solution**: Check MongoDB Atlas:
- Network access allows `0.0.0.0/0`
- Username/password are correct
- Database name is correct

### "npm install fails"
**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### "Port 3000 already in use"
**Solution**:
```bash
# Kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### "JWT malformed"
**Solution**: 
- Clear localStorage in browser
- Login again to get new token

### "Emails not sending"
**Solution**:
- Check Gmail OAuth credentials
- Verify refresh token is valid
- Check Gmail API is enabled
- See [GMAIL_OAUTH_SETUP.md](./GMAIL_OAUTH_SETUP.md)

## 📱 Test with Mobile

1. Find your local IP:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. Update `.env`:
   ```env
   FRONTEND_URL=http://YOUR_LOCAL_IP:3000
   ```

3. Open on mobile: `http://YOUR_LOCAL_IP:3000`

## 🎨 Customize Theme

The app supports dark/light mode:
- Click moon/sun icon in header
- Theme persists across sessions
- Customize colors in `client/tailwind.config.js`

## 📊 View Database

Use MongoDB Compass:
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect with your MongoDB URI
3. Browse collections: `users`, `events`, `participants`

## 🔐 Create Admin User

First user is automatically an organizer. To create admin:

```javascript
// In MongoDB shell
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

## 📈 Production Checklist

Before deploying:

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Setup Gmail OAuth with verified app
- [ ] Enable MongoDB IP whitelist for production
- [ ] Add environment variables to hosting platform
- [ ] Test all features in production
- [ ] Setup monitoring and logging

## 🎓 Learn More

- [Full Documentation](./README.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Gmail OAuth Setup](./GMAIL_OAUTH_SETUP.md)

## 💡 Pro Tips

1. **Use VSCode Extensions**:
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - MongoDB for VS Code

2. **Development Shortcuts**:
   - Backend: `npm run dev` (auto-restart with nodemon)
   - Frontend: `npm start` (hot reload)

3. **Debug Mode**:
   - Check browser console for frontend errors
   - Check terminal for backend logs
   - Use React DevTools extension

4. **Test Email Templates**:
   - Use `/api/email/test` endpoint
   - Send to your own email first
   - Preview in different email clients

---

🎉 **Congratulations!** You're ready to automate events with Back To Base!

Need help? Check the [README](./README.md) or create an issue on GitHub.
