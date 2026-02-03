'use client'

import * as React from 'react'
import { useSidebar } from './sidebar-provider'
import { 
  LayoutDashboard, 
  Brain, 
  Wrench, 
  Settings, 
  Package,
  ChevronLeft,
  ChevronRight,
  Home,
  Terminal
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Skills',
    href: '/skills',
    icon: Brain,
  },
  {
    title: 'Tools',
    href: '/tools',
    icon: Wrench,
  },
  {
    title: 'Packages',
    href: '/packages',
    icon: Package,
  },
  {
    title: 'Terminal',
    href: '/terminal',
    icon: Terminal,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function AppSidebar() {
  const { isOpen, toggle } = useSidebar()
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'relative hidden h-screen flex-col border-r bg-sidebar transition-all duration-300 md:flex',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex items-center gap-2 font-semibold">
          <Home className="h-5 w-5" />
          {isOpen && (
            <span className="text-sm">DevTools Dashboard</span>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start gap-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {isOpen && <span>{item.title}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto border-t p-4">
        <button
          onClick={toggle}
          className="flex w-full items-center justify-center rounded-md p-2 text-sm hover:bg-sidebar-accent"
        >
          {isOpen ? (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-2">Collapse</span>
            </>
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  )
}