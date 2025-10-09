import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

vi.mock('@/services/api')

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('starts with no user', () => {
      const store = useAuthStore()
      expect(store.user).toBeNull()
    })

    it('starts with no token', () => {
      const store = useAuthStore()
      expect(store.token).toBeNull()
    })

    it('is not authenticated initially', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('role computed properties', () => {
    it('isAdmin returns true for admin users', () => {
      const store = useAuthStore()
      store.user = { role: 'admin' }
      expect(store.isAdmin).toBe(true)
    })

    it('isDoctor returns true for doctor users', () => {
      const store = useAuthStore()
      store.user = { role: 'doctor' }
      expect(store.isDoctor).toBe(true)
    })

    it('isResearcher returns true for researcher users', () => {
      const store = useAuthStore()
      store.user = { role: 'researcher' }
      expect(store.isResearcher).toBe(true)
    })

    it('isAuditor returns true for auditor users', () => {
      const store = useAuthStore()
      store.user = { role: 'auditor' }
      expect(store.isAuditor).toBe(true)
    })
  })

  describe('login', () => {
    it('successfully logs in and stores token', async () => {
      const store = useAuthStore()
      const mockResponse = {
        data: {
          data: {
            token: 'test-token',
            user: { id: 1, email: 'test@example.com', role: 'doctor' }
          }
        }
      }

      api.post.mockResolvedValue(mockResponse)
      api.get.mockResolvedValue({
        data: { data: { user: mockResponse.data.data.user } }
      })

      const result = await store.login('test@example.com', 'password')

      expect(result.success).toBe(true)
      expect(store.token).toBe('test-token')
      expect(localStorage.getItem('auth_token')).toBe('test-token')
    })

    it('handles login failure', async () => {
      const store = useAuthStore()
      api.post.mockRejectedValue({
        response: {
          data: { status: { message: 'Invalid credentials' } }
        }
      })

      const result = await store.login('test@example.com', 'wrong')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
      expect(store.token).toBeNull()
    })
  })

  describe('signup', () => {
    it('successfully signs up and stores token', async () => {
      const store = useAuthStore()
      const mockResponse = {
        data: {
          data: {
            token: 'test-token',
            user: { id: 1, email: 'new@example.com', role: 'doctor' }
          }
        }
      }

      api.post.mockResolvedValue(mockResponse)
      api.get.mockResolvedValue({
        data: { data: { user: mockResponse.data.data.user } }
      })

      const userData = {
        email: 'new@example.com',
        password: 'Password123!',
        first_name: 'John',
        last_name: 'Doe',
        role: 'doctor'
      }

      const result = await store.signup(userData)

      expect(result.success).toBe(true)
      expect(store.token).toBe('test-token')
    })

    it('handles signup failure', async () => {
      const store = useAuthStore()
      api.post.mockRejectedValue({
        response: {
          data: { status: { message: 'Email already taken' } }
        }
      })

      const result = await store.signup({})

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email already taken')
    })
  })

  describe('logout', () => {
    it('clears user data and token', async () => {
      const store = useAuthStore()
      store.user = { id: 1, email: 'test@example.com' }
      store.token = 'test-token'
      localStorage.setItem('auth_token', 'test-token')

      api.delete.mockResolvedValue({})

      await store.logout()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(localStorage.getItem('auth_token')).toBeNull()
    })

    it('clears data even if API call fails', async () => {
      const store = useAuthStore()
      store.user = { id: 1 }
      store.token = 'test-token'

      api.delete.mockRejectedValue(new Error('Network error'))

      await store.logout()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
    })
  })

  describe('session warning', () => {
    it('shows session warning', () => {
      const store = useAuthStore()
      store.showSessionWarning()
      expect(store.sessionWarningShown).toBe(true)
    })

    it('hides session warning', () => {
      const store = useAuthStore()
      store.sessionWarningShown = true
      store.hideSessionWarning()
      expect(store.sessionWarningShown).toBe(false)
    })
  })
})
