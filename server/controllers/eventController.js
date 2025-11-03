import Event from '../models/Event.js';
import Participant from '../models/Participant.js';

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req, res, next) => {
  try {
    const { eventName, description, date, time, venue, coverImage } = req.body;

    const event = await Event.create({
      eventName,
      description,
      date,
      time,
      venue,
      coverImage,
      createdBy: req.user.id,
    });

    res.status(201).json({
      status: 'success',
      message: 'Event created successfully',
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private
export const getEvents = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, sortBy = '-createdAt' } = req.query;

    const query = { createdBy: req.user.id };
    if (status) {
      query.status = status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortBy,
      populate: {
        path: 'createdBy',
        select: 'name email',
      },
    };

    const events = await Event.find(query)
      .populate(options.populate)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await Event.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        events,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
export const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate({
        path: 'participants',
        select: 'name email phone invited checkedIn shortlisted',
      });

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    // Check if user has access
    if (event.createdBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this event',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    // Check if user has access
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this event',
      });
    }

    const { eventName, description, date, time, venue, coverImage, status } = req.body;

    event.eventName = eventName || event.eventName;
    event.description = description || event.description;
    event.date = date || event.date;
    event.time = time || event.time;
    event.venue = venue || event.venue;
    event.coverImage = coverImage || event.coverImage;
    event.status = status || event.status;

    await event.save();

    res.status(200).json({
      status: 'success',
      message: 'Event updated successfully',
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    // Check if user has access
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this event',
      });
    }

    // Delete all participants associated with this event
    await Participant.deleteMany({ eventId: req.params.id });

    // Delete event
    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Event and associated participants deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event statistics
// @route   GET /api/events/:id/stats
// @access  Private
export const getEventStats = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    // Update stats
    await event.updateStats();

    // Get additional stats
    const totalParticipants = await Participant.countDocuments({ eventId: req.params.id });
    const pendingInvites = await Participant.countDocuments({ eventId: req.params.id, invited: false });
    const emailsFailed = await Participant.countDocuments({ eventId: req.params.id, emailStatus: 'failed' });

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          ...event.stats,
          totalParticipants,
          pendingInvites,
          emailsFailed,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload ICS file for event
// @route   POST /api/events/:id/upload-ics
// @access  Private
export const uploadICS = async (req, res, next) => {
  try {
    const { icsContent, fileName } = req.body;

    if (!icsContent) {
      return res.status(400).json({
        status: 'error',
        message: 'ICS file content is required',
      });
    }

    const event = await Event.findById(req.params.id);

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

    // Store ICS file content
    event.icsFile = icsContent;
    event.icsFileName = fileName || `${event.eventName}.ics`;
    await event.save();

    res.status(200).json({
      status: 'success',
      message: 'ICS file uploaded successfully',
      data: {
        fileName: event.icsFileName,
        downloadUrl: `${process.env.FRONTEND_URL}/api/events/${event._id}/download-ics`,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download ICS file for event
// @route   GET /api/events/:id/download-ics
// @access  Public
export const downloadICS = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    if (!event.icsFile) {
      return res.status(404).json({
        status: 'error',
        message: 'No ICS file available for this event',
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="${event.icsFileName}"`);
    
    // Send the ICS content
    res.send(event.icsFile);
  } catch (error) {
    next(error);
  }
};
