const up = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS reading_lists (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, blog_id)
    )
  `)
}

module.exports = { up }
