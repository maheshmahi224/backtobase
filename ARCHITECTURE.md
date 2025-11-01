# 🏗️ System Architecture Documentation

## Overview

Back To Base is a full-stack MERN application designed for event automation with a focus on scalability, security, and user experience.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Application (Port 3000)              │ │
│  │                                                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │ │
│  │  │  Pages   │  │Components│  │ Context  │             │ │
│  │  │          │  │          │  │          │             │ │
│  │  │ • Login  │  │ • Button │  │ • Auth   │             │ │
│  │  │ • Events │  │ • Card   │  │ • Theme  │             │ │
│  │  │ • Details│  │ • Modal  │  │ • Toast  │             │ │
│  │  └──────────┘  └──────────┘  └──────────┘             │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────┐             │ │
│  │  │        Axios API Client               │             │ │
│  │  │  • JWT Token Management               │             │ │
│  │  │  • Request/Response Interceptors      │             │ │
│  │  │  • Error Handling                     │             │ │
│  │  └──────────────────────────────────────┘             │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS/REST API
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                        SERVER SIDE                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Express.js Server (Port 5000)                 │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────┐             │ │
│  │  │         Middleware Layer              │             │ │
│  │  │  • CORS                               │             │ │
│  │  │  • Helmet (Security)                  │             │ │
│  │  │  • Rate Limiting                      │             │ │
│  │  │  • JWT Authentication                 │             │ │
│  │  │  • Request Validation                 │             │ │
│  │  └──────────────────────────────────────┘             │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────┐             │ │
│  │  │           Route Layer                 │             │ │
│  │  │  • /api/auth                          │             │ │
│  │  │  • /api/events                        │             │ │
│  │  │  • /api/participants                  │             │ │
│  │  │  • /api/email                         │             │ │
│  │  │  • /api/checkin                       │             │ │
│  │  │  • /api/shortlist                     │             │ │
│  │  └──────────────────────────────────────┘             │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────┐             │ │
│  │  │        Controller Layer               │             │ │
│  │  │  • Business Logic                     │             │ │
│  │  │  • Request Processing                 │             │ │
│  │  │  • Response Formatting                │             │ │
│  │  └──────────────────────────────────────┘             │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────┐             │ │
│  │  │         Service Layer                 │             │ │
│  │  │  • Email Service (Gmail OAuth)        │             │ │
│  │  │  • Batch Processing                   │             │ │
│  │  │  • Queue Management                   │             │ │
│  │  └──────────────────────────────────────┘             │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
         ▼                             ▼
┌─────────────────┐          ┌──────────────────┐
│   MongoDB Atlas │          │   Gmail API      │
│                 │          │                  │
│  • Users        │          │  • OAuth 2.0     │
│  • Events       │          │  • Send Emails   │
│  • Participants │          │  • Rate Limiting │
│  • Templates    │          │  • Batch Send    │
└─────────────────┘          └──────────────────┘
```

## Technology Stack

### Frontend
- **React 18.2** - Component-based UI framework
- **React Router v6** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library
- **Axios** - HTTP client for API requests
- **Context API** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM

### External Services
- **Gmail API** - Email delivery
- **MongoDB Atlas** - Cloud database hosting

## Data Flow

### 1. Authentication Flow

```
User Login Request
    ↓
Frontend → POST /api/auth/login
    ↓
Backend validates credentials
    ↓
Generate JWT token
    ↓
Return token + user data
    ↓
Store in localStorage
    ↓
Set Authorization header for future requests
```

### 2. Event Creation Flow

```
User fills event form
    ↓
Frontend → POST /api/events
    ↓
Validate JWT token (middleware)
    ↓
Validate request body
    ↓
Create Event document in MongoDB
    ↓
Return created event
    ↓
Update UI with new event
```

### 3. CSV Upload Flow

```
User selects CSV file
    ↓
Parse CSV with Papaparse
    ↓
Frontend → POST /api/participants/upload/:eventId
    ↓
Validate JWT & event ownership
    ↓
Parse CSV data
    ↓
Validate each row (email format, required fields)
    ↓
Check for duplicates
    ↓
Bulk insert participants
    ↓
Update event.participants array
    ↓
Return upload results (success, duplicates, errors)
```

### 4. Email Sending Flow

```
User clicks "Send Invitations"
    ↓
Customize email template
    ↓
Frontend → POST /api/email/send-invitations
    ↓
Validate JWT & permissions
    ↓
Fetch participants (not invited)
    ↓
Generate unique token per participant
    ↓
Replace placeholders in template
    ↓
Send response immediately (async processing)
    ↓
Background: Process emails in batches
    ↓
    For each batch (100 emails):
        ├─ Create Gmail transporter (OAuth)
        ├─ Send emails concurrently
        ├─ Wait 10 seconds
        └─ Continue to next batch
    ↓
Update participant.invited = true
    ↓
Update event statistics
```

### 5. Check-In Flow

```
User clicks check-in link
    ↓
Frontend → GET /api/checkin/:token
    ↓
Verify token in database
    ↓
Return participant & event data
    ↓
User confirms check-in
    ↓
Frontend → POST /api/checkin/:token
    ↓
