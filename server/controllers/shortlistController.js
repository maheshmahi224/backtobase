import Participant from '../models/Participant.js';
import Event from '../models/Event.js';

// @desc    Get shortlisted participants for an event
// @route   GET /api/shortlist/:eventId
// @access  Private
export const getShortlisted = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 50 } = req.query;

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

    const participants = await Participant.find({
      eventId,
      shortlisted: true,
    })
      .sort('-shortlistedAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Participant.countDocuments({
      eventId,
      shortlisted: true,
    });

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

// @desc    Add participants to shortlist
// @route   POST /api/shortlist/add
// @access  Private
export const addToShortlist = async (req, res, next) => {
  try {
    const { participantIds } = req.body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide participant IDs',
      });
    }

    const result = await Participant.updateMany(
      {
        _id: { $in: participantIds },
        shortlisted: false,
      },
      {
        shortlisted: true,
        shortlistedAt: new Date(),
      }
    );

    // Update event stats
    const participants = await Participant.find({ _id: { $in: participantIds } });
    const eventIds = [...new Set(participants.map(p => p.eventId.toString()))];
    
    for (const eventId of eventIds) {
      const event = await Event.findById(eventId);
      if (event) {
        await event.updateStats();
      }
    }

    res.status(200).json({
      status: 'success',
      message: `${result.modifiedCount} participants added to shortlist`,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove participants from shortlist
// @route   POST /api/shortlist/remove
// @access  Private
export const removeFromShortlist = async (req, res, next) => {
  try {
    const { participantIds } = req.body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide participant IDs',
      });
    }

    const result = await Participant.updateMany(
      {
        _id: { $in: participantIds },
        shortlisted: true,
      },
      {
        shortlisted: false,
      }
    );

    // Update event stats
    const participants = await Participant.find({ _id: { $in: participantIds } });
    const eventIds = [...new Set(participants.map(p => p.eventId.toString()))];
    
    for (const eventId of eventIds) {
      const event = await Event.findById(eventId);
      if (event) {
        await event.updateStats();
      }
    }

    res.status(200).json({
      status: 'success',
      message: `${result.modifiedCount} participants removed from shortlist`,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
