import React, { useState, useCallback, useRef, useEffect } from 'react'
import maplibregl, { Map as MapLibreMap } from 'maplibre-gl'
import DeckGL from '@deck.gl/react'
import { TileLayer } from '@deck.gl/geo-layers'
import { BitmapLayer } from '@deck.gl/layers'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Layers, Eye, EyeOff, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LayerConfig {
  id: string
  name: string
  type: 'nasa' | 'base'
  url?: string
  visible: boolean
  color: string
  description: string
  opacity: number
}

interface AgricultureMapProps {
  onLocationSelect?: (lat: number, lng: number) => void
  selectedLocation?: { lat: number; lng: number }
  nasaLayers?: string[]
}

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 20,
  zoom: 2,
  minZoom: 1,
  maxZoom: 15,
  pitch: 0,
  bearing: 0
}

// NASA GIBS layer configurations
const NASA_LAYERS: LayerConfig[] = [
  {
    id: 'modis_ndvi',
    name: 'MODIS NDVI',
    type: 'nasa',
    url: 'https://map1.vis.earthdata.nasa.gov/wmts-geo/1.0.0/MODIS_Terra_NDVI_8Day/default/{time}/EPSG4326_250m/{z}/{y}/{x}.png',
    visible: false,
    color: 'hsl(var(--primary))',
    description: 'Vegetation health and crop vigor',
    opacity: 0.7
  },
  {
    id: 'smap_moisture',
    name: 'SMAP Soil Moisture',
    type: 'nasa',
    url: 'https://map1.vis.earthdata.nasa.gov/wmts-geo/1.0.0/SMAP_L3_Passive_Soil_Moisture_Option3_RootZone/default/{time}/EPSG4326_25km/{z}/{y}/{x}.png',
    visible: false,
    color: 'hsl(var(--accent))',
    description: 'Root-zone soil moisture levels',
    opacity: 0.7
  },
  {
    id: 'gpm_precipitation',
    name: 'GPM Precipitation',
    type: 'nasa',
    url: 'https://map1.vis.earthdata.nasa.gov/wmts-geo/1.0.0/GPM_3IMERGHH_06_precipitation/default/{time}/EPSG4326_0.1deg/{z}/{y}/{x}.png',
    visible: false,
    color: 'hsl(var(--secondary))',
    description: 'Real-time precipitation data',
    opacity: 0.8
  },
  {
    id: 'ecostress_et',
    name: 'ECOSTRESS ET',
    type: 'nasa',
    url: 'https://map1.vis.earthdata.nasa.gov/wmts-geo/1.0.0/ECOSTRESS_L2_LSTE_PT_JPL/default/{time}/EPSG4326_70m/{z}/{y}/{x}.png',
    visible: false,
    color: 'hsl(var(--muted))',
    description: 'Evapotranspiration and water stress',
    opacity: 0.6
  }
]

