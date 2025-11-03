import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const participantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Participant name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Participant email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    trim: true,
  },
  // Store any additional custom fields from CSV
  customFields: {
    type: Map,
    of: String,
    default: {},
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  invited: {
    type: Boolean,
    default: false,
  },
  invitedAt: {
    type: Date,
  },
  checkedIn: {
    type: Boolean,
    default: false,
  },
  checkedInAt: {
    type: Date,
  },
  shortlisted: {
    type: Boolean,
    default: false,
  },
  shortlistedAt: {
    type: Date,
  },
  confirmationSent: {
    type: Boolean,
    default: false,
  },
  confirmationSentAt: {
    type: Date,
  },
  attended: {
    type: Boolean,
    default: false,
  },
  attendedAt: {
    type: Date,
  },
  token: {
    type: String,
    unique: true,
    default: () => uuidv4(),
  },
  emailStatus: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'bounced'],
    default: 'pending',
  },
  emailError: {
    type: String,
  },
  source: {
    type: String,
    enum: ['upload', 'manual', 'onspot'],
    default: 'upload',
  },
}, {
  timestamps: true,
});

// Compound index for unique participant per event
participantSchema.index({ email: 1, eventId: 1 }, { unique: true });
participantSchema.index({ eventId: 1, invited: 1 });
participantSchema.index({ eventId: 1, checkedIn: 1 });
participantSchema.index({ eventId: 1, shortlisted: 1 });
// Note: token field has unique:true in schema, which auto-creates index

// Mark as invited
participantSchema.methods.markAsInvited = async function() {
  this.invited = true;
  this.invitedAt = new Date();
  this.emailStatus = 'sent';
  await this.save();
};

// Mark as checked in
participantSchema.methods.markAsCheckedIn = async function() {
  this.checkedIn = true;
  this.checkedInAt = new Date();
  await this.save();
};

// Mark as shortlisted
participantSchema.methods.markAsShortlisted = async function() {
  this.shortlisted = true;
  this.shortlistedAt = new Date();
  await this.save();
};

// Send confirmation
participantSchema.methods.markConfirmationSent = async function() {
  this.confirmationSent = true;
  this.confirmationSentAt = new Date();
  await this.save();
};

// Mark as attended
participantSchema.methods.markAsAttended = async function() {
  this.attended = true;
  this.attendedAt = new Date();
  await this.save();
};

const Participant = mongoose.model('Participant', participantSchema);

export default Participant;
