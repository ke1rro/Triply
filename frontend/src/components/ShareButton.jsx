import React, { useState } from 'react'
import { FiShare2 } from 'react-icons/fi'

const ShareButton = ({ trip }) => {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}/tripview/${trip.id}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  return (
    <div className="relative">
      <div
        onClick={handleCopyLink}
        className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-all duration-200 hover:bg-white/20"
      >
        <FiShare2 className="h-5 w-5" />
      </div>

      {/* Success notification popup */}
      {copied && (
        <div className="absolute right-0 top-12 z-20 animate-fade-in-up">
          <div className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
            Copied
          </div>
        </div>
      )}
    </div>
  )
}

export default ShareButton