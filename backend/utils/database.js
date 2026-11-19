const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')
const config = require('./config')

let pool

const getPool = () => {
  if (!config.DATABASE_URL) {
    const setting = config.TESTING ? 'TEST_DATABASE_URL' : 'DATABASE_URL'
    throw new Error(`${setting} is missing. Add your PostgreSQL connection URL to backend/.env.`)
  }

  if (!pool) {
    const connectionUrl = new URL(config.DATABASE_URL)
    const sslMode = connectionUrl.searchParams.get('sslmode')
    for (const parameter of ['sslmode', 'sslrootcert', 'sslcert', 'sslkey']) {
      connectionUrl.searchParams.delete(parameter)
    }

    pool = new Pool({
      connectionString: connectionUrl.toString(),
      ssl: sslMode === 'disable' ? false : {
        ca: fs.readFileSync(path.join(__dirname, '..', 'ca.pem'), 'utf8'),
        rejectUnauthorized: true,
      },
    })
  }

  return pool
}

const runMigrations = async () => {
  const activePool = getPool()
  await activePool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const migrationsPath = path.join(__dirname, '..', 'migrations')
  const migrationNames = fs.readdirSync(migrationsPath)
    .filter((name) => name.endsWith('.js'))
    .sort()

  for (const name of migrationNames) {
    const { rows } = await activePool.query(
      'SELECT 1 FROM schema_migrations WHERE name = $1',
      [name]
    )
    if (rows.length > 0) {
      continue
    }

    const migration = require(path.join(migrationsPath, name))
    const client = await activePool.connect()
    try {
      await client.query('BEGIN')
      await migration.up(client)
      await client.query(
        'INSERT INTO schema_migrations (name) VALUES ($1)',
        [name]
      )
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}

const close = async () => {
  if (pool) {
    const activePool = pool
    pool = undefined
    await activePool.end()
  }
}

const resetDatabase = async () => {
  await getPool().query(`
    TRUNCATE TABLE sessions, reading_lists, blogs, users
    RESTART IDENTITY CASCADE
  `)
}

module.exports = {
  query: (text, params) => getPool().query(text, params),
  runMigrations,
  resetDatabase,
  close,
}
