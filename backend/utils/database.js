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

const initializeDatabase = async () => {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL CHECK (length(btrim(name)) > 0),
      username TEXT NOT NULL UNIQUE CHECK (length(btrim(username)) > 0),
      "passwordHash" TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await getPool().query(
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS "passwordHash" TEXT'
  )

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS blogs (
      id SERIAL PRIMARY KEY,
      title TEXT,
      author TEXT,
      url TEXT,
      likes INTEGER DEFAULT 0,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
    )
  `)

  await getPool().query(`
    ALTER TABLE blogs
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
  `)
}

const close = async () => {
  if (pool) {
    const activePool = pool
    pool = undefined
    await activePool.end()
  }
}

const resetDatabase = async () => {
  await getPool().query('TRUNCATE TABLE blogs, users RESTART IDENTITY CASCADE')
}

module.exports = {
  query: (text, params) => getPool().query(text, params),
  initializeDatabase,
  resetDatabase,
  close,
}
