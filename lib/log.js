'use strict';

const LogLevels = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const logLevelName = () => process.env['LOG_LEVEL'] || 'DEBUG';

const isEnabled = level => level >= LogLevels[logLevelName()];

function appendError(params, err) {
  if (!err) {
    return params;
  }

  return Object.assign({}, params || {}, { errorName: err.name, errorMessage: err.message, stackTrace: err.stack });
}

function log(levelName, message, params) {
  if (!isEnabled(LogLevels[levelName])) {
    return;
  }

  const logMsg = Object.assign({}, { level: levelName, message: message }, params);

  console.log(JSON.stringify(logMsg));
}

module.exports = {
  debug: (msg, params) => log('DEBUG', msg, params),
  info: (msg, params) => log('INFO', msg, params),
  warn: (msg, params, error) => log('WARN', msg, appendError(params, error)),
  error: (msg, params, error) => log('ERROR', msg, appendError(params, error))
};
