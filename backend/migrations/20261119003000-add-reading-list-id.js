const up = async (client) => {
  await client.query(`
    ALTER TABLE reading_lists
    ADD COLUMN IF NOT EXISTS id SERIAL
  `)

  await client.query(`
    ALTER TABLE reading_lists
    DROP CONSTRAINT IF EXISTS reading_lists_pkey,
    ADD CONSTRAINT reading_lists_pkey PRIMARY KEY (id)
  `)

  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS reading_lists_user_id_blog_id_unique
    ON reading_lists (user_id, blog_id)
  `)
}

module.exports = { up }
