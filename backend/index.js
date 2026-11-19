const app = require('./app')
const config = require('./utils/config')
const { runMigrations } = require('./utils/database')
const logger = require('./utils/logger')

const start = async () => {
  try {
    await runMigrations()
    app.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`)
    })
  } catch (error) {
    logger.error('Failed to initialize PostgreSQL:', error.message)
    process.exitCode = 1
  }
}

start()