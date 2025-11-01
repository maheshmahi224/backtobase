import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, MapPin, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { eventAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/helpers';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    coverImage: '',
  });
  const [creating, setCreating] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventAPI.getAll({ limit: 50 });
      setEvents(response.data.data.events);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      await eventAPI.create(formData);
      toast.success('Event created successfully!');
      setShowCreateModal(false);
      setFormData({
        eventName: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        coverImage: '',
      });
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setCreating(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your events in one place
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first event to get started
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link key={event._id} to={`/events/${event._id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                {event.coverImage && (
                  <div className="h-48 w-full bg-gradient-to-br from-purple-400 to-pink-400 rounded-t-lg" />
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{event.eventName}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.date)} at {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{event.stats?.totalInvited || 0} invited</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                    <div>
                      <p className="font-semibold text-green-600">
                        {event.stats?.totalCheckedIn || 0}
                      </p>
                      <p className="text-muted-foreground">Checked In</p>
                    </div>
                    <div>
                      <p className="font-semibold text-yellow-600">
                        {event.stats?.totalShortlisted || 0}
                      </p>
                      <p className="text-muted-foreground">Shortlisted</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Event"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="eventName" className="text-sm font-medium">
              Event Name *
            </label>
            <Input
              id="eventName"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                Date *
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="time" className="text-sm font-medium">
                Time *
              </label>
              <Input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="venue" className="text-sm font-medium">
              Venue *
            </label>
            <Input
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="coverImage" className="text-sm font-medium">
              Cover Image URL (optional)
            </label>
            <Input
              id="coverImage"
              name="coverImage"
              type="url"
              value={formData.coverImage}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={creating} className="flex-1">
              {creating ? 'Creating...' : 'Create Event'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Events;
