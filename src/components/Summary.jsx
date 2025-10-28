import React from 'react'
import { Card, CardContent } from './ui/card'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '../lib/utils'
import { Info } from 'lucide-react'

export function Summary({ selectedDistrict, stats }) {
  const { t } = useTranslation()

  if (!selectedDistrict) return null

  return (
    <Card className="bg-gradient-to-r from-bharat-green via-green-600 to-emerald-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
      <CardContent className="p-6 md:p-8 relative">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 backdrop-blur-sm p-3 md:p-4 rounded-2xl shadow-lg">
            <Info className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-bold mb-3 hindi-text">
              {t('insights')}
            </h3>
            <p className="text-base md:text-lg hindi-text leading-relaxed">
              {t('summary', {
                district: selectedDistrict,
                workers: formatNumber(stats.activeWorkers),
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
