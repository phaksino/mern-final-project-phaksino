import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { Calendar, MapPin, Users, CheckCircle, Clock, XCircle } from 'lucide-react';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await usersAPI.getRegistrations();
      setRegistrations(response.data.data.registrations || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `M${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm mb-4">
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Registrations</h1>
          <p className="text-gray-600 mt-2">View your event tickets and registration history</p>
        </div>

        {registrations.length > 0 ? (
          <div className="space-y-6">
            {registrations.map((registration) => (
              <div key={registration.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {getStatusIcon(registration.payment_status)}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          registration.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          registration.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {registration.payment_status.charAt(0).toUpperCase() + registration.payment_status.slice(1)}
                        </span>
                        {registration.mpesa_receipt && (
                          <span className="text-sm text-gray-500">
                            Receipt: {registration.mpesa_receipt}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {registration.events?.title}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-5 w-5 mr-3 text-lesotho-blue" />
                          <div>
                            <div className="font-medium">
                              {formatDate(registration.events?.event_date)}
                            </div>
                            <div className="text-sm">{registration.events?.event_time}</div>
                          </div>
                        </div>

                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-5 w-5 mr-3 text-lesotho-green" />
                          <div>
                            <div className="font-medium">{registration.events?.venue}</div>
                            <div className="text-sm">{registration.events?.location}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{registration.ticket_quantity} ticket{registration.ticket_quantity > 1 ? 's' : ''}</span>
                        </div>
                        <div className="font-semibold text-lesotho-blue">
                          {formatCurrency(registration.total_amount)}
                        </div>
                        <div className="text-gray-500">
                          Registered on {formatDate(registration.created_at)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 md:ml-6">
                      <Link
                        to={`/events/${registration.events?.id}`}
                        className="btn-primary whitespace-nowrap"
                      >
                        View Event
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No registrations yet</h3>
            <p className="text-gray-600 mb-4">You haven't registered for any events yet</p>
            <Link to="/events" className="btn-primary">
              Browse Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRegistrations;