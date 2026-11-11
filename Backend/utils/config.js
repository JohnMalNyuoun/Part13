const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const PORT = process.env.PORT || 3003
const DATABASE_URL = process.env.DATABASE_URL

module.exports = {
  DATABASE_URL,
  PORT,
}
