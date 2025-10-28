import React from 'react'
import { Select } from './ui/select'
import { useTranslation } from 'react-i18next'
import { Calendar } from 'lucide-react'

export function YearSelector({ selectedYear, onYearChange, availableYears }) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Calendar className="w-4 h-4 text-bharat-saffron" />
        {t('selectYear')}
      </label>
      <Select 
        value={selectedYear} 
        onChange={(e) => onYearChange(e.target.value)}
        className="h-11 border-2 hover:border-bharat-saffron/50 transition-colors bg-white shadow-sm"
      >
        <option value="all">{t('allYears')}</option>
        {availableYears.map(year => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </Select>
    </div>
  )
}
