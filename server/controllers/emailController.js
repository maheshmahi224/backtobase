import Event from '../models/Event.js';
import Participant from '../models/Participant.js';
import { sendBulkEmails, replacePlaceholders, replacePlaceholdersWithQR } from '../services/emailService.js';

// @desc    Send invitation emails
// @route   POST /api/email/send-invitations
// @access  Private
export const sendInvitations = async (req, res, next) => {
  try {
    const { eventId, participantIds, subject, htmlContent, batchSize = 100 } = req.body;

    // Validate inputs
    if (!eventId || !subject || !htmlContent) {
      return res.status(400).json({
        status: 'error',
        message: 'Event ID, subject, and content are required',
      });
    }

    // Get event
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

    // Get participants
    let query = { eventId, invited: false };
    if (participantIds && participantIds.length > 0) {
      query._id = { $in: participantIds };
      delete query.invited;
    }

    const participants = await Participant.find(query);

    if (participants.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No participants found to send invitations',
      });
    }

    // Prepare email data with QR code support (FAST - no async needed!)
    const emailData = participants.map((participant) => {
      const placeholderData = {
        name: participant.name,
        eventName: event.eventName,
        venue: event.venue,
        date: event.date,
        time: event.time,
        checkinLink: `${process.env.FRONTEND_URL}/checkin/${participant.token}`,
        calendarLink: event.icsFile 
          ? `${process.env.FRONTEND_URL.replace('/api', '')}/api/events/${event._id}/download-ics`
          : generateGoogleCalendarLink(event),
      };
      
      const emailOptions = {
        to: participant.email,
        subject: replacePlaceholders(subject, placeholderData),
        html: replacePlaceholdersWithQR(htmlContent, placeholderData, participant),
        participantId: participant._id,
      };

      // Add ICS file as attachment if available
      if (event.icsFile) {
        emailOptions.attachments = [{
          filename: event.icsFileName || `${event.eventName}.ics`,
          content: event.icsFile,
          contentType: 'text/calendar',
        }];
      }

      return emailOptions;
    });

    // Process emails and wait for results
    const results = await sendBulkEmails(emailData, batchSize);
    
    console.log(`✅ Sent ${results.successful.length} emails successfully`);
    
    // Update participants who received emails
    if (results.successful.length > 0) {
      await Participant.updateMany(
        { _id: { $in: results.successful } },
        {
          invited: true,
          invitedAt: new Date(),
          emailStatus: 'sent',
        }
      );
    }

    // Update failed participants
    if (results.failed.length > 0) {
      for (const failure of results.failed) {
        await Participant.findByIdAndUpdate(failure.participantId, {
          emailStatus: 'failed',
          emailError: failure.error,
        });
      }
    }

    // Update event stats
    await event.updateStats();

    // Return detailed results
    res.status(200).json({
      status: 'success',
      message: `Email sending complete: ${results.successful.length} sent, ${results.failed.length} failed`,
      data: {
        totalRecipients: participants.length,
        successCount: results.successful.length,
        failedCount: results.failed.length,
        errors: results.failed,
      },
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Send confirmation emails to shortlisted participants
// @route   POST /api/email/send-confirmations
// @access  Private
export const sendConfirmations = async (req, res, next) => {
  try {
    const { eventId, participantIds, subject, htmlContent, batchSize = 100 } = req.body;

    // Validate inputs
    if (!eventId || !subject || !htmlContent) {
      return res.status(400).json({
        status: 'error',
        message: 'Event ID, subject, and content are required',
      });
    }

    // Get event
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

    // Get shortlisted participants
    let query = { eventId, shortlisted: true };
    if (participantIds && participantIds.length > 0) {
      query._id = { $in: participantIds };
    }

    const participants = await Participant.find(query);

    if (participants.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No shortlisted participants found',
      });
    }

    // Prepare email data with QR code support (FAST - no async needed!)
    const emailData = participants.map((participant) => {
      const placeholderData = {
        name: participant.name,
        eventName: event.eventName,
        venue: event.venue,
        date: event.date,
        time: event.time,
        calendarLink: event.icsFile 
          ? `${process.env.FRONTEND_URL.replace('/api', '')}/api/events/${event._id}/download-ics`
          : '',
      };
      
      const emailOptions = {
        to: participant.email,
        subject: replacePlaceholders(subject, placeholderData),
        html: replacePlaceholdersWithQR(htmlContent, placeholderData, participant),
        participantId: participant._id,
      };

      // Add ICS file as attachment if available
      if (event.icsFile) {
        emailOptions.attachments = [{
          filename: event.icsFileName || `${event.eventName}.ics`,
          content: event.icsFile,
          contentType: 'text/calendar',
        }];
      }

      return emailOptions;
    });

    // Auto-shortlist participants before sending confirmations
    if (participantIds && participantIds.length > 0) {
      await Participant.updateMany(
        { _id: { $in: participantIds }, shortlisted: false },
        {
          shortlisted: true,
          shortlistedAt: new Date(),
        }
      );
    }

    // Send emails and wait for results
    const results = await sendBulkEmails(emailData, batchSize);
    
    console.log(`✅ Sent ${results.successful.length} confirmation emails`);
    
    // Update participants who received confirmation emails
    if (results.successful.length > 0) {
      await Participant.updateMany(
        { _id: { $in: results.successful } },
        {
          confirmationSent: true,
          confirmationSentAt: new Date(),
          shortlisted: true,
          shortlistedAt: new Date(),
        }
      );
    }

    // Update failed participants
    if (results.failed.length > 0) {
      for (const failure of results.failed) {
        await Participant.findByIdAndUpdate(failure.participantId, {
          emailStatus: 'failed',
          emailError: failure.error,
        });
      }
    }

    // Update event stats
    await event.updateStats();

    res.status(200).json({
      status: 'success',
      message: `Confirmation emails sent: ${results.successful.length} sent, ${results.failed.length} failed`,
      data: {
        totalRecipients: participants.length,
        successCount: results.successful.length,
        failedCount: results.failed.length,
        shortlistedCount: results.successful.length,
        errors: results.failed,
      },
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Test email sending
// @route   POST /api/email/test
// @access  Private
export const testEmail = async (req, res, next) => {
  try {
    const { to, subject, htmlContent } = req.body;

    if (!to || !subject || !htmlContent) {
      return res.status(400).json({
        status: 'error',
        message: 'Recipient, subject, and content are required',
      });
    }

    const result = await sendBulkEmails([{
      to,
      subject,
      html: htmlContent,
    }], 1);

    res.status(200).json({
      status: 'success',
      message: 'Test email sent successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to generate Google Calendar link
function generateGoogleCalendarLink(event) {
  const startDate = new Date(event.date);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.eventName,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: event.description,
    location: event.venue,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
