import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AuthPage from '../app/login/page'
import React from 'react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn((key) => {
      if (key === 'code') return null
      return null
    }),
  }),
}))

vi.mock('framer-motion', () => {
  const motionComp = (Tag: keyof React.JSX.IntrinsicElements) => {
    const Component = ({ children, ...props }: React.ComponentPropsWithoutRef<typeof Tag>) => {
      const { initial, animate, exit, transition, whileHover, ...cleanProps } = props as Record<string, unknown>
      return React.createElement(Tag, cleanProps, children)
    }
    Component.displayName = `motion.${Tag}`
    return Component
  }
  return {
    motion: {
      div: motionComp('div'),
      button: motionComp('button'),
      p: motionComp('p'),
      path: motionComp('path'),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  }
})

vi.mock('@/components/TriVisionXLogo', () => ({
  TriVisionXLogo: () => <div data-testid="trivisionx-logo">Logo</div>,
}))

describe('Login Page', () => {
  it('should render Google and GitHub OAuth sign-in buttons', () => {
    render(<AuthPage />)

    expect(screen.getByText(/sign in to trivisionx/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue with github/i })).toBeInTheDocument()
  })

  it('should disable OAuth buttons while initiating Google sign-in and surface API errors', async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve({
        ok: false,
        json: () => Promise.resolve({ detail: 'OAuth provider disabled' }),
      }), 50))
    )
    vi.stubGlobal('fetch', mockFetch)

    render(<AuthPage />)

    const googleBtn = screen.getByRole('button', { name: /continue with google/i })
    const githubBtn = screen.getByRole('button', { name: /continue with github/i })

    fireEvent.click(googleBtn)

    expect(googleBtn).toBeDisabled()
    expect(githubBtn).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByText(/oauth provider disabled/i)).toBeInTheDocument()
    })
    expect(googleBtn).not.toBeDisabled()

    vi.unstubAllGlobals()
  })

  it('should request /auth/github/login when clicking Continue with GitHub', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ detail: 'GitHub OAuth not configured' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    render(<AuthPage />)

    const githubBtn = screen.getByRole('button', { name: /continue with github/i })
    fireEvent.click(githubBtn)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/auth/github/login'))
    })

    vi.unstubAllGlobals()
  })
})
