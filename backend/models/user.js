const database = require('../utils/database')

const findAll = async () => {
  const result = await database.query(
    'SELECT id, name, username, "createdAt", "updatedAt" FROM users ORDER BY id'
  )
  return result.rows
}

const findById = async (id) => {
  const result = await database.query(
    'SELECT id, name, username, "createdAt", "updatedAt" FROM users WHERE id = $1',
    [id]
  )
  return result.rows[0] || null
}

const create = async ({ name, username }) => {
  const result = await database.query(
    `INSERT INTO users (name, username)
     VALUES ($1, $2)
     RETURNING id, name, username, "createdAt", "updatedAt"`,
    [name, username]
  )
  return result.rows[0]
}

const updateNameByUsername = async (username, name) => {
  const result = await database.query(
    `UPDATE users
     SET name = $2, "updatedAt" = CURRENT_TIMESTAMP
     WHERE username = $1
     RETURNING id, name, username, "createdAt", "updatedAt"`,
    [username, name]
  )
  return result.rows[0] || null
}

module.exports = {
  findAll,
  findById,
  create,
  updateNameByUsername,
}
