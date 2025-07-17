import React, { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { FiCopy, FiCheck, FiUsers } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { removeVisitingTrip } from '../lib/userService'

const ManageVisitorsModal = ({ trip, onClose }) => {
  const { currentUser } = useAuth()
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [removingVisitor, setRemovingVisitor] = useState(null)

  const inviteUrl = `${window.location.origin}/invite/${trip.id}`

  useEffect(() => {
    const fetchVisitors = async () => {
      if (!trip.visitors || trip.visitors.length === 0) {
        setLoading(false)
        return
      }

      try {
        const visitorPromises = trip.visitors.map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            return {
              id: userId,
              name: userData.displayName || userData.email || 'Anonymous',
              email: userData.email
            }
          }
          return null
        })

        const visitorData = await Promise.all(visitorPromises)
        setVisitors(visitorData.filter(visitor => visitor !== null))
      } catch (error) {
        console.error('Error fetching visitors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVisitors()
  }, [trip.visitors])

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

  const handleRemoveVisitor = async (visitorId) => {
    if (!window.confirm('Are you sure you want to remove this member from the trip?')) return
    
    setRemovingVisitor(visitorId)
    try {
      // Remove visitor from trip
      await updateDoc(doc(db, 'trips', trip.id), {
        visitors: arrayRemove(visitorId)
      })

      // Remove trip from visitor's visiting list
      await removeVisitingTrip(visitorId, trip.id)

      // Update local state
      setVisitors(prev => prev.filter(visitor => visitor.id !== visitorId))
    } catch (error) {
      console.error('Error removing visitor:', error)
      alert('Failed to remove member. Please try again.')
    } finally {
      setRemovingVisitor(null)
    }
  }

  const isOwner = trip.userId === currentUser?.uid
  const isVisitor = trip.visitors?.includes(currentUser?.uid)

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
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiUsers className="h-6 w-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">
              {isOwner ? 'Trip Members' : 'Members'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600/50 text-xl font-bold text-gray-300 transition-all duration-200 hover:bg-gray-600/70 hover:text-white"
          >
            ×
          </button>
        </div>

        {/* Current Visitors */}
        <div className="mb-6">
          <h4 className="mb-3 text-lg font-semibold text-blue-400">
            Current Members ({visitors.length + 1}) {/* +1 for owner */}
          </h4>
          {loading ? (
            <div className="text-center text-gray-300">Loading members...</div>
          ) : (
            <div className="space-y-2">
              {/* Show owner first */}
              <div className="rounded-lg bg-white/5 p-3 backdrop-blur-sm border-l-4 border-blue-400">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Trip Owner</div>
                    <div className="text-sm text-gray-400">Creator of this trip</div>
                  </div>
                  <div className="text-xs text-blue-400 bg-blue-600/20 px-2 py-1 rounded">
                    Owner
                  </div>
                </div>
              </div>
              
              {/* Show visitors */}
              {visitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className="rounded-lg bg-white/5 p-3 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-white">{visitor.name}</div>
                      <div className="text-sm text-gray-400">{visitor.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-green-400 bg-green-600/20 px-2 py-1 rounded">
                        Member
                      </div>
                      {/* Remove button - only for owner */}
                      {isOwner && (
                        <button
                          onClick={() => handleRemoveVisitor(visitor.id)}
                          disabled={removingVisitor === visitor.id}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600/80 text-white text-xs transition-colors hover:bg-red-700/80 disabled:opacity-50"
                          title="Remove member"
                        >
                          {removingVisitor === visitor.id ? '...' : '×'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {visitors.length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  No other members have joined yet
                </div>
              )}
            </div>
          )}
        </div>

        {/* Invite More Section - Only for owner */}
        {isOwner && (
          <div className="mb-6">
            <h4 className="mb-3 text-lg font-semibold text-blue-400">
              Invite More People
            </h4>
            <div className="rounded-lg border border-blue-400/30 bg-white/5 p-4">
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
                    <>
                      <FiCheck className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy className="h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visitor note */}
        {isVisitor && !isOwner && (
          <div className="mb-4 rounded-lg bg-blue-600/10 border border-blue-400/30 p-3">
            <p className="text-sm text-blue-300">
              You are a member of this trip. Only the trip owner can manage invitations.
            </p>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-gray-600/60 px-4 py-3 font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-gray-600/80"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default ManageVisitorsModal
