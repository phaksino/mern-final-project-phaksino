import React from 'react';
import { QRCodeSVG } from 'qrcode.react'; // Changed from default import
import { Calendar, MapPin, Users, Ticket } from 'lucide-react';

const DigitalTicket = ({ registration, event, user }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-lesotho-blue max-w-md mx-auto">
      {/* Ticket Header */}
      <div className="bg-gradient-to-r from-lesotho-blue to-lesotho-green text-white p-6 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">E-Ticket</h1>
            <p className="text-blue-100">Lesotho Events Calendar</p>
          </div>
          <Ticket className="h-8 w-8" />
        </div>
      </div>

      {/* Event Details */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h2>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-3 text-lesotho-blue flex-shrink-0" />
            <div>
              <div className="font-medium">{formatDate(event.event_date)}</div>
              <div className="text-sm">{formatTime(event.event_time)}</div>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-3 text-lesotho-green flex-shrink-0" />
            <div>
              <div className="font-medium">{event.venue}</div>
              <div className="text-sm">{event.location}</div>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Users className="h-5 w-5 mr-3 text-lesotho-red flex-shrink-0" />
            <div>
              <div className="font-medium">{registration.ticket_quantity} Ticket(s)</div>
              <div className="text-sm">Ticket #{registration.ticket_number}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendee Info */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Attendee Information</h3>
        <div className="text-sm text-gray-600">
          <div className="flex justify-between mb-1">
            <span>Name:</span>
            <span className="font-medium">{user.full_name}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Email:</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span>Phone:</span>
            <span className="font-medium">{user.phone_number}</span>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="p-6 text-center">
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Scan for verification</p>
          <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
            <QRCodeSVG 
              value={registration.qr_code_data || registration.id}
              size={150}
              level="M"
              includeMargin={true}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Valid for entry on {formatDate(event.event_date)}
        </p>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-4 rounded-b-xl border-t border-gray-200">
        <div className="text-center text-sm text-gray-600">
          <p>Present this ticket at the venue for entry</p>
          <p className="text-xs mt-1">Powered by Lesotho Events Calendar</p>
        </div>
      </div>
    </div>
  );
};

export default DigitalTicket;