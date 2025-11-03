import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { qrAPI } from '../utils/api';
import Button from './ui/Button';
import { useToast } from '../context/ToastContext';
import { Camera, X, CheckCircle } from 'lucide-react';

const SimpleQRScanner = ({ eventId, onScanSuccess }) => {
  const toast = useToast();
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
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

      await html5QrCode.start(
        { facingMode: 'user' }, // Use 'user' for front camera on laptops
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.777778, // 16:9 aspect ratio
        },
        handleQRCodeScanned,
        () => {} // Ignore errors when no QR in view
      );

      setScanning(true);
      
      // Force video element to be visible
      setTimeout(() => {
        const video = document.querySelector('#qr-reader video');
        if (video) {
          video.style.display = 'block';
          video.style.width = '100%';
          video.style.height = 'auto';
          video.style.borderRadius = '8px';
        }
      }, 100);
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast.error('Unable to access camera. Please check permissions.');
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

  const handleQRCodeScanned = async (decodedText) => {
    // Prevent duplicate scans
    if (lastScanned === decodedText || processing) return;
    setLastScanned(decodedText);
    setProcessing(true);

    console.log('QR Code Scanned:', decodedText);

    try {
      // Mark as attended
      const scanResponse = await qrAPI.scan(decodedText);
      
      // STOP CAMERA IMMEDIATELY after successful scan
      await stopScanning();
      
      toast.success(`✓ ${scanResponse.data.data.participant.name} marked as attended!`);

      if (onScanSuccess) {
        onScanSuccess(scanResponse.data.data);
      }

      // Reset for next scan
      setLastScanned(null);
      setProcessing(false);

    } catch (error) {
      console.error('Error processing QR code:', error);
      
      // Stop camera on error too
      await stopScanning();
      
      toast.error(error.response?.data?.message || 'Invalid QR code');

      // Reset for next attempt
      setLastScanned(null);
      setProcessing(false);
    }
  };

  return (
    <>
      {/* CSS Override for html5-qrcode */}
      <style>{`
        #qr-reader {
          position: relative;
        }
        #qr-reader video {
          display: block !important;
          width: 100% !important;
          height: auto !important;
          border-radius: 8px;
          background: #000;
        }
        #qr-reader canvas {
          display: none !important;
        }
        #qr-reader__scan_region {
          min-height: 400px !important;
        }
        #qr-reader__dashboard_section_csr {
          display: none !important;
        }
      `}</style>
      
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <Camera className="h-6 w-6 text-purple-600" />
            Live Camera Scanner
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {processing ? 'Processing QR code...' : scanning ? '⚡ Point at QR code - Auto-scans & stops camera' : 'Click to activate camera'}
          </p>
        </div>
        
        {!scanning ? (
          <Button onClick={startScanning} size="lg" className="px-8 py-6 text-lg" disabled={processing}>
            <Camera className="h-6 w-6 mr-3" />
            {processing ? 'Processing...' : 'Start Camera'}
          </Button>
        ) : (
          <Button variant="destructive" onClick={stopScanning} size="lg" className="px-8 py-6 text-lg" disabled={processing}>
            <X className="h-6 w-6 mr-3" />
            {processing ? 'Processing...' : 'Stop Camera'}
          </Button>
        )}
      </div>

      {/* Live Camera Preview */}
      <div className="relative">
        {scanning && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2 animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              LIVE CAMERA
            </div>
          </div>
        )}
        
        <div
          id="qr-reader"
          className={`${
            scanning ? 'block' : 'hidden'
          } rounded-xl overflow-hidden mx-auto border-4 border-purple-500 shadow-2xl`}
          style={{ 
            maxWidth: '600px',
            minHeight: scanning ? '400px' : '0',
            width: '100%'
          }}
        ></div>

        {!scanning && (
          <div className="flex flex-col items-center justify-center p-16 border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-6 rounded-full mb-6">
              <Camera className="h-20 w-20 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-gray-900 dark:text-gray-100 text-center text-xl font-bold mb-2">
              Camera Preview Inactive
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              Click the button above to activate your device camera.
              The live preview will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Processing Indicator */}
      {processing && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 animate-pulse">
          <div className="flex items-center gap-3 justify-center">
            <div className="w-6 h-6 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-semibold text-yellow-900 dark:text-yellow-100 text-lg">
              Processing QR Code...
            </p>
          </div>
        </div>
      )}

      {/* Scanning Instructions */}
      {scanning && !processing && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100 text-lg">Camera Active</h4>
                <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                  Your camera is live. Position any QR code within the frame for automatic scanning.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Camera className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-lg">Auto-Detect</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  QR codes are detected automatically. No need to click or capture - just point!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      {!scanning && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-full">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                <strong>Tip:</strong> Make sure to allow camera permissions when prompted by your browser.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default SimpleQRScanner;
