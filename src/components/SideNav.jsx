import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../lib/utils'
import { Menu, X, Gauge, GitCompare, FlaskConical, Trophy } from 'lucide-react'

export function SideNav({ activeTab = 'overview', onTabChange }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const Item = ({ tab, icon: Icon, label }) => (
    <button
      onClick={() => { onTabChange && onTabChange(tab); setOpen(false); }}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium border-2 transition-all hindi-text',
        activeTab === tab
          ? 'bg-bharat-green text-white border-bharat-green'
          : 'bg-white hover:bg-bharat-orange/10 border-gray-200'
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  )

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 bottom-6 z-50 px-4 py-3 rounded-full bg-bharat-green text-white shadow-xl hover:scale-105 transition"
        aria-label="Open side navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-80 bg-white border-r-4 border-bharat-saffron shadow-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold hindi-text">{t('quickActions')}</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <Item tab="overview" icon={Gauge} label={t('overview')} />
            <Item tab="leaderboard" icon={Trophy} label={t('leaderboard')} />
            <Item tab="compare" icon={GitCompare} label={t('compareDistricts')} />
            <Item tab="simulator" icon={FlaskConical} label={t('simulator')} />

            <div className="text-xs text-gray-500 mt-auto hindi-text">
              {t('tipCompare')}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
