import { SimulationInput, SimulationResult, SimulationState, PlayerDecision } from './types'

// Constants (tunable; later move to JSON config)
const BASE_TARGET_YIELD: Record<string, number> = {
  wheat: 4.5,
  rice: 5.2,
  maize: 6.0
}

const SOIL_MOISTURE_BASE: Record<string, number> = {
  clay: 35,
  loam: 28,
  sandy: 18
}

interface DerivedFactors {
  irrigationEffect: number
  fertilizerEffect: number
  stressPenalty: number
}

function aggregateDecisions(decisions: PlayerDecision[], week: number) {
  const w = decisions.filter(d => d.week === week)
  return {
    irrigation: w.filter(d => d.type === 'irrigation').reduce((a, b) => a + b.value, 0),
    fertilizer: w.filter(d => d.type === 'fertilizer').reduce((a, b) => a + b.value, 0),
    pest: w.filter(d => d.type === 'pest').reduce((a, b) => a + b.value, 0)
  }
}

function computeDerived({ crop, soil, mode, week, decisions }: SimulationInput): DerivedFactors {
  const { irrigation, fertilizer } = aggregateDecisions(decisions, week)

  // Simple heuristic models
  const irrigationEffect = Math.min(irrigation / 100, 1) // saturates
  const fertilizerEffect = Math.min(fertilizer / 50, 1)

  let stressPenalty = 0
  if (mode === 'drought') stressPenalty += 0.25 * (1 - irrigationEffect)
  if (mode === 'monsoon') stressPenalty += 0.15 * fertilizerEffect // leaching risk
  if (week < 2) stressPenalty *= 0.5 // early weeks less sensitive

  return { irrigationEffect, fertilizerEffect, stressPenalty }
}

function nextState(input: SimulationInput): SimulationState {
  const prev = input.previous
  const baseYield = BASE_TARGET_YIELD[input.crop]
  const baseSoil = prev ? prev.soilMoisture : SOIL_MOISTURE_BASE[input.soil]
  const { irrigationEffect, fertilizerEffect, stressPenalty } = computeDerived(input)

  // Moisture dynamics (very simplified)
  const moistureGain = irrigationEffect * 8
  const evapLoss = 5 - fertilizerEffect // assume fertilizer improves canopy retention slightly
  const soilMoisture = Math.max(5, Math.min(60, baseSoil + moistureGain - evapLoss))

  // Yield progression (incremental growth fraction)
  const growthFactor = (irrigationEffect * 0.4 + fertilizerEffect * 0.4 + 0.2) * (1 - stressPenalty)
  const accumulatedYield = prev ? prev.yield + growthFactor * (baseYield / 10) : growthFactor * (baseYield / 8)

  // Nitrogen leaching simplistic model
  const nitrogenLeached = (prev?.nitrogenLeached || 0) + (fertilizerEffect * 0.4 + (input.mode === 'monsoon' ? 0.3 : 0.1))

  // Evapotranspiration gap (placeholder)
  const etGap = Math.max(0, 30 - soilMoisture)

  // Costs (simplified)
  const { irrigation, fertilizer } = aggregateDecisions(input.decisions, input.week)
  const irrigationCost = irrigation * 0.05
  const fertilizerCost = fertilizer * 0.4
  const totalCost = (prev?.costs.total || 0) + irrigationCost + fertilizerCost

  // Score heuristic
  const efficiency = accumulatedYield / (totalCost / 50 + 1)
  let score = efficiency * 10 - nitrogenLeached * 0.5 - etGap * 0.1
  score = Math.max(0, Math.round(score))

  return {
    week: input.week,
    yield: parseFloat(accumulatedYield.toFixed(2)),
    targetYield: baseYield,
    soilMoisture: parseFloat(soilMoisture.toFixed(1)),
    nitrogenLeached: parseFloat(nitrogenLeached.toFixed(2)),
    etGap: parseFloat(etGap.toFixed(1)),
    costs: {
      irrigation: parseFloat(irrigationCost.toFixed(2)),
      fertilizer: parseFloat(fertilizerCost.toFixed(2)),
      total: parseFloat(totalCost.toFixed(2))
    },
    score,
    notes: []
  }
}

export function runSimulationStep(input: SimulationInput): SimulationResult {
  const state = nextState(input)
  const deltas: Partial<SimulationState> = {}
  if (input.previous) {
    deltas.yield = parseFloat((state.yield - input.previous.yield).toFixed(2))
    deltas.soilMoisture = parseFloat((state.soilMoisture - input.previous.soilMoisture).toFixed(1))
  }
  return { state, deltas }
}
