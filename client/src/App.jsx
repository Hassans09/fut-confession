import { useCallback, useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const relativeTime = (dateValue) => {
  const date = new Date(dateValue)
  const now = Date.now()
  const seconds = Math.round((date.getTime() - now) / 1000)
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  const ranges = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
  ]

  for (const range of ranges) {
    if (Math.abs(seconds) >= range.seconds) {
      return formatter.format(Math.round(seconds / range.seconds), range.unit)
    }
  }

  return formatter.format(seconds, 'second')
}

const request = async (path, options) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Request failed.' }))
    throw new Error(body.message || 'Request failed.')
  }

  return response.json()
}

function App() {
  const [text, setText] = useState('')
  const [posts, setPosts] = useState([])
  const [sort, setSort] = useState('newest')
  const [adminMode, setAdminMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadPosts = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await request(`/confessions?sort=${sort}`)
      setPosts(data)
      setError('')
    } catch (fetchError) {
      setError(fetchError.message)
    } finally {
      setIsLoading(false)
    }
  }, [adminMode, sort])

  useEffect(() => {
    const initialLoad = setTimeout(() => {
      void loadPosts()
    }, 0)
    const interval = setInterval(() => {
      void loadPosts()
    }, 10000)

    return () => {
      clearTimeout(initialLoad)
      clearInterval(interval)
    }
  }, [loadPosts])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!text.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      await request('/confessions', {
        method: 'POST',
        body: JSON.stringify({ text }),
      })
      setText('')
      await loadPosts()
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVote = async (id, direction) => {
    try {
      const updated = await request(`/confessions/${id}/vote`, {
        method: 'PATCH',
        body: JSON.stringify({ direction }),
      })
      setPosts((current) => current.map((post) => (post.id === updated.id ? updated : post)))
    } catch (voteError) {
      setError(voteError.message)
    }
  }

  const handleFlag = async (id) => {
    try {
      const updated = await request(`/confessions/${id}/flag`, {
        method: 'PATCH',
      })
      setPosts((current) => current.map((post) => (post.id === updated.id ? updated : post)))
    } catch (flagError) {
      setError(flagError.message)
    }
  }

  return (
    <div className="app">
      <header>
        <h1>FUT Confessions</h1>
        <p>Share anonymous thoughts with FUT Minna students.</p>
      </header>

      <form className="composer" onSubmit={handleSubmit}>
        <textarea
          placeholder="Drop your anonymous confession..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={500}
          required
        />
        <div className="composer-actions">
          <small>{text.trim().length}/500</small>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post anonymously'}
          </button>
        </div>
      </form>

      <section className="toolbar">
        <label>
          Sort
          <select value={sort} onChange={(event) => setSort(event.target.value)} disabled={adminMode}>
            <option value="newest">Newest</option>
            <option value="trending">Trending</option>
          </select>
        </label>
        <button type="button" onClick={() => setAdminMode((value) => !value)}>
          {adminMode ? 'Exit admin dashboard' : 'Admin dashboard'}
        </button>
      </section>

      {error ? <p className="error">{error}</p> : null}
      {isLoading ? <p className="status">Loading confessions...</p> : null}

      <main className="feed">
        {(adminMode ? posts.filter((post) => post.flags > 0) : posts).length === 0 && !isLoading ? (
          <p className="status">No confessions yet. Be the first to post.</p>
        ) : (
          (adminMode ? posts.filter((post) => post.flags > 0) : posts).map((post) => (
            <article key={post.id}>
              <p>{post.text}</p>
              <footer>
                <span>{relativeTime(post.createdAt)}</span>
                <div className="actions">
                  <button type="button" onClick={() => handleVote(post.id, 'up')} aria-label="Upvote post">
                    ▲
                  </button>
                  <strong>{post.votes}</strong>
                  <button
                    type="button"
                    onClick={() => handleVote(post.id, 'down')}
                    aria-label="Downvote post"
                  >
                    ▼
                  </button>
                  <button type="button" onClick={() => handleFlag(post.id)} className="flag">
                    Flag ({post.flags})
                  </button>
                </div>
              </footer>
            </article>
          ))
        )}
      </main>
    </div>
  )
}

export default App
