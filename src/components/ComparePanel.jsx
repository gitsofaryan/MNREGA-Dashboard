import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Select } from './ui/select'
import { formatNumber } from '../lib/utils'
import { useMGNREGAData } from '../hooks/useMGNREGAData'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Trophy, Crown } from 'lucide-react'

export function ComparePanel({ stateName, districts, selectedYear }) {
  const { t } = useTranslation()
  const [a, setA] = useState('')
  const [b, setB] = useState('')

  // Current year April data
  const { data: currentData } = useMGNREGAData(stateName, selectedYear === 'all' ? null : selectedYear)

  const findDistrictRecord = (records, name) => {
    if (!records || !name) return null
    return records.find(r => r.district_name === name) || null
  }

  const metrics = [
    { key: 'Total_No_of_JobCards_issued', label: t('jobCards'), emoji: '📋', color: '#3b82f6' },
    { key: 'Total_No_of_Workers', label: t('workers'), emoji: '👥', color: '#10b981' },
    { key: 'Total_No_of_Active_Workers', label: t('activeWorkers'), emoji: '💼', color: '#f59e0b' },
    { key: 'Number_of_Completed_Works', label: t('completedWorksShort'), emoji: '✅', color: '#8b5cf6' },
    { key: 'Total_Exp', label: t('expenditureLakh'), emoji: '💰', color: '#ef4444', decimal: true },
  ]

  const recA = findDistrictRecord(currentData, a)
  const recB = findDistrictRecord(currentData, b)

  // Prepare comparison data for charts
  const comparisonData = useMemo(() => {
    if (!recA || !recB) return []
    
    return metrics.map(m => ({
      metric: m.emoji + ' ' + m.label,
      [a]: parseFloat(recA[m.key] || 0),
      [b]: parseFloat(recB[m.key] || 0),
      color: m.color
    }))
  }, [recA, recB, a, b, metrics])

  // Prepare radar chart data (normalized to 0-100 scale)
  const radarData = useMemo(() => {
    if (!recA || !recB) return []
    
    return metrics.map(m => {
      const valA = parseFloat(recA[m.key] || 0)
      const valB = parseFloat(recB[m.key] || 0)
      const max = Math.max(valA, valB) || 1
      
      return {
        metric: m.emoji + ' ' + m.label,
        [a]: (valA / max) * 100,
        [b]: (valB / max) * 100,
      }
    })
  }, [recA, recB, a, b, metrics])

  // Calculate winner for each metric
  const winners = useMemo(() => {
    if (!recA || !recB) return {}
    
    const result = {}
    metrics.forEach(m => {
      const valA = parseFloat(recA[m.key] || 0)
      const valB = parseFloat(recB[m.key] || 0)
      result[m.key] = valA > valB ? a : valB > valA ? b : 'tie'
    })
    return result
  }, [recA, recB, a, b, metrics])

  // Overall winner (most wins)
  const overallWinner = useMemo(() => {
    if (!recA || !recB) return null
    
    let aWins = 0
    let bWins = 0
    Object.values(winners).forEach(w => {
      if (w === a) aWins++
      if (w === b) bWins++
    })
    
    return aWins > bWins ? a : bWins > aWins ? b : 'tie'
  }, [winners, a, b])

  return (
    <div className="space-y-6 p-4">
      {/* Selection Card */}
      <Card className="border-2 border-bharat-saffron/30 shadow-xl bg-gradient-to-r from-white to-orange-50">
        <CardHeader>
          <CardTitle className="text-3xl hindi-text flex items-center gap-3">
            <span className="text-4xl">⚖️</span>
            {t('compareDistricts')}
          </CardTitle>
          <p className="text-sm text-gray-600 hindi-text mt-2">
            Compare two districts side-by-side and see which one performs better
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium hindi-text flex items-center gap-2">
                <span className="text-xl">🅰️</span>
                {t('districtA')}
              </label>
              <Select 
                value={a} 
                onChange={e => setA(e.target.value)}
                className="border-2 border-blue-400 hover:border-blue-600 text-lg p-1"
              >
                <option value="">{t('selectDistrict')}</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium hindi-text flex items-center gap-2">
                <span className="text-xl">🅱️</span>
                {t('districtB')}
              </label>
              <Select 
                value={b} 
                onChange={e => setB(e.target.value)}
                className="border-2 border-orange-400 hover:border-orange-600 text-lg p-1"
              >
                <option value="">{t('selectDistrict')}</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {(recA && recB) && (
        <>
          {/* Overall Winner Banner */}
          {overallWinner && overallWinner !== 'tie' && (
            <Card className="border-4 border-yellow-400 shadow-2xl bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardContent className="py-6 text-center">
                <div className="flex items-center justify-center gap-4">
                  <Crown className="w-12 h-12 text-yellow-600 animate-bounce" />
                  <div>
                    <p className="text-sm text-gray-600 hindi-text">Overall Winner</p>
                    <p className="text-4xl font-bold text-yellow-700 hindi-text">{overallWinner}</p>
                  </div>
                  <Trophy className="w-12 h-12 text-yellow-600 animate-bounce" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Side-by-Side Metric Cards with Winners */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map(m => {
              const valA = parseFloat(recA[m.key] || 0)
              const valB = parseFloat(recB[m.key] || 0)
              const winner = winners[m.key]
              
              return (
                <Card 
                  key={m.key} 
                  className="border-2 shadow-lg"
                  style={{ borderColor: m.color }}
                >
                  <CardContent className="pt-6 pb-4">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">{m.emoji}</div>
                      <p className="text-sm font-medium text-gray-600 hindi-text">{m.label}</p>
                    </div>
                    
                    <div className="space-y-3">
                      {/* District A */}
                      <div className={`p-3 rounded-lg border-2 ${winner === a ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium hindi-text">🅰️ {a}</span>
                          {winner === a && <Trophy className="w-4 h-4 text-green-600" />}
                        </div>
                        <p className="text-2xl font-bold mt-1" style={{ color: m.color }}>
                          {m.decimal ? valA.toFixed(2) : formatNumber(Math.round(valA))}
                        </p>
                      </div>
                      
                      {/* District B */}
                      <div className={`p-3 rounded-lg border-2 ${winner === b ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium hindi-text">🅱️ {b}</span>
                          {winner === b && <Trophy className="w-4 h-4 text-green-600" />}
                        </div>
                        <p className="text-2xl font-bold mt-1" style={{ color: m.color }}>
                          {m.decimal ? valB.toFixed(2) : formatNumber(Math.round(valB))}
                        </p>
                      </div>
                      
                      {/* Difference */}
                      <div className="text-center text-xs text-gray-500">
                        {winner === 'tie' ? '🤝 Equal' : `📊 Difference: ${Math.abs(valA - valB).toLocaleString('en-IN')}`}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart Comparison */}
            <Card className="border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="hindi-text flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Side-by-Side Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="metric" 
                      tick={{ fontSize: 11 }}
                      angle={-15}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey={a} fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey={b} fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Radar Chart - Performance Comparison */}
            <Card className="border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="hindi-text flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Performance Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis 
                      dataKey="metric" 
                      tick={{ fontSize: 11 }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar 
                      name={a} 
                      dataKey={a} 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6} 
                      strokeWidth={2}
                    />
                    <Radar 
                      name={b} 
                      dataKey={b} 
                      stroke="#f59e0b" 
                      fill="#f59e0b" 
                      fillOpacity={0.6} 
                      strokeWidth={2}
                    />
                    <Legend />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Winner Summary Table */}
          <Card className="border-2 shadow-xl">
            <CardHeader>
              <CardTitle className="hindi-text flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                Winner Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left p-3 hindi-text">Metric</th>
                      <th className="text-center p-3 hindi-text">🅰️ {a}</th>
                      <th className="text-center p-3 hindi-text">🅱️ {b}</th>
                      <th className="text-center p-3 hindi-text">Winner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map(m => {
                      const valA = parseFloat(recA[m.key] || 0)
                      const valB = parseFloat(recB[m.key] || 0)
                      const winner = winners[m.key]
                      
                      return (
                        <tr key={m.key} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <span className="text-2xl mr-2">{m.emoji}</span>
                            <span className="hindi-text">{m.label}</span>
                          </td>
                          <td className={`text-center p-3 font-bold ${winner === a ? 'text-green-600' : 'text-gray-600'}`}>
                            {m.decimal ? valA.toFixed(2) : formatNumber(Math.round(valA))}
                          </td>
                          <td className={`text-center p-3 font-bold ${winner === b ? 'text-green-600' : 'text-gray-600'}`}>
                            {m.decimal ? valB.toFixed(2) : formatNumber(Math.round(valB))}
                          </td>
                          <td className="text-center p-3">
                            {winner === 'tie' ? (
                              <span className="text-gray-500">🤝 Tie</span>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-600" />
                                <span className="font-bold text-green-600">{winner}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {(!a || !b) && (
        <Card className="border-2 border-gray-200 shadow-xl">
          <CardContent className="py-20 text-center">
            <div className="space-y-4">
              <p className="text-6xl">⚖️</p>
              <p className="text-2xl text-gray-500 hindi-text font-medium">
                Select two districts to compare
              </p>
              <p className="text-sm text-gray-400 hindi-text">
                Choose District A and District B from the dropdowns above
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
