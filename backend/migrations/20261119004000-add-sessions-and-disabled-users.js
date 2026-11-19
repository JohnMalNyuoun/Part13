const up = async (client) => {
  await client.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS disabled BOOLEAN NOT NULL DEFAULT FALSE
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      valid BOOLEAN NOT NULL DEFAULT TRUE,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

module.exports = { up }
