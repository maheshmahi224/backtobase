import { body, validationResult } from 'express-validator';

// Validation middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  
  next();
};

// Registration validation rules
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// Login validation rules
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Event validation rules
export const eventValidation = [
  body('eventName')
    .trim()
    .notEmpty()
    .withMessage('Event name is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Event description is required'),
  body('date')
    .notEmpty()
    .withMessage('Event date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('time')
    .trim()
    .notEmpty()
    .withMessage('Event time is required'),
  body('venue')
    .trim()
    .notEmpty()
    .withMessage('Event venue is required'),
];

// Participant validation rules
export const participantValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Participant name is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('eventId')
    .notEmpty()
    .withMessage('Event ID is required')
    .isMongoId()
    .withMessage('Invalid event ID'),
];

// Email validation rules
export const emailValidation = [
  body('eventId')
    .notEmpty()
    .withMessage('Event ID is required')
    .isMongoId()
    .withMessage('Invalid event ID'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Email subject is required'),
  body('htmlContent')
    .trim()
    .notEmpty()
    .withMessage('Email content is required'),
];
