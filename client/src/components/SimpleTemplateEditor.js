import React, { useState, useEffect } from 'react';
import { templateAPI } from '../utils/api';
import Button from './ui/Button';
import Input from './ui/Input';
import Label from './ui/Label';
import { useToast } from '../context/ToastContext';
import { Save, Eye, Code, Mail } from 'lucide-react';

const SimpleTemplateEditor = ({ eventId, type = 'general', onSave, initialTemplate = null }) => {
  const toast = useToast();
  const [previewMode, setPreviewMode] = useState(false);
  const [template, setTemplate] = useState({
    subject: '',
    htmlContent: '',
  });

  useEffect(() => {
    if (initialTemplate) {
      setTemplate({
        subject: initialTemplate.subject,
        htmlContent: initialTemplate.htmlContent,
      });
    } else {
      loadDefaultTemplate();
    }
  }, [eventId, type, initialTemplate]);

  // Call onSave whenever template changes
  useEffect(() => {
    if (template.subject || template.htmlContent) {
      if (onSave) {
        onSave(template);
      }
    }
  }, [template.subject, template.htmlContent]);

  const loadDefaultTemplate = async () => {
    try {
      const response = await templateAPI.getDefaults(eventId);
      const defaultTemplate = response.data.data.invitation; // Use default invitation template
      
      setTemplate({
        name: 'Email Template',
        subject: defaultTemplate.subject,
        htmlContent: defaultTemplate.html,
      });
    } catch (error) {
      console.error('Error loading default template:', error);
      // Set a basic default if API fails
      setTemplate({
        subject: "You're Invited!",
        htmlContent: getBasicTemplate(),
      });
    }
  };

  const getBasicTemplate = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
    .details { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
    .qr-section { text-align: center; margin: 30px 0; }
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
      
      <div class="qr-section">
        {{qr}}
        <p style="color: #666; font-size: 12px; margin-top: 10px;">Scan this QR code at the event for quick check-in</p>
      </div>
      
      <p>We look forward to seeing you there!</p>
      
      <p>Best regards,<br>The Event Team</p>
    </div>
  </div>
</body>
</html>`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">
            Email Template (HTML/CSS)
          </h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {!previewMode ? (
        <div className="space-y-4">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={template.subject}
              onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
              placeholder="Enter email subject"
            />
            <p className="text-xs text-gray-500">
              You can use placeholders like {'{{name}}'} or {'{{eventName}}'}
            </p>
          </div>

          {/* Available Placeholders */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Available Placeholders:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-800">
              <code>{'{{name}}'}</code>
              <code>{'{{email}}'}</code>
              <code>{'{{phone}}'}</code>
              <code>{'{{eventName}}'}</code>
              <code>{'{{venue}}'}</code>
              <code>{'{{date}}'}</code>
              <code>{'{{time}}'}</code>
              <code>{'{{checkinLink}}'}</code>
              <code>{'{{calendarLink}}'}</code>
              <code className="font-bold">{'{{qr}}'}</code>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              <strong>⚡ Note:</strong> The <code>{'{{qr}}'}</code> placeholder generates a <strong>simple, fast-scanning QR code</strong> for each participant
            </p>
          </div>

          {/* HTML/CSS Editor */}
          <div className="space-y-2">
            <Label>HTML/CSS Content</Label>
            <textarea
              rows={20}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
              value={template.htmlContent}
              onChange={(e) => setTemplate({ ...template, htmlContent: e.target.value })}
              placeholder="Paste your HTML/CSS code here..."
            />
            <p className="text-xs text-gray-500">
              Write your HTML with inline CSS or use {'<style>'} tags. Placeholders will be replaced automatically.
            </p>
          </div>

          {/* Quick Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">💡 Quick Tips:</h4>
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>Use inline CSS or {'<style>'} tags in the {'<head>'} section</li>
              <li>Keep your design simple and mobile-friendly (max-width: 600px recommended)</li>
              <li>Test with different email clients if possible</li>
              <li>⚡ {'{{qr}}'} generates <strong>simple QR codes</strong> that scan in <strong>under 1 second</strong></li>
            </ul>
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <div className="border rounded-lg p-6 bg-card">
          <div className="mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Mail className="h-4 w-4" />
              <span>Subject:</span>
            </div>
            <p className="font-semibold text-foreground">{template.subject}</p>
          </div>
          <div className="bg-muted p-4 rounded border border-border">
            <p className="text-xs text-muted-foreground mb-3">Email Preview (placeholders shown as examples):</p>
            <div 
              className="bg-white rounded shadow-sm"
              dangerouslySetInnerHTML={{ 
                __html: template.htmlContent
                  .replace(/\{\{name\}\}/g, '<strong>John Doe</strong>')
                  .replace(/\{\{email\}\}/g, 'johndoe@example.com')
                  .replace(/\{\{phone\}\}/g, '+1234567890')
                  .replace(/\{\{eventName\}\}/g, '<strong>Sample Event</strong>')
                  .replace(/\{\{venue\}\}/g, 'Sample Venue, City')
                  .replace(/\{\{date\}\}/g, new Date().toLocaleDateString())
                  .replace(/\{\{time\}\}/g, '10:00 AM')
                  .replace(/\{\{checkinLink\}\}/g, '#checkin-link')
                  .replace(/\{\{calendarLink\}\}/g, '#calendar-link')
                  .replace(/\{\{qr\}\}/g, '<div style="text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px; margin: 20px auto; max-width: 300px;"><div style="width: 200px; height: 200px; margin: 0 auto; background: #e5e7eb; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: bold; color: #6b7280;">QR CODE</div></div>')
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleTemplateEditor;
