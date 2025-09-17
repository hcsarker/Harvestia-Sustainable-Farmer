import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'

export const DataSources: React.FC = () => {
  const items = [
    {
      title: 'NASA POWER (Agroclimatology)',
      desc: 'Daily surface meteorology for agriculture: temperature, humidity, wind, solar. Used for WeatherNow and charts.',
      href: 'https://power.larc.nasa.gov/'
    },
    {
      title: 'NASA GIBS WMTS',
      desc: 'Global imagery tiles: MODIS NDVI, SMAP Soil Moisture, GPM precipitation, ECOSTRESS land surface temperature.',
      href: 'https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/global-imagery-browse-services-gibs'
    },
    {
      title: 'SMAP (Soil Moisture Active Passive)',
      desc: 'Topsoil moisture from L-band radiometry. Currently shown as a summary card; tile sampling planned.',
      href: 'https://smap.jpl.nasa.gov/'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Sources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((it) => (
          <div key={it.title} className="p-3 rounded-md border">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{it.title}</div>
                <div className="text-sm text-muted-foreground">{it.desc}</div>
              </div>
              <a className="ml-3 inline-flex items-center text-primary hover:underline" href={it.href} target="_blank" rel="noreferrer noopener">
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default DataSources
