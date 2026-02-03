'use client'

import * as React from 'react'

interface SidebarContextValue {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(true)

  const toggle = React.useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const open = React.useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  const value = React.useMemo(
    () => ({
      isOpen,
      toggle,
      open,
      close,
    }),
    [isOpen, toggle, open, close]
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}