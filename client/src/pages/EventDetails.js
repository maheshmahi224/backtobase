import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Mail, Users, UserCheck, Star, Trash2, QrCode, CheckSquare, Save } from 'lucide-react';
import Papa from 'papaparse';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import SimpleTemplateEditor from '../components/SimpleTemplateEditor';
import { eventAPI, participantAPI, emailAPI, templateAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/helpers';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    htmlContent: '',
  });
  const [sending, setSending] = useState(false);
  const [addingToShortlist, setAddingToShortlist] = useState(false);
  const [showEmailStatusModal, setShowEmailStatusModal] = useState(false);
  const [emailStatus, setEmailStatus] = useState({
    success: 0,
    failed: 0,
    total: 0,
    errors: [],
  });
  const [icsFile, setIcsFile] = useState(null);
  const [uploadingICS, setUploadingICS] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [savedTemplateId, setSavedTemplateId] = useState(null);
  const [existingTemplate, setExistingTemplate] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const [eventRes, participantsRes] = await Promise.all([
        eventAPI.getOne(id),
        participantAPI.getByEvent(id, { limit: 100 }),
      ]);
      
      setEvent(eventRes.data.data.event);
      setParticipants(participantsRes.data.data.participants);
      
      // Set default email content
      setEmailData({
        subject: `You're Invited to ${eventRes.data.data.event.eventName}!`,
        htmlContent: getDefaultEmailTemplate(eventRes.data.data.event),
      });
    } catch (error) {
      toast.error('Failed to fetch event details');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultEmailTemplate = (event) => {
    return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #8b5cf6;">You're Invited!</h2>
  <p>Dear <strong>{{name}}</strong>,</p>
  <p>We are excited to invite you to <strong>${event.eventName}</strong>!</p>
  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>📅 Date:</strong> ${formatDate(event.date)}</p>
    <p><strong>⏰ Time:</strong> ${event.time}</p>
    <p><strong>📍 Venue:</strong> ${event.venue}</p>
  </div>
  <p>Please confirm your attendance by clicking the button below:</p>
  <a href="{{checkinLink}}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">Check In</a>
  <p>We look forward to seeing you there!</p>
  <p>Best regards,<br>The Event Team</p>
</div>
    `.trim();
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleICSFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.ics')) {
      setIcsFile(file);
      // Auto-upload when file is selected
      await handleUploadICS(file);
    } else {
      toast.error('Please select a valid .ics file');
    }
  };

  const handleUploadICS = async (file) => {
    setUploadingICS(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const icsContent = e.target.result;
        await eventAPI.uploadICS(id, {
          icsContent,
          fileName: file.name,
        });
        toast.success('Calendar file uploaded successfully!');
        fetchEventDetails();
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload calendar file');
    } finally {
      setUploadingICS(false);
    }
  };

  const loadExistingTemplate = async () => {
    try {
      const response = await templateAPI.getByEvent(id);
      const templates = response.data.data.templates;
      if (templates && templates.length > 0) {
        const template = templates[0];
        setExistingTemplate(template);
        setSavedTemplateId(template._id);
        setEmailData({
          subject: template.subject,
          htmlContent: template.htmlContent,
        });
      } else {
        setExistingTemplate(null);
        setSavedTemplateId(null);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      setExistingTemplate(null);
      setSavedTemplateId(null);
    }
  };

  const handleSaveTemplate = async () => {
    if (!emailData.subject || !emailData.htmlContent) {
      toast.error('Please fill in subject and content');
      return;
    }

    setSavingTemplate(true);
    try {
      const templateData = {
        name: `Email Template - ${event.eventName}`,
        type: 'general',
        subject: emailData.subject,
        htmlContent: emailData.htmlContent,
        eventId: id,
      };

      let response;
      if (savedTemplateId) {
        response = await templateAPI.update(savedTemplateId, templateData);
        toast.success('Template updated successfully!');
      } else {
        response = await templateAPI.create(templateData);
        setSavedTemplateId(response.data.data._id);
        toast.success('Template saved successfully!');
      }

      setShowEmailModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save template');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleUploadCSV = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }

    setUploading(true);

    Papa.parse(csvFile, {
      header: true,
      complete: async (results) => {
        try {
          const csvData = Papa.unparse(results.data);
          const response = await participantAPI.upload(id, csvData);
          
          toast.success(response.data.message);
          setShowUploadModal(false);
          setCsvFile(null);
          fetchEventDetails();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to upload participants');
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        toast.error('Failed to parse CSV file');
        setUploading(false);
      },
    });
  };

  const handleSendInvitations = async () => {
    setSending(true);

    try {
      const response = await emailAPI.sendInvitations({
        eventId: id,
        subject: emailData.subject,
        htmlContent: emailData.htmlContent,
        batchSize: 100,
      });

      // Show detailed status modal
      const result = response.data;
      const totalRecipients = result.data?.totalRecipients || 0;
      setEmailStatus({
        success: result.data?.successCount || 0,
        failed: result.data?.failedCount || 0,
        total: totalRecipients,
        errors: result.data?.errors || [],
      });
      setShowEmailStatusModal(true);

      setShowEmailModal(false);
      setTimeout(() => {
        fetchEventDetails();
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitations');
    } finally {
      setSending(false);
    }
  };

  const handleSendConfirmations = async () => {
    setSending(true);

    try {
      const response = await emailAPI.sendConfirmations({
        eventId: id,
        participantIds: selectedParticipants.length > 0 ? selectedParticipants : undefined,
        subject: emailData.subject,
        htmlContent: emailData.htmlContent,
        batchSize: 100,
      });

      // Show detailed status modal
      const result = response.data;
      setEmailStatus({
        success: result.data?.successCount || 0,
        failed: result.data?.failedCount || 0,
        total: result.data?.totalRecipients || 0,
        errors: result.data?.errors || [],
      });
      setShowEmailStatusModal(true);

      setShowEmailModal(false);
      setSelectedParticipants([]);
      setTimeout(() => {
        fetchEventDetails();
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send confirmations');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await eventAPI.delete(id);
      toast.success('Event deleted successfully');
      navigate('/events');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  // Handle checkbox selection
  const handleSelectParticipant = (participantId) => {
    setSelectedParticipants(prev => {
      if (prev.includes(participantId)) {
        return prev.filter(id => id !== participantId);
      } else {
        return [...prev, participantId];
      }
    });
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedParticipants.length === participants.length) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(participants.map(p => p._id));
    }
  };

  // Send invitations to selected participants
  const handleInviteSelected = async () => {
    if (selectedParticipants.length === 0) {
      toast.error('Please select participants to invite');
      return;
    }

    setSending(true);

    try {
      const response = await emailAPI.sendInvitations({
        eventId: id,
        participantIds: selectedParticipants,
        subject: emailData.subject || `You're Invited to ${event.eventName}!`,
        htmlContent: emailData.htmlContent || getDefaultEmailTemplate(event),
        batchSize: 100,
      });

      // Show detailed status modal
      const result = response.data;
      setEmailStatus({
        success: result.data?.successCount || 0,
        failed: result.data?.failedCount || 0,
        total: selectedParticipants.length,
        errors: result.data?.errors || [],
      });
      setShowEmailStatusModal(true);

      setSelectedParticipants([]);
      setTimeout(() => {
        fetchEventDetails();
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitations');
    } finally {
      setSending(false);
    }
  };

  // Add selected participants to shortlist
  const handleAddToShortlist = async () => {
    if (selectedParticipants.length === 0) {
      toast.error('Please select participants to shortlist');
      return;
    }

    setAddingToShortlist(true);

    try {
      await participantAPI.bulkUpdate({
        participantIds: selectedParticipants,
        updates: { shortlisted: true },
      });

      toast.success(`Added ${selectedParticipants.length} participants to shortlist!`);
      setSelectedParticipants([]);
      fetchEventDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to shortlist');
    } finally {
      setAddingToShortlist(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/events')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{event.eventName}</h1>
          <p className="text-muted-foreground mt-1">
            {formatDate(event.date)} at {event.time} • {event.venue}
          </p>
        </div>
        <Button variant="destructive" onClick={handleDeleteEvent}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{participants.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{event.stats?.totalInvited || 0}</p>
                <p className="text-sm text-muted-foreground">Invited</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{event.stats?.totalCheckedIn || 0}</p>
                <p className="text-sm text-muted-foreground">Checked In</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{event.stats?.totalShortlisted || 0}</p>
                <p className="text-sm text-muted-foreground">Shortlisted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attended Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded">
                <UserCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{event.stats?.totalAttended || 0}</p>
                <p className="text-sm text-muted-foreground">Attended (QR Scanned)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <Button 
              onClick={() => navigate(`/attended/${id}`)} 
              className="w-full"
              variant="outline"
            >
              <QrCode className="w-4 h-4 mr-2" />
              View Attended People & Scan QR
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => setShowUploadModal(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload CSV
        </Button>
        <Button onClick={async () => { 
          await loadExistingTemplate();
          setShowEmailModal(true); 
        }} variant="secondary">
          <Mail className="h-4 w-4 mr-2" />
          Edit Email Template
        </Button>
      </div>

      {/* Participants Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Participants ({participants.length})</CardTitle>
            {selectedParticipants.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await templateAPI.getByEvent(id);
                      const templates = response.data.data.templates; // Correct property path
                      const template = templates && templates.length > 0 ? templates[0] : null;
                      
                      if (template) {
                        setEmailData({
                          subject: template.subject,
                          htmlContent: template.htmlContent,
                        });
                        await handleInviteSelected();
                      } else {
                        toast.error('Please create an email template first. Click "Edit Email Template" to create one.');
                      }
                    } catch (error) {
                      console.error('Template load error:', error);
                      toast.error('Please create an email template first');
                    }
                  }}
                  disabled={sending}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Emails ({selectedParticipants.length})
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleAddToShortlist}
                  disabled={addingToShortlist}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Add to Shortlist
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No participants yet. Upload a CSV to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-center p-3 font-medium w-12">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.length === participants.length && participants.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Phone</th>
                    {/* Dynamically render custom field headers */}
                    {participants[0]?.customFields && Object.keys(participants[0].customFields).map(key => (
                      <th key={key} className="text-left p-3 font-medium capitalize">
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                    <th className="text-center p-3 font-medium">Invited</th>
                    <th className="text-center p-3 font-medium">Checked In</th>
                    <th className="text-center p-3 font-medium">Shortlisted</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant) => (
                    <tr key={participant._id} className="border-b hover:bg-accent">
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes(participant._id)}
                          onChange={() => handleSelectParticipant(participant._id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="p-3">{participant.name}</td>
                      <td className="p-3">{participant.email}</td>
                      <td className="p-3">{participant.phone || '-'}</td>
                      {/* Dynamically render custom field values */}
                      {participant.customFields && Object.values(participant.customFields).map((value, idx) => (
                        <td key={idx} className="p-3">{value || '-'}</td>
                      ))}
                      <td className="p-3 text-center">
                        {participant.invited ? '✅' : '⏳'}
                      </td>
                      <td className="p-3 text-center">
                        {participant.checkedIn ? '✅' : '❌'}
                      </td>
                      <td className="p-3 text-center">
                        {participant.shortlisted ? '⭐' : '❌'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload CSV Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Participants (CSV)"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a CSV file with <strong>any columns</strong>. Required: <strong>name</strong> and <strong>email</strong>. All other columns will be automatically detected and stored.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Example columns: name, email, phone, company, designation, age, city, etc.
            </p>
            <Input type="file" accept=".csv" onChange={handleFileChange} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleUploadCSV} disabled={uploading || !csvFile} className="flex-1">
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Send Email Modal with Template Editor */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
title="Email Template"
        size="xl"
      >
        <div className="space-y-4">
          {/* ICS File Upload Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📅 Calendar File (.ics)</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Upload a calendar file that will be:
                </p>
                <ul className="text-sm text-blue-800 dark:text-blue-200 mb-3 list-disc list-inside space-y-1">
                  <li><strong>Attached to every email</strong> - Recipients can directly add to their calendar</li>
                  <li><strong>Linked via {'{{calendarLink}}'}</strong> placeholder - Also available as download link</li>
                </ul>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer">
                    <Input 
                      type="file" 
                      accept=".ics" 
                      onChange={handleICSFileChange}
                      className="hidden"
                      id="ics-upload"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('ics-upload').click()}
                      disabled={uploadingICS}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingICS ? 'Uploading...' : event?.icsFileName ? 'Replace .ics File' : 'Upload .ics File'}
                    </Button>
                  </label>
                  {event?.icsFileName && (
                    <span className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      {event.icsFileName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <SimpleTemplateEditor 
            eventId={id}
            initialTemplate={existingTemplate}
            onSave={(template) => {
              setEmailData({
                subject: template.subject,
                htmlContent: template.htmlContent,
              });
            }}
          />

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={handleSaveTemplate}
              disabled={savingTemplate}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {savingTemplate ? 'Saving...' : savedTemplateId ? 'Update Template' : 'Save Template'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEmailModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Email Status Modal */}
      <Modal
        isOpen={showEmailStatusModal}
        onClose={() => setShowEmailStatusModal(false)}
        title="Email Sending Status"
        size="lg"
      >
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{emailStatus.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{emailStatus.success}</p>
              <p className="text-sm text-muted-foreground">Sent ✅</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{emailStatus.failed}</p>
              <p className="text-sm text-muted-foreground">Failed ❌</p>
            </div>
          </div>

          {/* Success Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Success Rate</span>
              <span className="text-muted-foreground">
                {emailStatus.total > 0 
                  ? Math.round((emailStatus.success / emailStatus.total) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-green-500 h-3 transition-all duration-500"
                style={{
                  width: `${emailStatus.total > 0 
                    ? (emailStatus.success / emailStatus.total) * 100 
                    : 0}%`
                }}
              />
            </div>
          </div>

          {/* Status Message */}
          {emailStatus.success === emailStatus.total && emailStatus.total > 0 ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200 font-medium flex items-center gap-2">
                <span className="text-xl">🎉</span>
                All emails sent successfully!
              </p>
            </div>
          ) : emailStatus.failed > 0 ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                Some emails failed to send
              </p>
            </div>
          ) : null}

          {/* Error Details */}
          {emailStatus.errors && emailStatus.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-red-600 dark:text-red-400">
                Failed Recipients ({emailStatus.errors.length}):
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                {emailStatus.errors.map((error, index) => (
                  <div 
                    key={index} 
                    className="text-sm p-2 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-800"
                  >
                    <p className="font-medium text-red-700 dark:text-red-300">{error.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">{error.error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setShowEmailStatusModal(false)}
              className="flex-1"
            >
              Close
            </Button>
            {emailStatus.failed > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  // Future: Retry failed emails
                  toast.info('Retry feature coming soon!');
                }}
                className="flex-1"
              >
                Retry Failed
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EventDetails;
