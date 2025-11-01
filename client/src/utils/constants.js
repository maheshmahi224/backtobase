export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const EVENT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const EMAIL_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
  BOUNCED: 'bounced',
};

export const PARTICIPANT_SOURCE = {
  UPLOAD: 'upload',
  MANUAL: 'manual',
  ONSPOT: 'onspot',
};
