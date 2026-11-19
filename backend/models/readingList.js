const database = require('../utils/database')

const add = async (userId, blogId) => {
  const result = await database.query(
    `INSERT INTO reading_lists (user_id, blog_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, blog_id) DO NOTHING
     RETURNING user_id AS "userId", blog_id AS "blogId", read`,
    [userId, blogId]
  )
  return result.rows[0] || null
}

module.exports = { add }
