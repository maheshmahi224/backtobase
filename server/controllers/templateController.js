import EmailTemplate from '../models/EmailTemplate.js';
import Event from '../models/Event.js';
import { getDefaultInvitationTemplate, getDefaultConfirmationTemplate } from '../services/emailService.js';

// @desc    Get all templates for an event
// @route   GET /api/templates/:eventId
// @access  Private
export const getEventTemplates = async (req, res, next) => {
  try {
    const { eventId } = req.params;

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

    const templates = await EmailTemplate.find({ eventId }).sort('-createdAt');

    res.status(200).json({
      status: 'success',
      data: {
        templates,
        count: templates.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get template by ID
// @route   GET /api/templates/single/:templateId
// @access  Private
export const getTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.params;

    const template = await EmailTemplate.findById(templateId);

    if (!template) {
      return res.status(404).json({
        status: 'error',
        message: 'Template not found',
      });
    }

    // Check authorization
    if (template.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    res.status(200).json({
      status: 'success',
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new template
// @route   POST /api/templates
// @access  Private
export const createTemplate = async (req, res, next) => {
  try {
    const { name, type, subject, htmlContent, textContent, eventId } = req.body;

    // Validate inputs
    if (!name || !type || !subject || !htmlContent) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, type, subject, and HTML content are required',
      });
    }

    // If eventId provided, check if event exists
    if (eventId) {
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
    }

    // Extract placeholders from HTML content
    const placeholderRegex = /{{(\w+)}}/g;
    const placeholders = [];
    let match;
    while ((match = placeholderRegex.exec(htmlContent)) !== null) {
      if (!placeholders.includes(match[1])) {
        placeholders.push(match[1]);
      }
    }

    const template = await EmailTemplate.create({
      name,
      type,
      subject,
      htmlContent,
      textContent,
      placeholders,
      eventId: eventId || null,
      createdBy: req.user.id,
    });

    res.status(201).json({
      status: 'success',
      message: 'Template created successfully',
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update template
// @route   PUT /api/templates/:templateId
// @access  Private
export const updateTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const { name, subject, htmlContent, textContent } = req.body;

    const template = await EmailTemplate.findById(templateId);

    if (!template) {
      return res.status(404).json({
        status: 'error',
        message: 'Template not found',
      });
    }

    // Check authorization
    if (template.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    // Extract placeholders from updated HTML content
    const placeholderRegex = /{{(\w+)}}/g;
    const placeholders = [];
    let match;
    const content = htmlContent || template.htmlContent;
    while ((match = placeholderRegex.exec(content)) !== null) {
      if (!placeholders.includes(match[1])) {
        placeholders.push(match[1]);
      }
    }

    // Update fields
    template.name = name || template.name;
    template.subject = subject || template.subject;
    template.htmlContent = htmlContent || template.htmlContent;
    template.textContent = textContent || template.textContent;
    template.placeholders = placeholders;

    await template.save();

    res.status(200).json({
      status: 'success',
      message: 'Template updated successfully',
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete template
// @route   DELETE /api/templates/:templateId
// @access  Private
export const deleteTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.params;

    const template = await EmailTemplate.findById(templateId);

    if (!template) {
      return res.status(404).json({
        status: 'error',
        message: 'Template not found',
      });
    }

    // Check authorization
    if (template.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized',
      });
    }

    await template.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Template deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get default templates
// @route   GET /api/templates/defaults/:eventId
// @access  Private
export const getDefaultTemplates = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Get event for placeholder values
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found',
      });
    }

    const invitationTemplate = getDefaultInvitationTemplate(event.eventName);
    const confirmationTemplate = getDefaultConfirmationTemplate();

    res.status(200).json({
      status: 'success',
      data: {
        invitation: invitationTemplate,
        confirmation: confirmationTemplate,
      },
    });
  } catch (error) {
    next(error);
  }
};
