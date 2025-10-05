import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token') || null)
  const sessionWarningShown = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isDoctor = computed(() => user.value?.role === 'doctor')
  const isResearcher = computed(() => user.value?.role === 'researcher')
  const isAuditor = computed(() => user.value?.role === 'auditor')

  async function login(email, password) {
    try {
      const response = await api.post('/api/auth/login', {
        user: { email, password }
      })

      token.value = response.data.data.token
      localStorage.setItem('auth_token', response.data.data.token)

      await fetchCurrentUser()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.status?.message || 'Login failed'
      }
    }
  }

  async function signup(userData) {
    try {
      const response = await api.post('/api/auth/signup', {
        user: userData
      })

      token.value = response.data.data.token
      localStorage.setItem('auth_token', response.data.data.token)

      await fetchCurrentUser()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.status?.message || 'Signup failed'
      }
    }
  }

  async function logout() {
    try {
      await api.delete('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('auth_token')
    }
  }

  async function fetchCurrentUser() {
    try {
      const response = await api.get('/api/users/me')
      user.value = response.data.data.user
      return true
    } catch (error) {
      console.error('Failed to fetch user:', error)
      logout()
      return false
    }
  }

  function showSessionWarning() {
    sessionWarningShown.value = true
  }

  function hideSessionWarning() {
    sessionWarningShown.value = false
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isDoctor,
    isResearcher,
    isAuditor,
    sessionWarningShown,
    login,
    signup,
    logout,
    fetchCurrentUser,
    showSessionWarning,
    hideSessionWarning
  }
})
