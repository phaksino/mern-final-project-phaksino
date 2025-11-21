import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Calendar, MapPin, DollarSign, Upload } from 'lucide-react';

const CreateEvent = () => {
  const { isOrganizer } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    venue: '',
    event_date: '',
    event_time: '',
    category: 'music',
    ticket_price: '',
    max_attendees: '',
    image_url: ''
  });

  const categories = [
    { value: 'music', label: 'Music' },
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'business', label: 'Business' },
    { value: 'educational', label: 'Educational' },
  ];

  const popularLocations = [
    'Maseru', 'Leribe', 'Berea', 'Mafeteng', 'Mohale\'s Hoek', 'Quthing'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isOrganizer) {
      toast.error('Only organizers can create events');
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        ...formData,
        ticket_price: parseFloat(formData.ticket_price) || 0,
        max_attendees: parseInt(formData.max_attendees),
        status: 'published'
      };

      const response = await eventsAPI.create(eventData);
      
      if (response.data.success) {
        toast.success('Event created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  if (!isOrganizer) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You need an organizer account to create events.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
            <p className="text-gray-600 mt-2">
              Fill in the details below to create your event
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field mt-1"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="input-field mt-1"
                    placeholder="Describe your event..."
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="input-field mt-1"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Date & Time</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event_date" className="block text-sm font-medium text-gray-700">
                    Event Date *
                  </label>
                  <div className="mt-1 relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="date"
                      id="event_date"
                      name="event_date"
                      required
                      value={formData.event_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="event_time" className="block text-sm font-medium text-gray-700">
                    Event Time *
                  </label>
                  <input
                    type="time"
                    id="event_time"
                    name="event_time"
                    required
                    value={formData.event_time}
                    onChange={handleChange}
                    className="input-field mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    City/Town *
                  </label>
                  <select
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="input-field mt-1"
                  >
                    <option value="">Select a location</option>
                    {popularLocations.map(location => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
                    Venue Name *
                  </label>
                  <div className="mt-1 relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      id="venue"
                      name="venue"
                      required
                      value={formData.venue}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Enter venue name"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ticket_price" className="block text-sm font-medium text-gray-700">
                    Ticket Price (M)
                  </label>
                  <div className="mt-1 relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      id="ticket_price"
                      name="ticket_price"
                      min="0"
                      step="0.01"
                      value={formData.ticket_price}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Set to 0 for free events</p>
                </div>

                <div>
                  <label htmlFor="max_attendees" className="block text-sm font-medium text-gray-700">
                    Maximum Attendees *
                  </label>
                  <input
                    type="number"
                    id="max_attendees"
                    name="max_attendees"
                    required
                    min="1"
                    value={formData.max_attendees}
                    onChange={handleChange}
                    className="input-field mt-1"
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            {/* Event Image */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Image</h3>
              
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <div className="mt-1 relative">
                  <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Provide a URL for your event image (optional)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-6 py-2 disabled:opacity-50"
              >
                {loading ? 'Creating Event...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;