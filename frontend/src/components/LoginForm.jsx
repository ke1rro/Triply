import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { loginWithEmail, loginWithGoogle } from '../lib/auth'

const LoginForm = ({ onSuccess, onError }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await loginWithEmail(email, password)
      onSuccess()
    } catch (error) {
      onError('Failed to sign in. Please check your credentials.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      await loginWithGoogle()
      onSuccess()
    } catch (error) {
      onError('Failed to sign in with Google.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur-lg">
      <h1 className="mb-6 text-center text-3xl font-bold text-indigo-900">
        Travel AI Assistant
      </h1>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="********"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition duration-200 ease-in-out hover:bg-indigo-700"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between">
        <hr className="w-full border-gray-300" />
        <span className="px-2 text-sm text-gray-500">or</span>
        <hr className="w-full border-gray-300" />
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="mt-4 flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition duration-200 ease-in-out hover:bg-gray-50"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          className="mr-2 h-5 w-5"
        />
        Sign in with Google
      </button>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="font-medium text-indigo-600 hover:text-indigo-800"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}

export default LoginForm
