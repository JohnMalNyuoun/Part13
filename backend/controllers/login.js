const loginRouter = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const User = require('../models/user')
const { createHttpError } = require('../utils/middleware')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body || {}
  if (typeof username !== 'string' || typeof password !== 'string') {
    throw createHttpError(400, 'username and password are required')
  }

  const user = await User.findByUsername(username)
  const passwordMatches = user && user.passwordHash
    ? await bcrypt.compare(password, user.passwordHash)
    : false
  if (!passwordMatches) {
    throw createHttpError(401, 'invalid username or password')
  }

  if (!config.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing. Add it to backend/.env.')
  }

  const token = jwt.sign(
    { username: user.username, id: user.id },
    config.JWT_SECRET,
    { expiresIn: '1h' }
  )
  response.json({ token, username: user.username, name: user.name })
})

module.exports = loginRouter
