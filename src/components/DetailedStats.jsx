import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '../lib/utils'
import { TrendingUp, Users, Briefcase, IndianRupee, Building2, CheckCircle } from 'lucide-react'

export function DetailedStats({ data }) {
  const { t } = useTranslation()

  if (!data || data.length === 0) return null

  // Calculate detailed statistics
  const stats = data.reduce((acc, item) => ({
    totalHouseholdsWorked: acc.totalHouseholdsWorked + (parseInt(item.Total_Households_Worked) || 0),
    totalIndividualsWorked: acc.totalIndividualsWorked + (parseInt(item.Total_Individuals_Worked) || 0),
    completedWorks: acc.completedWorks + (parseInt(item.Number_of_Completed_Works) || 0),
    ongoingWorks: acc.ongoingWorks + (parseInt(item.Number_of_Ongoing_Works) || 0),
    totalExpenditure: acc.totalExpenditure + (parseFloat(item.Total_Exp) || 0),
    totalWages: acc.totalWages + (parseFloat(item.Wages) || 0),
    womenPersondays: acc.womenPersondays + (parseInt(item.Women_Persondays) || 0),
    scWorkers: acc.scWorkers + (parseInt(item.SC_workers_against_active_workers) || 0),
    stWorkers: acc.stWorkers + (parseInt(item.ST_workers_against_active_workers) || 0),
    averageWageRate: acc.averageWageRate + (parseFloat(item.Average_Wage_rate_per_day_per_person) || 0),
    differentlyAbled: acc.differentlyAbled + (parseInt(item.Differently_abled_persons_worked) || 0),
  }), {
    totalHouseholdsWorked: 0,
    totalIndividualsWorked: 0,
    completedWorks: 0,
    ongoingWorks: 0,
    totalExpenditure: 0,
    totalWages: 0,
    womenPersondays: 0,
    scWorkers: 0,
    stWorkers: 0,
    averageWageRate: 0,
    differentlyAbled: 0,
  })

  // Calculate average wage rate
  stats.averageWageRate = (stats.averageWageRate / data.length).toFixed(2)

  const detailedCards = [
    {
      title: 'परिवार कार्यरत',
      titleEn: 'Households Worked',
      value: stats.totalHouseholdsWorked,
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'व्यक्ति कार्यरत',
      titleEn: 'Individuals Worked',
      value: stats.totalIndividualsWorked,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'पूर्ण कार्य',
      titleEn: 'Completed Works',
      value: stats.completedWorks,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'चल रहे कार्य',
      titleEn: 'Ongoing Works',
      value: stats.ongoingWorks,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'कुल व्यय (लाख ₹)',
      titleEn: 'Total Expenditure (Lakhs ₹)',
      value: stats.totalExpenditure.toFixed(2),
      icon: IndianRupee,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'औसत दैनिक मजदूरी (₹)',
      titleEn: 'Avg. Daily Wage (₹)',
      value: stats.averageWageRate,
      icon: Briefcase,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {detailedCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">
                  <div className="hindi-text">{card.title}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{card.titleEn}</div>
                </CardTitle>
                <div className={`${card.bgColor} p-2 rounded-full`}>
                  <Icon className={`h-4 w-4 md:h-5 md:w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold">
                  {formatNumber(card.value)}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Inclusion Stats */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl hindi-text">समावेशी विकास</CardTitle>
          <p className="text-sm text-gray-600">Inclusive Development</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">{formatNumber(stats.womenPersondays)}</div>
              <div className="text-sm text-gray-600 mt-1 hindi-text">महिला व्यक्ति-दिवस</div>
              <div className="text-xs text-gray-500">Women Person-days</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{formatNumber(stats.scWorkers)}</div>
              <div className="text-sm text-gray-600 mt-1 hindi-text">अनुसूचित जाति कर्मचारी</div>
              <div className="text-xs text-gray-500">SC Workers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{formatNumber(stats.stWorkers)}</div>
              <div className="text-sm text-gray-600 mt-1 hindi-text">अनुसूचित जनजाति कर्मचारी</div>
              <div className="text-xs text-gray-500">ST Workers</div>
            </div>
          </div>
          {stats.differentlyAbled > 0 && (
            <div className="text-center mt-4 pt-4 border-t">
              <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.differentlyAbled)}</div>
              <div className="text-sm text-gray-600 mt-1 hindi-text">दिव्यांग व्यक्ति कार्यरत</div>
              <div className="text-xs text-gray-500">Differently Abled Persons Worked</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
