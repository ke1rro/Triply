import React from 'react'

const PageHeader = ({ title }) => {
  return (
    <div className="flex-shrink-0 px-4 pb-4 pt-6 backdrop-blur-sm">
      {/* Logo */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-black text-blue-400 drop-shadow-2xl">
          Triply
        </h1>
        <div className="mx-auto mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-blue-400 to-teal-400"></div>
      </div>

      {/* Page Title */}
      {title && (
        <div className="text-center">
          <p className="text-xl font-bold text-white drop-shadow-md">{title}</p>
        </div>
      )}
    </div>
  )
}

export default PageHeader
