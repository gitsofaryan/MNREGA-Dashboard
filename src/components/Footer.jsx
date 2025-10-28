import React from 'react'
import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-gradient-to-r from-bharat-green to-bharat-blue text-white mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center space-y-2">
          <p className="text-base md:text-lg font-semibold hindi-text">
            {t('builtBy')}
          </p>
          <p className="text-xs md:text-sm opacity-80">
            {t('dataSource')}
          </p>
          <p className="text-xs opacity-70">
            © 2025 MGNREGA Dashboard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
