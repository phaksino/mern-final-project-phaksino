import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Users, ArrowRight, Search, Filter } from 'lucide-react';

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      const response = await eventsAPI.getAll({ 
        limit: 6,
        page: 1 
      });
      setFeaturedEvents(response.data.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Music', icon: '🎵', count: '12 events', color: 'bg-purple-100 text-purple-800' },
    { name: 'Sports', icon: '⚽', count: '8 events', color: 'bg-green-100 text-green-800' },
    { name: 'Cultural', icon: '🎭', count: '15 events', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Business', icon: '💼', count: '6 events', color: 'bg-blue-100 text-blue-800' },
    { name: 'Educational', icon: '📚', count: '10 events', color: 'bg-red-100 text-red-800' },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-lesotho-blue via-lesotho-green to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing
              <span className="block text-lesotho-red">Events in Lesotho</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              From music festivals to cultural celebrations, find and register for unforgettable experiences across the Mountain Kingdom
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/events"
                className="bg-lesotho-red hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Search className="h-5 w-5" />
                <span>Explore Events</span>
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="border-2 border-white hover:bg-white hover:text-lesotho-blue text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200"
                >
                  Join Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find events that match your interests across different categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {categories.map((category, index) => (
              <div
                key={category.name}
                className="card p-6 text-center hover:scale-105 transition-transform duration-200 cursor-pointer"
              >
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Events
              </h2>
              <p className="text-lg text-gray-600">
                Don't miss these upcoming events in Lesotho
              </p>
            </div>
            <Link
              to="/events"
              className="btn-primary flex items-center space-x-2"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="card p-6 animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <div key={event.id} className="card overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-lesotho-blue to-lesotho-green flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-white" />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        event.category === 'music' ? 'bg-purple-100 text-purple-800' :
                        event.category === 'sports' ? 'bg-green-100 text-green-800' :
                        event.category === 'cultural' ? 'bg-yellow-100 text-yellow-800' :
                        event.category === 'business' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                      </span>
                      <span className="text-lg font-bold text-lesotho-blue">
                        M{event.ticket_price}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(event.event_date)} at {event.event_time}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.venue}, {event.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-2" />
                        {event.available_tickets} tickets remaining
                      </div>
                    </div>
                    
                    <Link
                      to={`/events/${event.id}`}
                      className="btn-primary w-full text-center block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && featuredEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">Check back later for upcoming events</p>
              {isAuthenticated && (
                <Link to="/create-event" className="btn-primary">
                  Create First Event
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-lesotho-blue text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Create Your Event?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of organizers who use Lesotho Events Calendar to reach their audience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create-event"
              className="bg-lesotho-green hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
            >
              Start Creating Events
            </Link>
            <Link
              to="/events"
              className="border-2 border-white hover:bg-white hover:text-lesotho-blue text-white font-semibold py-3 px-8 rounded-lg text-lg transition-all duration-200"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;