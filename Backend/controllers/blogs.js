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

module.exports = blogsRouter
