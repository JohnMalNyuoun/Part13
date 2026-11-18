const usersRouter = require('express').Router()
const User = require('../models/user')
const { createHttpError } = require('../utils/middleware')

const validateNonEmptyString = (value, field) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createHttpError(400, `${field} must be a non-empty string`)
  }
}

usersRouter.get('/', async (request, response) => {
  const users = await User.findAll()
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { name, username } = request.body || {}
  validateNonEmptyString(name, 'name')
  validateNonEmptyString(username, 'username')

  const user = await User.create({ name, username })
  response.status(201).json(user)
})

usersRouter.put('/:username', async (request, response) => {
  const { name } = request.body || {}
  validateNonEmptyString(name, 'name')

  const user = await User.updateNameByUsername(request.params.username, name)
  if (!user) {
    throw createHttpError(404, 'user not found')
  }

  response.json(user)
})

usersRouter.get('/:id', async (request, response) => {
  const id = Number(request.params.id)
  if (!Number.isInteger(id) || id < 1) {
    throw createHttpError(400, 'id must be a positive integer')
  }

  const user = await User.findById(id)
  if (!user) {
    throw createHttpError(404, 'user not found')
  }

  response.json(user)
})

module.exports = usersRouter
