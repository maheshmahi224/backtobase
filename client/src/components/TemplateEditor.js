import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { templateAPI } from '../utils/api';
import Button from './ui/Button';
import Input from './ui/Input';
import Label from './ui/Label';
import { useToast } from '../context/ToastContext';
import { Save, Eye, FileText, Mail } from 'lucide-react';

const TemplateEditor = ({ eventId, type = 'invitation', onSave, initialTemplate = null }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [template, setTemplate] = useState({
    name: '',
    subject: '',
    htmlContent: '',
  });

  useEffect(() => {
    if (initialTemplate) {
      setTemplate({
        name: initialTemplate.name,
        subject: initialTemplate.subject,
        htmlContent: initialTemplate.htmlContent,
      });
    } else {
      loadDefaultTemplate();
    }
  }, [eventId, type, initialTemplate]);

  // Call onSave whenever template changes to update parent
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
      const defaultTemplate = type === 'invitation' 
        ? response.data.data.invitation 
        : response.data.data.confirmation;
      
      setTemplate({
        name: `${type === 'invitation' ? 'Invitation' : 'Confirmation'} Template`,
        subject: defaultTemplate.subject,
        htmlContent: defaultTemplate.html,
      });
    } catch (error) {
      console.error('Error loading default template:', error);
      toast({
        title: 'Error',
        description: 'Failed to load default template',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!template.name || !template.subject || !template.htmlContent) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: template.name,
        type,
        subject: template.subject,
        htmlContent: template.htmlContent,
        eventId,
      };

      let response;
      if (initialTemplate?._id) {
        response = await templateAPI.update(initialTemplate._id, data);
      } else {
        response = await templateAPI.create(data);
      }

      toast({
        title: 'Success',
        description: 'Template saved successfully',
      });

      if (onSave) {
        onSave(response.data.data);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save template',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const insertPlaceholder = (placeholder) => {
    const cursorPosition = document.querySelector('.ql-editor')?.selectionStart || 0;
    const beforeText = template.htmlContent.substring(0, cursorPosition);
    const afterText = template.htmlContent.substring(cursorPosition);
    setTemplate({
      ...template,
      htmlContent: beforeText + `{{${placeholder}}}` + afterText,
    });
  };

  const availablePlaceholders = [
    { name: 'name', label: 'Participant Name' },
    { name: 'email', label: 'Email' },
    { name: 'eventName', label: 'Event Name' },
    { name: 'venue', label: 'Venue' },
    { name: 'date', label: 'Date' },
    { name: 'time', label: 'Time' },
    { name: 'checkinLink', label: 'Check-in Link' },
    { name: 'calendarLink', label: 'Calendar Link' },
    { name: 'qr', label: 'QR Code' },
  ];

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">
            {type === 'invitation' ? 'Invitation' : 'Confirmation'} Email Template
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
          <Button size="sm" onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      {/* Template Form */}
      {!previewMode ? (
        <div className="space-y-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              placeholder="Enter template name"
            />
          </div>

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

          {/* Placeholders */}
          <div className="space-y-2">
            <Label>Available Placeholders</Label>
            <div className="flex flex-wrap gap-2">
              {availablePlaceholders.map((placeholder) => (
                <Button
                  key={placeholder.name}
                  variant="outline"
                  size="sm"
                  onClick={() => insertPlaceholder(placeholder.name)}
                  className="text-xs"
                >
                  {placeholder.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Click to insert placeholder into email content. The <strong>{'{{qr}}'}</strong> placeholder will generate a QR code for each participant.
            </p>
          </div>

          {/* HTML Content Editor */}
          <div className="space-y-2">
            <Label>Email Content</Label>
            <div className="border rounded-lg overflow-hidden">
              <ReactQuill
                theme="snow"
                value={template.htmlContent}
                onChange={(value) => setTemplate({ ...template, htmlContent: value })}
                modules={quillModules}
                style={{ minHeight: '400px' }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <div className="border rounded-lg p-6 bg-white">
          <div className="mb-4 pb-4 border-b">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Mail className="h-4 w-4" />
              <span>Subject:</span>
            </div>
            <p className="font-semibold">{template.subject}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded border">
            <p className="text-xs text-gray-500 mb-3">Email Preview (placeholders shown as examples):</p>
            <div 
              className="prose max-w-none bg-white p-6 rounded shadow-sm"
              dangerouslySetInnerHTML={{ 
                __html: template.htmlContent
                  .replace(/{{name}}/g, '<strong>John Doe</strong>')
                  .replace(/{{email}}/g, 'johndoe@example.com')
                  .replace(/{{eventName}}/g, '<strong>Sample Event</strong>')
                  .replace(/{{venue}}/g, 'Sample Venue')
                  .replace(/{{date}}/g, new Date().toLocaleDateString())
                  .replace(/{{time}}/g, '10:00 AM')
                  .replace(/{{checkinLink}}/g, '#checkin-link')
                  .replace(/{{calendarLink}}/g, '#calendar-link')
                  .replace(/{{qr}}/g, '<div style="text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px;"><div style="width: 200px; height: 200px; margin: 0 auto; background: #e5e7eb; display: flex; align-items: center; justify-content: center; border-radius: 8px;">QR Code</div></div>')
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateEditor;
