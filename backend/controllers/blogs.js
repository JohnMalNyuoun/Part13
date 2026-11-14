const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { createHttpError } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.findAll()
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const blog = await Blog.create(request.body)
  response.status(201).json(blog)
})

blogsRouter.put('/:id', async (request, response) => {
  const id = Number(request.params.id)
  if (!Number.isInteger(id) || id < 1) {
    throw createHttpError(400, 'id must be a positive integer')
  }

  const { likes } = request.body || {}
  if (!Number.isInteger(likes) || likes < 0) {
    throw createHttpError(400, 'likes must be a non-negative integer')
  }

  const updatedBlog = await Blog.updateLikesById(id, likes)
  if (!updatedBlog) {
    throw createHttpError(404, 'blog not found')
  }

  response.json(updatedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const id = Number(request.params.id)
  if (!Number.isInteger(id) || id < 1) {
    throw createHttpError(400, 'id must be a positive integer')
  }

  const deleted = await Blog.deleteById(id)
  if (!deleted) {
    throw createHttpError(404, 'blog not found')
  }

  response.status(204).end()
})

module.exports = blogsRouter
