const database = require('../utils/database')

const create = async (token, userId) => {
  await database.query(
    'INSERT INTO sessions (token, user_id) VALUES ($1, $2)',
    [token, userId]
  )
}

const isValid = async (token, userId) => {
  const result = await database.query(
    'SELECT 1 FROM sessions WHERE token = $1 AND user_id = $2 AND valid = TRUE',
    [token, userId]
  )
  return result.rows.length > 0
}

const invalidate = async (token, userId) => {
  await database.query(
    `UPDATE sessions
     SET valid = FALSE, "updatedAt" = CURRENT_TIMESTAMP
     WHERE token = $1 AND user_id = $2 AND valid = TRUE`,
    [token, userId]
  )
}

module.exports = { create, isValid, invalidate }
