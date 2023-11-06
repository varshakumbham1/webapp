const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `[${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(
    label({ label: 'Webapp' }),
    myFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/webapp.log' })
  ]
});

module.exports = logger
  