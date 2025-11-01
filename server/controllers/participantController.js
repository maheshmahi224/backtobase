import Participant from '../models/Participant.js';
import Event from '../models/Event.js';
import Papa from 'papaparse';

// @desc    Upload participants from CSV
// @route   POST /api/participants/upload/:eventId
// @access  Private
export const uploadParticipants = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { csvData } = req.body;

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
        message: 'Not authorized to upload participants for this event',
      });
    }

    // Parse CSV data
    const results = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });

    if (results.errors.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'CSV parsing error',
        errors: results.errors,
      });
    }

    const participants = [];
    const errors = [];
    const duplicates = [];

    for (let i = 0; i < results.data.length; i++) {
      const row = results.data[i];
      
      // Validate required fields
      if (!row.name || !row.email) {
        errors.push({
          row: i + 1,
          message: 'Name and email are required',
          data: row,
        });
        continue;
      }

      // Check if participant already exists for this event
      const existing = await Participant.findOne({
        email: row.email,
        eventId,
      });

      if (existing) {
        duplicates.push({
          row: i + 1,
          email: row.email,
          message: 'Participant already exists for this event',
        });
        continue;
      }

      // Extract standard fields
      const { name, email, phone, ...customFields } = row;

      // Create participant object with all fields
      const participantData = {
        name,
        email,
        phone: phone || '',
        eventId,
        source: 'upload',
      };

      // Add custom fields if any exist
      if (Object.keys(customFields).length > 0) {
        participantData.customFields = customFields;
      }

      participants.push(participantData);
    }

    // Bulk insert participants
    let insertedParticipants = [];
    if (participants.length > 0) {
      insertedParticipants = await Participant.insertMany(participants);
      
      // Update event participants array
      event.participants.push(...insertedParticipants.map(p => p._id));
      await event.save();
      await event.updateStats();
    }

    res.status(200).json({
      status: 'success',
      message: `${insertedParticipants.length} participants uploaded successfully`,
      data: {
        inserted: insertedParticipants.length,
        duplicates: duplicates.length,
        errors: errors.length,
        duplicatesList: duplicates,
        errorsList: errors,
        participants: insertedParticipants,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all participants for an event
// @route   GET /api/participants/event/:eventId
// @access  Private
export const getParticipantsByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { invited, checkedIn, shortlisted, page = 1, limit = 50 } = req.query;

    // Check if event exists and user has access
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    // Build query
    const query = { eventId };
    if (invited !== undefined) query.invited = invited === 'true';
    if (checkedIn !== undefined) query.checkedIn = checkedIn === 'true';
    if (shortlisted !== undefined) query.shortlisted = shortlisted === 'true';

    const participants = await Participant.find(query)
      .sort('-createdAt')
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

// @desc    Get single participant
// @route   GET /api/participants/:id
// @access  Private
export const getParticipant = async (req, res, next) => {
  try {
    const participant = await Participant.findById(req.params.id)
      .populate('eventId', 'eventName date venue');

    if (!participant) {
      return res.status(404).json({
        status: 'error',
        message: 'Participant not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { participant },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update participant
// @route   PUT /api/participants/:id
// @access  Private
export const updateParticipant = async (req, res, next) => {
  try {
    const { name, email, phone, shortlisted } = req.body;

    const participant = await Participant.findById(req.params.id);

    if (!participant) {
      return res.status(404).json({
        status: 'error',
        message: 'Participant not found',
      });
    }

    participant.name = name || participant.name;
    participant.email = email || participant.email;
    participant.phone = phone || participant.phone;
    
    if (shortlisted !== undefined && shortlisted !== participant.shortlisted) {
      participant.shortlisted = shortlisted;
      if (shortlisted) {
        participant.shortlistedAt = new Date();
      }
    }

    await participant.save();

    // Update event stats
    const event = await Event.findById(participant.eventId);
    if (event) {
      await event.updateStats();
    }

    res.status(200).json({
      status: 'success',
      message: 'Participant updated successfully',
      data: { participant },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete participant
// @route   DELETE /api/participants/:id
// @access  Private
export const deleteParticipant = async (req, res, next) => {
  try {
    const participant = await Participant.findById(req.params.id);

    if (!participant) {
      return res.status(404).json({
        status: 'error',
        message: 'Participant not found',
      });
    }

    // Remove from event participants array
    await Event.findByIdAndUpdate(
      participant.eventId,
      { $pull: { participants: participant._id } }
    );

    await Participant.findByIdAndDelete(req.params.id);

    // Update event stats
    const event = await Event.findById(participant.eventId);
    if (event) {
      await event.updateStats();
    }

    res.status(200).json({
      status: 'success',
      message: 'Participant deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update participants (shortlist/unshortlist)
// @route   POST /api/participants/bulk-update
// @access  Private
export const bulkUpdateParticipants = async (req, res, next) => {
  try {
    const { participantIds, action, value } = req.body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide participant IDs',
      });
    }

    const updateData = {};
    
    if (action === 'shortlist') {
      updateData.shortlisted = value;
      if (value) {
        updateData.shortlistedAt = new Date();
      }
    }

    const result = await Participant.updateMany(
      { _id: { $in: participantIds } },
      updateData
    );

    // Update stats for affected events
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
      message: `${result.modifiedCount} participants updated successfully`,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add manual participant
// @route   POST /api/participants/manual
// @access  Private
export const addManualParticipant = async (req, res, next) => {
  try {
    const { name, email, phone, eventId } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    // Check if participant already exists
    const existing = await Participant.findOne({ email, eventId });
    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: 'Participant already exists for this event',
      });
    }

    const participant = await Participant.create({
      name,
      email,
      phone,
      eventId,
      source: 'manual',
    });

    // Update event
    event.participants.push(participant._id);
    await event.save();
    await event.updateStats();

    res.status(201).json({
      status: 'success',
      message: 'Participant added successfully',
      data: { participant },
    });
  } catch (error) {
    next(error);
  }
};
