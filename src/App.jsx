import React, { Suspense } from 'react'
import Dashboard from './pages/Dashboard'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { WifiOff } from 'lucide-react'

function App() {
  const isOnline = useOnlineStatus()

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse-slow text-2xl text-bharat-green">लोड हो रहा है...</div>
      </div>
    }>
      {!isOnline && (
        <div className="offline-indicator">
          <WifiOff className="w-5 h-5" />
          <span>ऑफ़लाइन मोड</span>
        </div>
      )}
      <Dashboard />
    </Suspense>
  )
}

export default App
