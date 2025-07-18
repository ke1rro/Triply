import React, { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { FiCopy, FiCheck } from 'react-icons/fi'

const StartTripModal = ({ trip, onClose, onSuccess }) => {
  const [copying, setCopying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [starting, setStarting] = useState(false)

  const inviteUrl = `${window.location.origin}${import.meta.env.BASE_URL}invite/${trip.id}`

  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      const textArea = document.createElement('textarea')
      textArea.value = inviteUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const handleLaunchTrip = async () => {
    setStarting(true)
    try {
      await updateDoc(doc(db, 'trips', trip.id), {
        statusActive: true,
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error starting trip:', error)
      alert('Failed to start trip. Please try again.')
    } finally {
      setStarting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-black/80 p-6 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-white drop-shadow-lg">
            Start Your Trip
          </h3>
          <p className="mt-2 text-gray-300">
            Ready to begin your adventure? Invite friends to join you!
          </p>
        </div>

        {/* Invite Link Section */}
        <div className="mb-6">
          <h4 className="mb-3 text-lg font-semibold text-blue-400">
            Invite People
          </h4>
          <div className="rounded-lg border border-blue-400/30 bg-white/5 p-4">
            <p className="mb-3 text-sm text-gray-300">
              Share this link to invite people to your trip:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inviteUrl}
                readOnly
                className="flex-1 rounded-lg border border-gray-300/30 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur-sm"
              />
              <button
                onClick={handleCopyInviteLink}
                className="flex items-center gap-2 rounded-lg bg-blue-600/80 px-3 py-2 text-sm text-white transition duration-200 hover:bg-blue-700/80"
              >
                {copied ? (
                  <FiCheck className="h-4 w-4" />
                ) : (
                  <FiCopy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-600/60 px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-gray-600/80"
          >
            Cancel
          </button>
          <button
            onClick={handleLaunchTrip}
            disabled={starting}
            className="flex-1 rounded-lg bg-green-600/80 px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-green-700/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {starting ? 'Launching...' : 'Launch Trip'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default StartTripModal
