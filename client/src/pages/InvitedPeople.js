import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { participantAPI, eventAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';

const InvitedPeople = () => {
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const eventsRes = await eventAPI.getAll({ limit: 100 });
      setEvents(eventsRes.data.data.events);

      // Fetch all invited participants
      const allParticipants = [];
      for (const event of eventsRes.data.data.events) {
        const res = await participantAPI.getByEvent(event._id, { invited: true, limit: 100 });
        allParticipants.push(...res.data.data.participants.map(p => ({ ...p, eventName: event.eventName })));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invited People</h1>
        <p className="text-muted-foreground mt-1">
          All participants who have been sent invitations
        </p>
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
          <CardTitle>Invited Participants ({filteredParticipants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No invited participants yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Event</th>
                    <th className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((participant) => (
                    <tr key={participant._id} className="border-b hover:bg-accent">
                      <td className="p-3">{participant.name}</td>
                      <td className="p-3">{participant.email}</td>
                      <td className="p-3">{participant.eventName}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          {participant.emailStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitedPeople;
