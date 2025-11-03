import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { qrAPI } from '../utils/api';
import Button from './ui/Button';
import { useToast } from '../context/ToastContext';
import { QrCode, Camera, X, CheckCircle, XCircle, User, Mail, Phone } from 'lucide-react';

const QRScanner = ({ eventId, onScanSuccess }) => {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        handleQRCodeScanned,
        onScanError
      );

      setScanning(true);
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
    setScanning(false);
  };

  const handleQRCodeScanned = async (decodedText, decodedResult) => {
    console.log('QR Code scanned:', decodedText);
    
    // Stop scanning temporarily
    await stopScanning();
    setProcessing(true);

    try {
      // Verify the QR code data
      const verifyResponse = await qrAPI.verify(decodedText);
      setScannedData(verifyResponse.data.data);

      // Automatically mark as attended
      const scanResponse = await qrAPI.scan(decodedText);
      
      toast({
        title: 'Success!',
        description: `${scanResponse.data.data.participant.name} marked as attended`,
      });

      if (onScanSuccess) {
        onScanSuccess(scanResponse.data.data);
      }

      // Reset after 3 seconds
      setTimeout(() => {
        setScannedData(null);
        setProcessing(false);
      }, 3000);

    } catch (error) {
      console.error('Error processing QR code:', error);
      
      let errorMessage = 'Invalid QR code';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: 'Scan Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      setScannedData(null);
      setProcessing(false);
      
      // Resume scanning after error
      setTimeout(() => {
        startScanning();
      }, 2000);
    }
  };

  const onScanError = (errorMessage) => {
    // Ignore scan errors (normal when no QR code is in view)
  };

  return (
    <div className="space-y-4">
      {/* Scanner Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">QR Code Scanner</h3>
        </div>
        <div className="flex gap-2">
          {!scanning ? (
            <Button onClick={startScanning} disabled={processing}>
              <Camera className="h-4 w-4 mr-2" />
              Start Scanning
            </Button>
          ) : (
            <Button variant="destructive" onClick={stopScanning}>
              <X className="h-4 w-4 mr-2" />
              Stop Scanning
            </Button>
          )}
        </div>
      </div>

      {/* Scanner Area */}
      <div className="relative">
        <div
          id="qr-reader"
          className={`rounded-lg overflow-hidden ${scanning ? 'block' : 'hidden'}`}
          style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}
        ></div>

        {!scanning && !scannedData && (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-gray-50">
            <QrCode className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center">
              Click "Start Scanning" to begin scanning QR codes
            </p>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Works on all devices with a camera
            </p>
          </div>
        )}

        {processing && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}
      </div>

      {/* Scanned Data Display */}
      {scannedData && !processing && (
        <div className="border rounded-lg p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h4 className="font-semibold text-green-900">Attendance Recorded</h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{scannedData.participant.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{scannedData.participant.email}</p>
              </div>
            </div>

            {scannedData.participant.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{scannedData.participant.phone}</p>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-green-200">
              <p className="text-sm text-gray-600">Event</p>
              <p className="font-medium">{scannedData.event.eventName}</p>
            </div>

            {scannedData.participant.attended && (
              <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
                Note: This participant was already marked as attended
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">How to use:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Click "Start Scanning" to activate your camera</li>
          <li>Point your camera at a participant's QR code</li>
          <li>The system will automatically verify and mark attendance</li>
          <li>Works on desktop, tablet, and mobile devices</li>
        </ul>
      </div>
    </div>
  );
};

export default QRScanner;
