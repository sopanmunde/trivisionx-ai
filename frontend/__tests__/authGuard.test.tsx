import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthGuard } from '../components/auth/AuthGuard'
import React from 'react'

const mockPush = vi.fn()
const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
}))

function createTestJwt(payload: Record<string, unknown>): string {
  const encode = (obj: Record<string, unknown>) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`
}

describe('AuthGuard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    document.cookie = "auth_token=; path=/; max-age=0"
    document.cookie = "is_demo=; path=/; max-age=0"
    window.history.pushState({}, '', '/dashboard')
  })

  it('should redirect to /login if user is not authenticated', async () => {
    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Page Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login')
    })
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('should reject malformed or expired tokens and redirect to /login', async () => {
    const expiredJwt = createTestJwt({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) - 60 })
    localStorage.setItem('token', expiredJwt)

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Page Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login')
    })
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('should render children if user has valid JWT in localStorage', async () => {
    const validJwt = createTestJwt({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 })
    localStorage.setItem('token', validJwt)

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Page Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('should render children if user has valid auth_token cookie', async () => {
    const validJwt = createTestJwt({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 })
    document.cookie = `auth_token=${validJwt}; path=/`

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Page Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('should allow demo guest access strictly on /demo route', async () => {
    window.history.pushState({}, '', '/demo')

    render(
      <AuthGuard>
        <div data-testid="demo-content">Demo Page Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(screen.getByTestId('demo-content')).toBeInTheDocument()
    })
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
