const database = require('./utils/database')

const printBlogs = async () => {
  try {
    const result = await database.query('SELECT * FROM blogs ORDER BY id')
    result.rows.forEach(({ author, title, likes }) => {
      console.log(`${author}: '${title}', ${likes} likes`)
    })
  } catch (error) {
    console.error('Failed to fetch blogs:', error.message)
    process.exitCode = 1
  } finally {
    await database.close()
  }
}

printBlogs()