Update participant.checkedIn = true
    ↓
Update participant.checkedInAt = Date.now()
    ↓
Update event statistics
    ↓
Return success message
```

## Database Schema Design

### Entity Relationship Diagram

```
┌──────────────┐
│     User     │
│──────────────│
│ _id          │
│ name         │
│ email        │◄────────────┐
│ password     │             │
│ role         │             │
│ isActive     │             │
└──────────────┘             │
                             │ createdBy
                             │
┌──────────────┐             │
│    Event     │             │
│──────────────│             │
│ _id          │             │
│ eventName    │─────────────┘
│ description  │
│ date         │
│ time         │
│ venue        │
│ createdBy    │
│ participants │◄────────────┐
│ stats        │             │
└──────────────┘             │
                             │ eventId
                             │
┌──────────────┐             │
│ Participant  │             │
│──────────────│             │
│ _id          │             │
│ name         │─────────────┘
│ email        │
│ phone        │
│ eventId      │
│ invited      │
│ checkedIn    │
│ shortlisted  │
│ token        │
│ emailStatus  │
└──────────────┘
```

### Indexes

**Event Collection:**
```javascript
{ createdBy: 1, date: -1 }  // Fast user event queries
{ status: 1 }                // Filter by status
```

**Participant Collection:**
```javascript
{ email: 1, eventId: 1 }     // Unique participant per event
{ eventId: 1, invited: 1 }   // Fast invited queries
{ eventId: 1, checkedIn: 1 } // Fast check-in queries
{ token: 1 }                 // Fast token lookup
```

## Scalability Considerations

### 1. Email Sending (Current Bottleneck)

**Problem**: Gmail API has 500 emails/day limit

**Solutions**:
- **Batch Processing**: 100 emails per batch with 10-second delay
- **Queue System**: Asynchronous processing doesn't block requests
- **Retry Logic**: 3 attempts with exponential backoff
- **Status Tracking**: Monitor sent/failed emails

**Future Improvements**:
- Implement Redis queue (Bull/BullMQ)
- Use SendGrid/Mailgun for higher limits
- Add webhook for email status tracking

### 2. Database Performance

**Current Optimization**:
- Strategic indexes on frequently queried fields
- Pagination on large result sets
- Populate only necessary fields

**Future Improvements**:
- Implement database caching (Redis)
- Add read replicas for analytics queries
- Archive old events to separate collection

### 3. Frontend Performance

**Current Optimization**:
- Code splitting with React.lazy
- Debounced search inputs
- Optimistic UI updates

**Future Improvements**:
- Implement virtual scrolling for large tables
- Add service worker for offline support
- Use React Query for data fetching & caching

## Security Architecture

### 1. Authentication & Authorization

```
Request with JWT
    ↓
Middleware extracts token
    ↓
Verify token signature
    ↓
Check token expiration
    ↓
Fetch user from database
    ↓
Check user.isActive
    ↓
Attach user to req.user
    ↓
Continue to controller
```

### 2. Password Security

- **Hashing**: bcrypt with 10 salt rounds
- **Storage**: Never store plain text
- **Comparison**: Use bcrypt.compare()

### 3. API Security

- **CORS**: Restrict to frontend domain
- **Helmet**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: express-validator
- **SQL Injection**: Mongoose parameterized queries

### 4. Email Token Security

- **UUID v4**: Cryptographically random tokens
- **One-time use**: Tokens expire after check-in
- **No sensitive data**: Tokens only link to participant ID

## Error Handling

### Client-Side

```javascript
try {
  const response = await api.call()
  // Handle success
} catch (error) {
  if (error.response) {
    // API error response
    toast.error(error.response.data.message)
  } else if (error.request) {
    // Network error
    toast.error('Network error. Please try again.')
  } else {
    // Other errors
    toast.error('Something went wrong')
  }
}
```

### Server-Side

```javascript
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})
```

## Deployment Architecture

### Development
```
localhost:3000 (React) ──► localhost:5000 (Express) ──► MongoDB Atlas
                                   │
                                   └──► Gmail API
```

### Production
```
Vercel (Frontend)
    │
    ├──► Static Assets (CDN)
    └──► API Requests (HTTPS)
            │
            ▼
    Render/Railway (Backend)
            │
            ├──► MongoDB Atlas (Database)
            └──► Gmail API (Email Service)
```

## API Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Pagination Response
```json
{
  "status": "success",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

## Performance Metrics

### Target Metrics
- **API Response Time**: < 200ms (p95)
- **Page Load Time**: < 2s
- **Time to Interactive**: < 3s
- **Email Delivery**: < 5s per batch

### Monitoring
- Server logs with Morgan
- API error tracking
- Email delivery status
- Database query performance

## Future Enhancements

### Short Term
1. Add WhatsApp integration for notifications
2. Implement QR code check-in
3. Add email templates library
4. Export participant data (Excel/PDF)
5. Real-time dashboard updates (WebSockets)

### Long Term
1. Multi-tenant support
2. Advanced analytics & reporting
3. Mobile app (React Native)
4. AI-powered email personalization
5. Integrate payment gateway for paid events

---

This architecture is designed to be modular, maintainable, and scalable for future growth.
