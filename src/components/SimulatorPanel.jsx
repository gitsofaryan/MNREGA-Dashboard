import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Select } from './ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, Briefcase, CheckCircle2, IndianRupee, TrendingUp } from 'lucide-react'

export function SimulatorPanel({ districts, baseRecords }) {
  const { t } = useTranslation()
  const [district, setDistrict] = useState('')

  const districtData = useMemo(() => {
    if (!district || !baseRecords) return null
    return baseRecords.find(r => r.district_name === district) || null
  }, [district, baseRecords])

  // Prepare visual data for charts
  const metrics = useMemo(() => {
    if (!districtData) return []
    
    return [
      {
        key: 'jobCards',
        label: t('jobCards'),
        value: parseInt(districtData.Total_No_of_JobCards_issued || 0),
        icon: Briefcase,
        color: '#3b82f6',
        emoji: '📋'
      },
      {
        key: 'workers',
        label: t('workers'),
        value: parseInt(districtData.Total_No_of_Workers || 0),
        icon: Users,
        color: '#10b981',
        emoji: '👥'
      },
      {
        key: 'activeWorkers',
        label: t('activeWorkers'),
        value: parseInt(districtData.Total_No_of_Active_Workers || 0),
        icon: Users,
        color: '#f59e0b',
        emoji: '💼'
      },
      {
        key: 'completedWorks',
        label: t('completedWorksShort'),
        value: parseInt(districtData.Number_of_Completed_Works || 0),
        icon: CheckCircle2,
        color: '#8b5cf6',
        emoji: '✅'
      },
      {
        key: 'expenditure',
        label: t('expenditureLakh'),
        value: parseFloat(districtData.Total_Exp || 0),
        icon: IndianRupee,
        color: '#ef4444',
        emoji: '💰',
        isDecimal: true
      }
    ]
  }, [districtData, t])

  // Bar chart data
  const barChartData = metrics.map(m => ({
    name: m.emoji + ' ' + m.label,
    value: m.value,
    fill: m.color
  }))

  // Pie chart data (for active vs inactive workers)
  const pieChartData = useMemo(() => {
    if (!districtData) return []
    
    const total = parseInt(districtData.Total_No_of_Workers || 0)
    const active = parseInt(districtData.Total_No_of_Active_Workers || 0)
    const inactive = total - active
    
    return [
      { name: '💼 ' + t('activeWorkers'), value: active, fill: '#10b981' },
      { name: '😴 Inactive', value: inactive > 0 ? inactive : 0, fill: '#e5e7eb' }
    ]
  }, [districtData, t])

  // Visual comparison bars for low-literacy users
  const VisualBar = ({ label, value, maxValue, color, emoji }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium flex items-center gap-2 hindi-text">
            <span className="text-2xl">{emoji}</span>
            {label}
          </span>
          <span className="text-lg font-bold" style={{ color }}>
            {value.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden shadow-inner">
          <div 
            className="h-full rounded-full flex items-center justify-end px-2 text-white text-xs font-bold transition-all duration-500"
            style={{ 
              width: `${Math.max(5, percentage)}%`,
              backgroundColor: color
            }}
          >
            {percentage > 15 && `${percentage.toFixed(0)}%`}
          </div>
        </div>
      </div>
    )
  }

  // Find max value for visual comparison
  const maxMetricValue = metrics.length > 0 ? Math.max(...metrics.filter(m => !m.isDecimal).map(m => m.value)) : 1

  return (
    <div className="space-y-6 p-4">
      {/* Header Card */}
      <Card className="border-2 border-bharat-saffron/30 shadow-xl bg-gradient-to-r from-white to-orange-50">
        <CardHeader>
          <CardTitle className="text-3xl hindi-text flex items-center gap-3">
            <span className="text-4xl">📊</span>
            {t('dataVisualizer') || 'Data Visualizer'}
          </CardTitle>
          <p className="text-sm text-gray-600 hindi-text mt-2">
            {t('visualizerDesc') || 'See your district MGNREGA data in simple, easy-to-understand visuals'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <label className="text-sm font-medium hindi-text flex items-center gap-2">
              <span className="text-xl">📍</span>
              {t('selectDistrict')}
            </label>
            <Select 
              value={district} 
              onChange={e => setDistrict(e.target.value)} 
              className="border-2 border-bharat-saffron/50 hover:border-bharat-saffron text-lg p-1"
            >
              <option value="">{t('chooseDistrict')}</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </Select>
          </div>
        </CardContent>
      </Card>

      {districtData && (
        <>
          {/* Big Number Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {metrics.map(metric => {
              const IconComponent = metric.icon
              return (
                <Card 
                  key={metric.key} 
                  className="border-2 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
                  style={{ borderColor: metric.color }}
                >
                  <CardContent className="pt-6 pb-4 text-center">
                    <div className="flex justify-center mb-3">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg"
                        style={{ backgroundColor: metric.color + '20' }}
                      >
                        {metric.emoji}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 hindi-text font-medium">
                      {metric.label}
                    </p>
                    <p 
                      className="text-2xl font-bold"
                      style={{ color: metric.color }}
                    >
                      {metric.isDecimal 
                        ? metric.value.toFixed(2)
                        : metric.value.toLocaleString('en-IN')
                      }
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Visual Progress Bars */}
          <Card className="border-2 shadow-xl">
            <CardHeader>
              <CardTitle className="hindi-text flex items-center gap-2">
                <span className="text-2xl">📊</span>
                {t('visualComparison') || 'Visual Comparison'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {metrics.filter(m => !m.isDecimal).map(metric => (
                  <VisualBar 
                    key={metric.key}
                    label={metric.label}
                    value={metric.value}
                    maxValue={maxMetricValue}
                    color={metric.color}
                    emoji={metric.emoji}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card className="border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="hindi-text flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  {t('metricsOverview') || 'Metrics Overview'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      angle={-15}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart - Worker Distribution */}
            <Card className="border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="hindi-text flex items-center gap-2">
                  <span className="text-2xl">👥</span>
                  {t('workerDistribution') || 'Worker Activity'}
                </CardTitle>
                <p className="text-sm text-gray-600 hindi-text">
                  {t('activeVsTotal') || 'Active vs Total Workers'}
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={110}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Summary Cards */}
          <Card className="border-2 border-green-500/50 shadow-xl bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <CardTitle className="hindi-text flex items-center gap-2 text-green-700">
                <TrendingUp className="w-6 h-6" />
                {t('quickSummary') || 'Quick Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg hindi-text">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow">
                  <span className="text-3xl">👥</span>
                  <div>
                    <p className="text-sm text-gray-600">{t('totalWorkers') || 'Total Workers'}</p>
                    <p className="text-2xl font-bold text-green-600">
                      {parseInt(districtData.Total_No_of_Workers || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow">
                  <span className="text-3xl">💼</span>
                  <div>
                    <p className="text-sm text-gray-600">{t('activeWorkers')}</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {parseInt(districtData.Total_No_of_Active_Workers || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow">
                  <span className="text-3xl">✅</span>
                  <div>
                    <p className="text-sm text-gray-600">{t('completedWorksShort')}</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {parseInt(districtData.Number_of_Completed_Works || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow">
                  <span className="text-3xl">💰</span>
                  <div>
                    <p className="text-sm text-gray-600">{t('expenditureLakh')}</p>
                    <p className="text-2xl font-bold text-red-600">
                      ₹{parseFloat(districtData.Total_Exp || 0).toFixed(2)} L
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!districtData && (
        <Card className="border-2 border-gray-200 shadow-xl">
          <CardContent className="py-20 text-center">
            <div className="space-y-4">
              <p className="text-6xl">📍</p>
              <p className="text-2xl text-gray-500 hindi-text font-medium">
                {t('selectDistrictToBegin')}
              </p>
              <p className="text-sm text-gray-400 hindi-text">
                {t('chooseDistrictAbove') || 'Choose a district from the dropdown above to see visual data'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
