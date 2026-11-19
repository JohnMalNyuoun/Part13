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

const putJson = (path, body, token) => fetch(`${baseUrl}${path}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  body: JSON.stringify(body),
})

const deleteWithToken = (path, token) => fetch(`${baseUrl}${path}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` },
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
  const createdUser = await response.json()

  response = await postJson('/api/login', {
    username: 'test-reset-user',
    password: 'test-password',
  })
  assert.equal(response.status, 200)
  const { token } = await response.json()

  const currentYear = new Date().getFullYear()
  for (const year of [1990, currentYear + 1, 2000.5]) {
    response = await postJson('/api/blogs', {
      title: 'Invalid Year Blog',
      author: 'Test Author',
      url: 'https://example.test/invalid-year',
      year,
    }, token)
    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), {
      error: `year must be an integer between 1991 and ${currentYear}`,
    })
  }

  response = await postJson('/api/blogs', {
    title: 'Test Blog',
    author: 'Test Author',
    url: 'https://example.test/blog',
    year: currentYear,
  }, token)
  assert.equal(response.status, 201)
  const createdBlog = await response.json()
  assert.equal(createdBlog.year, currentYear)

  response = await postJson('/api/readinglists', {
    userId: 9999,
    blogId: createdBlog.id,
  })
  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), {
    error: 'userId does not refer to an existing user',
  })

  response = await postJson('/api/readinglists', {
    userId: createdUser.id,
    blogId: 9999,
  })
  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), {
    error: 'blogId does not refer to an existing blog',
  })

  response = await postJson('/api/readinglists', {
    userId: createdUser.id,
    blogId: createdBlog.id,
  })
  assert.equal(response.status, 201)
  assert.deepEqual(await response.json(), {
    userId: createdUser.id,
    blogId: createdBlog.id,
    read: false,
  })

  response = await fetch(`${baseUrl}/api/users/${createdUser.id}`)
  assert.equal(response.status, 200)
  const userWithReadings = await response.json()
  const readingListRowId = userWithReadings.readings[0].readingList.id
  assert.ok(Number.isInteger(readingListRowId))
  assert.deepEqual(userWithReadings.readings, [{
    id: createdBlog.id,
    url: 'https://example.test/blog',
    title: 'Test Blog',
    author: 'Test Author',
    likes: 0,
    year: currentYear,
    readingList: {
      read: false,
      id: readingListRowId,
    },
  }])

  response = await fetch(`${baseUrl}/api/users/${createdUser.id}?read=false`)
  assert.equal(response.status, 200)
  assert.equal((await response.json()).readings.length, 1)

  response = await fetch(`${baseUrl}/api/users/${createdUser.id}?read=true`)
  assert.equal(response.status, 200)
  assert.deepEqual((await response.json()).readings, [])

  response = await fetch(`${baseUrl}/api/users/${createdUser.id}?read=invalid`)
  assert.equal(response.status, 400)

  response = await putJson(`/api/readinglists/${readingListRowId}`, { read: true }, token)
  assert.equal(response.status, 200)
  assert.equal((await response.json()).read, true)

  response = await postJson('/api/users', {
    name: 'Another User',
    username: 'test-reading-list-owner',
    password: 'test-password',
  })
  assert.equal(response.status, 201)
  response = await postJson('/api/login', {
    username: 'test-reading-list-owner',
    password: 'test-password',
  })
  assert.equal(response.status, 200)
  const { token: otherUserToken } = await response.json()

  response = await putJson(`/api/readinglists/${readingListRowId}`, { read: true }, otherUserToken)
  assert.equal(response.status, 403)

  response = await fetch(`${baseUrl}/api/users/${createdUser.id}`)
  assert.equal(response.status, 200)
  const updatedUser = await response.json()
  assert.equal(updatedUser.readings[0].readingList.read, true)

  response = await fetch(`${baseUrl}/api/users/${createdUser.id}?read=true`)
  assert.equal(response.status, 200)
  assert.equal((await response.json()).readings.length, 1)

  response = await fetch(`${baseUrl}/api/users/${createdUser.id}?read=false`)
  assert.equal(response.status, 200)
  assert.deepEqual((await response.json()).readings, [])

  response = await deleteWithToken('/api/logout', token)
  assert.equal(response.status, 204)

  response = await postJson('/api/blogs', {
    title: 'Logged Out Blog',
    author: 'Test Author',
    url: 'https://example.test/logged-out',
  }, token)
  assert.equal(response.status, 401)

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
