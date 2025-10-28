import React from 'react'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../lib/utils'
import { Clock } from 'lucide-react'

export function LastUpdated({ timestamp }) {
  const { t } = useTranslation()

  if (!timestamp) return null

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-white rounded-lg shadow-sm px-4 py-2">
      <Clock className="w-4 h-4" />
      <span>
        {t('lastUpdated')}: <span className="font-semibold">{formatDate(timestamp)}</span>
      </span>
    </div>
  )
}
