'use client'

import * as React from 'react'

interface ToastState {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'destructive'
  open: boolean
}

type ToastAction =
  | { type: 'ADD'; toast: Omit<ToastState, 'id' | 'open'> }
  | { type: 'DISMISS'; id: string }
  | { type: 'REMOVE'; id: string }

let count = 0
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
let listeners: Array<(state: ToastState[]) => void> = []
let memoryState: ToastState[] = []

function dispatch(action: ToastAction) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((l) => l(memoryState))
}

function reducer(state: ToastState[], action: ToastAction): ToastState[] {
  switch (action.type) {
    case 'ADD':
      return [...state, { ...action.toast, id: String(count++), open: true }]
    case 'DISMISS':
      return state.map((t) => (t.id === action.id ? { ...t, open: false } : t))
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id)
  }
}

export function toast(props: Omit<ToastState, 'id' | 'open'>) {
  dispatch({ type: 'ADD', toast: props })
  const id = String(count - 1)
  const timeout = setTimeout(() => {
    dispatch({ type: 'DISMISS', id })
    setTimeout(() => dispatch({ type: 'REMOVE', id }), 300)
  }, 4000)
  toastTimeouts.set(id, timeout)
}

export function useToast() {
  const [state, setState] = React.useState<ToastState[]>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      listeners = listeners.filter((l) => l !== setState)
    }
  }, [])

  return {
    toasts: state,
    toast,
    dismiss: (id: string) => dispatch({ type: 'DISMISS', id }),
  }
}
