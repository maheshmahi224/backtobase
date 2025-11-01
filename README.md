# 🎉 Back To Base - Event Automation Platform

A comprehensive MERN stack application that enables event organizers to manage multiple events, automate email invitations, handle attendee check-ins, and send confirmation messages.

## 🚀 Features

### Core Functionalities

- **Event Management**: Create, edit, and delete events with complete control
- **Flexible CSV Upload**: Upload participants with **ANY columns** - only name & email required, all other fields automatically detected and stored
- **Email Automation**: Mass-send personalized invitations with Gmail OAuth 2.0
- **Check-In System**: Tokenized check-in links with on-spot registration
- **Shortlisting**: Select and send bulk confirmation emails to shortlisted participants
- **Real-time Analytics**: Track invitations, check-ins, and engagement
- **Dark/Light Theme**: Persistent theme toggle across sessions
- **Responsive Design**: Works seamlessly on desktop and mobile

### Technical Features

- JWT authentication with bcrypt password hashing
- Gmail API OAuth 2.0 for secure email delivery
- Batch email sending with rate limiting (prevents API throttling)
- MongoDB indexes for optimized queries
- RESTful API architecture
- Modern React hooks and context API
- TailwindCSS + shadcn/ui for beautiful UI

## 📁 Project Structure

```
backtobase/
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── layout/     # Layout components
│   │   │   └── ui/         # UI primitives (Button, Card, etc.)
│   │   ├── context/        # React Context providers
│   │   │   ├── AuthContext.js
│   │   │   ├── ThemeContext.js
│   │   │   └── ToastContext.js
│   │   ├── pages/          # Page components
│   │   │   ├── Dashboard.js
│   │   │   ├── Events.js
│   │   │   ├── EventDetails.js
│   │   │   ├── CheckInPage.js
│   │   │   └── ...
│   │   ├── utils/          # Utility functions
│   │   │   ├── api.js
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── server/                  # Node.js + Express backend
    ├── controllers/        # Route controllers
    │   ├── authController.js
    │   ├── eventController.js
    │   ├── participantController.js
    │   ├── emailController.js
    │   ├── checkinController.js
    │   └── shortlistController.js
    ├── models/             # Mongoose models
    │   ├── User.js
    │   ├── Event.js
    │   ├── Participant.js
    │   └── EmailTemplate.js
    ├── routes/             # Express routes
    │   ├── authRoutes.js
    │   ├── eventRoutes.js
    │   ├── participantRoutes.js
    │   ├── emailRoutes.js
    │   ├── checkinRoutes.js
    │   └── shortlistRoutes.js
    ├── services/           # Business logic services
    │   └── emailService.js
    ├── middleware/         # Custom middleware
    │   ├── auth.js
    │   └── validator.js
    ├── server.js           # Entry point
    └── package.json
```

## 🛠️ Tech Stack

### Frontend
- **React** 18.2.0 - UI library
- **React Router** 6.20.1 - Client-side routing
- **TailwindCSS** 3.3.6 - Utility-first CSS
- **shadcn/ui** - High-quality component library
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **Papaparse** - CSV parsing
- **date-fns** - Date utilities

### Backend
- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Nodemailer** + **Gmail API** - Email delivery
- **Helmet** - Security headers
- **Morgan** - HTTP logging
- **express-validator** - Input validation

## 📦 Installation

### Prerequisites

- Node.js (v16+)
- MongoDB Atlas account
- Gmail account for OAuth 2.0

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backtobase
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/backtobase?retryWrites=true&w=majority

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

GMAIL_CLIENT_ID=your-gmail-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REDIRECT_URI=https://developers.google.com/oauthplayground
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token

EMAIL_FROM=noreply@backtobase.com
EMAIL_FROM_NAME=Back To Base

FRONTEND_URL=http://localhost:3000
```

Start the server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Create `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm start
```

The application will open at `http://localhost:3000`

## 🔐 Gmail OAuth 2.0 Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Gmail API**

### Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Add authorized redirect URI: `https://developers.google.com/oauthplayground`
5. Copy **Client ID** and **Client Secret**

### Step 3: Get Refresh Token

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click settings (⚙️), check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. In Step 1, select **Gmail API v1** > `https://mail.google.com`
5. Click **Authorize APIs**
6. In Step 2, click **Exchange authorization code for tokens**
7. Copy the **Refresh Token**

