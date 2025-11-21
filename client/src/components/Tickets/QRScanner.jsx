import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { usersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Camera, User, Calendar } from 'lucide-react';

const QRScanner = ({ eventId, onClose }) => {
  const [scanning, setScanning] = useState(true);
  const [scannedData, setScannedData] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const scanner = useRef(null);

  useEffect(() => {
    if (scanning) {
      startScanner();
    }

    return () => {
      if (scanner.current) {
        scanner.current.clear().catch(error => {
          console.error("Failed to clear scanner:", error);
        });
      }
    };
  }, [scanning]);

  const startScanner = () => {
    if (!scannerRef.current) return;

    scanner.current = new Html5QrcodeScanner(
      "qr-scanner",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: []
      },
      false
    );

    scanner.current.render(
      (decodedText) => {
        handleScan(decodedText);
      },
      (error) => {
        // Handle scan errors silently
        console.debug('QR Scan error:', error);
      }
    );
  };

  const handleScan = async (result) => {
    if (result && !scannedData) {
      setScannedData(result);
      setScanning(false);
      
      if (scanner.current) {
        scanner.current.clear().catch(error => {
          console.error("Failed to clear scanner:", error);
        });
      }
      
      await verifyTicket(result);
    }
  };

  const verifyTicket = async (qrData) => {
    setLoading(true);
    try {
      // In a real app, you'd have a dedicated verification endpoint
      const response = await usersAPI.getEventRegistrations();
      const registrations = response.data.data.registrations || [];
      
      const foundRegistration = registrations.find(reg => 
        reg.id === qrData || reg.qr_code_data === qrData
      );

      if (foundRegistration && foundRegistration.event_id === eventId) {
        setRegistration(foundRegistration);
        toast.success('Ticket verified successfully!');
      } else {
        toast.error('Invalid ticket for this event');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify ticket');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanning(true);
    setScannedData(null);
    setRegistration(null);
    
    if (scanner.current) {
      scanner.current.clear().catch(error => {
        console.error("Failed to clear scanner:", error);
      });
      scanner.current = null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Scan Ticket QR Code</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {scanning && !scannedData && (
          <div className="mb-4">
            <div 
              id="qr-scanner" 
              ref={scannerRef}
              className="border-2 border-lesotho-blue rounded-lg overflow-hidden"
            ></div>
            <p className="text-sm text-gray-600 text-center mt-2">
              Point camera at ticket QR code
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lesotho-blue mx-auto"></div>
            <p className="text-gray-600 mt-2">Verifying ticket...</p>
          </div>
        )}

        {registration && !loading && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-800 mb-3">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Ticket Verified</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-600" />
                <span>{registration.users?.full_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span>{registration.ticket_quantity} ticket(s)</span>
              </div>
              <div className="text-xs text-gray-500">
                Ticket #: {registration.ticket_number}
              </div>
            </div>
          </div>
        )}

        {scannedData && !registration && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <XCircle className="h-5 w-5" />
              <span className="font-semibold">Verification Failed</span>
            </div>
            <p className="text-sm text-red-700 mt-2">
              This ticket is not valid for this event or doesn't exist.
            </p>
          </div>
        )}

        <div className="flex space-x-3 mt-6">
          <button
            onClick={resetScanner}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
          >
            <Camera className="h-4 w-4" />
            <span>Scan Again</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;