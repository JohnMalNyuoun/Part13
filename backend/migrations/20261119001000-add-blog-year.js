const up = async (client) => {
  await client.query(`
    ALTER TABLE blogs
    ADD COLUMN IF NOT EXISTS year INTEGER CHECK (year IS NULL OR year >= 1991)
  `)
}

module.exports = { up }
