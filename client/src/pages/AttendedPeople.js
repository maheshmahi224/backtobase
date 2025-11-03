import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { qrAPI, eventAPI } from '../utils/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../context/ToastContext';
import SimpleQRScanner from '../components/SimpleQRScanner';
import {
  ArrowLeft,
  Search,
  UserCheck,
  Download,
  QrCode,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
} from 'lucide-react';
import { formatDate, formatTime } from '../utils/helpers';

const AttendedPeople = () => {
  const { eventId } = useParams();
  const { toast } = useToast();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchEventDetails();
    fetchAttendedParticipants();
    fetchStats();
  }, [eventId, search, pagination.page]);

  const fetchEventDetails = async () => {
    try {
      const response = await eventAPI.getOne(eventId);
      setEvent(response.data.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast({
        title: 'Error',
        description: 'Failed to load event details',
        variant: 'destructive',
      });
    }
  };

  const fetchAttendedParticipants = async () => {
    setLoading(true);
    try {
      const response = await qrAPI.getAttended(eventId, {
        page: pagination.page,
        limit: pagination.limit,
        search,
      });

      setParticipants(response.data.data.participants);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching attended participants:', error);
      toast({
        title: 'Error',
        description: 'Failed to load attended participants',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await qrAPI.getStats(eventId);
      setStats(response.data.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleScanSuccess = (data) => {
    // Refresh the list after successful scan
    fetchAttendedParticipants();
    fetchStats();
    setShowScanner(false);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Attended At'];
    const rows = participants.map(p => [
      p.name,
      p.email,
      p.phone || '',
      new Date(p.attendedAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attended-participants-${eventId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!event) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/events/${eventId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Event
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attended People</h1>
              <p className="text-gray-600 mt-1">{event.eventName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => setShowScanner(!showScanner)}>
              <QrCode className="h-4 w-4 mr-2" />
              {showScanner ? 'Hide Scanner' : 'Scan QR Code'}
            </Button>
          </div>
        </div>

        {/* Event Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-semibold">{formatDate(event.date)} • {event.time}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Venue</p>
                <p className="font-semibold">{event.venue}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Participants</p>
                <p className="font-semibold">{event.participants?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Attended</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalAttended}</p>
                </div>
                <UserCheck className="h-8 w-8 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Shortlisted</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalShortlisted}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Attendance Rate</p>
                  <p className="text-3xl font-bold mt-1">{stats.attendanceRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-sm p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Pending</p>
                  <p className="text-3xl font-bold mt-1">
                    {stats.totalShortlisted - stats.totalAttended}
                  </p>
                </div>
                <Users className="h-8 w-8 text-amber-200" />
              </div>
            </div>
          </div>
        )}

        {/* QR Scanner */}
        {showScanner && (
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <SimpleQRScanner eventId={eventId} onScanSuccess={handleScanSuccess} />
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Participants Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attended At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : participants.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      <UserCheck className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium">No attended participants yet</p>
                      <p className="text-sm">Start scanning QR codes to mark attendance</p>
                    </td>
                  </tr>
                ) : (
                  participants.map((participant) => (
                    <tr key={participant._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {participant.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{participant.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {participant.phone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(participant.attendedAt).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendedPeople;
