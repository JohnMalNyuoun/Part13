const database = require('../utils/database')

const findAll = async () => {
  const result = await database.query(
    'SELECT id, title, author, url, likes FROM blogs ORDER BY id'
  )
  return result.rows
}

const create = async ({ title, author, url, likes = 0 }) => {
  const result = await database.query(
    `INSERT INTO blogs (title, author, url, likes)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, author, url, likes`,
    [title, author, url, likes]
  )
  return result.rows[0]
}

module.exports = {
  findAll,
  create,
}
