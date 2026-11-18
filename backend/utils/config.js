const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const PORT = process.env.PORT || 3003
const TESTING = process.env.TESTING === 'true'
const DATABASE_URL = TESTING ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL
const JWT_SECRET = process.env.JWT_SECRET

module.exports = {
  DATABASE_URL,
  JWT_SECRET,
  PORT,
  TESTING,
}
