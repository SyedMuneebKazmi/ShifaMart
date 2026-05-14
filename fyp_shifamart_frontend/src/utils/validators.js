import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Phone number validation schema
 */
export const phoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^[\d\s\-\+\(\)]{10,}$/.test(val),
    'Invalid phone number format'
  );

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Registration form schema
 */
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  // role is managed via UI state (not a real form field), so we make it optional here
  role: z.string().optional(),
  phone: phoneSchema.optional(),
  age: z.union([z.coerce.number().int().min(1).max(150), z.literal('')]).optional().transform(val => val === '' ? undefined : val),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  // Doctor-specific fields
  licenseNumber: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.union([z.coerce.number(), z.literal('')]).optional().transform(val => val === '' ? undefined : val),
  hospital: z.string().optional(),
  consultationFee: z.union([z.coerce.number(), z.literal('')]).optional().transform(val => val === '' ? undefined : val),
  // Pharmacy-specific fields
  pharmacyName: z.string().optional(),
  ownerName: z.string().optional(),
  city: z.string().optional(),
  landline: z.string().optional(),
  operatingHours: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

/**
 * Validate email
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  return emailSchema.safeParse(email).success;
};

/**
 * Validate password strength
 * @param {string} password 
 * @returns {{valid: boolean, errors: string[]}}
 */
export const validatePassword = (password) => {
  const result = passwordSchema.safeParse(password);
  
  if (result.success) {
    return { valid: true, errors: [] };
  }
  
  return {
    valid: false,
    errors: result.error.errors.map((err) => err.message),
  };
};

/**
 * Validate phone number
 * @param {string} phone 
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  return phoneSchema.safeParse(phone).success;
};

/**
 * Sanitize input string
 * @param {string} input 
 * @returns {string}
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Validate file type
 * @param {File} file 
 * @param {string[]} allowedTypes 
 * @returns {boolean}
 */
export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 * @param {File} file 
 * @param {number} maxSizeMB 
 * @returns {boolean}
 */
export const isValidFileSize = (file, maxSizeMB) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Format file size
 * @param {number} bytes 
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
