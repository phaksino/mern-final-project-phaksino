import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsAPI, paymentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowLeft, 
  Share2, 
  Clock,
  User,
  Phone
} from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await eventsAPI.getById(id);
      setEvent(response.data.data.event);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to register for events');
      return;
    }

    if (ticketQuantity > event.available_tickets) {
      toast.error(`Only ${event.available_tickets} tickets available`);
      return;
    }

    setRegistering(true);
    try {
      const response = await paymentsAPI.initiate({
        event_id: id,
        ticket_quantity: ticketQuantity,
        phone_number: phoneNumber
      });

      if (response.data.success) {
        toast.success('Payment initiated! Check your phone to complete payment');
        setShowRegistration(false);
        // Refresh event data to update available tickets
        fetchEvent();
      } else {
        toast.error(response.data.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const shareEvent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-96 bg-gray-300 rounded-lg mb-6"></div>
            <div className="h-6 bg-gray-300 rounded mb-2"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
          <Link to="/events" className="btn-primary">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  const totalAmount = event.ticket_price * ticketQuantity;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/events"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>

        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-64 md:h-80 object-cover"
            />
          ) : (
            <div className="w-full h-64 md:h-80 bg-gradient-to-br from-lesotho-blue to-lesotho-green flex items-center justify-center">
              <Calendar className="h-16 w-16 text-white" />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    event.category === 'music' ? 'bg-purple-100 text-purple-800' :
                    event.category === 'sports' ? 'bg-green-100 text-green-800' :
                    event.category === 'cultural' ? 'bg-yellow-100 text-yellow-800' :
                    event.category === 'business' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    event.status === 'published' ? 'bg-green-100 text-green-800' :
                    event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {event.title}
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3 text-lesotho-blue" />
                    <div>
                      <div className="font-medium">{formatDate(event.event_date)}</div>
                      <div className="text-sm">{formatTime(event.event_time)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-3 text-lesotho-green" />
                    <div>
                      <div className="font-medium">{event.venue}</div>
                      <div className="text-sm">{event.location}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-3 text-lesotho-red" />
                    <div>
                      <div className="font-medium">{event.available_tickets} tickets left</div>
                      <div className="text-sm">of {event.max_attendees} total</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <User className="h-5 w-5 mr-3 text-purple-500" />
                    <div>
                      <div className="font-medium">Organizer</div>
                      <div className="text-sm">{event.organizer?.full_name}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:text-right">
                <div className="text-3xl font-bold text-lesotho-blue mb-2">
                  M{event.ticket_price}
                  <span className="text-sm font-normal text-gray-500"> per ticket</span>
                </div>
                <button
                  onClick={shareEvent}
                  className="text-gray-500 hover:text-gray-700 flex items-center space-x-1 md:justify-end w-full md:w-auto"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {event.available_tickets > 0 ? (
                <button
                  onClick={() => setShowRegistration(true)}
                  className="btn-primary flex-1 py-3 text-lg"
                  disabled={event.status !== 'published'}
                >
                  {event.status === 'published' ? 'Register Now' : 'Event Not Available'}
                </button>
              ) : (
                <button
                  disabled
                  className="btn-primary flex-1 py-3 text-lg bg-gray-400 cursor-not-allowed"
                >
                  Sold Out
                </button>
              )}
              
              {event.organizer?.email && (
                <a
                  href={`mailto:${event.organizer.email}`}
                  className="btn-secondary py-3 px-6 text-lg text-center"
                >
                  Contact Organizer
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Event Description */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Event</h2>
          <div className="prose max-w-none text-gray-700">
            {event.description ? (
              <p className="whitespace-pre-line">{event.description}</p>
            ) : (
              <p className="text-gray-500 italic">No description provided for this event.</p>
            )}
          </div>
        </div>

        {/* Registration Modal */}
        {showRegistration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Register for {event.title}
              </h3>
              
              <form onSubmit={handleRegistration}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Tickets
                    </label>
                    <select
                      value={ticketQuantity}
                      onChange={(e) => setTicketQuantity(parseInt(e.target.value))}
                      className="input-field"
                      required
                    >
                      {[...Array(Math.min(event.available_tickets, 10))].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} ticket{i + 1 > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number for M-Pesa
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+266 1234 5678"
                        className="input-field pl-10"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      You'll receive an M-Pesa prompt on this number
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tickets: {ticketQuantity} × M{event.ticket_price}</span>
                      <span>M{event.ticket_price * ticketQuantity}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total Amount</span>
                      <span className="text-lesotho-blue">M{totalAmount}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowRegistration(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={registering}
                    className="flex-1 btn-primary py-2 px-4 disabled:opacity-50"
                  >
                    {registering ? 'Processing...' : 'Pay with M-Pesa'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;