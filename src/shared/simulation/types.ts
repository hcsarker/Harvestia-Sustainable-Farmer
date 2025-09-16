// Core domain types for simulation logic (shared by web + mobile)

export type CropType = 'wheat' | 'rice' | 'maize'
export type SoilType = 'clay' | 'loam' | 'sandy'
export type ScenarioMode = 'sandbox' | 'drought' | 'monsoon'

export interface SimulationInput {
  mode: ScenarioMode
  crop: CropType
  soil: SoilType
  week: number
  location: { lat: number; lng: number } | null
  decisions: PlayerDecision[]
  previous?: SimulationState
}

export interface PlayerDecision {
  type: 'irrigation' | 'fertilizer' | 'pest' | 'rest'
  value: number // generic scalar (liters, kg, intensity units)
  week: number
}

export interface SimulationState {
  week: number
  yield: number
  targetYield: number
  soilMoisture: number
  nitrogenLeached: number
  etGap: number
  costs: { irrigation: number; fertilizer: number; total: number }
  score: number
  notes: string[]
}

export interface SimulationResult {
  state: SimulationState
  deltas: Partial<SimulationState>
}
