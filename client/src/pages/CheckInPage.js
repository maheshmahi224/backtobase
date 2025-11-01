import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Calendar, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { checkinAPI } from '../utils/api';
import { formatDate } from '../utils/helpers';

const CheckInPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualData, setManualData] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await checkinAPI.verify(token);
      setData(response.data.data);
      setCheckedIn(response.data.data.participant.checkedIn);
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid check-in link');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await checkinAPI.checkIn(token);
      setCheckedIn(true);
      setData(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleManualCheckIn = async (e) => {
    e.preventDefault();
    
    try {
      await checkinAPI.manual({
        name: manualData.name,
        email: data.participant.email,
        phone: manualData.phone,
        eventId: data.event._id,
      });
      setCheckedIn(true);
      setShowManualForm(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Check-in failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Invalid Link</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (checkedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Check-In Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Welcome, <strong>{data.participant.name}</strong>!
            </p>
            
            <div className="bg-accent rounded-lg p-4 text-left space-y-2">
              <h3 className="font-semibold text-lg">{data.event.eventName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(data.event.date)} at {data.event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{data.event.venue}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Thank you for checking in. We look forward to seeing you at the event!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showManualForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Complete Your Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualCheckIn} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  value={manualData.name}
                  onChange={(e) => setManualData({ ...manualData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  value={manualData.phone}
                  onChange={(e) => setManualData({ ...manualData, phone: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full">
                Complete Check-In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
          <p className="text-muted-foreground mb-6">
            Hello, <strong>{data.participant.name}</strong>
          </p>
          
          <div className="bg-accent rounded-lg p-4 text-left space-y-2 mb-6">
            <h3 className="font-semibold text-lg">{data.event.eventName}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(data.event.date)} at {data.event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{data.event.venue}</span>
            </div>
          </div>

          <Button onClick={handleCheckIn} className="w-full" size="lg">
            Confirm Check-In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckInPage;
