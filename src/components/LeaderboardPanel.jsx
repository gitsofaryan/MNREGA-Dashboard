import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { formatNumber } from '../lib/utils'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'

export function LeaderboardPanel({ data }) {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState('jobCards')

  const categories = [
    { key: 'jobCards', label: t('mostJobCards'), field: 'Total_No_of_JobCards_issued', icon: Trophy },
    { key: 'activeWorkers', label: t('mostActiveWorkers'), field: 'Total_No_of_Active_Workers', icon: Medal },
    { key: 'completedWorks', label: t('mostCompletedWorks'), field: 'Number_of_Completed_Works', icon: Award },
    { key: 'expenditure', label: t('highestExpenditure'), field: 'Total_Exp', icon: TrendingUp, decimal: true },
    { key: 'paymentEfficiency', label: t('bestPaymentEfficiency'), field: 'percentage_payments_gererated_within_15_days', icon: Award, isPercentage: true },
  ]

  const leaderboardData = useMemo(() => {
    if (!data || data.length === 0) return []

    const category = categories.find(c => c.key === activeCategory)
    if (!category) return []

    // Group by district and get latest record
    const districtMap = {}
    data.forEach(record => {
      const district = record.district_name
      if (!district) return
      
      if (!districtMap[district] || districtMap[district].month < record.month) {
        districtMap[district] = record
      }
    })

    // Sort by the active category field
    const sorted = Object.entries(districtMap)
      .map(([district, record]) => ({
        district,
        value: parseFloat(record[category.field] || 0),
        record
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10

    return sorted
  }, [data, activeCategory])

  const activecat = categories.find(c => c.key === activeCategory)

  return (
    <div className="space-y-4">
      <Card className="border-2 border-bharat-saffron/30 shadow-xl bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3 hindi-text">
            <Trophy className="w-8 h-8 text-yellow-500" />
            {t('topPerformers')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 hindi-text">{t('bestDistricts')}</p>
        </CardContent>
      </Card>

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 rounded-lg font-semibold border-2 transition-all flex items-center gap-2 hindi-text ${
              activeCategory === cat.key
                ? 'bg-yellow-500 text-white border-yellow-500'
                : 'bg-white hover:bg-yellow-50 border-gray-200'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <Card className="border-2 shadow-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-bold hindi-text">{t('rank')}</th>
                  <th className="px-4 py-3 text-left font-bold hindi-text">{t('district')}</th>
                  <th className="px-4 py-3 text-right font-bold hindi-text">{activecat?.label}</th>
                  <th className="px-4 py-3 text-center font-bold">{t('viewDetails')}</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((item, index) => {
                  const Icon = index === 0 ? Trophy : index === 1 ? Medal : index === 2 ? Award : null
                  const bgColor = index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : index === 2 ? 'bg-orange-100' : 'bg-white'
                  
                  return (
                    <tr key={item.district} className={`${bgColor} border-b hover:bg-yellow-50 transition-colors`}>
                      <td className="px-4 py-4 font-bold text-lg flex items-center gap-2">
                        {Icon && <Icon className={`w-5 h-5 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-500' : 'text-orange-500'}`} />}
                        <span className={index < 3 ? 'text-2xl' : ''}>{index + 1}</span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-800 hindi-text">{item.district}</td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-xl font-bold text-bharat-green">
                          {activecat?.decimal 
                            ? item.value.toFixed(2) 
                            : activecat?.isPercentage 
                              ? item.value.toFixed(1) + '%' 
                              : formatNumber(Math.round(item.value))}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button className="px-3 py-1 bg-bharat-green text-white rounded-lg hover:bg-bharat-green/90 transition-all text-sm font-medium">
                          {t('viewDetails')}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {leaderboardData.length === 0 && (
            <div className="text-center py-16 text-gray-500 hindi-text">
              {t('noData')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
