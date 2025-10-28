import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { useTranslation } from 'react-i18next'
import { Map, X } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon in react-leaflet
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export function MapView({ location }) {
  const { t } = useTranslation()
  const [showMap, setShowMap] = useState(false)

  if (!location) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg md:text-xl">{t('yourLocation')}</CardTitle>
        <Button
          onClick={() => setShowMap(!showMap)}
          variant="outline"
          size="sm"
        >
          {showMap ? (
            <>
              <X className="w-4 h-4 mr-2" />
              {t('hideMap')}
            </>
          ) : (
            <>
              <Map className="w-4 h-4 mr-2" />
              {t('viewMap')}
            </>
          )}
        </Button>
      </CardHeader>
      
      {showMap && (
        <CardContent>
          <div className="rounded-lg overflow-hidden">
            <MapContainer
              center={[location.latitude, location.longitude]}
              zoom={10}
              style={{ height: '400px', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[location.latitude, location.longitude]}>
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold">{t('yourLocation')}</p>
                    <p className="text-sm">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
