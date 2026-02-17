import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

const TravelLoadingAnimation = ({ message = "Creating your perfect itinerary..." }) => {
  const loadingMessages = [
    "Analyzing destinations...",
    "Finding the best places...",
    "Optimizing your route...",
    "Personalizing recommendations..."
  ]
  
  const [currentMessage, setCurrentMessage] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full mx-4 text-center shadow-2xl">
        
        {/* Elegant spinner */}
        <div className="relative h-24 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-20 h-20 text-[#17A2B8] animate-spin" strokeWidth={1.5} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-[#17A2B8]/20 rounded-full"></div>
          </div>
        </div>

        {/* Professional text */}
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
          Crafting Your Itinerary
        </h3>
        <p className="text-gray-500 text-base mb-8 min-h-[24px] transition-opacity duration-300">
          {loadingMessages[currentMessage]}
        </p>

        {/* Minimal progress bar */}
        <div className="mb-6">
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#17A2B8] rounded-full animate-progress-smooth"></div>
          </div>
        </div>

        {/* Professional info */}
        <div className="pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Powered by AI • Real-time data from multiple sources
          </p>
        </div>
      </div>
    </div>
  )
}

export default TravelLoadingAnimation
