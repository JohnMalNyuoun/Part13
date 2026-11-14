import { useState } from 'react'

const Blog = ({ blog, updateLikes, removeBlog, currentUser }) => {
  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const handleLike = () => {
    let userId = null
    if (blog.user) {
      userId = blog.user.id || blog.user._id || (typeof blog.user === 'string' ? blog.user : null)
    }

    const blogToUpdate = {
      user: userId,
      likes: (blog.likes || 0) + 1,
      author: blog.author,
      title: blog.title,
      url: blog.url
    }
    updateLikes(blog.id, blogToUpdate)
  }

  const handleDeletion = () => {
    removeBlog(blog)
  }

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const displayUser = () => {
    if (!blog.user) return 'Unknown User'
    if (typeof blog.user === 'string') return currentUser?.name || 'Just added'
    return blog.user.name || blog.user.username || 'Unknown User'
  }

  const isPopulatedCreator = blog.user && typeof blog.user !== 'string' && blog.user.username === currentUser?.username

  const isUnpopulatedCreator = typeof blog.user === 'string' && (blog.user === currentUser?.id || blog.user === currentUser?._id)

  const showRemoveButton = isPopulatedCreator || isUnpopulatedCreator || !blog.user

  return (
    <div style={blogStyle}>
      <div>
        {blog.title} {blog.author}
        <button onClick={toggleVisibility}>{visible ? 'hide' : 'view'}</button>
      </div>

      {visible && (
        <div>
          <div>
            <a href={blog.url} target="_blank" rel="noreferrer">{blog.url}</a>
          </div>
          <div>
            likes {blog.likes || 0}
            <button onClick={handleLike}>like</button>
          </div>
          <div>Added by: {displayUser()}</div>

          {showRemoveButton && (
            <button
              onClick={handleDeletion}
              style={{
                backgroundColor: '#ff4d4d',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                marginTop: 5,
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog