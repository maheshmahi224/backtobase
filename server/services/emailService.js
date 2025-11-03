import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { generateParticipantQR } from './qrService.js';

const OAuth2 = google.auth.OAuth2;

// Create transporter with Gmail App Password (Simple & Reliable)
const createTransporter = async () => {
  try {
    // Validate required environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required for email service');
    }

    console.log('📧 Creating Gmail transporter for:', process.env.EMAIL_USER);

    // Primary method: Gmail App Password (SIMPLE & RECOMMENDED)
    if (process.env.EMAIL_PASS) {
      // Use port 465 with SSL instead of 587 with TLS
      // Port 587 is often blocked by hosting providers like Render
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use SSL
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        // Add timeout and connection settings
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });

      // Verify transporter configuration
      try {
        await transporter.verify();
        console.log('✅ Email transporter verified successfully');
      } catch (error) {
        console.error('⚠️ Email verification failed, but will attempt to send:', error.message);
        // Don't throw error here - let actual sending attempt fail if needed
      }
      
      return transporter;
    }

    // Fallback to OAuth2 (only if EMAIL_PASS is not available)
    if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_REFRESH_TOKEN) {
      console.log('📧 Using Gmail OAuth2 authentication');
      const oauth2Client = new OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        process.env.GMAIL_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      });

      const accessToken = await oauth2Client.getAccessToken();

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_USER,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: accessToken.token,
        },
      });

      return transporter;
    }

    throw new Error('No valid email authentication method configured');
  } catch (error) {
    console.error('❌ Error creating email transporter:', error.message);
    throw error;
  }
};

// Send single email
export const sendEmail = async ({ to, subject, html, text, attachments }) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text: text || '',
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Send bulk emails with batching and rate limiting
export const sendBulkEmails = async (emailsData, batchSize = 100) => {
  const results = {
    successful: [],
    failed: [],
  };

  // Process emails in batches
  for (let i = 0; i < emailsData.length; i += batchSize) {
    const batch = emailsData.slice(i, i + batchSize);
    
    console.log(`📧 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(emailsData.length / batchSize)}`);

    const batchPromises = batch.map(async (emailData) => {
      try {
        const result = await sendEmail({
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
          attachments: emailData.attachments,
        });

        if (result.success) {
          results.successful.push(emailData.participantId);
        } else {
          results.failed.push({
            participantId: emailData.participantId,
            email: emailData.to,
            error: result.error,
          });
        }
      } catch (error) {
        results.failed.push({
          participantId: emailData.participantId,
          email: emailData.to,
          error: error.message,
        });
      }
    });

    await Promise.all(batchPromises);

    // Wait 10 seconds between batches to avoid rate limiting
    if (i + batchSize < emailsData.length) {
      console.log('⏳ Waiting 10 seconds before next batch...');
      await sleep(10000);
    }
  }

  console.log(`✅ Bulk email sending complete. Success: ${results.successful.length}, Failed: ${results.failed.length}`);
  
  return results;
};

// Queue-based email sending with retry logic
export const queueEmail = async (emailData) => {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const result = await sendEmail(emailData);
      
      if (result.success) {
        return result;
      }
      
      retries++;
      if (retries < maxRetries) {
        console.log(`⚠️ Retry ${retries}/${maxRetries} for ${emailData.to}`);
        await sleep(2000 * retries); // Exponential backoff
      }
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        throw error;
      }
    }
  }

  throw new Error(`Failed to send email after ${maxRetries} retries`);
};

// Replace placeholders in email content
export const replacePlaceholders = (content, data) => {
  let result = content;
  
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }
  
  return result;
};

// Replace placeholders including QR code
export const replacePlaceholdersWithQR = (content, data, participant) => {
  let result = content;
  
  // First replace all standard placeholders
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }
  
  // Generate and replace QR code if placeholder exists
  if (result.includes('{{qr}}')) {
    try {
      const qrCodeURL = generateParticipantQR(participant);
      const qrImageTag = `<img src="${qrCodeURL}" alt="QR Code" style="max-width: 300px; display: block; margin: 20px auto;" />`;
      result = result.replace(/{{qr}}/g, qrImageTag);
    } catch (error) {
      console.error('Error generating QR code for email:', error);
      // Remove QR placeholder if generation fails
      result = result.replace(/{{qr}}/g, '');
    }
  }
  
  return result;
};

// Generate default invitation template
export const getDefaultInvitationTemplate = (eventName) => {
  return {
    subject: `You're Invited to ${eventName}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .details { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You're Invited!</h1>
          </div>
          <div class="content">
            <p>Dear <strong>{{name}}</strong>,</p>
            
            <p>We are excited to invite you to <strong>{{eventName}}</strong>!</p>
            
            <div class="details">
              <p><strong>📅 Date:</strong> {{date}}</p>
              <p><strong>⏰ Time:</strong> {{time}}</p>
              <p><strong>📍 Venue:</strong> {{venue}}</p>
            </div>
            
            <p>Please confirm your attendance by clicking the check-in button below:</p>
            
            <div style="text-align: center;">
              <a href="{{checkinLink}}" class="button">✓ Check In</a>
              <a href="{{calendarLink}}" class="button">📅 Add to Calendar</a>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              {{qr}}
              <p style="color: #666; font-size: 12px; margin-top: 10px;">Scan this QR code at the event for quick check-in</p>
            </div>
            
            <p>We look forward to seeing you there!</p>
            
            <p>Best regards,<br>The Event Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email from Back To Base Event Platform</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};

// Generate default confirmation template
export const getDefaultConfirmationTemplate = () => {
  return {
    subject: 'Congratulations! You\'ve been shortlisted for {{eventName}}',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .badge { display: inline-block; background: #38ef7d; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; }
          .details { background: white; padding: 20px; border-left: 4px solid #38ef7d; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
          </div>
          <div class="content">
            <p>Dear <strong>{{name}}</strong>,</p>
            
            <p>We are delighted to inform you that you have been <span class="badge">SHORTLISTED</span> for <strong>{{eventName}}</strong>!</p>
            
            <div class="details">
              <p><strong>📅 Date:</strong> {{date}}</p>
              <p><strong>⏰ Time:</strong> {{time}}</p>
              <p><strong>📍 Venue:</strong> {{venue}}</p>
            </div>
            
            <p>Please make sure to arrive on time. We're excited to have you join us!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              {{qr}}
              <p style="color: #666; font-size: 12px; margin-top: 10px;">Your personal QR code for event entry</p>
            </div>
            
            <p>For any queries, please feel free to reach out to us.</p>
            
            <p>Best regards,<br>The Event Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email from Back To Base Event Platform</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};

// Helper function to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
