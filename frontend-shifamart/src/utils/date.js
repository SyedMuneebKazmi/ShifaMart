import { format, formatDistance, formatRelative, isValid, parseISO } from 'date-fns';

/**
 * Format date to readable string
 * @param {Date|string} date 
 * @param {string} formatStr - Format string (default: 'MMM dd, yyyy')
 * @returns {string}
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, formatStr);
};

/**
 * Format date with time
 * @param {Date|string} date 
 * @returns {string}
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {Date|string} date 
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return formatDistance(dateObj, new Date(), { addSuffix: true });
};

/**
 * Format date to relative description (e.g., "today at 3:00 PM")
 * @param {Date|string} date 
 * @returns {string}
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return formatRelative(dateObj, new Date());
};

/**
 * Check if date is today
 * @param {Date|string} date 
 * @returns {boolean}
 */
export const isToday = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Get time ago string
 * @param {Date|string} date 
 * @returns {string}
 */
export const timeAgo = (date) => {
  return formatRelativeTime(date);
};
