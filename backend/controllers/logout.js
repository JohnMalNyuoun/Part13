const logoutRouter = require('express').Router()
const Session = require('../models/session')
const { userExtractor } = require('../utils/middleware')

logoutRouter.delete('/', userExtractor, async (request, response) => {
  await Session.invalidate(request.token, request.user.id)
  response.status(204).end()
})

module.exports = logoutRouter
