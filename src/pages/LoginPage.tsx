import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getFirebaseSetupHint, useAuth } from '../context/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, firebaseReady } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const setupHint = getFirebaseSetupHint()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await signIn(email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="app-shell auth-shell">
      <section className="form-panel form-panel--full">
        <div className="panel-heading">
          <span className={`status-chip ${firebaseReady ? 'status-chip--ready' : ''}`}>
            {firebaseReady ? 'Firebase ready' : 'Configure Firebase env'}
          </span>
          <h2>Login</h2>
          <p>Use the account you created on the registration screen.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <div className="notice notice--error">{error}</div> : null}

          {error.includes('Firebase Auth is not configured') || !firebaseReady ? (
            <div className="notice notice--hint">
              <strong>Check Firebase setup</strong>
              <ul>
                {setupHint.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="panel-footer">
          No account yet? <Link to="/register">Create one here</Link>
        </p>
      </section>
    </main>
  )
}
