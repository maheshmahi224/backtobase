import Participant from '../models/Participant.js';
import Event from '../models/Event.js';

// @desc    Verify check-in token and get participant info
// @route   GET /api/checkin/:token
// @access  Public
export const verifyCheckin = async (req, res, next) => {
  try {
    const { token } = req.params;

    const participant = await Participant.findOne({ token })
      .populate('eventId', 'eventName date time venue description coverImage');

    if (!participant) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid check-in link',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        participant: {
          id: participant._id,
          name: participant.name,
          email: participant.email,
          checkedIn: participant.checkedIn,
          checkedInAt: participant.checkedInAt,
        },
        event: participant.eventId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark participant as checked in
// @route   POST /api/checkin/:token
// @access  Public
export const checkIn = async (req, res, next) => {
  try {
    const { token } = req.params;

    const participant = await Participant.findOne({ token })
      .populate('eventId', 'eventName');

    if (!participant) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid check-in link',
      });
    }

    // Check if already checked in
    if (participant.checkedIn) {
      return res.status(200).json({
        status: 'success',
        message: 'Already checked in',
        data: {
          participant: {
            name: participant.name,
            checkedInAt: participant.checkedInAt,
          },
          event: participant.eventId,
        },
      });
    }

    // Mark as checked in
    await participant.markAsCheckedIn();

    // Update event stats
    const event = await Event.findById(participant.eventId);
    if (event) {
      await event.updateStats();
    }

    res.status(200).json({
      status: 'success',
      message: 'Check-in successful',
      data: {
        participant: {
          name: participant.name,
          checkedInAt: participant.checkedInAt,
        },
        event: participant.eventId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    On-spot registration (manual check-in)
// @route   POST /api/checkin/manual
// @access  Public
export const manualCheckin = async (req, res, next) => {
  try {
    const { name, email, phone, eventId } = req.body;

    // Validate inputs
    if (!name || !email || !eventId) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and event ID are required',
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    // Check if participant already exists
    let participant = await Participant.findOne({ email, eventId });

    if (participant) {
      // If exists but not checked in, mark as checked in
      if (!participant.checkedIn) {
        await participant.markAsCheckedIn();
      }

      return res.status(200).json({
        status: 'success',
        message: participant.checkedIn ? 'Already checked in' : 'Check-in successful',
        data: {
          participant: {
            name: participant.name,
            checkedInAt: participant.checkedInAt,
          },
          event: {
            eventName: event.eventName,
          },
        },
      });
    }

    // Create new participant with on-spot source
    participant = await Participant.create({
      name,
      email,
      phone: phone || '',
      eventId,
      source: 'onspot',
      checkedIn: true,
      checkedInAt: new Date(),
    });

    // Update event
    event.participants.push(participant._id);
    await event.save();
    await event.updateStats();

    res.status(201).json({
      status: 'success',
      message: 'Registration and check-in successful',
      data: {
        participant: {
          name: participant.name,
          checkedInAt: participant.checkedInAt,
        },
        event: {
          eventName: event.eventName,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get check-in statistics
// @route   GET /api/checkin/stats/:eventId
// @access  Private
export const getCheckinStats = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    const totalParticipants = await Participant.countDocuments({ eventId });
    const checkedInCount = await Participant.countDocuments({ eventId, checkedIn: true });
    const onspotCount = await Participant.countDocuments({ eventId, source: 'onspot' });
    const invitedCount = await Participant.countDocuments({ eventId, invited: true });

    // Get hourly check-in data (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCheckins = await Participant.find({
      eventId,
      checkedIn: true,
      checkedInAt: { $gte: twentyFourHoursAgo },
    }).sort('checkedInAt');

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalParticipants,
          checkedInCount,
          onspotCount,
          invitedCount,
          checkInRate: totalParticipants > 0 ? (checkedInCount / totalParticipants * 100).toFixed(2) : 0,
        },
        recentCheckins: recentCheckins.map(p => ({
          name: p.name,
          email: p.email,
          checkedInAt: p.checkedInAt,
          source: p.source,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
