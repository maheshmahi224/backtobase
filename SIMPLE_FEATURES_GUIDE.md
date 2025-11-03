# 🚀 Simple QR & Email Template Features Guide

## ✅ What's Been Implemented

### 1. **Simple QR Code Scanner**
- **Location**: Attended People page (`/attended/:eventId`)
- **How it works**:
  - Click "Scan QR Code" button
  - Click "Start Camera" 
  - Point camera at QR code
  - Automatically marks participant as attended
  - Works on desktop, tablet, and mobile

**No complex setup needed** - just camera and scan!

---

### 2. **Simple HTML/CSS Email Editor**
- **Location**: Event Details → Send Invitations/Confirmations
- **How it works**:
  - Write pure HTML/CSS in the textarea
  - Use placeholders for dynamic content
  - Preview your email before sending
  - Click "Preview" to see how it looks

**No WYSIWYG editor** - direct HTML/CSS control!

---

## 📧 Email Template Placeholders

Use these placeholders in your HTML:

| Placeholder | Description | Example Output |
|------------|-------------|----------------|
| `{{name}}` | Participant name | John Doe |
| `{{email}}` | Participant email | john@example.com |
| `{{phone}}` | Participant phone | +1234567890 |
| `{{eventName}}` | Event name | Tech Conference 2025 |
| `{{venue}}` | Event venue | Convention Center |
| `{{date}}` | Event date | Nov 15, 2025 |
| `{{time}}` | Event time | 10:00 AM |
| `{{checkinLink}}` | Check-in link | Clickable link |
| `{{calendarLink}}` | Add to calendar | Google Calendar link |
| **`{{qr}}`** | **QR Code** | **Auto-generated QR image** |

---

## 🎨 Sample Email Template

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
    }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      padding: 30px; 
      text-align: center; 
      border-radius: 10px 10px 0 0; 
    }
    .content { 
      background: #f9f9f9; 
      padding: 30px; 
      border-radius: 0 0 10px 10px; 
    }
    .button { 
      display: inline-block; 
      background: #667eea; 
      color: white; 
      padding: 12px 30px; 
      text-decoration: none; 
      border-radius: 5px; 
      margin: 10px 5px; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>You're Invited!</h1>
    </div>
    <div class="content">
      <p>Dear <strong>{{name}}</strong>,</p>
      
      <p>We invite you to <strong>{{eventName}}</strong>!</p>
      
      <p><strong>📅 Date:</strong> {{date}}</p>
      <p><strong>⏰ Time:</strong> {{time}}</p>
      <p><strong>📍 Venue:</strong> {{venue}}</p>
      
      <div style="text-align: center;">
        <a href="{{checkinLink}}" class="button">Check In</a>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        {{qr}}
        <p style="color: #666; font-size: 12px;">Scan at event</p>
      </div>
      
      <p>Best regards,<br>The Event Team</p>
    </div>
  </div>
</body>
</html>
```

---

## 🔄 Automated Workflow

```
1. Upload CSV → Participants Registered
           ↓
2. Send Invitations (with {{qr}}) → Invited
           ↓
3. Send Confirmations → Auto-moved to Shortlisted
           ↓
4. Scan QR Code → Moved to Attended People
           ↓
5. View Attended → See all attendees
```

---

## 🎯 Quick Steps to Use

### Send Email with QR Code:
1. Go to Event Details
2. Click "Send Invitations" or "Send Confirmations"
3. Edit HTML/CSS (include `{{qr}}` placeholder)
4. Preview to check
5. Click "Send"

### Scan QR Codes:
1. Go to "Attended People" in sidebar (or from Event Details)
2. Click "Scan QR Code" button
3. Click "Start Camera"
4. Point at participant's QR code
5. Auto-marked as attended! ✓

---

## 🎨 UI Fixes Applied

✅ **Fixed**: HTML/CSS editor now respects dark/light theme  
✅ **Fixed**: Dropdown menus now have proper background colors  
✅ **Fixed**: All form inputs respect theme settings  
✅ **Fixed**: QR scanner has clean, simple interface  

---

## 📱 QR Code Features

- **Generated automatically** when emails are sent with `{{qr}}` placeholder
- **Contains**: Participant name, email, phone, event ID, unique token
- **Works on**: Desktop, tablet, mobile - any device with camera
- **Scannable** in any lighting condition
- **Secure**: Each QR is unique and tied to specific participant

---

## 💡 Pro Tips

1. **Keep HTML simple** - complex designs may not work in all email clients
2. **Use inline CSS** or `<style>` tags in `<head>` - both work
3. **Test on mobile** - most people check email on phones
4. **Preview first** - always preview before sending to 100s of people
5. **QR placement** - put `{{qr}}` where you want the QR code to appear

---

## 🚨 Important Notes

- QR codes are **only generated when emails are sent**
- Placeholders are **case-sensitive** - use exact format: `{{name}}`
- Camera access **must be allowed** for QR scanning
- Attended status **cannot be undone** once QR is scanned

---

## 📊 Navigation Structure

```
Dashboard
  ├── Events
  │     └── Event Details
  │           ├── Upload CSV
  │           ├── Send Invitations (with QR)
  │           ├── Send Confirmations (with QR)
  │           └── View Attended People & Scan QR
  ├── Invited People
  ├── Checked-In
  ├── Shortlisted
  ├── Attended People ← NEW!
  │     ├── View all QR-scanned attendees
  │     ├── Scan QR codes
  │     └── Export to CSV
  └── Settings
```

---

**Everything is now simplified and ready to use!** 🎉

No complex editors, no confusing setups - just simple HTML/CSS editing and easy QR scanning.
