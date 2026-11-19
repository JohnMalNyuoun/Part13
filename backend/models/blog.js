const database = require('../utils/database')

const findAll = async (search) => {
  const whereClause = search === undefined
    ? ''
    : 'WHERE (b.title ILIKE $1 OR b.author ILIKE $1)'
  const values = search === undefined
    ? []
    : [`%${search.replace(/[\\%_]/g, '\\$&')}%`]
  const result = await database.query(
    `SELECT b.id, b.title, b.author, b.url, b.likes, b.year,
            CASE WHEN u.id IS NULL THEN NULL
                 ELSE json_build_object('id', u.id, 'username', u.username, 'name', u.name)
            END AS user
     FROM blogs b
     LEFT JOIN users u ON u.id = b.user_id
     ${whereClause}
     ORDER BY b.likes DESC NULLS LAST, b.id`,
    values
  )
  return result.rows
}

const getAuthorStats = async () => {
  const result = await database.query(
    `SELECT author, COUNT(*) AS blogs, COALESCE(SUM(likes), 0) AS likes
     FROM blogs
     GROUP BY author
     ORDER BY COALESCE(SUM(likes), 0) DESC, author`
  )
  return result.rows
}

const create = async ({ title, author, url, likes = 0, userId, year }) => {
  const result = await database.query(
    `WITH created_blog AS (
       INSERT INTO blogs (title, author, url, likes, user_id, year)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, author, url, likes, user_id, year
     )
     SELECT b.id, b.title, b.author, b.url, b.likes, b.year,
            json_build_object('id', u.id, 'username', u.username, 'name', u.name) AS user
     FROM created_blog b
     JOIN users u ON u.id = b.user_id`,
    [title, author, url, likes, userId, year]
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
       SET likes = $2, "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, title, author, url, likes, user_id, year
     )
     SELECT b.id, b.title, b.author, b.url, b.likes, b.year,
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
  getAuthorStats,
  create,
  findById,
  deleteById,
  updateLikesById,
}
