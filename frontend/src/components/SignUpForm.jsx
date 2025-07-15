import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { registerWithEmail, loginWithGoogle } from '../lib/auth'

const SignUpForm = ({ onSuccess, onError }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      return onError('Passwords do not match')
    }

    if (password.length < 6) {
      return onError('Password should be at least 6 characters')
    }

    try {
      setLoading(true)
      await registerWithEmail(email, password)
      onSuccess()
    } catch (error) {
      onError('Failed to create an account. ' + error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true)
      await loginWithGoogle()
      onSuccess()
    } catch (error) {
      onError('Failed to sign up with Google.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur-lg">
      <h1 className="mb-6 text-center text-3xl font-bold text-indigo-900">
        Create Account
      </h1>

      <form onSubmit={handleSignUp} className="space-y-4">
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

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between">
        <hr className="w-full border-gray-300" />
        <span className="px-2 text-sm text-gray-500">or</span>
        <hr className="w-full border-gray-300" />
      </div>

      <button
        onClick={handleGoogleSignUp}
        disabled={loading}
        className="mt-4 flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition duration-200 ease-in-out hover:bg-gray-50"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          className="mr-2 h-5 w-5"
        />
        Sign up with Google
      </button>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-indigo-600 hover:text-indigo-800"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default SignUpForm
