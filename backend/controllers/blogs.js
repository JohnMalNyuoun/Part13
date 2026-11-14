const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

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
    return response.status(400).json({ error: 'id must be a positive integer' })
  }

  const { likes } = request.body || {}
  if (!Number.isInteger(likes) || likes < 0) {
    return response.status(400).json({ error: 'likes must be a non-negative integer' })
  }

  const updatedBlog = await Blog.updateLikesById(id, likes)
  if (!updatedBlog) {
    return response.status(404).end()
  }

  response.json(updatedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const id = Number(request.params.id)
  if (!Number.isInteger(id) || id < 1) {
    return response.status(400).json({ error: 'id must be a positive integer' })
  }

  const deleted = await Blog.deleteById(id)
  if (!deleted) {
    return response.status(404).end()
  }

  response.status(204).end()
})

module.exports = blogsRouter