export const AgricultureMap: React.FC<AgricultureMapProps> = ({
  onLocationSelect,
  selectedLocation,
  nasaLayers = []
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const [layers, setLayers] = useState<LayerConfig[]>(NASA_LAYERS)
  const [showLegend, setShowLegend] = useState(true)
  const [hoverInfo, setHoverInfo] = useState<{ coordinate?: [number, number]; object?: unknown } | null>(null)
  
  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prev => 
      prev.map(layer => 
        layer.id === layerId 
          ? { ...layer, visible: !layer.visible }
          : layer
      )
    )
  }, [])

  const updateLayerOpacity = useCallback((layerId: string, opacity: number) => {
    setLayers(prev => 
      prev.map(layer => 
        layer.id === layerId 
          ? { ...layer, opacity }
          : layer
      )
    )
  }, [])

  type PickingInfo = { coordinate?: number[]; object?: unknown; [key: string]: unknown }
  const handleMapClick = useCallback((pickingInfo: PickingInfo) => {
    if (!onLocationSelect) return
    const coord = pickingInfo?.coordinate as [number, number] | undefined
    if (coord) {
      const [lng, lat] = coord
      onLocationSelect(lat, lng)
    }
  }, [onLocationSelect])

  // Generate today's date for NASA GIBS layers
  const today = new Date().toISOString().split('T')[0]

  const deckLayers = layers
    .filter(layer => layer.visible && layer.type === 'nasa')
    .map(layer => 
      new TileLayer({
        id: layer.id,
        data: layer.url?.replace('{time}', today),
        minZoom: 1,
        maxZoom: 10,
        opacity: layer.opacity,
        renderSubLayers: (props) => {
          const rawBBox = props.tile.bbox as unknown
          let bounds: [number, number, number, number]
          if (Array.isArray(rawBBox)) {
            const arr = rawBBox as number[]
            bounds = [arr[0], arr[1], arr[2], arr[3]]
          } else if (rawBBox && typeof rawBBox === 'object') {
            const b = rawBBox as {
              west?: number; south?: number; east?: number; north?: number
              left?: number; bottom?: number; right?: number; top?: number
            }
            if (b.west !== undefined && b.south !== undefined && b.east !== undefined && b.north !== undefined) {
              bounds = [b.west, b.south, b.east, b.north]
            } else {
              // fallback for non-geo bounding boxes
              bounds = [b.left ?? -180, b.bottom ?? -85, b.right ?? 180, b.top ?? 85]
            }
          } else {
            bounds = [-180, -85, 180, 85]
          }

          const idx = props.tile.index as unknown as { x?: number; y?: number; z?: number }
          const idSuffix = [idx?.z, idx?.x, idx?.y].filter(v => v !== undefined).join('-')

          return new BitmapLayer({
            id: `${layer.id}-bmp-${idSuffix}`,
            image: props.data,
            bounds
          })
        },
        onHover: (info: PickingInfo) => {
          const c = info.coordinate
          const tuple = Array.isArray(c) && c.length >= 2 ? ([c[0], c[1]] as [number, number]) : undefined
          setHoverInfo({ coordinate: tuple, object: info.object })
        }
      })
    )

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return
    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
      zoom: INITIAL_VIEW_STATE.zoom,
      pitch: INITIAL_VIEW_STATE.pitch,
      bearing: INITIAL_VIEW_STATE.bearing,
      attributionControl: false
    })
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-muted/10 rounded-lg overflow-hidden">
      <DeckGL
  initialViewState={INITIAL_VIEW_STATE as unknown as Record<string, unknown>}
        controller={true}
        layers={deckLayers}
  onClick={(info: PickingInfo) => handleMapClick(info)}
  getTooltip={(info: PickingInfo) => 
          info?.object && info?.coordinate
            ? {
                html: `<div class="bg-background/95 backdrop-blur-sm p-2 rounded shadow-lg border">
                         <strong>Coordinates:</strong><br/>
                         Lat: ${info.coordinate?.[1]?.toFixed(4)}<br/>
                         Lng: ${info.coordinate?.[0]?.toFixed(4)}
                       </div>`
              }
            : null
        }
      >
        <div ref={mapContainerRef} className="absolute inset-0" />
      </DeckGL>

      {/* Layer Controls */}
      <Card className="absolute top-4 right-4 w-80 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4" />
              NASA Data Layers
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLegend(!showLegend)}
            >
              {showLegend ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {showLegend && (
          <CardContent className="space-y-4">
            {layers.filter(l => l.type === 'nasa').map((layer) => (
              <div key={layer.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={layer.visible}
                      onCheckedChange={() => toggleLayer(layer.id)}
                      id={layer.id}
                    />
                    <Label 
                      htmlFor={layer.id}
                      className={cn(
                        "text-sm font-medium cursor-pointer",
                        layer.visible ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {layer.name}
                    </Label>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                    style={{ backgroundColor: layer.color + '20', color: layer.color }}
                  >
                    NASA
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  {layer.description}
                </p>
                {layer.visible && (
                  <div className="flex items-center gap-2 pl-6">
                    <Label className="text-xs text-muted-foreground">Opacity:</Label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={layer.opacity}
                      onChange={(e) => updateLayerOpacity(layer.id, parseFloat(e.target.value))}
                      className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-muted-foreground min-w-[3ch]">
                      {Math.round(layer.opacity * 100)}%
                    </span>
                  </div>
                )}
                <Separator className="my-2" />
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Selected Location Indicator */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4">
          <Card className="bg-background/95 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <Info className="h-4 w-4 text-primary" />
                <span className="font-medium">Selected Location:</span>
                <span className="text-muted-foreground">
                  {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}