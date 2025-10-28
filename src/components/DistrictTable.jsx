import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '../lib/utils'
import { Table, ChevronDown, ChevronUp } from 'lucide-react'

export function DistrictTable({ data }) {
  const { t } = useTranslation()
  const [sortColumn, setSortColumn] = useState('workers')
  const [sortDirection, setSortDirection] = useState('desc')

  // Aggregate data by district
  const districtData = useMemo(() => {
    const districtMap = {}
    
    data.forEach(item => {
      const district = item.district_name
      if (!district) return
      
      if (!districtMap[district]) {
        districtMap[district] = {
          name: district,
          workers: 0,
          jobCards: 0,
          activeWorkers: 0,
          households: 0,
          completedWorks: 0,
          ongoingWorks: 0,
        }
      }
      
      districtMap[district].workers += parseInt(item.Total_No_of_Workers) || 0
      districtMap[district].jobCards += parseInt(item.Total_No_of_JobCards_issued) || 0
      districtMap[district].activeWorkers += parseInt(item.Total_No_of_Active_Workers) || 0
      districtMap[district].households += parseInt(item.Total_Households_Worked) || 0
      districtMap[district].completedWorks += parseInt(item.Number_of_Completed_Works) || 0
      districtMap[district].ongoingWorks += parseInt(item.Number_of_Ongoing_Works) || 0
    })
    
    return Object.values(districtMap)
  }, [data])

  // Sort data
  const sortedData = useMemo(() => {
    return [...districtData].sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }, [districtData, sortColumn, sortDirection])

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return null
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 inline ml-1" /> : 
      <ChevronDown className="w-4 h-4 inline ml-1" />
  }

  return (
    <Card className="shadow-xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
            <Table className="w-5 h-5 text-white" />
          </div>
          {t('districtWiseData', 'जिलेवार डेटा')} ({districtData.length} {t('districts', 'जिले')})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th 
                  className="text-left p-3 font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  {t('district', 'जिला')} <SortIcon column="name" />
                </th>
                <th 
                  className="text-right p-3 font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('jobCards')}
                >
                  {t('totalJobCards', 'कुल जॉब कार्ड')} <SortIcon column="jobCards" />
                </th>
                <th 
                  className="text-right p-3 font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('workers')}
                >
                  {t('totalWorkers', 'कुल मजदूर')} <SortIcon column="workers" />
                </th>
                <th 
                  className="text-right p-3 font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('activeWorkers')}
                >
                  {t('activeWorkers', 'सक्रिय मजदूर')} <SortIcon column="activeWorkers" />
                </th>
                <th 
                  className="text-right p-3 font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('households')}
                >
                  {t('households', 'परिवार')} <SortIcon column="households" />
                </th>
                <th 
                  className="text-right p-3 font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('completedWorks')}
                >
                  {t('completedWorks', 'पूर्ण कार्य')} <SortIcon column="completedWorks" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((district, index) => (
                <tr 
                  key={district.name} 
                  className={`border-b hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="p-3 font-medium text-gray-900">{district.name}</td>
                  <td className="p-3 text-right text-gray-700">{formatNumber(district.jobCards)}</td>
                  <td className="p-3 text-right text-gray-700 font-semibold">{formatNumber(district.workers)}</td>
                  <td className="p-3 text-right text-green-700 font-semibold">{formatNumber(district.activeWorkers)}</td>
                  <td className="p-3 text-right text-gray-700">{formatNumber(district.households)}</td>
                  <td className="p-3 text-right text-blue-700">{formatNumber(district.completedWorks)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
