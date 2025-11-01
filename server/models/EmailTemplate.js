import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['invitation', 'confirmation', 'reminder', 'custom'],
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  htmlContent: {
    type: String,
    required: true,
  },
  textContent: {
    type: String,
  },
  placeholders: [{
    type: String,
  }],
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

emailTemplateSchema.index({ eventId: 1, type: 1 });
emailTemplateSchema.index({ createdBy: 1 });

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

export default EmailTemplate;
