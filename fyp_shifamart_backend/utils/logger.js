const fs = require('fs');
const path = require('path');

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Colors for console output
const COLORS = {
  RESET: '\x1b[0m',
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[35m', // Magenta
  TIMESTAMP: '\x1b[90m' // Gray
};

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'INFO';
    this.logToFile = process.env.LOG_TO_FILE === 'true';
    this.logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
  }

  // Check if log level is enabled
  isLevelEnabled(level) {
    const levels = Object.values(LOG_LEVELS);
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  // Format message
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaString}`;
  }

  // Write to console
  writeToConsole(level, formattedMessage) {
    const color = COLORS[level] || COLORS.RESET;
    console.log(`${COLORS.TIMESTAMP}[${new Date().toISOString()}]${COLORS.RESET} ${color}[${level}]${COLORS.RESET} ${formattedMessage.split('] ')[2]}`);
  }

  // Write to file
  writeToFile(formattedMessage) {
    if (this.logToFile) {
      fs.appendFileSync(this.logFile, formattedMessage + '\n', 'utf8');
    }
  }

  // Log method
  log(level, message, meta = {}) {
    if (!this.isLevelEnabled(level)) return;

    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Write to console
    this.writeToConsole(level, formattedMessage);
    
    // Write to file
    this.writeToFile(formattedMessage);
  }

  // Convenience methods
  error(message, meta = {}) {
    this.log(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  info(message, meta = {}) {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message, meta = {}) {
    this.log(LOG_LEVELS.DEBUG, message, meta);
  }

  // API request logger middleware
  requestLogger() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Log request
      this.info(`Request: ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user?.id || 'anonymous'
      });

      // Capture response
      const originalSend = res.send;
      res.send = function(data) {
        const duration = Date.now() - startTime;
        
        // Log response
        logger.info(`Response: ${req.method} ${req.originalUrl} ${res.statusCode}`, {
          duration: `${duration}ms`,
          statusCode: res.statusCode,
          userId: req.user?.id || 'anonymous'
        });
        
        originalSend.call(this, data);
      };

      next();
    };
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;