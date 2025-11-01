import React, { useState, useEffect } from 'react';
import { Star, Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { participantAPI, eventAPI, emailAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/helpers';

const ShortlistedPeople = () => {
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({ subject: '', htmlContent: '' });
  const [sending, setSending] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const eventsRes = await eventAPI.getAll({ limit: 100 });
      setEvents(eventsRes.data.data.events);

      const allParticipants = [];
      for (const event of eventsRes.data.data.events) {
        const res = await participantAPI.getByEvent(event._id, { shortlisted: true, limit: 100 });
        allParticipants.push(...res.data.data.participants.map(p => ({ ...p, eventName: event.eventName, eventObj: event })));
      }
      setParticipants(allParticipants);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = selectedEvent === 'all'
    ? participants
    : participants.filter(p => p.eventId === selectedEvent);

  const handleSendConfirmations = async () => {
    if (filteredParticipants.length === 0) {
      toast.error('No shortlisted participants to send confirmations');
      return;
    }

    setSending(true);

    try {
      // Group by event
      const eventGroups = {};
      filteredParticipants.forEach(p => {
        if (!eventGroups[p.eventId]) eventGroups[p.eventId] = [];
        eventGroups[p.eventId].push(p._id);
      });

      // Send for each event
      for (const [eventId, participantIds] of Object.entries(eventGroups)) {
        await emailAPI.sendConfirmations({
          eventId,
          participantIds,
          subject: emailData.subject || 'Congratulations! You have been shortlisted',
          htmlContent: emailData.htmlContent || getDefaultConfirmationTemplate(),
        });
      }

      toast.success('Confirmation emails are being sent!');
      setShowEmailModal(false);
      setTimeout(() => fetchData(), 2000);
    } catch (error) {
      toast.error('Failed to send confirmations');
    } finally {
      setSending(false);
    }
  };

  const getDefaultConfirmationTemplate = () => {
    return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #10b981;">🎉 Congratulations!</h2>
  <p>Dear <strong>{{name}}</strong>,</p>
  <p>We are delighted to inform you that you have been <strong>SHORTLISTED</strong>!</p>
  <p>Event: <strong>{{eventName}}</strong></p>
  <p>We look forward to seeing you!</p>
  <p>Best regards,<br>The Event Team</p>
</div>
    `.trim();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shortlisted People</h1>
          <p className="text-muted-foreground mt-1">
            All participants who have been shortlisted
          </p>
        </div>
        {filteredParticipants.length > 0 && (
          <Button onClick={() => setShowEmailModal(true)}>
            <Mail className="w-4 h-4 mr-2" />
            Send Confirmations
          </Button>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <label className="text-sm font-medium">Filter by Event:</label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="all">All Events</option>
          {events.map(event => (
            <option key={event._id} value={event._id}>{event.eventName}</option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shortlisted Participants ({filteredParticipants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No shortlisted participants yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Event</th>
                    <th className="text-center p-3 font-medium">Confirmation Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((participant) => (
                    <tr key={participant._id} className="border-b hover:bg-accent">
                      <td className="p-3">{participant.name}</td>
                      <td className="p-3">{participant.email}</td>
                      <td className="p-3">{participant.eventName}</td>
                      <td className="p-3 text-center">
                        {participant.confirmationSent ? '✅' : '⏳'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title="Send Confirmation Emails"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Send confirmation emails to {filteredParticipants.length} shortlisted participants
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium">Subject (optional)</label>
            <Input
              value={emailData.subject}
              onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              placeholder="Congratulations! You have been shortlisted"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Content (optional, HTML)</label>
            <textarea
              rows={8}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={emailData.htmlContent}
              onChange={(e) => setEmailData({ ...emailData, htmlContent: e.target.value })}
              placeholder="Leave empty to use default template"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSendConfirmations} disabled={sending} className="flex-1">
              {sending ? 'Sending...' : 'Send Confirmations'}
            </Button>
            <Button variant="outline" onClick={() => setShowEmailModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ShortlistedPeople;