### Step 4: Update .env

Add the credentials to `server/.env`:

```env
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
EMAIL_FROM=your-gmail-address@gmail.com
```

## 📊 Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/organizer),
  isActive: Boolean,
  lastLogin: Date
}
```

### Event
```javascript
{
  eventName: String,
  description: String,
  date: Date,
  time: String,
  venue: String,
  coverImage: String,
  createdBy: ObjectId (User),
  status: String (draft/active/completed/cancelled),
  participants: [ObjectId (Participant)],
  stats: {
    totalInvited: Number,
    totalCheckedIn: Number,
    totalShortlisted: Number
  }
}
```

### Participant
```javascript
{
  name: String,
  email: String,
  phone: String,
  eventId: ObjectId (Event),
  invited: Boolean,
  checkedIn: Boolean,
  shortlisted: Boolean,
  token: String (unique),
  emailStatus: String (pending/sent/failed),
  source: String (upload/manual/onspot)
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Events
- `POST /api/events` - Create event
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/:id/stats` - Get event statistics

### Participants
- `POST /api/participants/upload/:eventId` - Upload CSV
- `GET /api/participants/event/:eventId` - Get participants by event
- `POST /api/participants/bulk-update` - Bulk update (shortlist)
- `POST /api/participants/manual` - Add manual participant

### Email
- `POST /api/email/send-invitations` - Send invitation emails
- `POST /api/email/send-confirmations` - Send confirmation emails
- `POST /api/email/test` - Test email sending

### Check-in
- `GET /api/checkin/:token` - Verify check-in token
- `POST /api/checkin/:token` - Mark as checked in
- `POST /api/checkin/manual` - On-spot registration
- `GET /api/checkin/stats/:eventId` - Get check-in stats

### Shortlist
- `GET /api/shortlist/:eventId` - Get shortlisted participants
- `POST /api/shortlist/add` - Add to shortlist
- `POST /api/shortlist/remove` - Remove from shortlist

## 🎨 UI Components

The application uses a consistent design system with:

- **Button** - Multiple variants (default, destructive, outline, ghost)
- **Card** - Container component with header and content sections
- **Input** - Styled form input with validation states
- **Modal** - Accessible dialog component
- **Toast** - Notification system with auto-dismiss
- **Theme Toggle** - Persistent dark/light mode

## 🚢 Deployment

### Backend (Render/Railway)

1. Create new web service
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from `.env.example`

### Frontend (Vercel)

1. Import project from GitHub
2. Set root directory to `client`
3. Build command: `npm run build`
4. Output directory: `build`
5. Add environment variable: `REACT_APP_API_URL`

### Database (MongoDB Atlas)

1. Create free cluster
2. Add database user
3. Whitelist IP: `0.0.0.0/0` (all IPs)
4. Get connection string and add to backend env

## 📝 Usage Guide

### 1. Create an Event
- Navigate to Events page
- Click "Create Event"
- Fill in event details (name, description, date, time, venue)
- Click "Create Event"

### 2. Upload Participants
- Open event details
- Click "Upload CSV"
- Select CSV file with columns: `name, email, phone`
- Click "Upload"

### 3. Send Invitations
- In event details, click "Send Invitations"
- Customize email subject and content
- Use placeholders: `{{name}}`, `{{eventName}}`, `{{checkinLink}}`
- Click "Send Invitations"

### 4. Check-In Process
- Participants receive email with check-in link
- Click link to verify identity
- Confirm check-in
- System records check-in time

### 5. Shortlist & Confirm
- Go to event details
- Select participants to shortlist
- Navigate to "Shortlisted" tab
- Send bulk confirmation emails

## 🔒 Security Features

- JWT-based authentication with HTTP-only cookies
- Password hashing with bcrypt (10 rounds)
- Rate limiting on API routes
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- MongoDB injection prevention

## 🐛 Troubleshooting

### Email Not Sending
- Verify Gmail OAuth credentials
- Check refresh token validity
- Ensure Gmail API is enabled
- Check API rate limits

### Database Connection Failed
- Verify MongoDB URI
- Check network access in MongoDB Atlas
- Ensure correct username/password

### Build Errors
- Clear `node_modules` and reinstall
- Check Node.js version (v16+)
- Verify all environment variables

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please create an issue on GitHub or contact the maintainers.

---

Built with ❤️ using MERN Stack
