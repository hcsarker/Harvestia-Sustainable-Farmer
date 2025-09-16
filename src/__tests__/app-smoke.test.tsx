import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import App from '@/App'

// Simple smoke test: mounts App without crashing

describe('App', () => {
  it('mounts without crashing', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })
})
