          const authorsRouter = require('express').Router()
const Blog = require('../models/blog')

authorsRouter.get('/', async (request, response) => {
  const authors = await Blog.getAuthorStats()
  response.json(authors)
})

module.exports = authorsRouter
