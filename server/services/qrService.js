/**
 * Generate QR code using fast external API
 * @param {string} data - Data to encode in QR code (token string)
 * @returns {string} QR code image URL
 */
export const generateQRCode = (data) => {
  // Data is already a simple string (token), no need to JSON.stringify
  // Use QuickChart.io - Fast, reliable, free QR code API
  // Generates QR code instantly via URL - no server-side generation needed!
  const encodedData = encodeURIComponent(data);
  const qrCodeURL = `https://quickchart.io/qr?text=${encodedData}&size=300&margin=1&ecLevel=H`;
  
  return qrCodeURL;
};

/**
 * Generate QR code for participant
 * @param {Object} participant - Participant object
 * @returns {string} QR code image URL
 */
export const generateParticipantQR = (participant) => {
  // SIMPLE & FAST - Just the token!
  // Token is unique and sufficient to identify participant
  const qrData = participant.token;
  
  return generateQRCode(qrData);
};

/**
 * Verify and decode QR code data
 * @param {string} qrData - Token string from QR code
 * @returns {string} Token
 */
export const verifyQRData = (qrData) => {
  // Simple token verification
  if (!qrData || typeof qrData !== 'string' || qrData.length < 10) {
    throw new Error('Invalid QR code format');
  }
  
  return qrData; // Return the token directly
};
