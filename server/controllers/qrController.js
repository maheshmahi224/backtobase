import Participant from '../models/Participant.js';
import Event from '../models/Event.js';
import { verifyQRData, generateParticipantQR } from '../services/qrService.js';

// @desc    Verify QR code data
// @route   POST /api/qr/verify
// @access  Public
export const verifyQR = async (req, res, next) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        status: 'error',
        message: 'QR data is required',
      });
    }

    // Decode and verify QR data (returns token)
    const token = verifyQRData(qrData);

    // Find participant by token only - FAST!
    const participant = await Participant.findOne({
      token: token,
    }).populate('eventId', 'eventName date time venue description coverImage');

    if (!participant) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid QR code or participant not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        participant: {
          id: participant._id,
          name: participant.name,
          email: participant.email,
          phone: participant.phone,
          shortlisted: participant.shortlisted,
          attended: participant.attended,
          attendedAt: participant.attendedAt,
        },
        event: participant.eventId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark participant as attended via QR scan
// @route   POST /api/qr/scan
// @access  Public
export const scanQR = async (req, res, next) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        status: 'error',
        message: 'QR data is required',
      });
    }

    console.log('Received QR Data:', qrData);
    
    // Decode and verify QR data (returns token)
    const token = verifyQRData(qrData);
    
    console.log('Extracted Token:', token);

    // Find participant by token only - FAST!
    const participant = await Participant.findOne({
      token: token,
    }).populate('eventId', 'eventName');

    if (!participant) {
      console.log('No participant found with token:', token);
      return res.status(404).json({
        status: 'error',
        message: `Participant not found with this QR code. Token: ${token.substring(0, 10)}...`,
      });
    }

    // Check if already attended
    if (participant.attended) {
      return res.status(200).json({
        status: 'success',
        message: 'Already marked as attended',
        data: {
          participant: {
            name: participant.name,
            email: participant.email,
            attendedAt: participant.attendedAt,
          },
          event: participant.eventId,
        },
      });
    }

    // Mark as attended (this automatically moves them from shortlisted to attended)
    await participant.markAsAttended();

    // Update event stats
    const event = await Event.findById(participant.eventId);
    if (event) {
      await event.updateStats();
    }

    res.status(200).json({
      status: 'success',
      message: 'Participant marked as attended successfully',
      data: {
        participant: {
          name: participant.name,
          email: participant.email,
          phone: participant.phone,
          attendedAt: participant.attendedAt,
        },
        event: participant.eventId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate QR code for participant
// @route   GET /api/qr/generate/:participantId
// @access  Private
export const generateQR = async (req, res, next) => {
  try {
    const { participantId } = req.params;

    const participant = await Participant.findById(participantId);

    if (!participant) {
      return res.status(404).json({
        status: 'error',
        message: 'Participant not found',
      });
    }

    // Generate QR code (INSTANT!)
    const qrCode = generateParticipantQR(participant);

    res.status(200).json({
      status: 'success',
      data: {
        qrCode,
        participant: {
          name: participant.name,
          email: participant.email,
          phone: participant.phone,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attended participants for an event
// @route   GET /api/qr/attended/:eventId
// @access  Private
export const getAttendedParticipants = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 50, search = '' } = req.query;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    // Check authorization
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    // Build query
    const query = {
      eventId,
      attended: true,
    };

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const participants = await Participant.find(query)
      .sort('-attendedAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Participant.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        participants,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get QR scan statistics
// @route   GET /api/qr/stats/:eventId
// @access  Private
export const getQRStats = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    // Check authorization
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    const totalShortlisted = await Participant.countDocuments({ 
      eventId, 
      shortlisted: true 
    });
    
    const totalAttended = await Participant.countDocuments({ 
      eventId, 
      attended: true 
    });
    
    const totalParticipants = await Participant.countDocuments({ eventId });

    // Get recent scans (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentScans = await Participant.find({
      eventId,
      attended: true,
      attendedAt: { $gte: twentyFourHoursAgo },
    }).sort('-attendedAt');

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalParticipants,
          totalShortlisted,
          totalAttended,
          attendanceRate: totalShortlisted > 0 
            ? ((totalAttended / totalShortlisted) * 100).toFixed(2) 
            : 0,
        },
        recentScans: recentScans.map(p => ({
          name: p.name,
          email: p.email,
          phone: p.phone,
          attendedAt: p.attendedAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
