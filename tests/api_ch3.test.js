const assert = require('node:assert/strict')
const { test } = require('node:test')

const baseUrl = 'http://localhost:3001'

const postJson = (path, body, token) => fetch(`${baseUrl}${path}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  body: JSON.stringify(body),
})

test('GET / responds with HTTP 200', async () => {
  const response = await fetch(`${baseUrl}/`)
  assert.equal(response.status, 200)
})

test('POST /api/reset clears users and blogs', async () => {
  let response = await postJson('/api/reset')
  assert.equal(response.status, 204)

  response = await postJson('/api/users', {
    name: 'Test User',
    username: 'test-reset-user',
    password: 'test-password',
  })
  assert.equal(response.status, 201)

  response = await postJson('/api/login', {
    username: 'test-reset-user',
    password: 'test-password',
  })
  assert.equal(response.status, 200)
  const { token } = await response.json()

  response = await postJson('/api/blogs', {
    title: 'Test Blog',
    author: 'Test Author',
    url: 'https://example.test/blog',
  }, token)
  assert.equal(response.status, 201)

  response = await postJson('/api/reset')
  assert.equal(response.status, 204)

  const [blogsResponse, usersResponse] = await Promise.all([
    fetch(`${baseUrl}/api/blogs`),
    fetch(`${baseUrl}/api/users`),
  ])
  assert.equal(blogsResponse.status, 200)
  assert.equal(usersResponse.status, 200)
  assert.deepEqual(await blogsResponse.json(), [])
  assert.deepEqual(await usersResponse.json(), [])
})
