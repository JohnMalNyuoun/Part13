import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
const App = () => {
  const [blogs, setBlogs] = useState([])
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [notificationType, setNotificationType] = useState('success')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  // Fetch blogs when the component mounts
  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])
  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const loggedUser = await loginService.login({ username, password })

      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(loggedUser)
      )
      blogService.setToken(loggedUser.token)
      setUser(loggedUser)
      setUsername('')
      setPassword('')
    } catch {
      setNotificationType('error')
      setNotificationMessage('Wrong username or password')
      setTimeout(() => {
        setNotificationMessage(null)
      }, 5000)
    }
  }
  const blogFormRef = useRef()
  const handleCreateBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))

      blogFormRef.current.toggleVisibility()

      setNotificationType('success')
      setNotificationMessage(`A new blog "${returnedBlog.title}" by ${returnedBlog.author} added!`)
      setTimeout(() => {
        setNotificationMessage(null)
      }, 5000)
    } catch (exception) {
      console.error('Failed to create blog', exception)
      setNotificationType('error')
      setNotificationMessage('Failed to add the blog. Please check your inputs.')
      setTimeout(() => {
        setNotificationMessage(null)
      }, 5000)
    }
  }
  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    blogService.setToken(null)
    setUser(null)
  }
  const handleLikeBlog = async (id, blogToUpdate) => {
    try {
      const returnedBlog = await blogService.update(id, blogToUpdate)

      const originalBlog = blogs.find(b => b.id === id)

      const finalizedBlog = {
        ...returnedBlog,
        user: originalBlog && originalBlog.user ? originalBlog.user : user
      }

      setBlogs(blogs.map(blog => blog.id === id ? finalizedBlog : blog))
    } catch {
      setNotificationType('error')
      setNotificationMessage('failed to update likes')
      setTimeout(() => setNotificationMessage(null), 5000)
    }
  }
  const handleRemoveBlog = async (blog) => {
    const confirmation = window.confirm(`Remove blog "${blog.title}" by ${blog.author}?`)

    if (confirmation) {
      try {
        await blogService.remove(blog.id)

        // Update local state by filtering out the removed blog post
        setBlogs(blogs.filter(b => b.id !== blog.id))

        setNotificationType('success')
        setNotificationMessage(`Successfully removed "${blog.title}"`)
        setTimeout(() => setNotificationMessage(null), 5000)
      } catch (exception) {
        console.error('Failed to remove blog:', exception)
        setNotificationType('error')
        setNotificationMessage('Failed to delete the blog post. Check your permissions.')
        setTimeout(() => setNotificationMessage(null), 5000)
      }
    }
  }
  if (user === null) {
    return (
      <div>
        <Notification message={notificationMessage} type={notificationType} />
        <h2>Log in to application</h2>
        <form onSubmit={handleLogin}>
          <div>
            username
            <input
              type="text"
              value={username}
              name="Username"
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password
            <input
              type="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }
  return (
    <div>
      <h2>blogs</h2>
      <Notification message={notificationMessage} type={notificationType} />

      <p>
        {user.name} logged in
        <button onClick={handleLogout}>logout</button>
      </p>

      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={handleCreateBlog} />
      </Togglable>

      {/* Copy array, sort by likes descending, then map over them with ALL props assigned cleanly */}
      {[...blogs]
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .map(blog => (
          <Blog
            key={blog.id}
            blog={blog}
            updateLikes={handleLikeBlog}
            removeBlog={handleRemoveBlog}
            currentUser={user}
          />
        ))
      }
    </div>
  )
}

export default App