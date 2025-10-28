import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import { Languages, Globe } from 'lucide-react'

export function Header() {
  const { t, i18n } = useTranslation()
  const [showGoogleTranslate, setShowGoogleTranslate] = useState(false)

  const toggleLanguage = () => {
    const newLang = i18n.language === 'hi' ? 'en' : 'hi'
    i18n.changeLanguage(newLang)
  }

  const toggleGoogleTranslate = () => {
    setShowGoogleTranslate(!showGoogleTranslate)
    if (window.toggleGoogleTranslate) {
      window.toggleGoogleTranslate()
    }
  }

  return (
    <header className="bg-white shadow-lg border-b-4 border-bharat-saffron sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-bharat-saffron via-bharat-orange to-bharat-green rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-bharat-saffron via-bharat-orange to-bharat-green bg-clip-text text-transparent">
                {t('appTitle')}
              </h1>
              <p className="text-sm md:text-base text-gray-600 font-medium mt-0.5">
                {t('subtitle')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleLanguage}
              variant="outline"
              className="hover:bg-bharat-orange/10 hover:border-bharat-orange transition-all shadow-sm border-2"
            >
              <Languages className="w-4 h-4 mr-2" />
              <span className="font-semibold">{i18n.language === 'hi' ? 'English' : 'हिंदी'}</span>
            </Button>
            
            <Button
              onClick={toggleGoogleTranslate}
              variant={showGoogleTranslate ? "default" : "outline"}
              className={showGoogleTranslate ? "bg-bharat-green hover:bg-bharat-green/90 transition-all shadow-sm" : "hover:bg-blue-50 hover:border-blue-500 transition-all shadow-sm border-2"}
              title={t('googleTranslate')}
            >
              <Globe className="w-4 h-4 mr-2" />
              <span className="font-semibold hidden md:inline">{t('googleTranslate')}</span>
              <span className="font-semibold md:hidden">🌍</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
