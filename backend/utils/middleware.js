const logger = require('./logger')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const createHttpError = (status, message) => {
  const error = new Error(message)
  error.status = status
  return error
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (response.headersSent) {
    return next(error)
  }

  const status = error.status || error.statusCode
  const isClientDatabaseError = typeof error.code === 'string' &&
    ['22', '23'].includes(error.code.slice(0, 2))
  const statusCode = Number.isInteger(status) && status >= 400 && status < 600
    ? status
    : isClientDatabaseError ? 400 : 500
  const message = statusCode < 500 ? error.message : 'Internal server error'

  response.status(statusCode).json({ error: message })
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  createHttpError,
  errorHandler,
}
