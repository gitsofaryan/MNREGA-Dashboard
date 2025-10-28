import React from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../lib/utils'

export function NavBar({ activeTab = 'overview', onTabChange }) {
  const { t } = useTranslation()
  
  const tabs = [
      { key: 'overview', label: t('overview') },
      { key: 'simulator', label: t('simulator') },
    { key: 'leaderboard', label: t('leaderboard') },
    { key: 'compare', label: t('compare') },
  ]

  return (
    <nav className="bg-white/90 backdrop-blur border-b sticky top-[72px] z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange && onTabChange(tab.key)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-semibold border-2 transition-all hindi-text',
                activeTab === tab.key
                  ? 'bg-bharat-green text-white border-bharat-green'
                  : 'bg-white hover:bg-bharat-orange/10 border-gray-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
