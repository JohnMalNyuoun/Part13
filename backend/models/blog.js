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

const deleteById = async (id) => {
  const result = await database.query('DELETE FROM blogs WHERE id = $1', [id])
  return result.rowCount > 0
}

const updateLikesById = async (id, likes) => {
  const result = await database.query(
    `UPDATE blogs
     SET likes = $2
     WHERE id = $1
     RETURNING id, title, author, url, likes`,
    [id, likes]
  )
  return result.rows[0] || null
}

module.exports = {
  findAll,
  create,
  deleteById,
  updateLikesById,
}
