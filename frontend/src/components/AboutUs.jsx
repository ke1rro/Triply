import React from 'react'

const AboutUs = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white/70 p-8 shadow-lg backdrop-blur-lg">
        <h2 className="mb-6 text-2xl font-bold text-indigo-900">About Us</h2>

        <div className="space-y-6">
          <div className="rounded-xl bg-indigo-50/80 p-4 backdrop-blur-sm">
            <h3 className="mb-2 text-lg font-semibold text-indigo-800">
              What We Do
            </h3>
            <p className="text-gray-700">
              We're revolutionizing travel planning with AI. Our digital travel
              assistant helps you create perfect itineraries, find hidden gems,
              and manage your travel budget - all in one place.
            </p>
          </div>

          <div className="rounded-xl bg-indigo-50/80 p-4 backdrop-blur-sm">
            <h3 className="mb-2 text-lg font-semibold text-indigo-800">
              Our AI Assistant
            </h3>
            <p className="text-gray-700">
              Unlike traditional travel agencies, our AI travel agent is
              available 24/7, learns your preferences, and provides personalized
              recommendations based on your travel style and budget.
            </p>
          </div>

          <div className="rounded-xl bg-indigo-50/80 p-4 backdrop-blur-sm">
            <h3 className="mb-2 text-lg font-semibold text-indigo-800">
              Key Features
            </h3>
            <ul className="list-inside list-disc space-y-1 text-gray-700">
              <li>Automatic trip planning</li>
              <li>Budget calculations</li>
              <li>Interactive AI chat assistance</li>
              <li>Group travel coordination</li>
              <li>Personalized itineraries</li>
            </ul>
          </div>

          <div className="rounded-xl bg-indigo-50/80 p-4 backdrop-blur-sm">
            <h3 className="mb-2 text-lg font-semibold text-indigo-800">
              Our Vision
            </h3>
            <p className="text-gray-700">
              We believe travel should be stress-free and accessible to
              everyone. Our mission is to empower travelers with intelligent
              tools that make planning and experiencing trips more enjoyable.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUs
