'use client'

import { useEffect, useState } from 'react'

const RADIUS = 27 // px, 0.70 of previous size

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', updateCursor)
    return () => window.removeEventListener('mousemove', updateCursor)
  }, [])

  // White, soft, and gradual fade
  const gradient = `radial-gradient(circle, rgba(255,255,255,0.35) 25%, rgba(255,255,255,0.18) 55%, rgba(255,255,255,0.08) 80%, rgba(255,255,255,0) 100%)`

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x - RADIUS,
        top: position.y - RADIUS,
        width: RADIUS * 2,
        height: RADIUS * 2,
        pointerEvents: 'none',
        zIndex: 9999,
        borderRadius: '50%',
        background: gradient,
        mixBlendMode: 'screen',
      }}
    />
  )
} 