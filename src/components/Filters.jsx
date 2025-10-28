import React from 'react'
import { Select } from './ui/select'
import { Button } from './ui/button'
import { useTranslation } from 'react-i18next'
import { MapPin, RefreshCw } from 'lucide-react'

export function Filters({
  states,
  districts,
  selectedState,
  selectedDistrict,
  onStateChange,
  onDistrictChange,
  onDetectLocation,
  onRefresh,
  isDetectingLocation,
  isRefreshing,
}) {
  const { t } = useTranslation()

  return (
    <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-2xl shadow-xl p-4 md:p-6 space-y-4 border-2 border-bharat-orange/30 hover:shadow-2xl transition-shadow">
      <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-bharat-orange to-bharat-saffron rounded-lg shadow-md">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <span className="bg-gradient-to-r from-bharat-saffron to-bharat-orange bg-clip-text text-transparent">
          {t('filters')}
        </span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* State Selector */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            {t('selectState')}
          </label>
          <Select
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            className="w-full border-2 hover:border-bharat-orange/50 transition-colors bg-white shadow-sm h-11 rounded-lg"
          >
            <option value="">{t('selectState')}</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </Select>
        </div>

        {/* District Selector */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            {t('selectDistrict')}
          </label>
          <Select
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="w-full border-2 hover:border-bharat-green/50 transition-colors bg-white shadow-sm h-11 rounded-lg"
            disabled={!selectedState}
          >
            <option value="">{t('selectDistrict')}</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </Select>
        </div>

        {/* Detect Location Button */}
        <div className="flex items-end">
          <Button
            onClick={onDetectLocation}
            disabled={isDetectingLocation}
            className="w-full h-11 bg-gradient-to-r from-bharat-green to-green-600 hover:from-bharat-green/90 hover:to-green-600/90 shadow-md transition-all"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {isDetectingLocation ? t('loading') : t('detectLocation')}
          </Button>
        </div>

        {/* Refresh Button */}
        <div className="flex items-end">
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-full h-11 bg-gradient-to-r from-bharat-orange to-red-600 hover:from-bharat-orange/90 hover:to-red-600/90 shadow-md transition-all"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </Button>
        </div>
      </div>
    </div>
  )
}
