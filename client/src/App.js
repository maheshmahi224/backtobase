import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import InvitedPeople from './pages/InvitedPeople';
import CheckedInPeople from './pages/CheckedInPeople';
import ShortlistedPeople from './pages/ShortlistedPeople';
import Settings from './pages/Settings';
import CheckInPage from './pages/CheckInPage';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/checkin/:token" element={<CheckInPage />} />

              {/* Protected routes */}
              <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/invited" element={<InvitedPeople />} />
                <Route path="/checked-in" element={<CheckedInPeople />} />
                <Route path="/shortlisted" element={<ShortlistedPeople />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
