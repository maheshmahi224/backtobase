# 📧 Gmail OAuth 2.0 Setup Guide

This guide will walk you through setting up Gmail OAuth 2.0 for the Back To Base application to send emails programmatically.

## Prerequisites

- A Google/Gmail account
- Access to Google Cloud Console

## Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a Project** dropdown at the top
3. Click **NEW PROJECT**
4. Enter project name: `BackToBase` (or your preferred name)
5. Click **CREATE**
6. Wait for the project to be created and select it

### 2. Enable Gmail API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Gmail API"
3. Click on **Gmail API**
4. Click **ENABLE**
5. Wait for the API to be enabled

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type (unless you have a Google Workspace)
3. Click **CREATE**

4. **Fill in App Information**:
   - **App name**: Back To Base
   - **User support email**: Your email
   - **Developer contact email**: Your email
   - Click **SAVE AND CONTINUE**

5. **Scopes**:
   - Click **ADD OR REMOVE SCOPES**
   - Search for `https://mail.google.com` and select it
   - Click **UPDATE**
   - Click **SAVE AND CONTINUE**

6. **Test users** (if in testing mode):
   - Click **ADD USERS**
   - Add your Gmail address
   - Click **ADD**
   - Click **SAVE AND CONTINUE**

7. Click **BACK TO DASHBOARD**

### 4. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **OAuth client ID**

4. **Configure the OAuth client**:
   - **Application type**: Web application
   - **Name**: BackToBase Web Client
   
5. **Add Authorized redirect URIs**:
   - Click **+ ADD URI**
   - Enter: `https://developers.google.com/oauthplayground`
   - Click **CREATE**

6. **Save Credentials**:
   - A popup will show your **Client ID** and **Client Secret**
   - Click **DOWNLOAD JSON** (optional backup)
   - Copy the **Client ID** and **Client Secret** - you'll need these!

### 5. Generate Refresh Token Using OAuth Playground

1. Open [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)

2. **Configure Settings**:
   - Click the **⚙️ Settings** icon (top right)
   - Check ✅ **Use your own OAuth credentials**
   - Paste your **OAuth Client ID**
   - Paste your **OAuth Client Secret**
   - Close settings

3. **Authorize APIs**:
   - In **Step 1** on the left sidebar
   - Scroll down and find **Gmail API v1**
   - Select `https://mail.google.com` (full Gmail access)
   - Click **Authorize APIs** button

4. **Sign In**:
   - Choose your Google account
   - Click **Continue** on the warning screen
   - Click **Continue** to grant permissions

5. **Exchange Code for Tokens**:
   - You'll be redirected back to the playground
   - In **Step 2**, click **Exchange authorization code for tokens**
   - The playground will display your tokens

6. **Copy Refresh Token**:
   - Under **Refresh token**, copy the long string
   - **⚠️ Important**: Save this token securely - you won't see it again!

### 6. Update Your .env File

Open `server/.env` and add your credentials:

```env
# Gmail OAuth Configuration
GMAIL_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
GMAIL_REDIRECT_URI=https://developers.google.com/oauthplayground
GMAIL_REFRESH_TOKEN=1//04xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email Configuration
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Back To Base
```

**Replace**:
- `GMAIL_CLIENT_ID` → Your Client ID
- `GMAIL_CLIENT_SECRET` → Your Client Secret
- `GMAIL_REFRESH_TOKEN` → Your Refresh Token
- `EMAIL_FROM` → Your Gmail address

### 7. Test Email Sending

1. Start your backend server:
```bash
cd server
npm run dev
```

2. Send a test email using the API:
```bash
curl -X POST http://localhost:5000/api/email/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "htmlContent": "<p>This is a test email!</p>"
  }'
```

3. Check if the email was sent successfully

## Troubleshooting

### Error: "invalid_grant"
- Your refresh token has expired
- Go back to OAuth Playground and generate a new refresh token

### Error: "Daily sending quota exceeded"
- Gmail has daily sending limits:
  - Free Gmail: 500 emails/day
  - Google Workspace: 2000 emails/day
- Wait 24 hours or upgrade to Google Workspace

### Error: "403 Forbidden"
- Make sure Gmail API is enabled
- Check that your OAuth consent screen is properly configured
- Verify test users are added (if in testing mode)

### Error: "401 Unauthorized"
- Check that your Client ID and Client Secret are correct
- Verify the refresh token is valid
- Make sure `.env` file is being loaded

### Emails Going to Spam
- Verify your domain with Google
- Add SPF and DKIM records
- Avoid spam trigger words in email content
- Don't send too many emails too quickly

## Security Best Practices

1. **Never commit credentials**
   - Keep `.env` in `.gitignore`
   - Never share your Client Secret or Refresh Token

2. **Use environment variables**
   - Store all credentials in `.env`
   - Never hardcode credentials in source code

3. **Rotate credentials periodically**
   - Generate new OAuth credentials every few months
   - Update refresh tokens if suspicious activity detected

4. **Limit scope access**
   - Only request `https://mail.google.com` scope
   - Don't request unnecessary permissions

5. **Monitor usage**
   - Check Google Cloud Console for API usage
   - Set up billing alerts
   - Monitor for suspicious activity

## Rate Limits

Gmail API has the following limits:

| Metric | Limit |
|--------|-------|
| Messages sent per day (free) | 500 |
| Messages sent per day (Workspace) | 2000 |
| Requests per second | 250 |
| Requests per minute | 15,000 |

### Handling Rate Limits in Code

The application implements:
- **Batch sending**: 100 emails per batch
- **Delay between batches**: 10 seconds
- **Retry logic**: 3 attempts with exponential backoff
- **Queue system**: Processes emails asynchronously

## Moving to Production

### For Small Scale (< 500 emails/day)
- Current Gmail OAuth setup is sufficient
- No additional configuration needed

### For Large Scale (> 500 emails/day)
1. **Upgrade to Google Workspace**
   - Increases limit to 2000/day
   - Better deliverability

2. **Use Dedicated Email Service**
   - SendGrid, Mailgun, or Amazon SES
   - No daily limits
   - Better analytics and tracking

3. **Publish OAuth App**
   - Complete verification process
   - Remove "testing" mode restrictions
   - Submit privacy policy and terms of service

## Additional Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

If you encounter issues:
1. Check the [Gmail API Status](https://status.cloud.google.com/)
2. Review error logs in `server` console
3. Verify all credentials are correct
4. Check API quotas in Google Cloud Console

---

✅ Once setup is complete, your application can send up to 500 emails per day automatically!
