const readingListsRouter = require('express').Router()
const Blog = require('../models/blog')
const ReadingList = require('../models/readingList')
const User = require('../models/user')
const { createHttpError, userExtractor } = require('../utils/middleware')

readingListsRouter.post('/', async (request, response) => {
  const { blogId, userId } = request.body || {}
  if (!Number.isInteger(userId) || userId < 1) {
    throw createHttpError(400, 'userId must be a positive integer')
  }
  if (!Number.isInteger(blogId) || blogId < 1) {
    throw createHttpError(400, 'blogId must be a positive integer')
  }

  if (!await User.findById(userId)) {
    throw createHttpError(400, 'userId does not refer to an existing user')
  }
  if (!await Blog.findById(blogId)) {
    throw createHttpError(400, 'blogId does not refer to an existing blog')
  }

  const reading = await ReadingList.add(userId, blogId)
  if (!reading) {
    throw createHttpError(409, 'blog is already in the reading list')
  }

  response.status(201).json(reading)
})

readingListsRouter.put('/:id', userExtractor, async (request, response) => {
  const id = Number(request.params.id)
  if (!Number.isInteger(id) || id < 1) {
    throw createHttpError(400, 'id must be a positive integer')
  }
  if (!request.body || request.body.read !== true) {
    throw createHttpError(400, 'read must be true')
  }

  const reading = await ReadingList.findById(id)
  if (!reading) {
    throw createHttpError(404, 'reading list entry not found')
  }
  if (reading.userId !== request.user.id) {
    throw createHttpError(403, 'only the owner can mark this reading as read')
  }

  const updatedReading = await ReadingList.markAsRead(id, request.user.id)
  if (!updatedReading) {
    throw createHttpError(404, 'reading list entry not found')
  }

  response.json(updatedReading)
})

module.exports = readingListsRouter
