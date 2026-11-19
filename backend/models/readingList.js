const database = require('../utils/database')

const add = async (userId, blogId) => {
  const result = await database.query(
    `INSERT INTO reading_lists (user_id, blog_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, blog_id) DO NOTHING
     RETURNING id, user_id AS "userId", blog_id AS "blogId", read`,
    [userId, blogId]
  )
  return result.rows[0] || null
}

const findById = async (id) => {
  const result = await database.query(
    'SELECT id, user_id AS "userId" FROM reading_lists WHERE id = $1',
    [id]
  )
  return result.rows[0] || null
}

const setRead = async (id, userId, read) => {
  const result = await database.query(
    `UPDATE reading_lists
     SET read = $3, "updatedAt" = CURRENT_TIMESTAMP
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id AS "userId", blog_id AS "blogId", read`,
    [id, userId, read]
  )
  return result.rows[0] || null
}

module.exports = { add, findById, setRead }
