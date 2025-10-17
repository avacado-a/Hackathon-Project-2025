'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export interface GestureEvent {
  type: 'zoom' | 'rotate' | 'pan'
  delta?: number
  dx?: number
  dy?: number
}

export interface UseHandTrackingReturn {
  connected: boolean
  lastGesture: GestureEvent | null
  error: string | null
  reconnect: () => void
}

export function useHandTracking(
  onGesture?: (gesture: GestureEvent) => void
): UseHandTrackingReturn {
  const [connected, setConnected] = useState(false)
  const [lastGesture, setLastGesture] = useState<GestureEvent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)

  const connect = useCallback(() => {
    try {
      if (wsRef.current) {
        wsRef.current.close()
      }

      const ws = new WebSocket('ws://localhost:8765')
      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ Connected to hand tracking server')
        setConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const gesture = JSON.parse(event.data) as GestureEvent
          setLastGesture(gesture)
          
          if (onGesture) {
            onGesture(gesture)
          }
        } catch (err) {
          console.error('Failed to parse gesture data:', err)
        }
      }

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        setError('Connection error')
      }

      ws.onclose = () => {
        console.log('🔌 Disconnected from hand tracking server')
        setConnected(false)
        
        const maxAttempts = 10
        const baseDelay = 2000
        
        if (reconnectAttemptsRef.current < maxAttempts) {
          const delay = Math.min(baseDelay * Math.pow(2, reconnectAttemptsRef.current), 30000)
          reconnectAttemptsRef.current++
          
          console.log(`🔄 Reconnecting in ${delay / 1000}s... (attempt ${reconnectAttemptsRef.current}/${maxAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else {
          setError('Failed to connect. Please check if the Python server is running.')
        }
      }
    } catch (err) {
      console.error('Failed to create WebSocket:', err)
      setError('Failed to create connection')
    }
  }, [onGesture])

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0
    setError(null)
    connect()
  }, [connect])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  return {
    connected,
    lastGesture,
    error,
    reconnect,
  }
}
