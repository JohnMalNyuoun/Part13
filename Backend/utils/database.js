const { Pool } = require('pg')
const config = require('./config')

let pool

const getPool = () => {
  if (!config.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Add your PostgreSQL connection URL to Backend/.env.')
  }

  if (!pool) {
    pool = new Pool({
      connectionString: config.DATABASE_URL,
    })
  }

  return pool
}

const initializeDatabase = async () => {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS blogs (
      id SERIAL PRIMARY KEY,
      title TEXT,
      author TEXT,
      url TEXT,
      likes INTEGER DEFAULT 0
    )
  `)
}

module.exports = {
  query: (text, params) => getPool().query(text, params),
  initializeDatabase,
}
