import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMGNREGAData } from '../hooks/useMGNREGAData'
import { useGeolocation } from '../hooks/useGeolocation'
import {
  extractStates,
  extractDistricts,
  filterData,
  calculateStats,
  generateFinancialYears,
} from '../lib/utils'

import { Header } from '../components/Header'
import { NavBar } from '../components/NavBar'
import { SideNav } from '../components/SideNav'
import { ComparePanel } from '../components/ComparePanel'
import { SimulatorPanel } from '../components/SimulatorPanel'
import { LeaderboardPanel } from '../components/LeaderboardPanel'
import { Footer } from '../components/Footer'
import { Filters } from '../components/Filters'
import { YearSelector } from '../components/YearSelector'
import { StatsCards } from '../components/StatsCards'
import { Charts } from '../components/Charts'
import { MapView } from '../components/MapView'
import { Summary } from '../components/Summary'
import { LastUpdated } from '../components/LastUpdated'
import { DistrictDetails } from '../components/DistrictDetails'
import { DistrictDataTable } from '../components/DistrictDataTable'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { Loader2 } from 'lucide-react'

function Dashboard() {
  const { t } = useTranslation()
  
  const [selectedState, setSelectedState] = useState('MADHYA PRADESH')
  const [selectedYear, setSelectedYear] = useState('2025-2026') // Default to current year
  const [activeTab, setActiveTab] = useState('overview')
  
  // Fetch data with state and year filters
  const yearFilter = selectedYear === 'all' ? null : selectedYear
  const { data, loading, error, lastUpdated, refetch } = useMGNREGAData(selectedState, yearFilter)
  
  const { location, loading: locationLoading, detectLocation } = useGeolocation()

  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [states, setStates] = useState([])
  const [years, setYears] = useState([])
  const [districts, setDistricts] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [stats, setStats] = useState({
    totalJobCards: 0,
    totalWorkers: 0,
    activeWorkers: 0,
    monthYear: '-',
  })

  // Extract states when data loads, and build a stable financial years list
  useEffect(() => {
    if (data) {
      const extractedStates = extractStates(data)
      setStates(extractedStates)
    }
    // Build years independent of filtered data so dropdown always shows full list
    const fyList = generateFinancialYears(2014)
    setYears(fyList)
  }, [data])

  // Extract districts when state changes
  useEffect(() => {
    if (data && selectedState) {
      const extractedDistricts = extractDistricts(data, selectedState)
      setDistricts(extractedDistricts)
      setSelectedDistrict('') // Reset district when state changes
    } else {
      setDistricts([])
      setSelectedDistrict('')
    }
  }, [data, selectedState])

  // Update filtered data and stats when filters change
  useEffect(() => {
    if (data) {
      const filtered = filterData(data, selectedState, selectedDistrict)
      setFilteredData(filtered)
      
      const calculatedStats = calculateStats(filtered)
      setStats(calculatedStats)
    }
  }, [data, selectedState, selectedDistrict])

  const handleStateChange = (state) => {
    setSelectedState(state)
  }

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district)
  }

  const handleDetectLocation = () => {
    detectLocation()
  }

  // Auto-select district when location is detected
  useEffect(() => {
    if (location && location.district && districts.length > 0) {
      const detectedDistrict = location.district.toUpperCase().trim()
      const detectedState = location.state ? location.state.toUpperCase().trim() : null
      
      console.log(`🔍 Trying to match district: "${detectedDistrict}"`)
      console.log(`� Detected state: "${detectedState}"`)
      console.log(`�📋 Available districts:`, districts)
      console.log(`📋 Current state:`, selectedState)
      
      // First, check if we need to change the state
      if (detectedState && selectedState) {
        const currentState = selectedState.toUpperCase().trim()
        if (!currentState.includes(detectedState) && !detectedState.includes(currentState)) {
          // Try to find matching state in states list
          const matchingState = states.find(s => {
            const stateUpper = s.toUpperCase().trim()
            return stateUpper === detectedState || 
                   stateUpper.includes(detectedState) ||
                   detectedState.includes(stateUpper)
          })
          
          if (matchingState) {
            console.log(`🔄 Changing state to: ${matchingState}`)
            setSelectedState(matchingState)
            return // Wait for districts to reload with new state
          }
        }
      }
      
      // Check if the detected district exists in the current districts list
      const matchingDistrict = districts.find(d => {
        const districtUpper = d.toUpperCase().trim()
        return (
          districtUpper === detectedDistrict || 
          districtUpper.includes(detectedDistrict) ||
          detectedDistrict.includes(districtUpper) ||
          // Remove common suffixes and try again
          districtUpper.replace(' DISTRICT', '') === detectedDistrict.replace(' DISTRICT', '') ||
          districtUpper.replace('DISTRICT', '').trim() === detectedDistrict.replace('DISTRICT', '').trim()
        )
      })
      
      if (matchingDistrict) {
        console.log(`✅ Auto-selecting detected district: ${matchingDistrict}`)
        setSelectedDistrict(matchingDistrict)
      } else {
        console.log(`⚠️ District "${location.district}" not found in current state's districts`)
        console.log(`💡 Available districts in ${selectedState}:`, districts.slice(0, 5), '...')
      }
    }
  }, [location, districts, states, selectedState])

  const handleRefresh = () => {
    refetch()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50/50 via-white to-green-50/50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
          <LoadingSkeleton />
        </main>
        <Footer />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 p-6">
            <p className="text-xl text-red-600">{t('error')}</p>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-6 py-2 bg-bharat-green text-white rounded-lg hover:bg-bharat-green/90"
            >
              {t('retry')}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50/50 via-white to-green-50/50">
      <Header />
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
      <SideNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Last Updated */}
        {lastUpdated && <LastUpdated timestamp={lastUpdated} />}

        {/* Filters & Year Selector - Only show in Overview tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Filters
                states={states}
                districts={districts}
                selectedState={selectedState}
                selectedDistrict={selectedDistrict}
                onStateChange={handleStateChange}
                onDistrictChange={handleDistrictChange}
                onDetectLocation={handleDetectLocation}
                onRefresh={handleRefresh}
                isDetectingLocation={locationLoading}
                isRefreshing={loading}
              />
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border-2 border-bharat-saffron/30">
              <YearSelector
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                availableYears={years}
              />
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <>
            {/* Summary */}
            {selectedDistrict && <Summary selectedDistrict={selectedDistrict} stats={stats} />}

            {/* District Cards - April only */}
            {selectedDistrict && filteredData.length > 0 && (
              <DistrictDataTable data={filteredData} districtName={selectedDistrict} />
            )}

            {/* Stats Cards - Show when viewing all districts */}
            {!selectedDistrict && <StatsCards stats={stats} />}

            {/* Charts */}
            {filteredData.length > 0 && <Charts data={filteredData} stats={stats} />}

            {/* Map */}
            {location && <MapView location={location} />}

            {/* No Data Message */}
            {filteredData.length === 0 && (
              <div className="text-center py-16 px-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-2xl mx-auto border-2 border-bharat-orange/20">
                  <p className="text-2xl md:text-3xl font-bold text-gray-700 hindi-text mb-3">{t('noData')}</p>
                  <p className="text-lg text-gray-500">{t('selectState')} और {t('selectDistrict')}</p>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardPanel data={data} />
        )}

        {activeTab === 'compare' && (
          <ComparePanel
            stateName={selectedState}
            districts={districts}
            selectedYear={selectedYear}
          />
        )}

        {activeTab === 'simulator' && (
          <SimulatorPanel
            districts={districts}
            baseRecords={data}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Dashboard
