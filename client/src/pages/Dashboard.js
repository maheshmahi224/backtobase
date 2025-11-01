import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, UserCheck, Star, TrendingUp, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { eventAPI } from '../utils/api';
import { formatDate } from '../utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalParticipants: 0,
    totalCheckedIn: 0,
    totalShortlisted: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await eventAPI.getAll({ limit: 5, sortBy: '-createdAt' });
      const events = response.data.data.events;
      
      setRecentEvents(events);
      
      // Calculate stats
      const totalEvents = events.length;
      const totalParticipants = events.reduce((sum, event) => sum + (event.stats?.totalInvited || 0), 0);
      const totalCheckedIn = events.reduce((sum, event) => sum + (event.stats?.totalCheckedIn || 0), 0);
      const totalShortlisted = events.reduce((sum, event) => sum + (event.stats?.totalShortlisted || 0), 0);
      
      setStats({
        totalEvents,
        totalParticipants,
        totalCheckedIn,
        totalShortlisted,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Total Invited',
      value: stats.totalParticipants,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Checked In',
      value: stats.totalCheckedIn,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Shortlisted',
      value: stats.totalShortlisted,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
  ];

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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your events.
          </p>
        </div>
        <Link to="/events">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Events</CardTitle>
            <Link to="/events">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first event to get started
              </p>
              <Link to="/events">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="block p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{event.eventName}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(event.date)} • {event.venue}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-semibold">{event.stats?.totalInvited || 0}</p>
                        <p className="text-muted-foreground">Invited</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-green-600">
                          {event.stats?.totalCheckedIn || 0}
                        </p>
                        <p className="text-muted-foreground">Checked In</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
