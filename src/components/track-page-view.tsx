'use client'

import { useEffect } from 'react'

export function TrackPageView({ pagina }: { pagina: string }) {
  useEffect(() => {
    try {
      let sid = localStorage.getItem('_recebi_sid')
      if (!sid) {
        sid = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
        localStorage.setItem('_recebi_sid', sid)
      }
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagina, sessionId: sid }),
      }).catch(() => {})
    } catch {
      // localStorage pode não estar disponível (SSR guard)
    }
  }, [pagina])

  return null
}
