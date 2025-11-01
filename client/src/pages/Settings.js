import React from 'react';
import { User, Moon, Sun } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <p className="text-lg mt-1">{user?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <p className="text-lg mt-1">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <p className="text-lg mt-1 capitalize">{user?.role}</p>
          </div>
        </CardContent>
      </Card>

      {/* Theme Section */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
              <div>
                <p className="font-medium">Current Theme</p>
                <p className="text-sm text-muted-foreground capitalize">{theme} mode</p>
              </div>
            </div>
            <Button onClick={toggleTheme}>
              Toggle Theme
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About Back To Base</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Version 1.0.0 - Event Automation Platform
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Manage events, automate invitations, and track attendance seamlessly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
