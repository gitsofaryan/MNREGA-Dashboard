import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { formatNumber } from '../lib/utils'
import { useTranslation } from 'react-i18next'
import { Users, Briefcase, TrendingUp, Calendar } from 'lucide-react'

export function StatsCards({ stats }) {
  const { t } = useTranslation()

  const cards = [
    {
      title: t('totalJobCards'),
      value: stats.totalJobCards,
      icon: Briefcase,
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'from-blue-500 to-indigo-600'
    },
    {
      title: t('totalWorkers'),
      value: stats.totalWorkers,
      icon: Users,
      gradient: 'from-purple-500 via-purple-600 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      iconBg: 'from-purple-500 to-pink-600'
    },
    {
      title: t('activeWorkers'),
      value: stats.activeWorkers,
      icon: TrendingUp,
      gradient: 'from-green-500 via-green-600 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      iconBg: 'from-green-500 to-emerald-600'
    },
    {
      title: t('monthYear'),
      value: stats.monthYear,
      icon: Calendar,
      gradient: 'from-orange-500 via-orange-600 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      iconBg: 'from-orange-500 to-red-600',
      isText: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card 
            key={index} 
            className={`bg-gradient-to-br ${card.bgGradient} border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative group`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.iconBg} opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`}></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm md:text-base font-semibold text-gray-700 uppercase tracking-wide">
                {card.title}
              </CardTitle>
              <div className={`bg-gradient-to-br ${card.iconBg} p-2 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                {card.isText ? card.value : formatNumber(card.value)}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
