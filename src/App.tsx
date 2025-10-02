import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-cool flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            Supremo AC Services
          </h1>
          <p className="text-neutral-600 text-lg">
            Digital Platform - HVAC Services in Ghana
          </p>
        </div>

        {/* Main Card */}
        <div className="card">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-neutral-800 mb-2">
              Welcome to Our Platform
            </h2>
            <p className="text-neutral-600">
              Tailwind CSS is configured with our HVAC-themed color scheme.
            </p>
          </div>

          {/* Counter Demo */}
          <div className="space-y-4">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="btn-primary w-full"
            >
              Click count: {count}
            </button>

            {/* Color Palette Demo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-neutral-200">
              <div className="text-center">
                <div className="h-16 bg-primary-500 rounded-md mb-2"></div>
                <span className="text-xs text-neutral-600">Primary</span>
              </div>
              <div className="text-center">
                <div className="h-16 bg-accent-500 rounded-md mb-2"></div>
                <span className="text-xs text-neutral-600">Accent</span>
              </div>
              <div className="text-center">
                <div className="h-16 bg-success rounded-md mb-2"></div>
                <span className="text-xs text-neutral-600">Success</span>
              </div>
              <div className="text-center">
                <div className="h-16 bg-warning rounded-md mb-2"></div>
                <span className="text-xs text-neutral-600">Warning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-6 text-center">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-success/10 text-success border border-success/20">
            ✓ Tailwind CSS Configured
          </span>
        </div>
      </div>
    </div>
  )
}

export default App
