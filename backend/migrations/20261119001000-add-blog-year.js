const up = async (client) => {
  await client.query(`
    ALTER TABLE blogs
    ADD COLUMN year INTEGER CHECK (year IS NULL OR year >= 1991)
  `)
}

module.exports = { up }
