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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {error && (
        <div className="absolute left-1/2 top-4 mb-4 -translate-x-1/2 transform rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}
      <SignUpForm onSuccess={handleSuccess} onError={handleError} />
    </div>
  )
}

export default SignUp
