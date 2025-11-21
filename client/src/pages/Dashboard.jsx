import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventsAPI, usersAPI } from '../services/api';
import { Calendar, Users, DollarSign, TrendingUp, Plus, Eye } from 'lucide-react';

const Dashboard = () => {
  const { user, isOrganizer } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
    upcomingEvents: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (isOrganizer) {
        // For organizers, get their events and registrations
        const [eventsResponse, registrationsResponse] = await Promise.all([
          eventsAPI.getUserEvents(),
          usersAPI.getEventRegistrations()
        ]);

        const events = eventsResponse.data.data.events || [];
        const registrations = registrationsResponse.data.data.registrations || [];

        const totalRevenue = registrations
          .filter(reg => reg.payment_status === 'paid')
          .reduce((sum, reg) => sum + parseFloat(reg.total_amount), 0);

        setStats({
          totalEvents: events.length,
          totalRegistrations: registrations.length,
          totalRevenue,
          upcomingEvents: events.filter(event => 
            new Date(event.event_date) > new Date()
          ).length
        });

        setRecentEvents(events.slice(0, 5));
        setRecentRegistrations(registrations.slice(0, 5));
      } else {
        // For regular users, get their registrations
        const registrationsResponse = await usersAPI.getRegistrations();
        const registrations = registrationsResponse.data.data.registrations || [];

        setStats({
          totalEvents: registrations.length,
          totalRegistrations: registrations.length,
          totalRevenue: registrations
            .filter(reg => reg.payment_status === 'paid')
            .reduce((sum, reg) => sum + parseFloat(reg.total_amount), 0),
          upcomingEvents: registrations.filter(reg => 
            new Date(reg.events.event_date) > new Date()
          ).length
        });

        setRecentRegistrations(registrations.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `M${parseFloat(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {isOrganizer 
              ? 'Manage your events and track registrations'
              : 'View your event registrations and upcoming events'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-lesotho-blue" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-lesotho-green" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRegistrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Events (for organizers) */}
          {isOrganizer && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Events</h3>
                  <Link
                    to="/create-event"
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Event</span>
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {recentEvents.length > 0 ? (
                  <div className="space-y-4">
                    {recentEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(event.event_date)} • {event.registrations?.count || 0} registrations
                          </p>
                        </div>
                        <Link
                          to={`/events/${event.id}`}
                          className="text-lesotho-blue hover:text-blue-700 flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h4>
                    <p className="text-gray-600 mb-4">Create your first event to get started</p>
                    <Link to="/create-event" className="btn-primary">
                      Create Event
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Registrations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {isOrganizer ? 'Recent Registrations' : 'My Registrations'}
              </h3>
            </div>
            <div className="p-6">
              {recentRegistrations.length > 0 ? (
                <div className="space-y-4">
                  {recentRegistrations.map((registration) => (
                    <div key={registration.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {isOrganizer ? registration.users?.full_name : registration.events?.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {isOrganizer ? registration.events?.title : formatDate(registration.events?.event_date)}
                          {isOrganizer && ` • ${registration.ticket_quantity} tickets`}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          registration.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          registration.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {registration.payment_status.charAt(0).toUpperCase() + registration.payment_status.slice(1)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(registration.total_amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(registration.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {isOrganizer ? 'No registrations yet' : 'No registrations yet'}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {isOrganizer 
                      ? 'Registrations will appear here when users sign up for your events'
                      : 'Register for events to see them here'
                    }
                  </p>
                  <Link to="/events" className="btn-primary">
                    Browse Events
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/events"
              className="p-4 border border-gray-200 rounded-lg hover:border-lesotho-blue hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Eye className="h-6 w-6 text-lesotho-blue" />
                <div>
                  <h4 className="font-medium text-gray-900">Browse Events</h4>
                  <p className="text-sm text-gray-500">Discover new events</p>
                </div>
              </div>
            </Link>

            <Link
              to="/my-registrations"
              className="p-4 border border-gray-200 rounded-lg hover:border-lesotho-green hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-lesotho-green" />
                <div>
                  <h4 className="font-medium text-gray-900">My Tickets</h4>
                  <p className="text-sm text-gray-500">View your registrations</p>
                </div>
              </div>
            </Link>

            {isOrganizer && (
              <Link
                to="/create-event"
                className="p-4 border border-gray-200 rounded-lg hover:border-lesotho-red hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Plus className="h-6 w-6 text-lesotho-red" />
                  <div>
                    <h4 className="font-medium text-gray-900">Create Event</h4>
                    <p className="text-sm text-gray-500">Organize a new event</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;