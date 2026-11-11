const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')
const config = require('./config')

let pool

const getPool = () => {
  if (!config.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Add your PostgreSQL connection URL to Backend/.env.')
  }

  if (!pool) {
    const connectionUrl = new URL(config.DATABASE_URL)
    for (const parameter of ['sslmode', 'sslrootcert', 'sslcert', 'sslkey']) {
      connectionUrl.searchParams.delete(parameter)
    }

    pool = new Pool({
      connectionString: connectionUrl.toString(),
      ssl: {
        ca: fs.readFileSync(path.join(__dirname, '..', 'ca.pem'), 'utf8'),
        rejectUnauthorized: true,
      },
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
