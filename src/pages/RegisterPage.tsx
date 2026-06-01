import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getFirebaseSetupHint, useAuth } from '../context/AuthContext'

export function RegisterPage() {
  const navigate = useNavigate()
  const { signUp, firebaseReady } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const setupHint = getFirebaseSetupHint()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)

    try {
      await signUp(fullName.trim(), email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to create account.')
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
          <h2>Register</h2>
          <p>Create your account to unlock the protected project page.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Jane Doe"
              autoComplete="name"
              required
            />
          </label>

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
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />
          </label>

          <label>
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat the password"
              autoComplete="new-password"
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
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="panel-footer">
          Already registered? <Link to="/login">Return to login</Link>
        </p>
      </section>
    </main>
  )
}
