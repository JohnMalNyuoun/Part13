const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { createHttpError, userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const { search } = request.query
  if (search !== undefined && typeof search !== 'string') {
    throw createHttpError(400, 'search must be a string')
  }

  const blogs = await Blog.findAll(search)
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const blog = await Blog.create({ ...request.body, userId: request.user.id })
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

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const id = Number(request.params.id)
  if (!Number.isInteger(id) || id < 1) {
    throw createHttpError(400, 'id must be a positive integer')
  }

  const blog = await Blog.findById(id)
  if (!blog) {
    throw createHttpError(404, 'blog not found')
  }
  if (blog.userId !== request.user.id) {
    throw createHttpError(403, 'only the blog owner can delete it')
  }

  const deleted = await Blog.deleteById(id, request.user.id)
  if (!deleted) {
    throw createHttpError(404, 'blog not found')
  }

  response.status(204).end()
})

module.exports = blogsRouter
