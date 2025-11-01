import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required'],
  },
  coverImage: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'active',
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
  }],
  stats: {
    totalInvited: {
      type: Number,
      default: 0,
    },
    totalCheckedIn: {
      type: Number,
      default: 0,
    },
    totalShortlisted: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

// Index for faster queries
eventSchema.index({ createdBy: 1, date: -1 });
eventSchema.index({ status: 1 });

// Virtual for participant count
eventSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Update stats method
eventSchema.methods.updateStats = async function() {
  const Participant = mongoose.model('Participant');
  
  const invitedCount = await Participant.countDocuments({
    eventId: this._id,
    invited: true,
  });
  
  const checkedInCount = await Participant.countDocuments({
    eventId: this._id,
    checkedIn: true,
  });
  
  const shortlistedCount = await Participant.countDocuments({
    eventId: this._id,
    shortlisted: true,
  });
  
  this.stats.totalInvited = invitedCount;
  this.stats.totalCheckedIn = checkedInCount;
  this.stats.totalShortlisted = shortlistedCount;
  
  await this.save();
};

const Event = mongoose.model('Event', eventSchema);

export default Event;
