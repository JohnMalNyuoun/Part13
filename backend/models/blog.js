const database = require('../utils/database')

const findAll = async (search) => {
  const whereClause = search === undefined ? '' : 'WHERE b.title ILIKE $1'
  const values = search === undefined
    ? []
    : [`%${search.replace(/[\\%_]/g, '\\$&')}%`]
  const result = await database.query(
    `SELECT b.id, b.title, b.author, b.url, b.likes,
            CASE WHEN u.id IS NULL THEN NULL
                 ELSE json_build_object('id', u.id, 'username', u.username, 'name', u.name)
            END AS user
     FROM blogs b
     LEFT JOIN users u ON u.id = b.user_id
     ${whereClause}
     ORDER BY b.id`,
    values
  )
  return result.rows
}

const create = async ({ title, author, url, likes = 0, userId }) => {
  const result = await database.query(
    `WITH created_blog AS (
       INSERT INTO blogs (title, author, url, likes, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, author, url, likes, user_id
     )
     SELECT b.id, b.title, b.author, b.url, b.likes,
            json_build_object('id', u.id, 'username', u.username, 'name', u.name) AS user
     FROM created_blog b
     JOIN users u ON u.id = b.user_id`,
    [title, author, url, likes, userId]
  )
  return result.rows[0]
}

const findById = async (id) => {
  const result = await database.query(
    'SELECT id, user_id AS "userId" FROM blogs WHERE id = $1',
    [id]
  )
  return result.rows[0] || null
}

const deleteById = async (id, userId) => {
  const result = await database.query(
    'DELETE FROM blogs WHERE id = $1 AND user_id = $2',
    [id, userId]
  )
  return result.rowCount > 0
}

const updateLikesById = async (id, likes) => {
  const result = await database.query(
    `WITH updated_blog AS (
       UPDATE blogs
       SET likes = $2
       WHERE id = $1
       RETURNING id, title, author, url, likes, user_id
     )
     SELECT b.id, b.title, b.author, b.url, b.likes,
            CASE WHEN u.id IS NULL THEN NULL
                 ELSE json_build_object('id', u.id, 'username', u.username, 'name', u.name)
            END AS user
     FROM updated_blog b
     LEFT JOIN users u ON u.id = b.user_id`,
    [id, likes]
  )
  return result.rows[0] || null
}

module.exports = {
  findAll,
  create,
  findById,
  deleteById,
  updateLikesById,
}
