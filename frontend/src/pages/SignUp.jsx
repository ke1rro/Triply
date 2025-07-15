import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SignUpForm from '../components/SignUpForm'

const SignUp = () => {
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/home')
  }

  const handleError = (errorMessage) => {
    setError(errorMessage)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-green-900/20"></div>
      </div>

      <div className="relative z-10">
        {error && (
          <div className="absolute left-1/2 top-4 mb-4 -translate-x-1/2 transform rounded-xl border border-red-400 bg-red-500/90 px-6 py-3 text-white shadow-lg backdrop-blur-sm">
            {error}
          </div>
        )}
        <SignUpForm onSuccess={handleSuccess} onError={handleError} />
      </div>
    </div>
  )
}

export default SignUp
