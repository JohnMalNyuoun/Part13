const database = require('../utils/database')

const findAll = async () => {
  const result = await database.query(
    `SELECT u.id, u.name, u.username, u."createdAt", u."updatedAt",
            COALESCE(
              json_agg(
                json_build_object(
                  'id', b.id,
                  'title', b.title,
                  'author', b.author,
                  'url', b.url,
                  'likes', b.likes,
                  'year', b.year
                )
                ORDER BY b.id
              ) FILTER (WHERE b.id IS NOT NULL),
              '[]'::json
            ) AS blogs
     FROM users u
     LEFT JOIN blogs b ON b.user_id = u.id
     GROUP BY u.id
     ORDER BY u.id`
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

const findWithReadingsById = async (id) => {
  const result = await database.query(
    `SELECT u.id, u.name, u.username, u."createdAt", u."updatedAt",
            COALESCE(
              json_agg(
                json_build_object(
                  'id', b.id,
                  'url', b.url,
                  'title', b.title,
                  'author', b.author,
                  'likes', b.likes,
                  'year', b.year,
                  'readingList', json_build_object(
                    'read', rl.read,
                    'id', rl.id
                  )
                )
                ORDER BY b.id
              ) FILTER (WHERE b.id IS NOT NULL),
              '[]'::json
            ) AS readings
     FROM users u
     LEFT JOIN reading_lists rl ON rl.user_id = u.id
     LEFT JOIN blogs b ON b.id = rl.blog_id
     WHERE u.id = $1
     GROUP BY u.id`,
    [id]
  )
  return result.rows[0] || null
}

const findByUsername = async (username) => {
  const result = await database.query(
    'SELECT id, name, username, "passwordHash" FROM users WHERE username = $1',
    [username]
  )
  return result.rows[0] || null
}

const create = async ({ name, username, passwordHash }) => {
  const result = await database.query(
    `INSERT INTO users (name, username, "passwordHash")
     VALUES ($1, $2, $3)
     RETURNING id, name, username, "createdAt", "updatedAt"`,
    [name, username, passwordHash]
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
  findWithReadingsById,
  findByUsername,
  create,
  updateNameByUsername,
}
