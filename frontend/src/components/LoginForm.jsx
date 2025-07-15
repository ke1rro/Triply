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
    <div className="w-full max-w-md">
      {/* Main heading outside the form card */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">
          Ready to start an
        </h1>
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">
          adventure?
        </h1>
      </div>

      {/* Form card with dark glassmorphism */}
      <div className="rounded-2xl bg-black/70 p-8 shadow-2xl backdrop-blur-md">
        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-white"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-white placeholder-gray-300 backdrop-blur-sm focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-white"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-white placeholder-gray-300 backdrop-blur-sm focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400/50 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6 flex items-center justify-between">
          <hr className="w-full border-gray-600" />
          <span className="px-3 text-sm text-gray-400">or</span>
          <hr className="w-full border-gray-600" />
        </div>

        {/* Social login buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-white/10 px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-300 ease-in-out hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="mr-3 h-5 w-5"
            />
            Continue with Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginForm
