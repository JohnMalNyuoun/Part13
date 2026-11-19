const jwt = require('jsonwebtoken')
const config = require('./config')
const logger = require('./logger')
const Session = require('../models/session')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
  const loggedBody = { ...request.body }
  if (Object.prototype.hasOwnProperty.call(loggedBody, 'password')) {
    loggedBody.password = '[REDACTED]'
  }

  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', loggedBody)
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

const userExtractor = async (request, response, next) => {
  const authorization = request.get('authorization')
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createHttpError(401, 'token missing or invalid')
  }
  if (!config.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing. Add it to backend/.env.')
  }

  let decodedToken
  try {
    decodedToken = jwt.verify(authorization.slice(7), config.JWT_SECRET)
  } catch {
    throw createHttpError(401, 'token missing or invalid')
  }

  if (!decodedToken || !Number.isInteger(decodedToken.id) || decodedToken.id < 1) {
    throw createHttpError(401, 'token missing or invalid')
  }

  const token = authorization.slice(7)
  if (!await Session.isValid(token, decodedToken.id)) {
    throw createHttpError(401, 'token missing or invalid')
  }

  const user = await User.findById(decodedToken.id)
  if (!user || user.disabled) {
    throw createHttpError(401, 'token missing or invalid')
  }

  request.token = token
  request.user = user
  next()
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
  userExtractor,
  errorHandler,
}
