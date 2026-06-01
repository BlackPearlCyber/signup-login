import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebase'

type ProjectNote = {
  id: string
  title: string
  body: string
  createdAt: string
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, signOutUser, firebaseReady } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<ProjectNote[]>([])

  useEffect(() => {
    if (!db || !user) {
      setItems([])
      return
    }

    const notesQuery = query(
      collection(db, 'projectNotifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
    )

    return onSnapshot(notesQuery, (snapshot) => {
      setItems(
        snapshot.docs.map((document) => {
          const data = document.data() as {
            title?: string
            body?: string
            createdAt?: { toDate?: () => Date }
          }

          return {
            id: document.id,
            title: data.title ?? 'Project update',
            body: data.body ?? '',
            createdAt: data.createdAt?.toDate?.().toLocaleString() ?? 'just now',
          }
        }),
      )
    })
  }, [user])

  const latestItem = items[0]
  const itemCountLabel = `${items.length} saved note${items.length === 1 ? '' : 's'}`

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!db || !user) {
      setNotice('Firebase is not configured yet.')
      return
    }

    setLoading(true)
    setNotice('')

    try {
      await addDoc(collection(db, 'projectNotifications'), {
        userId: user.uid,
        title: title.trim(),
        body: body.trim(),
        createdAt: serverTimestamp(),
      })

      setTitle('')
      setBody('')
      setNotice('Project notification saved to Firestore.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Failed to save notification.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOutUser()
    navigate('/login', { replace: true })
  }

  const greetingName = user?.displayName?.trim() || user?.email || 'friend'

  return (
    <main className="dashboard-shell">
      <section className="dashboard-hero">
        <div className="dashboard-hero__intro">
          <span className="eyebrow">Welcome back</span>
          <h1>Hello, {greetingName}.</h1>
          <p>
            Your project page is live. Add a notification below and it will be
            stored in Firebase for this account.
          </p>

          <div className="dashboard-metrics">
            <article>
              <span>Session</span>
              <strong>{user?.email ?? 'Signed in'}</strong>
            </article>
            <article>
              <span>Notes</span>
              <strong>{itemCountLabel}</strong>
            </article>
            <article>
              <span>Latest</span>
              <strong>{latestItem?.createdAt ?? 'No updates yet'}</strong>
            </article>
          </div>
        </div>

        <div className="dashboard-actions">
          <span className={`status-chip ${firebaseReady ? 'status-chip--ready' : ''}`}>
            {firebaseReady ? 'Firebase connected' : 'Firebase not configured'}
          </span>
          <button type="button" className="secondary-button" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="panel panel--form">
          <div className="panel-heading">
            <h2>Project notification</h2>
            <p>Store a short update or greeting for this user account.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Title
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Deployment complete"
                required
              />
            </label>

            <label>
              Message
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Your project is ready for review."
                rows={5}
                required
              />
            </label>

            {notice ? <div className="notice">{notice}</div> : null}

            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save to Firebase'}
            </button>
          </form>
        </article>

        <article className="panel panel--feed">
          <div className="panel-heading">
            <h2>Recent notifications</h2>
            <p>Latest Firestore entries for this account.</p>
          </div>

          <div className="notification-list">
            {items.length === 0 ? (
              <div className="empty-state">
                <strong>No notifications yet.</strong>
                <span>Add one from the form to see it appear here.</span>
              </div>
            ) : (
              items.map((item) => (
                <article className="notification-card" key={item.id}>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                  <time>{item.createdAt}</time>
                </article>
              ))
            )}
          </div>

          <p className="panel-footer panel-footer--compact">
            Need another account? <Link to="/register">Create a new one</Link>
          </p>
        </article>
      </section>
    </main>
  )
}
